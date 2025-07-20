package gr.aueb.cf.bluemargarita.dto.supplier;

import jakarta.validation.constraints.*;

public record SupplierUpdateDTO(
        Long supplierId,
        Long updaterUserId,

        @NotBlank(message = "Παρακαλώ εισάγετε όνομα προμηθευτή")
        @Size(min = 2, max = 155, message = "Το όνομα πρέπει να έχει από 2 έως 155 χαρακτήρες")
        String name,

        @Size(min = 2, max = 155, message = "Η διεύθυνση πρέπει να έχει από 2 έως 155 χαρακτήρες")
        String address,

        @Size(min = 5, max = 20, message = "Το ΑΦΜ πρέπει να έχει από 5 έως 20 χαρακτήρες")
        @Pattern(regexp = "^[0-9]*$", message = "Το ΑΦΜ πρέπει να περιέχει μόνο αριθμούς")
        String tin,

        @Size(min = 8, max = 20, message = "Το τηλέφωνο πρέπει να έχει από 8 έως 20 χαρακτήρες")
        @Pattern(regexp = "^[0-9+\\-\\s()]*$", message = "Το τηλέφωνο περιέχει μη έγκυρους χαρακτήρες")
        String phoneNumber,

        @Email(message = "Παρακαλώ εισάγετε έγκυρο email")
        @Size(max = 100, message = "Το email δεν μπορεί να υπερβαίνει τους 100 χαρακτήρες")
        String email
)
{}
