package com.Finds.dev.Controllers;

import com.Finds.dev.DTO.Products.RewiewDTO;
import com.Finds.dev.Entity.Review;
import com.Finds.dev.Repositories.ReviewRepository;
import com.Finds.dev.Services.ReviewService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/review")
public class ReviewController {

    private ReviewRepository reviewRepository;
    private ReviewService reviewService;

    public ReviewController (ReviewService reviewService, ReviewRepository reviewRepository) {
        this.reviewService = reviewService;
        this.reviewRepository = reviewRepository;
    }

    @GetMapping("/get/{productId}")
    public ResponseEntity<?> getProductReviews(@PathVariable String productId) {
        try {
            return ResponseEntity.ok(reviewService.getProductsReview(productId));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e);
        }
    }

    @PostMapping("/add/{productId}")
    public ResponseEntity<?> addReview(@RequestBody RewiewDTO rewiewDTO, @PathVariable String productId) {
        try {
            reviewService.addReview(rewiewDTO,productId);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

}
