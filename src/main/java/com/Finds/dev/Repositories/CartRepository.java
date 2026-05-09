package com.Finds.dev.Repositories;

import com.Finds.dev.Entity.Cart;
import com.Finds.dev.Entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface CartRepository extends JpaRepository<Cart, String> {
    
    Optional<Cart> findByUserId(String userId);
    
    Optional<Cart> findByUser(User user);
    
    boolean existsByUserId(String userId);
    
    boolean existsByUser(User user);
}
