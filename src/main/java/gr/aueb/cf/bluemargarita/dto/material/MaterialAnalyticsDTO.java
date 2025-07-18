package gr.aueb.cf.bluemargarita.dto.material;

import java.math.BigDecimal;
import java.time.LocalDate;

public record MaterialAnalyticsDTO(
        // Usage metrics
        Integer totalProductsUsing,
        BigDecimal averageCostPerProduct,

        // Purchase metrics
        Integer purchaseCount,
        LocalDate lastPurchaseDate,

        // All-time sales metrics
        BigDecimal totalRevenue,
        Integer totalSalesCount,
        LocalDate lastSaleDate,

        // Recent performance (last 30 days)
        Integer recentSalesCount,
        BigDecimal recentRevenue,

        // Yearly performance (current year)
        Integer yearlySalesCount,
        BigDecimal yearlySalesRevenue
) {}
