package com.party.ceva.demo.repository;

import java.time.LocalDateTime;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Repository;

import com.party.ceva.demo.model.Event;

import org.springframework.data.jpa.repository.JpaRepository;

@Repository
public interface EventRepository extends JpaRepository<Event, Long> {
    Page<Event> findByStartTimeBetween(LocalDateTime startTime, LocalDateTime endTime, Pageable pageable);
    Page<Event> findByEndTimeGreaterThanEqual(LocalDateTime threshold, Pageable pageable);
}
