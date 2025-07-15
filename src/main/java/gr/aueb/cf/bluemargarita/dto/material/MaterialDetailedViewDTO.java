package gr.aueb.cf.bluemargarita.dto.material;

import gr.aueb.cf.bluemargarita.dto.product.ProductUsageDTO;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

/**
 * Detailed view DTO for Material with comprehensive usage analytics
 *
 * Provides material information along with product usage statistics,
 * cost impact analysis, and usage distribution metrics.
 *
 * Used for "View Details" functionality in material management pages.
 */
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
        BigDecimal averageUsageQuantity,
        BigDecimal minUsageQuantity,
        BigDecimal maxUsageQuantity,

        // Cost impact analytics
        BigDecimal averageCostPerProduct,   // average cost impact per product

        // Product usage distribution (top 10 products using this material)
        List<ProductUsageDTO> topProductsUsage
) {
}