package com.Finds.dev.Services;

import com.Finds.dev.Entity.Cart;
import com.Finds.dev.Entity.CartItem;
import com.Finds.dev.Repositories.CartItemRepository;
import com.Finds.dev.Repositories.CartRepository;
import com.Finds.dev.Repositories.ProductRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class CartService {

    @Autowired
    CartRepository cartRepository;

    @Autowired
    CartItemRepository cartItemRepository;

    @Autowired
    UserService userService;

    @Autowired
    ProductRepository productRepository;

    public List getUserCart() {
        Cart cart = cartRepository.findByUserId(userService.getCurrentUserId())
                .orElseThrow(() -> new EntityNotFoundException("Cart not found"));
        return cart.getItems();
    }

    @Transactional(isolation = Isolation.SERIALIZABLE)
    public void addItems(Cart cart, String productId) {
        Integer count = cartItemRepository.getQuantityByCartIdAndProductId(cart.getId(), productId);
        if (count != null) {
            cartItemRepository.updateQuantity(cart.getId(),
                    productId,
                    count + 1);
        } else {
            CartItem cartItem = new CartItem(cart,
                    productRepository.findById(productId)
                            .orElseThrow(() -> new EntityNotFoundException("Product not found")),
                    1);
            cartItemRepository.save(cartItem);
        }
    }

    public void deleteItem(Cart cart, String productId) {
        cartItemRepository.deleteByCartIdAndProductId(cart.getId(), productId);
    }


    public void minusItem(Cart cart, String productId) {
        cartItemRepository.decreaseQuantity(cart.getId(), productId);
        Integer count = cartItemRepository.getQuantityByCartIdAndProductId(cart.getId(), productId);
        if (count == 0) {
            cartItemRepository.deleteByCartIdAndProductId(cart.getId(), productId);
        }
    }


}
