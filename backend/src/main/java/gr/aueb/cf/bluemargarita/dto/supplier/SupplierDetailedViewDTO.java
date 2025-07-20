package gr.aueb.cf.bluemargarita.dto.supplier;

import gr.aueb.cf.bluemargarita.dto.material.MaterialStatsSummaryDTO;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public record SupplierDetailedViewDTO(
        Long supplierId,
        String name,
        String address,
        String tin,
        String phoneNumber,
        String email,
        LocalDateTime createdAt,
        LocalDateTime updatedAt,
        String createdBy,
        String lastUpdatedBy,
        Boolean isActive,
        LocalDateTime deletedAt,

        // Purchase analytics
        Integer totalPurchases,
        BigDecimal totalCostPaid,
        LocalDate lastPurchaseDate,
        BigDecimal averagePurchaseValue,

        // Top materials purchased from this supplier
        List<MaterialStatsSummaryDTO> topMaterials
) {
}
