package com.party.ceva.demo.service;

import java.time.LocalDateTime;
import java.util.List;

import org.modelmapper.ModelMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.party.ceva.demo.dto.EventDto;
import com.party.ceva.demo.model.Event;
import com.party.ceva.demo.model.EventParticipation;
import com.party.ceva.demo.model.User;
import com.party.ceva.demo.repository.EventParticipationRepository;
import com.party.ceva.demo.repository.EventRepository;
import com.party.ceva.demo.repository.UserRepository;

@Service
public class EventService {
	private static final Logger logger = LoggerFactory.getLogger(EventService.class);

	private final EventRepository eventRepository;
	private final EventParticipationRepository eventParticipationRepository;
	private final UserRepository userRepository;
	private final ModelMapper modelMapper;

	public EventService(
			EventRepository eventRepository,
			EventParticipationRepository eventParticipationRepository,
			UserRepository userRepository,
			ModelMapper modelMapper) {
		this.eventRepository = eventRepository;
		this.eventParticipationRepository = eventParticipationRepository;
		this.userRepository = userRepository;
		this.modelMapper = modelMapper;
	}

	public Page<EventDto> getEvents(Pageable pageable) {
		logger.debug("Fetching events page: page={}, size={}, sort={}", pageable.getPageNumber(), pageable.getPageSize(),
				pageable.getSort());
		Page<Event> eventPage = this.eventRepository.findAll(pageable);
		logger.debug("Fetched events page with {} elements (total={})", eventPage.getNumberOfElements(),
				eventPage.getTotalElements());
		return eventPage.map(event -> modelMapper.map(event, EventDto.class));
	}

	public Page<EventDto> getEventsBetween(Pageable pageable, LocalDateTime startDate, LocalDateTime endDate) {
		logger.debug("Fetching events between {} and {}: page={}, size={}", startDate, endDate, pageable.getPageNumber(),
				pageable.getPageSize());
		Page<Event> eventPage = this.eventRepository.findByStartTimeBetween(startDate, endDate, pageable);
		logger.debug("Fetched {} events (total={}) for date range", eventPage.getNumberOfElements(),
				eventPage.getTotalElements());
		return eventPage.map(event -> modelMapper.map(event, EventDto.class));
	}

	public Page<EventDto> getUpcomingAndOngoingEvents(Pageable pageable, LocalDateTime now) {
		logger.debug("Fetching upcoming/ongoing events at {}: page={}, size={}", now, pageable.getPageNumber(),
				pageable.getPageSize());
		Page<Event> eventPage = this.eventRepository.findByEndTimeGreaterThanEqual(now, pageable);
		logger.debug("Fetched {} upcoming/ongoing events (total={})", eventPage.getNumberOfElements(),
				eventPage.getTotalElements());
		return eventPage.map(event -> modelMapper.map(event, EventDto.class));
	}

	@Transactional
	public void joinEvent(Long eventId, String userEmail) {
		logger.info("Join event requested: eventId={}, user={}", eventId, maskEmail(userEmail));
		User user = userRepository.findByEmail(userEmail)
				.orElseThrow(() -> {
					logger.warn("Join event rejected: authenticated user not found for {}", maskEmail(userEmail));
					return new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Authenticated user not found");
				});

		Event event = eventRepository.findById(eventId)
				.orElseThrow(() -> {
					logger.warn("Join event rejected: event {} not found", eventId);
					return new ResponseStatusException(HttpStatus.NOT_FOUND, "Event not found");
				});

		LocalDateTime now = LocalDateTime.now();
		if (event.getEndTime() != null && event.getEndTime().isBefore(now)) {
			logger.warn("Join event rejected: event {} is closed (endTime={})", eventId, event.getEndTime());
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Event is closed");
		}

		boolean alreadyJoined = eventParticipationRepository.existsByEvent_IdAndUser_Id(eventId, user.getId());
		if (alreadyJoined) {
			logger.info("Join event skipped: user {} already joined event {}", user.getId(), eventId);
			throw new ResponseStatusException(HttpStatus.CONFLICT, "User already joined this event");
		}

		EventParticipation participation = new EventParticipation();
		participation.setEvent(event);
		participation.setUser(user);
		eventParticipationRepository.save(participation);
		logger.info("User {} joined event {}", user.getId(), eventId);
	}

	public List<Long> getJoinedEventIds(String userEmail) {
		logger.debug("Fetching joined event ids for user {}", maskEmail(userEmail));
		User user = userRepository.findByEmail(userEmail)
				.orElseThrow(() -> {
					logger.warn("Joined event id lookup rejected: authenticated user not found for {}", maskEmail(userEmail));
					return new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Authenticated user not found");
				});

		List<Long> joinedEventIds = eventParticipationRepository.findJoinedEventIdsByUserId(user.getId());
		logger.debug("Found {} joined event ids for user {}", joinedEventIds.size(), user.getId());
		return joinedEventIds;
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
