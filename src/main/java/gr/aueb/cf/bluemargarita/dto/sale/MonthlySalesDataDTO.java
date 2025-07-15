package gr.aueb.cf.bluemargarita.dto.sale;

import java.math.BigDecimal;

public record MonthlySalesDataDTO(
        String monthYear, // "2024-01", "2024-02", etc.
        BigDecimal quantitySold,
        BigDecimal revenue,
        Integer numberOfSales,
        BigDecimal averagePrice
) {}