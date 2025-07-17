package gr.aueb.cf.bluemargarita.rest;

import gr.aueb.cf.bluemargarita.core.enums.PaymentMethod;
import gr.aueb.cf.bluemargarita.core.exceptions.EntityNotFoundException;
import gr.aueb.cf.bluemargarita.core.exceptions.EntityNotAuthorizedException;
import gr.aueb.cf.bluemargarita.core.exceptions.ValidationException;
import gr.aueb.cf.bluemargarita.core.filters.Paginated;
import gr.aueb.cf.bluemargarita.core.filters.SaleFilters;
import gr.aueb.cf.bluemargarita.dto.price_calculation.PriceCalculationRequestDTO;
import gr.aueb.cf.bluemargarita.dto.price_calculation.PriceCalculationResponseDTO;
import gr.aueb.cf.bluemargarita.dto.sale.*;
import gr.aueb.cf.bluemargarita.dto.shopping_cart.CartItemDTO;
import gr.aueb.cf.bluemargarita.service.ISaleService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
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

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

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
            summary = "Record a new sale",
            description = "Records a new product sale with automatic pricing calculation and stock reduction. Validates location, customer, and products exist, calculates suggested pricing with discount application, and reduces stock. Used in Record Sale page.",
            responses = {
                    @ApiResponse(
                            responseCode = "201",
                            description = "Sale recorded successfully",
                            content = @Content(
                                    mediaType = "application/json",
                                    schema = @Schema(implementation = SaleDetailedViewDTO.class)
                            )
                    ),
                    @ApiResponse(
                            responseCode = "400",
                            description = "Invalid input data",
                            content = @Content(mediaType = "application/json")
                    ),
                    @ApiResponse(
                            responseCode = "404",
                            description = "Location, customer, user, or product not found",
                            content = @Content(mediaType = "application/json")
                    )
            }
    )
    @PostMapping
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<SaleDetailedViewDTO> recordSale(
            @Valid @RequestBody RecordSaleRequestDTO request,
            BindingResult bindingResult) throws EntityNotFoundException, ValidationException {

        if (bindingResult.hasErrors()) {
            throw new ValidationException(bindingResult);
        }

        SaleDetailedViewDTO sale = saleService.recordSale(request);
        return new ResponseEntity<>(sale, HttpStatus.CREATED);
    }

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

    // =============================================================================
    // SALE VIEWING AND LISTING - FOR SALE MANAGEMENT PAGE
    // =============================================================================

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
            @Parameter(description = "Product name or code filter") @RequestParam(required = false) String productNameOrCode,
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

    // =============================================================================
    // RECORD SALE PAGE HELPER ENDPOINTS
    // =============================================================================

    @Operation(
            summary = "Get available payment methods",
            description = "Retrieves all available payment methods for dropdown selection in Record Sale page. Converts enum values to user-friendly DTOs.",
            responses = {
                    @ApiResponse(
                            responseCode = "200",
                            description = "List of available payment methods",
                            content = @Content(
                                    mediaType = "application/json",
                                    schema = @Schema(implementation = PaymentMethodDTO.class)
                            )
                    )
            }
    )
    @GetMapping("/payment-methods")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<List<PaymentMethodDTO>> getAvailablePaymentMethods() {
        List<PaymentMethodDTO> paymentMethods = saleService.getAvailablePaymentMethods();
        return new ResponseEntity<>(paymentMethods, HttpStatus.OK);
    }

    @Operation(
            summary = "Get product for shopping cart",
            description = "Retrieves product details formatted for shopping cart with appropriate pricing (wholesale vs retail). Used when adding products to cart in Record Sale page.",
            responses = {
                    @ApiResponse(
                            responseCode = "200",
                            description = "Product cart item with pricing",
                            content = @Content(
                                    mediaType = "application/json",
                                    schema = @Schema(implementation = CartItemDTO.class)
                            )
                    ),
                    @ApiResponse(
                            responseCode = "404",
                            description = "Product not found",
                            content = @Content(mediaType = "application/json")
                    )
            }
    )
    @GetMapping("/cart-item/{productId}")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<CartItemDTO> getProductForCart(
            @PathVariable Long productId,
            @Parameter(description = "Quantity to add to cart", required = true) @RequestParam @DecimalMin(value = "0.01", message = "Quantity must be greater than 0") @Digits(integer = 3, fraction = 2, message = "Quantity can have up to 3 digits and 2 decimals") BigDecimal quantity,
            @Parameter(description = "Whether this is a wholesale sale", required = true) @RequestParam boolean isWholesale) throws EntityNotFoundException {

        CartItemDTO cartItem = saleService.getProductForCart(productId, quantity, isWholesale);
        return new ResponseEntity<>(cartItem, HttpStatus.OK);
    }

    @Operation(
            summary = "Calculate cart pricing with discount",
            description = "Calculates real-time pricing for shopping cart with discount handling. Supports both user-entered final price and discount percentage inputs. Includes subtotal, packaging cost, and item-by-item breakdown.",
            responses = {
                    @ApiResponse(
                            responseCode = "200",
                            description = "Complete pricing breakdown with calculations",
                            content = @Content(
                                    mediaType = "application/json",
                                    schema = @Schema(implementation = PriceCalculationResponseDTO.class)
                            )
                    ),
                    @ApiResponse(
                            responseCode = "400",
                            description = "Invalid pricing calculation request",
                            content = @Content(mediaType = "application/json")
                    ),
                    @ApiResponse(
                            responseCode = "404",
                            description = "Product not found",
                            content = @Content(mediaType = "application/json")
                    )
            }
    )
    @PostMapping("/calculate-pricing")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<PriceCalculationResponseDTO> calculateCartPricing(
            @Valid @RequestBody PriceCalculationRequestDTO request,
            BindingResult bindingResult) throws EntityNotFoundException, ValidationException {

        if (bindingResult.hasErrors()) {
            throw new ValidationException(bindingResult);
        }

        PriceCalculationResponseDTO pricing = saleService.calculateCartPricing(request);
        return new ResponseEntity<>(pricing, HttpStatus.OK);
    }

    // =============================================================================
    // CONVENIENCE ENDPOINTS
    // =============================================================================

    @Operation(
            summary = "Get sales by date range",
            description = "Simple endpoint to retrieve sales within a specific date range without advanced filtering. Used for reports and simple date-based queries.",
            responses = {
                    @ApiResponse(
                            responseCode = "200",
                            description = "Paginated list of sales in date range",
                            content = @Content(
                                    mediaType = "application/json",
                                    schema = @Schema(implementation = PaginatedFilteredSalesWithSummary.class)
                            )
                    )
            }
    )
    @GetMapping("/date-range")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<PaginatedFilteredSalesWithSummary> getSalesByDateRange(
            @Parameter(description = "Start date (inclusive)", required = true) @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @Parameter(description = "End date (inclusive)", required = true) @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @Parameter(description = "Page number (0-based)") @RequestParam(required = false, defaultValue = "0") int page,
            @Parameter(description = "Page size") @RequestParam(required = false, defaultValue = "20") int pageSize,
            @Parameter(description = "Sort field") @RequestParam(required = false, defaultValue = "saleDate") String sortBy,
            @Parameter(description = "Sort direction") @RequestParam(required = false, defaultValue = "DESC") String sortDirection) {

        SaleFilters filters = SaleFilters.builder()
                .saleDateFrom(startDate)
                .saleDateTo(endDate)
                .build();

        // Set pagination properties
        filters.setPage(page);
        filters.setPageSize(pageSize);
        filters.setSortBy(sortBy);
        filters.setSortDirection(Sort.Direction.valueOf(sortDirection.toUpperCase()));

        PaginatedFilteredSalesWithSummary sales = saleService.searchSalesWithSummary(filters);
        return new ResponseEntity<>(sales, HttpStatus.OK);
    }

    @Operation(
            summary = "Get sales by customer",
            description = "Retrieves all sales from a specific customer with pagination. Used for customer analysis and relationship management.",
            responses = {
                    @ApiResponse(
                            responseCode = "200",
                            description = "Paginated list of sales from the customer",
                            content = @Content(
                                    mediaType = "application/json",
                                    schema = @Schema(implementation = PaginatedFilteredSalesWithSummary.class)
                            )
                    )
            }
    )
    @GetMapping("/customer/{customerId}")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<PaginatedFilteredSalesWithSummary> getSalesByCustomer(
            @PathVariable Long customerId,
            @Parameter(description = "Page number (0-based)") @RequestParam(required = false, defaultValue = "0") int page,
            @Parameter(description = "Page size") @RequestParam(required = false, defaultValue = "20") int pageSize,
            @Parameter(description = "Sort field") @RequestParam(required = false, defaultValue = "saleDate") String sortBy,
            @Parameter(description = "Sort direction") @RequestParam(required = false, defaultValue = "DESC") String sortDirection) {

        SaleFilters filters = SaleFilters.builder()
                .customerId(customerId)
                .build();

        // Set pagination properties
        filters.setPage(page);
        filters.setPageSize(pageSize);
        filters.setSortBy(sortBy);
        filters.setSortDirection(Sort.Direction.valueOf(sortDirection.toUpperCase()));

        PaginatedFilteredSalesWithSummary sales = saleService.searchSalesWithSummary(filters);
        return new ResponseEntity<>(sales, HttpStatus.OK);
    }

    @Operation(
            summary = "Get sales by location",
            description = "Retrieves all sales from a specific location with pagination. Used for location performance analysis and management.",
            responses = {
                    @ApiResponse(
                            responseCode = "200",
                            description = "Paginated list of sales from the location",
                            content = @Content(
                                    mediaType = "application/json",
                                    schema = @Schema(implementation = PaginatedFilteredSalesWithSummary.class)
                            )
                    )
            }
    )
    @GetMapping("/location/{locationId}")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<PaginatedFilteredSalesWithSummary> getSalesByLocation(
            @PathVariable Long locationId,
            @Parameter(description = "Page number (0-based)") @RequestParam(required = false, defaultValue = "0") int page,
            @Parameter(description = "Page size") @RequestParam(required = false, defaultValue = "20") int pageSize,
            @Parameter(description = "Sort field") @RequestParam(required = false, defaultValue = "saleDate") String sortBy,
            @Parameter(description = "Sort direction") @RequestParam(required = false, defaultValue = "DESC") String sortDirection) {

        SaleFilters filters = SaleFilters.builder()
                .locationId(locationId)
                .build();

        // Set pagination properties
        filters.setPage(page);
        filters.setPageSize(pageSize);
        filters.setSortBy(sortBy);
        filters.setSortDirection(Sort.Direction.valueOf(sortDirection.toUpperCase()));

        PaginatedFilteredSalesWithSummary sales = saleService.searchSalesWithSummary(filters);
        return new ResponseEntity<>(sales, HttpStatus.OK);
    }

    @Operation(
            summary = "Get sales containing specific product",
            description = "Retrieves all sales that contain a specific product with pagination. Used for product sales analysis and performance tracking.",
            responses = {
                    @ApiResponse(
                            responseCode = "200",
                            description = "Paginated list of sales containing the product",
                            content = @Content(
                                    mediaType = "application/json",
                                    schema = @Schema(implementation = PaginatedFilteredSalesWithSummary.class)
                            )
                    )
            }
    )
    @GetMapping("/product/{productId}")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<PaginatedFilteredSalesWithSummary> getSalesByProduct(
            @PathVariable Long productId,
            @Parameter(description = "Page number (0-based)") @RequestParam(required = false, defaultValue = "0") int page,
            @Parameter(description = "Page size") @RequestParam(required = false, defaultValue = "20") int pageSize,
            @Parameter(description = "Sort field") @RequestParam(required = false, defaultValue = "saleDate") String sortBy,
            @Parameter(description = "Sort direction") @RequestParam(required = false, defaultValue = "DESC") String sortDirection) {

        SaleFilters filters = SaleFilters.builder()
                .productId(productId)
                .build();

        // Set pagination properties
        filters.setPage(page);
        filters.setPageSize(pageSize);
        filters.setSortBy(sortBy);
        filters.setSortDirection(Sort.Direction.valueOf(sortDirection.toUpperCase()));

        PaginatedFilteredSalesWithSummary sales = saleService.searchSalesWithSummary(filters);
        return new ResponseEntity<>(sales, HttpStatus.OK);
    }
}
