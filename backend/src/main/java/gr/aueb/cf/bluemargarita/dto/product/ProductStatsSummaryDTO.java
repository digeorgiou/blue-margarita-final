package gr.aueb.cf.bluemargarita.dto.product;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * DTO that shows some general stats for a specific product
 */

public record ProductStatsSummaryDTO(

        Long productId,
        String productName,
        String productCode,
        BigDecimal totalItemsSold,
        BigDecimal totalRevenue,
        LocalDate lastSaleDate
)
{}
