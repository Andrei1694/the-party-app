package com.party.ceva.demo.controller;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.party.ceva.demo.dto.CreateNewsRequest;
import com.party.ceva.demo.model.News;
import com.party.ceva.demo.service.NewsService;

@RestController
@RequestMapping("/api/news")
public class NewsController {

    private final NewsService newsService;

    public NewsController(NewsService newsService) {
        this.newsService = newsService;
    }

    @PostMapping
    public ResponseEntity<News> createNews(@RequestBody CreateNewsRequest createNewsRequest) {
        News createdNews = this.newsService.createNews(createNewsRequest);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdNews);
    }

    @GetMapping
    public Page<News> getAllNews(Pageable pageable) {
        return this.newsService.findAllNews(pageable);
    }
}
