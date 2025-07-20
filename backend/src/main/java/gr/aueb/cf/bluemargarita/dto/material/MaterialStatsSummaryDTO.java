package gr.aueb.cf.bluemargarita.dto.material;

import java.math.BigDecimal;
import java.time.LocalDate;

public record MaterialStatsSummaryDTO(
        Long materialId,
        String materialName,
        BigDecimal totalQuantityPurchased,
        BigDecimal totalCostPaid,
        LocalDate lastPurchaseDate
) {
}
