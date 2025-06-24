package gr.aueb.cf.bluemargarita.service;

import gr.aueb.cf.bluemargarita.core.exceptions.EntityAlreadyExistsException;
import gr.aueb.cf.bluemargarita.core.exceptions.EntityNotFoundException;
import gr.aueb.cf.bluemargarita.dto.material.MaterialInsertDTO;
import gr.aueb.cf.bluemargarita.dto.material.MaterialReadOnlyDTO;
import gr.aueb.cf.bluemargarita.dto.material.MaterialUpdateDTO;

public interface IMaterialService {

    MaterialReadOnlyDTO createMaterial(MaterialInsertDTO dto) throws EntityAlreadyExistsException, EntityNotFoundException;
    MaterialReadOnlyDTO updateMaterial(MaterialUpdateDTO dto) throws EntityAlreadyExistsException, EntityNotFoundException;
    void deleteMaterial(Long id) throws EntityNotFoundException;
    MaterialReadOnlyDTO getMaterialById(Long id) throws EntityNotFoundException;

}
