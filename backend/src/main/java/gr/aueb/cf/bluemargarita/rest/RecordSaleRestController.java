package gr.aueb.cf.bluemargarita.rest;

import gr.aueb.cf.bluemargarita.core.exceptions.EntityNotFoundException;
import gr.aueb.cf.bluemargarita.core.exceptions.ValidationException;
import gr.aueb.cf.bluemargarita.dto.customer.CustomerSearchResultDTO;
import gr.aueb.cf.bluemargarita.dto.location.LocationForDropdownDTO;
import gr.aueb.cf.bluemargarita.dto.price_calculation.PriceCalculationRequestDTO;
import gr.aueb.cf.bluemargarita.dto.price_calculation.PriceCalculationResponseDTO;
import gr.aueb.cf.bluemargarita.dto.product.ProductSearchResultDTO;
import gr.aueb.cf.bluemargarita.dto.sale.PaymentMethodDTO;
import gr.aueb.cf.bluemargarita.dto.sale.RecordSaleRequestDTO;
import gr.aueb.cf.bluemargarita.dto.sale.SaleDetailedViewDTO;
import gr.aueb.cf.bluemargarita.dto.price_calculation.CartItemDTO;
import gr.aueb.cf.bluemargarita.service.*;
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
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/record-sale")
@RequiredArgsConstructor
@SecurityRequirement(name = "Bearer Authentication")
@Tag(name = "Record Sale", description = "APIs for the Record Sale page workflow including form data, cart management, pricing calculations, and sale recording")
public class RecordSaleRestController {

    private final ISaleService saleService;
    private final ICustomerService customerService;
    private final IProductService productService;
    private final ILocationService locationService;
    private final ICategoryService categoryService;

    // =============================================================================
    // PAGE INITIALIZATION - LOAD ALL FORM DATA
    // =============================================================================

    @Operation(
            summary = "Get Record Sale page initialization data",
            description = "Retrieves all necessary data for the Record Sale page in a single request: " +
                    "payment methods dropdown, locations dropdown, categories dropdown and initial form setup data. Optimized for page load.",
            responses = {
                    @ApiResponse(
                            responseCode = "200",
                            description = "Complete Record Sale page initialization data",
                            content = @Content(
                                    mediaType = "application/json",
                                    schema = @Schema(implementation = Map.class)
                            )
                    )
            }
    )
    @GetMapping("/init")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<Map<String, Object>> getRecordSalePageData() {
        Map<String, Object> pageData = new HashMap<>();

        // Form dropdown data
        pageData.put("paymentMethods", saleService.getAvailablePaymentMethods());
        pageData.put("locations", locationService.getActiveLocationsForDropdown());
        pageData.put("categoreies", categoryService.getActiveCategoriesForDropdown());

        return new ResponseEntity<>(pageData, HttpStatus.OK);
    }

    // =============================================================================
    // CUSTOMER SEARCH - AUTOCOMPLETE FUNCTIONALITY
    // =============================================================================

    @Operation(
            summary = "Search customers for autocomplete",
            description = "Searches customers for autocomplete functionality in Record Sale page. Returns customers matching name, email, or phone. Optional for walk-in customers.",
            responses = {
                    @ApiResponse(
                            responseCode = "200",
                            description = "List of customers matching search term",
                            content = @Content(
                                    mediaType = "application/json",
                                    schema = @Schema(implementation = CustomerSearchResultDTO.class)
                            )
                    )
            }
    )
    @GetMapping("/customers/search")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<List<CustomerSearchResultDTO>> searchCustomers(
            @Parameter(description = "Search term (name, email, or phone)", required = true)
            @RequestParam String searchTerm) {

        List<CustomerSearchResultDTO> customers = customerService.searchCustomersForAutocomplete(searchTerm);
        return new ResponseEntity<>(customers, HttpStatus.OK);
    }

    // =============================================================================
    // PRODUCT SEARCH AND CART MANAGEMENT
    // =============================================================================

    @Operation(
            summary = "Search products for autocomplete",
            description = "Searches products for autocomplete functionality when adding items to sale cart. Returns products matching name or productCode.",
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

    @Operation(
            summary = "Get product for shopping cart",
            description = "Retrieves product details formatted for shopping cart with appropriate pricing (wholesale vs retail). Used when adding products to cart after selection from autocomplete.",
            responses = {
                    @ApiResponse(
                            responseCode = "200",
                            description = "Product cart item with pricing details",
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
    @GetMapping("/products/{productId}/cart-item")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<CartItemDTO> getProductForCart(
            @PathVariable Long productId,
            @Parameter(description = "Quantity to add to cart", required = true)
            @RequestParam
            @DecimalMin(value = "0.01", message = "Quantity must be greater than 0")
            @Digits(integer = 3, fraction = 2, message = "Quantity can have up to 3 digits and 2 decimals")
            BigDecimal quantity,
            @Parameter(description = "Whether this is a wholesale sale", required = true)
            @RequestParam boolean isWholesale) throws EntityNotFoundException {

        CartItemDTO cartItem = saleService.getProductForCart(productId, quantity, isWholesale);
        return new ResponseEntity<>(cartItem, HttpStatus.OK);
    }

    // =============================================================================
    // PRICING CALCULATIONS - REAL-TIME CART PRICING
    // =============================================================================

    @Operation(
            summary = "Calculate real-time cart pricing",
            description = "Calculates complete pricing breakdown for shopping cart including subtotal, packaging cost, discounts, and final total. Supports both discount percentage and final price input methods.",
            responses = {
                    @ApiResponse(
                            responseCode = "200",
                            description = "Complete pricing breakdown with all calculations",
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
    // SALE RECORDING - FINAL STEP
    // =============================================================================

    @Operation(
            summary = "Record a new sale",
            description = "Records the complete sale with all products, pricing, and customer information. Automatically reduces stock, calculates final pricing with discounts, and updates customer records. Final step in Record Sale workflow.",
            responses = {
                    @ApiResponse(
                            responseCode = "201",
                            description = "Sale recorded successfully with complete details",
                            content = @Content(
                                    mediaType = "application/json",
                                    schema = @Schema(implementation = SaleDetailedViewDTO.class)
                            )
                    ),
                    @ApiResponse(
                            responseCode = "400",
                            description = "Invalid sale data or validation errors",
                            content = @Content(mediaType = "application/json")
                    ),
                    @ApiResponse(
                            responseCode = "404",
                            description = "Customer, location, user, or product not found",
                            content = @Content(mediaType = "application/json")
                    )
            }
    )
    @PostMapping("/record")
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

    // =============================================================================
    // FORM HELPER ENDPOINTS
    // =============================================================================

    @Operation(
            summary = "Get available payment methods",
            description = "Retrieves all available payment methods for dropdown selection. Converts enum values to user-friendly display names.",
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
    public ResponseEntity<List<PaymentMethodDTO>> getPaymentMethods() {
        List<PaymentMethodDTO> paymentMethods = saleService.getAvailablePaymentMethods();
        return new ResponseEntity<>(paymentMethods, HttpStatus.OK);
    }

    @Operation(
            summary = "Get active locations for dropdown",
            description = "Retrieves all active locations formatted for dropdown selection. Used for location selection in Record Sale form.",
            responses = {
                    @ApiResponse(
                            responseCode = "200",
                            description = "List of active locations for dropdown",
                            content = @Content(
                                    mediaType = "application/json",
                                    schema = @Schema(implementation = LocationForDropdownDTO.class)
                            )
                    )
            }
    )
    @GetMapping("/locations")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<List<LocationForDropdownDTO>> getActiveLocations() {
        List<LocationForDropdownDTO> locations = locationService.getActiveLocationsForDropdown();
        return new ResponseEntity<>(locations, HttpStatus.OK);
    }
}