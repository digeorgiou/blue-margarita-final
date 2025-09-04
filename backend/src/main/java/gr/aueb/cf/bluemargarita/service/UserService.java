package gr.aueb.cf.bluemargarita.service;

import gr.aueb.cf.bluemargarita.core.exceptions.EntityAlreadyExistsException;
import gr.aueb.cf.bluemargarita.core.exceptions.EntityInvalidArgumentException;
import gr.aueb.cf.bluemargarita.core.exceptions.EntityNotFoundException;
import gr.aueb.cf.bluemargarita.core.filters.LocationFilters;
import gr.aueb.cf.bluemargarita.core.filters.Paginated;
import gr.aueb.cf.bluemargarita.core.filters.UserFilters;
import gr.aueb.cf.bluemargarita.core.specifications.LocationSpecification;
import gr.aueb.cf.bluemargarita.core.specifications.UserSpecification;
import gr.aueb.cf.bluemargarita.dto.user.UserInsertDTO;
import gr.aueb.cf.bluemargarita.dto.user.UserReadOnlyDTO;
import gr.aueb.cf.bluemargarita.dto.user.UserUpdateDTO;
import gr.aueb.cf.bluemargarita.mapper.Mapper;
import gr.aueb.cf.bluemargarita.model.Location;
import gr.aueb.cf.bluemargarita.model.User;
import gr.aueb.cf.bluemargarita.repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.transaction.annotation.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class UserService implements IUserService{

    private static final Logger LOGGER =
            LoggerFactory.getLogger(UserService.class);
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final Mapper mapper;

    @Autowired
    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder, Mapper mapper) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.mapper = mapper;
    }

    // =============================================================================
    // CORE CRUD OPERATIONS
    // =============================================================================

    @Override
    @Transactional(rollbackFor = Exception.class)
    public UserReadOnlyDTO createUser(UserInsertDTO dto) throws EntityNotFoundException, EntityAlreadyExistsException {

        validateUniqueUsername(dto.username());

        User user = mapper.mapUserInsertToModel(dto);
        user.setPassword(passwordEncoder.encode(user.getPassword()));

        User creator = getCurrentUser();

        if (creator != null) {
            user.setCreatedBy(creator);
            user.setLastUpdatedBy(creator);
        }

        User insertedUser = userRepository.save(user);
        LOGGER.info("User with username = {} inserted with ID = {}", dto.username(), insertedUser.getId());

        return mapper.mapToUserReadOnlyDTO(insertedUser);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public UserReadOnlyDTO updateUser(UserUpdateDTO dto) throws EntityNotFoundException, EntityAlreadyExistsException {

        User existingUser = getUserEntityById(dto.userId());

        if(! existingUser.getUsername().equals(dto.username())){
            validateUniqueUsername(dto.username());
        }

        User updatedUser = mapper.mapUserUpdateToModel(dto, existingUser);

        User updater = getCurrentUser();
        if (updater != null) {
            updatedUser.setLastUpdatedBy(updater);
        }
        if (dto.password() != null && !dto.password().trim().isEmpty()) {
            updatedUser.setPassword(passwordEncoder.encode(dto.password()));
        }

        User savedUser = userRepository.save(updatedUser);

        LOGGER.info("User with id={}, username={} updated", savedUser.getId(), savedUser.getUsername());

        return mapper.mapToUserReadOnlyDTO(savedUser);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void deleteUser(Long id) throws EntityNotFoundException {

        User user = userRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("User", "User " +
                        "with id " + id + " not found"));

        User currentUser = getCurrentUserOrThrow();

        user.setIsActive(false);
        user.setLastUpdatedBy(currentUser);
        user.setDeletedAt(LocalDateTime.now());

        userRepository.save(user);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public UserReadOnlyDTO restoreUser(Long id) throws EntityNotFoundException, EntityInvalidArgumentException {

        User user = userRepository.findById(id).orElseThrow(() -> new EntityNotFoundException("User", "User with id " + id + " was not found"));

        // Check if user is actually soft-deleted
        if (user.getIsActive()) {
            throw new EntityInvalidArgumentException("User", "User is already active and cannot be restored");
        }

        // Restore the user
        user.setIsActive(true);
        user.setDeletedAt(null);

        User currentUser = getCurrentUserOrThrow();
        user.setLastUpdatedBy(currentUser);

        User restoredUser = userRepository.save(user);

        LOGGER.info("User {} restored by user {}",
                restoredUser.getUsername(),
                currentUser.getUsername());

        return mapper.mapToUserReadOnlyDTO(restoredUser);
    }

    @Override
    @Transactional(readOnly = true)
    public UserReadOnlyDTO getUserById(Long id) throws EntityNotFoundException {

        User user = userRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("User", "User " +
                        "with id " + id + " not found"));

        return mapper.mapToUserReadOnlyDTO(user);
    }

    // =============================================================================
    // QUERY OPERATIONS
    // =============================================================================


    @Override
    @Transactional(readOnly = true)
    public List<UserReadOnlyDTO> getAllActiveUsers() {
        return userRepository.findByIsActiveTrue()
                .stream()
                .map(mapper::mapToUserReadOnlyDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public Paginated<UserReadOnlyDTO> getUsersFilteredPaginated(UserFilters filters) {
        var filtered = userRepository.findAll(
                getSpecsFromFilters(filters),
                filters.getPageable()
        );
        return new Paginated<>(filtered.map(mapper::mapToUserReadOnlyDTO));
    }

    @Override
    @Transactional(readOnly = true)
    public UserReadOnlyDTO getUserByUsername(String username) throws EntityNotFoundException {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new EntityNotFoundException("User", "User with username " + username + " not found"));
        return mapper.mapToUserReadOnlyDTO(user);
    }

    @Override
    @Transactional(readOnly = true)
    public boolean existsByUsername(String username) {
        return userRepository.existsByUsername(username);
    }


    private User getCurrentUser() {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

            if (authentication != null && authentication.isAuthenticated()
                    && !"anonymousUser".equals(authentication.getPrincipal())) {

                String username = authentication.getName();
                return userRepository.findByUsername(username).orElse(null);
            }
        } catch (Exception e) {
            LOGGER.debug("Could not get current user from security context: {}", e.getMessage());
        }

        return null; // No authenticated user (e.g., during registration)
    }

    private User getUserEntityById(Long id) throws EntityNotFoundException {
        return userRepository.findById(id).orElseThrow(()-> new EntityNotFoundException("User",
                "User with id " + id + " was not found"));
    }

    private void validateUniqueUsername(String username) throws EntityAlreadyExistsException {
            if (userRepository.existsByUsername(username)) {
                throw new EntityAlreadyExistsException("User", "Υπάρχει ήδη χρήστης με username "
                        + username);
            }
        }


    public User getCurrentUserOrThrow() throws EntityNotFoundException {
        User currentUser = getCurrentUser();
        if (currentUser == null) {
            throw new EntityNotFoundException("User", "No authenticated user found");
        }
        return currentUser;
    }

    private Specification<User> getSpecsFromFilters(UserFilters filters) {
        return Specification
                .where(UserSpecification.usernameLike(filters.getUsername()))
                .and(UserSpecification.userIsActive(filters.getIsActive()));
    }

}