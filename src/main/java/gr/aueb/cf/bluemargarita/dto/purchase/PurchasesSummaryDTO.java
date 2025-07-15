package gr.aueb.cf.bluemargarita.dto.purchase;

import java.math.BigDecimal;

public record PurchasesSummaryDTO(
        Integer totalPurchases,
        BigDecimal totalCost,
        BigDecimal averagePurchaseValue,
        Integer totalMaterialItems,
        BigDecimal averageItemCost
) {
}
