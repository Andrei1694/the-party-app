package com.party.ceva.demo.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserProfileDto {
	private Long id;
	private String cnp;
	private Character sex;
	private String firstName;
	private String lastName;
	private String telefon;
	private LocalDate dateOfBirth;
	private String address; // Added field
	private String profilePictureUrl; // Added field
	private String bio; // Added field
	private LocalDateTime createdAt;
	private LocalDateTime updatedAt;
}
