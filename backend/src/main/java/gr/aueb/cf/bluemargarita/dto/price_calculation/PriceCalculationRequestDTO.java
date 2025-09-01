package gr.aueb.cf.bluemargarita.dto.price_calculation;

import gr.aueb.cf.bluemargarita.dto.sale.SaleItemRequestDTO;
import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotEmpty;

import java.math.BigDecimal;
import java.util.List;

/**
 * DTO for price calculation requests
 */
public record PriceCalculationRequestDTO(

        @NotEmpty(message = "Παρακαλώ προσθέστε προϊόντα στο καλάθι")
        @Valid
        List<SaleItemRequestDTO> items,

        boolean isWholesale,

        @DecimalMin(value = "0.00", message = "Το κόστος συσκευασίας δεν μπορεί να είναι αρνητικό")
        @Digits(integer = 3, fraction = 2, message = "Το κόστος συσκευασίας μπορεί να έχει μέχρι 3 ψηφία και 2 δεκαδικά")
        BigDecimal packagingCost,

        @DecimalMin(value = "0.01", message = "Η τελική τιμή πρέπει να είναι μεγαλύτερη από 0")
        @Digits(integer = 8, fraction = 2, message = "Η τελική τιμή μπορεί να έχει μέχρι 8 ψηφία και 2 δεκαδικά")
        BigDecimal userFinalPrice,

        @DecimalMin(value = "-999.99", message = "Η έκπτωση είναι εκτός ορίων")
        @DecimalMax(value = "100.00", message = "Η έκπτωση δεν μπορεί να είναι μεγαλύτερη από 100%")
        @Digits(integer = 3, fraction = 2, message = "Η έκπτωση μπορεί να έχει μέχρι 3 ψηφία και 2 δεκαδικά")
        BigDecimal userDiscountPercentage
) {}
