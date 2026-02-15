package com.party.ceva.demo;

import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.context.annotation.Bean;
import org.springframework.security.crypto.password.PasswordEncoder;

@EnableCaching
@SpringBootApplication
public class DemoApplication {

	public static void main(String[] args) {
		SpringApplication.run(DemoApplication.class, args);
	}

	@Bean
	public CommandLineRunner passwordEncoderLogger(PasswordEncoder passwordEncoder) {
		return args -> {
			String encodedPassword = passwordEncoder.encode("password");
			System.out.println("Encoded password for 'password': " + encodedPassword);
		};
	}
}
