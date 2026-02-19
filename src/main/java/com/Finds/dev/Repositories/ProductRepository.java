package com.Finds.dev.Repositories;

import com.Finds.dev.DTO.Products.ProductResponse;
import com.Finds.dev.Entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<Product, String> {

    @Query("UPDATE Product p SET p.name = :name, p.description = :description, p.price = :price, " +
           "p.stock = :stock, p.isActive = :isActive, p.material = :material WHERE p.id = :id")
    @Modifying
    void updateAllFieldsById(@Param("id") String id, @Param("name") String name, 
                           @Param("description") String description, @Param("price") java.math.BigDecimal price,
                           @Param("stock") Integer stock, @Param("isActive") Boolean isActive, 
                           @Param("material") String material, @Param("availableSizes") java.util.List<com.Finds.dev.Entity.Product.ProductSize> availableSizes);

    @Query("SELECT p FROM Product p WHERE p.isActive = true")
    List<Product> findActiveProducts();

    @Query(value = """
    SELECT
        p.id,
        p.name,
        CASE WHEN f.id IS NOT NULL THEN TRUE ELSE FALSE END AS is_favorite,
        pi.url AS image_url,
        p.material,
        (SELECT ARRAY_AGG(size_code) FROM product_sizes WHERE product_id = p.id) AS available_sizes
    FROM products p
    LEFT JOIN favorites f
        ON f.product_id = p.id
        AND f.user_id = :userId
    LEFT JOIN LATERAL (
        SELECT url
        FROM product_images
        WHERE product_id = p.id
        ORDER BY id
        LIMIT 1
    ) pi ON true
    WHERE p.is_active = TRUE
    ORDER BY p.name
""", nativeQuery = true)
    List<ProductResponse> findActiveProductsWithFavoriteAndImage(@Param("userId") String userId);

    @Query(value = """
    SELECT
        p.id,
        p.name,
        CASE WHEN f.id IS NOT NULL THEN TRUE ELSE FALSE END AS is_favorite,
        pi.url AS image_url,
        p.material,
        (SELECT ARRAY_AGG(size_code) FROM product_sizes WHERE product_id = p.id) AS available_sizes
    FROM products p
    LEFT JOIN favorites f
        ON f.product_id = p.id
        AND f.user_id = :userId
    LEFT JOIN LATERAL (
        SELECT url
        FROM product_images
        WHERE product_id = p.id
        ORDER BY id
        LIMIT 1
    ) pi ON true
    ORDER BY p.name
""", nativeQuery = true)
    List<ProductResponse> findAllProductsWithFavoriteAndImage(@Param("userId") String userId);

}
