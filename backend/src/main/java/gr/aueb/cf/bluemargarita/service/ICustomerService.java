package gr.aueb.cf.bluemargarita.service;

import gr.aueb.cf.bluemargarita.core.exceptions.EntityAlreadyExistsException;
import gr.aueb.cf.bluemargarita.core.exceptions.EntityInvalidArgumentException;
import gr.aueb.cf.bluemargarita.core.exceptions.EntityNotFoundException;
import gr.aueb.cf.bluemargarita.core.filters.CustomerFilters;
import gr.aueb.cf.bluemargarita.core.filters.Paginated;
import gr.aueb.cf.bluemargarita.dto.customer.*;

import java.util.List;

/**
 * Service interface for managing customers in the jewelry business application.
 * Handles customer CRUD operations, validation, and customer analytics.
 */
public interface ICustomerService {

    // =============================================================================
    // CORE CRUD OPERATIONS
    // =============================================================================

    /**
     * Creates a new customer with unique email and TIN validation
     * @param dto Customer creation data
     * @return Created customer as DTO
     * @throws EntityAlreadyExistsException if customer email or TIN already exists
     * @throws EntityNotFoundException if creator user not found
     */
    CustomerListItemDTO createCustomer(CustomerInsertDTO dto)
            throws EntityAlreadyExistsException, EntityNotFoundException;

    /**
     * Updates an existing customer's information
     * @param dto Customer update data
     * @return Updated customer as DTO
     * @throws EntityAlreadyExistsException if new email or TIN conflicts with existing customer
     * @throws EntityNotFoundException if customer or updater user not found
     */
    CustomerListItemDTO updateCustomer(CustomerUpdateDTO dto)
            throws EntityAlreadyExistsException, EntityNotFoundException;

    /**
     * Deletes a customer. Performs soft delete if customer has sales history, hard delete otherwise
     * @param id Customer ID to delete
     * @throws EntityNotFoundException if customer not found
     */
    void deleteCustomer(Long id) throws EntityNotFoundException;

    /**
     * Restores a soft-deleted customer by making it active again
     * Business Logic:
     * 1. Validates customer exists and is currently soft-deleted (isActive=false)
     * 2. Sets isActive=true and deletedAt=null
     * 3. Updates audit fields with current user and timestamp
     *
     * @param id Customer ID to restore
     * @return Restored customer as DTO
     * @throws EntityNotFoundException if customer not found
     * @throws IllegalStateException if customer is already active
     */
    CustomerListItemDTO restoreCustomer(Long id) throws EntityNotFoundException, EntityInvalidArgumentException;

    // =============================================================================
    // CUSTOMER LISTING AND FILTERING (View Customers Page)
    // =============================================================================

    /**
     * Retrieves a customer by ID
     * @param id Customer ID
     * @return Customer as DTO
     * @throws EntityNotFoundException if customer not found
     */
    CustomerListItemDTO getCustomerById(Long id) throws EntityNotFoundException;

    /**
     * Retrieves customers with pagination based on filter criteria
     * Supports filtering by email, lastname, tin, phone number, search term, wholesale flag, and active status
     * @param filters Filter criteria including pagination info
     * @return Paginated result of customers matching filters
     */
    Paginated<CustomerListItemDTO> getCustomersFilteredPaginated(CustomerFilters filters);

    /**
     * Gets detailed customer view with sales statistics and top products by revenue
     * Includes comprehensive analytics including total revenue, number of sales, last order date,
     * average order value, and top 5 products purchased by this customer
     * @param customerId Customer ID
     * @return Customer with detailed sales analytics and top products
     * @throws EntityNotFoundException if customer not found
     */
    CustomerDetailedViewDTO getCustomerDetailedView(Long customerId) throws EntityNotFoundException;

    /**
     * Retrieves active customers matching the searchTerm
     * with the info needed for autocomplete in Record sale
     * @param searchTerm searches by lastname, phone number, tin or email
     * @return
     */
    List<CustomerSearchResultDTO> searchCustomersForAutocomplete(String searchTerm);
}