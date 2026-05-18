package com.Finds.dev.Repositories;

import com.Finds.dev.DTO.Products.ShopResponse;
import com.Finds.dev.Entity.Shop;
import com.Finds.dev.Entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ShopRepository extends JpaRepository<Shop, String> {

    Optional<Shop> findById(String id);

    @Query("SELECT DISTINCT s FROM Shop s LEFT JOIN FETCH s.owners ORDER BY s.name")
    List<Shop> findAllWithOwners();

    @Query(value = """
        SELECT
            s.id,
            s.name,
            s.logo_url AS logoUrl,
            CASE 
                WHEN fs.shop_id IS NOT NULL THEN TRUE
                ELSE FALSE
            END AS isFavorite
        FROM shops s
        LEFT JOIN favorite_shop fs
            ON fs.shop_id = s.id
            AND fs.user_id = :userId
        ORDER BY s.name
    """, nativeQuery = true)
    List<ShopResponse> findAllShopsWithFavorite(@Param("userId") String userId);
    List<Shop> findByOwnersEmail(String email);
}
