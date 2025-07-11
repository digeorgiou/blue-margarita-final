package gr.aueb.cf.bluemargarita.dto.product;

import java.math.BigDecimal;

/**
 * DTO that provides detailed cost breakdown for a product
 */
public record ProductCostBreakdownDTO(
        Long productId,
        String productCode,
        String productName,

        // Cost components
        BigDecimal materialCost,
        BigDecimal laborCost,
        BigDecimal procedureCost,
        BigDecimal laborHours,
        BigDecimal hourlyLaborRate,
        BigDecimal totalCost,

        // Calculated suggested prices
        BigDecimal suggestedRetailPrice,
        BigDecimal suggestedWholesalePrice,
        BigDecimal retailMarkupFactor,
        BigDecimal wholesaleMarkupFactor,
        BigDecimal percentagePriceDifferenceRetail,
        BigDecimal percentagePriceDifferenceWholesale,
        BigDecimal profitMarginRetail,
        BigDecimal profitMarginWholesale,

        // Current actual price
        BigDecimal currentFinalSellingPriceRetail,
        BigDecimal currentFinalSellingPriceWholesale
){}
