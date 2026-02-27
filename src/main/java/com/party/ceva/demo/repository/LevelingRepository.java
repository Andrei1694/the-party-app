package com.party.ceva.demo.repository;

import com.party.ceva.demo.model.Level;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface LevelingRepository extends JpaRepository<Level, Long> {
}
