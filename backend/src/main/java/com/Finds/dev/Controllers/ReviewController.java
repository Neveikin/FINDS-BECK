package com.Finds.dev.Controllers;

import com.Finds.dev.DTO.Products.RewiewDTO;
import com.Finds.dev.DTO.Review.RewievUpdDTO;
import com.Finds.dev.Entity.Review;
import com.Finds.dev.Repositories.ReviewRepository;
import com.Finds.dev.Services.ReviewService;
import jakarta.persistence.EntityNotFoundException;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
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
        return ResponseEntity.ok(reviewService.getProductsReview(productId));
    }

    @PreAuthorize("isAuthenticated()")
    @PostMapping("/add/{productId}")
    public ResponseEntity<?> addReview(@RequestBody @Valid RewiewDTO rewiewDTO, @PathVariable String productId) {
        reviewService.addReview(rewiewDTO,productId);
        return ResponseEntity.ok().build();
    }

    @PreAuthorize("hasRole('ADMIN') or @reviewService.isReviewOwner(#rewievUpdDTO.reviewId, authentication.name)")
    @PutMapping("/upd/{ReviewId}")
    public ResponseEntity<?> updReview(@RequestBody @Valid RewievUpdDTO rewievUpdDTO) {
        reviewService.updReview(rewievUpdDTO);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/delete/{reviewId}")
    @PreAuthorize("hasRole('ADMIN') or @reviewService.isReviewOwner(#reviewId, authentication.name)")
    public ResponseEntity<?> deleteReview(@PathVariable String reviewId) {
        reviewRepository.deleteById(reviewId);
        return ResponseEntity.ok().build();
    }
}

