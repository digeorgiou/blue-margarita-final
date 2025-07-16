package gr.aueb.cf.bluemargarita.dto.task;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

public record ToDoTaskInsertDTO(
        @NotBlank(message = "Description is required")
        @Size(max = 500, message = "Description cannot exceed 500 characters")
        String description,

        @NotNull(message = "Date is required")
        LocalDate date
) {}