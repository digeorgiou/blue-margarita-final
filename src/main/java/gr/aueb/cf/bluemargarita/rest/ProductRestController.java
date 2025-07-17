package gr.aueb.cf.bluemargarita.rest;

import gr.aueb.cf.bluemargarita.core.exceptions.EntityAlreadyExistsException;
import gr.aueb.cf.bluemargarita.core.exceptions.EntityInvalidArgumentException;
import gr.aueb.cf.bluemargarita.core.exceptions.EntityNotFoundException;
import gr.aueb.cf.bluemargarita.core.exceptions.ValidationException;
import gr.aueb.cf.bluemargarita.core.filters.Paginated;
import gr.aueb.cf.bluemargarita.core.filters.ProductFilters;
import gr.aueb.cf.bluemargarita.dto.product.*;
import gr.aueb.cf.bluemargarita.dto.stock.BulkStockUpdateDTO;
import gr.aueb.cf.bluemargarita.dto.stock.StockManagementDTO;
import gr.aueb.cf.bluemargarita.dto.stock.StockUpdateDTO;
import gr.aueb.cf.bluemargarita.dto.stock.StockUpdateResultDTO;
import gr.aueb.cf.bluemargarita.service.IProductService;
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
@RequestMapping("/api/products")
@RequiredArgsConstructor
@SecurityRequirement(name = "Bearer Authentication")
@Tag(name = "Product Management", description = "APIs for managing jewelry products, materials, procedures, and stock")
public class ProductRestController {

    private final IProductService productService;

    // =============================================================================
    // CORE CRUD OPERATIONS - FOR PRODUCT MANAGEMENT PAGE
    // =============================================================================

    @Operation(
            summary = "Create a new product",
            description = "Creates a new jewelry product with unique name and code validation, optional materials and procedures. Used in product management.",
            responses = {
                    @ApiResponse(
                            responseCode = "201",
                            description = "Product created successfully",
                            content = @Content(
                                    mediaType = "application/json",
                                    schema = @Schema(implementation = ProductListItemDTO.class)
                            )
                    ),
                    @ApiResponse(
                            responseCode = "400",
                            description = "Validation errors",
                            content = @Content(mediaType = "application/json")
                    ),
                    @ApiResponse(
                            responseCode = "409",
                            description = "Product with name or code already exists",
                            content = @Content(mediaType = "application/json")
                    )
            }
    )
    @PostMapping
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<ProductListItemDTO> createProduct(
            @Valid @RequestBody ProductInsertDTO productInsertDTO,
            BindingResult bindingResult) throws ValidationException, EntityAlreadyExistsException, EntityNotFoundException {

        if (bindingResult.hasErrors()) {
            throw new ValidationException(bindingResult);
        }

        ProductListItemDTO product = productService.createProduct(productInsertDTO);
        return new ResponseEntity<>(product, HttpStatus.CREATED);
    }

    @Operation(
            summary = "Update product",
            description = "Updates an existing product's basic information with automatic pricing recalculation. Used in product management.",
            responses = {
                    @ApiResponse(
                            responseCode = "200",
                            description = "Product updated successfully",
                            content = @Content(
                                    mediaType = "application/json",
                                    schema = @Schema(implementation = ProductListItemDTO.class)
                            )
                    ),
                    @ApiResponse(
                            responseCode = "400",
                            description = "Validation errors",
                            content = @Content(mediaType = "application/json")
                    ),
                    @ApiResponse(
                            responseCode = "404",
                            description = "Product not found",
                            content = @Content(mediaType = "application/json")
                    ),
                    @ApiResponse(
                            responseCode = "409",
                            description = "Product with name or code already exists",
                            content = @Content(mediaType = "application/json")
                    )
            }
    )
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<ProductListItemDTO> updateProduct(
            @PathVariable Long id,
            @Valid @RequestBody ProductUpdateDTO productUpdateDTO,
            BindingResult bindingResult) throws ValidationException, EntityAlreadyExistsException, EntityNotFoundException {

        if (bindingResult.hasErrors()) {
            throw new ValidationException(bindingResult);
        }

        ProductListItemDTO product = productService.updateProduct(productUpdateDTO);
        return new ResponseEntity<>(product, HttpStatus.OK);
    }

    @Operation(
            summary = "Delete product",
            description = "Deletes a product. Performs soft delete if product has sales history, hard delete otherwise. Requires ADMIN role.",
            responses = {
                    @ApiResponse(
                            responseCode = "204",
                            description = "Product deleted successfully"
                    ),
                    @ApiResponse(
                            responseCode = "404",
                            description = "Product not found",
                            content = @Content(mediaType = "application/json")
                    )
            }
    )
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteProduct(@PathVariable Long id) throws EntityNotFoundException {
        productService.deleteProduct(id);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }

    // =============================================================================
    // PRODUCT VIEWING AND LISTING - FOR PRODUCT MANAGEMENT PAGE
    // =============================================================================

    @Operation(
            summary = "Get products with pagination and filters",
            description = "Retrieves products with pagination and advanced filtering support. Main endpoint for product management page listing.",
            responses = {
                    @ApiResponse(
                            responseCode = "200",
                            description = "Paginated list of products with cost data",
                            content = @Content(
                                    mediaType = "application/json",
                                    schema = @Schema(implementation = Paginated.class)
                            )
                    )
            }
    )
    @GetMapping
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<Paginated<ProductListItemDTO>> getProductsFilteredPaginated(
            @Parameter(description = "Product name or code filter") @RequestParam(required = false) String nameOrCode,
            @Parameter(description = "Category ID filter") @RequestParam(required = false) Long categoryId,
            @Parameter(description = "Procedure ID filter") @RequestParam(required = false) Long procedureId,
            @Parameter(description = "Material name filter") @RequestParam(required = false) String materialName,
            @Parameter(description = "Material ID filter") @RequestParam(required = false) Long materialId,
            @Parameter(description = "Minimum price filter") @RequestParam(required = false) BigDecimal minPrice,
            @Parameter(description = "Maximum price filter") @RequestParam(required = false) BigDecimal maxPrice,
            @Parameter(description = "Minimum stock filter") @RequestParam(required = false) Integer minStock,
            @Parameter(description = "Maximum stock filter") @RequestParam(required = false) Integer maxStock,
            @Parameter(description = "Active status filter") @RequestParam(required = false) Boolean isActive,
            @Parameter(description = "Low stock filter") @RequestParam(required = false) Boolean lowStock,
            @Parameter(description = "Page number (0-based)") @RequestParam(required = false, defaultValue = "0") int page,
            @Parameter(description = "Page size") @RequestParam(required = false, defaultValue = "20") int pageSize,
            @Parameter(description = "Sort field") @RequestParam(required = false, defaultValue = "name") String sortBy,
            @Parameter(description = "Sort direction") @RequestParam(required = false, defaultValue = "ASC") String sortDirection) {

        ProductFilters filters = ProductFilters.builder()
                .nameOrCode(nameOrCode)
                .categoryId(categoryId)
                .procedureId(procedureId)
                .materialName(materialName)
                .materialId(materialId)
                .minPrice(minPrice)
                .maxPrice(maxPrice)
                .minStock(minStock)
                .maxStock(maxStock)
                .isActive(isActive)
                .lowStock(lowStock)
                .build();

        // Set pagination properties using request parameters (with defaults)
        filters.setPage(page);
        filters.setPageSize(pageSize);
        filters.setSortBy(sortBy);
        filters.setSortDirection(Sort.Direction.valueOf(sortDirection.toUpperCase()));

        Paginated<ProductListItemDTO> products = productService.getProductListItemsPaginated(filters);
        return new ResponseEntity<>(products, HttpStatus.OK);
    }

    @Operation(
            summary = "Get product detailed view",
            description = "Retrieves comprehensive product information including materials, procedures, cost breakdown, and profit margins. Used for product detail modal/page.",
            responses = {
                    @ApiResponse(
                            responseCode = "200",
                            description = "Product detailed view with complete information",
                            content = @Content(
                                    mediaType = "application/json",
                                    schema = @Schema(implementation = ProductDetailedViewDTO.class)
                            )
                    ),
                    @ApiResponse(
                            responseCode = "404",
                            description = "Product not found",
                            content = @Content(mediaType = "application/json")
                    )
            }
    )
    @GetMapping("/{id}/details")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<ProductDetailedViewDTO> getProductDetailedView(@PathVariable Long id) throws EntityNotFoundException {
        ProductDetailedViewDTO productDetails = productService.getProductDetails(id);
        return new ResponseEntity<>(productDetails, HttpStatus.OK);
    }

    // =============================================================================
    // SEARCH AND AUTOCOMPLETE - FOR SALES RECORDING
    // =============================================================================

    @Operation(
            summary = "Search products for autocomplete",
            description = "Searches products for autocomplete functionality in sales recording. Returns limited results for performance. Used in Record Sale page.",
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
    @GetMapping("/search")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<List<ProductSearchResultDTO>> searchProductsForAutocomplete(
            @Parameter(description = "Search term (product name or code)", required = true)
            @RequestParam String searchTerm) {

        List<ProductSearchResultDTO> products = productService.searchProductsForAutocomplete(searchTerm);
        return new ResponseEntity<>(products, HttpStatus.OK);
    }

    // =============================================================================
    // MATERIAL RELATIONSHIP MANAGEMENT
    // =============================================================================

    @Operation(
            summary = "Add material to product",
            description = "Adds a material to a product or updates the quantity if already exists. Automatically recalculates suggested prices.",
            responses = {
                    @ApiResponse(
                            responseCode = "200",
                            description = "Material added successfully, product updated",
                            content = @Content(
                                    mediaType = "application/json",
                                    schema = @Schema(implementation = ProductListItemDTO.class)
                            )
                    ),
                    @ApiResponse(
                            responseCode = "404",
                            description = "Product, material, or user not found",
                            content = @Content(mediaType = "application/json")
                    ),
                    @ApiResponse(
                            responseCode = "400",
                            description = "Invalid quantity",
                            content = @Content(mediaType = "application/json")
                    )
            }
    )
    @PostMapping("/{productId}/materials/{materialId}")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<ProductListItemDTO> addMaterialToProduct(
            @PathVariable Long productId,
            @PathVariable Long materialId,
            @Parameter(description = "Quantity of material needed")
            @RequestParam
            @DecimalMin(value = "0.001", message = "Quantity must be greater than 0")
            @Digits(integer = 4, fraction = 2, message = "Quantity can have up to 4 digits and 2 decimals")
            BigDecimal quantity,
            @Parameter(description = "User performing the operation")
            @RequestParam Long updaterUserId) throws EntityNotFoundException, EntityInvalidArgumentException {

        ProductListItemDTO product = productService.addMaterialToProduct(productId, materialId, quantity, updaterUserId);
        return new ResponseEntity<>(product, HttpStatus.OK);
    }

    @Operation(
            summary = "Remove material from product",
            description = "Removes a material from a product. Automatically recalculates suggested prices.",
            responses = {
                    @ApiResponse(
                            responseCode = "200",
                            description = "Material removed successfully, product updated",
                            content = @Content(
                                    mediaType = "application/json",
                                    schema = @Schema(implementation = ProductListItemDTO.class)
                            )
                    ),
                    @ApiResponse(
                            responseCode = "404",
                            description = "Product, material, or user not found",
                            content = @Content(mediaType = "application/json")
                    )
            }
    )
    @DeleteMapping("/{productId}/materials/{materialId}")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<ProductListItemDTO> removeMaterialFromProduct(
            @PathVariable Long productId,
            @PathVariable Long materialId,
            @Parameter(description = "User performing the operation")
            @RequestParam Long updaterUserId) throws EntityNotFoundException {

        ProductListItemDTO product = productService.removeMaterialFromProduct(productId, materialId, updaterUserId);
        return new ResponseEntity<>(product, HttpStatus.OK);
    }

    // =============================================================================
    // PROCEDURE RELATIONSHIP MANAGEMENT
    // =============================================================================

    @Operation(
            summary = "Add procedure to product",
            description = "Adds a procedure to a product or updates the cost if already exists. Automatically recalculates suggested prices.",
            responses = {
                    @ApiResponse(
                            responseCode = "200",
                            description = "Procedure added successfully, product updated",
                            content = @Content(
                                    mediaType = "application/json",
                                    schema = @Schema(implementation = ProductListItemDTO.class)
                            )
                    ),
                    @ApiResponse(
                            responseCode = "404",
                            description = "Product, procedure, or user not found",
                            content = @Content(mediaType = "application/json")
                    ),
                    @ApiResponse(
                            responseCode = "400",
                            description = "Invalid cost",
                            content = @Content(mediaType = "application/json")
                    )
            }
    )
    @PostMapping("/{productId}/procedures/{procedureId}")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<ProductListItemDTO> addProcedureToProduct(
            @PathVariable Long productId,
            @PathVariable Long procedureId,
            @Parameter(description = "Cost of the procedure for this product")
            @RequestParam
            @DecimalMin(value = "0.01", message = "Cost must be greater than 0")
            @Digits(integer = 4, fraction = 2, message = "Cost can have up to 4 digits and 2 decimals")
            BigDecimal cost,
            @Parameter(description = "User performing the operation")
            @RequestParam Long updaterUserId) throws EntityNotFoundException, EntityInvalidArgumentException {

        ProductListItemDTO product = productService.addProcedureToProduct(productId, procedureId, cost, updaterUserId);
        return new ResponseEntity<>(product, HttpStatus.OK);
    }

    @Operation(
            summary = "Remove procedure from product",
            description = "Removes a procedure from a product. Automatically recalculates suggested prices.",
            responses = {
                    @ApiResponse(
                            responseCode = "200",
                            description = "Procedure removed successfully, product updated",
                            content = @Content(
                                    mediaType = "application/json",
                                    schema = @Schema(implementation = ProductListItemDTO.class)
                            )
                    ),
                    @ApiResponse(
                            responseCode = "404",
                            description = "Product, procedure, or user not found",
                            content = @Content(mediaType = "application/json")
                    )
            }
    )
    @DeleteMapping("/{productId}/procedures/{procedureId}")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<ProductListItemDTO> removeProcedureFromProduct(
            @PathVariable Long productId,
            @PathVariable Long procedureId,
            @Parameter(description = "User performing the operation")
            @RequestParam Long updaterUserId) throws EntityNotFoundException {

        ProductListItemDTO product = productService.removeProcedureFromProduct(productId, procedureId, updaterUserId);
        return new ResponseEntity<>(product, HttpStatus.OK);
    }

    @Operation(
            summary = "Get all top products for period with pagination",
            description = "Retrieves all top products for a specific period with pagination and sorting. Used for 'View All Products for Month' functionality.",
            responses = {
                    @ApiResponse(
                            responseCode = "200",
                            description = "Paginated list of products with sales metrics",
                            content = @Content(
                                    mediaType = "application/json",
                                    schema = @Schema(implementation = Paginated.class)
                            )
                    )
            }
    )
    @GetMapping("/top-revenue/all")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<Paginated<ProductStatsSummaryDTO>> getAllTopProductsForPeriod(
            @Parameter(description = "Period start date") @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @Parameter(description = "Period end date") @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @Parameter(description = "Page number (0-based)") @RequestParam(required = false, defaultValue = "0") int page,
            @Parameter(description = "Page size") @RequestParam(required = false, defaultValue = "20") int pageSize,
            @Parameter(description = "Sort field") @RequestParam(required = false, defaultValue = "totalRevenue") String sortBy,
            @Parameter(description = "Sort direction") @RequestParam(required = false, defaultValue = "DESC") String sortDirection) {

        Pageable pageable = PageRequest.of(page, pageSize,
                Sort.by(Sort.Direction.valueOf(sortDirection.toUpperCase()), sortBy));

        Paginated<ProductStatsSummaryDTO> products = productService.getAllTopProductsForPeriod(startDate, endDate, pageable);
        return new ResponseEntity<>(products, HttpStatus.OK);
    }

    // =============================================================================
    // CONVENIENCE ENDPOINTS
    // =============================================================================

    @Operation(
            summary = "Get active product count",
            description = "Retrieves the total count of active products. Used for dashboard statistics.",
            responses = {
                    @ApiResponse(
                            responseCode = "200",
                            description = "Count of active products",
                            content = @Content(mediaType = "application/json")
                    )
            }
    )
    @GetMapping("/count/active")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<Integer> getActiveProductCount() {
        int count = productService.getActiveProductCount();
        return new ResponseEntity<>(count, HttpStatus.OK);
    }
}