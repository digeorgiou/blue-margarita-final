package gr.aueb.cf.bluemargarita.service;

import gr.aueb.cf.bluemargarita.core.exceptions.EntityAlreadyExistsException;
import gr.aueb.cf.bluemargarita.core.exceptions.EntityNotFoundException;
import gr.aueb.cf.bluemargarita.core.filters.Paginated;
import gr.aueb.cf.bluemargarita.core.filters.ProductFilters;
import gr.aueb.cf.bluemargarita.dto.customer.CustomerSalesDataDTO;
import gr.aueb.cf.bluemargarita.dto.product.*;
import gr.aueb.cf.bluemargarita.dto.sale.MonthlySalesDataDTO;
import gr.aueb.cf.bluemargarita.dto.sale.WeeklySalesDataDTO;
import gr.aueb.cf.bluemargarita.dto.sale.YearlySalesDataDTO;
import gr.aueb.cf.bluemargarita.dto.stock.BulkStockUpdateDTO;
import gr.aueb.cf.bluemargarita.dto.stock.StockManagementDTO;
import gr.aueb.cf.bluemargarita.dto.stock.StockUpdateDTO;
import gr.aueb.cf.bluemargarita.dto.stock.StockUpdateResultDTO;
import org.springframework.data.domain.Pageable;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

/**
 * Service interface for managing products in the jewelry business application.
 * Handles product CRUD operations, pricing calculations, material/procedure relationships,
 * stock management, and sales analytics for individual products.
 */
public interface IProductService {

    // =============================================================================
    // CORE CRUD OPERATIONS
    // =============================================================================

    /**
     * Creates a new product with automatic pricing calculation and optional materials/procedures
     * Business Logic:
     * 1. Validates unique name and code constraints
     * 2. Validates category exists and is active
     * 3. Creates product with relationships
     * 4. Calculates suggested prices based on materials, procedures, and markup factors
     * 5. Sets audit fields
     *
     * @param dto Product creation data including optional materials and procedures
     * @return Created product as enhanced list item DTO
     * @throws EntityAlreadyExistsException if product name or code already exists
     * @throws EntityNotFoundException if referenced entities (category, user, materials, procedures) not found
     */
    ProductListItemDTO createProduct(ProductInsertDTO dto)
            throws EntityAlreadyExistsException, EntityNotFoundException;

    /**
     * Updates an existing product's basic information with pricing recalculation
     *
     * @param dto Product update data
     * @return Updated product as enhanced list item DTO
     * @throws EntityAlreadyExistsException if new name or code conflicts with existing product
     * @throws EntityNotFoundException if product or referenced entities not found
     */
    ProductListItemDTO updateProduct(ProductUpdateDTO dto)
            throws EntityAlreadyExistsException, EntityNotFoundException;

    /**
     * Deletes a product with intelligent delete strategy
     * Performs soft delete if product has sales history (preserves financial records)
     * Performs hard delete if product has no sales (completely removes)
     *
     * @param id Product ID to delete
     * @throws EntityNotFoundException if product not found
     */
    void deleteProduct(Long id) throws EntityNotFoundException;

    // =============================================================================
    // PRODUCT LISTING AND FILTERING (View Products Page)
    // =============================================================================

    /**
     * Retrieves products with pagination for the main products page
     * Includes calculated costs, pricing differences, stock status, and filtering capabilities
     *
     * @param filters Filter criteria including pagination parameters, search terms, categories, materials, procedures
     * @return Paginated list of products with enhanced business data
     */
    Paginated<ProductListItemDTO> getProductListItemsPaginated(ProductFilters filters);

    /**
     * Retrieves comprehensive product details including materials, procedures, and cost breakdown
     * Used for "View Details" button on products page
     *
     * @param productId Product ID to get details for
     * @return Complete product details with relationships and calculations
     * @throws EntityNotFoundException if product not found
     */
    ProductDetailedViewDTO getProductDetails(Long productId) throws EntityNotFoundException;

    /**
     * Gets the total count of active products (for dashboard statistics)
     *
     * @return Number of active products
     */
    int getActiveProductCount();

    /**
     * Retrieves active products matching search term
     * with limited info needed for autocomplete in record sale page
     * @param searchTerm matches with name or code
     * @return
     */
    List<ProductSearchResultDTO> searchProductsForAutocomplete(String searchTerm);

    // =============================================================================
    // SALES ANALYTICS (Sales Data Buttons)
    // =============================================================================

    /**
     * Retrieves comprehensive sales analytics for a specific product
     * Used for "Sales Analytics" button on products page
     * Includes trends, comparisons, top customers/locations, and period analysis
     *
     * @param productId Product ID to analyze
     * @param startDate Analysis period start date (inclusive)
     * @param endDate Analysis period end date (inclusive)
     * @return Complete sales analytics with trends and comparisons
     * @throws EntityNotFoundException if product not found
     */
    ProductSalesAnalyticsDTO getProductSalesAnalytics(Long productId,
                                                      LocalDate startDate,
                                                      LocalDate endDate)
            throws EntityNotFoundException;

    /**
     * Retrieves weekly sales breakdown for a product
     * Used for weekly sales charts and medium-term trend analysis
     *
     * @param productId Product ID to analyze
     * @param startDate Period start date (inclusive)
     * @param endDate Period end date (inclusive)
     * @return Weekly sales data for the period
     * @throws EntityNotFoundException if product not found
     */
    List<WeeklySalesDataDTO> getProductWeeklySales(Long productId,
                                                   LocalDate startDate,
                                                   LocalDate endDate)
            throws EntityNotFoundException;

    /**
     * Retrieves monthly sales breakdown for a product
     * Used for monthly sales charts and long-term trend analysis
     *
     * @param productId Product ID to analyze
     * @param startDate Period start date (inclusive)
     * @param endDate Period end date (inclusive)
     * @return Monthly sales data for the period
     * @throws EntityNotFoundException if product not found
     */
    List<MonthlySalesDataDTO> getProductMonthlySales(Long productId,
                                                     LocalDate startDate,
                                                     LocalDate endDate)
            throws EntityNotFoundException;

    /**
     * Retrieves yearly sales breakdown for a product
     * Used for yearly sales charts and very long-term trend analysis
     *
     * @param productId Product ID to analyze
     * @param startDate Period start date (inclusive)
     * @param endDate Period end date (inclusive)
     * @return Yearly sales data for the period
     * @throws EntityNotFoundException if product not found
     */
    List<YearlySalesDataDTO> getProductYearlySales(Long productId,
                                                   LocalDate startDate,
                                                   LocalDate endDate)
            throws EntityNotFoundException;

    /**
     * Retrieves top performing locations for a specific product
     * Ordered by revenue descending
     *
     * @param productId Product ID to analyze
     * @param startDate Period start date (inclusive)
     * @param endDate Period end date (inclusive)
     * @param limit Maximum number of locations to return
     * @return Top locations by revenue for this product
     * @throws EntityNotFoundException if product not found
     */
    List<LocationSalesDataDTO> getTopLocationsByProductSales(Long productId,
                                                             LocalDate startDate,
                                                             LocalDate endDate,
                                                             int limit)
            throws EntityNotFoundException;

    /**
     * Retrieves top customers for a specific product by quantity purchased
     * Ordered by quantity purchased descending
     *
     * @param productId Product ID to analyze
     * @param startDate Period start date (inclusive)
     * @param endDate Period end date (inclusive)
     * @param limit Maximum number of customers to return
     * @return Top customers by quantity for this product
     * @throws EntityNotFoundException if product not found
     */
    List<CustomerSalesDataDTO> getTopCustomersByProductPurchases(Long productId,
                                                                 LocalDate startDate,
                                                                 LocalDate endDate,
                                                                 int limit)
            throws EntityNotFoundException;


    // =============================================================================
    // DASHBOARD PAGE METHODS
    // =============================================================================

    /**
     * Retrieves low stock products with a limit (for dashboard widgets)
     * Ordered by stock level ascending (most urgent first)
     *
     * @param limit Maximum number of products to return
     * @return List of low stock products up to the limit
     */
    List<ProductListItemDTO> getLowStockProducts(int limit);

    /**
     * Retrieves low stock products with pagination and additional filtering
     * Used for dedicated low stock management page
     *
     * @param pageable  Pagination and sorting parameters
     * @return Paginated list of low stock products
     */
    Paginated<ProductListItemDTO> getAllLowStockProducts(Pageable pageable);


    /**
     * Retrieves negative stock products with pagination and additional filtering
     *
     * @param pageable  Pagination and sorting parameters
     * @return Paginated list of products with negative stock
     */
    Paginated<ProductListItemDTO> getAllNegativeStockProducts(Pageable pageable);

    /**
     * Retrieves top products by revenue for dashboard
     * Shows best performing products in terms of sales revenue
     *
     * @param startDate Period start date (inclusive)
     * @param endDate Period end date (inclusive)
     * @param limit Maximum number of products to return (typically 5 for dashboard)
     * @return Top products by revenue with sales metrics
     */
    List<ProductStatsSummaryDTO> getTopProductsByMonthlyRevenue(LocalDate startDate,
                                                                LocalDate endDate,
                                                                int limit);

    /**
     * Retrieves all top products for a specific month with pagination and sorting
     * Used for "View All Products for Month" functionality from dashboard
     *
     * @param startDate Month start date
     * @param endDate Month end date
     * @param pageable Pagination and sorting parameters
     * @return Paginated list of products with sales metrics and sorting support
     */
    Paginated<ProductStatsSummaryDTO> getAllTopProductsForPeriod(LocalDate startDate,
                                                                 LocalDate endDate,
                                                                 Pageable pageable);


    // =============================================================================
    // MATERIAL/PROCEDURE RELATIONSHIP MANAGEMENT
    // =============================================================================

    /**
     * Adds a material to a product or updates the quantity if already exists
     * Automatically recalculates suggested prices after the change
     *
     * @param productId Product ID
     * @param materialId Material ID to add
     * @param quantity Quantity of material needed for this product
     * @param updaterUserId User performing the operation
     * @return Updated product with new material relationship
     * @throws EntityNotFoundException if product, material, or user not found
     */
    ProductListItemDTO addMaterialToProduct(Long productId, Long materialId,
                                            BigDecimal quantity, Long updaterUserId)
            throws EntityNotFoundException;

    /**
     * Removes a material from a product
     * Automatically recalculates suggested prices after the change
     *
     * @param productId Product ID
     * @param materialId Material ID to remove
     * @param updaterUserId User performing the operation
     * @return Updated product without the material relationship
     * @throws EntityNotFoundException if product, material, or user not found
     */
    ProductListItemDTO removeMaterialFromProduct(Long productId, Long materialId, Long updaterUserId)
            throws EntityNotFoundException;

    /**
     * Adds a procedure to a product or updates the cost if already exists
     * Automatically recalculates suggested prices after the change
     *
     * @param productId Product ID
     * @param procedureId Procedure ID to add
     * @param cost Cost of the procedure for this specific product
     * @param updaterUserId User performing the operation
     * @return Updated product with new procedure relationship
     * @throws EntityNotFoundException if product, procedure, or user not found
     */
    ProductListItemDTO addProcedureToProduct(Long productId, Long procedureId,
                                             BigDecimal cost, Long updaterUserId)
            throws EntityNotFoundException;

    /**
     * Removes a procedure from a product
     * Automatically recalculates suggested prices after the change
     *
     * @param productId Product ID
     * @param procedureId Procedure ID to remove
     * @param updaterUserId User performing the operation
     * @return Updated product without the procedure relationship
     * @throws EntityNotFoundException if product, procedure, or user not found
     */
    ProductListItemDTO removeProcedureFromProduct(Long productId, Long procedureId, Long updaterUserId)
            throws EntityNotFoundException;

    // =============================================================================
    // STOCK MANAGEMENT
    // =============================================================================

    /**
     * Retrieves products optimized for stock management operations
     *
     * Used by the dedicated stock management page to provide a lightweight,
     * focused view of products with only stock-relevant information. This method
     * returns essential data for efficient stock updates without the overhead
     * of full product details.
     * @param filters Filter criteria including pagination and stock-specific filters
     * @return Paginated list of products with stock management data
     */
    Paginated<StockManagementDTO> getProductsForStockManagement(ProductFilters filters);

    /**
     * Updates stock for a single product with comprehensive audit logging
     *
     * Supports three types of stock updates:
     * - ADD: Increase stock by specified quantity (e.g., receiving inventory)
     * - REMOVE: Decrease stock by specified quantity (e.g., damage, loss)
     * - SET: Set absolute stock value (e.g., physical inventory count)
     * @param updateDTO Stock update data including product ID, type, quantity, and reason
     * @return Result object with success status, before/after values, and any error messages
     * @throws EntityNotFoundException if product or user not found
     */
    StockUpdateResultDTO updateProductStock(StockUpdateDTO updateDTO) throws EntityNotFoundException;

    /**
     * Updates stock for multiple products in a single atomic transaction
     *
     * Performs bulk stock updates efficiently while maintaining data consistency.
     * All updates are processed in a single transaction - if any update fails,
     * the system continues with remaining updates but logs failures appropriately.

     * @param bulkUpdate Bulk update data containing list of individual updates and batch metadata
     * @return List of results for each update attempt, indicating success/failure status
     */
    List<StockUpdateResultDTO> updateMultipleProductsStock(BulkStockUpdateDTO bulkUpdate);

    /**
     * Reduces product stock when items are sold or consumed
     *
     * Used by the sales system to automatically reduce stock when products
     * are sold. This method handles stock reduction without user intervention
     * and allows negative stock (which triggers alerts elsewhere).

     * @param productId Product ID to reduce stock for
     * @param quantity Quantity to remove from stock
     * @throws EntityNotFoundException if product not found
     */
    void reduceProductStock(Long productId, BigDecimal quantity) throws EntityNotFoundException;

    /**
     * Increases product stock when items are received or returned
     *

     * @param productId Product ID to increase stock for
     * @param quantity Quantity to add to stock
     * @throws EntityNotFoundException if product not found
     */
    void increaseProductStock(Long productId, BigDecimal quantity) throws EntityNotFoundException;

    /**
     * Adjusts product stock based on changes in sale quantities
     *
     * Used when sale quantities are modified after the fact. This method
     * calculates the net stock adjustment needed and applies it to maintain
     * accurate inventory levels.

     * @param productId Product ID to adjust stock for
     * @param oldQuantity Previous quantity that was deducted
     * @param newQuantity New quantity that should be deducted
     * @throws EntityNotFoundException if product not found
     */
    void adjustProductStock(Long productId, BigDecimal oldQuantity, BigDecimal newQuantity)
            throws EntityNotFoundException;

    // =============================================================================
    // BULK OPERATIONS AND PRICING
    // =============================================================================

    /**
     * Recalculates suggested prices for all active products based on current material costs and markup factors
     * Used when material costs change or markup factors are updated
     * This is a bulk administrative operation that can affect many products
     *
     * @param updaterUserId User performing the bulk price update
     * @return Results of the recalculation operation including success/failure counts and failed product codes
     * @throws EntityNotFoundException if updater user not found
     */
    PriceRecalculationResultDTO recalculateAllProductPrices(Long updaterUserId) throws EntityNotFoundException;
}