package com.party.ceva.demo.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.cache.Cache;
import org.springframework.cache.CacheManager;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.server.ResponseStatusException;

import com.party.ceva.demo.dto.UserDto;
import com.party.ceva.demo.dto.UserProfileDto;
import com.party.ceva.demo.model.User;
import com.party.ceva.demo.model.UserProfile;
import com.party.ceva.demo.repository.UserRepository;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

	@Mock
	private UserRepository userRepository;

	@Mock
	private PasswordEncoder passwordEncoder;

	@Mock
	private CacheManager cacheManager;

	@Mock
	private Cache usersByIdCache;

	@Mock
	private Cache usersByEmailCache;

	@Mock
	private CodeGenerationService codeGenerationService;

	@Mock
	private LevelingSystemService levelingSystemService;

	@InjectMocks
	private UserService userService;

	@BeforeEach
	void setUp() {
		lenient().when(cacheManager.getCache("usersById")).thenReturn(usersByIdCache);
		lenient().when(cacheManager.getCache("usersByEmail")).thenReturn(usersByEmailCache);
	}

	@Test
	void updateUserProfileUpdatesOwnProfile() {
		User user = new User();
		user.setId(1L);
		user.setEmail("user@example.com");

		UserProfile profile = new UserProfile();
		profile.setId(10L);
		profile.setCreatedAt(LocalDateTime.now().minusDays(1));
		user.setUserProfile(profile);

		UserProfileDto payload = new UserProfileDto();
		payload.setFirstName("John");
		payload.setLastName("Doe");
		payload.setTelefon("0711111111");
		payload.setDateOfBirth(LocalDate.of(1990, 1, 1));
		payload.setAddress("Main Street");
		payload.setBio("Volunteer");
		payload.setProfilePictureUrl("https://example.com/pic.png");
		payload.setCnp("1234567890123");
		payload.setSex('f');

		when(userRepository.findById(1L)).thenReturn(Optional.of(user));
		when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));

		UserDto result = userService.updateUserProfile(1L, payload, "user@example.com");

		assertNotNull(result.getUserProfile());
		assertEquals("John", result.getUserProfile().getFirstName());
		assertEquals("Doe", result.getUserProfile().getLastName());
		assertEquals("1234567890123", result.getUserProfile().getCnp());
		assertEquals(Character.valueOf('F'), result.getUserProfile().getSex());
		assertNotNull(result.getUserProfile().getUpdatedAt());
		verify(userRepository).save(user);
	}

	@Test
	void updateUserProfileCreatesProfileWhenMissing() {
		User user = new User();
		user.setId(1L);
		user.setEmail("user@example.com");
		user.setUserProfile(null);

		UserProfileDto payload = new UserProfileDto();
		payload.setFirstName("Ana");
		payload.setCnp(null);
		payload.setSex(null);

		when(userRepository.findById(1L)).thenReturn(Optional.of(user));
		when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));

		UserDto result = userService.updateUserProfile(1L, payload, "user@example.com");

		assertNotNull(user.getUserProfile());
		assertNotNull(user.getUserProfile().getCreatedAt());
		assertNotNull(user.getUserProfile().getUpdatedAt());
		assertNotNull(result.getUserProfile());
		assertEquals("Ana", result.getUserProfile().getFirstName());
		verify(userRepository).save(user);
	}

	@Test
	void updateUserProfileRejectsInvalidCnp() {
		User user = new User();
		user.setId(1L);
		user.setEmail("user@example.com");

		UserProfileDto payload = new UserProfileDto();
		payload.setCnp("123");

		when(userRepository.findById(1L)).thenReturn(Optional.of(user));

		ResponseStatusException ex = assertThrows(
				ResponseStatusException.class,
				() -> userService.updateUserProfile(1L, payload, "user@example.com"));

		assertEquals(HttpStatus.BAD_REQUEST, ex.getStatusCode());
		verify(userRepository, never()).save(any(User.class));
	}

	@Test
	void updateUserProfileRejectsDifferentAuthenticatedUser() {
		User user = new User();
		user.setId(1L);
		user.setEmail("user@example.com");

		UserProfileDto payload = new UserProfileDto();

		when(userRepository.findById(1L)).thenReturn(Optional.of(user));

		ResponseStatusException ex = assertThrows(
				ResponseStatusException.class,
				() -> userService.updateUserProfile(1L, payload, "someoneelse@example.com"));

		assertEquals(HttpStatus.FORBIDDEN, ex.getStatusCode());
		verify(userRepository, never()).save(any(User.class));
	}

	@Test
	void updateUserProfileReturnsNotFoundWhenUserMissing() {
		when(userRepository.findById(1L)).thenReturn(Optional.empty());

		ResponseStatusException ex = assertThrows(
				ResponseStatusException.class,
				() -> userService.updateUserProfile(1L, new UserProfileDto(), "user@example.com"));

		assertEquals(HttpStatus.NOT_FOUND, ex.getStatusCode());
		verify(userRepository, never()).save(any(User.class));
	}

	@Test
	void registerUserCreatesUserProfileWithTrimmedNames() {
		UserDto payload = new UserDto();
		payload.setEmail("new@example.com");
		payload.setPassword("password");

		UserProfileDto profilePayload = new UserProfileDto();
		profilePayload.setFirstName("  Jane ");
		profilePayload.setLastName(" Doe ");
		payload.setUserProfile(profilePayload);

		when(passwordEncoder.encode("password")).thenReturn("encoded-password");
		when(codeGenerationService.generateCode()).thenReturn("ABCD");
		when(userRepository.existsByCode("ABCD")).thenReturn(false);
		when(userRepository.save(any(User.class))).thenAnswer(invocation -> {
			User savedUser = invocation.getArgument(0);
			savedUser.setId(15L);
			return savedUser;
		});

		UserDto result = userService.registerUser(payload);

		assertEquals("new@example.com", result.getEmail());
		assertNotNull(result.getUserProfile());
		assertEquals("Jane", result.getUserProfile().getFirstName());
		assertEquals("Doe", result.getUserProfile().getLastName());
		assertEquals(Character.valueOf('O'), result.getUserProfile().getSex());
		assertNotNull(result.getUserProfile().getCreatedAt());
		assertNotNull(result.getUserProfile().getUpdatedAt());
		verify(levelingSystemService, never()).addXpToUser(anyLong(), anyInt());
		verify(userRepository).save(any(User.class));
	}

	@Test
	void registerUserRejectsMissingUserProfile() {
		UserDto payload = new UserDto();
		payload.setEmail("new@example.com");
		payload.setPassword("password");

		ResponseStatusException ex = assertThrows(
				ResponseStatusException.class,
				() -> userService.registerUser(payload));

		assertEquals(HttpStatus.BAD_REQUEST, ex.getStatusCode());
		assertEquals("User profile is required", ex.getReason());
		verify(userRepository, never()).save(any(User.class));
		verify(codeGenerationService, never()).generateCode();
	}

	@Test
	void registerUserRejectsBlankFirstName() {
		UserDto payload = new UserDto();
		payload.setEmail("new@example.com");
		payload.setPassword("password");

		UserProfileDto profilePayload = new UserProfileDto();
		profilePayload.setFirstName("   ");
		profilePayload.setLastName("Doe");
		payload.setUserProfile(profilePayload);

		ResponseStatusException ex = assertThrows(
				ResponseStatusException.class,
				() -> userService.registerUser(payload));

		assertEquals(HttpStatus.BAD_REQUEST, ex.getStatusCode());
		assertEquals("First name is required", ex.getReason());
		verify(userRepository, never()).save(any(User.class));
		verify(codeGenerationService, never()).generateCode();
	}

	@Test
	void registerUserRejectsBlankLastName() {
		UserDto payload = new UserDto();
		payload.setEmail("new@example.com");
		payload.setPassword("password");

		UserProfileDto profilePayload = new UserProfileDto();
		profilePayload.setFirstName("Jane");
		profilePayload.setLastName("   ");
		payload.setUserProfile(profilePayload);

		ResponseStatusException ex = assertThrows(
				ResponseStatusException.class,
				() -> userService.registerUser(payload));

		assertEquals(HttpStatus.BAD_REQUEST, ex.getStatusCode());
		assertEquals("Last name is required", ex.getReason());
		verify(userRepository, never()).save(any(User.class));
		verify(codeGenerationService, never()).generateCode();
	}

	@Test
	void registerUserAwardsReferralXpWhenCodeIsValid() {
		User referrer = new User();
		referrer.setId(10L);
		referrer.setEmail("referrer@example.com");

		UserDto payload = new UserDto();
		payload.setEmail("new@example.com");
		payload.setPassword("password");
		payload.setReferralCode("ab12");

		UserProfileDto profilePayload = new UserProfileDto();
		profilePayload.setFirstName("Ana");
		profilePayload.setLastName("Pop");
		payload.setUserProfile(profilePayload);

		when(userRepository.findByCode("AB12")).thenReturn(Optional.of(referrer));
		when(passwordEncoder.encode("password")).thenReturn("encoded-password");
		when(codeGenerationService.generateCode()).thenReturn("WXYZ");
		when(userRepository.existsByCode("WXYZ")).thenReturn(false);
		when(userRepository.save(any(User.class))).thenAnswer(invocation -> {
			User savedUser = invocation.getArgument(0);
			savedUser.setId(25L);
			return savedUser;
		});

		UserDto result = userService.registerUser(payload);

		assertNotNull(result.getUserProfile());
		assertEquals("Ana", result.getUserProfile().getFirstName());
		assertEquals("Pop", result.getUserProfile().getLastName());
		verify(userRepository).findByCode("AB12");
		verify(levelingSystemService).addXpToUser(10L, 1000);
	}
}
