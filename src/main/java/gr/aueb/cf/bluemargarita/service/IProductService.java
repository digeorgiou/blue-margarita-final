package gr.aueb.cf.bluemargarita.service;

import gr.aueb.cf.bluemargarita.core.exceptions.EntityAlreadyExistsException;
import gr.aueb.cf.bluemargarita.core.exceptions.EntityInvalidArgumentException;
import gr.aueb.cf.bluemargarita.core.exceptions.EntityNotFoundException;
import gr.aueb.cf.bluemargarita.core.filters.Paginated;
import gr.aueb.cf.bluemargarita.core.filters.ProductFilters;
import gr.aueb.cf.bluemargarita.dto.product.*;
import gr.aueb.cf.bluemargarita.model.Product;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

/**
 * Service interface for managing products in the jewelry business application.
 * Handles product CRUD operations, pricing calculations, material/procedure relationships,
 * and sales analytics for individual products.
 */
public interface IProductService {

    // =============================================================================
    // CORE CRUD OPERATIONS
    // =============================================================================

    /**
     * Creates a new product with automatic pricing calculation and optional materials/procedures
     *
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
    // ENHANCED PRODUCT VIEWS
    // =============================================================================

    /**
     * Retrieves products for the main products page with enhanced business information
     * Includes calculated costs, pricing differences, stock status
     *
     * @param filters Filter criteria for products
     * @return List of products with enhanced business data
     */
    List<ProductListItemDTO> getProductListItems(ProductFilters filters);

    /**
     * Retrieves products with pagination for the main products page
     *
     * @param filters Filter criteria including pagination parameters
     * @return Paginated list of products with enhanced business data
     */
    Paginated<ProductListItemDTO> getProductListItemsPaginated(ProductFilters filters);

    /**
     * Retrieves comprehensive product details including materials, procedures, and cost breakdown
     * Used for "View Details" modal/page
     *
     * @param productId Product ID to get details for
     * @return Complete product details with relationships and calculations
     * @throws EntityNotFoundException if product not found
     */
    ProductDetailsDTO getProductDetails(Long productId) throws EntityNotFoundException;

    // =============================================================================
    // SALES ANALYTICS
    // =============================================================================

    /**
     * Retrieves comprehensive sales analytics for a specific product
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
     * Retrieves daily sales breakdown for a product
     * Used for daily sales charts and trend analysis
     *
     * @param productId Product ID to analyze
     * @param startDate Period start date (inclusive)
     * @param endDate Period end date (inclusive)
     * @return Daily sales data for the period
     * @throws EntityNotFoundException if product not found
     */
    List<DailySalesDataDTO> getProductDailySales(Long productId,
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
    // STOCK MANAGEMENT AND LOW STOCK ALERTS
    // =============================================================================

    /**
     * Decreases product stock when a sale is recorded
     * @param productId Product ID
     * @param quantity Quantity to reduce from stock
     * @throws EntityNotFoundException if product not found
     */
    void reduceProductStock(Long productId, BigDecimal quantity)
            throws EntityNotFoundException;

    /**
     * Increases product stock when a sale is cancelled/deleted
     * @param productId Product ID
     * @param quantity Quantity to add back to stock
     * @throws EntityNotFoundException if product not found
     */
    void increaseProductStock(Long productId, BigDecimal quantity)
            throws EntityNotFoundException;

    /**
     * Adjusts stock when sale quantities are updated
     * @param productId Product ID
     * @param oldQuantity Previous quantity sold
     * @param newQuantity New quantity sold
     */
    void adjustProductStock(Long productId, BigDecimal oldQuantity, BigDecimal newQuantity)
            throws EntityNotFoundException;


    /**
     * Retrieves all products with stock below their low stock alert threshold
     * Used for inventory management and stock alerts
     *
     * @return List of products needing restocking
     */
    List<ProductListItemDTO> getLowStockProducts();

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
     *
     * @param filters Filter criteria (low stock filter is automatically applied)
     * @return Paginated result of low stock products
     */
    Paginated<ProductListItemDTO> getLowStockProductsPaginated(ProductFilters filters);

    /**
     * Gets products with negative stock with limit (for dashboard)
     */
    List<ProductListItemDTO> getNegativeStockProducts(int limit);

    Paginated<ProductListItemDTO> getNegativeStockProductsPaginated();

    /**
     * Updates the stock quantity for a product
     *
     * @param productId Product ID to update
     * @param newStock New stock quantity
     * @param updaterUserId User performing the update
     * @return Updated product with new stock level
     * @throws EntityNotFoundException if product or user not found
     */
    ProductListItemDTO updateProductStock(Long productId, Integer newStock, Long updaterUserId)
            throws EntityNotFoundException;

    /**
     * Gets the total count of active products (for dashboard statistics)
     *
     * @return Number of active products
     */
    int getActiveProductCount();

    // =============================================================================
    // PRICING CALCULATIONS AND COST ANALYSIS
    // =============================================================================

    /**
     * Calculates suggested retail selling price based on current costs and markup
     * Formula: (Material Cost + Labor Cost) × Retail Markup Factor
     *
     * @param product Product entity to calculate price for
     * @return Calculated suggested retail price
     */
    BigDecimal calculateSuggestedRetailPrice(Product product);

    /**
     * Calculates suggested wholesale selling price based on current costs and markup
     * Formula: (Material Cost + Labor Cost) × Wholesale Markup Factor
     *
     * @param product Product entity to calculate price for
     * @return Calculated suggested wholesale price
     */
    BigDecimal calculateSuggestedWholesalePrice(Product product);

    /**
     * Provides comprehensive cost breakdown and pricing analysis for a product
     * Includes material costs, labor costs, markup factors, profit margins, and price comparisons
     * Used for cost analysis modal/page
     *
     * @param productId Product ID to analyze
     * @return Detailed cost breakdown with all pricing metrics
     * @throws EntityNotFoundException if product not found
     */
    ProductCostBreakdownDTO getProductCostBreakdown(Long productId) throws EntityNotFoundException;

    // =============================================================================
    // MATERIAL RELATIONSHIP MANAGEMENT
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

    // =============================================================================
    // PROCEDURE RELATIONSHIP MANAGEMENT
    // =============================================================================

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
    // BULK OPERATIONS
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