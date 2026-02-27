package com.party.ceva.demo.model;

import com.fasterxml.jackson.annotation.JsonBackReference;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToOne;
import jakarta.persistence.PostLoad;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "level")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class Level {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(mappedBy = "level")
    @JsonBackReference
    private User user;
    
    @Column(nullable = false, columnDefinition = "int default 1")
    private int currentLevel = 1;
    
    @Column(nullable = false, columnDefinition = "bigint default 0")
    private long currentXP = 0;
    
    @Column(nullable = false, columnDefinition = "bigint default 100")
    private long nextLevelXP = 100;

    // Overwrite the Lombok setter to ensure 1 is the minimum and it recalculates XP
    public void setCurrentLevel(int currentLevel) {
        this.currentLevel = Math.max(1, currentLevel);
        calculateNextLevelXP();
    }

    // Ensures level is never 0 and recalculates whenever the object is loaded or before saving
    @PrePersist
    @PreUpdate
    @PostLoad
    public void syncLevelData() {
        if (this.currentLevel < 1) {
            this.currentLevel = 1;
        }
        calculateNextLevelXP();
    }

    private void calculateNextLevelXP() {
        this.nextLevelXP = (long) (100 * Math.pow(this.currentLevel, 1.5));
    }
}
