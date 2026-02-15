package com.party.ceva.demo.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.party.ceva.demo.model.News;

public interface NewsRepository extends JpaRepository<News,Long> {
    
}
