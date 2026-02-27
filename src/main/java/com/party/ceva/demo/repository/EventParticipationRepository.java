package com.party.ceva.demo.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.party.ceva.demo.model.EventParticipation;

@Repository
public interface EventParticipationRepository extends JpaRepository<EventParticipation, Long> {
	boolean existsByEvent_IdAndUser_Id(Long eventId, Long userId);

	@Query("select ep.event.id from EventParticipation ep where ep.user.id = :userId order by ep.event.id")
	List<Long> findJoinedEventIdsByUserId(Long userId);
}
