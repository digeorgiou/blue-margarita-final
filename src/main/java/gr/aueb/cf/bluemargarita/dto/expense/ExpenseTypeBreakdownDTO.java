package gr.aueb.cf.bluemargarita.dto.expense;

import gr.aueb.cf.bluemargarita.core.enums.ExpenseType;

import java.math.BigDecimal;

public record ExpenseTypeBreakdownDTO(
        ExpenseType expenseType,
        BigDecimal totalAmount,
        Long count,
        BigDecimal percentage
) {}
