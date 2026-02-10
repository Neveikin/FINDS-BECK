package com.Finds.dev.Controllers;

import com.Finds.dev.Entity.Shop;
import com.Finds.dev.Entity.User;
import com.Finds.dev.Repositories.ShopRepository;
import com.Finds.dev.Repositories.UserRepository;
import com.Finds.dev.Services.ShopService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;


@RestController
@RequestMapping("/api/shops")
@CrossOrigin(origins = "*", allowedHeaders = "*", methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.DELETE, RequestMethod.PATCH, RequestMethod.OPTIONS})
public class ShopController {

    ShopRepository shopRepository;
    UserRepository userRepository;
    ShopService shopService;

    @Autowired
    public ShopController(ShopRepository shopRepository, UserRepository userRepository, ShopService shopService) {
        this.shopRepository = shopRepository;
        this.userRepository = userRepository;
        this.shopService =shopService;
    }

    @GetMapping
    public ResponseEntity<?> getShops() {
        try {
            return ResponseEntity.ok(shopRepository.findAll());
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getsShopbyId(@PathVariable String id) {
        try {
            return ResponseEntity.ok(shopRepository.findById(id));
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping("/add")
    @PreAuthorize("hasAnyRole('ADMIN')")
    public ResponseEntity<?> addShop(@RequestBody Shop shop) {
        try {
            return ResponseEntity.ok(shopRepository.save(shop));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("{\"error\": \"" + e.getMessage() + "\"}");
        }
    }

    @DeleteMapping("/delete/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteShop(@PathVariable String id) {
        try {
            shopRepository.deleteById(id);
            return ResponseEntity.ok("Магазин удален");
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PutMapping("/update/{id}")
    @PreAuthorize("hasAnyRole('ADMIN'")
    public ResponseEntity<?> updateShop(@PathVariable String id, @RequestBody Shop shop) {
        try {
            Shop existingShop = shopRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Shop not found"));
            
            existingShop.setName(shop.getName());
            existingShop.setDescription(shop.getDescription());
            existingShop.setLogoUrl(shop.getLogoUrl());
            
            return ResponseEntity.ok(shopRepository.save(existingShop));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("{\"error\": \"" + e.getMessage() + "\"}");
        }
    }

    @PostMapping("/{shopId}/add-owner")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> addOwner(@PathVariable String shopId, @RequestBody Map<String, String> request) {
        try {
            Shop shop = shopRepository.findById(shopId)
                    .orElseThrow(() -> new RuntimeException("Shop not found"));
            
            User user = userRepository.findByEmail(request.get("email"))
                    .orElseThrow(() -> new RuntimeException("User not found"));
            
            if (!shop.getOwners().contains(user)) {
                shop.getOwners().add(user);
            }
            
            return ResponseEntity.ok(shopRepository.save(shop));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("{\"error\": \"" + e.getMessage() + "\"}");
        }
    }
}
