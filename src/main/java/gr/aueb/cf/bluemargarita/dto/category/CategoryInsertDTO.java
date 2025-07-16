package gr.aueb.cf.bluemargarita.dto.category;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;

public record CategoryInsertDTO(

        @NotEmpty(message = "Παρακαλώ εισάγετε ονομα κατηγοριας")
        @Size(min = 2, max = 55, message = "Το όνομα πρέπει να έχει 2 ως 55" +
                " χαρακτήρες")
        String name,
        Long creatorUserId
)
{}
