package com.Finds.dev.Services;

import com.Finds.dev.Entity.Favorite;
import com.Finds.dev.Entity.FavoriteShop;
import com.Finds.dev.Repositories.*;
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

    public void addFavorite(String userId, String productId) throws Exception{
        try {
            Favorite favorite = new Favorite();
            favorite.setUser(userRepository.findById(userId).get());
            favorite.setProduct(productRepository.findById(productId).get());

            favoriteRepository.save(favorite);
        } catch (Exception e) {
            throw new Exception(e);
        }
    }

    public void addShopFavorite(String userId, String productId) throws Exception {
        try {
            FavoriteShop favoriteShop = new FavoriteShop();
            favoriteShop.setUser(userRepository.findById(userId).get());
            favoriteShop.setShop(shopRepository.findById(productId).get());

            favoriteShopRepository.save(favoriteShop);
        } catch (Exception e) {
            throw new Exception(e);
        }
    }

    public Map getUserFavorites(String userId) throws Exception {
        try {
            Map map = new HashMap();
            map.put("Shops", favoriteShopRepository.findByUserId(userId));
            map.put("Products", favoriteRepository.findByUserId(userId));

            return map;
        } catch (Exception e) {
            throw new Exception(e);
        }
    }


}
