package gr.aueb.cf.bluemargarita.dto.sale;

/**
 * Simplified customer info for sale response
 */
public record CustomerInfoDTO(
        Long id,
        String fullName,
        String email
) {}
