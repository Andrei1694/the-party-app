package com.party.ceva.demo.service;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.regex.Pattern;

import com.party.ceva.demo.dto.UserDto;
import com.party.ceva.demo.dto.UserProfileDto;
import com.party.ceva.demo.model.Level;
import com.party.ceva.demo.model.User;
import com.party.ceva.demo.model.UserProfile;
import com.party.ceva.demo.repository.UserRepository;

import jakarta.transaction.Transactional;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.Caching;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class UserService {

	private static final Logger logger = LoggerFactory.getLogger(UserService.class);
	private static final Pattern CNP_PATTERN = Pattern.compile("^\\d{13}$");
	private static final int REFERRAL_XP_REWARD = 1000;

	private final UserRepository userRepository;
	private final PasswordEncoder passwordEncoder;
	private final CacheManager cacheManager;
	private final CodeGenerationService codeGenerationService;
	private final LevelingSystemService levelingSystemService;

	public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder, CacheManager cacheManager,
			CodeGenerationService codeGenerationService, LevelingSystemService levelingSystemService) {
		this.userRepository = userRepository;
		this.passwordEncoder = passwordEncoder;
		this.cacheManager = cacheManager;
		this.codeGenerationService = codeGenerationService;
		this.levelingSystemService = levelingSystemService;
	}

	public UserDto createUser(UserDto userDto) {
		logger.info("Creating user for email {}", maskEmail(userDto.getEmail()));
		User user = toEntity(userDto);
		user.setPassword(passwordEncoder.encode(userDto.getPassword()));
		
		// Initialize level for new user
		if (user.getLevel() == null) {
			user.setLevel(new Level());
		}
		
		User savedUser = userRepository.save(user);
		logger.info("Created user with id {}", savedUser.getId());
		cacheManager.getCache("usersById").evict(savedUser.getId());
		cacheManager.getCache("usersByEmail").evict(savedUser.getEmail());
		return toDto(savedUser);
	}

	public Page<UserDto> findAllUsers(Pageable pageable) {
		logger.debug("Fetching users page: page={}, size={}, sort={}", pageable.getPageNumber(), pageable.getPageSize(),
				pageable.getSort());
		Page<UserDto> users = userRepository.findAll(pageable).map(this::toDto);
		logger.debug("Fetched users page with {} elements (total={})", users.getNumberOfElements(), users.getTotalElements());
		return users;
	}

	@Cacheable(value = "usersById", key = "#id", unless = "#result == null")
	public Optional<UserDto> findById(Long id) {
		logger.debug("Finding user by id {}", id);
		Optional<UserDto> user = userRepository.findById(id).map(this::toDto);
		logger.debug("Find by id {} -> found={}", id, user.isPresent());
		return user;
	}

	@Cacheable(value = "usersByEmail", key = "#email", unless = "#result == null")
	public Optional<UserDto> findByEmail(String email) {
		logger.debug("Finding user by email {}", maskEmail(email));
		Optional<UserDto> user = userRepository.findByEmail(email).map(this::toDto);
		logger.debug("Find by email {} -> found={}", maskEmail(email), user.isPresent());
		return user;
	}

	@Transactional
	@Caching(evict = {
			@CacheEvict(value = "usersById", key = "#id"),
			@CacheEvict(value = "usersByEmail", key = "#userDto.email")
	})
	public UserDto updateUser(Long id, UserDto userDto) {
		logger.info("Updating user {}", id);
		User existingUser = userRepository.findById(id)
				.orElseThrow(() -> {
					logger.warn("Update user rejected: user {} not found", id);
					return new RuntimeException("User not found with id " + id);
				});

		String oldEmail = existingUser.getEmail();

		existingUser.setEmail(userDto.getEmail());
		if (userDto.getPassword() != null && !userDto.getPassword().isEmpty()) {
			existingUser.setPassword(passwordEncoder.encode(userDto.getPassword()));
		}
		if (userDto.getUserProfile() != null) {
			UserProfile userProfile = existingUser.getUserProfile();
			if (userProfile == null) {
				userProfile = new UserProfile();
				existingUser.setUserProfile(userProfile);
			}
			userProfile.setFirstName(userDto.getUserProfile().getFirstName());
			userProfile.setLastName(userDto.getUserProfile().getLastName());
			userProfile.setDateOfBirth(userDto.getUserProfile().getDateOfBirth());
			userProfile.setAddress(userDto.getUserProfile().getAddress());
			userProfile.setProfilePictureUrl(userDto.getUserProfile().getProfilePictureUrl());
			userProfile.setBio(userDto.getUserProfile().getBio());
			userProfile.setTelefon(userDto.getUserProfile().getTelefon());
			userProfile.setCnp(userDto.getUserProfile().getCnp());
			userProfile.setSex(normalizeSexOrDefault(userDto.getUserProfile().getSex()));
			userProfile.setUpdatedAt(java.time.LocalDateTime.now());
		} else {
			existingUser.setUserProfile(null);
		}

		User savedUser = userRepository.save(existingUser);

		// Manually evict the old email if it changed
		if (!oldEmail.equals(savedUser.getEmail())) {
			logger.info("User {} email changed from {} to {}", id, maskEmail(oldEmail), maskEmail(savedUser.getEmail()));
			cacheManager.getCache("usersByEmail").evict(oldEmail);
		}

		logger.info("Updated user {}", id);
		return toDto(savedUser);
	}

	@Transactional
	public UserDto updateUserProfile(Long id, UserProfileDto profileDto, String authenticatedEmail) {
		logger.info("Updating profile for user {} by {}", id, maskEmail(authenticatedEmail));
		User user = userRepository.findById(id)
				.orElseThrow(() -> {
					logger.warn("Update profile rejected: user {} not found", id);
					return new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found with id " + id);
				});

		if (authenticatedEmail == null || !user.getEmail().equalsIgnoreCase(authenticatedEmail)) {
			logger.warn("Update profile rejected: user {} attempted by {}", id, maskEmail(authenticatedEmail));
			throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You can only update your own profile");
		}

		validateProfilePayload(profileDto);

		UserProfile userProfile = user.getUserProfile();
		LocalDateTime now = LocalDateTime.now();

		if (userProfile == null) {
			userProfile = new UserProfile();
			userProfile.setCreatedAt(now);
			user.setUserProfile(userProfile);
		} else if (userProfile.getCreatedAt() == null) {
			userProfile.setCreatedAt(now);
		}

		userProfile.setFirstName(profileDto.getFirstName());
		userProfile.setLastName(profileDto.getLastName());
		userProfile.setDateOfBirth(profileDto.getDateOfBirth());
		userProfile.setAddress(profileDto.getAddress());
		userProfile.setProfilePictureUrl(profileDto.getProfilePictureUrl());
		userProfile.setBio(profileDto.getBio());
		userProfile.setTelefon(profileDto.getTelefon());
		userProfile.setCnp(normalizeNullable(profileDto.getCnp()));
		userProfile.setSex(normalizeSexOrDefault(profileDto.getSex()));
		userProfile.setUpdatedAt(now);

		User savedUser = userRepository.save(user);
		cacheManager.getCache("usersById").evict(savedUser.getId());
		cacheManager.getCache("usersByEmail").evict(savedUser.getEmail());
		logger.info("Updated profile for user {}", id);
		return toDto(savedUser);
	}

	@Transactional
	@CacheEvict(value = "usersById", key = "#id")
	public void deleteUser(Long id) {
		logger.info("Deleting user {}", id);
		User userToDelete = userRepository.findById(id)
				.orElseThrow(() -> {
					logger.warn("Delete user rejected: user {} not found", id);
					return new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found with id " + id);
				});
		userRepository.delete(userToDelete);
		cacheManager.getCache("usersByEmail").evict(userToDelete.getEmail());
		logger.info("Deleted user {}", id);
	}

	public UserDto registerUser(UserDto userDto) {
		logger.info("Registering user for email {}", maskEmail(userDto.getEmail()));

		// Validate and process referral code if provided
		User referrer = null;
		String referralCode = userDto.getReferralCode();
		if (referralCode != null && !referralCode.trim().isEmpty()) {
			final String processedCode = referralCode.trim().toUpperCase();
			referrer = userRepository.findByCode(processedCode)
				.orElseThrow(() -> {
					logger.warn("Registration rejected: referral code {} not found", processedCode);
					return new ResponseStatusException(HttpStatus.BAD_REQUEST, "Referral code not found");
				});

			// Prevent self-referral
			if (referrer.getEmail().equalsIgnoreCase(userDto.getEmail())) {
				logger.warn("Registration rejected: self-referral attempt for {}", maskEmail(userDto.getEmail()));
				throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cannot use your own referral code");
			}
			logger.info("Valid referral code {} from user {}", referralCode, referrer.getId());
		}

		User user = new User();
		user.setEmail(userDto.getEmail());
		user.setPassword(passwordEncoder.encode(userDto.getPassword()));
		user.setCode(generateUniqueCode());
		user.setReferredBy(referrer);

		// Initialize level for new registered user
		user.setLevel(new Level());

		User savedUser = userRepository.save(user);
		cacheManager.getCache("usersById").evict(savedUser.getId());
		cacheManager.getCache("usersByEmail").evict(savedUser.getEmail());
		logger.info("Registered user {} with generated code", savedUser.getId());

		// Award XP to referrer after successful registration
		if (referrer != null) {
			levelingSystemService.addXpToUser(referrer.getId(), REFERRAL_XP_REWARD);
			logger.info("Awarded {} XP to referrer {} for referring user {}",
				REFERRAL_XP_REWARD, referrer.getId(), savedUser.getId());
		}

		return toDto(savedUser);
	}

	private String generateUniqueCode() {
		int maxAttempts = 10;
		int attempts = 0;

		while (attempts < maxAttempts) {
			String code = codeGenerationService.generateCode();
			if (!userRepository.existsByCode(code)) {
				logger.debug("Generated unique code after {} attempt(s)", attempts + 1);
				return code;
			}
			logger.warn("Code collision on attempt {}", attempts + 1);
			attempts++;
		}

		logger.error("Failed to generate unique code after {} attempts", maxAttempts);
		throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE,
				"Could not generate unique code. System at capacity.");
	}

	private UserDto toDto(User user) {
		UserDto userDto = new UserDto();
		userDto.setId(user.getId());
		userDto.setEmail(user.getEmail());
		userDto.setCode(user.getCode());
		
		// Map Level info to DTO
		if (user.getLevel() != null) {
			userDto.setCurrentLevel(user.getLevel().getCurrentLevel());
			userDto.setCurrentXP(user.getLevel().getCurrentXP());
			userDto.setNextLevelXP(user.getLevel().getNextLevelXP());
		}
		
		if (user.getUserProfile() != null) {
			userDto.setUserProfile(toDto(user.getUserProfile()));
		}
		return userDto;
	}

	private UserProfileDto toDto(UserProfile userProfile) {
		UserProfileDto userProfileDto = new UserProfileDto();
		userProfileDto.setId(userProfile.getId());
		userProfileDto.setFirstName(userProfile.getFirstName());
		userProfileDto.setLastName(userProfile.getLastName());
		userProfileDto.setDateOfBirth(userProfile.getDateOfBirth());
		userProfileDto.setAddress(userProfile.getAddress());
		userProfileDto.setProfilePictureUrl(userProfile.getProfilePictureUrl());
		userProfileDto.setBio(userProfile.getBio());
		userProfileDto.setTelefon(userProfile.getTelefon());
		userProfileDto.setCnp(userProfile.getCnp());
		userProfileDto.setSex(userProfile.getSex());
		userProfileDto.setCreatedAt(userProfile.getCreatedAt());
		userProfileDto.setUpdatedAt(userProfile.getUpdatedAt());
		return userProfileDto;
	}

	private User toEntity(UserDto userDto) {
		User user = new User();
		user.setId(userDto.getId());
		user.setEmail(userDto.getEmail());
		user.setCode(userDto.getCode());
		if (userDto.getUserProfile() != null) {
			user.setUserProfile(toEntity(userDto.getUserProfile()));
		}
		return user;
	}

	private UserProfile toEntity(UserProfileDto userProfileDto) {
		UserProfile userProfile = new UserProfile();
		userProfile.setId(userProfileDto.getId());
		userProfile.setFirstName(userProfileDto.getFirstName());
		userProfile.setLastName(userProfileDto.getLastName());
		userProfile.setDateOfBirth(userProfileDto.getDateOfBirth());
		userProfile.setAddress(userProfileDto.getAddress());
		userProfile.setProfilePictureUrl(userProfileDto.getProfilePictureUrl());
		userProfile.setBio(userProfileDto.getBio());
		userProfile.setTelefon(userProfileDto.getTelefon());
		userProfile.setCnp(userProfileDto.getCnp());
		userProfile.setSex(userProfileDto.getSex());
		userProfile.setCreatedAt(userProfileDto.getCreatedAt());
		userProfile.setUpdatedAt(userProfileDto.getUpdatedAt());
		return userProfile;
	}

	private void validateProfilePayload(UserProfileDto profileDto) {
		if (profileDto == null) {
			logger.warn("Profile validation failed: payload is null");
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Profile payload is required");
		}

		String normalizedCnp = normalizeNullable(profileDto.getCnp());
		if (normalizedCnp != null && !CNP_PATTERN.matcher(normalizedCnp).matches()) {
			logger.warn("Profile validation failed: invalid CNP format");
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "CNP must contain exactly 13 digits");
		}

		try {
			profileDto.setSex(normalizeSexOrDefault(profileDto.getSex()));
		} catch (IllegalArgumentException ex) {
			logger.warn("Profile validation failed: invalid sex value {}", profileDto.getSex());
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, ex.getMessage());
		}
	}

	private String normalizeNullable(String value) {
		if (value == null) {
			return null;
		}
		String normalized = value.trim();
		return normalized.isEmpty() ? null : normalized;
	}

	private Character normalizeSexOrDefault(Character sex) {
		if (sex == null) {
			return 'O';
		}

		char normalizedSex = Character.toUpperCase(sex);
		if (normalizedSex != 'M' && normalizedSex != 'F' && normalizedSex != 'O') {
			throw new IllegalArgumentException("Sex must be one of M, F, or O");
		}

		return normalizedSex;
	}

	private String maskEmail(String email) {
		if (email == null || email.isBlank()) {
			return "<empty>";
		}
		int atIndex = email.indexOf('@');
		if (atIndex <= 1) {
			return "***";
		}
		return email.charAt(0) + "***" + email.substring(atIndex);
	}
}
