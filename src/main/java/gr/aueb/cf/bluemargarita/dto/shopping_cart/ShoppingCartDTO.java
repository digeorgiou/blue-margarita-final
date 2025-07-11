package gr.aueb.cf.bluemargarita.dto.shopping_cart;

import java.math.BigDecimal;
import java.util.List;

/**
 * DTO for the complete shopping cart
 */
public record ShoppingCartDTO(
        List<CartItemDTO> items,
        BigDecimal subtotal,        // sum of all item totals
        BigDecimal packagingCost,
        BigDecimal suggestedTotal,  // subtotal + packagingCost
        BigDecimal finalPrice,      // user-defined final price
        BigDecimal discountAmount,  // suggestedTotal - finalPrice
        BigDecimal discountPercentage,
        boolean isWholesale
) {}
