package com.Finds.dev.Services;

import com.Finds.dev.Entity.Shop;
import com.Finds.dev.Entity.User;
import com.Finds.dev.Repositories.ShopRepository;
import com.Finds.dev.Repositories.UserRepository;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ShopService {

    ShopRepository shopRepository;
    UserRepository userRepository;
    UserService userService;

    public ShopService (ShopRepository shopRepository, UserRepository userRepository, UserService userService) {
        this.shopRepository = shopRepository;
        this.userRepository = userRepository;
        this.userService = userService;
    }

    public boolean canUserManageShop(String shopId, Authentication authentication) {
        if (authentication.getAuthorities().stream()
                .anyMatch(auth -> auth.getAuthority().equals("ROLE_ADMIN"))) {
            return true;
        }

        String currentUserEmail = authentication.getName();
        User currentUser = userRepository.findByEmail(currentUserEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (currentUser.getRole() != User.UserRole.SELLER) {
            return false;
        }

        Shop shop = shopRepository.findById(shopId).orElse(null);
        return shop != null && shop.getOwners().stream()
                .anyMatch(owner -> owner.getId().equals(currentUser.getId()));
    }

    public List getShops() {
        return shopRepository.findAllShopsWithFavorite(userService.getCurrentUserId());
    }
}
