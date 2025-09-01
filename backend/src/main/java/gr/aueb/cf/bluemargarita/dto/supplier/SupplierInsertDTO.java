package gr.aueb.cf.bluemargarita.dto.supplier;

import jakarta.validation.constraints.*;

public record SupplierInsertDTO(
        @Size(min = 2, max = 155, message = "Το όνομα πρέπει να έχει από 2 έως 155 χαρακτήρες")
        String name,

        @Pattern(regexp = "^$|^.{4,155}$",
                message = "Η διεύθυνση πρέπει να έχει από 4 έως 155 χαρακτήρες ή να είναι κενή")
        String address,

        @Pattern(regexp = "[0-9]{5,20}$",
                message = "Το ΑΦΜ πρέπει να έχει 5-20 ψηφία")
        String tin,

        @Pattern(regexp = "^$|^[0-9+\\-\\s()]{8,20}$",
                message = "Το τηλέφωνο πρέπει να έχει 8-20 χαρακτήρες ή να είναι κενό")
        String phoneNumber,

        @Email(message = "Παρακαλώ εισάγετε έγκυρο email")
        @Size(max = 100, message = "Το email δεν μπορεί να υπερβαίνει τους 100 χαρακτήρες")
        String email,

        Long creatorUserId
)
{}
