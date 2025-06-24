package gr.aueb.cf.bluemargarita.dto.location;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;

public record LocationInsertDTO(
        @NotEmpty(message = "Παρακαλώ εισάγετε περιγραφή τοποθεσίας")
        @Size(min = 2, max = 255, message = "Η περιγραφή πρέπει να έχει 2 ως 255 χαρακτήρες")
        String description,
        Long creatorUserId
)
{}
