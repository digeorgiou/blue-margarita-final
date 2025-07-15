package gr.aueb.cf.bluemargarita.service;

import gr.aueb.cf.bluemargarita.core.exceptions.EntityAlreadyExistsException;
import gr.aueb.cf.bluemargarita.core.exceptions.EntityNotFoundException;
import gr.aueb.cf.bluemargarita.core.filters.Paginated;
import gr.aueb.cf.bluemargarita.core.filters.ProductFilters;
import gr.aueb.cf.bluemargarita.dto.product.*;
import gr.aueb.cf.bluemargarita.dto.sale.MonthlySalesDataDTO;
import gr.aueb.cf.bluemargarita.dto.sale.WeeklySalesDataDTO;
import gr.aueb.cf.bluemargarita.dto.sale.YearlySalesDataDTO;

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
     * @param filters Filter criteria (low stock filter is automatically applied)
     * @return Paginated result of low stock products
     */
    Paginated<ProductListItemDTO> getLowStockProductsPaginated(ProductFilters filters);

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

    // =============================================================================
    // STOCK MANAGEMENT
    // =============================================================================

    /**
     * Decreases product stock when a sale is recorded
     * Used by sales system
     *
     * @param productId Product ID
     * @param quantity Quantity to reduce from stock
     * @throws EntityNotFoundException if product not found
     */
    void reduceProductStock(Long productId, BigDecimal quantity)
            throws EntityNotFoundException;

    /**
     * Increases product stock when a sale is cancelled/deleted
     * Used by sales system
     *
     * @param productId Product ID
     * @param quantity Quantity to add back to stock
     * @throws EntityNotFoundException if product not found
     */
    void increaseProductStock(Long productId, BigDecimal quantity)
            throws EntityNotFoundException;

    /**
     * Adjusts stock when sale quantities are updated
     * Used by sales system
     *
     * @param productId Product ID
     * @param oldQuantity Previous quantity sold
     * @param newQuantity New quantity sold
     */
    void adjustProductStock(Long productId, BigDecimal oldQuantity, BigDecimal newQuantity)
            throws EntityNotFoundException;

    /**
     * Updates the stock quantity for a product manually
     * Used by inventory management
     *
     * @param productId Product ID to update
     * @param newStock New stock quantity
     * @param updaterUserId User performing the update
     * @return Updated product with new stock level
     * @throws EntityNotFoundException if product or user not found
     */
    ProductListItemDTO updateProductStock(Long productId, Integer newStock, Long updaterUserId)
            throws EntityNotFoundException;



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