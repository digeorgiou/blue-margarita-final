package gr.aueb.cf.bluemargarita.dto.customer;

import java.math.BigDecimal;
import java.time.LocalDate;

public record CustomerAnalyticsDTO(
        BigDecimal totalRevenue,
        Integer totalSales,
        BigDecimal averageOrderValue,
        LocalDate lastOrderDate,

        Integer recentSalesCount,
        BigDecimal recentRevenue,

        Integer yearlySalesCount,
        BigDecimal yearlySalesRevenue
) {}
