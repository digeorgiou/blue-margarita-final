package gr.aueb.cf.bluemargarita.dto.task;

public record ToDoTaskSummaryDTO(
        Long overdueCount,
        Long todayCount,
        Long thisWeekCount,
        Long totalPendingCount
) {}
