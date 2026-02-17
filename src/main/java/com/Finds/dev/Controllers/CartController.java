package com.Finds.dev.Controllers;

import com.Finds.dev.Entity.Cart;
import com.Finds.dev.Repositories.CartItemRepository;
import com.Finds.dev.Repositories.CartRepository;
import com.Finds.dev.Services.CartService;
import com.Finds.dev.Services.UserService;
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
        try {
            return ResponseEntity.ok(cartService.getUserCart());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e);
        }
    }

    @PatchMapping("/addItems/{productId}")
    public ResponseEntity<?> addItems(@PathVariable String productId) {
        try {

            cartService.addItems(userService.getCurrentUser().getCart(), productId);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e);
        }
    }

    @PatchMapping("/decrease/{productId}")
    public ResponseEntity<?> decreaseItem(@PathVariable String productId) {
        try {
            cartService.minusItem(userService.getCurrentUser().getCart(), productId);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e);
        }
    }

    @DeleteMapping("/delete/{productId}")
    public ResponseEntity<?> deleteItem(@PathVariable String productId) {
        try {
            cartService.deleteItem(userService.getCurrentUser().getCart(), productId);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e);
        }
    }
}
