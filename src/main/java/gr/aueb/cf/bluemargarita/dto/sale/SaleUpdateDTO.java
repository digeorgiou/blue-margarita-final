package gr.aueb.cf.bluemargarita.dto.sale;

import gr.aueb.cf.bluemargarita.core.enums.PaymentMethod;
import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.time.LocalDate;

public record SaleUpdateDTO(
        @NotNull(message = "Απαιτείται αναγνωριστικό πώλησης")
        Long saleId,

        Long customerId, // Can be null

        @NotNull(message = "Παρακαλώ επιλέξτε τοποθεσία")
        Long locationId,

        @NotNull(message = "Παρακαλώ εισάγετε ημερομηνία πώλησης")
        @PastOrPresent(message = "Η ημερομηνία δεν μπορεί να είναι μελλοντική")
        LocalDate saleDate,

        @NotNull(message = "Παρακαλώ εισάγετε τελική τιμή")
        @DecimalMin(value = "0.01", message = "Η τελική τιμή πρέπει να είναι μεγαλύτερη από 0")
        @Digits(integer = 5, fraction = 2, message = "Η τελική τιμή μπορεί να έχει μέχρι 5 ψηφία και 2 δεκαδικά")
        BigDecimal finalTotalPrice,

        @DecimalMin(value = "0.00", message = "Το κόστος συσκευασίας δεν μπορεί να είναι αρνητικό")
        @Digits(integer = 4, fraction = 2, message = "Το κόστος συσκευασίας μπορεί να έχει μέχρι 4 ψηφία και 2 δεκαδικά")
        BigDecimal packagingPrice,

        @NotNull(message = "Παρακαλώ επιλέξτε τρόπο πληρωμής")
        PaymentMethod paymentMethod,

        Long updaterUserId
) {}
