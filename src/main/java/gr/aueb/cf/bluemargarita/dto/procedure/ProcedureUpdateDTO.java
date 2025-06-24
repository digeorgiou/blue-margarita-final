package gr.aueb.cf.bluemargarita.dto.procedure;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;

public record ProcedureUpdateDTO(
        Long procedureId,
        Long updaterUserId,
        @NotEmpty(message = "Παρακαλώ εισάγετε περιγραφή")
        @Size(min = 2, max = 255, message = "Η περιγραφή πρέπει να έχει 2 ως 255 χαρακτήρες")
        String description
)
{}
