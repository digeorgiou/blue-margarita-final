package gr.aueb.cf.bluemargarita.dto.price_calculation;

import java.math.BigDecimal;
import java.util.List;

/**
 * DTO for price calculation response
 */
public record PriceCalculationResponseDTO(
        BigDecimal subtotal,
        BigDecimal packagingCost,
        BigDecimal suggestedTotal,
        BigDecimal finalPrice,
        BigDecimal discountAmount,
        BigDecimal discountPercentage,
        List<CartItemDTO> calculatedItems
) {}
