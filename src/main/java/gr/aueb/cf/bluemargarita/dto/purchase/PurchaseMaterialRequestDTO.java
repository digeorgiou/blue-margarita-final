package gr.aueb.cf.bluemargarita.dto.purchase;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

public record PurchaseMaterialRequestDTO(

        @NotNull(message = "Παρακαλώ επιλέξτε υλικό")
        Long materialId,

        @NotNull(message = "Παρακαλώ εισάγετε ποσότητα")
        @DecimalMin(value = "0.001", message = "Η ποσότητα πρέπει να είναι μεγαλύτερη από 0")
        @Digits(integer = 4, fraction = 2, message = "Η ποσότητα μπορεί να έχει μέχρι 4 ψηφία και 2 δεκαδικά")
        BigDecimal quantity,

        @NotNull(message = "Παρακαλώ εισάγετε τιμή ανά μονάδα")
        @DecimalMin(value = "0.01", message = "Η τιμή ανά μονάδα πρέπει να είναι μεγαλύτερη από 0")
        @Digits(integer = 4, fraction = 2, message = "Η τιμή ανά μονάδα μπορεί να έχει μέχρι 8 ψηφία και 2 δεκαδικά")
        BigDecimal pricePerUnit
){};
