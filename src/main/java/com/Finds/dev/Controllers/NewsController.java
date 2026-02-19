package com.Finds.dev.Controllers;

import com.Finds.dev.Entity.News;
import com.Finds.dev.Repositories.NewsRepository;
import com.Finds.dev.Services.NewsService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
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
        try {
            return ResponseEntity.ok(newsService.getNews());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e);
        }
    }

    @PostMapping("/add")
    public ResponseEntity<?> addNews(@Valid @RequestBody News news) {
        try {
            newsService.addNews(news);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<?> deleteNews(@PathVariable String id) {
        try {
            newsService.deleteNews(id);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }


}
