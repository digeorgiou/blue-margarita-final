package gr.aueb.cf.bluemargarita.dto.location;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;

public record LocationInsertDTO(
        @NotEmpty(message = "Παρακαλώ εισάγετε περιγραφή τοποθεσίας")
        @Size(min = 2, max = 55, message = "Το όνομα της τοποθεσίας πρεπει να περιέχει απο 2 εως 55 χαρακτήρες")
        String name,
        Long creatorUserId
)
{}
