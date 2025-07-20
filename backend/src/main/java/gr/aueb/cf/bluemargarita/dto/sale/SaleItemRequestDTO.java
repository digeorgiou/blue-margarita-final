package gr.aueb.cf.bluemargarita.dto.sale;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

/**
 * DTO for individual sale items in the request
 */
public record SaleItemRequestDTO(

        @NotNull(message = "Παρακαλώ επιλέξτε προϊόν")
        Long productId,

        @NotNull(message = "Παρακαλώ εισάγετε ποσότητα")
        @DecimalMin(value = "0.001", message = "Η ποσότητα πρέπει να είναι μεγαλύτερη από 0")
        @Digits(integer = 5, fraction = 2, message = "Η ποσότητα μπορεί να έχει μέχρι 5 ψηφία και 2 δεκαδικά")
        BigDecimal quantity
) {}
