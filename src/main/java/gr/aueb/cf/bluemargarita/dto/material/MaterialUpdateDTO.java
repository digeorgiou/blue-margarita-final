package gr.aueb.cf.bluemargarita.dto.material;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;

public record MaterialUpdateDTO(
        Long materialId,
        Long updaterUserId,

        @NotEmpty(message = "Παρακαλώ εισάγετε περιγραφή")
        @Size(min = 2, max = 255, message = "Η περιγραφή πρέπει να έχει 2 ως 255 χαρακτήρες")
        String description,

        @Positive(message = "Το κόστος μονάδας πρέπει να είναι θετικό")
        BigDecimal currentUnitCost,

        @NotEmpty(message = "Παρακαλώ εισάγετε μονάδα μέτρησης")
        @Size(min = 1, max = 50, message = "Η μονάδα μέτρησης πρέπει να έχει 1 ως 50 χαρακτήρες")
        String unitOfMeasure
)
{}