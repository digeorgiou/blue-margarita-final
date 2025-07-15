package gr.aueb.cf.bluemargarita.dto.product;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public record ProductDetailedViewDTO(
        // Basic info
        Long id,
        String name,
        String code,
        String categoryName,
        Long categoryId,

        // Pricing
        BigDecimal suggestedRetailPrice,
        BigDecimal suggestedWholesalePrice,
        BigDecimal finalRetailPrice,
        BigDecimal finalWholesalePrice,
        BigDecimal percentageDifferenceRetail,
        BigDecimal percentageDifferenceWholesale,

        // Manufacturing
        Integer minutesToMake,
        BigDecimal totalCost,
        BigDecimal materialCost,
        BigDecimal laborCost,
        BigDecimal procedureCost,

        // Stock
        Integer currentStock,
        Integer lowStockAlert,
        boolean isLowStock,

        // Materials and procedures
        List<ProductMaterialDetailDTO> materials,
        List<ProductProcedureDetailDTO> procedures,

        // Profit margins
        BigDecimal profitMarginRetail,
        BigDecimal profitMarginWholesale,

        // Metadata
        boolean isActive,
        LocalDateTime createdAt,
        LocalDateTime updatedAt,
        String createdBy,
        String lastUpdatedBy
) {}
