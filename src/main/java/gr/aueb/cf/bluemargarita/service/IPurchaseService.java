package gr.aueb.cf.bluemargarita.service;

import gr.aueb.cf.bluemargarita.core.exceptions.EntityAlreadyExistsException;
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
    PurchaseDetailedViewDTO recordPurchase(RecordPurchaseRequestDTO request) throws EntityNotFoundException, EntityAlreadyExistsException;

    /**
     * Updates an existing purchase's basic information
     * Note: This method updates purchase metadata but does not modify materials in the purchase
     *
     * @param dto Purchase update data including new values for basic fields
     * @return Updated purchase as read-only DTO
     * @throws EntityNotFoundException if purchase, supplier, or user not found
     */
    PurchaseReadOnlyDTO updatePurchase(PurchaseUpdateDTO dto) throws EntityNotFoundException, EntityAlreadyExistsException;

    /**
     * Deletes a purchase completely
     * This is a hard delete that removes all purchase data and purchase materials
     *
     * @param purchaseId Purchase ID to delete
     * @throws EntityNotFoundException if purchase not found
     */
    void deletePurchase(Long purchaseId) throws EntityNotFoundException;

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

    // =============================================================================
    // VIEW PURCHASES PAGE METHODS
    // =============================================================================

    /**
     * Searches purchases with advanced filtering and optional summary calculation
     *
     * Supports filtering by:
     * - Date range (saleDateFrom, saleDateTo)
     * - Material (autocomplete by name OR precise selection by ID)
     * - Supplier (autocomplete by name/email/tin OR precise selection by ID)
     *
     * Summary is only calculated if filtered results ≤ 100 for performance
     *
     * @param filters Filter criteria with pagination parameters
     * @return Paginated sales results with optional summary
     */

    PaginatedFilteredPurchasesWithSummary searchPurchasesWithSummary(PurchaseFilters filters);


    /**
     * Retrieves detailed purchase information with all materials
     *
     * @param purchaseId Purchase ID
     * @return Detailed purchase view with materials and costs
     * @throws EntityNotFoundException if purchase not found
     */
    PurchaseDetailedViewDTO getPurchaseDetailedView(Long purchaseId) throws EntityNotFoundException;


}
