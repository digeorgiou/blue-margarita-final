package gr.aueb.cf.bluemargarita.dto.shopping_cart;

import java.math.BigDecimal;

/**
 * DTO for products in the shopping cart
 */
public record CartItemDTO(
        Long productId,
        String productName,
        String productCode,
        BigDecimal quantity,
        BigDecimal suggestedPrice, // retail or wholesale based on sale type
        BigDecimal totalPrice     // suggestedPrice * quantity
) {}
