package com.Finds.dev.Controllers;

import com.Finds.dev.Entity.Shop;
import com.Finds.dev.Entity.User;
import com.Finds.dev.Repositories.ShopRepository;
import com.Finds.dev.Repositories.UserRepository;
import com.Finds.dev.Services.ShopService;
import jakarta.persistence.EntityNotFoundException;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
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
        return ResponseEntity.ok(shopService.getShops());
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getsShopbyId(@PathVariable String id) {
        return ResponseEntity.ok(shopRepository.findById(id));
    }

    @PostMapping("/add")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> addShop(@RequestBody @Valid Shop shop) {
        Shop savedShop = shopRepository.save(shop);
        
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Shop created successfully");
        response.put("data", Map.of(
            "shopId", savedShop.getId(),
            "shopName", savedShop.getName()
        ));
        
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/delete/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteShop(@PathVariable String id) {
        shopRepository.deleteById(id);
        
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Shop deleted successfully");
        response.put("data", Map.of(
            "shopId", id
        ));
        
        return ResponseEntity.ok(response);
    }

    @PutMapping("/update/{id}")
    @PreAuthorize("hasAnyRole('ADMIN')")
    public ResponseEntity<?> updateShop(@PathVariable String id, @RequestBody @Valid Shop shop) {
        Shop existingShop = shopRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Shop not found"));
        
        existingShop.setName(shop.getName());
        existingShop.setDescription(shop.getDescription());
        existingShop.setLogoUrl(shop.getLogoUrl());
        
        return ResponseEntity.ok(shopRepository.save(existingShop));
    }

    @PostMapping("/{shopId}/add-owner")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> addOwner(@PathVariable String shopId, @RequestBody Map<String, String> request) {
        Shop shop = shopRepository.findById(shopId)
                .orElseThrow(() -> new EntityNotFoundException("Shop not found"));
        
        User user = userRepository.findByEmail(request.get("email"))
                .orElseThrow(() -> new EntityNotFoundException("User not found"));
        
        if (!shop.getOwners().contains(user)) {
            shop.getOwners().add(user);
        }
        
        return ResponseEntity.ok(shopRepository.save(shop));
    }
}
