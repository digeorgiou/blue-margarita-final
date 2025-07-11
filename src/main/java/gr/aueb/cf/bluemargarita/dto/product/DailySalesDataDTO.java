package gr.aueb.cf.bluemargarita.dto.product;

import java.math.BigDecimal;
import java.time.LocalDate;

public record DailySalesDataDTO(
        LocalDate date,
        BigDecimal quantitySold,
        BigDecimal revenue,
        Integer numberOfSales,
        BigDecimal averagePrice
) {}
