package gr.aueb.cf.bluemargarita.dto.purchase;

import java.math.BigDecimal;

public record PurchaseSummaryDTO(
   int totalPurchasesCount,
   BigDecimal totalAmountSpent
) {
}
