package gr.aueb.cf.bluemargarita.dto.purchase;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PastOrPresent;

import java.time.LocalDate;

public record PurchaseUpdateDTO(

        @NotNull(message = "Απαιτείται αναγνωριστικό αγοράς")
        Long purchaseId,

        @NotNull(message = "Παρακαλώ επιλέξτε προμηθευτή")
        Long supplierId,

        @NotNull(message = "Παρακαλώ εισάγετε ημερομηνία αγοράς")
        @PastOrPresent(message = "Η ημερομηνία δεν μπορεί να είναι μελλοντική")
        LocalDate purchaseDate,

        Long updaterUserId
) {
}
