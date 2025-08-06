package gr.aueb.cf.bluemargarita.rest;

import gr.aueb.cf.bluemargarita.core.exceptions.EntityAlreadyExistsException;
import gr.aueb.cf.bluemargarita.core.exceptions.EntityNotFoundException;
import gr.aueb.cf.bluemargarita.core.exceptions.ValidationException;
import gr.aueb.cf.bluemargarita.core.filters.Paginated;
import gr.aueb.cf.bluemargarita.core.filters.ProcedureFilters;
import gr.aueb.cf.bluemargarita.core.filters.ProductFilters;
import gr.aueb.cf.bluemargarita.dto.material.MaterialSearchResultDTO;
import gr.aueb.cf.bluemargarita.dto.procedure.*;
import gr.aueb.cf.bluemargarita.dto.product.PriceRecalculationResultDTO;
import gr.aueb.cf.bluemargarita.dto.product.ProductUsageDTO;
import gr.aueb.cf.bluemargarita.service.IProcedureService;
import gr.aueb.cf.bluemargarita.service.IProductService;
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
import java.util.List;

@RestController
@RequestMapping("/api/procedures")
@RequiredArgsConstructor
@SecurityRequirement(name = "Bearer Authentication")
@Tag(name = "Procedure Management", description = "APIs for managing production procedures in the jewelry business")
public class ProcedureRestController {

    private final IProcedureService procedureService;
    private final IProductService productService;

    // =============================================================================
    // CORE CRUD OPERATIONS - FOR PROCEDURE MANAGEMENT PAGE
    // =============================================================================

    @Operation(
            summary = "Create a new procedure",
            description = "Creates a new production procedure with unique name validation. Used in procedure management.",
            responses = {
                    @ApiResponse(
                            responseCode = "201",
                            description = "Procedure created successfully",
                            content = @Content(
                                    mediaType = "application/json",
                                    schema = @Schema(implementation = ProcedureReadOnlyDTO.class)
                            )
                    ),
                    @ApiResponse(
                            responseCode = "400",
                            description = "Validation errors",
                            content = @Content(mediaType = "application/json")
                    ),
                    @ApiResponse(
                            responseCode = "409",
                            description = "Procedure with name already exists",
                            content = @Content(mediaType = "application/json")
                    )
            }
    )
    @PostMapping
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<ProcedureReadOnlyDTO> createProcedure(
            @Valid @RequestBody ProcedureInsertDTO procedureInsertDTO,
            BindingResult bindingResult) throws ValidationException, EntityAlreadyExistsException, EntityNotFoundException {

        if (bindingResult.hasErrors()) {
            throw new ValidationException(bindingResult);
        }

        ProcedureReadOnlyDTO procedure = procedureService.createProcedure(procedureInsertDTO);
        return new ResponseEntity<>(procedure, HttpStatus.CREATED);
    }

    @Operation(
            summary = "Update procedure",
            description = "Updates an existing procedure's information with unique name validation. Used in procedure management.",
            responses = {
                    @ApiResponse(
                            responseCode = "200",
                            description = "Procedure updated successfully",
                            content = @Content(
                                    mediaType = "application/json",
                                    schema = @Schema(implementation = ProcedureReadOnlyDTO.class)
                            )
                    ),
                    @ApiResponse(
                            responseCode = "400",
                            description = "Validation errors",
                            content = @Content(mediaType = "application/json")
                    ),
                    @ApiResponse(
                            responseCode = "404",
                            description = "Procedure not found",
                            content = @Content(mediaType = "application/json")
                    ),
                    @ApiResponse(
                            responseCode = "409",
                            description = "Procedure with name already exists",
                            content = @Content(mediaType = "application/json")
                    )
            }
    )
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<ProcedureReadOnlyDTO> updateProcedure(
            @PathVariable Long id,
            @Valid @RequestBody ProcedureUpdateDTO procedureUpdateDTO,
            BindingResult bindingResult) throws ValidationException, EntityAlreadyExistsException, EntityNotFoundException {

        if (bindingResult.hasErrors()) {
            throw new ValidationException(bindingResult);
        }

        ProcedureReadOnlyDTO procedure = procedureService.updateProcedure(procedureUpdateDTO);
        return new ResponseEntity<>(procedure, HttpStatus.OK);
    }

    @Operation(
            summary = "Delete procedure",
            description = "Deletes a procedure. Performs soft delete if procedure is used in products, hard delete otherwise. Requires ADMIN role.",
            responses = {
                    @ApiResponse(
                            responseCode = "204",
                            description = "Procedure deleted successfully"
                    ),
                    @ApiResponse(
                            responseCode = "404",
                            description = "Procedure not found",
                            content = @Content(mediaType = "application/json")
                    )
            }
    )
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteProcedure(@PathVariable Long id) throws EntityNotFoundException {
        procedureService.deleteProcedure(id);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }

    @Operation(
            summary = "Get procedure basic info by ID",
            description = "Retrieves basic procedure information by ID. Used for editing forms and quick lookups.",
            responses = {
                    @ApiResponse(
                            responseCode = "200",
                            description = "Procedure found",
                            content = @Content(
                                    mediaType = "application/json",
                                    schema = @Schema(implementation = ProcedureReadOnlyDTO.class)
                            )
                    ),
                    @ApiResponse(
                            responseCode = "404",
                            description = "Procedure not found",
                            content = @Content(mediaType = "application/json")
                    )
            }
    )
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<ProcedureReadOnlyDTO> getProcedureById(@PathVariable Long id) throws EntityNotFoundException {
        ProcedureReadOnlyDTO procedure = procedureService.getProcedureById(id);
        return new ResponseEntity<>(procedure, HttpStatus.OK);
    }

    // =============================================================================
    // PROCEDURE VIEWING AND LISTING - FOR PROCEDURE MANAGEMENT PAGE
    // =============================================================================

    @Operation(
            summary = "Get procedures with pagination and filters",
            description = "Retrieves procedures with pagination and filtering support. Main endpoint for procedure management page listing.",
            responses = {
                    @ApiResponse(
                            responseCode = "200",
                            description = "Paginated list of procedures",
                            content = @Content(
                                    mediaType = "application/json",
                                    schema = @Schema(implementation = Paginated.class)
                            )
                    )
            }
    )
    @GetMapping
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<Paginated<ProcedureReadOnlyDTO>> getProceduresFilteredPaginated(
            @Parameter(description = "Procedure name filter") @RequestParam(required = false) String name,
            @Parameter(description = "Active status filter") @RequestParam(required = false) Boolean isActive,
            @Parameter(description = "Page number (0-based)") @RequestParam(required = false, defaultValue = "0") int page,
            @Parameter(description = "Page size") @RequestParam(required = false, defaultValue = "20") int pageSize,
            @Parameter(description = "Sort field") @RequestParam(required = false, defaultValue = "name") String sortBy,
            @Parameter(description = "Sort direction") @RequestParam(required = false, defaultValue = "ASC") String sortDirection) {

        ProcedureFilters filters = ProcedureFilters.builder()
                .name(name)
                .isActive(isActive)
                .build();

        // Set pagination properties using request parameters (with defaults)
        filters.setPage(page);
        filters.setPageSize(pageSize);
        filters.setSortBy(sortBy);
        filters.setSortDirection(Sort.Direction.valueOf(sortDirection.toUpperCase()));

        Paginated<ProcedureReadOnlyDTO> procedures = procedureService.getProceduresFilteredPaginated(filters);
        return new ResponseEntity<>(procedures, HttpStatus.OK);
    }

    @Operation(
            summary = "Get procedure detailed view",
            description = "Retrieves comprehensive procedure information including usage analytics and product breakdown. Used for procedure detail modal/page.",
            responses = {
                    @ApiResponse(
                            responseCode = "200",
                            description = "Procedure detailed view with analytics",
                            content = @Content(
                                    mediaType = "application/json",
                                    schema = @Schema(implementation = ProcedureDetailedViewDTO.class)
                            )
                    ),
                    @ApiResponse(
                            responseCode = "404",
                            description = "Procedure not found",
                            content = @Content(mediaType = "application/json")
                    )
            }
    )
    @GetMapping("/{id}/details")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<ProcedureDetailedViewDTO> getProcedureDetailedView(@PathVariable Long id) throws EntityNotFoundException {
        ProcedureDetailedViewDTO procedureDetails = procedureService.getProcedureDetailedById(id);
        return new ResponseEntity<>(procedureDetails, HttpStatus.OK);
    }

    @Operation(
            summary = "Search procedures for autocomplete",
            description = "Searches procedures for autocomplete functionality when creating products. Returns procedures matching name for easy selection.",
            responses = {
                    @ApiResponse(
                            responseCode = "200",
                            description = "List of procedures matching search term",
                            content = @Content(
                                    mediaType = "application/json",
                                    schema = @Schema(implementation = ProcedureForDropdownDTO.class)
                            )
                    )
            }
    )
    @GetMapping("/search")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<List<ProcedureForDropdownDTO>> searchMaterials(
            @Parameter(description = "Search term (procedure name)", required = true)
            @RequestParam String searchTerm) {

        List<ProcedureForDropdownDTO> procedures = procedureService.searchProcedureForAutocomplete(searchTerm);
        return new ResponseEntity<>(procedures, HttpStatus.OK);
    }

    // =============================================================================
    // PRODUCT RELATIONSHIP OPERATIONS
    // =============================================================================

    @Operation(
            summary = "Get products using procedure with filtering",
            description = "Retrieves paginated and filtered list of products using specific procedure. " +
                    "Supports filtering by product name/productCode, category, material, price range, stock levels, and active status. " +
                    "Used for procedure detail view product listing with advanced filtering capabilities.",
            responses = {
                    @ApiResponse(
                            responseCode = "200",
                            description = "Paginated list of products using this procedure",
                            content = @Content(
                                    mediaType = "application/json",
                                    schema = @Schema(implementation = Paginated.class)
                            )
                    ),
                    @ApiResponse(
                            responseCode = "404",
                            description = "Procedure not found",
                            content = @Content(mediaType = "application/json")
                    )
            }
    )
    @GetMapping("/{id}/products")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<Paginated<ProductUsageDTO>> getAllProductsUsingProcedure(
            @PathVariable Long id,
            @Parameter(description = "Product name or productCode search") @RequestParam(required = false) String nameOrCode,
            @Parameter(description = "Category filter") @RequestParam(required = false) Long categoryId,
            @Parameter(description = "Material name search (products that use BOTH this procedure AND contain the material)") @RequestParam(required = false) String materialName,
            @Parameter(description = "Material ID filter (products that use BOTH this procedure AND the specified material)") @RequestParam(required = false) Long materialId,
            @Parameter(description = "Minimum price filter") @RequestParam(required = false) BigDecimal minPrice,
            @Parameter(description = "Maximum price filter") @RequestParam(required = false) BigDecimal maxPrice,
            @Parameter(description = "Minimum stock filter") @RequestParam(required = false) Integer minStock,
            @Parameter(description = "Maximum stock filter") @RequestParam(required = false) Integer maxStock,
            @Parameter(description = "Active status filter") @RequestParam(required = false) Boolean isActive,
            @Parameter(description = "Low stock filter") @RequestParam(required = false) Boolean lowStock,
            @Parameter(description = "Page number (0-based)") @RequestParam(required = false, defaultValue = "0") int page,
            @Parameter(description = "Page size") @RequestParam(required = false, defaultValue = "20") int pageSize,
            @Parameter(description = "Sort field") @RequestParam(required = false, defaultValue = "finalSellingPriceRetail") String sortBy,
            @Parameter(description = "Sort direction") @RequestParam(required = false, defaultValue = "DESC") String sortDirection) throws EntityNotFoundException {

        // Build filters object
        ProductFilters filters = ProductFilters.builder()
                .nameOrCode(nameOrCode)
                .categoryId(categoryId)
                .materialName(materialName) // Allow filtering by material for cross-filtering
                .materialId(materialId)     // Allow filtering by material ID for cross-filtering
                .minPrice(minPrice)
                .maxPrice(maxPrice)
                .minStock(minStock)
                .maxStock(maxStock)
                .isActive(isActive)
                .lowStock(lowStock)
                .build();

        // Set pagination properties
        filters.setPage(page);
        filters.setPageSize(pageSize);
        filters.setSortBy(sortBy);
        filters.setSortDirection(Sort.Direction.valueOf(sortDirection.toUpperCase()));

        Paginated<ProductUsageDTO> products = procedureService.getAllProductsUsingProcedure(id, filters);
        return new ResponseEntity<>(products, HttpStatus.OK);
    }

    // =============================================================================
    // DROPDOWN AND SELECTION ENDPOINTS - FOR PRODUCT FORMS
    // =============================================================================

    @Operation(
            summary = "Get procedures for dropdown",
            description = "Retrieves active procedures formatted for dropdown selection with ID and name only. Used in product creation and management forms.",
            responses = {
                    @ApiResponse(
                            responseCode = "200",
                            description = "List of procedures for dropdown",
                            content = @Content(
                                    mediaType = "application/json",
                                    schema = @Schema(implementation = ProcedureForDropdownDTO.class)
                            )
                    )
            }
    )
    @GetMapping("/dropdown")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<List<ProcedureForDropdownDTO>> getProceduresForDropdown() {
        List<ProcedureForDropdownDTO> procedures = procedureService.getActiveProceduresForDropdown();
        return new ResponseEntity<>(procedures, HttpStatus.OK);
    }

}