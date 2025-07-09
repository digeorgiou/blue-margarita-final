package gr.aueb.cf.bluemargarita.service;

import gr.aueb.cf.bluemargarita.core.exceptions.EntityAlreadyExistsException;
import gr.aueb.cf.bluemargarita.core.exceptions.EntityNotFoundException;
import gr.aueb.cf.bluemargarita.core.filters.Paginated;
import gr.aueb.cf.bluemargarita.core.filters.ProductFilters;
import gr.aueb.cf.bluemargarita.dto.product.*;
import gr.aueb.cf.bluemargarita.model.Product;

import java.math.BigDecimal;
import java.util.List;

/**
 * Service interface for managing products in the jewelry business application.
 * Handles product CRUD operations, pricing calculations, and material/procedure relationships.
 */
public interface IProductService {

    // Core CRUD Operations

    /**
     * Creates a new product with optional materials and procedures
     * @param dto Product creation data
     * @return Created product as DTO
     * @throws EntityAlreadyExistsException if product name or code already exists
     * @throws EntityNotFoundException if referenced entities (category, user, materials, procedures) not found
     */
    ProductReadOnlyDTO createProduct(ProductInsertDTO dto)
            throws EntityAlreadyExistsException, EntityNotFoundException;

    /**
     * Updates an existing product's basic information
     * @param dto Product update data
     * @return Updated product as DTO
     * @throws EntityAlreadyExistsException if new name or code conflicts with existing product
     * @throws EntityNotFoundException if product or referenced entities not found
     */
    ProductReadOnlyDTO updateProduct(ProductUpdateDTO dto)
            throws EntityAlreadyExistsException, EntityNotFoundException;

    /**
     * Deletes a product. Performs soft delete if product has sales history, hard delete otherwise
     * @param id Product ID to delete
     * @throws EntityNotFoundException if product not found
     */
    void deleteProduct(Long id) throws EntityNotFoundException;

    // Query Operations

    /**
     * Retrieves products based on filter criteria
     * @param filters Filter criteria for products
     * @return List of products matching filters
     */
    List<ProductReadOnlyDTO> getFilteredProducts(ProductFilters filters);

    /**
     * Retrieves products with pagination based on filter criteria
     * @param filters Filter criteria including pagination info
     * @return Paginated result of products matching filters
     */
    Paginated<ProductReadOnlyDTO> getProductsFilteredPaginated(ProductFilters filters);

    /**
     * Retrieves products with stock below their low stock alert threshold
     * @return List of low stock products
     */
    List<ProductReadOnlyDTO> getLowStockProducts();

    /**
     * Retrieves all active products in a specific category
     * @param categoryId Category ID to filter by
     * @return List of products in the category
     */
    List<ProductReadOnlyDTO> getProductsByCategory(Long categoryId);

    /**
     * Retrieves products within a specific price range
     * @param minPrice Minimum price (inclusive)
     * @param maxPrice Maximum price (inclusive)
     * @return List of products in the price range
     */
    List<ProductReadOnlyDTO> getProductsInPriceRange(BigDecimal minPrice, BigDecimal maxPrice);

    // Stock Management

    /**
     * Updates the stock quantity for a product
     * @param productId Product ID to update
     * @param newStock New stock quantity
     * @param updaterUserId User performing the update
     * @return Updated product as DTO
     * @throws EntityNotFoundException if product or user not found
     */
    ProductReadOnlyDTO updateProductStock(Long productId, Integer newStock, Long updaterUserId)
            throws EntityNotFoundException;

    // Pricing Calculations

    /**
     * Calculates suggested retail selling price based on material costs, labor costs, and retail markup
     * @param product Product entity to calculate price for
     * @return Calculated suggested retail price
     */
    BigDecimal calculateSuggestedRetailPrice(Product product);

    /**
     * Calculates suggested wholesale selling price based on material costs, labor costs, and wholesale markup
     * @param product Product entity to calculate price for
     * @return Calculated suggested wholesale price
     */
    BigDecimal calculateSuggestedWholesalePrice(Product product);

    /**
     * Provides detailed cost breakdown and pricing analysis for a product
     * @param productId Product ID to analyze
     * @return Comprehensive cost breakdown including material costs, labor costs, profit margins, etc.
     * @throws EntityNotFoundException if product not found
     */
    ProductCostBreakdownDTO getProductCostBreakdown(Long productId) throws EntityNotFoundException;

    // Material Relationship Management

    /**
     * Adds a material to a product or updates the quantity if already exists
     * @param productId Product ID
     * @param materialId Material ID to add
     * @param quantity Quantity of material needed
     * @param updaterUserId User performing the operation
     * @return Updated product as DTO
     * @throws EntityNotFoundException if product, material, or user not found
     */
    ProductReadOnlyDTO addMaterialToProduct(Long productId, Long materialId,
                                            BigDecimal quantity, Long updaterUserId)
            throws EntityNotFoundException;

    /**
     * Removes a material from a product
     * @param productId Product ID
     * @param materialId Material ID to remove
     * @param updaterUserId User performing the operation
     * @return Updated product as DTO
     * @throws EntityNotFoundException if product, material, or user not found
     */
    ProductReadOnlyDTO removeMaterialFromProduct(Long productId, Long materialId, Long updaterUserId)
            throws EntityNotFoundException;

    // Procedure Relationship Management

    /**
     * Adds a procedure to a product or updates the cost if already exists
     * @param productId Product ID
     * @param procedureId Procedure ID to add
     * @param cost Cost of the procedure for this product
     * @param updaterUserId User performing the operation
     * @return Updated product as DTO
     * @throws EntityNotFoundException if product, procedure, or user not found
     */
    ProductReadOnlyDTO addProcedureToProduct(Long productId, Long procedureId,
                                             BigDecimal cost, Long updaterUserId)
            throws EntityNotFoundException;

    /**
     * Removes a procedure from a product
     * @param productId Product ID
     * @param procedureId Procedure ID to remove
     * @param updaterUserId User performing the operation
     * @return Updated product as DTO
     * @throws EntityNotFoundException if product, procedure, or user not found
     */
    ProductReadOnlyDTO removeProcedureFromProduct(Long productId, Long procedureId, Long updaterUserId)
            throws EntityNotFoundException;


    /**
     * Recalculates suggested prices for all active products based on current material costs and markup factors
     * @param updaterUserId User performing the bulk price update
     * @return Results of the recalculation operation including counts and success rate
     * @throws EntityNotFoundException if updater user not found
     */
    PriceRecalculationResultDTO recalculateAllProductPrices(Long updaterUserId) throws EntityNotFoundException;

}
