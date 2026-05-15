package com.Finds.dev.Services;


import com.Finds.dev.DTO.Order.OrderCreateDTO;
import com.Finds.dev.DTO.Order.OrderItemDTO;
import com.Finds.dev.Entity.Order;
import com.Finds.dev.Entity.OrderItem;
import com.Finds.dev.Entity.Product;
import com.Finds.dev.Entity.User;
import com.Finds.dev.Repositories.OrderItemsRepository;
import com.Finds.dev.Repositories.OrderRepository;
import com.Finds.dev.Repositories.ProductRepository;
import com.Finds.dev.Repositories.UserRepository;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Service
public class OrderService {


    @Autowired
    OrderRepository orderRepository;

    @Autowired
    OrderItemsRepository orderItemsRepository;

    @Autowired
    ProductRepository productRepository;

    @Autowired
    UserRepository userRepository;

    @Transactional
    public void createOrder(@Valid OrderCreateDTO orderCreateDTO) {
        User user = userRepository.findByEmail(orderCreateDTO.getUserEmail())
                .orElseThrow(() -> new RuntimeException("User not found with email: " + orderCreateDTO.getUserEmail()));

        Order order = new Order(user);
        order.setAdress(orderCreateDTO.getAdress());
        
        List<OrderItem> orderItems = new ArrayList<>();
        BigDecimal totalPrice = BigDecimal.ZERO;

        for (OrderItemDTO itemDTO : orderCreateDTO.getOrderItems()) {
            Product product = productRepository.findById(itemDTO.productId())
                    .orElseThrow(() -> new RuntimeException("Product not found: " + itemDTO.productId()));

            BigDecimal itemTotal = product.getPrice().multiply(BigDecimal.valueOf(itemDTO.quantity()));
            totalPrice = totalPrice.add(itemTotal);

            OrderItem orderItem = new OrderItem(order, product, itemDTO.quantity(), product.getPrice());
            orderItems.add(orderItem);
        }

        order.setTotalPrice(totalPrice);
        order.setItems(orderItems);

        orderRepository.save(order);
    }

    public List<Order> getOrders(String userId) {
        System.out.println("OrderService - Fetching orders for userId: " + userId);
        List<Order> orders = orderRepository.findByUserId(userId);
        System.out.println("OrderService - Found " + orders.size() + " orders");
        return orders;
    }

    public List<Order> getShopOrders(String email) {
        List<Order> orders = orderRepository.findByShopOwnerEmail(email);
        // Filter items for each order to only include those from shops owned by this user
        for (Order order : orders) {
            List<OrderItem> filteredItems = new ArrayList<>();
            for (OrderItem item : order.getItems()) {
                boolean isOwner = item.getProduct().getShop().getOwners().stream()
                        .anyMatch(owner -> owner.getEmail().equals(email));
                if (isOwner) {
                    filteredItems.add(item);
                }
            }
            order.setItems(filteredItems);
        }
        return orders;
    }

    @Transactional
    public void updateOrderAddress(String orderId, String newAddress, String email) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found: " + orderId));
        
        if (!order.getUser().getEmail().equals(email)) {
            throw new RuntimeException("Unauthorized to update this order");
        }
        
        if (order.getStatus() == Order.OrderStatus.SHIPPED || 
            order.getStatus() == Order.OrderStatus.DELIVERED || 
            order.getStatus() == Order.OrderStatus.CANCELLED || 
            order.getStatus() == Order.OrderStatus.REFUNDED) {
            throw new RuntimeException("Cannot update address for order with status: " + order.getStatus());
        }
        
        order.setAdress(newAddress);
        orderRepository.save(order);
    }

    @Transactional
    public void cancelOrder(String orderId, String email) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found: " + orderId));
        
        if (!order.getUser().getEmail().equals(email)) {
            throw new RuntimeException("Unauthorized to cancel this order");
        }
        
        if (order.getStatus() != Order.OrderStatus.CREATED) {
            throw new RuntimeException("Cannot cancel order that is already in progress (status: " + order.getStatus() + ")");
        }
        
        order.setStatus(Order.OrderStatus.CANCELLED);
        orderRepository.save(order);
    }

    @Transactional
    public void updateOrderStatus(String orderId, Order.OrderStatus status, String email) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found: " + orderId));
        
        boolean isOwner = false;
        for (OrderItem item : order.getItems()) {
            if (item.getProduct().getShop().getOwners().stream().anyMatch(o -> o.getEmail().equals(email))) {
                isOwner = true;
                break;
            }
        }
        
        if (!isOwner) {
            throw new RuntimeException("Unauthorized to update status of this order");
        }
        
        order.setStatus(status);
        orderRepository.save(order);
    }

    public boolean isOrderOwner(String orderId, String email) {
        Order order = orderRepository.findById(orderId).orElse(null);
        if (order == null) return false;
        
        // Check if user is the customer
        if (order.getUser().getEmail().equals(email)) return true;
        
        // Check if user owns any shop in the order
        return order.getItems().stream()
                .anyMatch(item -> item.getProduct().getShop().getOwners().stream()
                        .anyMatch(owner -> owner.getEmail().equals(email)));
    }

    public void deleteOrder(String orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found: " + orderId));
        orderRepository.delete(order);
    }

    @Transactional
    public void setShipped(String orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found: " + orderId));
        order.setStatus(Order.OrderStatus.SHIPPED);
        orderRepository.save(order);
    }

    @Transactional
    public void setDelived(String orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found: " + orderId));
        order.setStatus(Order.OrderStatus.DELIVERED);
        orderRepository.save(order);
    }

    @Transactional
    public void setCanseled(String orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found: " + orderId));
        order.setStatus(Order.OrderStatus.CANCELLED);
        orderRepository.save(order);
    }

    @Transactional
    public void setRefunded(String orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found: " + orderId));
        order.setStatus(Order.OrderStatus.REFUNDED);
        orderRepository.save(order);
    }
}
