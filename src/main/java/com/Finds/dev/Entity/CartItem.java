package com.Finds.dev.Entity;

import jakarta.persistence.*;

import java.util.UUID;

@Entity
@Table(name = "cart_items")
public class CartItem {
    
    @EmbeddedId
    private CartItemId id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("cartId")
    @JoinColumn(name = "cart_id", nullable = false)
    private Cart cart;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("productId")
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;
    
    @Column(name = "quantity", nullable = false)
    private Integer quantity;
    
    public CartItem() {}
    
    public CartItem(Cart cart, Product product, Integer quantity) {
        this.cart = cart;
        this.product = product;
        this.quantity = quantity;
        this.id = new CartItemId(cart.getId(), product.getId());
    }
    
    public CartItemId getId() { return id; }
    public void setId(CartItemId id) { this.id = id; }
    
    public Cart getCart() { return cart; }
    public void setCart(Cart cart) { this.cart = cart; }
    
    public Product getProduct() { return product; }
    public void setProduct(Product product) { this.product = product; }
    
    public Integer getQuantity() { return quantity; }
    public void setQuantity(Integer quantity) { this.quantity = quantity; }
    
    @Embeddable
    public static class CartItemId {
        
        @Column(name = "cart_id", columnDefinition = "CHAR(36)")
        private String cartId;
        
        @Column(name = "product_id", columnDefinition = "CHAR(36)")
        private String productId;
        
        public CartItemId() {}
        
        public CartItemId(String cartId, String productId) {
            this.cartId = cartId;
            this.productId = productId;
        }
        
        public String getCartId() { return cartId; }
        public void setCartId(String cartId) { this.cartId = cartId; }
        
        public String getProductId() { return productId; }
        public void setProductId(String productId) { this.productId = productId; }
        
        @Override
        public boolean equals(Object o) {
            if (this == o) return true;
            if (o == null || getClass() != o.getClass()) return false;
            
            CartItemId that = (CartItemId) o;
            return cartId.equals(that.cartId) && productId.equals(that.productId);
        }
        
        @Override
        public int hashCode() {
            return cartId.hashCode() + productId.hashCode();
        }
    }
}
