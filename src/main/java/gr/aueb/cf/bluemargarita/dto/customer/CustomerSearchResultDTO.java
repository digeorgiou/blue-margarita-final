package gr.aueb.cf.bluemargarita.dto.customer;

/**
 * DTO for customer search results in sale creation
 */
public record CustomerSearchResultDTO(
        Long id,
        String fullName,
        String email,
        String phoneNumber,
        boolean isActive
) {}
