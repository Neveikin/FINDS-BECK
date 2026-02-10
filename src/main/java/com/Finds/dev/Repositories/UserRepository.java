package com.Finds.dev.Repositories;

import com.Finds.dev.Entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, String> {

    Optional<User> findByName(String name);
    
    Optional<User> findByEmail(String email);
    
    boolean existsByEmail(String email);

    @Query("SELECT u.passwordHash FROM User u WHERE u.email = :email")
    String findPasswordHashByEmail(String email);
    
    @Modifying
    @Query("UPDATE User u SET u.email = :newEmail WHERE u.id = :userId")
    int updateEmailById(String userId, String newEmail);

    @Modifying
    @Query("UPDATE User u SET u.passwordHash = :newPasswordHash WHERE u.id = :userId")
    int updatePasswordById(String userId, String newPasswordHash);

    @Modifying
    @Query("UPDATE User u SET u.name = :newName WHERE u.id = :userId")
    int updateNameById(String userId, String newName);
}
