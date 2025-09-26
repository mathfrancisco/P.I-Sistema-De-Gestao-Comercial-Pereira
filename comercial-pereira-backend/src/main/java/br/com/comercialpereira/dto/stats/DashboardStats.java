package br.com.comercialpereira.dto.stats;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardStats {
    private SalesStats sales;
    private InventoryStats inventory;
    private CustomerStats customers;
    private ProductStats products;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SalesStats {
        private Long totalSales;
        private BigDecimal totalRevenue;
        private BigDecimal averageOrderValue;
        private Long salesThisMonth;
        private BigDecimal revenueThisMonth;
        private List<DailySales> dailySales;
        private List<TopSeller> topSellers;

        @Data
        @Builder
        @NoArgsConstructor
        @AllArgsConstructor
        public static class DailySales {
            private String date;
            private Long count;
            private BigDecimal revenue;
        }

        @Data
        @Builder
        @NoArgsConstructor
        @AllArgsConstructor
        public static class TopSeller {
            private Long userId;
            private String userName;
            private Long salesCount;
            private BigDecimal totalRevenue;
        }
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class InventoryStats {
        private Long totalProducts;
        private BigDecimal totalValue;
        private Long lowStockItems;
        private Long outOfStockItems;
        private List<LowStockAlert> lowStockAlerts;

        @Data
        @Builder
        @NoArgsConstructor
        @AllArgsConstructor
        public static class LowStockAlert {
            private Long productId;
            private String productName;
            private String productCode;
            private Integer currentStock;
            private Integer minStock;
            private String urgency; // CRITICAL, HIGH, MEDIUM, LOW
        }
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CustomerStats {
        private Long totalCustomers;
        private Long activeCustomers;
        private Long newCustomersThisMonth;
        private Map<String, Long> customersByType;
        private List<TopCustomer> topCustomers;

        @Data
        @Builder
        @NoArgsConstructor
        @AllArgsConstructor
        public static class TopCustomer {
            private Long customerId;
            private String customerName;
            private Long purchaseCount;
            private BigDecimal totalSpent;
        }
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ProductStats {
        private Long totalProducts;
        private Long activeProducts;
        private BigDecimal averagePrice;
        private Map<String, Long> productsByCategory;
        private List<TopProduct> topSellingProducts;

        @Data
        @Builder
        @NoArgsConstructor
        @AllArgsConstructor
        public static class TopProduct {
            private Long productId;
            private String productName;
            private String productCode;
            private Long quantitySold;
            private BigDecimal revenue;
        }
    }
}