package gr.aueb.cf.bluemargarita.rest;

import gr.aueb.cf.bluemargarita.core.exceptions.EntityAlreadyExistsException;
import gr.aueb.cf.bluemargarita.core.exceptions.EntityInvalidArgumentException;
import gr.aueb.cf.bluemargarita.core.exceptions.EntityNotFoundException;
import gr.aueb.cf.bluemargarita.core.exceptions.ValidationException;
import gr.aueb.cf.bluemargarita.core.filters.CategoryFilters;
import gr.aueb.cf.bluemargarita.core.filters.Paginated;
import gr.aueb.cf.bluemargarita.dto.category.*;
import gr.aueb.cf.bluemargarita.dto.customer.CustomerDetailedViewDTO;
import gr.aueb.cf.bluemargarita.service.ICategoryService;
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
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/categories")
@RequiredArgsConstructor
@SecurityRequirement(name = "Bearer Authentication")
@Tag(name = "Category Management", description = "APIs for managing product categories in the jewelry business")
public class CategoryRestController {

    private final ICategoryService categoryService;

    // =============================================================================
    // CORE CRUD OPERATIONS - FOR CATEGORY MANAGEMENT PAGE
    // =============================================================================

    @Operation(
            summary = "Create a new category",
            description = "Creates a new product category with unique name validation. Used in category management.",
            responses = {
                    @ApiResponse(
                            responseCode = "201",
                            description = "Category created successfully",
                            content = @Content(
                                    mediaType = "application/json",
                                    schema = @Schema(implementation = CategoryReadOnlyDTO.class)
                            )
                    ),
                    @ApiResponse(
                            responseCode = "400",
                            description = "Validation errors",
                            content = @Content(mediaType = "application/json")
                    ),
                    @ApiResponse(
                            responseCode = "409",
                            description = "Category with name already exists",
                            content = @Content(mediaType = "application/json")
                    )
            }
    )
    @PostMapping
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<CategoryReadOnlyDTO> createCategory(
            @Valid @RequestBody CategoryInsertDTO categoryInsertDTO,
            BindingResult bindingResult) throws ValidationException, EntityAlreadyExistsException, EntityNotFoundException {

        if (bindingResult.hasErrors()) {
            throw new ValidationException(bindingResult);
        }

        CategoryReadOnlyDTO category = categoryService.createCategory(categoryInsertDTO);
        return new ResponseEntity<>(category, HttpStatus.CREATED);
    }

    @Operation(
            summary = "Update category",
            description = "Updates an existing category's information with unique name validation. Used in category management.",
            responses = {
                    @ApiResponse(
                            responseCode = "200",
                            description = "Category updated successfully",
                            content = @Content(
                                    mediaType = "application/json",
                                    schema = @Schema(implementation = CategoryReadOnlyDTO.class)
                            )
                    ),
                    @ApiResponse(
                            responseCode = "400",
                            description = "Validation errors",
                            content = @Content(mediaType = "application/json")
                    ),
                    @ApiResponse(
                            responseCode = "404",
                            description = "Category not found",
                            content = @Content(mediaType = "application/json")
                    ),
                    @ApiResponse(
                            responseCode = "409",
                            description = "Category with name already exists",
                            content = @Content(mediaType = "application/json")
                    )
            }
    )
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<CategoryReadOnlyDTO> updateCategory(
            @PathVariable Long id,
            @Valid @RequestBody CategoryUpdateDTO categoryUpdateDTO,
            BindingResult bindingResult) throws ValidationException, EntityAlreadyExistsException, EntityNotFoundException {

        if (bindingResult.hasErrors()) {
            throw new ValidationException(bindingResult);
        }

        CategoryReadOnlyDTO category = categoryService.updateCategory(categoryUpdateDTO);
        return new ResponseEntity<>(category, HttpStatus.OK);
    }

    @Operation(
            summary = "Delete category",
            description = "Deletes a category. Performs soft delete if category has products, hard delete otherwise.",
            responses = {
                    @ApiResponse(
                            responseCode = "204",
                            description = "Category deleted successfully"
                    ),
                    @ApiResponse(
                            responseCode = "404",
                            description = "Category not found",
                            content = @Content(mediaType = "application/json")
                    )
            }
    )
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<Void> deleteCategory(@PathVariable Long id) throws EntityNotFoundException {
        categoryService.deleteCategory(id);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }


    @Operation(
            summary = "Restore a soft-deleted category",
            description = "Restores a soft-deleted category by making it active again. Only accessible by admins.",
            responses = {
                     @ApiResponse(responseCode = "200", description = "Category restored successfully",
                        content = @Content(mediaType = "application/json",
                        schema = @Schema(implementation = CategoryReadOnlyDTO.class))
                     ),
                    @ApiResponse(responseCode = "404", description = "Category not found"
                    ),
                    @ApiResponse(responseCode = "400", description = "Category is already active"
                    ),
                    @ApiResponse(responseCode = "403", description = "Access denied - Admin role required"
                    )
            }
    )

    @PutMapping("/{id}/restore")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<CategoryReadOnlyDTO> restoreCategory(@PathVariable Long id) throws EntityNotFoundException, EntityInvalidArgumentException{

        CategoryReadOnlyDTO restoredCategory = categoryService.restoreCategory(id);
        return ResponseEntity.ok(restoredCategory);
    }

    @Operation(
            summary = "Get category basic info by ID",
            description = "Retrieves basic category information by ID. Used for editing forms and quick lookups.",
            responses = {
                    @ApiResponse(
                            responseCode = "200",
                            description = "Category found",
                            content = @Content(
                                    mediaType = "application/json",
                                    schema = @Schema(implementation = CategoryReadOnlyDTO.class)
                            )
                    ),
                    @ApiResponse(
                            responseCode = "404",
                            description = "Category not found",
                            content = @Content(mediaType = "application/json")
                    )
            }
    )
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<CategoryReadOnlyDTO> getCategoryById(@PathVariable Long id) throws EntityNotFoundException {
        CategoryReadOnlyDTO category = categoryService.getCategoryById(id);
        return new ResponseEntity<>(category, HttpStatus.OK);
    }



    // =============================================================================
    // CATEGORY VIEWING AND DETAILS -FOR CATEGORY MANAGEMENT PAGE
    // =============================================================================

    @Operation(
            summary = "Get categories with pagination and filters",
            description = "Retrieves categories with pagination and filtering support. Main endpoint for category management page listing.",
            responses = {
                    @ApiResponse(
                            responseCode = "200",
                            description = "Paginated list of categories",
                            content = @Content(
                                    mediaType = "application/json",
                                    schema = @Schema(implementation = Paginated.class)
                            )
                    )
            }
    )
    @GetMapping
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<Paginated<CategoryReadOnlyDTO>> getCategoriesFilteredPaginated(
            @Parameter(description = "Category name filter") @RequestParam(required = false) String name,
            @Parameter(description = "Active status filter") @RequestParam(required = false) Boolean isActive,
            @Parameter(description = "Page number (0-based)") @RequestParam(required = false, defaultValue = "0") int page,
            @Parameter(description = "Page size") @RequestParam(required = false, defaultValue = "20") int pageSize,
            @Parameter(description = "Sort field") @RequestParam(required = false, defaultValue = "name") String sortBy,
            @Parameter(description = "Sort direction") @RequestParam(required = false, defaultValue = "ASC") String sortDirection) {

        CategoryFilters filters = CategoryFilters.builder()
                .name(name)
                .isActive(isActive)
                .build();

        // Set pagination properties using request parameters (with defaults)
        filters.setPage(page);
        filters.setPageSize(pageSize);
        filters.setSortBy(sortBy);
        filters.setSortDirection(Sort.Direction.valueOf(sortDirection.toUpperCase()));

        Paginated<CategoryReadOnlyDTO> categories = categoryService.getCategoriesFilteredPaginated(filters);
        return new ResponseEntity<>(categories, HttpStatus.OK);
    }


    @Operation(
            summary = "Get category detailed view",
            description = "Retrieves comprehensive category information including sales analytics and top products. " +
                    "Used for category detail modal/page.",
            responses = {
                    @ApiResponse(
                            responseCode = "200",
                            description = "Category detailed view with analytics",
                            content = @Content(
                                    mediaType = "application/json",
                                    schema = @Schema(implementation = CategoryDetailedViewDTO.class)
                            )
                    ),
                    @ApiResponse(
                            responseCode = "404",
                            description = "Category not found",
                            content = @Content(mediaType = "application/json")
                    )
            }
    )

    @GetMapping("/{id}/details")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<CategoryDetailedViewDTO> getCategoryDetailedView(@PathVariable Long id) throws EntityNotFoundException {
        CategoryDetailedViewDTO categoryDetails = categoryService.getCategoryDetailedView(id);
        return new ResponseEntity<>(categoryDetails, HttpStatus.OK);
    }

    // =============================================================================
    // DROPDOWN AND SELECTION ENDPOINTS - FOR PRODUCT FORMS
    // =============================================================================

    @Operation(
            summary = "Get categories for dropdown",
            description = "Retrieves active categories formatted for dropdown selection with ID and name only. " +
                    "Used in product creation and management forms.",
            responses = {
                    @ApiResponse(
                            responseCode = "200",
                            description = "List of categories for dropdown",
                            content = @Content(
                                    mediaType = "application/json",
                                    schema = @Schema(implementation = CategoryForDropdownDTO.class)
                            )
                    )
            }
    )
    @GetMapping("/dropdown")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<List<CategoryForDropdownDTO>> getCategoriesForDropdown() {
        List<CategoryForDropdownDTO> categories = categoryService.getActiveCategoriesForDropdown();
        return new ResponseEntity<>(categories, HttpStatus.OK);
    }

}
