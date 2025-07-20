package gr.aueb.cf.bluemargarita.dto.sale;

import java.math.BigDecimal;

public record MonthlySalesDataDTO(
        Integer year,
        Integer month,
        BigDecimal quantitySold,
        BigDecimal revenue
) {}