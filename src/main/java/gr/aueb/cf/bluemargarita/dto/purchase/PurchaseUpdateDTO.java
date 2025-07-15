package gr.aueb.cf.bluemargarita.dto.purchase;

import java.time.LocalDate;

public record PurchaseUpdateDTO(
        Long purchaseId,
        Long supplierId,
        LocalDate purchaseDate,
        String notes,
        Long updaterUserId
) {
}
