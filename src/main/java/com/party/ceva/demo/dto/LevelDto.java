package com.party.ceva.demo.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class LevelDto {
    private int currentLevel;
    private long currentXP;
    private long nextLevelXP;
    private int progressPercent;

    public static LevelDto fromLevel(int currentLevel, long currentXP, long nextLevelXP) {
        LevelDto dto = new LevelDto();
        dto.setCurrentLevel(currentLevel);
        dto.setCurrentXP(currentXP);
        dto.setNextLevelXP(nextLevelXP);
        dto.setProgressPercent(nextLevelXP > 0 ? (int) ((currentXP * 100) / nextLevelXP) : 0);
        return dto;
    }
}
