package gr.aueb.cf.bluemargarita.dto.procedure;

import java.math.BigDecimal;
import java.time.LocalDate;

public record ProcedureAnalyticsDTO(
        // Usage metrics
        Integer totalProductsUsing,
        BigDecimal averageProcedureCost,
        BigDecimal averageProductSellingPrice,

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
