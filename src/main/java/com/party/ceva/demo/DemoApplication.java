package com.party.ceva.demo;

import java.util.List;

import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.context.annotation.Bean;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.party.ceva.demo.model.News;
import com.party.ceva.demo.repository.NewsRepository;

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

	@Bean
	public CommandLineRunner newsSeeder(NewsRepository newsRepository) {
		return args -> {
			if (newsRepository.count() > 0) {
				return;
			}

			newsRepository.saveAll(List.of(
					new News(null, "Spring Community Meetup Announced",
							"Our monthly community meetup is happening next Friday at 18:30 in the city hall. Join for talks, networking, and project demos."),
					new News(null, "Platform Maintenance Completed",
							"Scheduled backend maintenance finished successfully. API response times are now improved and all services are fully operational."),
					new News(null, "Volunteer Program Open",
							"We opened volunteer registrations for upcoming local events. Sign up from your profile page to help with logistics and coordination.")));
		};
	}
}
