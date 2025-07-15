package gr.aueb.cf.bluemargarita.dto.location;

import gr.aueb.cf.bluemargarita.dto.product.ProductStatsSummaryDTO;
import gr.aueb.cf.bluemargarita.dto.sale.MonthlySalesDataDTO;
import gr.aueb.cf.bluemargarita.dto.sale.YearlySalesDataDTO;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

/**
 * Detailed DTO for location information including sales analytics and performance metrics
 * Used for location detail views and management pages
 */
public record LocationDetailedDTO(
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
        Integer totalSalesCount,
        BigDecimal totalRevenue,
        BigDecimal averageOrderValue,
        LocalDate firstSaleDate,
        LocalDate lastSaleDate,

        // Simple recent performance (last 30 days)
        Integer recentSalesCount,
        BigDecimal recentRevenue,
        // Simple yearly performance (current year)
        Integer yearlySalesCount,
        BigDecimal yearlySalesRevenue


) {}
