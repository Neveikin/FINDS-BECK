package com.Finds.dev.Repositories;

import com.Finds.dev.Entity.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReviewRepository extends JpaRepository<Review,String> {

    List<Review> findByProductId(String productId);
    
    @Query("UPDATE Review r SET r.overall = :overall, r.text = :text WHERE r.id = :reviewId")
    @Modifying
    void updateReview(@Param("reviewId") String reviewId, 
                     @Param("overall") int overall, 
                     @Param("text") String text);
}
