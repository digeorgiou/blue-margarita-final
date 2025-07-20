package gr.aueb.cf.bluemargarita.dto.location;

import gr.aueb.cf.bluemargarita.dto.product.ProductStatsSummaryDTO;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public record LocationDetailedViewDTO(
        // Basic location information
        Long locationId,
        String name,
        LocalDateTime createdAt,
        LocalDateTime updatedAt,
        String createdBy,
        String lastUpdatedBy,
        boolean isActive,
        LocalDateTime deletedAt,

        // Essential sales statistics only
        BigDecimal totalRevenue,
        Integer totalSalesCount,
        BigDecimal averageOrderValue,
        LocalDate lastSaleDate,

        // Simple recent performance (last 30 days)
        Integer recentSalesCount,
        BigDecimal recentRevenue,
        // Simple yearly performance (current year)
        Integer yearlySalesCount,
        BigDecimal yearlySalesRevenue,

        List<ProductStatsSummaryDTO> topProducts
) {}
