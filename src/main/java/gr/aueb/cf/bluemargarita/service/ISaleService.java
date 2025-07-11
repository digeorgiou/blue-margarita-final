package gr.aueb.cf.bluemargarita.service;

import gr.aueb.cf.bluemargarita.core.exceptions.EntityNotFoundException;
import gr.aueb.cf.bluemargarita.core.filters.Paginated;
import gr.aueb.cf.bluemargarita.core.filters.SaleFilters;
import gr.aueb.cf.bluemargarita.dto.sale.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

/**
 * Service interface for managing sales in the jewelry business application.
 * Handles sales CRUD operations, pricing calculations with discounts, and sales analytics.
 *
 * Key Features:
 * - Sale-level discount system where users set final total price
 * - Automatic proportional discount distribution across products
 * - Historical price preservation for audit and analytics
 * - Support for walk-in customers (no customer required)
 */
public interface ISaleService {

    // =============================================================================
    // CORE CRUD OPERATIONS
    // =============================================================================

    /**
     * Creates a new sale with automatic discount calculation and pricing
     *
     * Business Logic:
     * 1. Validates all referenced entities (location, customer, products, user)
     * 2. Calculates suggested total from product retail prices
     * 3. Applies proportional discount based on user's final price
     * 4. Updates customer's first sale date if applicable
     *
     * @param dto Sale creation data including products and final price
     * @return Created sale with calculated pricing as DTO
     * @throws EntityNotFoundExcepton if location, customer, products, or user not found
     * @throws ValidationException if business rules violated (e.g., negative quantities)
     */
    SaleReadOnlyDTO createSale(SaleInsertDTO dto)
            throws EntityNotFoundException, ValidationException;

    /**
     * Updates an existing sale's basic information
     * Note: For product changes, use dedicated product management methods
     *
     * @param dto Sale update data
     * @return Updated sale as DTO
     * @throws EntityNotFoundException if sale, customer, location, or user not found
     * @throws ValidationException if business rules violated
     */
    SaleReadOnlyDTO updateSale(SaleUpdateDTO dto)
            throws EntityNotFoundException, ValidationException;

    /**
     * Deletes a sale. Always performs soft delete to preserve sales history
     * for financial reporting and analytics
     *
     * @param id Sale ID to delete
     * @param deletedByUserId User performing the deletion
     * @throws EntityNotFoundException if sale or user not found
     */
    void deleteSale(Long id, Long deletedByUserId) throws EntityNotFoundException;

    /**
     * Retrieves a sale by ID with complete information
     *
     * @param id Sale ID
     * @return Sale with all products and pricing details
     * @throws EntityNotFoundException if sale not found
     */
    SaleReadOnlyDTO getSaleById(Long id) throws EntityNotFoundException;

    // =============================================================================
    // PRICING AND DISCOUNT MANAGEMENT
    // =============================================================================

    /**
     * Updates the final total price for a sale, automatically recalculating
     * discount percentage and individual product prices proportionally
     *
     * Business Logic:
     * 1. Recalculates discount percentage: (suggested - final) / suggested * 100
     * 2. Applies discount proportionally to all products
     * 3. Updates priceAtTheTime for each SaleProduct
     *
     * @param saleId Sale to update
     * @param newFinalPrice New final total price set by user
     * @param updaterUserId User making the change
     * @return Updated sale with new pricing
     * @throws EntityNotFoundException if sale or user not found
     */
    SaleReadOnlyDTO updateSaleFinalPrice(Long saleId, BigDecimal newFinalPrice, Long updaterUserId)
            throws EntityNotFoundException;

    /**
     * Gets detailed discount analysis for a sale showing how discount
     * was distributed across products
     *
     * @param saleId Sale ID to analyze
     * @return Discount breakdown by product
     * @throws EntityNotFoundException if sale not found
     */
    SaleDiscountAnalysisDTO getSaleDiscountAnalysis(Long saleId) throws EntityNotFoundException;

    // =============================================================================
    // PRODUCT MANAGEMENT WITHIN SALES
    // =============================================================================

    /**
     * Adds a product to an existing sale with automatic pricing recalculation
     *
     * Business Logic:
     * 1. Adds product using Sale.addProduct() method
     * 2. Recalculates suggested total price
     * 3. Maintains existing discount percentage
     * 4. Updates all product prices proportionally
     *
     * @param saleId Sale to modify
     * @param productId Product to add
     * @param quantity Quantity to add
     * @param updaterUserId User making the change
     * @return Updated sale with new product
     * @throws EntityNotFoundException if sale, product, or user not found
     */
    SaleReadOnlyDTO addProductToSale(Long saleId, Long productId, BigDecimal quantity, Long updaterUserId)
            throws EntityNotFoundException;

    /**
     * Removes a product from a sale with automatic pricing recalculation
     *
     * @param saleId Sale to modify
     * @param productId Product to remove
     * @param updaterUserId User making the change
     * @return Updated sale without the product
     * @throws EntityNotFoundException if sale, product, or user not found
     */
    SaleReadOnlyDTO removeProductFromSale(Long saleId, Long productId, Long updaterUserId)
            throws EntityNotFoundException;

    /**
     * Updates the quantity of a specific product in a sale
     *
     * @param saleId Sale to modify
     * @param productId Product to update
     * @param newQuantity New quantity
     * @param updaterUserId User making the change
     * @return Updated sale with new quantity
     * @throws EntityNotFoundException if sale, product, or user not found
     */
    SaleReadOnlyDTO updateProductQuantityInSale(Long saleId, Long productId, BigDecimal newQuantity, Long updaterUserId)
            throws EntityNotFoundException;

    // =============================================================================
    // QUERY AND FILTERING OPERATIONS
    // =============================================================================

    /**
     * Retrieves sales with filtering and pagination support
     *
     * @param filters Filter criteria including date ranges, customer, location, etc.
     * @return Paginated list of sales matching criteria
     */
    Paginated<SaleReadOnlyDTO> getSalesFilteredPaginated(SaleFilters filters);

    /**
     * Retrieves all sales for a specific customer
     *
     * @param customerId Customer ID
     * @return List of customer's sales ordered by date descending
     * @throws EntityNotFoundException if customer not found
     */
    List<SaleReadOnlyDTO> getSalesByCustomer(Long customerId) throws EntityNotFoundException;

    /**
     * Retrieves sales for a specific location within date range
     *
     * @param locationId Location ID
     * @param startDate Start date (inclusive)
     * @param endDate End date (inclusive)
     * @return List of location's sales in date range
     * @throws EntityNotFoundException if location not found
     */
    List<SaleReadOnlyDTO> getSalesByLocationAndDateRange(Long locationId, LocalDate startDate, LocalDate endDate)
            throws EntityNotFoundException;

    /**
     * Retrieves recent sales for dashboard display
     *
     * @param limit Maximum number of sales to return
     * @return List of most recent sales
     */
    List<SaleReadOnlyDTO> getRecentSales(int limit);

    // =============================================================================
    // ANALYTICS AND REPORTING
    // =============================================================================

    /**
     * Calculates total revenue for a date range across all locations
     *
     * @param startDate Start date (inclusive)
     * @param endDate End date (inclusive)
     * @return Total revenue in the period
     */
    BigDecimal getTotalRevenueByDateRange(LocalDate startDate, LocalDate endDate);

    /**
     * Calculates total revenue for a specific location in date range
     *
     * @param locationId Location ID
     * @param startDate Start date (inclusive)
     * @param endDate End date (inclusive)
     * @return Location's revenue in the period
     * @throws EntityNotFoundException if location not found
     */
    BigDecimal getLocationRevenueByDateRange(Long locationId, LocalDate startDate, LocalDate endDate)
            throws EntityNotFoundException;

    /**
     * Gets count of sales in a date range
     *
     * @param startDate Start date (inclusive)
     * @param endDate End date (inclusive)
     * @return Number of sales in the period
     */
    int getSalesCountByDateRange(LocalDate startDate, LocalDate endDate);

    /**
     * Calculates average order value for a date range
     *
     * @param startDate Start date (inclusive)
     * @param endDate End date (inclusive)
     * @return Average sale value in the period
     */
    BigDecimal getAverageOrderValueByDateRange(LocalDate startDate, LocalDate endDate);

    /**
     * Gets sales statistics for a specific date (for dashboard)
     *
     * @param date Date to analyze
     * @return Daily sales statistics
     */
    DailySalesStatsDTO getDailySalesStats(LocalDate date);

    /**
     * Gets top performing locations by revenue in date range
     *
     * @param startDate Start date (inclusive)
     * @param endDate End date (inclusive)
     * @param limit Maximum number of locations to return
     * @return List of top locations by revenue
     */
    List<LocationPerformanceDTO> getTopLocationsByRevenue(LocalDate startDate, LocalDate endDate, int limit);

    /**
     * Gets sales performance comparison between two periods
     *
     * @param currentStart Current period start date
     * @param currentEnd Current period end date
     * @param previousStart Previous period start date
     * @param previousEnd Previous period end date
     * @return Performance comparison metrics
     */
    SalesComparisonDTO getSalesComparison(LocalDate currentStart, LocalDate currentEnd,
                                          LocalDate previousStart, LocalDate previousEnd);

    // =============================================================================
    // VALIDATION AND UTILITY OPERATIONS
    // =============================================================================

    /**
     * Validates if a sale can be modified (e.g., not from previous financial periods)
     *
     * @param saleId Sale to check
     * @return true if sale can be modified
     * @throws EntityNotFoundException if sale not found
     */
    boolean canModifySale(Long saleId) throws EntityNotFoundException;

    /**
     * Recalculates pricing for an existing sale (useful after product price changes)
     *
     * @param saleId Sale to recalculate
     * @param updaterUserId User performing the recalculation
     * @return Updated sale with recalculated pricing
     * @throws EntityNotFoundException if sale or user not found
     */
    SaleReadOnlyDTO recalculateSalePricing(Long saleId, Long updaterUserId) throws EntityNotFoundException;

    // =============================================================================
    // SUPPORTING DTOs DEFINITIONS
    // =============================================================================

    /**
     * Daily sales statistics for dashboard
     */
    record DailySalesStatsDTO(
            LocalDate date,
            BigDecimal totalRevenue,
            int salesCount,
            BigDecimal averageOrderValue,
            BigDecimal totalDiscount,
            int uniqueCustomers
    ) {}

    /**
     * Location performance metrics
     */
    record LocationPerformanceDTO(
            Long locationId,
            String locationName,
            BigDecimal revenue,
            int salesCount,
            BigDecimal averageOrderValue
    ) {}

    /**
     * Sales period comparison metrics
     */
    record SalesComparisonDTO(
            BigDecimal currentRevenue,
            BigDecimal previousRevenue,
            BigDecimal revenueGrowthPercentage,
            int currentSalesCount,
            int previousSalesCount,
            BigDecimal salesGrowthPercentage,
            BigDecimal currentAverageOrderValue,
            BigDecimal previousAverageOrderValue,
            BigDecimal aovGrowthPercentage
    ) {}
}