package gr.aueb.cf.bluemargarita.dto.price_calculation;

import gr.aueb.cf.bluemargarita.dto.sale.SaleItemRequestDTO;

import java.math.BigDecimal;
import java.util.List;

/**
 * DTO for price calculation requests
 */
public record PriceCalculationRequestDTO(
        List<SaleItemRequestDTO> items,
        boolean isWholesale,
        BigDecimal packagingCost,
        BigDecimal userFinalPrice,
        BigDecimal userDiscountPercentage
) {}
