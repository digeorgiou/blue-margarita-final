package gr.aueb.cf.bluemargarita.dto.customer;

import gr.aueb.cf.bluemargarita.core.enums.GenderType;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record CustomerInsertDTO(
        @Size(min = 2, max = 55, message = "Το όνομα πρεπει να περιέχει απο 2 εως 55 χαρακτήρες")
        String firstname,

        @Size(min = 2, max = 55, message = "Το επώνυμο πρεπει να περιέχει απο 2 εως 55 χαρακτήρες")
        String lastname,

        GenderType gender,

        @Size(min = 8, max = 20, message = "Το τηλέφωνο πρέπει να περιέχει απο 8 εως 20 χαρακτήρες")
        @Pattern(regexp = "^[0-9+\\-\\s()]*$", message = "Το τηλέφωνο περιέχει μη έγκυρους χαρακτήρες")
        String phoneNumber,

        @Size(min = 2, max = 55, message = "Το επώνυμο πρεπει να περιέχει απο 2 εως 55 χαρακτήρες")
        String address,

        @Email(message = "Παρακαλώ εισάγετε έγκυρο email")
        @Size(max = 100, message = "Το email δεν μπορεί να υπερβαίνει τους 100 χαρακτήρες")
        String email,

        @Size(min = 5, max = 20, message = "Το ΑΦΜ πρέπει να περιέχει απο 5 εως 20 χαρακτήρες")
        @Pattern(regexp = "^[0-9]*$", message = "Το ΑΦΜ πρέπει να περιέχει μόνο αριθμούς")
        String tin,

        Long creatorUserId
)
{}
