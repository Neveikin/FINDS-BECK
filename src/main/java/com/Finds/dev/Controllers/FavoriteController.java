package com.Finds.dev.Controllers;

import com.Finds.dev.Repositories.FavoriteRepository;
import com.Finds.dev.Repositories.FavoriteShopRepository;
import com.Finds.dev.Services.FavoriteService;
import com.Finds.dev.Services.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/favorites")
@CrossOrigin(origins = "*", allowedHeaders = "*", methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.DELETE, RequestMethod.PATCH, RequestMethod.OPTIONS})
public class FavoriteController {

    FavoriteService favoriteService;
    FavoriteRepository favoriteRepository;
    UserService userService;
    FavoriteShopRepository favoriteShopRepository;

    public FavoriteController(FavoriteService favoriteService, FavoriteRepository favoriteRepository, UserService userService, FavoriteShopRepository favoriteShopRepository){
        this.favoriteService = favoriteService;
        this.favoriteRepository =favoriteRepository;
        this.userService = userService;
        this.favoriteShopRepository = favoriteShopRepository;
    }

    @GetMapping("/get")
    public ResponseEntity<?> getUserFavorites() {
        return ResponseEntity.ok(favoriteService.getUserFavorites(userService.getCurrentUserId()));
    }

    @PostMapping("/add/product/{productId}")
    public ResponseEntity<?> addFavorite(@PathVariable String productId) {
        System.out.println("FavoriteController - Adding favorite: " + productId);
        try {
            String userId = userService.getCurrentUserId();
            System.out.println("FavoriteController - User ID: " + userId);
            favoriteService.addFavorite(userId, productId);
            return ResponseEntity.ok("{\"success\":true,\"message\":\"Product added to favorites\"}");
        } catch (Exception e) {
            System.out.println("FavoriteController - Error: " + e.getMessage());
            throw e;
        }
    }

    @PostMapping("/add/shop/{productId}")
    public ResponseEntity<?> addShopFavorite(@PathVariable String productId) {
        favoriteService.addShopFavorite(userService.getCurrentUserId(), productId);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/shop/{favoriteId}")
    public ResponseEntity<?> deleteShopFavorite(@PathVariable String favoriteId) {
        favoriteShopRepository.deleteByUserIdAndShopId(userService.getCurrentUserId(),favoriteId);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/product/{favoriteId}")
    @Transactional
    public ResponseEntity<?> deleteFavorite(@PathVariable String favoriteId) {
        favoriteRepository.deleteByUserIdAndProductId(userService.getCurrentUserId(), favoriteId);
        return ResponseEntity.ok().build();
    }
}
