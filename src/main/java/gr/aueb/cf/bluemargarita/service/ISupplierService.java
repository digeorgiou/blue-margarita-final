package gr.aueb.cf.bluemargarita.service;

import gr.aueb.cf.bluemargarita.core.exceptions.EntityAlreadyExistsException;
import gr.aueb.cf.bluemargarita.core.exceptions.EntityNotFoundException;
import gr.aueb.cf.bluemargarita.core.filters.Paginated;
import gr.aueb.cf.bluemargarita.core.filters.SupplierFilters;
import gr.aueb.cf.bluemargarita.dto.supplier.SupplierInsertDTO;
import gr.aueb.cf.bluemargarita.dto.supplier.SupplierReadOnlyDTO;
import gr.aueb.cf.bluemargarita.dto.supplier.SupplierUpdateDTO;

import java.util.List;

public interface ISupplierService {

    SupplierReadOnlyDTO createSupplier(SupplierInsertDTO dto) throws EntityAlreadyExistsException, EntityNotFoundException;
    SupplierReadOnlyDTO updateSupplier(SupplierUpdateDTO dto) throws EntityAlreadyExistsException, EntityNotFoundException;
    void deleteSupplier(Long id) throws EntityNotFoundException;
    SupplierReadOnlyDTO getSupplierById(Long id) throws EntityNotFoundException;
    List<SupplierReadOnlyDTO> getFilteredSuppliers(SupplierFilters filters);
    Paginated<SupplierReadOnlyDTO> getSuppliersFilteredPaginated(SupplierFilters filters);

}
