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
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

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

        if(userRepository.existsByUsername(dto.username())){
            throw new EntityAlreadyExistsException("User",
                    "Το email " + dto.username() + " χρησιμοποιείται ήδη");
        }

        User user = mapper.mapUserInsertToModel(dto);

        user.setPassword(passwordEncoder.encode(user.getPassword()));
        user.setCreatedBy(user);
        user.setLastUpdatedBy(user);

        User insertedUser = userRepository.save(user);

        LOGGER.info("User with username = {} inserted", dto.username());

        return mapper.mapToUserReadOnlyDTO(insertedUser);
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
        User savedUser = userRepository.save(updatedUser);

        LOGGER.info("User with id={}, username={} updated", savedUser.getId()
                , savedUser.getUsername());

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
}
