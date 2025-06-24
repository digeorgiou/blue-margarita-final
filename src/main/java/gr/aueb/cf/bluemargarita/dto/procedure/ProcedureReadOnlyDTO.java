package gr.aueb.cf.bluemargarita.dto.procedure;

import java.time.LocalDateTime;

public record ProcedureReadOnlyDTO(
        Long procedureId,
        String description,
        LocalDateTime createdAt,
        LocalDateTime updatedAt,
        String createdBy,
        String lastUpdatedBy,
        boolean isActive,
        LocalDateTime deletedAt
)
{}
