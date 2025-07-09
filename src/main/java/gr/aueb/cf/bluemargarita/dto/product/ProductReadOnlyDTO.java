package gr.aueb.cf.bluemargarita.dto.product;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record ProductReadOnlyDTO(
        Long id,
        String name,
        String code,
        String categoryName,
        Long categoryId,
        BigDecimal suggestedRetailSellingPrice,
        BigDecimal suggestedWholeSaleSellingPrice,
        BigDecimal finalSellingPriceRetail,
        BigDecimal finalSellingPriceWholesale,
        Integer minutesToMake,
        Integer stock,
        Integer lowStockAlert,
        Boolean isActive,
        LocalDateTime createdAt,
        LocalDateTime updatedAt,
        String createdByUsername,
        String lastUpdatedByUsername,
        LocalDateTime deletedAt
) {}
