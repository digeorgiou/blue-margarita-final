package gr.aueb.cf.bluemargarita.dto.purchase;

import java.math.BigDecimal;

/**
 * DTO for purchase materials within a purchase
 */
public record PurchaseMaterialDTO(
        Long materialId,
        String materialName,
        BigDecimal quantity,
        String unitOfMeasure,
        BigDecimal priceAtTheTime,
        BigDecimal lineTotal  // quantity * priceAtTheTime
) {
}
