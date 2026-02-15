package com.party.ceva.demo.dto;

import java.io.Serializable;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserDto implements Serializable {
	private Long id;
	private String email;
	private String password;
	private UserProfileDto userProfile;
}
