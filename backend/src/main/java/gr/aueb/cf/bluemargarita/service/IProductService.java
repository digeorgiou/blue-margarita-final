package gr.aueb.cf.bluemargarita.service;

import gr.aueb.cf.bluemargarita.core.exceptions.EntityAlreadyExistsException;
import gr.aueb.cf.bluemargarita.core.exceptions.EntityInvalidArgumentException;
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
     * 1. Validates unique name and productCode constraints
     * 2. Validates category exists and is active
     * 3. Creates product with relationships
     * 4. Calculates suggested prices based on materials, procedures, and markup factors
     * 5. Sets audit fields
     *
     * @param dto Product creation data including optional materials and procedures
     * @return Created product as enhanced list item DTO
     * @throws EntityAlreadyExistsException if product name or productCode already exists
     * @throws EntityNotFoundException if referenced entities (category, user, materials, procedures) not found
     */
    ProductListItemDTO createProduct(ProductInsertDTO dto)
            throws EntityAlreadyExistsException, EntityNotFoundException;

    /**
     * Updates an existing product's basic information with pricing recalculation
     *
     * @param dto Product update data
     * @return Updated product as enhanced list item DTO
     * @throws EntityAlreadyExistsException if new name or productCode conflicts with existing product
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
     * Retrieves active products matching search term
     * with limited info needed for autocomplete in record sale page
     * @param searchTerm matches with name or productCode
     * @return List of products with basic info
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

    // =============================================================================
    // DASHBOARD PAGE METHODS
    // =============================================================================


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
     * @return Updated product with new material relationship
     * @throws EntityNotFoundException if product, material, or user not found
     */
    ProductListItemDTO addMaterialToProduct(Long productId, Long materialId,
                                            BigDecimal quantity)
            throws EntityNotFoundException , EntityInvalidArgumentException;

    /**
     * Removes a material from a product
     * Automatically recalculates suggested prices after the change
     *
     * @param productId Product ID
     * @param materialId Material ID to remove
     * @return Updated product without the material relationship
     * @throws EntityNotFoundException if product, material, or user not found
     */
    ProductListItemDTO removeMaterialFromProduct(Long productId, Long materialId)
            throws EntityNotFoundException;

    /**
     * Adds a procedure to a product or updates the cost if already exists
     * Automatically recalculates suggested prices after the change
     *
     * @param productId Product ID
     * @param procedureId Procedure ID to add
     * @param cost Cost of the procedure for this specific product
     * @return Updated product with new procedure relationship
     * @throws EntityNotFoundException if product, procedure, or user not found
     */
    ProductListItemDTO addProcedureToProduct(Long productId, Long procedureId,
                                             BigDecimal cost)
            throws EntityNotFoundException , EntityInvalidArgumentException;

    /**
     * Removes a procedure from a product
     * Automatically recalculates suggested prices after the change
     *
     * @param productId Product ID
     * @param procedureId Procedure ID to remove
     * @return Updated product without the procedure relationship
     * @throws EntityNotFoundException if product, procedure, or user not found
     */
    ProductListItemDTO removeProcedureFromProduct(Long productId, Long procedureId)
            throws EntityNotFoundException;

    // =============================================================================
    // BULK OPERATIONS AND PRICING
    // =============================================================================

    /**
     * Recalculates suggested prices for all active products based on current material costs and markup factors
     * Used when material costs change or markup factors are updated
     * This is a bulk administrative operation that can affect many products
     *
     * @return Results of the recalculation operation including success/failure counts and failed product codes
     * @throws EntityNotFoundException if updater user not found
     */
    PriceRecalculationResultDTO recalculateAllProductPrices() throws EntityNotFoundException;

    ProductListItemDTO updateFinalRetailPrice(Long productId, BigDecimal newPrice) throws EntityNotFoundException;
    ProductListItemDTO updateFinalWholesalePrice(Long productId, BigDecimal newPrice) throws EntityNotFoundException;

    /**
     * Retrieves products where final selling prices are significantly different from suggested prices
     * Used in dashboard to identify products that may need price adjustments after cost changes

     * This method is particularly useful after running recalculateAllProductPrices() to identify
     * products where the current selling prices are too low/high compared to updated suggested prices
     *
     * @param thresholdPercentage Minimum percentage difference to be considered significant (e.g., 20.0 for 20%)
     * @param limit Maximum number of products to return (typically 5-10 for dashboard)
     * @return List of products with significant price differences, ordered by severity (highest difference first)
     */
    List<MispricedProductAlertDTO> getMispricedProductsAlert(BigDecimal thresholdPercentage, int limit);


    /**
     * Retrieves all mispriced products with pagination and filtering
     * Used for "View All Mispriced Products" functionality from dashboard
     *
     * @param thresholdPercentage Minimum percentage difference to be considered significant
     * @param nameOrCode filtering by name or code
     * @param categoryId filtering by category
     * @param issueType filtering by issue type
     * @param pageable Pagination and sorting parameters
     * @return Paginated list of mispriced products with filtering support
     */
    Paginated<MispricedProductAlertDTO> getAllMispricedProductsPaginated(
            BigDecimal thresholdPercentage,
            String nameOrCode,
            Long categoryId,
            String issueType,
            Pageable pageable
    );
}