package gr.aueb.cf.bluemargarita.service;

import gr.aueb.cf.bluemargarita.core.exceptions.EntityAlreadyExistsException;
import gr.aueb.cf.bluemargarita.core.exceptions.EntityNotFoundException;
import gr.aueb.cf.bluemargarita.core.filters.MaterialFilters;
import gr.aueb.cf.bluemargarita.core.filters.Paginated;
import gr.aueb.cf.bluemargarita.dto.material.*;
import gr.aueb.cf.bluemargarita.dto.product.ProductUsageDTO;
import org.springframework.data.domain.Pageable;

import java.util.List;

/**
 * Service interface for managing materials in the jewelry business application.
 * Handles material CRUD operations, filtering, analytics, and product relationships.
 *
 * Materials represent raw materials and components used in jewelry production.
 * Each material has cost tracking, and usage analytics.
 */
public interface IMaterialService {

    // =============================================================================
    // CORE CRUD OPERATIONS
    // =============================================================================

    /**
     * Creates a new material with unique description validation
     *
     * Business Logic:
     * 1. Validates material description uniqueness
     * 2. Validates creator user exists
     * 3. Sets material as active by default
     * 4. Records creation audit information
     *
     * @param dto Material creation data containing description, unit cost, supplier, etc.
     * @return Created material as read-only DTO
     * @throws EntityAlreadyExistsException if material description already exists
     * @throws EntityNotFoundException if creator user not found
     */
    MaterialReadOnlyDTO createMaterial(MaterialInsertDTO dto)
            throws EntityAlreadyExistsException, EntityNotFoundException;

    /**
     * Updates an existing material's information
     *
     * Business Logic:
     * 1. Validates material exists
     * 2. Validates description uniqueness if description is being changed
     * 3. Validates updater user exists
     * 4. Updates material information and audit data
     *
     * @param dto Material update data containing ID, new information, and updater user ID
     * @return Updated material as read-only DTO
     * @throws EntityAlreadyExistsException if new description conflicts with existing material
     * @throws EntityNotFoundException if material or updater user not found
     */
    MaterialReadOnlyDTO updateMaterial(MaterialUpdateDTO dto)
            throws EntityAlreadyExistsException, EntityNotFoundException;

    /**
     * Deletes a material with smart deletion strategy
     *
     * Business Logic:
     * - SOFT DELETE: If material is used in any purchases or products (sets isActive=false, deletedAt=now)
     * - HARD DELETE: If material has no dependencies (removes from database)
     *
     * @param id Material ID to delete
     * @throws EntityNotFoundException if material not found
     */
    void deleteMaterial(Long id) throws EntityNotFoundException;

    /**
     * Retrieves a material by ID with basic information
     *
     * @param id Material ID
     * @return Material as read-only DTO with basic information
     * @throws EntityNotFoundException if material not found
     */
    MaterialReadOnlyDTO getMaterialById(Long id) throws EntityNotFoundException;

    // =============================================================================
    // MATERIALS MANAGEMENT PAGE
    // =============================================================================

    /**
     * Retrieves materials with pagination and filtering for management pages
     * Primary method for material management list views with:
     * - Name-based search (case-insensitive partial matching)
     * - Active/inactive status filtering
     * - Supplier filtering
     * - Pagination support
     * - Sorting capabilities
     *
     * @param filters Filter criteria including pagination parameters
     * @return Paginated result of materials matching filter criteria
     */
    Paginated<MaterialReadOnlyDTO> getMaterialsFilteredPaginated(MaterialFilters filters);

    /**
     * Retrieves comprehensive analytics and detailed information for a specific material
     * Used for "View Details" functionality in management pages, providing:
     * - Basic material information including supplier details
     * - Usage statistics (total products using this material)
     * - Usage quantity analytics (average, min, max usage across products)
     * - Cost impact analysis (total and average cost impact across products)
     * - Product usage distribution (top products using this material)
     * Analytics are calculated in real-time from current product relationships
     *
     * @param id Material ID to analyze
     * @return Detailed material information with comprehensive usage analytics
     * @throws EntityNotFoundException if material not found
     */
    MaterialDetailedViewDTO getMaterialDetailedById(Long id) throws EntityNotFoundException;



    /**
     * Retrieves paginated list of all products using a specific material
     * @param materialId Material ID to find products for
     * @param pageable Pagination and sorting parameters
     * @return Paginated list of products using this material with usage details
     * @throws EntityNotFoundException if material not found
     */
    Paginated<ProductUsageDTO> getAllProductsUsingMaterial(Long materialId, Pageable pageable)
            throws EntityNotFoundException;

    // =============================================================================
    // MATERIAL SEARCH FOR RECORD PURCHASE PAGE
    // =============================================================================

    /**
     * Retrieves active materials matching search term for autocomplete in purchase recording
     *
     * @param searchTerm Material name search term
     * @return List of materials with basic info for selection
     */
    List<MaterialSearchResultDTO> searchMaterialsForAutocomplete(String searchTerm);

}