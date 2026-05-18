package com.Finds.dev.Services;

import com.Finds.dev.Entity.Cart;
import com.Finds.dev.Entity.CartItem;
import com.Finds.dev.Entity.User;
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

    private Cart getOrCreateCart(User user) {
        return cartRepository.findByUserId(user.getId())
                .orElseGet(() -> {
                    Cart newCart = new Cart();
                    newCart.setUser(user);
                    return cartRepository.save(newCart);
                });
    }

    public List getUserCart() {
        User user = userService.getCurrentUser();
        Cart cart = getOrCreateCart(user);
        return cart.getItems();
    }

    @Transactional(isolation = Isolation.SERIALIZABLE)
    public void addItems(User user, String productId, String size, String color) {
        Cart cart = getOrCreateCart(user);
        Integer count = cartItemRepository.getQuantityByCartIdAndProductIdAndSizeAndColor(cart.getId(), productId, size, color);
        if (count != null) {
            cartItemRepository.updateQuantity(cart.getId(),
                    productId, size, color,
                    count + 1);
        } else {
            CartItem cartItem = new CartItem(cart,
                    productRepository.findById(productId)
                            .orElseThrow(() -> new EntityNotFoundException("Product not found")),
                    1, size, color);
            cartItemRepository.save(cartItem);
        }
    }

    @Transactional
    public void deleteItem(User user, String productId, String size, String color) {
        Cart cart = getOrCreateCart(user);
        cartItemRepository.deleteByCartIdAndProductIdAndSizeAndColor(cart.getId(), productId, size, color);
    }

    @Transactional
    public void minusItem(User user, String productId, String size, String color) {
        Cart cart = getOrCreateCart(user);
        cartItemRepository.decreaseQuantity(cart.getId(), productId, size, color);
        Integer count = cartItemRepository.getQuantityByCartIdAndProductIdAndSizeAndColor(cart.getId(), productId, size, color);
        if (count != null && count == 0) {
            cartItemRepository.deleteByCartIdAndProductIdAndSizeAndColor(cart.getId(), productId, size, color);
        }
    }


}
