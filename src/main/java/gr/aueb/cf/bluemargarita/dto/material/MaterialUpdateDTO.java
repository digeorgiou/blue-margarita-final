package gr.aueb.cf.bluemargarita.dto.material;

import jakarta.validation.constraints.*;

import java.math.BigDecimal;

public record MaterialUpdateDTO(
        Long materialId,
        Long updaterUserId,

        @NotEmpty(message = "Παρακαλώ εισάγετε περιγραφή")
        @Size(min = 4, max = 155, message = "Η περιγραφή πρέπει να έχει 4 ως 155 χαρακτήρες")
        String name,

        @NotNull(message = "Παρακαλώ εισάγετε κόστος υλικού")
        @DecimalMin(value = "0.01", message = "Το ποσό πρέπει να είναι μεγαλύτερο από 0")
        @Digits(integer = 5, fraction = 2, message = "Το ποσό μπορεί να έχει μέχρι 5 ψηφία και 2 δεκαδικά")
        BigDecimal currentUnitCost,

        @NotEmpty(message = "Παρακαλώ εισάγετε μονάδα μέτρησης")
        @Size(min = 1, max = 20, message = "Η μονάδα μέτρησης πρέπει να έχει 1 ως 20 χαρακτήρες")
        String unitOfMeasure
)
{}