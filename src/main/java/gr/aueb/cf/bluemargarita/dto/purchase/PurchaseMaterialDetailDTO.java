package gr.aueb.cf.bluemargarita.dto.purchase;

import java.math.BigDecimal;

/**
 * DTO for purchase material details
 */
public record PurchaseMaterialDetailDTO(
        Long materialId,
        String materialName,
        String unitOfMeasure,
        BigDecimal quantity,
        BigDecimal priceAtTheTime,
        BigDecimal currentUnitCost,  // Current cost for comparison
        BigDecimal lineTotal,
        BigDecimal costDifference    // priceAtTheTime - currentUnitCost
) {
}
