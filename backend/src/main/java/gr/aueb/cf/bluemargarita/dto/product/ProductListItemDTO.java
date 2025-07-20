package gr.aueb.cf.bluemargarita.dto.product;

import java.math.BigDecimal;

public record ProductListItemDTO(
        Long id,
        String name,
        String code,
        String categoryName,
        Integer minutesToMake,
        BigDecimal totalCost,
        BigDecimal suggestedRetailPrice,
        BigDecimal finalRetailPrice,
        BigDecimal percentageDifference,
        boolean isActive,
        boolean isLowStock,
        Integer currentStock,
        Integer lowStockAlert
) {}
