package gr.aueb.cf.bluemargarita.dto.expense;

import gr.aueb.cf.bluemargarita.core.enums.ExpenseType;

import java.math.BigDecimal;

public record ExpenseSummaryDTO(
        Integer totalCount,
        BigDecimal totalAmount,
        BigDecimal averageAmount
) {}
