package gr.aueb.cf.bluemargarita.rest;

import gr.aueb.cf.bluemargarita.core.exceptions.EntityNotFoundException;
import gr.aueb.cf.bluemargarita.core.exceptions.ValidationException;
import gr.aueb.cf.bluemargarita.core.filters.Paginated;
import gr.aueb.cf.bluemargarita.core.filters.ProductFilters;
import gr.aueb.cf.bluemargarita.dto.product.ProductSearchResultDTO;
import gr.aueb.cf.bluemargarita.dto.stock.*;
import gr.aueb.cf.bluemargarita.service.IProductService;
import gr.aueb.cf.bluemargarita.service.IStockManagementService;
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

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/stock-management")
@RequiredArgsConstructor
@SecurityRequirement(name = "Bearer Authentication")
@Tag(name = "Stock Management", description = "APIs for the Stock Management page including product stock overview, individual and bulk stock updates, and stock alerts")
public class StockManagementRestController {

    private final IStockManagementService stockManagementService;
    private final IProductService productService;

    // =============================================================================
    // PAGE INITIALIZATION - LOAD STOCK OVERVIEW
    // =============================================================================

    @Operation(
            summary = "Get Stock Management page overview",
            description = "Retrieves stock management overview including products with different stock statuses. Provides filtered views for low stock, negative stock, and normal stock products. Optimized for page load.",
            responses = {
                    @ApiResponse(
                            responseCode = "200",
                            description = "Complete stock management overview with categorized products",
                            content = @Content(
                                    mediaType = "application/json",
                                    schema = @Schema(implementation = StockOverviewDTO.class)
                            )
                    )
            }
    )
    @GetMapping("/overview")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<StockOverviewDTO> getStockManagementOverview() {
        StockOverviewDTO overview = stockManagementService.getStockOverview();
        return new ResponseEntity<>(overview, HttpStatus.OK);
    }

    // =============================================================================
    // STOCK LISTING AND FILTERING
    // =============================================================================

    @Operation(
            summary = "Get products for stock management with filtering",
            description = "Retrieves products optimized for stock management operations with comprehensive filtering options. Supports filtering by stock status, category, name, and pagination.",
            responses = {
                    @ApiResponse(
                            responseCode = "200",
                            description = "Paginated list of products with stock management data",
                            content = @Content(
                                    mediaType = "application/json",
                                    schema = @Schema(implementation = Paginated.class)
                            )
                    )
            }
    )
    @GetMapping("/products")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<Paginated<StockManagementDTO>> getProductsForStockManagement(
            @Parameter(description = "Product name or productCode filter") @RequestParam(required = false) String nameOrCode,
            @Parameter(description = "Category ID filter") @RequestParam(required = false) Long categoryId,
            @Parameter(description = "Low stock filter") @RequestParam(required = false) Boolean lowStock,
            @Parameter(description = "Minimum stock filter") @RequestParam(required = false) Integer minStock,
            @Parameter(description = "Maximum stock filter") @RequestParam(required = false) Integer maxStock,
            @Parameter(description = "Page number (0-based)") @RequestParam(required = false, defaultValue = "0") int page,
            @Parameter(description = "Page size") @RequestParam(required = false, defaultValue = "20") int pageSize,
            @Parameter(description = "Sort field") @RequestParam(required = false, defaultValue = "stock") String sortBy,
            @Parameter(description = "Sort direction") @RequestParam(required = false, defaultValue = "ASC") String sortDirection) {

        ProductFilters filters = ProductFilters.builder()
                .nameOrCode(nameOrCode)
                .categoryId(categoryId)
                .lowStock(lowStock)
                .minStock(minStock)
                .maxStock(maxStock)
                .isActive(true) // Only show active products for stock management
                .build();

        // Set pagination properties
        filters.setPage(page);
        filters.setPageSize(pageSize);
        filters.setSortBy(sortBy);
        filters.setSortDirection(Sort.Direction.valueOf(sortDirection.toUpperCase()));

        Paginated<StockManagementDTO> products = stockManagementService.getProductsForStockManagement(filters);
        return new ResponseEntity<>(products, HttpStatus.OK);
    }

    // =============================================================================
    // STOCK STATUS VIEWS - QUICK ACCESS TO PROBLEM AREAS
    // =============================================================================

    @Operation(
            summary = "Get low stock products",
            description = "Retrieves products with stock levels at or below their low stock alert thresholds. These products need restocking attention.",
            responses = {
                    @ApiResponse(
                            responseCode = "200",
                            description = "Paginated list of low stock products",
                            content = @Content(
                                    mediaType = "application/json",
                                    schema = @Schema(implementation = Paginated.class)
                            )
                    )
            }
    )
    @GetMapping("/low-stock")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<Paginated<StockAlertDTO>> getLowStockProducts(
            @Parameter(description = "Page number (0-based)") @RequestParam(required = false, defaultValue = "0") int page,
            @Parameter(description = "Page size") @RequestParam(required = false, defaultValue = "20") int pageSize) {

        ProductFilters filters = ProductFilters.builder()
                .lowStock(true)
                .isActive(true)
                .build();

        // Set pagination properties
        filters.setPage(page);
        filters.setPageSize(pageSize);
        filters.setSortBy("stock");
        filters.setSortDirection(Sort.Direction.ASC);

        Paginated<StockAlertDTO> products = stockManagementService.getAllLowStockProductsPaginated(filters);
        return new ResponseEntity<>(products, HttpStatus.OK);
    }

    @Operation(
            summary = "Get negative stock products",
            description = "Retrieves products with negative stock levels. These are critical inventory issues requiring immediate attention.",
            responses = {
                    @ApiResponse(
                            responseCode = "200",
                            description = "Paginated list of negative stock products",
                            content = @Content(
                                    mediaType = "application/json",
                                    schema = @Schema(implementation = Paginated.class)
                            )
                    )
            }
    )
    @GetMapping("/negative-stock")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<Paginated<StockManagementDTO>> getNegativeStockProducts(
            @Parameter(description = "Page number (0-based)") @RequestParam(required = false, defaultValue = "0") int page,
            @Parameter(description = "Page size") @RequestParam(required = false, defaultValue = "20") int pageSize,
            @Parameter(description = "Sort field") @RequestParam(required = false, defaultValue = "stock") String sortBy,
            @Parameter(description = "Sort direction") @RequestParam(required = false, defaultValue = "ASC") String sortDirection) {

        ProductFilters filters = ProductFilters.builder()
                .maxStock(-1) // Negative stock only
                .isActive(true)
                .build();

        // Set pagination properties
        filters.setPage(page);
        filters.setPageSize(pageSize);
        filters.setSortBy(sortBy);
        filters.setSortDirection(Sort.Direction.valueOf(sortDirection.toUpperCase()));

        Paginated<StockManagementDTO> products = stockManagementService.getProductsForStockManagement(filters);
        return new ResponseEntity<>(products, HttpStatus.OK);
    }

    // =============================================================================
    // PRODUCT SEARCH FOR STOCK UPDATES
    // =============================================================================

    @Operation(
            summary = "Search products for stock updates",
            description = "Searches products for autocomplete functionality when selecting products for stock updates. Returns products matching name or productCode.",
            responses = {
                    @ApiResponse(
                            responseCode = "200",
                            description = "List of products matching search term",
                            content = @Content(
                                    mediaType = "application/json",
                                    schema = @Schema(implementation = ProductSearchResultDTO.class)
                            )
                    )
            }
    )
    @GetMapping("/products/search")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<List<ProductSearchResultDTO>> searchProducts(
            @Parameter(description = "Search term (product name or productCode)", required = true)
            @RequestParam String searchTerm) {

        List<ProductSearchResultDTO> products = productService.searchProductsForAutocomplete(searchTerm);
        return new ResponseEntity<>(products, HttpStatus.OK);
    }

    // =============================================================================
    // STOCK UPDATE OPERATIONS
    // =============================================================================

    @Operation(
            summary = "Update stock for a single product",
            description = "Updates stock for a single product. Supports ADD (increase), REMOVE (decrease), and SET (absolute value) operations. Used for individual stock adjustments.",
            responses = {
                    @ApiResponse(
                            responseCode = "200",
                            description = "Stock updated successfully",
                            content = @Content(
                                    mediaType = "application/json",
                                    schema = @Schema(implementation = StockUpdateResultDTO.class)
                            )
                    ),
                    @ApiResponse(
                            responseCode = "400",
                            description = "Invalid stock update data",
                            content = @Content(mediaType = "application/json")
                    ),
                    @ApiResponse(
                            responseCode = "404",
                            description = "Product not found",
                            content = @Content(mediaType = "application/json")
                    )
            }
    )
    @PatchMapping("/update-stock")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<StockUpdateResultDTO> updateProductStock(
            @Valid @RequestBody StockUpdateDTO updateDTO,
            BindingResult bindingResult) throws ValidationException, EntityNotFoundException {

        if (bindingResult.hasErrors()) {
            throw new ValidationException(bindingResult);
        }

        StockUpdateResultDTO result = stockManagementService.updateProductStock(updateDTO);
        return new ResponseEntity<>(result, HttpStatus.OK);
    }

    @Operation(
            summary = "Update stock for multiple products in bulk",
            description = "Updates stock for multiple products in a single operation. Processes all updates and returns individual results for each product. Used for bulk stock operations like physical inventory counts.",
            responses = {
                    @ApiResponse(
                            responseCode = "200",
                            description = "Bulk stock update completed",
                            content = @Content(
                                    mediaType = "application/json",
                                    schema = @Schema(implementation = StockUpdateResultDTO.class)
                            )
                    ),
                    @ApiResponse(
                            responseCode = "400",
                            description = "Invalid bulk update data",
                            content = @Content(mediaType = "application/json")
                    )
            }
    )
    @PatchMapping("/bulk-update-stock")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<List<StockUpdateResultDTO>> updateMultipleProductsStock(
            @Valid @RequestBody BulkStockUpdateDTO bulkUpdate,
            BindingResult bindingResult) throws ValidationException {

        if (bindingResult.hasErrors()) {
            throw new ValidationException(bindingResult);
        }

        List<StockUpdateResultDTO> results = stockManagementService.updateMultipleProductsStock(bulkUpdate);
        return new ResponseEntity<>(results, HttpStatus.OK);
    }

    // =============================================================================
    // STOCK UPDATE TYPES HELPER
    // =============================================================================

    @Operation(
            summary = "Get available stock update types",
            description = "Returns the available stock update operation types: ADD (increase stock), REMOVE (decrease stock), SET (set absolute value). Used for form dropdowns.",
            responses = {
                    @ApiResponse(
                            responseCode = "200",
                            description = "List of stock update types",
                            content = @Content(
                                    mediaType = "application/json",
                                    schema = @Schema(implementation = Map.class)
                            )
                    )
            }
    )
    @GetMapping("/update-types")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<Map<String, String>> getStockUpdateTypes() {
        Map<String, String> updateTypes = new HashMap<>();
        updateTypes.put("ADD", "Add to Stock");
        updateTypes.put("REMOVE", "Remove from Stock");
        updateTypes.put("SET", "Set Absolute Value");

        return new ResponseEntity<>(updateTypes, HttpStatus.OK);
    }
}