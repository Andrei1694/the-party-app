package com.party.ceva.demo.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.party.ceva.demo.model.Level;
import com.party.ceva.demo.model.User;
import com.party.ceva.demo.repository.UserRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
@RequiredArgsConstructor
public class LevelingSystemService {

    private final UserRepository userRepository;

    public Level getLevelByUserId(Long id) {
        log.debug("Getting level for user {}", id);
        User user = userRepository.findById(id)
            .orElseThrow(() -> {
                log.warn("Get level rejected: user {} not found", id);
                return new RuntimeException("User not found with id: " + id);
            });

        Level level = user.getLevel();
        if (level == null) {
            level = new Level();
        }
        return level;
    }

    @Transactional
    public int addXpToUser(Long id, int xpToAdd) {
        if (xpToAdd <= 0) {
            throw new IllegalArgumentException("XP to add must be positive");
        }

        log.info("Adding {} XP to user {}", xpToAdd, id);
        User user = userRepository.findById(id)
            .orElseThrow(() -> {
                log.warn("Add XP rejected: user {} not found", id);
                return new RuntimeException("User not found with id: " + id);
            });
    
        Level level = user.getLevel();
        if (level == null) {
            level = new Level();
            user.setLevel(level);
        }

        long currentXP = level.getCurrentXP() + xpToAdd;
        int currentLevel = level.getCurrentLevel();

        // Level up logic: can handle multiple level-ups at once
        while (currentXP >= level.getNextLevelXP()) {
            currentXP -= level.getNextLevelXP();
            currentLevel++;
            
            // We set the level temporarily to trigger nextLevelXP update in Level entity
            level.setCurrentLevel(currentLevel);
            log.info("User {} leveled up to {}", id, currentLevel);
        }

        level.setCurrentXP(currentXP);
        level.setCurrentLevel(currentLevel); // Ensures sync and calculation
        
        userRepository.save(user);
        return level.getCurrentLevel();
    }
}
