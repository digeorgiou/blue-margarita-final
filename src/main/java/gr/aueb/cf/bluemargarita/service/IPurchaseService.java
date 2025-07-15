package gr.aueb.cf.bluemargarita.service;

import gr.aueb.cf.bluemargarita.core.exceptions.EntityNotFoundException;
import gr.aueb.cf.bluemargarita.core.filters.Paginated;
import gr.aueb.cf.bluemargarita.core.filters.PurchaseFilters;
import gr.aueb.cf.bluemargarita.dto.material.MaterialSearchResultDTO;
import gr.aueb.cf.bluemargarita.dto.purchase.*;

import java.util.List;

public interface IPurchaseService {

    // =============================================================================
    // CORE CRUD OPERATIONS
    // =============================================================================

    /**
     * Records a new purchase with materials and automatic cost calculation
     *
     * Business Logic:
     * 1. Validates supplier and creator user exist
     * 2. Validates all materials exist and builds material-quantity map
     * 3. Creates purchase entity with provided details
     * 4. Adds materials to purchase with current prices
     * 5. Calculates total cost based on material quantities and current prices
     *
     * @param request Purchase recording data including materials and quantities
     * @return Detailed view of the created purchase
     * @throws EntityNotFoundException if supplier, user, or any material not found
     */
    PurchaseDetailedViewDTO recordPurchase(RecordPurchaseRequestDTO request) throws EntityNotFoundException;

    /**
     * Updates an existing purchase's basic information
     * Note: This method updates purchase metadata but does not modify materials in the purchase
     *
     * @param dto Purchase update data including new values for basic fields
     * @return Updated purchase as read-only DTO
     * @throws EntityNotFoundException if purchase, supplier, or user not found
     */
    PurchaseReadOnlyDTO updatePurchase(PurchaseUpdateDTO dto) throws EntityNotFoundException;

    /**
     * Deletes a purchase completely
     * This is a hard delete that removes all purchase data and purchase materials
     *
     * @param purchaseId Purchase ID to delete
     * @throws EntityNotFoundException if purchase not found
     */
    void deletePurchase(Long purchaseId) throws EntityNotFoundException;

    /**
     * Retrieves detailed purchase information with all materials
     *
     * @param purchaseId Purchase ID
     * @return Detailed purchase view with materials and costs
     * @throws EntityNotFoundException if purchase not found
     */
    PurchaseDetailedViewDTO getPurchaseDetailedView(Long purchaseId) throws EntityNotFoundException;

    // =============================================================================
    // QUERY OPERATIONS
    // =============================================================================

    /**
     * Retrieves purchases with pagination and filtering for management pages
     *
     * Primary method for purchase management list views with:
     * - Date range filtering
     * - Supplier filtering (by ID or name)
     * - Cost range filtering
     * - Material filtering
     * - Pagination support
     * - Sorting capabilities
     *
     * @param filters Filter criteria including pagination parameters
     * @return Paginated result of purchases matching filter criteria
     */
    Paginated<PurchaseReadOnlyDTO> getPurchasesFilteredPaginated(PurchaseFilters filters);

    /**
     * Retrieves purchases based on filter criteria without pagination
     * Useful for exports or when you need all matching results
     *
     * @param filters Filter criteria (date range, supplier, cost, materials)
     * @return List of purchases matching filter criteria
     */
    List<PurchaseReadOnlyDTO> getFilteredPurchases(PurchaseFilters filters);

    /**
     * Retrieves active materials matching search term for autocomplete in purchase recording
     *
     * @param searchTerm Material name search term
     * @return List of materials with basic info for selection
     */
    List<MaterialSearchResultDTO> searchMaterialsForAutocomplete(String searchTerm);

    // =============================================================================
    // DASHBOARD METHODS
    // =============================================================================

    /**
     * Retrieves the most recent purchases for dashboard widget
     * Ordered by purchase date descending, then by creation time descending
     *
     * @param limit Maximum number of recent purchases to return (typically 5)
     * @return List of recent purchases with basic information
     */
    List<PurchaseReadOnlyDTO> getRecentPurchases(int limit);

    /**
     * Gets purchase summary for current day (dashboard widget)
     * Includes count, total cost, average purchase value, and material statistics
     *
     * @return Summary of today's purchases
     */
    PurchasesSummaryDTO getDailyPurchasesSummary();
}
