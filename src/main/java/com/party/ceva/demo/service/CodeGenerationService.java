package com.party.ceva.demo.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;

@Service
public class CodeGenerationService {

	private static final Logger logger = LoggerFactory.getLogger(CodeGenerationService.class);
	private static final String ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
	private final SecureRandom random = new SecureRandom();

	public String generateCode() {
		StringBuilder sb = new StringBuilder();
		for (int i = 0; i < 4; i++) {
			int randomIndex = random.nextInt(ALPHABET.length());
			sb.append(ALPHABET.charAt(randomIndex));
		}
		logger.debug("Generated new short code");
		return sb.toString();
	}
}
