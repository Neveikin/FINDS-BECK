package com.Finds.dev.Services;

import com.Finds.dev.Entity.Cart;
import com.Finds.dev.Entity.CartItem;
import com.Finds.dev.Repositories.CartItemRepository;
import com.Finds.dev.Repositories.CartRepository;
import com.Finds.dev.Repositories.ProductRepository;
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

    public List getUserCart() throws Exception {
        try {
            Cart cart = cartRepository.findByUserId(userService.getCurrentUserId()).get();
            return cart.getItems();

        } catch (Exception e) {
            throw new Exception(e);
        }
    }

    @Transactional(isolation = Isolation.SERIALIZABLE)
    public void addItems(Cart cart, String productId) throws Exception {
        try {
            Integer count = cartItemRepository.getQuantityByCartIdAndProductId(cart.getId(), productId);
            if (count != null) {
                cartItemRepository.updateQuantity(cart.getId(),
                        productId,
                        count + 1);
            } else {
                CartItem cartItem = new CartItem(cart,
                        productRepository.findById(productId).get(),
                        1);
                cartItemRepository.save(cartItem);
            }
        } catch (Exception e) {
            throw new Exception(e);
        }
    }

    public void deleteItem(Cart cart, String productId) throws Exception {
        try {
            cartItemRepository.deleteByCartIdAndProductId(cart.getId(), productId);
        } catch (Exception e) {
            throw new Exception(e);
        }
    }


    public void minusItem(Cart cart, String productId) throws Exception {
        try {
            cartItemRepository.decreaseQuantity(cart.getId(), productId);
            Integer count = cartItemRepository.getQuantityByCartIdAndProductId(cart.getId(), productId);
            if (count == 0) {
                cartItemRepository.deleteByCartIdAndProductId(cart.getId(), productId);
            }
        } catch (Exception e) {
            throw new Exception(e);
        }
    }


}
