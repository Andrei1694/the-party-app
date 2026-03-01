package com.party.ceva.demo.dto;

import java.io.Serializable;
import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class EventDto implements Serializable {
	private static final long serialVersionUID = 1L;

	private Long id;
	private String name;
	private LocalDateTime startTime;
	private LocalDateTime endTime;
	private String description;
	private String location;
}
