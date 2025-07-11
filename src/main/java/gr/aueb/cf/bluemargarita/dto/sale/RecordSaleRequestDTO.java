package gr.aueb.cf.bluemargarita.dto.sale;

import gr.aueb.cf.bluemargarita.core.enums.PaymentMethod;
import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

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

        @DecimalMin(value = "0.0", inclusive = true, message = "Το κόστος συσκευασίας πρέπει να είναι θετικός αριθμός")
        BigDecimal packagingCost,

        @NotNull(message = "Παρακαλώ εισάγετε τελική τιμή")
        @DecimalMin(value = "0.01", message = "Η τελική τιμή πρέπει να είναι θετικός αριθμός")
        BigDecimal finalPrice,     // user-defined final selling price

        @NotNull(message = "Παρακαλώ εισάγετε ημερομηνία")
        LocalDate saleDate,

        @NotEmpty(message = "Εισάγετε τουλάχιστον ένα προϊόν")
        @Valid
        List<SaleItemRequestDTO> items,

        Long creatorUserId
) {}
