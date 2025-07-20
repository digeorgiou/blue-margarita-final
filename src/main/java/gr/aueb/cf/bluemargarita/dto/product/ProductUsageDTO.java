package gr.aueb.cf.bluemargarita.dto.product;

import java.math.BigDecimal;

/**
 * DTO for product usage statistics in material/procedure analytics

 * Used to show which products use a specific material or procedure
 * and how much they use it.
 */
public record ProductUsageDTO(
        Long productId,
        String productName,
        String productCode,
        BigDecimal usageQuantity,
        BigDecimal costImpact, // quantity * material cost per unit
        String categoryName
) {
}
