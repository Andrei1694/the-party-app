package com.party.ceva.demo.model;

import java.time.LocalDate;
import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonBackReference;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "user_profile")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserProfile {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;
	private String cnp;
	private char sex;
	private String firstName;
	private String lastName;
	private String telefon; // Renamed from phoneNumber
	private LocalDate dateOfBirth; // Changed from LocalDateTime to LocalDate
	private String address; // Added field
	private String profilePictureUrl; // Added field
	private String bio; // Added field
	private LocalDateTime createdAt;
	private LocalDateTime updatedAt;
	@OneToOne(mappedBy = "userProfile")
	@JsonBackReference
	private User user;
}
