package com.Finds.dev.Repositories;

import com.Finds.dev.Entity.Favorite;
import com.Finds.dev.Entity.User;
import com.Finds.dev.Entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FavoriteRepository extends JpaRepository<Favorite, String> {
    
    List<Favorite> findByUserId(String userId);
    
    Optional<Favorite> findByUserIdAndProductId(String userId, String productId);

    @Modifying
    @Query("DELETE FROM Favorite f WHERE f.user.id = :userId AND f.product.id = :productId")
    void deleteByUserIdAndProductId(@Param("userId") String userId, @Param("productId") String productId);
    
}
