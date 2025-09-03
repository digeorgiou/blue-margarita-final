package gr.aueb.cf.bluemargarita.service;

import gr.aueb.cf.bluemargarita.core.exceptions.EntityAlreadyExistsException;
import gr.aueb.cf.bluemargarita.core.exceptions.EntityInvalidArgumentException;
import gr.aueb.cf.bluemargarita.core.exceptions.EntityNotFoundException;
import gr.aueb.cf.bluemargarita.core.filters.Paginated;
import gr.aueb.cf.bluemargarita.core.filters.UserFilters;
import gr.aueb.cf.bluemargarita.dto.user.UserInsertDTO;
import gr.aueb.cf.bluemargarita.dto.user.UserReadOnlyDTO;
import gr.aueb.cf.bluemargarita.dto.user.UserUpdateDTO;

import java.util.List;

public interface IUserService {

    // =============================================================================
    // CORE CRUD OPERATIONS
    // =============================================================================

    /**
     * Creates a new user with unique username validation
     * @param dto User creation data including username, password, and role
     * @return Created user as DTO
     * @throws EntityAlreadyExistsException if username already exists
     */
    UserReadOnlyDTO createUser(UserInsertDTO dto) throws EntityAlreadyExistsException;

    /**
     * Updates an existing user's information
     * @param dto User update data
     * @return Updated user as DTO
     * @throws EntityNotFoundException if user not found
     * @throws EntityAlreadyExistsException if new username conflicts with existing user
     */
    UserReadOnlyDTO updateUser(UserUpdateDTO dto) throws EntityNotFoundException, EntityAlreadyExistsException;

    /**
     * Deletes a user by ID
     * Performs soft delete by setting isActive to false
     * @param id User ID to delete
     * @throws EntityNotFoundException if user not found
     */
    void deleteUser(Long id) throws EntityNotFoundException;

    /**
     * Restores a soft-deleted user by making it active again
     * Business Logic:
     * 1. Validates user exists and is currently soft-deleted (isActive=false)
     * 2. Sets isActive=true and deletedAt=null
     * 3. Updates audit fields with current user and timestamp
     *
     * @param id User ID to restore
     * @return Restored user as DTO
     * @throws EntityNotFoundException if user not found
     * @throws IllegalStateException if user is already active
     */
    UserReadOnlyDTO restoreUser(Long id) throws EntityNotFoundException, EntityInvalidArgumentException;

    /**
     * Retrieves a user by ID
     * @param id User ID
     * @return User as DTO
     * @throws EntityNotFoundException if user not found
     */
    UserReadOnlyDTO getUserById(Long id) throws EntityNotFoundException;

    // =============================================================================
    // QUERY OPERATIONS
    // =============================================================================

    /**
     * Retrieves all active users
     * Used for user management and admin operations
     * @return List of all active users
     */
    List<UserReadOnlyDTO> getAllActiveUsers();

    /**
     * Retrieves users with pagination based on filter criteria
     * Supports filtering by username (partial match) and active status
     * @param filters Filter criteria including pagination info
     * @return Paginated result of users matching filters
     */
    Paginated<UserReadOnlyDTO> getUsersFilteredPaginated(UserFilters filters);

    /**
     * Retrieves a user by username
     * Used primarily for authentication and security operations
     * @param username Username to search for
     * @return User as DTO
     * @throws EntityNotFoundException if user not found
     */
    UserReadOnlyDTO getUserByUsername(String username) throws EntityNotFoundException;

    /**
     * Checks if a username already exists
     * Used for validation during user creation and updates
     * @param username Username to check
     * @return true if username exists, false otherwise
     */
    boolean existsByUsername(String username);
}
