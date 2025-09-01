package gr.aueb.cf.bluemargarita.dto.purchase;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PastOrPresent;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

/**
 * DTO for recording a new purchase
 */
public record RecordPurchaseRequestDTO(

        @NotNull(message = "Παρακαλώ επιλέξτε προμηθευτή")
        Long supplierId,

        @NotNull(message = "Παρακαλώ εισάγετε ημερομηνία αγοράς")
        @PastOrPresent(message = "Η ημερομηνία δεν μπορεί να είναι μελλοντική")
        LocalDate purchaseDate,

        @NotEmpty(message = "Παρακαλώ προσθέστε τουλάχιστον ένα υλικό")
        @Valid
        List<PurchaseMaterialRequestDTO> materials
) {
}
