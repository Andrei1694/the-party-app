package com.party.ceva.demo.controller;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import com.party.ceva.demo.dto.EventDto;
import com.party.ceva.demo.service.EventService;

@RestController
@RequestMapping("/api/events")
public class EventController {

	private final EventService eventService;

	public EventController(EventService eventService) {
		this.eventService = eventService;
	}

	@GetMapping
	public Page<EventDto> getEvents(Pageable pageable) {
		return this.eventService.getUpcomingAndOngoingEvents(pageable, LocalDateTime.now());
	}

	@GetMapping("/joined")
	public List<Long> getJoinedEventIds(Authentication authentication) {
		String userEmail = resolveAuthenticatedEmail(authentication);
		return this.eventService.getJoinedEventIds(userEmail);
	}

	@PostMapping("/{eventId}/join")
	public ResponseEntity<Void> joinEvent(@PathVariable Long eventId, Authentication authentication) {
		String userEmail = resolveAuthenticatedEmail(authentication);
		this.eventService.joinEvent(eventId, userEmail);
		return ResponseEntity.status(HttpStatus.CREATED).build();
	}

	private String resolveAuthenticatedEmail(Authentication authentication) {
		if (authentication == null || authentication instanceof AnonymousAuthenticationToken) {
			throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Authentication required");
		}

		Object principal = authentication.getPrincipal();
		if (principal instanceof UserDetails userDetails) {
			return userDetails.getUsername();
		}

		return authentication.getName();
	}
}
