package com.Finds.dev.Services;


import com.Finds.dev.Entity.News;
import com.Finds.dev.Repositories.NewsRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class NewsService {

    @Autowired
    NewsRepository newsRepository;

    public void deleteNews(String id) {
        newsRepository.deleteById(id);
    }

    public void addNews(News news) {
        newsRepository.save(news);
    }

    public News getNews() {
        return (News) newsRepository.findAll();
    }
}
