package gr.aueb.cf.bluemargarita.dto.purchase;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

/**
 * DTO for recording a new purchase
 */
public record RecordPurchaseRequestDTO(
        Long supplierId,
        LocalDate purchaseDate,
        Long creatorUserId,
        List<PurchaseMaterialRequestDTO> materials
) {
}
