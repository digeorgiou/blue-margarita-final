package gr.aueb.cf.bluemargarita.dto.location;

import java.time.LocalDateTime;

public record LocationReadOnlyDTO(
        Long locationId,
        String description,
        LocalDateTime createdAt,
        LocalDateTime updatedAt,
        String createdBy,
        String lastUpdatedBy,
        boolean isActive,
        LocalDateTime deletedAt
)
{}
