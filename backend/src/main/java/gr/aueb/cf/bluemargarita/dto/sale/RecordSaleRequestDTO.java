package gr.aueb.cf.bluemargarita.dto.sale;

import gr.aueb.cf.bluemargarita.core.enums.PaymentMethod;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

/**
 * DTO for creating a sale from the record-sale page
 */
public record RecordSaleRequestDTO(

        Long customerId,           // nullable for walk-in customers

        @NotNull(message = "Παρακαλώ εισάγετε τοποθεσία")
        Long locationId,

        @NotNull(message = "Παρακαλώ εισάγετε τρόπο πληρωμής")
        PaymentMethod paymentMethod,

        @NotNull(message = "Παρακαλω επιλεξτε αν ειναι πωληση χονδρικής ή λιανικής")
        boolean isWholesale,

        @DecimalMin(value = "0.00", message = "Το κόστος συσκευασίας δεν μπορεί να είναι αρνητικό")
        @Digits(integer = 4, fraction = 2, message = "Το κόστος συσκευασίας μπορεί να έχει μέχρι 4 ψηφία και 2 δεκαδικά")
        BigDecimal packagingCost,

        @NotNull(message = "Παρακαλώ εισάγετε τελική τιμή")
        @DecimalMin(value = "0.01", message = "Η τελική τιμή πρέπει να είναι μεγαλύτερη από 0")
        @Digits(integer = 5, fraction = 2, message = "Η τελική τιμή μπορεί να έχει μέχρι 5 ψηφία και 2 δεκαδικά")
        BigDecimal finalPrice,     // user-defined final selling price

        @NotNull(message = "Παρακαλώ εισάγετε ημερομηνία")
        @PastOrPresent(message = "Η ημερομηνία δεν μπορεί να είναι μελλοντική")
        LocalDate saleDate,

        @NotEmpty(message = "Εισάγετε τουλάχιστον ένα προϊόν")
        @Valid
        List<SaleItemRequestDTO> items,

        Long creatorUserId
) {}
