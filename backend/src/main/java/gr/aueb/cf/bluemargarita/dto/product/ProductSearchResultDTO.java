package gr.aueb.cf.bluemargarita.dto.product;

/**
 * DTO for product search results in sale creation
 */
public record ProductSearchResultDTO(
        Long id,
        String name,
        String code,
        String categoryName
) {}
