package gr.aueb.cf.bluemargarita.service;

import gr.aueb.cf.bluemargarita.core.exceptions.EntityAlreadyExistsException;
import gr.aueb.cf.bluemargarita.core.exceptions.EntityNotFoundException;
import gr.aueb.cf.bluemargarita.core.filters.Paginated;
import gr.aueb.cf.bluemargarita.core.filters.ProcedureFilters;
import gr.aueb.cf.bluemargarita.dto.procedure.ProcedureInsertDTO;
import gr.aueb.cf.bluemargarita.dto.procedure.ProcedureReadOnlyDTO;
import gr.aueb.cf.bluemargarita.dto.procedure.ProcedureUpdateDTO;

import java.util.List;

public interface IProcedureService {

    ProcedureReadOnlyDTO createProcedure(ProcedureInsertDTO dto) throws EntityAlreadyExistsException, EntityNotFoundException;
    ProcedureReadOnlyDTO updateProcedure(ProcedureUpdateDTO dto) throws EntityAlreadyExistsException, EntityNotFoundException;
    void deleteProcedure(Long id) throws EntityNotFoundException;
    ProcedureReadOnlyDTO getProcedureById(Long id) throws EntityNotFoundException;
    List<ProcedureReadOnlyDTO> getFilteredProcedures(ProcedureFilters filters);
    Paginated<ProcedureReadOnlyDTO> getProceduresFilteredPaginated(ProcedureFilters filters);

}
