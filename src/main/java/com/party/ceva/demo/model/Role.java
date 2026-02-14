package com.party.ceva.demo.model;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne; // Changed from ManyToMany
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "roles")
public class Role {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;
	@Enumerated(EnumType.STRING)
	@Column(name = "role_type") // Renamed column
	private RoleTypes role;
	private LocalDateTime createdAt;
	private LocalDateTime updatedAt;
	private LocalDateTime startDate;
	private LocalDateTime endDate;

	@ManyToOne(fetch = FetchType.LAZY) // Changed from ManyToMany
	@JoinColumn(name = "user_id")
	private User user;
}
