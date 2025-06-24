package gr.aueb.cf.bluemargarita.dto.material;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record MaterialReadOnlyDTO(
        Long materialId,
        String description,
        BigDecimal currentUnitCost,
        String unitOfMeasure,
        LocalDateTime createdAt,
        LocalDateTime updatedAt,
        String createdBy,
        String lastUpdatedBy,
        boolean isActive,
        LocalDateTime deletedAt
)
{}
