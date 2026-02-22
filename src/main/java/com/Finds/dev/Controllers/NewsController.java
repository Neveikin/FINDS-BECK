package com.Finds.dev.Controllers;

import com.Finds.dev.Entity.News;
import com.Finds.dev.Repositories.NewsRepository;
import com.Finds.dev.Services.NewsService;
import jakarta.persistence.EntityNotFoundException;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/news")
@CrossOrigin(origins = "*", allowedHeaders = "*", methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.DELETE, RequestMethod.PATCH, RequestMethod.OPTIONS})
public class NewsController {

    private NewsRepository newsRepository;
    private NewsService newsService;

    public NewsController(NewsService newsService, NewsRepository newsRepository) {
        this.newsRepository = newsRepository;
        this.newsService = newsService;
    }

    @GetMapping("/get")
    public ResponseEntity<?> getNews() {
        return ResponseEntity.ok(newsService.getNews());
    }


    @PostMapping("/add")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> addNews(@Valid @RequestBody News news) {
        newsService.addNews(news);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/delete/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteNews(@PathVariable String id) {
        newsService.deleteNews(id);
        return ResponseEntity.ok().build();
    }


}
