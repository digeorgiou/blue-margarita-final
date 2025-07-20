package gr.aueb.cf.bluemargarita.dto.stock;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;

import java.util.List;

/**
 * DTO for bulk stock update operations
 */
public record BulkStockUpdateDTO(

        @NotEmpty(message = "Παρακαλώ προσθέστε τουλάχιστον μία ενημέρωση αποθέματος")
        @Valid
        @Size(max = 100, message = "Δεν μπορείτε να ενημερώσετε περισσότερα από 100 προϊόντα ταυτόχρονα")
        List<StockUpdateDTO> updates,     // Reason for the batch update
        Long updaterUserId
) {
}
