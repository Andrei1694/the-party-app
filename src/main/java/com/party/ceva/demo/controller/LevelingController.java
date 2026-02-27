package com.party.ceva.demo.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.party.ceva.demo.dto.AddXpRequest;
import com.party.ceva.demo.dto.LevelDto;
import com.party.ceva.demo.dto.UserDto;
import com.party.ceva.demo.model.Level;
import com.party.ceva.demo.service.LevelingSystemService;
import com.party.ceva.demo.service.UserService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("api/users")
@RequiredArgsConstructor
@Slf4j
public class LevelingController {

    private final LevelingSystemService levelingSystemService;
    private final UserService userService;

    @GetMapping("/{id}/level")
    public ResponseEntity<LevelDto> getUserLevel(@PathVariable Long id) {
        try {
            Level level = levelingSystemService.getLevelByUserId(id);
            LevelDto dto = LevelDto.fromLevel(
                level.getCurrentLevel(),
                level.getCurrentXP(),
                level.getNextLevelXP()
            );
            return ResponseEntity.ok(dto);
        } catch (RuntimeException e) {
            log.warn("Failed to get level for user {}: {}", id, e.getMessage());
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping("/me/xp")
    public ResponseEntity<LevelDto> addXpToCurrentUser(@RequestBody AddXpRequest request) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || authentication instanceof AnonymousAuthenticationToken) {
            return ResponseEntity.status(401).build();
        }

        String userEmail;
        Object principal = authentication.getPrincipal();
        if (principal instanceof UserDetails userDetails) {
            userEmail = userDetails.getUsername();
        } else {
            userEmail = authentication.getName();
        }

        UserDto user = userService.findByEmail(userEmail)
            .orElse(null);

        if (user == null) {
            log.warn("Add XP rejected: authenticated user {} not found in database", userEmail);
            return ResponseEntity.status(401).build();
        }

        if (request.getReason() != null) {
            log.info("Adding {} XP to user {} (reason: {})", request.getAmount(), user.getId(), request.getReason());
        }

        try {
            levelingSystemService.addXpToUser(user.getId(), request.getAmount());
            Level updatedLevel = levelingSystemService.getLevelByUserId(user.getId());
            LevelDto dto = LevelDto.fromLevel(
                updatedLevel.getCurrentLevel(),
                updatedLevel.getCurrentXP(),
                updatedLevel.getNextLevelXP()
            );
            return ResponseEntity.ok(dto);
        } catch (IllegalArgumentException e) {
            log.warn("Add XP rejected for user {}: {}", user.getId(), e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }
}
