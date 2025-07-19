package gr.aueb.cf.bluemargarita.dto.expense;

import gr.aueb.cf.bluemargarita.core.enums.ExpenseType;

import java.math.BigDecimal;

public record ExpenseTypeBreakdownDTO(
        ExpenseType expenseType,
        String expenseTypeDisplayName,
        BigDecimal totalAmount,
        Integer count,
        BigDecimal percentage
) {}
