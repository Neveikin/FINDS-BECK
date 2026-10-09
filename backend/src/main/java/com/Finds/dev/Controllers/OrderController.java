package com.Finds.dev.Controllers;

import com.Finds.dev.DTO.Order.OrderCreateDTO;
import com.Finds.dev.Repositories.OrderItemsRepository;
import com.Finds.dev.Repositories.OrderRepository;
import com.Finds.dev.Services.OrderService;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
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
        List<Map<String, Object>> responseList = new ArrayList<>();
        try (Connection conn = DriverManager.getConnection(
                System.getenv("DATABASE_URL"),
                System.getenv("DATABASE_USERNAME"),
                System.getenv("DATABASE_PASSWORD"))) {

            String sql = "SELECT o.id, o.created_at, o.status, o.total_price, o.adress " +
                         "FROM orders o " +
                         "LEFT JOIN users u ON o.user_id = u.id " +
                         "WHERE o.user_id = ? OR u.email = ? " +
                         "ORDER BY o.created_at DESC";

            Map<String, Map<String, Object>> ordersMap = new java.util.LinkedHashMap<>();
            try (PreparedStatement stmt = conn.prepareStatement(sql)) {
                stmt.setString(1, userId);
                stmt.setString(2, userId);
                try (ResultSet rs = stmt.executeQuery()) {
                    while (rs.next()) {
                        String orderId = rs.getString("id");
                        Map<String, Object> orderMap = new HashMap<>();
                        orderMap.put("id", orderId);
                        orderMap.put("createdAt", rs.getTimestamp("created_at") != null ? rs.getTimestamp("created_at").toLocalDateTime() : null);
                        orderMap.put("date", rs.getTimestamp("created_at") != null ? rs.getTimestamp("created_at").toLocalDateTime() : null);
                        orderMap.put("status", rs.getString("status"));
                        orderMap.put("totalPrice", rs.getBigDecimal("total_price"));
                        orderMap.put("total", rs.getBigDecimal("total_price"));
                        orderMap.put("adress", rs.getString("adress"));
                        orderMap.put("address", rs.getString("adress"));
                        orderMap.put("items", new ArrayList<Map<String, Object>>());
                        ordersMap.put(orderId, orderMap);
                    }
                }
            }

            if (!ordersMap.isEmpty()) {
                String orderIds = String.join(",", ordersMap.keySet().stream()
                    .map(id -> "'" + id + "'").toList());

                String itemsSql = "SELECT " +
                                  "  oi.order_id, " +
                                  "  oi.product_id, " +
                                  "  oi.quantity, " +
                                  "  oi.price_at_purchase, " +
                                  "  p.name AS product_name, " +
                                  "  p.price AS product_price, " +
                                  "  s.name AS shop_name, " +
                                  "  (SELECT pi.image_url FROM product_images pi WHERE pi.product_id = p.id AND pi.is_main = true LIMIT 1) AS image_url " +
                                  "FROM order_items oi " +
                                  "JOIN products p ON oi.product_id = p.id " +
                                  "LEFT JOIN shops s ON p.shop_id = s.id " +
                                  "WHERE oi.order_id IN (" + orderIds + ")";

                try (PreparedStatement stmt = conn.prepareStatement(itemsSql);
                     ResultSet rs = stmt.executeQuery()) {
                    while (rs.next()) {
                        String orderId = rs.getString("order_id");
                        Map<String, Object> orderMap = ordersMap.get(orderId);
                        if (orderMap != null) {
                            Map<String, Object> itemMap = new HashMap<>();
                            String productId = rs.getString("product_id");
                            itemMap.put("id", orderId + "_" + productId);
                            itemMap.put("quantity", rs.getInt("quantity"));
                            itemMap.put("priceAtPurchase", rs.getBigDecimal("price_at_purchase"));

                            Map<String, Object> productMap = new HashMap<>();
                            productMap.put("id", productId);
                            productMap.put("name", rs.getString("product_name"));
                            productMap.put("brand", rs.getString("shop_name") != null ? rs.getString("shop_name") : "Unknown");
                            String imageUrl = rs.getString("image_url");
                            productMap.put("image", imageUrl != null ? imageUrl : "");
                            productMap.put("price", rs.getBigDecimal("product_price"));

                            itemMap.put("product", productMap);
                            ((List<Map<String, Object>>) orderMap.get("items")).add(itemMap);
                        }
                    }
                }
            }

            responseList.addAll(ordersMap.values());
            return ResponseEntity.ok().body(responseList);
        } catch (SQLException e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/create")
    public ResponseEntity<?> createOrder(@RequestBody @Valid OrderCreateDTO orderCreateDTO) {
        orderService.createOrder(orderCreateDTO);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/shop-orders/{email}")
    public ResponseEntity<?> getShopOrders(@PathVariable String email) {
        List<Map<String, Object>> responseList = new ArrayList<>();
        try (Connection conn = DriverManager.getConnection(
                System.getenv("DATABASE_URL"),
                System.getenv("DATABASE_USERNAME"),
                System.getenv("DATABASE_PASSWORD"))) {

            String sql = "SELECT DISTINCT o.id, o.created_at, o.status, o.total_price, o.adress " +
                         "FROM orders o " +
                         "JOIN order_items oi ON o.id = oi.order_id " +
                         "JOIN products p ON oi.product_id = p.id " +
                         "JOIN shops s ON p.shop_id = s.id " +
                         "JOIN shop_owners so ON s.id = so.shop_id " +
                         "JOIN users u ON so.user_id = u.id " +
                         "WHERE u.email = ? " +
                         "ORDER BY o.created_at DESC";

            Map<String, Map<String, Object>> ordersMap = new java.util.LinkedHashMap<>();
            try (PreparedStatement stmt = conn.prepareStatement(sql)) {
                stmt.setString(1, email);
                try (ResultSet rs = stmt.executeQuery()) {
                    while (rs.next()) {
                        String orderId = rs.getString("id");
                        Map<String, Object> orderMap = new HashMap<>();
                        orderMap.put("id", orderId);
                        orderMap.put("createdAt", rs.getTimestamp("created_at") != null ? rs.getTimestamp("created_at").toLocalDateTime() : null);
                        orderMap.put("date", rs.getTimestamp("created_at") != null ? rs.getTimestamp("created_at").toLocalDateTime() : null);
                        orderMap.put("status", rs.getString("status"));
                        orderMap.put("totalPrice", rs.getBigDecimal("total_price"));
                        orderMap.put("total", rs.getBigDecimal("total_price"));
                        orderMap.put("adress", rs.getString("adress"));
                        orderMap.put("address", rs.getString("adress"));
                        orderMap.put("items", new ArrayList<Map<String, Object>>());
                        ordersMap.put(orderId, orderMap);
                    }
                }
            }

            if (!ordersMap.isEmpty()) {
                String orderIds = String.join(",", ordersMap.keySet().stream()
                    .map(id -> "'" + id + "'").toList());

                String itemsSql = "SELECT " +
                                  "  oi.order_id, " +
                                  "  oi.product_id, " +
                                  "  oi.quantity, " +
                                  "  oi.price_at_purchase, " +
                                  "  p.name AS product_name, " +
                                  "  p.price AS product_price, " +
                                  "  s.name AS shop_name, " +
                                  "  (SELECT pi.image_url FROM product_images pi WHERE pi.product_id = p.id AND pi.is_main = true LIMIT 1) AS image_url " +
                                  "FROM order_items oi " +
                                  "JOIN products p ON oi.product_id = p.id " +
                                  "JOIN shops s ON p.shop_id = s.id " +
                                  "JOIN shop_owners so ON s.id = so.shop_id " +
                                  "JOIN users u ON so.user_id = u.id " +
                                  "WHERE oi.order_id IN (" + orderIds + ") AND u.email = ?";

                try (PreparedStatement stmt = conn.prepareStatement(itemsSql)) {
                    stmt.setString(1, email);
                    try (ResultSet rs = stmt.executeQuery()) {
                        while (rs.next()) {
                            String orderId = rs.getString("order_id");
                            Map<String, Object> orderMap = ordersMap.get(orderId);
                            if (orderMap != null) {
                                Map<String, Object> itemMap = new HashMap<>();
                                String productId = rs.getString("product_id");
                                itemMap.put("id", orderId + "_" + productId);
                                itemMap.put("quantity", rs.getInt("quantity"));
                                itemMap.put("priceAtPurchase", rs.getBigDecimal("price_at_purchase"));

                                Map<String, Object> productMap = new HashMap<>();
                                productMap.put("id", productId);
                                productMap.put("name", rs.getString("product_name"));
                                productMap.put("brand", rs.getString("shop_name") != null ? rs.getString("shop_name") : "Unknown");
                                String imageUrl = rs.getString("image_url");
                                productMap.put("image", imageUrl != null ? imageUrl : "");
                                productMap.put("price", rs.getBigDecimal("product_price"));

                                itemMap.put("product", productMap);
                                ((List<Map<String, Object>>) orderMap.get("items")).add(itemMap);
                            }
                        }
                    }
                }
            }

            responseList.addAll(ordersMap.values());
            return ResponseEntity.ok().body(responseList);
        } catch (SQLException e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
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