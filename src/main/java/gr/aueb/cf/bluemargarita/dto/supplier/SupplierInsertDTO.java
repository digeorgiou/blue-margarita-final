package gr.aueb.cf.bluemargarita.dto.supplier;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;

public record SupplierInsertDTO(
        @NotEmpty(message = "Παρακαλώ εισάγετε όνομα προμηθευτή")
        @Size(min = 2, max = 255, message = "Το όνομα πρέπει να έχει 2 ως 255 χαρακτήρες")
        String name,

        String address,

        @Size(max = 20, message = "Το ΑΦΜ δεν μπορεί να υπερβαίνει τους 20 χαρακτήρες")
        String tin,

        @Size(max = 20, message = "Το τηλέφωνο δεν μπορεί να υπερβαίνει τους 20 χαρακτήρες")
        String phoneNumber,

        @Email(message = "Παρακαλώ εισάγετε έγκυρο email")
        String email,

        Long creatorUserId
)
{}
