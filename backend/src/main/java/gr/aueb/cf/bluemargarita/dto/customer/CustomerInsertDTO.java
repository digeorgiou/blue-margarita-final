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

        @Pattern(regexp = "^$|^[0-9+\\-\\s()]{8,20}$",
                message = "Το τηλέφωνο πρέπει να έχει 8-20 χαρακτήρες ή να είναι κενό")
        String phoneNumber,

        @Pattern(regexp = "^$|^.{2,55}$",
                message = "Η διεύθυνση πρέπει να έχει τουλάχιστον 2 χαρακτήρες ή να είναι κενή")
        String address,

        @Email(message = "Παρακαλώ εισάγετε έγκυρο email")
        @Size(max = 100, message = "Το email δεν μπορεί να υπερβαίνει τους 100 χαρακτήρες")
        String email,

        @Pattern(regexp = "^$|^[0-9]{5,20}$",
                message = "Το ΑΦΜ πρέπει να έχει 5-20 ψηφία ή να είναι κενό")
        String tin,

        Long creatorUserId
)
{}
