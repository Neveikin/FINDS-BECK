package com.Finds.dev.Repositories;

import com.Finds.dev.Entity.Favorite;
import com.Finds.dev.Entity.FavoriteShop;
import com.Finds.dev.Entity.Shop;
import com.Finds.dev.Entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface FavoriteShopRepository extends JpaRepository<FavoriteShop, String> {

    List<FavoriteShop> findByUserId(String userId);

    @Modifying
    @Query("DELETE FROM FavoriteShop fs WHERE fs.user.id = :userId AND fs.shop.id = :shopId")
    void deleteByUserIdAndShopId(@Param("userId") String userId, @Param("shopId") String shopId);
}
