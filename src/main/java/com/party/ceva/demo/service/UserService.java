package com.party.ceva.demo.service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.security.crypto.password.PasswordEncoder; // Import this

import com.party.ceva.demo.model.User;
import com.party.ceva.demo.model.UserProfile;
import com.party.ceva.demo.repository.UserRepository;
import com.party.ceva.demo.dto.UserDto;
import com.party.ceva.demo.dto.UserProfileDto;

import java.util.Optional;
import jakarta.transaction.Transactional; // Import Transactional

@Service
public class UserService {

	private final UserRepository userRepository;
	private final PasswordEncoder passwordEncoder; // Inject PasswordEncoder

	public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder) { // Update constructor
		this.userRepository = userRepository;
		this.passwordEncoder = passwordEncoder;
	}

	public UserDto createUser(UserDto userDto) {
		User user = toEntity(userDto);
		user.setPassword(passwordEncoder.encode(userDto.getPassword())); // Encode the password
		User savedUser = userRepository.save(user);
		return toDto(savedUser);
	}

	public Page<UserDto> findAllUsers(Pageable pageable) {
		return userRepository.findAll(pageable).map(this::toDto);
	}

	public Optional<UserDto> findById(Long id) {
		return userRepository.findById(id).map(this::toDto);
	}

	public Optional<UserDto> findByEmail(String email) {
		return userRepository.findByEmail(email).map(this::toDto);
	}

	@Transactional
	public UserDto updateUser(Long id, UserDto userDto) {
		return userRepository.findById(id).map(user -> {
			user.setEmail(userDto.getEmail());
			if (userDto.getPassword() != null && !userDto.getPassword().isEmpty()) {
				user.setPassword(passwordEncoder.encode(userDto.getPassword()));
			}
			if (userDto.getUserProfile() != null) {
				UserProfile userProfile = user.getUserProfile();
				if (userProfile == null) {
					userProfile = new UserProfile();
					user.setUserProfile(userProfile);
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
				userProfile.setUpdatedAt(java.time.LocalDateTime.now()); // Set updated timestamp
			} else {
				user.setUserProfile(null);
			}
			return toDto(userRepository.save(user));
		}).orElseThrow(() -> new RuntimeException("User not found with id " + id)); // Or a custom exception
	}

	public void deleteUser(Long id) {
		userRepository.deleteById(id);
	}

	public UserDto registerUser(UserDto userDto) {
		User user = new User();
		user.setEmail(userDto.getEmail());
		user.setPassword(passwordEncoder.encode(userDto.getPassword())); // Hash the password
		// Set user profile if available, similar to createUser
		User savedUser = userRepository.save(user);
		return toDto(savedUser);
	}

	private UserDto toDto(User user) {
		UserDto userDto = new UserDto();
		userDto.setId(user.getId());
		userDto.setEmail(user.getEmail());
		// userDto.setPassword(user.getPassword()); // Do not expose password
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
		// Password will be encoded in service methods, not here.
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
}
