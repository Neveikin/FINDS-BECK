package com.Finds.dev.Entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
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
    @JsonIgnore
    private Cart cart;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("productId")
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;
    
    @Column(name = "quantity", nullable = false)
    private Integer quantity;
    
    @Column(name = "size", insertable = false, updatable = false)
    private String size;
    
    @Column(name = "color", insertable = false, updatable = false)
    private String color;
    
    public CartItem() {}
    
    public CartItem(Cart cart, Product product, Integer quantity, String size, String color) {
        this.cart = cart;
        this.product = product;
        this.quantity = quantity;
        this.size = size;
        this.color = color;
        this.id = new CartItemId(cart.getId(), product.getId(), size, color);
    }
    
    public CartItemId getId() { return id; }
    public void setId(CartItemId id) { this.id = id; }
    
    public Cart getCart() { return cart; }
    public void setCart(Cart cart) { this.cart = cart; }
    
    public Product getProduct() { return product; }
    public void setProduct(Product product) { this.product = product; }
    
    public Integer getQuantity() { return quantity; }
    public void setQuantity(Integer quantity) { this.quantity = quantity; }

    public String getSize() { return size; }
    public void setSize(String size) { this.size = size; }

    public String getColor() { return color; }
    public void setColor(String color) { this.color = color; }
    
    @Embeddable
    public static class CartItemId implements java.io.Serializable {
        
        @Column(name = "cart_id", columnDefinition = "CHAR(36)")
        private String cartId;
        
        @Column(name = "product_id", columnDefinition = "CHAR(36)")
        private String productId;

        @Column(name = "size")
        private String size;

        @Column(name = "color")
        private String color;
        
        public CartItemId() {}
        
        public CartItemId(String cartId, String productId, String size, String color) {
            this.cartId = cartId;
            this.productId = productId;
            this.size = size;
            this.color = color;
        }
        
        public String getCartId() { return cartId; }
        public void setCartId(String cartId) { this.cartId = cartId; }
        
        public String getProductId() { return productId; }
        public void setProductId(String productId) { this.productId = productId; }

        public String getSize() { return size; }
        public void setSize(String size) { this.size = size; }

        public String getColor() { return color; }
        public void setColor(String color) { this.color = color; }
        
        @Override
        public boolean equals(Object o) {
            if (this == o) return true;
            if (o == null || getClass() != o.getClass()) return false;
            
            CartItemId that = (CartItemId) o;
            if (!cartId.equals(that.cartId)) return false;
            if (!productId.equals(that.productId)) return false;
            if (size != null ? !size.equals(that.size) : that.size != null) return false;
            return color != null ? color.equals(that.color) : that.color == null;
        }
        
        @Override
        public int hashCode() {
            int result = cartId.hashCode();
            result = 31 * result + productId.hashCode();
            result = 31 * result + (size != null ? size.hashCode() : 0);
            result = 31 * result + (color != null ? color.hashCode() : 0);
            return result;
        }
    }
}
