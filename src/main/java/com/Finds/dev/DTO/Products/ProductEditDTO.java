package com.Finds.dev.DTO.Products;

import com.Finds.dev.Entity.Product;
import jakarta.validation.constraints.*;

import java.math.BigDecimal;
import java.util.List;

public class ProductEditDTO {
    @NotBlank(message = "Name cannot be blank")
    @Size(max = 200, message = "Name must not exceed 200 characters")
    private String name;
    
    private String description;
    
    @NotNull(message = "Price cannot be null")
    private BigDecimal price;
    
    @NotNull(message = "Stock cannot be null")
    private Integer stock;
    
    private String material;
    
    private List<Product.ProductSize> availableSizes;

    @NotNull
    private Boolean isActive;

    public ProductEditDTO(String name, String description, BigDecimal price, Integer stock, Boolean isActive) {
        this.name = name;
        this.description = description;
        this.price = price;
        this.stock = stock;
        this.isActive = isActive;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public BigDecimal getPrice() {
        return price;
    }

    public void setPrice(BigDecimal price) {
        this.price = price;
    }

    public Integer getStock() {
        return stock;
    }

    public void setStock(Integer stock) {
        this.stock = stock;
    }
    
    public String getMaterial() {
        return material;
    }

    public void setMaterial(String material) {
        this.material = material;
    }
    
    public List<Product.ProductSize> getAvailableSizes() {
        return availableSizes;
    }

    public void setAvailableSizes(List<Product.ProductSize> availableSizes) {
        this.availableSizes = availableSizes;
    }

    public Boolean getActive() {
        return isActive;
    }

    public void setActive(Boolean active) {
        isActive = active;
    }
}
