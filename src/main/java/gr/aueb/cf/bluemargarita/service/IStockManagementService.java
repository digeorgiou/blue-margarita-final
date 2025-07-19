package gr.aueb.cf.bluemargarita.service;

import gr.aueb.cf.bluemargarita.core.exceptions.EntityInvalidArgumentException;
import gr.aueb.cf.bluemargarita.core.exceptions.EntityNotFoundException;
import gr.aueb.cf.bluemargarita.core.filters.Paginated;
import gr.aueb.cf.bluemargarita.core.filters.ProductFilters;
import gr.aueb.cf.bluemargarita.dto.stock.*;

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
            throws EntityNotFoundException, EntityInvalidArgumentException;

    /**
     * Updates stock for multiple products in bulk
     * Used for bulk stock operations
     */
    List<StockUpdateResultDTO> updateMultipleProductsStock(BulkStockUpdateDTO bulkUpdate);

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
    void reduceStockAfterSale(Map<Long, BigDecimal> productQuantities, Long saleId)
            throws EntityNotFoundException;

    /**
     * Restores stock for products after a sale is deleted
     * Called by SaleService.deleteSale()
     */
    void restoreStockAfterSaleDeleted(Map<Long, BigDecimal> productQuantities, Long saleId)
            throws EntityNotFoundException;

    /**
     * Adjusts stock when sale quantities are modified
     * Called by SaleService.updateSale() if product quantities changed
     */
    void adjustStockAfterSaleUpdated(Map<Long, BigDecimal> oldQuantities,
                                     Map<Long, BigDecimal> newQuantities, Long saleId)
            throws EntityNotFoundException;

    // =============================================================================
    // STOCK MONITORING AND ALERTS
    // =============================================================================

    /**
     * Gets products with low stock for dashboard
     * Called by dashboard to show stock alerts
     */
    List<StockAlertDTO> getLowStockProducts(int limit);

    /**
     * Gets products with negative stock (emergency alerts)
     * Called by dashboard to show urgent stock issues
     */
    List<StockAlertDTO> getNegativeStockProducts(int limit);

    /**
     * Gets comprehensive stock overview for stock management dashboard
     * Single method to load all stock management data
     */
    StockOverviewDTO getStockOverview();

    // =============================================================================
    // STOCK REPORTING
    // =============================================================================

    /**
     * Generates stock movement report for a date range
     * Shows all stock changes (manual, sales, purchases) in period
     */
    List<StockMovementDTO> getStockMovementReport(LocalDate startDate, LocalDate endDate);
}