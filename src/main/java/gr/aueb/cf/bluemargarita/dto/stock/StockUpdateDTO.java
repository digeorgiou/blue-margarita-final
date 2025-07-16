package gr.aueb.cf.bluemargarita.dto.stock;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record StockUpdateDTO(
        @NotNull(message = "Παρακαλώ επιλέξτε προϊόν")
        Long productId,
        @NotNull(message = "Παρακαλώ επιλέξτε τύπο ενημέρωσης αποθέματος")
        StockUpdateType updateType,

        @NotNull(message = "Παρακαλώ εισάγετε ποσότητα")
        @Min(value = 0, message = "Η ποσότητα δεν μπορεί να είναι αρνητική")
        @Max(value = 9999, message = "Η ποσότητα δεν μπορεί να υπερβαίνει τις 9.999 μονάδες")
        Integer quantity,
        Long updaterUserId
) {

    public enum StockUpdateType {
        ADD,        // Add items to stock
        REMOVE,     // Remove items from stock
        SET         // Set absolute stock value
    }
}
