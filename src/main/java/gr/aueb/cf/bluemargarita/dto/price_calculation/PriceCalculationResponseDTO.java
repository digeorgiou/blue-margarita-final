package gr.aueb.cf.bluemargarita.dto.price_calculation;

import gr.aueb.cf.bluemargarita.dto.shopping_cart.CartItemDTO;

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
