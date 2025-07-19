package gr.aueb.cf.bluemargarita.service;

import gr.aueb.cf.bluemargarita.core.enums.TaskStatus;
import gr.aueb.cf.bluemargarita.core.exceptions.EntityNotFoundException;
import gr.aueb.cf.bluemargarita.core.filters.Paginated;
import gr.aueb.cf.bluemargarita.core.filters.ToDoTaskFilters;
import gr.aueb.cf.bluemargarita.core.specifications.ToDoTaskSpecification;
import gr.aueb.cf.bluemargarita.dto.task.*;
import gr.aueb.cf.bluemargarita.mapper.Mapper;
import gr.aueb.cf.bluemargarita.model.ToDoTask;
import gr.aueb.cf.bluemargarita.repository.ToDoTaskRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.temporal.TemporalAdjusters;
import java.util.List;
import java.util.stream.Collectors;

@SuppressWarnings("unused")
@Service
public class ToDoTaskService implements IToDoTaskService {

    private static final Logger LOGGER = LoggerFactory.getLogger(ToDoTaskService.class);

    private final ToDoTaskRepository taskRepository;
    private final Mapper mapper;

    @Autowired
    public ToDoTaskService(ToDoTaskRepository taskRepository, Mapper mapper) {
        this.taskRepository = taskRepository;
        this.mapper = mapper;
    }

    // =============================================================================
    // CORE CRUD OPERATIONS
    // =============================================================================

    @Override
    @Transactional(rollbackFor = Exception.class)
    public ToDoTaskReadOnlyDTO createTask(ToDoTaskInsertDTO dto) {

        ToDoTask task = ToDoTask.builder()
                .description(dto.description())
                .date(dto.date())
                .status(TaskStatus.PENDING)
                .dateCompleted(null)
                .build();

        ToDoTask savedTask = taskRepository.save(task);

        LOGGER.info("Task created with id: {}", savedTask.getId());

        return mapper.mapToToDoTaskReadOnlyDTO(savedTask);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public ToDoTaskReadOnlyDTO updateTask(ToDoTaskUpdateDTO dto) throws EntityNotFoundException {

        ToDoTask existingTask = getTaskEntityById(dto.taskId());

        // Update description and date only
        existingTask.setDescription(dto.description());
        existingTask.setDate(dto.date());

        ToDoTask savedTask = taskRepository.save(existingTask);

        LOGGER.info("Task {} updated", savedTask.getId());

        return mapper.mapToToDoTaskReadOnlyDTO(savedTask);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public ToDoTaskReadOnlyDTO updateTaskStatus(ToDoTaskStatusUpdateDTO dto) throws EntityNotFoundException {

        ToDoTask task = getTaskEntityById(dto.taskId());

        switch (dto.status()) {
            case COMPLETED:
                task.markAsCompleted();
                break;
            case PENDING:
                task.markAsPending();
                break;
            case CANCELLED:
                task.markAsCancelled();
                break;
        }

        ToDoTask savedTask = taskRepository.save(task);

        LOGGER.info("Task {} status updated to {}", savedTask.getId(), dto.status());

        return mapper.mapToToDoTaskReadOnlyDTO(savedTask);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void deleteTask(Long taskId) throws EntityNotFoundException {

        ToDoTask task = getTaskEntityById(taskId);

        taskRepository.delete(task);

        LOGGER.info("Task {} deleted", taskId);
    }

    // =============================================================================
    // TASK MANAGEMENT FROM DASHBOARD
    // =============================================================================

    @Override
    public DashboardToDoTasksDTO getDashboardTasks(int displayLimit) {

        LocalDate today = LocalDate.now();
        LocalDate endOfWeek = today.with(TemporalAdjusters.nextOrSame(DayOfWeek.SUNDAY));

        // Get overdue and today's tasks
        List<ToDoTask> overdueAndTodayTasks = taskRepository.findTodayAndOverdueTasks(
                today, PageRequest.of(0, displayLimit));

        // Get this week's tasks (excluding today and overdue)
        List<ToDoTask> thisWeekTasks = taskRepository.findThisWeekTasks(
                today, endOfWeek, PageRequest.of(0, displayLimit));

        // Get summary counts
        ToDoTaskSummaryDTO summary = getTaskSummary();

        boolean hasMoreTasks = (overdueAndTodayTasks.size() >= displayLimit) ||
                (thisWeekTasks.size() >= displayLimit) ||
                (summary.totalPendingCount() > (overdueAndTodayTasks.size() + thisWeekTasks.size()));

        return new DashboardToDoTasksDTO(
                overdueAndTodayTasks.stream().map(mapper::mapToToDoTaskReadOnlyDTO).collect(Collectors.toList()),
                thisWeekTasks.stream().map(mapper::mapToToDoTaskReadOnlyDTO).collect(Collectors.toList()),
                summary,
                displayLimit,
                hasMoreTasks
        );
    }

    @Override
    public Paginated<ToDoTaskReadOnlyDTO> getFilteredTasks(ToDoTaskFilters filters) {
        var filtered = taskRepository.findAll(
                getSpecsFromFilters(filters),
                filters.getPageable()
        );
        return new Paginated<>(filtered.map(mapper::mapToToDoTaskReadOnlyDTO));
    }

    @Override
    @Transactional(readOnly = true)
    public ToDoTaskSummaryDTO getTaskSummary() {

        LocalDate today = LocalDate.now();
        LocalDate endOfWeek = today.with(TemporalAdjusters.nextOrSame(DayOfWeek.SUNDAY));

        Long overdueCount = taskRepository.countOverdueTasks(today);
        Long todayCount = taskRepository.countTodayTasks(today);
        Long thisWeekCount = taskRepository.countThisWeekTasks(today, endOfWeek);
        Long totalPendingCount = taskRepository.countAllPendingTasks();

        return new ToDoTaskSummaryDTO(overdueCount, todayCount, thisWeekCount, totalPendingCount);
    }

    @Override
    public ToDoTaskReadOnlyDTO getTaskById(Long taskId) throws EntityNotFoundException {
        ToDoTask task = taskRepository.findById(taskId)
                .orElseThrow(() -> new EntityNotFoundException("ToDoTask", "Task with id=" + taskId + " was not found"));

        return mapper.mapToToDoTaskReadOnlyDTO(task);
    }

    // =============================================================================
    // PRIVATE HELPER METHODS - Entity Validation and Retrieval
    // =============================================================================

    private ToDoTask getTaskEntityById(Long taskId) throws EntityNotFoundException{
        return taskRepository.findById(taskId)
                        .orElseThrow(() -> new EntityNotFoundException("ToDoTask", "Task with id=" + taskId + " was not found"));
    }


    // =============================================================================
    // PRIVATE HELPER METHODS - Filtering and Specifications
    // =============================================================================

    private Specification<ToDoTask> getSpecsFromFilters(ToDoTaskFilters filters) {
        return Specification
                .where(ToDoTaskSpecification.hasDescription(filters.getDescription()))
                .and(ToDoTaskSpecification.hasDateBetween(filters.getDateFrom(), filters.getDateTo()))
                .and(ToDoTaskSpecification.hasTaskStatus(filters.getStatus()));
    }
}
