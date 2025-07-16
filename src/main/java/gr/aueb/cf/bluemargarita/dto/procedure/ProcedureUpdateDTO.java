package gr.aueb.cf.bluemargarita.dto.procedure;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;

public record ProcedureUpdateDTO(
        Long procedureId,
        Long updaterUserId,
        @NotEmpty(message = "Παρακαλώ εισάγετε το όνομα της διαδικασίας")
        @Size(min = 2, max = 155, message = "Το όνομα πρέπει να έχει 2 ως 155 χαρακτήρες")
        String name
)
{}
