package gr.aueb.cf.bluemargarita.dto.category;

import java.time.LocalDateTime;

public record CategoryReadOnlyDTO(
        Long categoryId,
        String name,
        LocalDateTime createdAt,
        LocalDateTime updatedAt,
        String createdBy,
        String lastUpdatedBy,
        boolean isActive,
        LocalDateTime deletedAt
)
{}
