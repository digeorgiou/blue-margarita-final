package gr.aueb.cf.bluemargarita.service;

import gr.aueb.cf.bluemargarita.core.exceptions.EntityAlreadyExistsException;
import gr.aueb.cf.bluemargarita.core.exceptions.EntityNotFoundException;
import gr.aueb.cf.bluemargarita.core.filters.Paginated;
import gr.aueb.cf.bluemargarita.core.filters.ProcedureFilters;
import gr.aueb.cf.bluemargarita.dto.procedure.ProcedureDetailedViewDTO;
import gr.aueb.cf.bluemargarita.dto.procedure.ProcedureForDropdownDTO;
import gr.aueb.cf.bluemargarita.dto.procedure.ProcedureInsertDTO;
import gr.aueb.cf.bluemargarita.dto.procedure.ProcedureReadOnlyDTO;
import gr.aueb.cf.bluemargarita.dto.procedure.ProcedureUpdateDTO;
import gr.aueb.cf.bluemargarita.dto.product.ProductUsageDTO;
import org.springframework.data.domain.Pageable;

import java.util.List;

/**
 * Service interface for managing procedures in the jewelry business application.
 * Handles procedure CRUD operations, filtering, and analytics for production procedures.
 *
 * Procedures represent production steps/processes that can be applied to jewelry products
 * with associated costs. Each procedure can be used across multiple products and categories.
 */
public interface IProcedureService {

    // =============================================================================
    // CORE CRUD OPERATIONS
    // =============================================================================

    /**
     * Creates a new procedure with unique name validation
     *
     * Business Logic:
     * 1. Validates procedure name uniqueness
     * 2. Validates creator user exists
     * 3. Sets procedure as active by default
     * 4. Records creation audit information
     *
     * @param dto Procedure creation data containing name and creator user ID
     * @return Created procedure as read-only DTO
     * @throws EntityAlreadyExistsException if procedure name already exists
     * @throws EntityNotFoundException if creator user not found
     */
    ProcedureReadOnlyDTO createProcedure(ProcedureInsertDTO dto)
            throws EntityAlreadyExistsException, EntityNotFoundException;

    /**
     * Updates an existing procedure's information
     *
     * Business Logic:
     * 1. Validates procedure exists
     * 2. Validates name uniqueness if name is being changed
     * 3. Validates updater user exists
     * 4. Updates procedure information and audit data
     *
     * @param dto Procedure update data containing ID, new name, and updater user ID
     * @return Updated procedure as read-only DTO
     * @throws EntityAlreadyExistsException if new name conflicts with existing procedure
     * @throws EntityNotFoundException if procedure or updater user not found
     */
    ProcedureReadOnlyDTO updateProcedure(ProcedureUpdateDTO dto)
            throws EntityAlreadyExistsException, EntityNotFoundException;

    /**
     * Deletes a procedure with smart deletion strategy
     *
     * Business Logic:
     * - SOFT DELETE: If procedure is used in any products (sets isActive=false, deletedAt=now)
     * - HARD DELETE: If procedure has no product dependencies (removes from database)
     *
     * @param id Procedure ID to delete
     * @throws EntityNotFoundException if procedure not found
     */
    void deleteProcedure(Long id) throws EntityNotFoundException;

    /**
     * Retrieves a procedure by ID with basic information
     *
     * @param id Procedure ID
     * @return Procedure as read-only DTO with basic information
     * @throws EntityNotFoundException if procedure not found
     */
    ProcedureReadOnlyDTO getProcedureById(Long id) throws EntityNotFoundException;

    // =============================================================================
    // PROCEDURE VIEW PAGE AND ANALYTICS
    // =============================================================================

    /**
     * Retrieves procedures with pagination and filtering for management pages
     *
     * Primary method for procedure management list views with:
     * - Name-based search (case-insensitive partial matching)
     * - Active/inactive status filtering
     * - Pagination support
     * - Sorting capabilities
     *
     * @param filters Filter criteria including pagination parameters
     * @return Paginated result of procedures matching filter criteria
     */
    Paginated<ProcedureReadOnlyDTO> getProceduresFilteredPaginated(ProcedureFilters filters);

    /**
     * Retrieves comprehensive analytics and detailed information for a specific procedure
     *
     * Used for "View Details" functionality in management pages, providing:
     * - Basic procedure information
     * - Usage statistics (total products using this procedure)
     * - Cost analytics (average, min, max procedure costs across products)
     * - Revenue analytics (average product selling prices)
     * - Category distribution (which product categories use this procedure most)
     *
     * Analytics are calculated in real-time from current product relationships
     *
     * @param id Procedure ID to analyze
     * @return Detailed procedure information with comprehensive analytics
     * @throws EntityNotFoundException if procedure not found
     */
    ProcedureDetailedViewDTO getProcedureDetailedById(Long id) throws EntityNotFoundException;

    /**
     * Retrieves paginated list of all products using a specific procedure
     * @param procedureId Procedure ID to find products for
     * @param pageable Pagination and sorting parameters
     * @return Paginated list of products using this material with usage details
     * @throws EntityNotFoundException if material not found
     */
    Paginated<ProductUsageDTO> getAllProductsUsingProcedure(Long procedureId, Pageable pageable)
            throws EntityNotFoundException;


    // =============================================================================
    // FOR DROPDOWN IN ADD-PRODUCT
    // =============================================================================

    /**
     * Retrieves active procedures formatted for dropdown selections
     * Returns minimal data optimized for form dropdowns and autocomplete
     *
     * @return List of active procedures with ID and name only, sorted alphabetically
     */
    List<ProcedureForDropdownDTO> getActiveProceduresForDropdown();

}