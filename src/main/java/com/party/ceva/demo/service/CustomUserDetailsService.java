package com.party.ceva.demo.service;

import com.party.ceva.demo.model.User;
import com.party.ceva.demo.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import java.util.Collections;

@Service
public class CustomUserDetailsService implements UserDetailsService {
    private static final Logger logger = LoggerFactory.getLogger(CustomUserDetailsService.class);

    private final UserRepository userRepository;

    public CustomUserDetailsService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        logger.debug("Loading Spring Security user by email {}", maskEmail(email));
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> {
                    logger.warn("Security user lookup failed for {}", maskEmail(email));
                    return new UsernameNotFoundException("User not found with email: " + email);
                });

        logger.debug("Loaded Spring Security user {}", user.getId());
        return new org.springframework.security.core.userdetails.User(user.getEmail(), user.getPassword(), Collections.emptyList());
    }

    private String maskEmail(String email) {
        if (email == null || email.isBlank()) {
            return "<empty>";
        }
        int atIndex = email.indexOf('@');
        if (atIndex <= 1) {
            return "***";
        }
        return email.charAt(0) + "***" + email.substring(atIndex);
    }
}
