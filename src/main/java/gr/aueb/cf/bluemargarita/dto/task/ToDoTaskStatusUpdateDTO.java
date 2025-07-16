package gr.aueb.cf.bluemargarita.dto.task;

import gr.aueb.cf.bluemargarita.core.enums.TaskStatus;
import jakarta.validation.constraints.NotNull;

public record ToDoTaskStatusUpdateDTO(
        @NotNull(message = "Task ID is required")
        Long taskId,

        @NotNull(message = "Παρακαλώ επιλέξτε κατάσταση εργασίας")
        TaskStatus status
) {}
