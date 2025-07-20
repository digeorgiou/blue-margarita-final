package gr.aueb.cf.bluemargarita.dto.material;

import gr.aueb.cf.bluemargarita.dto.category.CategoryUsageDTO;
import gr.aueb.cf.bluemargarita.dto.product.ProductUsageDTO;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public record MaterialDetailedViewDTO(

        // Basic material information
        Long id,
        String name,
        String unit,
        BigDecimal costPerUnit,
        LocalDateTime createdAt,
        LocalDateTime updatedAt,
        String createdBy,
        String lastUpdatedBy,
        Boolean isActive,
        LocalDateTime deletedAt,

        // Usage statistics
        Integer totalProductsUsing,
        BigDecimal averageCostPerProduct,

        // Purchase analytics
        Integer purchaseCount,
        LocalDate lastPurchaseDate,

        BigDecimal recentPurchaseQuantity,     // last 30 days
        BigDecimal yearlyPurchaseQuantity,     // current year
        BigDecimal thisYearAveragePurchasePrice,
        BigDecimal lastYearAveragePurchasePrice, // null if no purchases last year

        // All-time sales performance (from products using this material)
        BigDecimal totalRevenue,
        Integer totalSalesCount,
        LocalDate lastSaleDate,

        // Recent performance (last 30 days)
        Integer recentSalesCount,
        BigDecimal recentRevenue,

        // Yearly performance (current year)
        Integer yearlySalesCount,
        BigDecimal yearlySalesRevenue,

        // Category distribution
        List<CategoryUsageDTO> categoryDistribution,

        // Product usage distribution (top 10 products using this material)
        List<ProductUsageDTO> topProductsUsage

) {
}