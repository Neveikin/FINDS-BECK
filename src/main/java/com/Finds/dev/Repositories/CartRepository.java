package com.Finds.dev.Repositories;

import com.Finds.dev.Entity.Cart;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface CartRepository extends JpaRepository<Cart, String> {
    
    Optional<Cart> findByUserId(String userId);
    
    boolean existsByUserId(String userId);
}
