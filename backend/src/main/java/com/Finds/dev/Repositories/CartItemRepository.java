package com.Finds.dev.Repositories;

import com.Finds.dev.Entity.CartItem;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CartItemRepository extends JpaRepository<CartItem, com.Finds.dev.Entity.CartItem.CartItemId> {
    
    List<CartItem> findByCartId(String cartId);
    
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    Optional<CartItem> findByCartIdAndProductIdAndSizeAndColor(String cartId, String productId, String size, String color);
    
    boolean existsByCartIdAndProductIdAndSizeAndColor(String cartId, String productId, String size, String color);
    
    @Query("SELECT ci.quantity FROM CartItem ci WHERE ci.cart.id = :cartId AND ci.product.id = :productId AND (:size IS NULL OR ci.size = :size) AND (:color IS NULL OR ci.color = :color)")
    Integer getQuantityByCartIdAndProductIdAndSizeAndColor(@Param("cartId") String cartId, @Param("productId") String productId, @Param("size") String size, @Param("color") String color);
    
    @Modifying
    @Query("UPDATE CartItem ci SET ci.quantity = :quantity WHERE ci.cart.id = :cartId AND ci.product.id = :productId AND (:size IS NULL OR ci.size = :size) AND (:color IS NULL OR ci.color = :color)")
    void updateQuantity(@Param("cartId") String cartId, @Param("productId") String productId, @Param("size") String size, @Param("color") String color, @Param("quantity") Integer quantity);
    
    @Modifying
    @Query("DELETE FROM CartItem ci WHERE ci.cart.id = :cartId AND ci.product.id = :productId AND (:size IS NULL OR ci.size = :size) AND (:color IS NULL OR ci.color = :color)")
    void deleteByCartIdAndProductIdAndSizeAndColor(@Param("cartId") String cartId, @Param("productId") String productId, @Param("size") String size, @Param("color") String color);
    
    @Modifying
    @Query("UPDATE CartItem ci SET ci.quantity = ci.quantity - 1 WHERE ci.cart.id = :cartId AND ci.product.id = :productId AND (:size IS NULL OR ci.size = :size) AND (:color IS NULL OR ci.color = :color) AND ci.quantity > 0")
    int decreaseQuantity(@Param("cartId") String cartId, @Param("productId") String productId, @Param("size") String size, @Param("color") String color);
}
