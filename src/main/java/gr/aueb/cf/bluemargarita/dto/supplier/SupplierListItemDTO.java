package gr.aueb.cf.bluemargarita.dto.supplier;

import java.math.BigDecimal;
import java.time.LocalDate;

public record SupplierListItemDTO(
        Long supplierId,
        String name,
        String address,
        String tin,
        String phoneNumber,
        String email,
        Boolean isActive,
        Integer totalPurchases,
        BigDecimal totalCostPaid,
        LocalDate lastPurchaseDate
) {
}
