package gr.aueb.cf.bluemargarita.dto.task;

import java.util.List;

public record DashboardToDoTasksDTO(
        List<ToDoTaskReadOnlyDTO> overdueAndTodayTasks,
        List<ToDoTaskReadOnlyDTO> thisWeekTasks,
        ToDoTaskSummaryDTO summary,
        Integer displayLimit,
        Boolean hasMoreTasks
) {}
