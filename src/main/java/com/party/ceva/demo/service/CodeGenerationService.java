package com.party.ceva.demo.service;

import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.util.UUID;

@Service
public class CodeGenerationService {

	private static final String ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
	private final SecureRandom random = new SecureRandom();

	public String generateCode() {
		StringBuilder sb = new StringBuilder();
		for (int i = 0; i < 4; i++) {
			int randomIndex = random.nextInt(ALPHABET.length());
			sb.append(ALPHABET.charAt(randomIndex));
		}
		return sb.toString();
	}
}
