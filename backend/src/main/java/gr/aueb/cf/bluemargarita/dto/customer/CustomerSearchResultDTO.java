package gr.aueb.cf.bluemargarita.dto.customer;


/**
 * Simplified customer info for sale response
 */
public record CustomerSearchResultDTO(
        Long id,
        String fullName,
        String email
) {}
