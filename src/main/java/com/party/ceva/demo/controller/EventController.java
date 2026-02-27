package com.party.ceva.demo.controller;

import java.time.LocalDateTime;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

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
}
