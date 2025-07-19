package gr.aueb.cf.bluemargarita.dto.sale;

import java.math.BigDecimal;

public record WeeklySalesDataDTO(
        int year,
        int weekOfYear,
        BigDecimal quantitySold,
        BigDecimal revenue
) {}
