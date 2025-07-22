package gr.aueb.cf.bluemargarita.rest;

import gr.aueb.cf.bluemargarita.core.enums.PaymentMethod;
import gr.aueb.cf.bluemargarita.core.exceptions.EntityNotFoundException;
import gr.aueb.cf.bluemargarita.core.exceptions.EntityNotAuthorizedException;
import gr.aueb.cf.bluemargarita.core.exceptions.ValidationException;
import gr.aueb.cf.bluemargarita.core.filters.SaleFilters;
import gr.aueb.cf.bluemargarita.dto.sale.*;
import gr.aueb.cf.bluemargarita.service.ISaleService;
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
@RequestMapping("/api/sales")
@RequiredArgsConstructor
@SecurityRequirement(name = "Bearer Authentication")
@Tag(name = "Sale Management", description = "APIs for managing product sales, customer transactions, and pricing in the jewelry business")
public class SaleRestController {

    private final ISaleService saleService;

    // =============================================================================
    // CORE CRUD OPERATIONS - FOR SALE MANAGEMENT PAGE
    // =============================================================================

    @Operation(
            summary = "Update an existing sale",
            description = "Updates basic sale information (customer, location, payment method, pricing). Recalculates pricing based on new discount. Does not modify products in the sale. Used in Edit Sale functionality.",
            responses = {
                    @ApiResponse(
                            responseCode = "200",
                            description = "Sale updated successfully",
                            content = @Content(
                                    mediaType = "application/json",
                                    schema = @Schema(implementation = SaleReadOnlyDTO.class)
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
                            description = "Sale, location, customer, or user not found",
                            content = @Content(mediaType = "application/json")
                    )
            }
    )
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<SaleReadOnlyDTO> updateSale(
            @PathVariable Long id,
            @Valid @RequestBody SaleUpdateDTO dto,
            BindingResult bindingResult) throws EntityNotFoundException, ValidationException, EntityNotAuthorizedException {

        if (bindingResult.hasErrors()) {
            throw new ValidationException(bindingResult);
        }

        // Ensure the path ID matches the DTO ID
        if (!id.equals(dto.saleId())) {
            throw new EntityNotAuthorizedException("Sale", "Path ID does not match request body ID - unauthorized modification attempt");
        }

        SaleReadOnlyDTO sale = saleService.updateSale(dto);
        return new ResponseEntity<>(sale, HttpStatus.OK);
    }

    @Operation(
            summary = "Delete a sale",
            description = "Completely deletes a sale and restores stock for all products. This is a hard delete operation. Requires ADMIN role.",
            responses = {
                    @ApiResponse(
                            responseCode = "204",
                            description = "Sale deleted successfully"
                    ),
                    @ApiResponse(
                            responseCode = "404",
                            description = "Sale not found",
                            content = @Content(mediaType = "application/json")
                    )
            }
    )
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteSale(@PathVariable Long id) throws EntityNotFoundException {
        saleService.deleteSale(id);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }

    // =============================================================================
    // SALE VIEWING AND LISTING - FOR SALE MANAGEMENT PAGE
    // =============================================================================

    @Operation(
            summary = "Get sale detailed view",
            description = "Retrieves comprehensive sale information including customer, location, payment method, all products with pricing breakdown, and discount calculations. Used for sale detail modal/page.",
            responses = {
                    @ApiResponse(
                            responseCode = "200",
                            description = "Sale detailed view with complete information",
                            content = @Content(
                                    mediaType = "application/json",
                                    schema = @Schema(implementation = SaleDetailedViewDTO.class)
                            )
                    ),
                    @ApiResponse(
                            responseCode = "404",
                            description = "Sale not found",
                            content = @Content(mediaType = "application/json")
                    )
            }
    )
    @GetMapping("/{id}/details")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<SaleDetailedViewDTO> getSaleDetailedView(@PathVariable Long id) throws EntityNotFoundException {
        SaleDetailedViewDTO saleDetails = saleService.getSaleDetailedView(id);
        return new ResponseEntity<>(saleDetails, HttpStatus.OK);
    }

    @Operation(
            summary = "Search sales with advanced filtering and summary",
            description = "Searches sales with pagination and filtering support. Includes optional summary calculation for filtered results ≤ 100. Main endpoint for sale management page listing with advanced search capabilities.",
            responses = {
                    @ApiResponse(
                            responseCode = "200",
                            description = "Paginated list of sales with optional summary",
                            content = @Content(
                                    mediaType = "application/json",
                                    schema = @Schema(implementation = PaginatedFilteredSalesWithSummary.class)
                            )
                    )
            }
    )
    @GetMapping("/search")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<PaginatedFilteredSalesWithSummary> searchSalesWithSummary(
            @Parameter(description = "Customer ID filter") @RequestParam(required = false) Long customerId,
            @Parameter(description = "Customer name or email filter") @RequestParam(required = false) String customerNameOrEmail,
            @Parameter(description = "Product name or productCode filter") @RequestParam(required = false) String productNameOrCode,
            @Parameter(description = "Product ID filter") @RequestParam(required = false) Long productId,
            @Parameter(description = "Location ID filter") @RequestParam(required = false) Long locationId,
            @Parameter(description = "Category ID filter") @RequestParam(required = false) Long categoryId,
            @Parameter(description = "Sale date from (inclusive)") @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate saleDateFrom,
            @Parameter(description = "Sale date to (inclusive)") @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate saleDateTo,
            @Parameter(description = "Payment method filter") @RequestParam(required = false) PaymentMethod paymentMethod,
            @Parameter(description = "Page number (0-based)") @RequestParam(required = false, defaultValue = "0") int page,
            @Parameter(description = "Page size") @RequestParam(required = false, defaultValue = "20") int pageSize,
            @Parameter(description = "Sort field") @RequestParam(required = false, defaultValue = "saleDate") String sortBy,
            @Parameter(description = "Sort direction") @RequestParam(required = false, defaultValue = "DESC") String sortDirection) {

        SaleFilters filters = SaleFilters.builder()
                .customerId(customerId)
                .customerNameOrEmail(customerNameOrEmail)
                .productNameOrCode(productNameOrCode)
                .productId(productId)
                .locationId(locationId)
                .categoryId(categoryId)
                .saleDateFrom(saleDateFrom)
                .saleDateTo(saleDateTo)
                .paymentMethod(paymentMethod)
                .build();

        // Set pagination properties using request parameters (with defaults)
        filters.setPage(page);
        filters.setPageSize(pageSize);
        filters.setSortBy(sortBy);
        filters.setSortDirection(Sort.Direction.valueOf(sortDirection.toUpperCase()));

        PaginatedFilteredSalesWithSummary sales = saleService.searchSalesWithSummary(filters);
        return new ResponseEntity<>(sales, HttpStatus.OK);
    }

}
