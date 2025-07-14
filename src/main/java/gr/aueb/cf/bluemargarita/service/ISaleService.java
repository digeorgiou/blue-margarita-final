package gr.aueb.cf.bluemargarita.service;

import gr.aueb.cf.bluemargarita.core.exceptions.EntityNotFoundException;
import gr.aueb.cf.bluemargarita.core.exceptions.EntityInvalidArgumentException;
import gr.aueb.cf.bluemargarita.core.filters.SaleFilters;
import gr.aueb.cf.bluemargarita.dto.customer.CustomerSearchResultDTO;
import gr.aueb.cf.bluemargarita.dto.location.LocationForDropdownDTO;
import gr.aueb.cf.bluemargarita.dto.price_calculation.PriceCalculationRequestDTO;
import gr.aueb.cf.bluemargarita.dto.price_calculation.PriceCalculationResponseDTO;
import gr.aueb.cf.bluemargarita.dto.product.ProductSearchResultDTO;
import gr.aueb.cf.bluemargarita.dto.sale.*;
import gr.aueb.cf.bluemargarita.dto.shopping_cart.CartItemDTO;

import java.math.BigDecimal;
import java.util.List;

/**
 * Service interface for managing sales in the jewelry business application.
 * Handles sales CRUD operations, pricing calculations with discounts, and sales support functionality.
 *
 * Key Features:
 * - Sale-level discount system where users set final total price or discount percentage
 * - Automatic proportional discount distribution across products
 * - Historical price preservation for audit and analytics
 * - Support for walk-in customers (no customer required)
 * - Search functionality for record-sale page
 * - Real-time pricing calculations for shopping cart
 */
public interface ISaleService {

    // =============================================================================
    // CORE CRUD OPERATIONS
    // =============================================================================

    /**
     * Creates a new sale with automatic discount calculation and pricing.
     *
     * Business Logic:
     * 1. Validates all referenced entities (location, customer, products, user)
     * 2. Calculates suggested total from product retail/wholesale prices
     * 3. Applies proportional discount based on user's final price
     * 4. Updates customer's first sale date if applicable
     * 5. Preserves actual selling prices at time of sale for historical accuracy
     *
     * @param request Sale creation data including products, pricing, and metadata
     * @return Created sale with calculated pricing and complete item details
     * @throws EntityNotFoundException if location, customer, products, or user not found
     */
    SaleDetailedViewDTO recordSale(RecordSaleRequestDTO request)
            throws EntityNotFoundException;

    /**
     * Updates an existing sale's basic information with automatic pricing recalculation.
     * Note: This method recalculates all pricing when final price is changed.
     * For product changes (add/remove/quantity), use dedicated product management methods.
     *
     * @param dto Sale update data including modified fields
     * @return Updated sale with recalculated pricing as DTO
     * @throws EntityNotFoundException if sale, customer, location, or user not found
     */
    SaleReadOnlyDTO updateSale(SaleUpdateDTO dto)
            throws EntityNotFoundException;

    /**
     * Deletes a sale by ID.
     *
     * Warning: This is a hard delete that removes all sale data and associated sale products.
     * Consider implementing soft delete for audit trail preservation.
     *
     * @param saleId Sale ID to delete
     * @throws EntityNotFoundException if sale not found
     */
    void deleteSale(Long saleId) throws EntityNotFoundException;

    // =============================================================================
    // RECORD SALE PAGE SEARCH OPERATIONS
    // =============================================================================

    /**
     * Searches products by name or code for sale creation interface.
     *
     * Returns products matching the search term in either name or code fields.
     * Results are limited to active products only and capped at 20 items for performance.
     *
     * @param searchTerm Search term to match against product name or code (case-insensitive)
     * @return List of matching products with pricing information (max 20 results)
     */
    List<ProductSearchResultDTO> searchProductsForSale(String searchTerm);

    /**
     * Searches customers by name, email, or phone for sale creation interface.
     *
     * Returns customers matching the search term in firstname, lastname, email, or phone fields.
     * Results are limited to active customers only and capped at 20 items for performance.
     *
     * @param searchTerm Search term to match against customer fields (case-insensitive)
     * @return List of matching customers with contact information (max 20 results)
     */
    List<CustomerSearchResultDTO> searchCustomersForSale(String searchTerm);

    /**
     * Retrieves all active locations for dropdown selection in sale creation.
     *
     * Returns only active locations that can be used for new sales.
     *
     * @return List of all active locations for dropdown display
     */
    List<LocationForDropdownDTO> getActiveLocationsForSale();

    // =============================================================================
    // SHOPPING CART AND PRICING OPERATIONS
    // =============================================================================

    /**
     * Gets product details formatted for shopping cart display.
     *
     * Calculates total price based on quantity and sale type (retail/wholesale).
     * Used when adding products to the shopping cart interface.
     *
     * @param productId Product ID to add to cart
     * @param quantity Quantity of product
     * @param isWholesale true for wholesale pricing, false for retail pricing
     * @return Cart item with calculated pricing
     * @throws EntityNotFoundException if product not found
     */
    CartItemDTO getProductForCart(Long productId, BigDecimal quantity, boolean isWholesale)
            throws EntityNotFoundException;

    /**
     * Calculates comprehensive pricing for shopping cart items.
     *
     * Supports two input modes:
     * 1. User enters final price → calculates discount percentage
     * 2. User enters discount percentage → calculates final price
     * 3. No user input → uses suggested total (no discount)
     *
     * Handles both retail and wholesale pricing based on sale type.
     *
     * @param request Pricing calculation request with items and user input
     * @return Complete pricing breakdown including subtotal, packaging, discounts
     * @throws EntityNotFoundException if any products not found
     */
    PriceCalculationResponseDTO calculateCartPricing(PriceCalculationRequestDTO request)
            throws EntityNotFoundException;


    PaginatedFilteredSalesWithSummary searchSalesWithSummary(SaleFilters filters);

    SaleDetailedViewDTO getSaleDetailedView(Long saleId) throws EntityNotFoundException;
}