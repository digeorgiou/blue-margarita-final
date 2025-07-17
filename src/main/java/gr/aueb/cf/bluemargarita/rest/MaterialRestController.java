package gr.aueb.cf.bluemargarita.rest;

import gr.aueb.cf.bluemargarita.core.exceptions.EntityAlreadyExistsException;
import gr.aueb.cf.bluemargarita.core.exceptions.EntityNotFoundException;
import gr.aueb.cf.bluemargarita.core.exceptions.ValidationException;
import gr.aueb.cf.bluemargarita.core.filters.MaterialFilters;
import gr.aueb.cf.bluemargarita.core.filters.Paginated;
import gr.aueb.cf.bluemargarita.dto.material.*;
import gr.aueb.cf.bluemargarita.dto.product.ProductUsageDTO;
import gr.aueb.cf.bluemargarita.service.IMaterialService;
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

import java.util.List;

@RestController
@RequestMapping("/api/materials")
@RequiredArgsConstructor
@SecurityRequirement(name = "Bearer Authentication")
@Tag(name = "Material Management", description = "APIs for managing materials and raw components in the jewelry business")
public class MaterialRestController {

    private final IMaterialService materialService;

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
            description = "Deletes a material. Performs soft delete if material is used in purchases or products, hard delete otherwise. Requires ADMIN role.",
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
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteMaterial(@PathVariable Long id) throws EntityNotFoundException {
        materialService.deleteMaterial(id);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
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

    // =============================================================================
    // PRODUCT RELATIONSHIP OPERATIONS
    // =============================================================================

    @Operation(
            summary = "Get all products using this material",
            description = "Retrieves paginated list of all products that use this material. Used for material detail view product listing.",
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
            @Parameter(description = "Page number (0-based)") @RequestParam(required = false, defaultValue = "0") int page,
            @Parameter(description = "Page size") @RequestParam(required = false, defaultValue = "20") int pageSize,
            @Parameter(description = "Sort field") @RequestParam(required = false, defaultValue = "name") String sortBy,
            @Parameter(description = "Sort direction") @RequestParam(required = false, defaultValue = "ASC") String sortDirection) throws EntityNotFoundException {

        Pageable pageable = PageRequest.of(page, pageSize,
                Sort.by(Sort.Direction.valueOf(sortDirection.toUpperCase()), sortBy));

        Paginated<ProductUsageDTO> products = materialService.getAllProductsUsingMaterial(id, pageable);
        return new ResponseEntity<>(products, HttpStatus.OK);
    }

    // =============================================================================
    // CONVENIENCE ENDPOINTS
    // =============================================================================

    @Operation(
            summary = "Get all active materials",
            description = "Retrieves all active materials without pagination. Used for simple listings and exports.",
            responses = {
                    @ApiResponse(
                            responseCode = "200",
                            description = "List of all active materials",
                            content = @Content(
                                    mediaType = "application/json",
                                    schema = @Schema(implementation = MaterialReadOnlyDTO.class)
                            )
                    )
            }
    )
    @GetMapping("/active")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<List<MaterialReadOnlyDTO>> getAllActiveMaterials() {
        List<MaterialReadOnlyDTO> materials = materialService.getAllActiveMaterials();
        return new ResponseEntity<>(materials, HttpStatus.OK);
    }

    @Operation(
            summary = "Get filtered materials without pagination",
            description = "Retrieves materials based on filter criteria without pagination. Used for exports and reports.",
            responses = {
                    @ApiResponse(
                            responseCode = "200",
                            description = "List of materials matching filter criteria",
                            content = @Content(
                                    mediaType = "application/json",
                                    schema = @Schema(implementation = MaterialReadOnlyDTO.class)
                            )
                    )
            }
    )
    @GetMapping("/filtered")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<List<MaterialReadOnlyDTO>> getFilteredMaterials(
            @Parameter(description = "Material name filter") @RequestParam(required = false) String name,
            @Parameter(description = "Active status filter") @RequestParam(required = false) Boolean isActive) {

        MaterialFilters filters = MaterialFilters.builder()
                .name(name)
                .isActive(isActive)
                .build();

        List<MaterialReadOnlyDTO> materials = materialService.getFilteredMaterials(filters);
        return new ResponseEntity<>(materials, HttpStatus.OK);
    }
}
