package gr.aueb.cf.bluemargarita.dto.supplier;

import java.time.LocalDateTime;

public record SupplierReadOnlyDTO(
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
        boolean isActive,
        LocalDateTime deletedAt
)
{}
