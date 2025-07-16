package gr.aueb.cf.bluemargarita.dto.expense;

import gr.aueb.cf.bluemargarita.core.enums.ExpenseType;
import jakarta.validation.constraints.*;

import java.math.BigDecimal;
import java.time.LocalDate;

public record ExpenseUpdateDTO(
        @NotNull(message = "Expense ID is required")
        Long expenseId,

        @NotBlank(message = "Description is required")
        @Size(max = 255, message = "Description cannot exceed 255 characters")
        String description,

        @NotNull(message = "Amount is required")
        @DecimalMin(value = "0.01", message = "Amount must be greater than 0")
        @Digits(integer = 8, fraction = 2, message = "Amount format is invalid")
        BigDecimal amount,

        @NotNull(message = "Expense date is required")
        LocalDate expenseDate,

        @NotNull(message = "Expense type is required")
        ExpenseType expenseType,

        Long purchaseId, // Optional - can be null to unlink from purchase

        @NotNull(message = "Updater user ID is required")
        Long updaterUserId
) {}
