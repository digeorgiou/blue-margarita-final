package gr.aueb.cf.bluemargarita.service;

import gr.aueb.cf.bluemargarita.core.exceptions.EntityAlreadyExistsException;
import gr.aueb.cf.bluemargarita.core.exceptions.EntityNotFoundException;
import gr.aueb.cf.bluemargarita.core.filters.Paginated;
import gr.aueb.cf.bluemargarita.core.filters.SupplierFilters;
import gr.aueb.cf.bluemargarita.dto.supplier.*;

import java.util.List;

/**
 * Service interface for managing suppliers in the jewelry business application.
 * Handles supplier CRUD operations, validation, and filtering.
 */
public interface ISupplierService {

    // Core CRUD Operations

    /**
     * Creates a new supplier with unique TIN and email validation
     * @param dto Supplier creation data
     * @return Created supplier as DTO
     * @throws EntityAlreadyExistsException if supplier TIN or email already exists
     * @throws EntityNotFoundException if creator user not found
     */
    SupplierReadOnlyDTO createSupplier(SupplierInsertDTO dto)
            throws EntityAlreadyExistsException, EntityNotFoundException;

    /**
     * Updates an existing supplier's information
     * @param dto Supplier update data
     * @return Updated supplier as DTO
     * @throws EntityAlreadyExistsException if new TIN or email conflicts with existing supplier
     * @throws EntityNotFoundException if supplier or updater user not found
     */
    SupplierReadOnlyDTO updateSupplier(SupplierUpdateDTO dto)
            throws EntityAlreadyExistsException, EntityNotFoundException;

    /**
     * Deletes a supplier. Performs soft delete if supplier has purchases, hard delete otherwise
     * @param id Supplier ID to delete
     * @throws EntityNotFoundException if supplier not found
     */
    void deleteSupplier(Long id) throws EntityNotFoundException;

    /**
     * Retrieves a supplier by ID
     * @param id Supplier ID
     * @return Supplier as DTO
     * @throws EntityNotFoundException if supplier not found
     */
    SupplierReadOnlyDTO getSupplierById(Long id) throws EntityNotFoundException;

    // Query Operations

    /**
     * Retrieves all active suppliers for dropdown selection
     * @return List of suppliers with ID and name only
     */
    List<SupplierDropdownDTO> getActiveSuppliersForDropdown();

    /**
     * Retrieves suppliers based on filter criteria
     * @param filters Filter criteria for suppliers
     * @return List of suppliers matching filters
     */
    List<SupplierReadOnlyDTO> getFilteredSuppliers(SupplierFilters filters);

    /**
     * Retrieves suppliers with pagination based on filter criteria
     * @param filters Filter criteria including pagination info
     * @return Paginated result of suppliers matching filters
     */
    Paginated<SupplierReadOnlyDTO> getSuppliersFilteredPaginated(SupplierFilters filters);

    /**
     * Retrieves comprehensive analytics for a specific supplier
     *
     * Used for "View Details" functionality in supplier management pages, providing:
     * - Basic supplier information
     * - Purchase statistics (total purchases, total cost, average purchase value)
     * - Purchase history timeline (first and last purchase dates)
     * - Top materials purchased from this supplier
     *
     * Performance Optimization:
     * - Uses database-level aggregation queries instead of loading all purchases
     * - Memory usage remains constant regardless of purchase volume
     * - Scales efficiently to handle suppliers with thousands of purchases
     *
     * @param supplierId Supplier ID to analyze
     * @return Detailed supplier information with comprehensive purchase analytics
     * @throws EntityNotFoundException if supplier not found
     */
    SupplierDetailedViewDTO getSupplierDetailedView(Long supplierId) throws EntityNotFoundException;

    /**
     * Retrieves all active suppliers for general use
     * Used when you need a simple list of available suppliers
     *
     * @return List of all active suppliers
     */
    List<SupplierReadOnlyDTO> getAllActiveSuppliers();

    /**
     * Retrieves active suppliers matching search term for autocomplete in purchase recording
     *
     * @param searchTerm Supplier name, email, or phone search term
     * @return List of suppliers with basic contact info for selection
     */
    List<SupplierSearchResultDTO> searchSuppliersForAutocomplete(String searchTerm);
}

