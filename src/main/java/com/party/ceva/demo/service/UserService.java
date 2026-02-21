package com.party.ceva.demo.service;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.regex.Pattern;

import com.party.ceva.demo.dto.UserDto;
import com.party.ceva.demo.dto.UserProfileDto;
import com.party.ceva.demo.model.User;
import com.party.ceva.demo.model.UserProfile;
import com.party.ceva.demo.repository.UserRepository;

import jakarta.transaction.Transactional;

import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.Caching;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.scheduling.annotation.Async;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class UserService {

	private static final Pattern CNP_PATTERN = Pattern.compile("^\\d{13}$");

	private final UserRepository userRepository;
	private final PasswordEncoder passwordEncoder;
	private final CacheManager cacheManager;
	private final CodeGenerationService codeGenerationService;

	public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder, CacheManager cacheManager,
			CodeGenerationService codeGenerationService) {
		this.userRepository = userRepository;
		this.passwordEncoder = passwordEncoder;
		this.cacheManager = cacheManager;
		this.codeGenerationService = codeGenerationService;
	}

	public UserDto createUser(UserDto userDto) {
		User user = toEntity(userDto);
		user.setPassword(passwordEncoder.encode(userDto.getPassword()));
		User savedUser = userRepository.save(user);
		cacheManager.getCache("usersById").evict(savedUser.getId());
		cacheManager.getCache("usersByEmail").evict(savedUser.getEmail());
		return toDto(savedUser);
	}

	public Page<UserDto> findAllUsers(Pageable pageable) {
		return userRepository.findAll(pageable).map(this::toDto);
	}

	@Cacheable(value = "usersById", key = "#id", unless = "#result == null")
	public Optional<UserDto> findById(Long id) {
		return userRepository.findById(id).map(this::toDto);
	}

	@Cacheable(value = "usersByEmail", key = "#email", unless = "#result == null")
	public Optional<UserDto> findByEmail(String email) {
		System.out.println("asdas");
		return userRepository.findByEmail(email).map(this::toDto);
	}

	@Transactional
	@Caching(evict = {
			@CacheEvict(value = "usersById", key = "#id"),
			@CacheEvict(value = "usersByEmail", key = "#userDto.email")
	})
	public UserDto updateUser(Long id, UserDto userDto) {
		User existingUser = userRepository.findById(id)
				.orElseThrow(() -> new RuntimeException("User not found with id " + id));

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
			userProfile.setSex(userDto.getUserProfile().getSex());
			userProfile.setUpdatedAt(java.time.LocalDateTime.now());
		} else {
			existingUser.setUserProfile(null);
		}

		User savedUser = userRepository.save(existingUser);

		// Manually evict the old email if it changed
		if (!oldEmail.equals(savedUser.getEmail())) {
			cacheManager.getCache("usersByEmail").evict(oldEmail);
		}

		return toDto(savedUser);
	}

	@Transactional
	public UserDto updateUserProfile(Long id, UserProfileDto profileDto, String authenticatedEmail) {
		User user = userRepository.findById(id)
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found with id " + id));

		if (authenticatedEmail == null || !user.getEmail().equalsIgnoreCase(authenticatedEmail)) {
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
		userProfile.setSex(profileDto.getSex());
		userProfile.setUpdatedAt(now);

		User savedUser = userRepository.save(user);
		cacheManager.getCache("usersById").evict(savedUser.getId());
		cacheManager.getCache("usersByEmail").evict(savedUser.getEmail());
		return toDto(savedUser);
	}

	@Transactional
	@CacheEvict(value = "usersById", key = "#id")
	public void deleteUser(Long id) {
		User userToDelete = userRepository.findById(id)
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found with id " + id));
		userRepository.delete(userToDelete);
		cacheManager.getCache("usersByEmail").evict(userToDelete.getEmail());
	}

	public UserDto registerUser(UserDto userDto) {
		User user = new User();
		user.setEmail(userDto.getEmail());
		user.setPassword(passwordEncoder.encode(userDto.getPassword()));
		user.setCode(generateUniqueCode());
		User savedUser = userRepository.save(user);
		cacheManager.getCache("usersById").evict(savedUser.getId());
		cacheManager.getCache("usersByEmail").evict(savedUser.getEmail());
		return toDto(savedUser);
	}

	private String generateUniqueCode() {
		int maxAttempts = 10;
		int attempts = 0;

		while (attempts < maxAttempts) {
			String code = codeGenerationService.generateCode();
			if (!userRepository.existsByCode(code)) {
				return code;
			}
			attempts++;
		}

		throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE,
				"Could not generate unique code. System at capacity.");
	}

	private UserDto toDto(User user) {
		UserDto userDto = new UserDto();
		userDto.setId(user.getId());
		userDto.setEmail(user.getEmail());
		userDto.setCode(user.getCode());
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
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Profile payload is required");
		}

		String normalizedCnp = normalizeNullable(profileDto.getCnp());
		if (normalizedCnp != null && !CNP_PATTERN.matcher(normalizedCnp).matches()) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "CNP must contain exactly 13 digits");
		}

		Character sex = profileDto.getSex();
		if (sex != null) {
			char normalizedSex = Character.toUpperCase(sex);
			if (normalizedSex != 'M' && normalizedSex != 'F' && normalizedSex != 'O') {
				throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Sex must be one of M, F, or O");
			}
			profileDto.setSex(normalizedSex);
		}
	}

	private String normalizeNullable(String value) {
		if (value == null) {
			return null;
		}
		String normalized = value.trim();
		return normalized.isEmpty() ? null : normalized;
	}
}
