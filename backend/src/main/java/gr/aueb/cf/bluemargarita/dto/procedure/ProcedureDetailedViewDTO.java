package gr.aueb.cf.bluemargarita.dto.procedure;

import gr.aueb.cf.bluemargarita.dto.category.CategoryUsageDTO;
import gr.aueb.cf.bluemargarita.dto.product.ProductUsageDTO;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public record ProcedureDetailedViewDTO(
        // Basic procedure information
        Long procedureId,
        String name,
        LocalDateTime createdAt,
        LocalDateTime updatedAt,
        String createdBy,
        String lastUpdatedBy,
        boolean isActive,
        LocalDateTime deletedAt,

        // Essential analytics
        Integer totalProductsUsing,
        BigDecimal averageProcedureCost,
        BigDecimal averageProductSellingPriceRetail,

        // All-time sales performance (from products using this procedure)
        Integer totalSalesCount,
        BigDecimal totalRevenue,
        LocalDate lastSaleDate,

        // Recent performance (last 30 days)
        Integer recentSalesCount,
        BigDecimal recentRevenue,

        // Yearly performance (current year)
        Integer yearlySalesCount,
        BigDecimal yearlySalesRevenue,

        List<CategoryUsageDTO> categoryDistribution,
        List<ProductUsageDTO> topProductsUsage
) {}
