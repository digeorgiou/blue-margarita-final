package gr.aueb.cf.bluemargarita.dto.procedure;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;

public record ProcedureInsertDTO(
        @NotEmpty(message = "Παρακαλώ εισάγετε το όνομα της διαδικασίας")
        @Size(min = 2, max = 255, message = "Το όνομα πρέπει να έχει 2 ως 255 χαρακτήρες")
        String name,
        Long creatorUserId
)
{}
