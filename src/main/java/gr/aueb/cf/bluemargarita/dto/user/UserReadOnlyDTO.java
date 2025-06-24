package gr.aueb.cf.bluemargarita.dto.user;


import java.time.LocalDateTime;

public record UserReadOnlyDTO(

        Long id,
        String username,
        String role,
        boolean isActive,
        LocalDateTime deletedAt,
        LocalDateTime createdAt,
        LocalDateTime updatedAt,
        String createdBy,
        String lastUpdatedBy
) {}
