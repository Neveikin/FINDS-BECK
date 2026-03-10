package com.Finds.dev.Controllers;

import com.Finds.dev.DTO.Order.OrderCreateDTO;
import com.Finds.dev.Repositories.OrderItemsRepository;
import com.Finds.dev.Repositories.OrderRepository;
import com.Finds.dev.Services.OrderService;
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
        return ResponseEntity.ok().body(orderService.getOrders(userId));
    }

    @PostMapping("/create")
    public ResponseEntity<?> createOrder(@RequestBody @Valid OrderCreateDTO orderCreateDTO) {
        orderService.createOrder(orderCreateDTO);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/delete/{orderId}")
    @PreAuthorize("hasRole('ADMIN') or (hasRole('SHOP_OWNER') and @orderService.isOrderOwner(#orderId, authentication.name))")
    public ResponseEntity<?> deleteOrder(@PathVariable String orderId) {
        orderService.deleteOrder(orderId);
        return ResponseEntity.ok().build();
    }

    @PatchMapping("/setShipped/{orderId}")
    @PreAuthorize("hasRole('ADMIN') or (hasRole('SHOP_OWNER') and @orderService.isOrderOwner(#orderId, authentication.name))")
    public ResponseEntity<?> setShipped(@PathVariable String orderId) {
        orderService.setShipped(orderId);
        return ResponseEntity.ok().build();
    }

    @PatchMapping("/setDelived/{orderId}")
    @PreAuthorize("hasRole('ADMIN') or (hasRole('SHOP_OWNER') and @orderService.isOrderOwner(#orderId, authentication.name))")
    public ResponseEntity<?> setDelived(@PathVariable String orderId) {
        orderService.setDelived(orderId);
        return ResponseEntity.ok().build();
    }

    @PatchMapping("/setCanseled/{orderId}")
    @PreAuthorize("hasRole('ADMIN') or (hasRole('SHOP_OWNER') and @orderService.isOrderOwner(#orderId, authentication.name))")
    public ResponseEntity<?> setCanseled(@PathVariable String orderId) {
        orderService.setCanseled(orderId);
        return ResponseEntity.ok().build();
    }

    @PatchMapping("/setRefunded/{orderId}")
    @PreAuthorize("hasRole('ADMIN') or (hasRole('SHOP_OWNER') and @orderService.isOrderOwner(#orderId, authentication.name))")
    public ResponseEntity<?> setRefunded(@PathVariable String orderId) {
        orderService.setRefunded(orderId);
        return ResponseEntity.ok().build();
    }

}