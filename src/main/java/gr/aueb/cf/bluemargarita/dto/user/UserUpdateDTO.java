package gr.aueb.cf.bluemargarita.dto.user;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;

public record UserUpdateDTO(

        Long userId,

        @NotEmpty(message = "Παρακαλώ εισάγετε username")
        @Size(min = 4, max = 55, message = "Το username πρέπει να έχει 4 ως 55 χαρακτήρες")
        String username,

        @NotEmpty(message = "Παρακαλώ εισάγετε κωδικό")
        @Size(min = 4, max = 30, message = "Ο κωδικός πρέπει να έχει 4 ως 30 χαρακτήρες")
        String password,

        @NotEmpty(message = "Παρακαλώ εισάγετε κωδικό")
        @Size(min = 4, max = 30, message = "Ο κωδικός πρέπει να έχει 4 ως 30 χαρακτήρες")
        String confirmedPassword
) {}
