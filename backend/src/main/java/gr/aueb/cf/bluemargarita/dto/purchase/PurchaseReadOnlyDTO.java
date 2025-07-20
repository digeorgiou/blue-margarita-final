package gr.aueb.cf.bluemargarita.dto.purchase;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

/**
 * DTO for purchase read-only display
 */
public record PurchaseReadOnlyDTO(
        Long id,
        String supplierName,
        LocalDate purchaseDate,
        BigDecimal totalCost,
        Integer itemCount,
        List<PurchaseMaterialDTO> materials,
        LocalDateTime createdAt,
        LocalDateTime updatedAt,
        String createdBy,
        String lastUpdatedBy
) {
}
