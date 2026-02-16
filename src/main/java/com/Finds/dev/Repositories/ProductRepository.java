package com.Finds.dev.Repositories;

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
           "p.stock = :stock, p.isActive = :isActive WHERE p.id = :id")
    @Modifying
    void updateAllFieldsById(@Param("id") String id, @Param("name") String name, 
                           @Param("description") String description, @Param("price") java.math.BigDecimal price,
                           @Param("stock") Integer stock, @Param("isActive") Boolean isActive);

    @Query("SELECT p FROM Product p WHERE p.isActive = true")
    List<Product> findActiveProducts();

}
