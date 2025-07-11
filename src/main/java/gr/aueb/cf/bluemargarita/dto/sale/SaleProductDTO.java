package gr.aueb.cf.bluemargarita.dto.sale;

import java.math.BigDecimal;

public record SaleProductDTO(
        Long productId,
        String productName,
        String productCode,
        BigDecimal quantity,
        BigDecimal suggestedUnitPrice,
        BigDecimal actualUnitPrice,
        BigDecimal suggestedTotal,
        BigDecimal actualTotal,
        BigDecimal discountAmount
) {}
