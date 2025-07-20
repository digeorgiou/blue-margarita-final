package gr.aueb.cf.bluemargarita.dto.category;

import java.math.BigDecimal;
import java.time.LocalDate;

public record CategoryAnalyticsDTO(
        // Product metrics
        Integer totalProductsInCategory,
        BigDecimal averageProductPrice,

        // All-time sales metrics
        BigDecimal totalRevenue,
        Integer totalSalesCount,
        BigDecimal averageOrderValue,
        LocalDate lastSaleDate,

        // Recent performance (last 30 days)
        Integer recentSalesCount,
        BigDecimal recentRevenue,

        // Yearly performance (current year)
        Integer yearlySalesCount,
        BigDecimal yearlySalesRevenue
) {}
