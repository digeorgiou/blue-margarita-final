package gr.aueb.cf.bluemargarita.dto.sale;

import java.math.BigDecimal;
import java.time.LocalDate;

public record WeeklySalesDataDTO(
        int year,
        int weekOfYear,
        LocalDate weekStartDate,
        LocalDate weekEndDate,
        BigDecimal quantitySold,
        BigDecimal revenue,
        Integer numberOfSales,
        BigDecimal averagePrice
) {}
