package com.party.ceva.demo.controller;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.http.ResponseEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;

import com.party.ceva.demo.service.UserService;
import com.party.ceva.demo.dto.UserDto;
import com.party.ceva.demo.dto.UserProfileDto;

@RestController
@RequestMapping("api/users")
public class UserController {

	private final UserService userService;

	public UserController(UserService userService) {
		this.userService = userService;
	}

	@GetMapping
	public Page<UserDto> getAllUsers(Pageable pageable) {
		return this.userService.findAllUsers(pageable);
	}

	@GetMapping("/{id}")
	public ResponseEntity<UserDto> getUserById(@PathVariable Long id) {
		return userService.findById(id)
				.map(ResponseEntity::ok)
				.orElse(ResponseEntity.notFound().build());
	}

	@PostMapping
	public UserDto createUser(@RequestBody UserDto userDto) {
		return this.userService.createUser(userDto);
	}

	@PostMapping("/register")
	public UserDto registerUser(@RequestBody UserDto userDto) {
		return userService.registerUser(userDto);
	}

	@PutMapping("/{id}")
	public UserDto updateUser(@PathVariable Long id, @RequestBody UserDto userDto) {
		return userService.updateUser(id, userDto);
	}

	@PutMapping("/{id}/profile")
	public ResponseEntity<UserDto> updateUserProfile(@PathVariable Long id, @RequestBody UserProfileDto profileDto) {
		Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
		if (authentication == null || authentication instanceof AnonymousAuthenticationToken) {
			return ResponseEntity.status(401).build();
		}

		String userEmail;
		Object principal = authentication.getPrincipal();
		if (principal instanceof UserDetails userDetails) {
			userEmail = userDetails.getUsername();
		} else {
			userEmail = authentication.getName();
		}

		UserDto updatedUser = userService.updateUserProfile(id, profileDto, userEmail);
		return ResponseEntity.ok(updatedUser);
	}

	@DeleteMapping("/{id}")
	public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
		userService.deleteUser(id);
		return ResponseEntity.noContent().build();
	}
}
