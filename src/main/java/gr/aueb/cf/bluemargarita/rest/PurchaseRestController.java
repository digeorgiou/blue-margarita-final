package gr.aueb.cf.bluemargarita.rest;

import gr.aueb.cf.bluemargarita.core.exceptions.EntityNotAuthorizedException;
import gr.aueb.cf.bluemargarita.core.exceptions.EntityNotFoundException;
import gr.aueb.cf.bluemargarita.core.exceptions.ValidationException;
import gr.aueb.cf.bluemargarita.core.filters.PurchaseFilters;
import gr.aueb.cf.bluemargarita.dto.purchase.*;
import gr.aueb.cf.bluemargarita.service.IPurchaseService;
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
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/purchases")
@RequiredArgsConstructor
@SecurityRequirement(name = "Bearer Authentication")
@Tag(name = "Purchase Management", description = "APIs for managing material purchases and supplier transactions in the jewelry business")
public class PurchaseRestController {

    private final IPurchaseService purchaseService;

    // =============================================================================
    // CORE CRUD OPERATIONS - FOR PURCHASE MANAGEMENT PAGE
    // =============================================================================

    @Operation(
            summary = "Record a new purchase",
            description = "Records a new material purchase with automatic cost calculation. Validates supplier and materials exist, calculates total cost based on current material prices. Used in Record Purchase page.",
            responses = {
                    @ApiResponse(
                            responseCode = "201",
                            description = "Purchase recorded successfully",
                            content = @Content(
                                    mediaType = "application/json",
                                    schema = @Schema(implementation = PurchaseDetailedViewDTO.class)
                            )
                    ),
                    @ApiResponse(
                            responseCode = "400",
                            description = "Invalid input data",
                            content = @Content(mediaType = "application/json")
                    ),
                    @ApiResponse(
                            responseCode = "404",
                            description = "Supplier, user, or material not found",
                            content = @Content(mediaType = "application/json")
                    )
            }
    )
    @PostMapping
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<PurchaseDetailedViewDTO> recordPurchase(
            @Valid @RequestBody RecordPurchaseRequestDTO request,
            BindingResult bindingResult) throws EntityNotFoundException, ValidationException {

        if (bindingResult.hasErrors()) {
            throw new ValidationException(bindingResult);
        }

        PurchaseDetailedViewDTO purchase = purchaseService.recordPurchase(request);
        return new ResponseEntity<>(purchase, HttpStatus.CREATED);
    }

    @Operation(
            summary = "Update an existing purchase",
            description = "Updates basic purchase information (supplier, date). Does not modify materials in the purchase. Used in Edit Purchase functionality.",
            responses = {
                    @ApiResponse(
                            responseCode = "200",
                            description = "Purchase updated successfully",
                            content = @Content(
                                    mediaType = "application/json",
                                    schema = @Schema(implementation = PurchaseReadOnlyDTO.class)
                            )
                    ),
                    @ApiResponse(
                            responseCode = "400",
                            description = "Invalid input data",
                            content = @Content(mediaType = "application/json")
                    ),
                    @ApiResponse(
                            responseCode = "403",
                            description = "Forbidden - Path ID does not match request body ID",
                            content = @Content(mediaType = "application/json")
                    ),
                    @ApiResponse(
                            responseCode = "404",
                            description = "Purchase, supplier, or user not found",
                            content = @Content(mediaType = "application/json")
                    )
            }
    )
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<PurchaseReadOnlyDTO> updatePurchase(
            @PathVariable Long id,
            @Valid @RequestBody PurchaseUpdateDTO dto,
            BindingResult bindingResult) throws EntityNotFoundException, ValidationException, EntityNotAuthorizedException {

        if (bindingResult.hasErrors()) {
            throw new ValidationException(bindingResult);
        }

        // Ensure the path ID matches the DTO ID
        // Ensure the path ID matches the DTO ID
        if (!id.equals(dto.purchaseId())) {
            throw new EntityNotAuthorizedException("Purchase", "Path ID does not match request body ID - unauthorized modification attempt");
        }

        PurchaseReadOnlyDTO purchase = purchaseService.updatePurchase(dto);
        return new ResponseEntity<>(purchase, HttpStatus.OK);
    }

    @Operation(
            summary = "Delete a purchase",
            description = "Completely deletes a purchase and all its materials. This is a hard delete operation. Requires ADMIN role.",
            responses = {
                    @ApiResponse(
                            responseCode = "204",
                            description = "Purchase deleted successfully"
                    ),
                    @ApiResponse(
                            responseCode = "404",
                            description = "Purchase not found",
                            content = @Content(mediaType = "application/json")
                    )
            }
    )
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deletePurchase(@PathVariable Long id) throws EntityNotFoundException {
        purchaseService.deletePurchase(id);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }

    @Operation(
            summary = "Get purchase detailed view",
            description = "Retrieves comprehensive purchase information including all materials, costs, and price comparisons. Used for purchase detail modal/page.",
            responses = {
                    @ApiResponse(
                            responseCode = "200",
                            description = "Purchase detailed view with complete information",
                            content = @Content(
                                    mediaType = "application/json",
                                    schema = @Schema(implementation = PurchaseDetailedViewDTO.class)
                            )
                    ),
                    @ApiResponse(
                            responseCode = "404",
                            description = "Purchase not found",
                            content = @Content(mediaType = "application/json")
                    )
            }
    )
    @GetMapping("/{id}/details")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<PurchaseDetailedViewDTO> getPurchaseDetailedView(@PathVariable Long id) throws EntityNotFoundException {
        PurchaseDetailedViewDTO purchaseDetails = purchaseService.getPurchaseDetailedView(id);
        return new ResponseEntity<>(purchaseDetails, HttpStatus.OK);
    }

    // =============================================================================
    // PURCHASE VIEWING AND LISTING - FOR PURCHASE MANAGEMENT PAGE
    // =============================================================================

    @Operation(
            summary = "Search purchases with advanced filtering and summary",
            description = "Searches purchases with pagination and filtering support. Includes optional summary calculation for filtered results ≤ 100. Main endpoint for purchase management page listing with advanced search capabilities.",
            responses = {
                    @ApiResponse(
                            responseCode = "200",
                            description = "Paginated list of purchases with optional summary",
                            content = @Content(
                                    mediaType = "application/json",
                                    schema = @Schema(implementation = PaginatedFilteredPurchasesWithSummary.class)
                            )
                    )
            }
    )
    @GetMapping("/search")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<PaginatedFilteredPurchasesWithSummary> searchPurchasesWithSummary(
            @Parameter(description = "Supplier ID filter") @RequestParam(required = false) Long supplierId,
            @Parameter(description = "Supplier name, TIN, or email filter") @RequestParam(required = false) String supplierNameOrTinOrEmail,
            @Parameter(description = "Purchase date from (inclusive)") @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate purchaseDateFrom,
            @Parameter(description = "Purchase date to (inclusive)") @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate purchaseDateTo,
            @Parameter(description = "Material name filter") @RequestParam(required = false) String materialName,
            @Parameter(description = "Material ID filter") @RequestParam(required = false) Long materialId,
            @Parameter(description = "Page number (0-based)") @RequestParam(required = false, defaultValue = "0") int page,
            @Parameter(description = "Page size") @RequestParam(required = false, defaultValue = "20") int pageSize,
            @Parameter(description = "Sort field") @RequestParam(required = false, defaultValue = "purchaseDate") String sortBy,
            @Parameter(description = "Sort direction") @RequestParam(required = false, defaultValue = "DESC") String sortDirection) {

        PurchaseFilters filters = PurchaseFilters.builder()
                .supplierId(supplierId)
                .supplierNameOrTinOrEmail(supplierNameOrTinOrEmail)
                .purchaseDateFrom(purchaseDateFrom)
                .purchaseDateTo(purchaseDateTo)
                .materialName(materialName)
                .materialId(materialId)
                .build();

        // Set pagination properties using request parameters (with defaults)
        filters.setPage(page);
        filters.setPageSize(pageSize);
        filters.setSortBy(sortBy);
        filters.setSortDirection(Sort.Direction.valueOf(sortDirection.toUpperCase()));

        PaginatedFilteredPurchasesWithSummary purchases = purchaseService.searchPurchasesWithSummary(filters);
        return new ResponseEntity<>(purchases, HttpStatus.OK);
    }

    // =============================================================================
    // CONVENIENCE ENDPOINTS
    // =============================================================================

    @Operation(
            summary = "Get purchases by date range",
            description = "Simple endpoint to retrieve purchases within a specific date range without advanced filtering. Used for reports and simple date-based queries.",
            responses = {
                    @ApiResponse(
                            responseCode = "200",
                            description = "Paginated list of purchases in date range",
                            content = @Content(
                                    mediaType = "application/json",
                                    schema = @Schema(implementation = PaginatedFilteredPurchasesWithSummary.class)
                            )
                    )
            }
    )
    @GetMapping("/date-range")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<PaginatedFilteredPurchasesWithSummary> getPurchasesByDateRange(
            @Parameter(description = "Start date (inclusive)", required = true) @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @Parameter(description = "End date (inclusive)", required = true) @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @Parameter(description = "Page number (0-based)") @RequestParam(required = false, defaultValue = "0") int page,
            @Parameter(description = "Page size") @RequestParam(required = false, defaultValue = "20") int pageSize,
            @Parameter(description = "Sort field") @RequestParam(required = false, defaultValue = "purchaseDate") String sortBy,
            @Parameter(description = "Sort direction") @RequestParam(required = false, defaultValue = "DESC") String sortDirection) {

        PurchaseFilters filters = PurchaseFilters.builder()
                .purchaseDateFrom(startDate)
                .purchaseDateTo(endDate)
                .build();

        // Set pagination properties
        filters.setPage(page);
        filters.setPageSize(pageSize);
        filters.setSortBy(sortBy);
        filters.setSortDirection(Sort.Direction.valueOf(sortDirection.toUpperCase()));

        PaginatedFilteredPurchasesWithSummary purchases = purchaseService.searchPurchasesWithSummary(filters);
        return new ResponseEntity<>(purchases, HttpStatus.OK);
    }

    @Operation(
            summary = "Get purchases by supplier",
            description = "Retrieves all purchases from a specific supplier with pagination. Used for supplier analysis and relationship management.",
            responses = {
                    @ApiResponse(
                            responseCode = "200",
                            description = "Paginated list of purchases from the supplier",
                            content = @Content(
                                    mediaType = "application/json",
                                    schema = @Schema(implementation = PaginatedFilteredPurchasesWithSummary.class)
                            )
                    )
            }
    )
    @GetMapping("/supplier/{supplierId}")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<PaginatedFilteredPurchasesWithSummary> getPurchasesBySupplier(
            @PathVariable Long supplierId,
            @Parameter(description = "Page number (0-based)") @RequestParam(required = false, defaultValue = "0") int page,
            @Parameter(description = "Page size") @RequestParam(required = false, defaultValue = "20") int pageSize,
            @Parameter(description = "Sort field") @RequestParam(required = false, defaultValue = "purchaseDate") String sortBy,
            @Parameter(description = "Sort direction") @RequestParam(required = false, defaultValue = "DESC") String sortDirection) {

        PurchaseFilters filters = PurchaseFilters.builder()
                .supplierId(supplierId)
                .build();

        // Set pagination properties
        filters.setPage(page);
        filters.setPageSize(pageSize);
        filters.setSortBy(sortBy);
        filters.setSortDirection(Sort.Direction.valueOf(sortDirection.toUpperCase()));

        PaginatedFilteredPurchasesWithSummary purchases = purchaseService.searchPurchasesWithSummary(filters);
        return new ResponseEntity<>(purchases, HttpStatus.OK);
    }

    @Operation(
            summary = "Get purchases containing specific material",
            description = "Retrieves all purchases that contain a specific material with pagination. Used for material cost analysis and purchase history tracking.",
            responses = {
                    @ApiResponse(
                            responseCode = "200",
                            description = "Paginated list of purchases containing the material",
                            content = @Content(
                                    mediaType = "application/json",
                                    schema = @Schema(implementation = PaginatedFilteredPurchasesWithSummary.class)
                            )
                    )
            }
    )
    @GetMapping("/material/{materialId}")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<PaginatedFilteredPurchasesWithSummary> getPurchasesByMaterial(
            @PathVariable Long materialId,
            @Parameter(description = "Page number (0-based)") @RequestParam(required = false, defaultValue = "0") int page,
            @Parameter(description = "Page size") @RequestParam(required = false, defaultValue = "20") int pageSize,
            @Parameter(description = "Sort field") @RequestParam(required = false, defaultValue = "purchaseDate") String sortBy,
            @Parameter(description = "Sort direction") @RequestParam(required = false, defaultValue = "DESC") String sortDirection) {

        PurchaseFilters filters = PurchaseFilters.builder()
                .materialId(materialId)
                .build();

        // Set pagination properties
        filters.setPage(page);
        filters.setPageSize(pageSize);
        filters.setSortBy(sortBy);
        filters.setSortDirection(Sort.Direction.valueOf(sortDirection.toUpperCase()));

        PaginatedFilteredPurchasesWithSummary purchases = purchaseService.searchPurchasesWithSummary(filters);
        return new ResponseEntity<>(purchases, HttpStatus.OK);
    }
}
