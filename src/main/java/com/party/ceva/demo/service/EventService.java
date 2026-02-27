package com.party.ceva.demo.service;

import java.time.LocalDateTime;

import org.modelmapper.ModelMapper;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import com.party.ceva.demo.dto.EventDto;
import com.party.ceva.demo.model.Event;
import com.party.ceva.demo.repository.EventRepository;

@Service
public class EventService {
	private final EventRepository eventRepository;
	private final ModelMapper modelMapper;

	public EventService(EventRepository eventRepository, ModelMapper modelMapper) {
		this.eventRepository = eventRepository;
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

}
