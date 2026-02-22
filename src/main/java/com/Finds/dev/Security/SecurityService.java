package com.Finds.dev.Security;

import com.Finds.dev.Entity.Product;
import com.Finds.dev.Entity.Shop;
import com.Finds.dev.Entity.User;
import com.Finds.dev.Repositories.ProductRepository;
import com.Finds.dev.Repositories.ShopRepository;
import com.Finds.dev.Repositories.UserRepository;
import com.Finds.dev.Services.UserService;
import jakarta.persistence.Table;
import org.springframework.security.core.Authentication;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class SecurityService {
    @Autowired
    ShopRepository shopRepository;

    @Autowired
    ProductRepository productRepository;

    @Autowired
    UserRepository userRepository;

    public boolean isExistInOwners(String productId, Authentication authentication) {
        Optional<Product> product = productRepository.findById(productId);
        if (product.isEmpty()) {
            return false;
        }
        
        Optional<Shop> shop = shopRepository.findById(product.get().getId());
        if (shop.isEmpty()) {
            return false;
        }

        Optional<User> user = userRepository.findByEmail(authentication.getName());
        if (user.isEmpty()) {
            return false;
        }

        return shop.get().getOwners().contains(user.get());
    }

}
