package gr.aueb.cf.bluemargarita.dto.product;

import java.math.BigDecimal;

/**
 * DTO for product search results in sale creation
 */
public record ProductSearchResultDTO(
        Long id,
        String name,
        String code,
        String categoryName,
        BigDecimal retailPrice,
        BigDecimal wholesalePrice,
        boolean isActive
) {}
