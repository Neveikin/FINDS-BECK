package com.Finds.dev.Controllers;

import com.Finds.dev.Entity.Cart;
import com.Finds.dev.Repositories.CartItemRepository;
import com.Finds.dev.Repositories.CartRepository;
import com.Finds.dev.Services.CartService;
import com.Finds.dev.Services.UserService;
import jakarta.persistence.EntityNotFoundException;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/cart")
@CrossOrigin(origins = "*", allowedHeaders = "*", methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.DELETE, RequestMethod.PATCH, RequestMethod.OPTIONS})

public class CartController {

    private UserService userService;
    private CartService cartService;
    private CartItemRepository cartItemRepository;
    private CartRepository cartRepository;

    public CartController(UserService userService ,CartRepository cartRepository, CartItemRepository cartItemRepository, CartService cartService) {
        this.cartRepository = cartRepository;
        this.cartItemRepository = cartItemRepository;
        this.cartService = cartService;
        this.userService = userService;
    }

    @GetMapping("/get")
    public ResponseEntity<?> getUserCart() {
        return ResponseEntity.ok(cartService.getUserCart());
    }

    @PatchMapping("/addItems/{productId}")
    public ResponseEntity<?> addItems(@PathVariable String productId) {
        cartService.addItems(userService.getCurrentUser().getCart(), productId);
        return ResponseEntity.ok().build();
    }

    @PatchMapping("/decrease/{productId}")
    public ResponseEntity<?> decreaseItem(@PathVariable String productId) {
        cartService.minusItem(userService.getCurrentUser().getCart(), productId);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/delete/{productId}")
    public ResponseEntity<?> deleteItem(@PathVariable String productId) {
        cartService.deleteItem(userService.getCurrentUser().getCart(), productId);
        return ResponseEntity.ok().build();
    }
}
