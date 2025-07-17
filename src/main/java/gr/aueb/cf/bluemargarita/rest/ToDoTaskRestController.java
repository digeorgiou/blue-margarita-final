package gr.aueb.cf.bluemargarita.rest;

import gr.aueb.cf.bluemargarita.core.enums.TaskStatus;
import gr.aueb.cf.bluemargarita.core.exceptions.EntityNotFoundException;
import gr.aueb.cf.bluemargarita.core.exceptions.ValidationException;
import gr.aueb.cf.bluemargarita.core.filters.Paginated;
import gr.aueb.cf.bluemargarita.core.filters.ToDoTaskFilters;
import gr.aueb.cf.bluemargarita.dto.task.*;
import gr.aueb.cf.bluemargarita.service.IToDoTaskService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/tasks")
@RequiredArgsConstructor
@SecurityRequirement(name = "Bearer Authentication")
@Tag(name = "Task Management", description = "APIs for managing to-do tasks in the jewelry business")
public class ToDoTaskRestController {

    private final IToDoTaskService toDoTaskService;

    // =============================================================================
    // CORE CRUD OPERATIONS
    // =============================================================================

    @Operation(
            summary = "Create a new task",
            description = "Creates a new to-do task. Used in task management and dashboard.",
            responses = {
                    @ApiResponse(
                            responseCode = "201",
                            description = "Task created successfully",
                            content = @Content(
                                    mediaType = "application/json",
                                    schema = @Schema(implementation = ToDoTaskReadOnlyDTO.class)
                            )
                    ),
                    @ApiResponse(
                            responseCode = "400",
                            description = "Validation errors",
                            content = @Content(mediaType = "application/json")
                    )
            }
    )
    @PostMapping
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<ToDoTaskReadOnlyDTO> createTask(
            @Valid @RequestBody ToDoTaskInsertDTO taskInsertDTO,
            BindingResult bindingResult) throws ValidationException {

        if (bindingResult.hasErrors()) {
            throw new ValidationException(bindingResult);
        }

        ToDoTaskReadOnlyDTO task = toDoTaskService.createTask(taskInsertDTO);
        return new ResponseEntity<>(task, HttpStatus.CREATED);
    }

    @Operation(
            summary = "Update task",
            description = "Updates an existing task's description and/or date. Does not change completion status. Used in task management.",
            responses = {
                    @ApiResponse(
                            responseCode = "200",
                            description = "Task updated successfully",
                            content = @Content(
                                    mediaType = "application/json",
                                    schema = @Schema(implementation = ToDoTaskReadOnlyDTO.class)
                            )
                    ),
                    @ApiResponse(
                            responseCode = "400",
                            description = "Validation errors",
                            content = @Content(mediaType = "application/json")
                    ),
                    @ApiResponse(
                            responseCode = "404",
                            description = "Task not found",
                            content = @Content(mediaType = "application/json")
                    )
            }
    )
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<ToDoTaskReadOnlyDTO> updateTask(
            @PathVariable Long id,
            @Valid @RequestBody ToDoTaskUpdateDTO taskUpdateDTO,
            BindingResult bindingResult) throws ValidationException, EntityNotFoundException {

        if (bindingResult.hasErrors()) {
            throw new ValidationException(bindingResult);
        }

        ToDoTaskReadOnlyDTO task = toDoTaskService.updateTask(taskUpdateDTO);
        return new ResponseEntity<>(task, HttpStatus.OK);
    }

    @Operation(
            summary = "Update task status",
            description = "Updates a task's completion status (completed, pending, cancelled). Used in task management and dashboard.",
            responses = {
                    @ApiResponse(
                            responseCode = "200",
                            description = "Task status updated successfully",
                            content = @Content(
                                    mediaType = "application/json",
                                    schema = @Schema(implementation = ToDoTaskReadOnlyDTO.class)
                            )
                    ),
                    @ApiResponse(
                            responseCode = "400",
                            description = "Validation errors",
                            content = @Content(mediaType = "application/json")
                    ),
                    @ApiResponse(
                            responseCode = "404",
                            description = "Task not found",
                            content = @Content(mediaType = "application/json")
                    )
            }
    )
    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<ToDoTaskReadOnlyDTO> updateTaskStatus(
            @PathVariable Long id,
            @Valid @RequestBody ToDoTaskStatusUpdateDTO taskStatusUpdateDTO,
            BindingResult bindingResult) throws ValidationException, EntityNotFoundException {

        if (bindingResult.hasErrors()) {
            throw new ValidationException(bindingResult);
        }

        ToDoTaskReadOnlyDTO task = toDoTaskService.updateTaskStatus(taskStatusUpdateDTO);
        return new ResponseEntity<>(task, HttpStatus.OK);
    }

    @Operation(
            summary = "Delete task",
            description = "Deletes a task completely (hard delete). Used in task management.",
            responses = {
                    @ApiResponse(
                            responseCode = "204",
                            description = "Task deleted successfully"
                    ),
                    @ApiResponse(
                            responseCode = "404",
                            description = "Task not found",
                            content = @Content(mediaType = "application/json")
                    )
            }
    )
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<Void> deleteTask(@PathVariable Long id) throws EntityNotFoundException {
        toDoTaskService.deleteTask(id);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }

    @Operation(
            summary = "Get task by ID",
            description = "Retrieves task information by ID. Used for editing forms and quick lookups.",
            responses = {
                    @ApiResponse(
                            responseCode = "200",
                            description = "Task found",
                            content = @Content(
                                    mediaType = "application/json",
                                    schema = @Schema(implementation = ToDoTaskReadOnlyDTO.class)
                            )
                    ),
                    @ApiResponse(
                            responseCode = "404",
                            description = "Task not found",
                            content = @Content(mediaType = "application/json")
                    )
            }
    )
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<ToDoTaskReadOnlyDTO> getTaskById(@PathVariable Long id) throws EntityNotFoundException {
        ToDoTaskReadOnlyDTO task = toDoTaskService.getTaskById(id);
        return new ResponseEntity<>(task, HttpStatus.OK);
    }

    // =============================================================================
    // TASK VIEWING AND LISTING - FOR TASK MANAGEMENT PAGE
    // =============================================================================

    @Operation(
            summary = "Get tasks with pagination and filters",
            description = "Retrieves tasks with pagination and filtering support. Main endpoint for task management page listing.",
            responses = {
                    @ApiResponse(
                            responseCode = "200",
                            description = "Paginated list of tasks",
                            content = @Content(
                                    mediaType = "application/json",
                                    schema = @Schema(implementation = Paginated.class)
                            )
                    )
            }
    )
    @GetMapping
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<Paginated<ToDoTaskReadOnlyDTO>> getTasksFilteredPaginated(
            @Parameter(description = "Task description filter") @RequestParam(required = false) String description,
            @Parameter(description = "Date from filter") @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateFrom,
            @Parameter(description = "Date to filter") @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateTo,
            @Parameter(description = "Task status filter (PENDING, COMPLETED, CANCELLED)") @RequestParam(required = false) String status,
            @Parameter(description = "Page number (0-based)") @RequestParam(required = false, defaultValue = "0") int page,
            @Parameter(description = "Page size") @RequestParam(required = false, defaultValue = "20") int pageSize,
            @Parameter(description = "Sort field") @RequestParam(required = false, defaultValue = "date") String sortBy,
            @Parameter(description = "Sort direction") @RequestParam(required = false, defaultValue = "ASC") String sortDirection) {

        ToDoTaskFilters filters = ToDoTaskFilters.builder()
                .description(description)
                .dateFrom(dateFrom)
                .dateTo(dateTo)
                .status(status != null ? TaskStatus.valueOf(status.toUpperCase()) : null)
                .build();

        // Set pagination properties using request parameters (with defaults)
        filters.setPage(page);
        filters.setPageSize(pageSize);
        filters.setSortBy(sortBy);
        filters.setSortDirection(Sort.Direction.valueOf(sortDirection.toUpperCase()));

        Paginated<ToDoTaskReadOnlyDTO> tasks = toDoTaskService.getFilteredTasks(filters);
        return new ResponseEntity<>(tasks, HttpStatus.OK);
    }

    // =============================================================================
    // DASHBOARD METHODS
    // =============================================================================

    @Operation(
            summary = "Get tasks for dashboard",
            description = "Retrieves tasks for dashboard display with smart categorization. Returns overdue, today's, and this week's tasks with summary counts.",
            responses = {
                    @ApiResponse(
                            responseCode = "200",
                            description = "Dashboard tasks with categorization",
                            content = @Content(
                                    mediaType = "application/json",
                                    schema = @Schema(implementation = DashboardToDoTasksDTO.class)
                            )
                    )
            }
    )
    @GetMapping("/dashboard")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<DashboardToDoTasksDTO> getTasksForDashboard(
            @Parameter(description = "Display limit for each category") @RequestParam(required = false, defaultValue = "5") int displayLimit) {

        DashboardToDoTasksDTO dashboardTasks = toDoTaskService.getDashboardTasks(displayLimit);
        return new ResponseEntity<>(dashboardTasks, HttpStatus.OK);
    }

    @Operation(
            summary = "Get task summary",
            description = "Retrieves task summary with counts for overdue, today, this week, and total pending tasks. Used for dashboard widgets.",
            responses = {
                    @ApiResponse(
                            responseCode = "200",
                            description = "Task summary counts",
                            content = @Content(
                                    mediaType = "application/json",
                                    schema = @Schema(implementation = ToDoTaskSummaryDTO.class)
                            )
                    )
            }
    )
    @GetMapping("/summary")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<ToDoTaskSummaryDTO> getTaskSummary() {
        ToDoTaskSummaryDTO taskSummary = toDoTaskService.getTaskSummary();
        return new ResponseEntity<>(taskSummary, HttpStatus.OK);
    }
}
