package gr.aueb.cf.bluemargarita.dto.sale;

import java.math.BigDecimal;

public record YearlySalesDataDTO(
        int year,
        BigDecimal quantitySold,
        BigDecimal revenue
) {}