package gr.aueb.cf.bluemargarita.dto.product;

import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import org.springframework.lang.Nullable;

import java.math.BigDecimal;
import java.util.Map;

// ProductInsertDTO - for creating new products
public record ProductInsertDTO(
        @NotBlank(message = "Παρακαλώ εισάγετε όνομα προϊόντος")
        @Size(max = 100, message = "Η περιγραφή δεν μπορεί να υπερβαίνει τους 100 χαρακτήρες")
        String name,

        @NotBlank(message = "Παρακαλώ εισάγετε κωδικό προϊόντος")
        @Size(max = 10, message = "Ο κωδικός δεν μπορεί να υπερβαίνει τους 10 χαρακτήρες")
        String code,

        @NotNull(message = "Παρακαλώ επιλέξτε κατηγορία")
        Long categoryId,

        @Nullable
        @DecimalMin(value = "0.01", message = "Η τιμή λιανικής πρέπει να είναι μεγαλύτερη από 0")
        @Digits(integer = 5, fraction = 2, message = "Η τιμή λιανικής μπορεί να έχει μέχρι 5 ψηφία και 2 δεκαδικά")
        BigDecimal finalSellingPriceRetail,

        @Nullable
        @DecimalMin(value = "0.01", message = "Η τιμή χονδρικής πρέπει να είναι μεγαλύτερη από 0")
        @Digits(integer = 5, fraction = 2, message = "Η τιμή χονδρικής μπορεί να έχει μέχρι 5 ψηφία και 2 δεκαδικά")
        BigDecimal finalSellingPriceWholesale,

        @Nullable
        @Min(value = 0, message = "Τα λεπτά παραγωγής δεν μπορούν να είναι αρνητικά")
        @Max(value = 999, message = "Τα λεπτά παραγωγής δεν μπορούν να υπερβαίνουν τα 999")
        Integer minutesToMake,

        @Nullable
        @Min(value = 0, message = "Το απόθεμα δεν μπορεί να είναι αρνητικό")
        @Max(value = 9999, message = "Το απόθεμα δεν μπορεί να υπερβαίνει τις 9999 μονάδες")
        Integer stock,

        @Nullable
        @Min(value = 0, message = "Το όριο χαμηλού αποθέματος δεν μπορεί να είναι αρνητικό")
        @Max(value = 9999, message = "Το όριο χαμηλού αποθέματος δεν μπορεί να υπερβαίνει τις 9999 μονάδες")
        Integer lowStockAlert,

        @NotNull(message = "Creator user ID is required")
        Long creatorUserId,

        // Map of MaterialId -> Quantity
        @Nullable
        @Valid
        Map<
                @NotNull (message = "Το αναγνωριστικό υλικού είναι απαραίτητο")
                        Long,
                @NotNull(message = "Η ποσότητα υλικού είναι απαραίτητη")
                @DecimalMin(value = "0.001", message = "Η ποσότητα υλικού πρέπει να είναι μεγαλύτερη από 0")
                @Digits(integer = 4, fraction = 2, message = "Η ποσότητα υλικού μπορεί να έχει μέχρι 4 ψηφία και 2 δεκαδικά")
                        BigDecimal
                > materials,

        // Map of ProcedureId -> Cost
        @Nullable
        @Valid
        Map<
                @NotNull(message = "Το αναγνωριστικό διαδικασίας είναι απαραίτητο")
                Long,
                @NotNull(message = "Το κόστος διαδικασίας είναι απαραίτητο")
                @DecimalMin(value = "0.01", message = "Το κόστος διαδικασίας πρέπει να είναι μεγαλύτερο από 0")
                @Digits(integer = 4, fraction = 2, message = "Το κόστος διαδικασίας μπορεί να έχει μέχρι 4 ψηφία και 2 δεκαδικά")
                        BigDecimal> procedures
) {}
