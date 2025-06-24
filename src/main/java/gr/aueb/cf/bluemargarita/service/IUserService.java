package gr.aueb.cf.bluemargarita.service;

import gr.aueb.cf.bluemargarita.core.exceptions.EntityAlreadyExistsException;
import gr.aueb.cf.bluemargarita.core.exceptions.EntityNotFoundException;
import gr.aueb.cf.bluemargarita.dto.user.UserInsertDTO;
import gr.aueb.cf.bluemargarita.dto.user.UserReadOnlyDTO;
import gr.aueb.cf.bluemargarita.dto.user.UserUpdateDTO;

public interface IUserService {

    UserReadOnlyDTO createUser(UserInsertDTO dto) throws EntityAlreadyExistsException;
    UserReadOnlyDTO updateUser(UserUpdateDTO dto) throws EntityNotFoundException, EntityAlreadyExistsException;
    void deleteUser(Long id) throws EntityNotFoundException;
    UserReadOnlyDTO getUserById(Long id) throws EntityNotFoundException;
}
