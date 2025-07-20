package gr.aueb.cf.bluemargarita.dto.location;

import java.math.BigDecimal;
import java.time.LocalDate;

public record LocationAnalyticsDTO(
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
