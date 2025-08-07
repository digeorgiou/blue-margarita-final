package gr.aueb.cf.bluemargarita.dto.stock;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record StockLimitUpdateDTO(
        @NotNull(message = "Παρακαλώ επιλέξτε προϊόν")
        Long productId,
        @NotNull(message = "Παρακαλώ εισάγετε ποσότητα")
        @Min(value = 0, message = "Η ποσότητα δεν μπορεί να είναι αρνητική")
        @Max(value = 999, message = "Η ποσότητα δεν μπορεί να υπερβαίνει τις 999 μονάδες")
        Integer quantity,
        Long updaterUserId
){};
