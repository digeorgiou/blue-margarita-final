package gr.aueb.cf.bluemargarita.service;

import gr.aueb.cf.bluemargarita.core.exceptions.EntityNotFoundException;
import gr.aueb.cf.bluemargarita.core.filters.SaleFilters;
import gr.aueb.cf.bluemargarita.dto.price_calculation.PriceCalculationRequestDTO;
import gr.aueb.cf.bluemargarita.dto.price_calculation.PriceCalculationResponseDTO;
import gr.aueb.cf.bluemargarita.dto.sale.*;
import gr.aueb.cf.bluemargarita.dto.shopping_cart.CartItemDTO;

import java.math.BigDecimal;
import java.util.List;

/**
 * Service interface for managing sales in the jewelry business application.
 * Handles sale CRUD operations, pricing calculations, cart management,
 * dashboard widgets, and sales analytics.
 *
 * This service focuses on sale-specific operations and delegates to other services
 * for cross-domain functionality (customer search, product search, etc.).
 */
public interface ISaleService {

    // =============================================================================
    // CORE CRUD OPERATIONS
    // =============================================================================

    /**
     * Records a new sale with products, pricing, and automatic stock reduction
     *
     * Business Logic:
     * 1. Validates location, customer (if provided), and creator user exist
     * 2. Validates all products exist and builds product-quantity map
     * 3. Creates sale entity with provided details
     * 4. Calculates suggested pricing and applies discount to individual products
     * 5. Reduces stock for all products in the sale
     * 6. Updates customer's first sale date if this is their first purchase
     *
     * @param request Sale recording data including products, pricing, and metadata
     * @return Detailed view of the created sale
     * @throws EntityNotFoundException if location, customer, user, or any product not found
     */
    SaleDetailedViewDTO recordSale(RecordSaleRequestDTO request) throws EntityNotFoundException;

    /**
     * Updates an existing sale's basic information and recalculates pricing
     * Note: This method updates sale metadata but does not modify products in the sale
     *
     * @param dto Sale update data including new values for basic fields
     * @return Updated sale as read-only DTO
     * @throws EntityNotFoundException if sale, location, customer, or user not found
     */
    SaleReadOnlyDTO updateSale(SaleUpdateDTO dto) throws EntityNotFoundException;

    /**
     * Deletes a sale and restores stock for all products
     * This is a hard delete that removes all sale data and sale products
     *
     * @param saleId Sale ID to delete
     * @throws EntityNotFoundException if sale not found
     */
    void deleteSale(Long saleId) throws EntityNotFoundException;

    // =============================================================================
    // DASHBOARD METHODS
    // =============================================================================

    /**
     * Retrieves the most recent sales for dashboard widget
     * Ordered by sale date descending, then by creation time descending
     *
     * @param limit Maximum number of recent sales to return (typically 5)
     * @return List of recent sales with basic information
     */
    List<SaleReadOnlyDTO> getRecentSales(int limit);

    /**
     * Gets sales summary for current day (dashboard widget)
     * Includes count, total revenue, average order value, and discount metrics
     *
     * @return Summary of today's sales
     */
    SalesSummaryDTO getDailySalesSummary();

    /**
     * Gets sales summary for current week (Monday to Sunday, dashboard widget)
     * Includes count, total revenue, average order value, and discount metrics
     *
     * @return Summary of this week's sales
     */
    SalesSummaryDTO getWeeklySalesSummary();

    /**
     * Gets sales summary for current month (dashboard widget)
     * Includes count, total revenue, average order value, and discount metrics
     *
     * @return Summary of this month's sales
     */
    SalesSummaryDTO getMonthlySalesSummary();

    // =============================================================================
    // VIEW SALES PAGE METHODS
    // =============================================================================

    /**
     * Searches sales with advanced filtering and optional summary calculation
     *
     * Supports filtering by:
     * - Date range (saleDateFrom, saleDateTo)
     * - Location (dropdown selection by ID)
     * - Category (dropdown selection by ID)
     * - Payment method (dropdown selection)
     * - Product (autocomplete by name/code OR precise selection by ID)
     * - Customer (autocomplete by name/email OR precise selection by ID)
     *
     * Summary is only calculated if filtered results ≤ 100 for performance
     *
     * @param filters Filter criteria with pagination parameters
     * @return Paginated sales results with optional summary
     */
    PaginatedFilteredSalesWithSummary searchSalesWithSummary(SaleFilters filters);

    /**
     * Retrieves comprehensive details for a specific sale
     * Used for "View Details" button on sales page
     *
     * Includes customer info, location, payment method, all products with pricing,
     * discount calculations, and summary metrics
     *
     * @param saleId Sale ID to get details for
     * @return Complete sale details with all related information
     * @throws EntityNotFoundException if sale not found
     */
    SaleDetailedViewDTO getSaleDetailedView(Long saleId) throws EntityNotFoundException;

    // =============================================================================
    // RECORD SALE PAGE METHODS (Sale-Specific Operations)
    // =============================================================================

    /**
     * Gets all available payment methods for dropdown selection
     * Converts PaymentMethod enum values to user-friendly DTOs
     *
     * @return List of payment methods with display names
     */
    List<PaymentMethodDTO> getAvailablePaymentMethods();

    /**
     * Gets product details formatted for shopping cart with pricing
     * Applies wholesale vs retail pricing based on sale type
     *
     * This method provides detailed product info after user selects from autocomplete
     *
     * @param productId Product ID to add to cart
     * @param quantity Quantity being purchased
     * @param isWholesale Whether this is a wholesale sale (affects pricing)
     * @return Cart item with calculated pricing and totals
     * @throws EntityNotFoundException if product not found
     */
    CartItemDTO getProductForCart(Long productId, BigDecimal quantity, boolean isWholesale)
            throws EntityNotFoundException;

    /**
     * Calculates real-time pricing for shopping cart with discount handling
     *
     * Supports two discount input methods:
     * - User enters final price → calculates discount percentage
     * - User enters discount percentage → calculates final price
     *
     * Includes subtotal, packaging cost, suggested total, and item-by-item breakdown
     *
     * @param request Pricing calculation request with products and discount input
     * @return Complete pricing breakdown with all calculations
     * @throws EntityNotFoundException if any product not found
     */
    PriceCalculationResponseDTO calculateCartPricing(PriceCalculationRequestDTO request)
            throws EntityNotFoundException;
}