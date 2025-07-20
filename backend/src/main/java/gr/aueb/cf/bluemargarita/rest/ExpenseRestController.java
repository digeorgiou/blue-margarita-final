package gr.aueb.cf.bluemargarita.rest;

import gr.aueb.cf.bluemargarita.core.enums.ExpenseType;
import gr.aueb.cf.bluemargarita.core.exceptions.EntityAlreadyExistsException;
import gr.aueb.cf.bluemargarita.core.exceptions.EntityNotFoundException;
import gr.aueb.cf.bluemargarita.core.exceptions.EntityNotAuthorizedException;
import gr.aueb.cf.bluemargarita.core.exceptions.ValidationException;
import gr.aueb.cf.bluemargarita.core.filters.ExpenseFilters;
import gr.aueb.cf.bluemargarita.dto.expense.*;
import gr.aueb.cf.bluemargarita.service.IExpenseService;
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
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/expense-management")
@RequiredArgsConstructor
@SecurityRequirement(name = "Bearer Authentication")
@Tag(name = "Expense Management", description = "APIs for managing business expenses including CRUD operations, filtering, and expense analytics")
public class ExpenseRestController {

    private final IExpenseService expenseService;

    // =============================================================================
    // PAGE INITIALIZATION - LOAD FORM DATA
    // =============================================================================

    @Operation(
            summary = "Get Expense Management page initialization data",
            description = "Retrieves all necessary data for the Expense Management page in a single request: expense types dropdown and recent expenses overview. Optimized for page load.",
            responses = {
                    @ApiResponse(
                            responseCode = "200",
                            description = "Complete Expense Management page initialization data",
                            content = @Content(
                                    mediaType = "application/json",
                                    schema = @Schema(implementation = Map.class)
                            )
                    )
            }
    )
    @GetMapping("/init")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<Map<String, Object>> getExpenseManagementPageData() {
        Map<String, Object> pageData = new HashMap<>();

        // Form dropdown data
        pageData.put("expenseTypes", getExpenseTypesMap());

        // Recent expenses for quick overview
        pageData.put("recentExpenses", expenseService.getRecentExpenses(10));

        return new ResponseEntity<>(pageData, HttpStatus.OK);
    }

    // =============================================================================
    // CORE CRUD OPERATIONS
    // =============================================================================

    @Operation(
            summary = "Create a new expense",
            description = "Creates a new business expense record. Can optionally be linked to a purchase for automatic expense tracking. Used in expense management.",
            responses = {
                    @ApiResponse(
                            responseCode = "201",
                            description = "Expense created successfully",
                            content = @Content(
                                    mediaType = "application/json",
                                    schema = @Schema(implementation = ExpenseReadOnlyDTO.class)
                            )
                    ),
                    @ApiResponse(
                            responseCode = "400",
                            description = "Invalid expense data or validation errors",
                            content = @Content(mediaType = "application/json")
                    ),
                    @ApiResponse(
                            responseCode = "404",
                            description = "User or purchase not found",
                            content = @Content(mediaType = "application/json")
                    ),
                    @ApiResponse(
                            responseCode = "409",
                            description = "Purchase already has an expense linked",
                            content = @Content(mediaType = "application/json")
                    )
            }
    )
    @PostMapping
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<ExpenseReadOnlyDTO> createExpense(
            @Valid @RequestBody ExpenseInsertDTO expenseInsertDTO,
            BindingResult bindingResult) throws EntityNotFoundException, ValidationException, EntityAlreadyExistsException {

        if (bindingResult.hasErrors()) {
            throw new ValidationException(bindingResult);
        }

        ExpenseReadOnlyDTO expense = expenseService.createExpense(expenseInsertDTO);
        return new ResponseEntity<>(expense, HttpStatus.CREATED);
    }

    @Operation(
            summary = "Update an existing expense",
            description = "Updates an existing expense record including description, amount, date, type, and purchase linking. Used in expense management.",
            responses = {
                    @ApiResponse(
                            responseCode = "200",
                            description = "Expense updated successfully",
                            content = @Content(
                                    mediaType = "application/json",
                                    schema = @Schema(implementation = ExpenseReadOnlyDTO.class)
                            )
                    ),
                    @ApiResponse(
                            responseCode = "400",
                            description = "Invalid expense data or validation errors",
                            content = @Content(mediaType = "application/json")
                    ),
                    @ApiResponse(
                            responseCode = "403",
                            description = "Forbidden - Path ID does not match request body ID",
                            content = @Content(mediaType = "application/json")
                    ),
                    @ApiResponse(
                            responseCode = "404",
                            description = "Expense, user, or purchase not found",
                            content = @Content(mediaType = "application/json")
                    ),
                    @ApiResponse(
                            responseCode = "409",
                            description = "Purchase already has another expense linked",
                            content = @Content(mediaType = "application/json")
                    )
            }
    )
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<ExpenseReadOnlyDTO> updateExpense(
            @PathVariable Long id,
            @Valid @RequestBody ExpenseUpdateDTO expenseUpdateDTO,
            BindingResult bindingResult) throws EntityNotFoundException, ValidationException, EntityNotAuthorizedException, EntityAlreadyExistsException {

        if (bindingResult.hasErrors()) {
            throw new ValidationException(bindingResult);
        }

        // Ensure the path ID matches the DTO ID
        if (!id.equals(expenseUpdateDTO.expenseId())) {
            throw new EntityNotAuthorizedException("Expense", "Path ID does not match request body ID - unauthorized modification attempt");
        }

        ExpenseReadOnlyDTO expense = expenseService.updateExpense(expenseUpdateDTO);
        return new ResponseEntity<>(expense, HttpStatus.OK);
    }

    @Operation(
            summary = "Delete an expense",
            description = "Completely deletes an expense record. If the expense is linked to a purchase, it will be unlinked first. Requires ADMIN role.",
            responses = {
                    @ApiResponse(
                            responseCode = "204",
                            description = "Expense deleted successfully"
                    ),
                    @ApiResponse(
                            responseCode = "404",
                            description = "Expense not found",
                            content = @Content(mediaType = "application/json")
                    )
            }
    )
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteExpense(@PathVariable Long id) throws EntityNotFoundException {
        expenseService.deleteExpense(id);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }

    // =============================================================================
    // EXPENSE LISTING AND FILTERING
    // =============================================================================

    @Operation(
            summary = "Search expenses with advanced filtering and summary",
            description = "Searches expenses with pagination and filtering support. Includes optional summary calculation for filtered results ≤ 100. Main endpoint for expense management page listing with advanced search capabilities.",
            responses = {
                    @ApiResponse(
                            responseCode = "200",
                            description = "Paginated list of expenses with optional summary",
                            content = @Content(
                                    mediaType = "application/json",
                                    schema = @Schema(implementation = PaginatedFilteredExpensesWithSummary.class)
                            )
                    )
            }
    )
    @GetMapping("/search")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<PaginatedFilteredExpensesWithSummary> searchExpensesWithSummary(
            @Parameter(description = "Expense description filter") @RequestParam(required = false) String description,
            @Parameter(description = "Expense date from (inclusive)") @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate expenseDateFrom,
            @Parameter(description = "Expense date to (inclusive)") @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate expenseDateTo,
            @Parameter(description = "Expense type filter") @RequestParam(required = false) String expenseType,
            @Parameter(description = "Purchase-linked expenses only") @RequestParam(required = false) Boolean isPurchase,
            @Parameter(description = "Page number (0-based)") @RequestParam(required = false, defaultValue = "0") int page,
            @Parameter(description = "Page size") @RequestParam(required = false, defaultValue = "20") int pageSize,
            @Parameter(description = "Sort field") @RequestParam(required = false, defaultValue = "expenseDate") String sortBy,
            @Parameter(description = "Sort direction") @RequestParam(required = false, defaultValue = "DESC") String sortDirection) {

        ExpenseFilters filters = ExpenseFilters.builder()
                .description(description)
                .expenseDateFrom(expenseDateFrom)
                .expenseDateTo(expenseDateTo)
                .expenseType(expenseType)
                .isPurchase(isPurchase)
                .build();

        // Set pagination properties using request parameters (with defaults)
        filters.setPage(page);
        filters.setPageSize(pageSize);
        filters.setSortBy(sortBy);
        filters.setSortDirection(Sort.Direction.valueOf(sortDirection.toUpperCase()));

        PaginatedFilteredExpensesWithSummary expenses = expenseService.searchExpensesWithSummary(filters);
        return new ResponseEntity<>(expenses, HttpStatus.OK);
    }

    // =============================================================================
    // EXPENSE ANALYTICS
    // =============================================================================

    @Operation(
            summary = "Get expense breakdown by type",
            description = "Retrieves expense breakdown by type for analytics and reporting. Shows total amount, count, and percentage for each expense type in the specified date range.",
            responses = {
                    @ApiResponse(
                            responseCode = "200",
                            description = "Expense breakdown by type with totals and percentages",
                            content = @Content(
                                    mediaType = "application/json",
                                    schema = @Schema(implementation = ExpenseTypeBreakdownDTO.class)
                            )
                    )
            }
    )
    @GetMapping("/analytics/breakdown-by-type")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<List<ExpenseTypeBreakdownDTO>> getExpenseBreakdownByType(
            @Parameter(description = "Start date for analysis") @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateFrom,
            @Parameter(description = "End date for analysis") @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateTo) {

        List<ExpenseTypeBreakdownDTO> breakdown = expenseService.getExpenseBreakdownByType(dateFrom, dateTo);
        return new ResponseEntity<>(breakdown, HttpStatus.OK);
    }

    // =============================================================================
    // FORM HELPER ENDPOINTS
    // =============================================================================

    @Operation(
            summary = "Get available expense types",
            description = "Returns all available expense types for dropdown selection. Converts enum values to user-friendly display names.",
            responses = {
                    @ApiResponse(
                            responseCode = "200",
                            description = "Map of expense types with display names",
                            content = @Content(
                                    mediaType = "application/json",
                                    schema = @Schema(implementation = Map.class)
                            )
                    )
            }
    )
    @GetMapping("/expense-types")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<Map<String, String>> getExpenseTypes() {
        Map<String, String> expenseTypes = getExpenseTypesMap();
        return new ResponseEntity<>(expenseTypes, HttpStatus.OK);
    }

    // =============================================================================
    // PRIVATE HELPER METHODS
    // =============================================================================

    private Map<String, String> getExpenseTypesMap() {
        return Arrays.stream(ExpenseType.values())
                .collect(Collectors.toMap(
                        Enum::name,
                        ExpenseType::getDisplayName
                ));
    }
}
