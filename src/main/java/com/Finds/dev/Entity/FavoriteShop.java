package com.Finds.dev.Entity;

import jakarta.persistence.*;

@Entity
@Table(name = "favoriteShop")
public class FavoriteShop {
    
    @EmbeddedId
    private FavoriteShopId id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("userId")
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("shopId")
    @JoinColumn(name = "shop_id", nullable = false)
    private Shop shop;

    public FavoriteShop() {}
    
    public FavoriteShop(User user, Shop shop) {
        this.user = user;
        this.shop = shop;
        this.id = new FavoriteShopId(user.getId(), shop.getId());
    }

    public FavoriteShopId getId() { return id; }
    public void setId(FavoriteShopId id) { this.id = id; }
    
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
    
    public Shop getShop() { return shop; }
    public void setShop(Shop shop) { this.shop = shop; }
    
    @Embeddable
    public static class FavoriteShopId {
        
        @Column(name = "user_id", columnDefinition = "CHAR(36)")
        private String userId;
        
        @Column(name = "shop_id", columnDefinition = "CHAR(36)")
        private String shopId;
        
        public FavoriteShopId() {}
        
        public FavoriteShopId(String userId, String shopId) {
            this.userId = userId;
            this.shopId = shopId;
        }
        
        public String getUserId() { return userId; }
        public void setUserId(String userId) { this.userId = userId; }
        
        public String getShopId() { return shopId; }
        public void setShopId(String shopId) { this.shopId = shopId; }
        
        @Override
        public boolean equals(Object o) {
            if (this == o) return true;
            if (o == null || getClass() != o.getClass()) return false;
            
            FavoriteShopId that = (FavoriteShopId) o;
            return userId.equals(that.userId) && shopId.equals(that.shopId);
        }
        
        @Override
        public int hashCode() {
            return userId.hashCode() + shopId.hashCode();
        }
    }
}
