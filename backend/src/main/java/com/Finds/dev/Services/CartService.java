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

    /** Корзина в БД может ещё не существовать — создаём так же, как для GET /cart/get */
    public Cart getOrCreateCart(User user) {
        return cartRepository.findByUserId(user.getId())
                .orElseGet(() -> {
                    Cart newCart = new Cart();
                    newCart.setUser(user);
                    return cartRepository.save(newCart);
                });
    }

    public List getUserCart() {
        Cart cart = getOrCreateCart(userService.getCurrentUser());
        return cart.getItems();
    }

    @Transactional(isolation = Isolation.SERIALIZABLE)
    public void addItems(Cart cart, String productId, String size, String color) {
        String s = CartItem.CartItemId.normalize(size);
        String c = CartItem.CartItemId.normalize(color);
        var existing = cartItemRepository.findLine(cart.getId(), productId, s, c);
        if (existing.isPresent()) {
            CartItem ci = existing.get();
            ci.setQuantity(ci.getQuantity() + 1);
            cartItemRepository.save(ci);
        } else {
            CartItem cartItem = new CartItem(cart,
                    productRepository.findById(productId)
                            .orElseThrow(() -> new EntityNotFoundException("Product not found")),
                    s, c, 1);
            cartItemRepository.save(cartItem);
        }
    }

    @Transactional(isolation = Isolation.SERIALIZABLE)
    public void minusItem(Cart cart, String productId, String size, String color) {
        String s = CartItem.CartItemId.normalize(size);
        String c = CartItem.CartItemId.normalize(color);
        cartItemRepository.findLine(cart.getId(), productId, s, c).ifPresent(ci -> {
            int q = ci.getQuantity() - 1;
            if (q <= 0) {
                cartItemRepository.delete(ci);
            } else {
                ci.setQuantity(q);
                cartItemRepository.save(ci);
            }
        });
    }

    public void deleteItem(Cart cart, String productId, String size, String color) {
        String s = CartItem.CartItemId.normalize(size);
        String c = CartItem.CartItemId.normalize(color);
        cartItemRepository.findLine(cart.getId(), productId, s, c).ifPresent(cartItemRepository::delete);
    }


}
