package com.party.ceva.demo.service;

import java.util.Optional;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import com.party.ceva.demo.dto.CreateNewsRequest;
import com.party.ceva.demo.model.News;
import com.party.ceva.demo.repository.NewsRepository;

@Service
public class NewsService {
	private static final Logger logger = LoggerFactory.getLogger(NewsService.class);

	private final NewsRepository newsRepository;

	public NewsService(NewsRepository newsRepository) {
		this.newsRepository = newsRepository;
	}

	@CacheEvict(value = { "news", "news-pages" }, allEntries = true)
	public News createNews(CreateNewsRequest newsRequest) {
		logger.info("Creating news article with title '{}'", newsRequest.getTitle());
		News news = new News();
		news.setTitle(newsRequest.getTitle());
		news.setContent(newsRequest.getContent());
		News savedNews = this.newsRepository.save(news);
		logger.info("Created news article with id {}", savedNews.getId());
		return savedNews;
	}

	@Cacheable(
			value = "news-pages",
			key = "#pageable.pageNumber + '-' + #pageable.pageSize + '-' + #pageable.sort.toString()")
	public Page<News> findAllNews(Pageable pageable) {
		logger.debug("Fetching news page: page={}, size={}, sort={}", pageable.getPageNumber(), pageable.getPageSize(),
				pageable.getSort());
		Page<News> newsPage = this.newsRepository.findAll(pageable);
		logger.debug("Fetched news page with {} elements (total={})", newsPage.getNumberOfElements(),
				newsPage.getTotalElements());
		return newsPage;
	}

	@Cacheable(value = "news", key = "#id")
	public Optional<News> findNewsById(Long id) {
		logger.debug("Finding news by id {}", id);
		Optional<News> news = newsRepository.findById(id);
		logger.debug("Find news by id {} -> found={}", id, news.isPresent());
		return news;
	}

}
