package com.Finds.dev.Entity;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.oauth2.core.user.OAuth2User;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;
import java.util.Map;

@Entity
@Table(name = "auth_providers")
public class AuthProvider implements OAuth2User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(name = "provider", nullable = false)
    private Provider provider;

    @Column(name = "provider_id", nullable = false)
    private String providerId;

    @Column(name = "password_hash")
    private String passwordHash;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Transient
    private OAuth2User oauth2User;
    
    public AuthProvider() {}

    public AuthProvider(User user, Provider provider, String providerId) {
        this.user = user;
        this.provider = provider;
        this.providerId = providerId;
    }

    public AuthProvider(User user, Provider provider, String providerId, String passwordHash) {
        this.user = user;
        this.provider = provider;
        this.providerId = providerId;
        this.passwordHash = passwordHash;
    }

    public AuthProvider(OAuth2User oauth2User, String email, String name, String providerId) {
        this.oauth2User = oauth2User;
        this.providerId = providerId;
    }

    public enum Provider {
        GOOGLE,
        LOCAL
    }

    public Long getId() {
        return id;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public Provider getProvider() {
        return provider;
    }

    public void setProvider(Provider provider) {
        this.provider = provider;
    }

    public String getProviderId() {
        return providerId;
    }

    public void setProviderId(String providerId) {
        this.providerId = providerId;
    }

    public String getPasswordHash() {
        return passwordHash;
    }

    public void setPasswordHash(String passwordHash) {
        this.passwordHash = passwordHash;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    @Override
    public Map<String, Object> getAttributes() {
        return oauth2User != null ? oauth2User.getAttributes() : Map.of();
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return oauth2User != null ? oauth2User.getAuthorities() : List.of();
    }

    @Override
    public String getName() {
        return user != null ? user.getEmail() : (oauth2User != null ? oauth2User.getName() : "");
    }
}
