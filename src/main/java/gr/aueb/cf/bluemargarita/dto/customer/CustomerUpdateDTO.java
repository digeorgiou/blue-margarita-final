package gr.aueb.cf.bluemargarita.dto.customer;

import gr.aueb.cf.bluemargarita.core.enums.GenderType;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Size;

public record CustomerUpdateDTO(
        Long customerId,
        Long updaterUserId,

        @Size(max = 100, message = "Το όνομα δεν μπορεί να υπερβαίνει τους 100 χαρακτήρες")
        String firstname,

        @Size(max = 100, message = "Το επώνυμο δεν μπορεί να υπερβαίνει τους 100 χαρακτήρες")
        String lastname,

        GenderType gender,

        @Size(max = 20, message = "Το τηλέφωνο δεν μπορεί να υπερβαίνει τους 20 χαρακτήρες")
        String phoneNumber,

        String address,

        @Email(message = "Παρακαλώ εισάγετε έγκυρο email")
        String email,

        @Size(max = 20, message = "Το ΑΦΜ δεν μπορεί να υπερβαίνει τους 20 χαρακτήρες")
        String tin
)
{}
