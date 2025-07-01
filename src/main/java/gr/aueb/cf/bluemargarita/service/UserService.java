package gr.aueb.cf.bluemargarita.service;

import gr.aueb.cf.bluemargarita.core.exceptions.EntityAlreadyExistsException;
import gr.aueb.cf.bluemargarita.core.exceptions.EntityNotFoundException;
import gr.aueb.cf.bluemargarita.core.exceptions.ValidationException;
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
import org.springframework.validation.BindingResult;
import org.springframework.validation.FieldError;

import java.time.LocalDateTime;

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

    @Override
    @Transactional(rollbackFor = Exception.class)
    public UserReadOnlyDTO createUser(UserInsertDTO dto) throws EntityAlreadyExistsException {

        LOGGER.info("Starting user creation for username: {}", dto.username());

        if(userRepository.existsByUsername(dto.username())){
            throw new EntityAlreadyExistsException("User",
                    "Το email " + dto.username() + " χρησιμοποιείται ήδη");
        }

        try {
            User user = mapper.mapUserInsertToModel(dto);
            user.setPassword(passwordEncoder.encode(user.getPassword()));

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
                    "Το email " + dto.username() + " χρησιμοποιείται ήδη");
        }

        User updatedUser = mapper.mapUserUpdateToModel(dto, existingUser);

        // Set current user as last updated by (if available)
        User currentUser = getCurrentUser();
        if (currentUser != null) {
            updatedUser.setLastUpdatedBy(currentUser);
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

        user.setIsActive(false);
        user.setDeletedAt(LocalDateTime.now());

        // Set current user as last updated by (if available)
        User currentUser = getCurrentUser();
        if (currentUser != null) {
            user.setLastUpdatedBy(currentUser);
        }

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

    /**
     * Gets the currently authenticated user from the security context.
     * Returns null if no user is authenticated (e.g., during registration).
     */
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
}