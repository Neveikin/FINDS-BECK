package com.Finds.dev.Services;

import com.Finds.dev.Entity.Favorite;
import com.Finds.dev.Entity.FavoriteShop;
import com.Finds.dev.Repositories.*;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@Transactional
public class FavoriteService {
    @Autowired
    ProductRepository productRepository;

    @Autowired
    UserRepository userRepository;

    @Autowired
    FavoriteRepository favoriteRepository;

    @Autowired
    FavoriteShopRepository favoriteShopRepository;

    @Autowired
    ShopRepository shopRepository;

    public void addFavorite(String userId, String productId) {
        Favorite favorite = new Favorite();
        favorite.setUser(userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User not found")));
        favorite.setProduct(productRepository.findById(productId)
                .orElseThrow(() -> new EntityNotFoundException("Product not found")));

        favoriteRepository.save(favorite);
    }

    public void addShopFavorite(String userId, String productId) {
        FavoriteShop favoriteShop = new FavoriteShop();
        favoriteShop.setUser(userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User not found")));
        favoriteShop.setShop(shopRepository.findById(productId)
                .orElseThrow(() -> new EntityNotFoundException("Shop not found")));

        favoriteShopRepository.save(favoriteShop);
    }

    public Map getUserFavorites(String userId) {
        Map map = new HashMap();
        map.put("Shops", favoriteShopRepository.findByUserId(userId));
        map.put("Products", favoriteRepository.findByUserId(userId));

        return map;
    }


}
