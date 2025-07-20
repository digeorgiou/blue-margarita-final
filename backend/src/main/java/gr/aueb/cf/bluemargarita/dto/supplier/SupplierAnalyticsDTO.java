package gr.aueb.cf.bluemargarita.dto.supplier;

import java.math.BigDecimal;
import java.time.LocalDate;

public record SupplierAnalyticsDTO(
        Integer totalPurchases,
        BigDecimal totalCostPaid,
        LocalDate lastPurchaseDate,
        BigDecimal averagePurchaseValue
) {}
