package gr.aueb.cf.bluemargarita.rest;

import gr.aueb.cf.bluemargarita.core.enums.TaskStatus;
import gr.aueb.cf.bluemargarita.core.exceptions.EntityNotFoundException;
import gr.aueb.cf.bluemargarita.core.exceptions.ValidationException;
import gr.aueb.cf.bluemargarita.core.filters.Paginated;
import gr.aueb.cf.bluemargarita.core.filters.ProductFilters;
import gr.aueb.cf.bluemargarita.core.filters.ToDoTaskFilters;
import gr.aueb.cf.bluemargarita.dto.product.MispricedProductAlertDTO;
import gr.aueb.cf.bluemargarita.dto.product.ProductListItemDTO;
import gr.aueb.cf.bluemargarita.dto.stock.StockAlertDTO;
import gr.aueb.cf.bluemargarita.dto.task.*;
import gr.aueb.cf.bluemargarita.service.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
@SecurityRequirement(name = "Bearer Authentication")
@Tag(name = "Dashboard", description = "Dashboard APIs providing complete business overview, inventory alerts, and task management for the jewelry business")
public class DashboardRestController {

    private final ISaleService saleService;
    private final IPurchaseService purchaseService;
    private final IProductService productService;
    private final IStockManagementService stockManagementService;
    private final IToDoTaskService toDoTaskService;

    // =============================================================================
    // DASHBOARD OVERVIEW - SINGLE ENDPOINT FOR ALL DATA
    // =============================================================================

    @Operation(
            summary = "Get complete dashboard overview",
            description = "Retrieves all dashboard data in a single optimized request: weekly/monthly sales summaries, " +
                    "5 recent sales, 5 recent purchases, 5 low stock products, top 5 products this month, and organized task lists. " +
                    "Single endpoint for entire dashboard page load.",
            responses = {
                    @ApiResponse(
                            responseCode = "200",
                            description = "Complete dashboard overview with all widgets data",
                            content = @Content(
                                    mediaType = "application/json",
                                    schema = @Schema(implementation = Map.class)
                            )
                    )
            }
    )
    @GetMapping("/overview")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<Map<String, Object>> getDashboardOverview() {
        Map<String, Object> overview = new HashMap<>();

        // Sales summaries
        overview.put("weeklySales", saleService.getWeeklySalesSummary());
        overview.put("monthlySales", saleService.getMonthlySalesSummary());

        // Recent activity (5 each)
        overview.put("recentSales", saleService.getRecentSales(5));
        overview.put("recentPurchases", purchaseService.getRecentPurchases(5));

        // Inventory alerts (5 lowest stock)
        Pageable lowStockPageable = PageRequest.of(0, 5, Sort.by(Sort.Direction.ASC, "stock"));
        overview.put("lowStockProducts", stockManagementService.getLowStockProducts(5));

        // Top products for this month (5 best performers)
        LocalDate monthStart = LocalDate.now().withDayOfMonth(1);
        LocalDate monthEnd = LocalDate.now().withDayOfMonth(LocalDate.now().lengthOfMonth());
        overview.put("topProductsThisMonth", productService.getTopProductsByMonthlyRevenue(monthStart, monthEnd, 5));

        // Tasks (organized: overdue/today + this week)
        overview.put("dashboardTasks", toDoTaskService.getDashboardTasks(5));

        // Pricing alerts - products where selling price is significantly different from suggested price
        overview.put("mispricedProducts", productService.getMispricedProductsAlert(BigDecimal.valueOf(20), 5));

        return new ResponseEntity<>(overview, HttpStatus.OK);
    }

    // =============================================================================
    // "VIEW ALL" FUNCTIONALITY - WHEN CLICKING "VIEW ALL" FROM WIDGETS
    // =============================================================================

    @Operation(
            summary = "Get all low stock products",
            description = "Retrieves all products with low stock levels with pagination. Used when clicking 'View All' from dashboard low stock widget.",
            responses = {
                    @ApiResponse(
                            responseCode = "200",
                            description = "Paginated list of all low stock products",
                            content = @Content(
                                    mediaType = "application/json",
                                    schema = @Schema(implementation = Paginated.class)
                            )
                    )
            }
    )
    @GetMapping("/low-stock-products/all")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<Paginated<StockAlertDTO>> getAllLowStockProducts(
            @Parameter(description = "Product name or code filter") @RequestParam(required = false) String nameOrCode,
            @Parameter(description = "Category ID filter") @RequestParam(required = false) Long categoryId,
            @Parameter(description = "Procedure ID filter") @RequestParam(required = false) Long procedureId,
            @Parameter(description = "Material name filter") @RequestParam(required = false) String materialName,
            @Parameter(description = "Material ID filter") @RequestParam(required = false) Long materialId,
            @Parameter(description = "Minimum stock filter") @RequestParam(required = false) Integer minStock,
            @Parameter(description = "Maximum stock filter") @RequestParam(required = false) Integer maxStock,
            @Parameter(description = "Active status filter") @RequestParam(required = false) Boolean isActive,
            @Parameter(description = "Page number (0-based)") @RequestParam(required = false, defaultValue = "0") int page,
            @Parameter(description = "Page size") @RequestParam(required = false, defaultValue = "20") int pageSize,
            @Parameter(description = "Sort field") @RequestParam(required = false, defaultValue = "stock") String sortBy,
            @Parameter(description = "Sort direction") @RequestParam(required = false, defaultValue = "ASC") String sortDirection) {

        ProductFilters filters = ProductFilters.builder()
                .nameOrCode(nameOrCode)
                .categoryId(categoryId)
                .procedureId(procedureId)
                .materialName(materialName)
                .materialId(materialId)
                .minStock(minStock)
                .maxStock(maxStock)
                .isActive(isActive)
                .lowStock(true)
                .build();

        // Set pagination properties using request parameters (with defaults)
        filters.setPage(page);
        filters.setPageSize(pageSize);
        filters.setSortBy(sortBy);
        filters.setSortDirection(Sort.Direction.valueOf(sortDirection.toUpperCase()));

        Paginated<StockAlertDTO> lowStockProducts = stockManagementService.getAllLowStockProductsPaginated(filters);
        return new ResponseEntity<>(lowStockProducts, HttpStatus.OK);
    }

    @Operation(
            summary = "Get all mispriced products",
            description = "Retrieves all products with significant pricing differences with pagination. " +
                    "Used when clicking 'View All' from dashboard mispriced products widget.",
            responses = {
                    @ApiResponse(
                            responseCode = "200",
                            description = "Paginated list of all mispriced products",
                            content = @Content(
                                    mediaType = "application/json",
                                    schema = @Schema(implementation = Paginated.class)
                            )
                    )
            }
    )
    @GetMapping("/mispriced-products/all")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<Paginated<MispricedProductAlertDTO>> getAllMispricedProducts(
            @Parameter(description = "Threshold percentage for price difference")
            @RequestParam(required = false, defaultValue = "20") BigDecimal thresholdPercentage,
            @Parameter(description = "Product name or code filter")
            @RequestParam(required = false) String nameOrCode,
            @Parameter(description = "Category ID filter")
            @RequestParam(required = false) Long categoryId,
            @Parameter(description = "Issue type filter")
            @RequestParam(required = false) String issueType,
            @Parameter(description = "Page number (0-based)")
            @RequestParam(required = false, defaultValue = "0") int page,
            @Parameter(description = "Page size")
            @RequestParam(required = false, defaultValue = "20") int pageSize,
            @Parameter(description = "Sort field")
            @RequestParam(required = false, defaultValue = "priceDifferencePercentage") String sortBy,
            @Parameter(description = "Sort direction")
            @RequestParam(required = false, defaultValue = "DESC") String sortDirection) {

        Pageable pageable = PageRequest.of(page, pageSize,
                Sort.by(Sort.Direction.valueOf(sortDirection.toUpperCase()), sortBy));

        Paginated<MispricedProductAlertDTO> mispricedProducts =
                productService.getAllMispricedProductsPaginated(thresholdPercentage, pageable);

        return new ResponseEntity<>(mispricedProducts, HttpStatus.OK);
    }


    @Operation(
            summary = "Get all tasks with filters",
            description = "Retrieves all tasks with pagination and filtering. Used when clicking 'View All Tasks' from dashboard task widget.",
            responses = {
                    @ApiResponse(
                            responseCode = "200",
                            description = "Paginated list of all tasks with filtering",
                            content = @Content(
                                    mediaType = "application/json",
                                    schema = @Schema(implementation = Paginated.class)
                            )
                    )
            }
    )
    @GetMapping("/tasks/all")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<Paginated<ToDoTaskReadOnlyDTO>> getAllTasks(
            @Parameter(description = "Task status filter") @RequestParam(required = false) String status,
            @Parameter(description = "Date from filter") @RequestParam(required = false) LocalDate dateFrom,
            @Parameter(description = "Date to filter") @RequestParam(required = false) LocalDate dateTo,
            @Parameter(description = "Page number (0-based)") @RequestParam(required = false, defaultValue = "0") int page,
            @Parameter(description = "Page size") @RequestParam(required = false, defaultValue = "20") int pageSize,
            @Parameter(description = "Sort field") @RequestParam(required = false, defaultValue = "date") String sortBy,
            @Parameter(description = "Sort direction") @RequestParam(required = false, defaultValue = "ASC") String sortDirection) {

        ToDoTaskFilters filters = ToDoTaskFilters.builder()
                .status(TaskStatus.valueOf(status))
                .dateFrom(dateFrom)
                .dateTo(dateTo)
                .build();

        // Set pagination properties
        filters.setPage(page);
        filters.setPageSize(pageSize);
        filters.setSortBy(sortBy);
        filters.setSortDirection(Sort.Direction.valueOf(sortDirection.toUpperCase()));

        Paginated<ToDoTaskReadOnlyDTO> tasks = toDoTaskService.getFilteredTasks(filters);
        return new ResponseEntity<>(tasks, HttpStatus.OK);
    }

    // =============================================================================
    // TASK MANAGEMENT - CRUD OPERATIONS FROM DASHBOARD
    // =============================================================================

    @Operation(
            summary = "Create a new task",
            description = "Creates a new todo task. Used from dashboard quick add functionality or task management.",
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
    @PostMapping("/tasks")
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
            summary = "Update a task",
            description = "Updates an existing task's description and/or date. Does not change completion status. Used from dashboard or task management.",
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
    @PutMapping("/tasks/{id}")
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
            description = "Updates a task's completion status (completed, pending, cancelled). Used from dashboard quick actions or task management.",
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
    @PatchMapping("/tasks/{id}/status")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<ToDoTaskReadOnlyDTO> updateTaskStatus(
            @PathVariable Long id,
            @Valid @RequestBody ToDoTaskStatusUpdateDTO statusUpdateDTO,
            BindingResult bindingResult) throws ValidationException, EntityNotFoundException {

        if (bindingResult.hasErrors()) {
            throw new ValidationException(bindingResult);
        }

        ToDoTaskReadOnlyDTO task = toDoTaskService.updateTaskStatus(statusUpdateDTO);
        return new ResponseEntity<>(task, HttpStatus.OK);
    }

    @Operation(
            summary = "Delete a task",
            description = "Completely deletes a task. Used from dashboard or task management. Requires ADMIN role for security.",
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
    @DeleteMapping("/tasks/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteTask(@PathVariable Long id) throws EntityNotFoundException {
        toDoTaskService.deleteTask(id);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }

    @Operation(
            summary = "Get task by ID",
            description = "Retrieves a single task by ID. Used for task detail view or editing forms.",
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
    @GetMapping("/tasks/{id}")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<ToDoTaskReadOnlyDTO> getTaskById(@PathVariable Long id) throws EntityNotFoundException {
        ToDoTaskReadOnlyDTO task = toDoTaskService.getTaskById(id);
        return new ResponseEntity<>(task, HttpStatus.OK);
    }
}
