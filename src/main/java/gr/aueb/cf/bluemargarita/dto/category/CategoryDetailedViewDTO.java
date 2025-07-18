package gr.aueb.cf.bluemargarita.dto.category;

import gr.aueb.cf.bluemargarita.dto.product.ProductStatsSummaryDTO;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public record CategoryDetailedViewDTO(
        // Basic category information
        Long categoryId,
        String name,
        LocalDateTime createdAt,
        LocalDateTime updatedAt,
        String createdBy,
        String lastUpdatedBy,
        boolean isActive,
        LocalDateTime deletedAt,

        // Product usage statistics
        Integer totalProductsInCategory,
        BigDecimal averageProductPrice,

        // All-time sales statistics (based on products in this category)
        BigDecimal totalRevenue,
        Integer totalSalesCount,
        BigDecimal averageOrderValue,
        LocalDate lastSaleDate,

        // Recent performance (last 30 days)
        Integer recentSalesCount,
        BigDecimal recentRevenue,

        // Yearly performance (current year)
        Integer yearlySalesCount,
        BigDecimal yearlySalesRevenue,

        // Top performing products in this category
        List<ProductStatsSummaryDTO> topProducts
) {}
