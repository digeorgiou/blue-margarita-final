package gr.aueb.cf.bluemargarita.dto.task;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

public record ToDoTaskUpdateDTO(
        @NotNull(message = "Task ID is required")
        Long taskId,

        @NotBlank(message = "Παρακαλώ εισάγετε περιγραφή εργασίας")
        @Size(min = 2, max = 500, message = "Η περιγραφή πρέπει να έχει από 2 έως 500 χαρακτήρες")
        String description,

        @NotNull(message = "Παρακαλώ εισάγετε ημερομηνία εργασίας")
        LocalDate date
) {}
