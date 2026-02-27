package com.party.ceva.demo.service;

import java.time.LocalDateTime;
import java.util.List;

import org.modelmapper.ModelMapper;
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
		Page<Event> eventPage = this.eventRepository.findAll(pageable);
		return eventPage.map(event -> modelMapper.map(event, EventDto.class));
	}

	public Page<EventDto> getEventsBetween(Pageable pageable, LocalDateTime startDate, LocalDateTime endDate) {
		Page<Event> eventPage = this.eventRepository.findByStartTimeBetween(startDate, endDate, pageable);
		return eventPage.map(event -> modelMapper.map(event, EventDto.class));
	}

	public Page<EventDto> getUpcomingAndOngoingEvents(Pageable pageable, LocalDateTime now) {
		Page<Event> eventPage = this.eventRepository.findByEndTimeGreaterThanEqual(now, pageable);
		return eventPage.map(event -> modelMapper.map(event, EventDto.class));
	}

	@Transactional
	public void joinEvent(Long eventId, String userEmail) {
		User user = userRepository.findByEmail(userEmail)
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Authenticated user not found"));

		Event event = eventRepository.findById(eventId)
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Event not found"));

		LocalDateTime now = LocalDateTime.now();
		if (event.getEndTime() != null && event.getEndTime().isBefore(now)) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Event is closed");
		}

		boolean alreadyJoined = eventParticipationRepository.existsByEvent_IdAndUser_Id(eventId, user.getId());
		if (alreadyJoined) {
			throw new ResponseStatusException(HttpStatus.CONFLICT, "User already joined this event");
		}

		EventParticipation participation = new EventParticipation();
		participation.setEvent(event);
		participation.setUser(user);
		eventParticipationRepository.save(participation);
	}

	public List<Long> getJoinedEventIds(String userEmail) {
		User user = userRepository.findByEmail(userEmail)
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Authenticated user not found"));

		return eventParticipationRepository.findJoinedEventIdsByUserId(user.getId());
	}

}
