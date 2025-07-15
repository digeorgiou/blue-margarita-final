package gr.aueb.cf.bluemargarita.dto.sale;

import java.math.BigDecimal;

public record YearlySalesDataDTO(
        int year,
        Integer quantitySold,
        BigDecimal revenue,
        Integer numberOfSales,
        BigDecimal averagePrice
) {}