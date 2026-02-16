package com.Finds.dev.DTO.Products;

import jakarta.validation.constraints.*;

import java.math.BigDecimal;

public class ProductEditDTO {
    @NotBlank(message = "Name cannot be blank")
    @Size(max = 200, message = "Name must not exceed 200 characters")
    private String name;
    
    private String description;
    
    @NotNull(message = "Price cannot be null")
    private BigDecimal price;
    
    @NotNull(message = "Stock cannot be null")
    private Integer stock;

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

    public Boolean getActive() {
        return isActive;
    }

    public void setActive(Boolean active) {
        isActive = active;
    }
}
