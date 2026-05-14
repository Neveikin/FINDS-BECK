package com.Finds.dev.Repositories;

import com.Finds.dev.Entity.CartItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CartItemRepository extends JpaRepository<CartItem, CartItem.CartItemId> {

    List<CartItem> findByCartId(String cartId);

    @Query("SELECT ci FROM CartItem ci WHERE ci.cart.id = :cartId AND ci.product.id = :productId "
            + "AND ci.id.sizeCode = :sizeCode AND ci.id.color = :color")
    Optional<CartItem> findLine(@Param("cartId") String cartId,
                                @Param("productId") String productId,
                                @Param("sizeCode") String sizeCode,
                                @Param("color") String color);
}
