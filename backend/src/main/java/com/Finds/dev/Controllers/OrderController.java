package com.Finds.dev.Controllers;

import com.Finds.dev.DTO.Order.OrderCreateDTO;
import com.Finds.dev.Repositories.OrderItemsRepository;
import com.Finds.dev.Repositories.OrderRepository;
import com.Finds.dev.Services.OrderService;
import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.ArrayList;
import java.util.stream.Collectors;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/order")
public class OrderController {

    private OrderItemsRepository orderItemsRepository;
    private OrderRepository orderRepository;
    private OrderService orderService;

    public OrderController(OrderItemsRepository orderItemsRepository, OrderRepository orderRepository, OrderService orderService) {
        this.orderRepository = orderRepository;
        this.orderService = orderService;
        this.orderItemsRepository = orderItemsRepository;
    }

    @GetMapping("/get/{userId}")
    public ResponseEntity<?> getOrders(@PathVariable String userId) {
        List<com.Finds.dev.Entity.Order> orders = orderService.getOrders(userId);
        return ResponseEntity.ok().body(orders.stream().map(this::constructOrderResponse).toList());
    }

    @PostMapping("/create")
    public ResponseEntity<?> createOrder(@RequestBody @Valid OrderCreateDTO orderCreateDTO) {
        orderService.createOrder(orderCreateDTO);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/shop-orders/{email}")
    public ResponseEntity<?> getShopOrders(@PathVariable String email) {
        List<com.Finds.dev.Entity.Order> orders = orderService.getShopOrders(email);
        return ResponseEntity.ok().body(orders.stream().map(this::constructOrderResponse).toList());
    }

    private java.util.Map<String, Object> constructOrderResponse(com.Finds.dev.Entity.Order order) {
        java.util.Map<String, Object> response = new java.util.HashMap<>();
        response.put("id", order.getId());
        response.put("createdAt", order.getCreatedAt());
        response.put("date", order.getCreatedAt()); // Fallback for frontend
        response.put("status", order.getStatus());
        response.put("totalPrice", order.getTotalPrice());
        response.put("total", order.getTotalPrice()); // Fallback for frontend
        response.put("adress", order.getAdress());
        response.put("address", order.getAdress()); // Fallback for frontend
        
        java.util.List<java.util.Map<String, Object>> items = new java.util.ArrayList<>();
        if (order.getItems() != null) {
            for (com.Finds.dev.Entity.OrderItem item : order.getItems()) {
                java.util.Map<String, Object> itemMap = new java.util.HashMap<>();
                itemMap.put("id", item.getId().getOrderId() + "_" + item.getId().getProductId());
                itemMap.put("quantity", item.getQuantity());
                itemMap.put("priceAtPurchase", item.getPriceAtPurchase());
                
                java.util.Map<String, Object> productMap = new java.util.HashMap<>();
                if (item.getProduct() != null) {
                    productMap.put("id", item.getProduct().getId());
                    productMap.put("name", item.getProduct().getName());
                    productMap.put("brand", item.getProduct().getShop() != null ? item.getProduct().getShop().getName() : "Unknown");
                    String imageUrl = "";
                    if (item.getProduct().getImages() != null && !item.getProduct().getImages().isEmpty()) {
                        imageUrl = item.getProduct().getImages().get(0).getImageUrl();
                    }
                    productMap.put("image", imageUrl);
                    productMap.put("price", item.getProduct().getPrice());
                }
                itemMap.put("product", productMap);
                items.add(itemMap);
            }
        }
        response.put("items", items);
        return response;
    }

    @PatchMapping("/update-address/{orderId}")
    public ResponseEntity<?> updateAddress(@PathVariable String orderId, @RequestBody String newAddress, java.security.Principal principal) {
        orderService.updateOrderAddress(orderId, newAddress, principal.getName());
        return ResponseEntity.ok().build();
    }

    @PatchMapping("/cancel/{orderId}")
    public ResponseEntity<?> cancelOrder(@PathVariable String orderId, java.security.Principal principal) {
        orderService.cancelOrder(orderId, principal.getName());
        return ResponseEntity.ok().build();
    }

    @PatchMapping("/update-status/{orderId}")
    public ResponseEntity<?> updateStatus(@PathVariable String orderId, @RequestBody com.Finds.dev.Entity.Order.OrderStatus status, java.security.Principal principal) {
        orderService.updateOrderStatus(orderId, status, principal.getName());
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/delete/{orderId}")
    @PreAuthorize("hasRole('ADMIN') or @orderService.isOrderOwner(#orderId, authentication.name)")
    public ResponseEntity<?> deleteOrder(@PathVariable String orderId) {
        orderService.deleteOrder(orderId);
        return ResponseEntity.ok().build();
    }

    @PatchMapping("/setShipped/{orderId}")
    @PreAuthorize("hasRole('ADMIN') or @orderService.isOrderOwner(#orderId, authentication.name)")
    public ResponseEntity<?> setShipped(@PathVariable String orderId) {
        orderService.setShipped(orderId);
        return ResponseEntity.ok().build();
    }

    @PatchMapping("/setDelived/{orderId}")
    @PreAuthorize("hasRole('ADMIN') or @orderService.isOrderOwner(#orderId, authentication.name)")
    public ResponseEntity<?> setDelived(@PathVariable String orderId) {
        orderService.setDelived(orderId);
        return ResponseEntity.ok().build();
    }

    @PatchMapping("/setCanseled/{orderId}")
    @PreAuthorize("hasRole('ADMIN') or @orderService.isOrderOwner(#orderId, authentication.name)")
    public ResponseEntity<?> setCanseled(@PathVariable String orderId) {
        orderService.setCanseled(orderId);
        return ResponseEntity.ok().build();
    }

    @PatchMapping("/setRefunded/{orderId}")
    @PreAuthorize("hasRole('ADMIN') or @orderService.isOrderOwner(#orderId, authentication.name)")
    public ResponseEntity<?> setRefunded(@PathVariable String orderId) {
        orderService.setRefunded(orderId);
        return ResponseEntity.ok().build();
    }

}