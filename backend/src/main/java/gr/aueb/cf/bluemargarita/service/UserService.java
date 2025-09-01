package gr.aueb.cf.bluemargarita.service;

import gr.aueb.cf.bluemargarita.core.exceptions.EntityAlreadyExistsException;
import gr.aueb.cf.bluemargarita.core.exceptions.EntityNotFoundException;
import gr.aueb.cf.bluemargarita.dto.user.UserInsertDTO;
import gr.aueb.cf.bluemargarita.dto.user.UserReadOnlyDTO;
import gr.aueb.cf.bluemargarita.dto.user.UserUpdateDTO;
import gr.aueb.cf.bluemargarita.mapper.Mapper;
import gr.aueb.cf.bluemargarita.model.User;
import gr.aueb.cf.bluemargarita.repository.UserRepository;
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
    public UserReadOnlyDTO createUser(UserInsertDTO dto) throws EntityAlreadyExistsException {

        LOGGER.info("Starting user creation for username: {}", dto.username());

        if(userRepository.existsByUsername(dto.username())){
            throw new EntityAlreadyExistsException("User",
                    "Το username " + dto.username() + " χρησιμοποιείται ήδη");
        }

        try {
            User user = mapper.mapUserInsertToModel(dto);
            user.setPassword(passwordEncoder.encode(user.getPassword()));

            User creator = getCurrentUserOrThrow();
            user.setCreatedBy(creator);
            user.setLastUpdatedBy(creator);

            User insertedUser = userRepository.save(user);

            LOGGER.info("User with username = {} inserted with ID = {}", dto.username(), insertedUser.getId());

            return mapper.mapToUserReadOnlyDTO(insertedUser);

        } catch (Exception e) {
            LOGGER.error("Error creating user with username: {}", dto.username(), e);
            throw new RuntimeException("Failed to create user: " + e.getMessage(), e);
        }
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public UserReadOnlyDTO updateUser(UserUpdateDTO dto) throws EntityNotFoundException, EntityAlreadyExistsException {

        User existingUser =
                userRepository.findById(dto.userId()).orElseThrow(()-> new EntityNotFoundException("User",
                        "User with id " + dto.userId() + " was not found"));

        if(! existingUser.getUsername().equals(dto.username()) && userRepository.existsByUsername(dto.username())){
            throw new EntityAlreadyExistsException("User",
                    "Το username " + dto.username() + " χρησιμοποιείται ήδη");
        }

        User updatedUser = mapper.mapUserUpdateToModel(dto, existingUser);

        User updater = getCurrentUserOrThrow();
        updatedUser.setLastUpdatedBy(updater);

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

    public User getCurrentUserOrThrow() throws EntityNotFoundException {
        User currentUser = getCurrentUser();
        if (currentUser == null) {
            throw new EntityNotFoundException("User", "No authenticated user found");
        }
        return currentUser;
    }

}