package gr.aueb.cf.bluemargarita.service;

import gr.aueb.cf.bluemargarita.core.exceptions.EntityNotFoundException;
import gr.aueb.cf.bluemargarita.core.filters.Paginated;
import gr.aueb.cf.bluemargarita.core.filters.ToDoTaskFilters;
import gr.aueb.cf.bluemargarita.dto.task.*;

import java.time.LocalDate;
import java.util.List;

public interface IToDoTaskService {

    // =============================================================================
    // CORE CRUD OPERATIONS
    // =============================================================================

    /**
     * Creates a new task
     * @param dto Task creation data
     * @return Created task as read-only DTO
     */
    ToDoTaskReadOnlyDTO createTask(ToDoTaskInsertDTO dto);

    /**
     * Updates an existing task's description and/or date
     * Note: This method does not change completion status
     *
     * @param dto Task update data
     * @return Updated task as read-only DTO
     * @throws EntityNotFoundException if task not found
     */
    ToDoTaskReadOnlyDTO updateTask(ToDoTaskUpdateDTO dto) throws EntityNotFoundException;

    /**
     * Updates task status (completed, pending, cancelled)

     * @param dto Task status update data
     * @return Updated task as read-only DTO
     * @throws EntityNotFoundException if task not found
     */
    ToDoTaskReadOnlyDTO updateTaskStatus(ToDoTaskStatusUpdateDTO dto) throws EntityNotFoundException;

    /**
     * Deletes a task
     * Hard delete - tasks can be removed completely
     *
     * @param taskId Task ID to delete
     * @throws EntityNotFoundException if task not found
     */
    void deleteTask(Long taskId) throws EntityNotFoundException;

    // =============================================================================
    // DASHBOARD METHODS
    // =============================================================================

    /**
     * Gets tasks for dashboard display with smart categorization
     *
     * Returns:
     * 1. Overdue and today's tasks (limited by displayLimit)
     * 2. This week's tasks (limited by displayLimit)
     * 3. Summary counts for all categories
     * 4. Indicators if there are more tasks than displayed
     *
     * @param displayLimit Maximum tasks to show in each category (typically 5-10)
     * @return Dashboard tasks with summary and pagination info
     */
    DashboardToDoTasksDTO getDashboardTasks(int displayLimit);

    /**
     * Gets all tasks with filters and pagination (for "View All" functionality)
     *
     * @param filters Filter and pagination parameters
     * @return Paginated list of pending tasks
     */
    Paginated<ToDoTaskReadOnlyDTO> getFilteredTasks(ToDoTaskFilters filters);



    // =============================================================================
    // UTILITY METHODS
    // =============================================================================

    /**
     * Gets task summary counts for dashboard widgets
     * Includes overdue, today, this week, and total pending counts
     *
     * @return Summary of task counts by category
     */
    ToDoTaskSummaryDTO getTaskSummary();

    /**
     * Gets a single task by ID
     *
     * @param taskId Task ID
     * @return Task as read-only DTO
     * @throws EntityNotFoundException if task not found
     */
    ToDoTaskReadOnlyDTO getTaskById(Long taskId) throws EntityNotFoundException;
}
