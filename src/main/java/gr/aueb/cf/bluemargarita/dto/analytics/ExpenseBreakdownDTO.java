package gr.aueb.cf.bluemargarita.dto.analytics;

import gr.aueb.cf.bluemargarita.core.enums.ExpenseType;

import java.math.BigDecimal;

public record ExpenseBreakdownDTO(
        ExpenseType expenseType,
        String expenseTypeName,
        BigDecimal amount,
        BigDecimal percentage,
        Integer count
) {}
