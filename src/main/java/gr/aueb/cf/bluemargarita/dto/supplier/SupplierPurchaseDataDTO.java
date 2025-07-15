package gr.aueb.cf.bluemargarita.dto.supplier;

import java.math.BigDecimal;
import java.time.LocalDate;

public record SupplierPurchaseDataDTO(
        Integer numberOfPurchases,
        BigDecimal totalCostPaid,
        LocalDate lastPurchaseDate,
        BigDecimal averagePurchaseValue
) {
}
