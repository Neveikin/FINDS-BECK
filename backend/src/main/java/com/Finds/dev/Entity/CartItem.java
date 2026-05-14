package com.Finds.dev.Entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;

import java.util.Objects;

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

    public CartItem() {}

    public CartItem(Cart cart, Product product, String sizeCode, String color, Integer quantity) {
        this.cart = cart;
        this.product = product;
        this.quantity = quantity;
        this.id = new CartItemId(cart.getId(), product.getId(),
                CartItemId.normalize(sizeCode), CartItemId.normalize(color));
    }

    @JsonIgnore
    public CartItemId getId() {
        return id;
    }

    public void setId(CartItemId id) {
        this.id = id;
    }

    public Cart getCart() {
        return cart;
    }

    public void setCart(Cart cart) {
        this.cart = cart;
    }

    public Product getProduct() {
        return product;
    }

    public void setProduct(Product product) {
        this.product = product;
    }

    public Integer getQuantity() {
        return quantity;
    }

    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
    }

    /** Для JSON-ответа GET /cart */
    public String getSizeCode() {
        return id != null ? id.getSizeCode() : "";
    }

    /** Для JSON-ответа GET /cart */
    public String getColor() {
        return id != null ? id.getColor() : "";
    }

    @Embeddable
    public static class CartItemId {

        @Column(name = "cart_id", columnDefinition = "CHAR(36)")
        private String cartId;

        @Column(name = "product_id", columnDefinition = "CHAR(36)")
        private String productId;

        @Column(name = "size_code", nullable = false, length = 32)
        private String sizeCode = "";

        @Column(name = "color", nullable = false, length = 100)
        private String color = "";

        public CartItemId() {}

        public CartItemId(String cartId, String productId, String sizeCode, String color) {
            this.cartId = cartId;
            this.productId = productId;
            this.sizeCode = sizeCode;
            this.color = color;
        }

        public static String normalize(String s) {
            return s == null ? "" : s.trim();
        }

        public String getCartId() {
            return cartId;
        }

        public void setCartId(String cartId) {
            this.cartId = cartId;
        }

        public String getProductId() {
            return productId;
        }

        public void setProductId(String productId) {
            this.productId = productId;
        }

        public String getSizeCode() {
            return sizeCode;
        }

        public void setSizeCode(String sizeCode) {
            this.sizeCode = sizeCode;
        }

        public String getColor() {
            return color;
        }

        public void setColor(String color) {
            this.color = color;
        }

        @Override
        public boolean equals(Object o) {
            if (this == o) return true;
            if (o == null || getClass() != o.getClass()) return false;
            CartItemId that = (CartItemId) o;
            return Objects.equals(cartId, that.cartId)
                    && Objects.equals(productId, that.productId)
                    && Objects.equals(sizeCode, that.sizeCode)
                    && Objects.equals(color, that.color);
        }

        @Override
        public int hashCode() {
            return Objects.hash(cartId, productId, sizeCode, color);
        }
    }
}
