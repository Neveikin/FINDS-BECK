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
        Optional<Shop> shop = shopRepository.findById(productRepository.findById(productId).get().getId());

        return shop.get().getOwners().contains(userRepository.findByEmail(authentication.getName()).orElse(null));
    }

}
