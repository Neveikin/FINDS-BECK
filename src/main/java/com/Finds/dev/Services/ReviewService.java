package com.Finds.dev.Services;

import com.Finds.dev.DTO.Products.RewiewDTO;
import com.Finds.dev.Entity.Review;
import com.Finds.dev.Repositories.ProductRepository;
import com.Finds.dev.Repositories.ReviewRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ReviewService {
    @Autowired
    ReviewRepository reviewRepository;

    @Autowired
    UserService userService;

    @Autowired
    ProductRepository productRepository;

    public List<Review> getProductsReview(String productId) {
        return reviewRepository.findByProductId(productId);
    }

    public void addReview(RewiewDTO rewiewDTO, String productId) {
        Review review = new Review(userService.getCurrentUser(), productRepository.findById(productId).get(), rewiewDTO.overall(), rewiewDTO.text());
        reviewRepository.save(review);
    }


}
