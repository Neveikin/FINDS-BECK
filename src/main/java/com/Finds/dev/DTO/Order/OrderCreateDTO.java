package com.Finds.dev.DTO.Order;

import jakarta.persistence.Column;
import jakarta.persistence.Id;
import jakarta.validation.constraints.NotNull;

import java.util.List;
import java.util.UUID;

public class OrderCreateDTO {
        @Id
        @Column(name = "id", columnDefinition = "CHAR(36)")
        String id = UUID.randomUUID().toString();
        @NotNull
        List<OrderItemDTO> orderItems;
        @NotNull
        String adress;

    public void setUserEmail(String userEmail) {
        this.userEmail = userEmail;
    }

    public String getUserEmail() {
        return userEmail;
    }

    @NotNull
        String userEmail;
    public OrderCreateDTO() {
    }

    public OrderCreateDTO(String id, List<OrderItemDTO> orderItems, String adress, String userEmail) {
        this.id = id;
        this.orderItems = orderItems;
        this.adress = adress;
        this.userEmail = userEmail;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public List<OrderItemDTO> getOrderItems() {
        return orderItems;
    }

    public void setOrderItems(List<OrderItemDTO> orderItems) {
        this.orderItems = orderItems;
    }

    public String getAdress() {
        return adress;
    }

    public void setAdress(String adress) {
        this.adress = adress;
    }
}
