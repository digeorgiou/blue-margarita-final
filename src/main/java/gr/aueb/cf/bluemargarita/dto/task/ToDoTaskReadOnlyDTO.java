package gr.aueb.cf.bluemargarita.dto.task;

import java.time.LocalDate;

public record ToDoTaskReadOnlyDTO(
        Long id,
        String description,
        LocalDate date,
        LocalDate dateCompleted,
        String status,
        String statusLabel, // "OVERDUE" , "TODAY" , THIS_WEEK, "FUTURE"
        Integer daysFromToday // negative for overdue, 0 for today, positive for future
) {}
