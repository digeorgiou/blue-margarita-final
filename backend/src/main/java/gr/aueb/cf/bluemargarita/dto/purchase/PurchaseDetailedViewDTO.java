package gr.aueb.cf.bluemargarita.dto.purchase;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

/**
 * DTO for detailed purchase view
 */
public record PurchaseDetailedViewDTO(
        Long purchaseId,
        LocalDate purchaseDate,
        String supplierName,
        String supplierTin,
        String supplierPhoneNumber,
        String supplierEmail,
        BigDecimal totalCost,
        Integer totalItemCount,
        List<PurchaseMaterialDetailDTO> materials,
        LocalDateTime createdAt,
        String createdBy
) {
}
