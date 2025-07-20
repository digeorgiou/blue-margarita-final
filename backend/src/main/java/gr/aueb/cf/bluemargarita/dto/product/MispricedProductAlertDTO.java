package gr.aueb.cf.bluemargarita.dto.product;

import gr.aueb.cf.bluemargarita.core.enums.PricingIssueType;

import java.math.BigDecimal;

public record MispricedProductAlertDTO(
        Long productId,
        String productName,
        String productCode,
        String categoryName,
        BigDecimal suggestedRetailPrice,
        BigDecimal finalRetailPrice,
        BigDecimal priceDifferencePercentage,
        BigDecimal suggestedWholesalePrice,
        BigDecimal finalWholesalePrice,
        BigDecimal wholesalePriceDifferencePercentage,
        PricingIssueType issueType
){}
