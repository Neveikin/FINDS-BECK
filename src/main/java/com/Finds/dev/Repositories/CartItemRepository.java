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
    Optional<CartItem> findByCartIdAndProductId(String cartId, String productId);
    
    boolean existsByCartIdAndProductId(String cartId, String productId);
    
    @Query("SELECT ci.quantity FROM CartItem ci WHERE ci.cart.id = :cartId AND ci.product.id = :productId")
    Integer getQuantityByCartIdAndProductId(@Param("cartId") String cartId, @Param("productId") String productId);
    
    @Query("UPDATE CartItem ci SET ci.quantity = :quantity WHERE ci.cart.id = :cartId AND ci.product.id = :productId")
    void updateQuantity(@Param("cartId") String cartId, @Param("productId") String productId, @Param("quantity") Integer quantity);
    
    @Modifying
    @Query("DELETE FROM CartItem ci WHERE ci.cart.id = :cartId AND ci.product.id = :productId")
    void deleteByCartIdAndProductId(@Param("cartId") String cartId, @Param("productId") String productId);
    
    @Modifying
    @Query("UPDATE CartItem ci SET ci.quantity = ci.quantity - 1 WHERE ci.cart.id = :cartId AND ci.product.id = :productId AND ci.quantity > 0")
    int decreaseQuantity(@Param("cartId") String cartId, @Param("productId") String productId);
}
