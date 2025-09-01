package gr.aueb.cf.bluemargarita.dto.product;
import jakarta.validation.constraints.*;
import org.springframework.lang.Nullable;

import java.math.BigDecimal;
import java.util.Map;

public record ProductUpdateDTO(
        @NotNull(message = "Product ID is required")
        Long productId,

        @NotBlank(message = "Παρακαλώ εισάγετε όνομα προϊόντος")
        @Size(max = 50, message = "Η περιγραφή δεν μπορεί να υπερβαίνει τους 50 χαρακτήρες")
        String name,

        @NotBlank(message = "Παρακαλώ εισάγετε κωδικό προϊόντος")
        @Size(max = 6, message = "Ο κωδικός δεν μπορεί να υπερβαίνει τους 6 χαρακτήρες")
        String code,

        @NotNull(message = "Παρακαλώ επιλέξτε κατηγορία")
        Long categoryId,

        @Nullable
        @DecimalMin(value = "0.01", message = "Η τιμή λιανικής πρέπει να είναι μεγαλύτερη από 0")
        @Digits(integer = 4, fraction = 2, message = "Η τιμή λιανικής μπορεί να έχει μέχρι 4 ψηφία και 2 δεκαδικά")
        BigDecimal finalSellingPriceRetail,

        @Nullable
        @DecimalMin(value = "0.01", message = "Η τιμή χονδρικής πρέπει να είναι μεγαλύτερη από 0")
        @Digits(integer = 4, fraction = 2, message = "Η τιμή λιανικής μπορεί να έχει μέχρι 4 ψηφία και 2 δεκαδικά")
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

        @NotNull(message = "Updater user ID is required")
        Long updaterUserId
) {}
