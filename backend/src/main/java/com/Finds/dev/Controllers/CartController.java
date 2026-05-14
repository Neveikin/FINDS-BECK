package com.Finds.dev.Controllers;

import com.Finds.dev.DTO.Cart.CartLineRequest;
import com.Finds.dev.Entity.Cart;
import com.Finds.dev.Services.CartService;
import com.Finds.dev.Services.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/cart")
@CrossOrigin(origins = "*", allowedHeaders = "*", methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.DELETE, RequestMethod.PATCH, RequestMethod.OPTIONS})

public class CartController {

    private final UserService userService;
    private final CartService cartService;

    public CartController(UserService userService, CartService cartService) {
        this.userService = userService;
        this.cartService = cartService;
    }

    @GetMapping("/get")
    public ResponseEntity<?> getUserCart() {
        return ResponseEntity.ok(cartService.getUserCart());
    }

    @PatchMapping("/add")
    public ResponseEntity<?> addLine(@RequestBody CartLineRequest req) {
        var user = userService.getCurrentUser();
        Cart cart = cartService.getOrCreateCart(user);
        cartService.addItems(cart, req.productId(), req.size(), req.color());
        return ResponseEntity.ok().build();
    }

    @PatchMapping("/decrease")
    public ResponseEntity<?> decreaseLine(@RequestBody CartLineRequest req) {
        Cart cart = cartService.getOrCreateCart(userService.getCurrentUser());
        cartService.minusItem(cart, req.productId(), req.size(), req.color());
        return ResponseEntity.ok().build();
    }

    @PostMapping("/remove")
    public ResponseEntity<?> removeLine(@RequestBody CartLineRequest req) {
        Cart cart = cartService.getOrCreateCart(userService.getCurrentUser());
        cartService.deleteItem(cart, req.productId(), req.size(), req.color());
        return ResponseEntity.ok().build();
    }
}
