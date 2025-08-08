package gr.aueb.cf.bluemargarita.rest;

import gr.aueb.cf.bluemargarita.core.exceptions.EntityAlreadyExistsException;
import gr.aueb.cf.bluemargarita.core.exceptions.EntityInvalidArgumentException;
import gr.aueb.cf.bluemargarita.core.exceptions.EntityNotFoundException;
import gr.aueb.cf.bluemargarita.core.exceptions.ValidationException;
import gr.aueb.cf.bluemargarita.core.filters.SupplierFilters;
import gr.aueb.cf.bluemargarita.core.filters.Paginated;
import gr.aueb.cf.bluemargarita.dto.supplier.*;
import gr.aueb.cf.bluemargarita.service.SupplierService;
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
@RequestMapping("/api/suppliers")
@RequiredArgsConstructor
@SecurityRequirement(name = "Bearer Authentication")
@Tag(name = "Supplier Management", description = "APIs for managing suppliers in the jewelry business")
public class SupplierRestController {

    private final SupplierService supplierService;

    // =============================================================================
    // CORE CRUD OPERATIONS - FOR SUPPLIER MANAGEMENT PAGE
    // =============================================================================

    @Operation(
            summary = "Create a new supplier",
            description = "Creates a new supplier with unique TIN and email validation. Used in supplier management.",
            responses = {
                    @ApiResponse(
                            responseCode = "201",
                            description = "Supplier created successfully",
                            content = @Content(
                                    mediaType = "application/json",
                                    schema = @Schema(implementation = SupplierReadOnlyDTO.class)
                            )
                    ),
                    @ApiResponse(
                            responseCode = "400",
                            description = "Validation errors",
                            content = @Content(mediaType = "application/json")
                    ),
                    @ApiResponse(
                            responseCode = "409",
                            description = "Supplier with TIN or email already exists",
                            content = @Content(mediaType = "application/json")
                    )
            }
    )
    @PostMapping
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<SupplierReadOnlyDTO> createSupplier(
            @Valid @RequestBody SupplierInsertDTO supplierInsertDTO,
            BindingResult bindingResult) throws ValidationException, EntityAlreadyExistsException, EntityNotFoundException {

        if (bindingResult.hasErrors()) {
            throw new ValidationException(bindingResult);
        }

        SupplierReadOnlyDTO supplier = supplierService.createSupplier(supplierInsertDTO);
        return new ResponseEntity<>(supplier, HttpStatus.CREATED);
    }

    @Operation(
            summary = "Update supplier",
            description = "Updates an existing supplier's information. Used in supplier management.",
            responses = {
                    @ApiResponse(
                            responseCode = "200",
                            description = "Supplier updated successfully",
                            content = @Content(
                                    mediaType = "application/json",
                                    schema = @Schema(implementation = SupplierReadOnlyDTO.class)
                            )
                    ),
                    @ApiResponse(
                            responseCode = "400",
                            description = "Validation errors",
                            content = @Content(mediaType = "application/json")
                    ),
                    @ApiResponse(
                            responseCode = "404",
                            description = "Supplier not found",
                            content = @Content(mediaType = "application/json")
                    ),
                    @ApiResponse(
                            responseCode = "409",
                            description = "TIN or email conflicts with existing supplier",
                            content = @Content(mediaType = "application/json")
                    )
            }
    )
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<SupplierReadOnlyDTO> updateSupplier(
            @PathVariable Long id,
            @Valid @RequestBody SupplierUpdateDTO supplierUpdateDTO,
            BindingResult bindingResult) throws ValidationException, EntityAlreadyExistsException,
            EntityNotFoundException, EntityInvalidArgumentException {

        if (bindingResult.hasErrors()) {
            throw new ValidationException(bindingResult);
        }

        // Ensure the ID in the path matches the ID in the DTO
        if (!id.equals(supplierUpdateDTO.supplierId())) {
            throw new EntityInvalidArgumentException("Supplier", "Path ID does not match DTO supplier ID");
        }

        SupplierReadOnlyDTO supplier = supplierService.updateSupplier(supplierUpdateDTO);
        return new ResponseEntity<>(supplier, HttpStatus.OK);
    }

    @Operation(
            summary = "Delete supplier",
            description = "Deletes a supplier. Performs soft delete if supplier has purchases, hard delete otherwise. Requires ADMIN role.",
            responses = {
                    @ApiResponse(
                            responseCode = "204",
                            description = "Supplier deleted successfully"
                    ),
                    @ApiResponse(
                            responseCode = "404",
                            description = "Supplier not found",
                            content = @Content(mediaType = "application/json")
                    )
            }
    )
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteSupplier(@PathVariable Long id) throws EntityNotFoundException {
        supplierService.deleteSupplier(id);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }

    @Operation(
            summary = "Get supplier basic info by ID",
            description = "Retrieves basic supplier information by ID. Used for editing forms and quick lookups.",
            responses = {
                    @ApiResponse(
                            responseCode = "200",
                            description = "Supplier found",
                            content = @Content(
                                    mediaType = "application/json",
                                    schema = @Schema(implementation = SupplierReadOnlyDTO.class)
                            )
                    ),
                    @ApiResponse(
                            responseCode = "404",
                            description = "Supplier not found",
                            content = @Content(mediaType = "application/json")
                    )
            }
    )
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<SupplierReadOnlyDTO> getSupplierById(@PathVariable Long id) throws EntityNotFoundException {
        SupplierReadOnlyDTO supplier = supplierService.getSupplierById(id);
        return new ResponseEntity<>(supplier, HttpStatus.OK);
    }

    // =============================================================================
    // SUPPLIER VIEWING AND DETAILS - FOR SUPPLIER MANAGEMENT PAGE
    // =============================================================================

    @Operation(
            summary = "Get suppliers with pagination and filters",
            description = "Retrieves suppliers with pagination and filtering support. Main endpoint for supplier management page listing.",
            responses = {
                    @ApiResponse(
                            responseCode = "200",
                            description = "Paginated list of suppliers",
                            content = @Content(
                                    mediaType = "application/json",
                                    schema = @Schema(implementation = Paginated.class)
                            )
                    )
            }
    )
    @GetMapping
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<Paginated<SupplierReadOnlyDTO>> getSuppliersFilteredPaginated(
            @Parameter(description = "Supplier name filter") @RequestParam(required = false) String name,
            @Parameter(description = "Supplier email filter") @RequestParam(required = false) String email,
            @Parameter(description = "Supplier phone number filter") @RequestParam(required = false) String phoneNumber,
            @Parameter(description = "Supplier TIN filter") @RequestParam(required = false) String tin,
            @Parameter(description = "Active status filter") @RequestParam(required = false) Boolean isActive,
            @Parameter(description = "Page number (0-based)") @RequestParam(required = false, defaultValue = "0") int page,
            @Parameter(description = "Page size") @RequestParam(required = false, defaultValue = "20") int pageSize,
            @Parameter(description = "Sort field") @RequestParam(required = false, defaultValue = "name") String sortBy,
            @Parameter(description = "Sort direction") @RequestParam(required = false, defaultValue = "ASC") String sortDirection) {

        SupplierFilters filters = SupplierFilters.builder()
                .name(name)
                .email(email)
                .phoneNumber(phoneNumber)
                .tin(tin)
                .isActive(isActive)
                .build();

        // Set pagination properties using request parameters (with defaults)
        filters.setPage(page);
        filters.setPageSize(pageSize);
        filters.setSortBy(sortBy);
        filters.setSortDirection(Sort.Direction.valueOf(sortDirection.toUpperCase()));

        Paginated<SupplierReadOnlyDTO> suppliers = supplierService.getSuppliersFilteredPaginated(filters);
        return new ResponseEntity<>(suppliers, HttpStatus.OK);
    }

    @Operation(
            summary = "Get supplier detailed view",
            description = "Retrieves comprehensive supplier information including purchase analytics and material breakdown. Used for supplier detail modal/page.",
            responses = {
                    @ApiResponse(
                            responseCode = "200",
                            description = "Supplier detailed view with analytics",
                            content = @Content(
                                    mediaType = "application/json",
                                    schema = @Schema(implementation = SupplierDetailedViewDTO.class)
                            )
                    ),
                    @ApiResponse(
                            responseCode = "404",
                            description = "Supplier not found",
                            content = @Content(mediaType = "application/json")
                    )
            }
    )
    @GetMapping("/{id}/details")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<SupplierDetailedViewDTO> getSupplierDetailedView(@PathVariable Long id) throws EntityNotFoundException {
        SupplierDetailedViewDTO supplierDetails = supplierService.getSupplierDetailedView(id);
        return new ResponseEntity<>(supplierDetails, HttpStatus.OK);
    }


    @Operation(
            summary = "Search suppliers for autocomplete",
            description = "Searches suppliers for autocomplete functionality in Record Purchase page. Returns suppliers matching name, email, or phone. Alternative to dropdown selection.",
            responses = {
                    @ApiResponse(
                            responseCode = "200",
                            description = "List of suppliers matching search term",
                            content = @Content(
                                    mediaType = "application/json",
                                    schema = @Schema(implementation = SupplierSearchResultDTO.class)
                            )
                    )
            }
    )
    @GetMapping("/search")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<List<SupplierSearchResultDTO>> searchSuppliersForAutocomplete(
            @Parameter(description = "Search term (name, email, or tin)", required = true)
            @RequestParam String searchTerm) {

        List<SupplierSearchResultDTO> suppliers = supplierService.searchSuppliersForAutocomplete(searchTerm);
        return new ResponseEntity<>(suppliers, HttpStatus.OK);
    }

}
