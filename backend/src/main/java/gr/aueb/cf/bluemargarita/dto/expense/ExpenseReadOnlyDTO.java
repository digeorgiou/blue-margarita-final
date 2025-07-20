package gr.aueb.cf.bluemargarita.dto.expense;

import gr.aueb.cf.bluemargarita.core.enums.ExpenseType;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public record ExpenseReadOnlyDTO(
        Long id,
        String description,
        BigDecimal amount,
        LocalDate expenseDate,
        ExpenseType expenseType,
        Long purchaseId,
        String purchaseDescription, // Supplier name + date for linked purchases
        LocalDateTime createdAt,
        String createdBy
) {}

