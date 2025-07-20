package gr.aueb.cf.bluemargarita.dto.expense;

import gr.aueb.cf.bluemargarita.core.enums.ExpenseType;
import jakarta.validation.constraints.*;

import java.math.BigDecimal;
import java.time.LocalDate;

public record ExpenseInsertDTO(
        @NotBlank(message = "Παρακαλώ εισάγετε μια περιγραφή")
        @Size(min = 3, max = 255, message = "Η περιγραφή πρέπει να περιέχει απο 3 εως 155 χαρακτήρες")
        String description,

        @NotNull(message = "Παρακαλώ εισάγετε ποσό")
        @DecimalMin(value = "0.01", message = "Το ποσό πρέπει να είναι μεγαλύτερο από 0")
        @Digits(integer = 5, fraction = 2, message = "Το ποσό μπορεί να έχει μέχρι 5 ψηφία και 2 δεκαδικά")
        BigDecimal amount,

        @NotNull(message = "Παρακαλώ εισάγετε ημερομηνία")
        @PastOrPresent(message = "Η ημερομηνία δεν μπορεί να είναι μελλοντική")
        LocalDate expenseDate,

        @NotNull(message = "Παρακαλώ επιλέξτε τύπο του εξόδου")
        ExpenseType expenseType,

        Long purchaseId, // Optional - only for purchase-related expenses

        @NotNull(message = "Creator user ID is required")
        Long creatorUserId
) {}
