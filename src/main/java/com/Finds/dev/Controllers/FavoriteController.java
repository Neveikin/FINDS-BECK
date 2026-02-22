package com.Finds.dev.Controllers;

import com.Finds.dev.Entity.Favorite;
import com.Finds.dev.Repositories.FavoriteRepository;
import com.Finds.dev.Repositories.FavoriteShopRepository;
import com.Finds.dev.Services.FavoriteService;
import com.Finds.dev.Services.UserService;
import jakarta.persistence.EntityNotFoundException;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import java.util.List;

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
        favoriteService.addFavorite(userService.getCurrentUserId(), productId);
        return ResponseEntity.ok().build();
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
    public ResponseEntity<?> deleteFavorite(@PathVariable String favoriteId) {
        favoriteRepository.deleteByUserIdAndProductId(userService.getCurrentUserId(), favoriteId);
        return ResponseEntity.ok().build();
    }
}
