package com.party.ceva.demo.model;

import java.time.LocalDateTime;

import org.hibernate.annotations.CreationTimestamp;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(
	name = "event_participations",
	uniqueConstraints = @UniqueConstraint(name = "uk_event_user_participation", columnNames = { "event_id", "user_id" }),
	indexes = {
		@Index(name = "idx_event_participation_event", columnList = "event_id"),
		@Index(name = "idx_event_participation_user", columnList = "user_id")
	}
)
@Data
@NoArgsConstructor
@AllArgsConstructor
public class EventParticipation {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "event_id", nullable = false)
	private Event event;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "user_id", nullable = false)
	private User user;

	@CreationTimestamp
	@Column(nullable = false, updatable = false)
	private LocalDateTime joinedAt;
}
