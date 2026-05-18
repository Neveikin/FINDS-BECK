package com.Finds.dev.Repositories;

import com.Finds.dev.Entity.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<Order, String> {

    @Query("SELECT o FROM Order o WHERE o.user.email = :email")
    List<Order> findByUserEmail(@Param("email") String email);

    @Query("SELECT o FROM Order o WHERE o.user.id = :userId OR o.user.email = :userId")
    List<Order> findByUserId(@Param("userId") String userId);

    @Query("SELECT DISTINCT o FROM Order o JOIN o.items i JOIN i.product p JOIN p.shop s JOIN s.owners u WHERE u.email = :email")
    List<Order> findByShopOwnerEmail(@Param("email") String email);
}
