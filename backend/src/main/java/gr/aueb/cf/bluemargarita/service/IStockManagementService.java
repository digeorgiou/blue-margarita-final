package gr.aueb.cf.bluemargarita.service;

import gr.aueb.cf.bluemargarita.core.exceptions.EntityInvalidArgumentException;
import gr.aueb.cf.bluemargarita.core.exceptions.EntityNotFoundException;
import gr.aueb.cf.bluemargarita.core.filters.Paginated;
import gr.aueb.cf.bluemargarita.core.filters.ProductFilters;
import gr.aueb.cf.bluemargarita.dto.stock.*;
import gr.aueb.cf.bluemargarita.model.Product;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

/**
 * Service interface for managing product stock operations.
 * Handles all stock-related operations including manual updates, sale/purchase impacts,
 * and stock monitoring/reporting.
 */
public interface IStockManagementService {

    // =============================================================================
    // MANUAL STOCK OPERATIONS (Stock Management Page)
    // =============================================================================

    /**
     * Updates stock for a single product manually
     * Used in stock management interface
     */
    StockUpdateResultDTO updateProductStock(StockUpdateDTO updateDTO)
            throws EntityNotFoundException;


    /**
     * Updates stock limit alert for a single product manually
     * used in stock management interface
     */
    StockLimitUpdateResultDTO updateProductStockLimit(StockLimitUpdateDTO updateDTO) throws EntityNotFoundException;


    /**
     * Gets products formatted for stock management operations
     * Used in stock management page with filtering and pagination
     */
    Paginated<StockManagementDTO> getProductsForStockManagement(ProductFilters filters);

    // =============================================================================
    // AUTOMATIC STOCK OPERATIONS (Called by Other Services)
    // =============================================================================

    /**
     * Reduces stock for products after a sale is recorded
     * Called by SaleService.recordSale()
     */
    void reduceStockAfterSale(Map<Product, BigDecimal> productQuantities, Long saleId);

    /**
     * Restores stock for products after a sale is deleted
     * Called by SaleService.deleteSale()
     */
    void restoreStockAfterSaleDeleted(Map<Product, BigDecimal> productQuantities, Long saleId);

    // =============================================================================
    // STOCK MONITORING AND ALERTS
    // =============================================================================

    /**
     * Gets products with low stock for dashboard
     * Called by dashboard to show stock alerts
     */
    List<StockAlertDTO> getLowStockProducts(int limit);

    /**
     * Gets all low stock products with pagination (for "view all" functionality)
     * Used when user clicks "View All" from dashboard low stock widget
     */
    Paginated<StockAlertDTO> getAllLowStockProductsPaginated(ProductFilters filters);


}