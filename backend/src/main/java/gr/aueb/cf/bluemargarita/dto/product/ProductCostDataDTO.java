package gr.aueb.cf.bluemargarita.dto.product;

import java.math.BigDecimal;

public record ProductCostDataDTO(
        BigDecimal totalCost,
        BigDecimal percentageDifference,
        Boolean isLowStock
) {}
