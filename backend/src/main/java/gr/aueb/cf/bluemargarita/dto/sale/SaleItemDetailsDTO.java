package gr.aueb.cf.bluemargarita.dto.sale;

import java.math.BigDecimal;

/**
 * DTO for individual sale items in the response
 */
public record SaleItemDetailsDTO(
        Long productId,
        String productName,
        String productCode,
        String categoryName,
        BigDecimal quantity,
        BigDecimal priceAtTime, //actual price paid
        BigDecimal originalPrice, //Original retail/wholesale price
        BigDecimal totalPrice, //priceAtTime * quantity
        BigDecimal totalDiscount //(originalPrice - priceAtTime)*quantity
) {}
