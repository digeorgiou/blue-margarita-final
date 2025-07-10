package gr.aueb.cf.bluemargarita.service;

import gr.aueb.cf.bluemargarita.core.exceptions.EntityAlreadyExistsException;
import gr.aueb.cf.bluemargarita.core.exceptions.EntityNotFoundException;
import gr.aueb.cf.bluemargarita.core.filters.MaterialFilters;
import gr.aueb.cf.bluemargarita.core.filters.Paginated;
import gr.aueb.cf.bluemargarita.dto.material.MaterialInsertDTO;
import gr.aueb.cf.bluemargarita.dto.material.MaterialReadOnlyDTO;
import gr.aueb.cf.bluemargarita.dto.material.MaterialUpdateDTO;

import java.util.List;

/**
 * Service interface for managing materials in the jewelry business application.
 * Handles material CRUD operations and filtering.
 */
public interface IMaterialService {

    // Core CRUD Operations

    /**
     * Creates a new material with unique description validation
     * @param dto Material creation data
     * @return Created material as DTO
     * @throws EntityAlreadyExistsException if material description already exists
     * @throws EntityNotFoundException if creator user not found
     */
    MaterialReadOnlyDTO createMaterial(MaterialInsertDTO dto)
            throws EntityAlreadyExistsException, EntityNotFoundException;

    /**
     * Updates an existing material's information
     * @param dto Material update data
     * @return Updated material as DTO
     * @throws EntityAlreadyExistsException if new description conflicts with existing material
     * @throws EntityNotFoundException if material or updater user not found
     */
    MaterialReadOnlyDTO updateMaterial(MaterialUpdateDTO dto)
            throws EntityAlreadyExistsException, EntityNotFoundException;

    /**
     * Deletes a material. Performs soft delete if material is used in purchases or products, hard delete otherwise
     * @param id Material ID to delete
     * @throws EntityNotFoundException if material not found
     */
    void deleteMaterial(Long id) throws EntityNotFoundException;

    /**
     * Retrieves a material by ID
     * @param id Material ID
     * @return Material as DTO
     * @throws EntityNotFoundException if material not found
     */
    MaterialReadOnlyDTO getMaterialById(Long id) throws EntityNotFoundException;

    // Query Operations

    /**
     * Retrieves all active materials
     * @return List of all active materials
     */
    List<MaterialReadOnlyDTO> getAllActiveMaterials();

    /**
     * Retrieves materials based on filter criteria
     * @param filters Filter criteria for materials
     * @return List of materials matching filters
     */
    List<MaterialReadOnlyDTO> getFilteredMaterials(MaterialFilters filters);

    /**
     * Retrieves materials with pagination based on filter criteria
     * @param filters Filter criteria including pagination info
     * @return Paginated result of materials matching filters
     */
    Paginated<MaterialReadOnlyDTO> getMaterialsFilteredPaginated(MaterialFilters filters);
}
