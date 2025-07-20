package gr.aueb.cf.bluemargarita.service;

import gr.aueb.cf.bluemargarita.core.exceptions.EntityAlreadyExistsException;
import gr.aueb.cf.bluemargarita.core.exceptions.EntityNotFoundException;
import gr.aueb.cf.bluemargarita.core.filters.CategoryFilters;
import gr.aueb.cf.bluemargarita.core.filters.Paginated;
import gr.aueb.cf.bluemargarita.dto.category.*;

import java.util.List;

/**
 * Service interface for managing categories in the jewelry business application.
 * Handles category CRUD operations, validation, and filtering.
 */
public interface ICategoryService {

    // Core CRUD Operations

    /**
     * Creates a new category with unique name validation
     * @param dto Category creation data
     * @return Created category as DTO
     * @throws EntityAlreadyExistsException if category name already exists
     * @throws EntityNotFoundException if creator user not found
     */
    CategoryReadOnlyDTO createCategory(CategoryInsertDTO dto)
            throws EntityAlreadyExistsException, EntityNotFoundException;

    /**
     * Updates an existing category's information
     * @param dto Category update data
     * @return Updated category as DTO
     * @throws EntityAlreadyExistsException if new name conflicts with existing category
     * @throws EntityNotFoundException if category or updater user not found
     */
    CategoryReadOnlyDTO updateCategory(CategoryUpdateDTO dto)
            throws EntityAlreadyExistsException, EntityNotFoundException;

    /**
     * Deletes a category. Performs soft delete if category has products, hard delete otherwise
     * @param id Category ID to delete
     * @throws EntityNotFoundException if category not found
     */
    void deleteCategory(Long id) throws EntityNotFoundException;

    /**
     * Retrieves a category by ID
     * @param id Category ID
     * @return Category as DTO
     * @throws EntityNotFoundException if category not found
     */
    CategoryReadOnlyDTO getCategoryById(Long id) throws EntityNotFoundException;

    // Query Operations


    /**
     * Retrieves all active categories for Dropdown menu
     * @return a light DTO with minimum info.
     */
    List<CategoryForDropdownDTO> getActiveCategoriesForDropdown();

    CategoryDetailedViewDTO getCategoryDetailedView(Long categoryId) throws EntityNotFoundException;

    /**
     * Retrieves categories with pagination based on filter criteria
     * @param filters Filter criteria including pagination info
     * @return Paginated result of categories matching filters
     */
    Paginated<CategoryReadOnlyDTO> getCategoriesFilteredPaginated(CategoryFilters filters);
}
