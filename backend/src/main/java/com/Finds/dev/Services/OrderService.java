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

            OrderItem orderItem = new OrderItem();
            orderItem.setOrder(order);
            orderItem.setProduct(product);
            orderItem.setQuantity(itemDTO.quantity());
            orderItem.setPriceAtPurchase(product.getPrice());
            
            orderItems.add(orderItem);
        }

        order.setTotalPrice(totalPrice);
        order.setItems(orderItems);

        orderRepository.save(order);
    }

    public List<Order> getOrders(String email) {
        return orderRepository.findByUserEmail(email);
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
