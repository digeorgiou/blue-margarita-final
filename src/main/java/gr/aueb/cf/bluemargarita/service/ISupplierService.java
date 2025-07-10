package gr.aueb.cf.bluemargarita.service;

import gr.aueb.cf.bluemargarita.core.exceptions.EntityAlreadyExistsException;
import gr.aueb.cf.bluemargarita.core.exceptions.EntityNotFoundException;
import gr.aueb.cf.bluemargarita.core.filters.Paginated;
import gr.aueb.cf.bluemargarita.core.filters.SupplierFilters;
import gr.aueb.cf.bluemargarita.dto.supplier.SupplierDropdownDTO;
import gr.aueb.cf.bluemargarita.dto.supplier.SupplierInsertDTO;
import gr.aueb.cf.bluemargarita.dto.supplier.SupplierReadOnlyDTO;
import gr.aueb.cf.bluemargarita.dto.supplier.SupplierUpdateDTO;

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
}

