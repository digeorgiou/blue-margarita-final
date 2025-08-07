package gr.aueb.cf.bluemargarita.rest;

import gr.aueb.cf.bluemargarita.core.exceptions.EntityAlreadyExistsException;
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
import org.springframework.data.domain.Sort;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

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
            BindingResult bindingResult) throws EntityNotFoundException, ValidationException, EntityNotAuthorizedException, EntityAlreadyExistsException {

        if (bindingResult.hasErrors()) {
            throw new ValidationException(bindingResult);
        }

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
            @Parameter(description = "Purchase date from (inclusive)") @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate purchaseDateFrom,
            @Parameter(description = "Purchase date to (inclusive)") @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate purchaseDateTo,
            @Parameter(description = "Material ID filter") @RequestParam(required = false) Long materialId,
            @Parameter(description = "Page number (0-based)") @RequestParam(required = false, defaultValue = "0") int page,
            @Parameter(description = "Page size") @RequestParam(required = false, defaultValue = "20") int pageSize,
            @Parameter(description = "Sort field") @RequestParam(required = false, defaultValue = "purchaseDate") String sortBy,
            @Parameter(description = "Sort direction") @RequestParam(required = false, defaultValue = "DESC") String sortDirection) {

        PurchaseFilters filters = PurchaseFilters.builder()
                .supplierId(supplierId)
                .purchaseDateFrom(purchaseDateFrom)
                .purchaseDateTo(purchaseDateTo)
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
}
