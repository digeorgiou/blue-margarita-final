package gr.aueb.cf.bluemargarita.service;

import gr.aueb.cf.bluemargarita.core.exceptions.EntityAlreadyExistsException;
import gr.aueb.cf.bluemargarita.core.exceptions.EntityNotFoundException;
import gr.aueb.cf.bluemargarita.core.filters.Paginated;
import gr.aueb.cf.bluemargarita.core.filters.ProcedureFilters;
import gr.aueb.cf.bluemargarita.dto.procedure.ProcedureInsertDTO;
import gr.aueb.cf.bluemargarita.dto.procedure.ProcedureReadOnlyDTO;
import gr.aueb.cf.bluemargarita.dto.procedure.ProcedureUpdateDTO;

import java.util.List;

/**
 * Service interface for managing procedures in the jewelry business application.
 * Handles procedure CRUD operations and filtering.
 */
public interface IProcedureService {

    // Core CRUD Operations

    /**
     * Creates a new procedure with unique name validation
     * @param dto Procedure creation data
     * @return Created procedure as DTO
     * @throws EntityAlreadyExistsException if procedure name already exists
     * @throws EntityNotFoundException if creator user not found
     */
    ProcedureReadOnlyDTO createProcedure(ProcedureInsertDTO dto)
            throws EntityAlreadyExistsException, EntityNotFoundException;

    /**
     * Updates an existing procedure's information
     * @param dto Procedure update data
     * @return Updated procedure as DTO
     * @throws EntityAlreadyExistsException if new name conflicts with existing procedure
     * @throws EntityNotFoundException if procedure or updater user not found
     */
    ProcedureReadOnlyDTO updateProcedure(ProcedureUpdateDTO dto)
            throws EntityAlreadyExistsException, EntityNotFoundException;

    /**
     * Deletes a procedure. Performs soft delete if procedure is used in products, hard delete otherwise
     * @param id Procedure ID to delete
     * @throws EntityNotFoundException if procedure not found
     */
    void deleteProcedure(Long id) throws EntityNotFoundException;

    /**
     * Retrieves a procedure by ID
     * @param id Procedure ID
     * @return Procedure as DTO
     * @throws EntityNotFoundException if procedure not found
     */
    ProcedureReadOnlyDTO getProcedureById(Long id) throws EntityNotFoundException;

    // Query Operations

    /**
     * Retrieves all active procedures
     * @return List of all active procedures
     */
    List<ProcedureReadOnlyDTO> getAllActiveProcedures();

    /**
     * Retrieves procedures based on filter criteria
     * @param filters Filter criteria for procedures
     * @return List of procedures matching filters
     */
    List<ProcedureReadOnlyDTO> getFilteredProcedures(ProcedureFilters filters);

    /**
     * Retrieves procedures with pagination based on filter criteria
     * @param filters Filter criteria including pagination info
     * @return Paginated result of procedures matching filters
     */
    Paginated<ProcedureReadOnlyDTO> getProceduresFilteredPaginated(ProcedureFilters filters);
}
