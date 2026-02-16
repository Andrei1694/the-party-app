package com.party.ceva.demo.service;

import java.util.Optional;

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
	private final NewsRepository newsRepository;

	public NewsService(NewsRepository newsRepository) {
		this.newsRepository = newsRepository;
	}

	@CacheEvict(value = { "news", "news-pages" }, allEntries = true)
	public News createNews(CreateNewsRequest newsRequest) {
		News news = new News();
		news.setTitle(newsRequest.getTitle());
		news.setContent(newsRequest.getContent());
		return this.newsRepository.save(news);
	}

	@Cacheable(
			value = "news-pages",
			key = "#pageable.pageNumber + '-' + #pageable.pageSize + '-' + #pageable.sort.toString()")
	public Page<News> findAllNews(Pageable pageable) {
		return this.newsRepository.findAll(pageable);
	}

	@Cacheable(value = "news", key = "#id")
	public Optional<News> findNewsById(Long id) {
		return newsRepository.findById(id);
	}

}
