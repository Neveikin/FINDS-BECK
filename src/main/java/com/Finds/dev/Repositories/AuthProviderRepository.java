package com.Finds.dev.Repositories;

import com.Finds.dev.Entity.AuthProvider;
import com.Finds.dev.Entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AuthProviderRepository extends JpaRepository<AuthProvider, Long> {

    Optional<AuthProvider> findByUserAndProvider(User user, AuthProvider.Provider provider);

    Optional<AuthProvider> findByProviderAndProviderId(AuthProvider.Provider provider, String providerId);

    boolean existsByProviderAndProviderId(AuthProvider.Provider provider, String providerId);

    boolean existsByUserAndProvider(User user, AuthProvider.Provider provider);

    @Query("SELECT ap.passwordHash FROM AuthProvider ap WHERE ap.user.id = :userId AND ap.provider = :provider")
    String findPasswordHashByUserAndProvider(String userId, AuthProvider.Provider provider);

    @Modifying
    @Query("UPDATE AuthProvider ap SET ap.passwordHash = :newPasswordHash WHERE ap.user.id = :userId AND ap.provider = :provider")
    int updatePasswordHashByUserAndProvider(String userId, String newPasswordHash, AuthProvider.Provider provider);
}
