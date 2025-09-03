package gr.aueb.cf.bluemargarita.rest;

import gr.aueb.cf.bluemargarita.core.exceptions.EntityAlreadyExistsException;
import gr.aueb.cf.bluemargarita.core.exceptions.EntityInvalidArgumentException;
import gr.aueb.cf.bluemargarita.core.exceptions.EntityNotFoundException;
import gr.aueb.cf.bluemargarita.core.exceptions.ValidationException;
import gr.aueb.cf.bluemargarita.core.filters.MaterialFilters;
import gr.aueb.cf.bluemargarita.core.filters.Paginated;
import gr.aueb.cf.bluemargarita.core.filters.ProductFilters;
import gr.aueb.cf.bluemargarita.dto.location.LocationReadOnlyDTO;
import gr.aueb.cf.bluemargarita.dto.material.*;
import gr.aueb.cf.bluemargarita.dto.product.PriceRecalculationResultDTO;
import gr.aueb.cf.bluemargarita.dto.product.ProductUsageDTO;
import gr.aueb.cf.bluemargarita.service.IMaterialService;
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
@RequestMapping("/api/materials")
@RequiredArgsConstructor
@SecurityRequirement(name = "Bearer Authentication")
@Tag(name = "Material Management", description = "APIs for managing materials and raw components in the jewelry business")
public class MaterialRestController {

    private final IMaterialService materialService;
    private final IProductService productService;

    // =============================================================================
    // CORE CRUD OPERATIONS - FOR MATERIAL MANAGEMENT PAGE
    // =============================================================================

    @Operation(
            summary = "Create a new material",
            description = "Creates a new material with unique name validation. Used in material management.",
            responses = {
                    @ApiResponse(
                            responseCode = "201",
                            description = "Material created successfully",
                            content = @Content(
                                    mediaType = "application/json",
                                    schema = @Schema(implementation = MaterialReadOnlyDTO.class)
                            )
                    ),
                    @ApiResponse(
                            responseCode = "400",
                            description = "Validation errors",
                            content = @Content(mediaType = "application/json")
                    ),
                    @ApiResponse(
                            responseCode = "409",
                            description = "Material with name already exists",
                            content = @Content(mediaType = "application/json")
                    )
            }
    )
    @PostMapping
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<MaterialReadOnlyDTO> createMaterial(
            @Valid @RequestBody MaterialInsertDTO materialInsertDTO,
            BindingResult bindingResult) throws ValidationException, EntityAlreadyExistsException, EntityNotFoundException {

        if (bindingResult.hasErrors()) {
            throw new ValidationException(bindingResult);
        }

        MaterialReadOnlyDTO material = materialService.createMaterial(materialInsertDTO);
        return new ResponseEntity<>(material, HttpStatus.CREATED);
    }

    @Operation(
            summary = "Update material",
            description = "Updates an existing material's information with unique name validation. Used in material management.",
            responses = {
                    @ApiResponse(
                            responseCode = "200",
                            description = "Material updated successfully",
                            content = @Content(
                                    mediaType = "application/json",
                                    schema = @Schema(implementation = MaterialReadOnlyDTO.class)
                            )
                    ),
                    @ApiResponse(
                            responseCode = "400",
                            description = "Validation errors",
                            content = @Content(mediaType = "application/json")
                    ),
                    @ApiResponse(
                            responseCode = "404",
                            description = "Material not found",
                            content = @Content(mediaType = "application/json")
                    ),
                    @ApiResponse(
                            responseCode = "409",
                            description = "Material with name already exists",
                            content = @Content(mediaType = "application/json")
                    )
            }
    )
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<MaterialReadOnlyDTO> updateMaterial(
            @PathVariable Long id,
            @Valid @RequestBody MaterialUpdateDTO materialUpdateDTO,
            BindingResult bindingResult) throws ValidationException, EntityAlreadyExistsException, EntityNotFoundException {

        if (bindingResult.hasErrors()) {
            throw new ValidationException(bindingResult);
        }

        MaterialReadOnlyDTO material = materialService.updateMaterial(materialUpdateDTO);
        return new ResponseEntity<>(material, HttpStatus.OK);
    }

    @Operation(
            summary = "Delete material",
            description = "Deletes a material. Performs soft delete if material is used in purchases or products, hard delete otherwise.",
            responses = {
                    @ApiResponse(
                            responseCode = "204",
                            description = "Material deleted successfully"
                    ),
                    @ApiResponse(
                            responseCode = "404",
                            description = "Material not found",
                            content = @Content(mediaType = "application/json")
                    )
            }
    )
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<Void> deleteMaterial(@PathVariable Long id) throws EntityNotFoundException {
        materialService.deleteMaterial(id);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }

    @Operation(
            summary = "Restore a soft-deleted material",
            description = "Restores a soft-deleted material by making it active again. Only accessible by admins.",
            responses = {
                    @ApiResponse(responseCode = "200", description = "material restored successfully",
                            content = @Content(mediaType = "application/json",
                                    schema = @Schema(implementation = MaterialReadOnlyDTO.class))
                    ),
                    @ApiResponse(responseCode = "404", description = "material not found"
                    ),
                    @ApiResponse(responseCode = "400", description = "material is already active"
                    ),
                    @ApiResponse(responseCode = "403", description = "Access denied - Admin role required"
                    )
            }
    )

    @PutMapping("/{id}/restore")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<MaterialReadOnlyDTO> restoreMaterial(@PathVariable Long id) throws EntityNotFoundException, EntityInvalidArgumentException {

        MaterialReadOnlyDTO restoredMaterial = materialService.restoreMaterial(id);
        return ResponseEntity.ok(restoredMaterial);
    }

    @Operation(
            summary = "Get material basic info by ID",
            description = "Retrieves basic material information by ID. Used for editing forms and quick lookups.",
            responses = {
                    @ApiResponse(
                            responseCode = "200",
                            description = "Material found",
                            content = @Content(
                                    mediaType = "application/json",
                                    schema = @Schema(implementation = MaterialReadOnlyDTO.class)
                            )
                    ),
                    @ApiResponse(
                            responseCode = "404",
                            description = "Material not found",
                            content = @Content(mediaType = "application/json")
                    )
            }
    )
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<MaterialReadOnlyDTO> getMaterialById(@PathVariable Long id) throws EntityNotFoundException {
        MaterialReadOnlyDTO material = materialService.getMaterialById(id);
        return new ResponseEntity<>(material, HttpStatus.OK);
    }

    // =============================================================================
    // MATERIAL VIEWING AND LISTING - FOR MATERIAL MANAGEMENT PAGE
    // =============================================================================

    @Operation(
            summary = "Get materials with pagination and filters",
            description = "Retrieves materials with pagination and filtering support. Main endpoint for material management page listing.",
            responses = {
                    @ApiResponse(
                            responseCode = "200",
                            description = "Paginated list of materials",
                            content = @Content(
                                    mediaType = "application/json",
                                    schema = @Schema(implementation = Paginated.class)
                            )
                    )
            }
    )
    @GetMapping
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<Paginated<MaterialReadOnlyDTO>> getMaterialsFilteredPaginated(
            @Parameter(description = "Material name filter") @RequestParam(required = false) String name,
            @Parameter(description = "Active status filter") @RequestParam(required = false) Boolean isActive,
            @Parameter(description = "Page number (0-based)") @RequestParam(required = false, defaultValue = "0") int page,
            @Parameter(description = "Page size") @RequestParam(required = false, defaultValue = "20") int pageSize,
            @Parameter(description = "Sort field") @RequestParam(required = false, defaultValue = "name") String sortBy,
            @Parameter(description = "Sort direction") @RequestParam(required = false, defaultValue = "ASC") String sortDirection) {

        MaterialFilters filters = MaterialFilters.builder()
                .name(name)
                .isActive(isActive)
                .build();

        // Set pagination properties using request parameters (with defaults)
        filters.setPage(page);
        filters.setPageSize(pageSize);
        filters.setSortBy(sortBy);
        filters.setSortDirection(Sort.Direction.valueOf(sortDirection.toUpperCase()));

        Paginated<MaterialReadOnlyDTO> materials = materialService.getMaterialsFilteredPaginated(filters);
        return new ResponseEntity<>(materials, HttpStatus.OK);
    }

    @Operation(
            summary = "Get material detailed view",
            description = "Retrieves comprehensive material information including usage analytics and product breakdown. Used for material detail modal/page.",
            responses = {
                    @ApiResponse(
                            responseCode = "200",
                            description = "Material detailed view with analytics",
                            content = @Content(
                                    mediaType = "application/json",
                                    schema = @Schema(implementation = MaterialDetailedViewDTO.class)
                            )
                    ),
                    @ApiResponse(
                            responseCode = "404",
                            description = "Material not found",
                            content = @Content(mediaType = "application/json")
                    )
            }
    )
    @GetMapping("/{id}/details")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<MaterialDetailedViewDTO> getMaterialDetailedView(@PathVariable Long id) throws EntityNotFoundException {
        MaterialDetailedViewDTO materialDetails = materialService.getMaterialDetailedById(id);
        return new ResponseEntity<>(materialDetails, HttpStatus.OK);
    }

    @Operation(
            summary = "Get products using material with filtering",
            description = "Retrieves paginated and filtered list of products using specific material. " +
                    "Supports filtering by product name/productCode, category, price range, stock levels, and active status. " +
                    "Used for material detail view product listing with advanced filtering capabilities.",
            responses = {
                    @ApiResponse(
                            responseCode = "200",
                            description = "Paginated list of products using this material",
                            content = @Content(
                                    mediaType = "application/json",
                                    schema = @Schema(implementation = Paginated.class)
                            )
                    ),
                    @ApiResponse(
                            responseCode = "404",
                            description = "Material not found",
                            content = @Content(mediaType = "application/json")
                    )
            }
    )
    @GetMapping("/{id}/products")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<Paginated<ProductUsageDTO>> getAllProductsUsingMaterial(
            @PathVariable Long id,
            @Parameter(description = "Product name or productCode search") @RequestParam(required = false) String nameOrCode,
            @Parameter(description = "Category filter") @RequestParam(required = false) Long categoryId,
            @Parameter(description = "Procedure filter (products that use BOTH this material AND the specified procedure)") @RequestParam(required = false) Long procedureId,
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
                .procedureId(procedureId)
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

        Paginated<ProductUsageDTO> products = materialService.getAllProductsUsingMaterial(id, filters);
        return new ResponseEntity<>(products, HttpStatus.OK);
    }


    @Operation(
            summary = "Search materials for autocomplete",
            description = "Searches materials for autocomplete functionality when adding materials to purchase. Returns materials matching name for easy selection.",
            responses = {
                    @ApiResponse(
                            responseCode = "200",
                            description = "List of materials matching search term",
                            content = @Content(
                                    mediaType = "application/json",
                                    schema = @Schema(implementation = MaterialSearchResultDTO.class)
                            )
                    )
            }
    )
    @GetMapping("/search")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<List<MaterialSearchResultDTO>> searchMaterials(
            @Parameter(description = "Search term (material name)", required = true)
            @RequestParam String searchTerm) {

        List<MaterialSearchResultDTO> materials = materialService.searchMaterialsForAutocomplete(searchTerm);
        return new ResponseEntity<>(materials, HttpStatus.OK);
    }
}
