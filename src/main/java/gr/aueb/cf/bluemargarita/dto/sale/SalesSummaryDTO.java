package gr.aueb.cf.bluemargarita.dto.sale;

import java.math.BigDecimal;

/**
 * DTO for sales summary statistics
 */
public record SalesSummaryDTO(
        int totalSalesCount,
        BigDecimal totalRevenue,
        BigDecimal averageOrderValue,
        BigDecimal totalDiscountAmount,
        BigDecimal averageDiscountPercentage
) {}
