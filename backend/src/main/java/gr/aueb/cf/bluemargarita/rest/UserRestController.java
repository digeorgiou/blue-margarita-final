package gr.aueb.cf.bluemargarita.rest;

import gr.aueb.cf.bluemargarita.core.enums.Role;
import gr.aueb.cf.bluemargarita.core.exceptions.*;
import gr.aueb.cf.bluemargarita.core.filters.Paginated;
import gr.aueb.cf.bluemargarita.core.filters.UserFilters;
import gr.aueb.cf.bluemargarita.dto.supplier.SupplierReadOnlyDTO;
import gr.aueb.cf.bluemargarita.dto.user.UserInsertDTO;
import gr.aueb.cf.bluemargarita.dto.user.UserReadOnlyDTO;
import gr.aueb.cf.bluemargarita.dto.user.UserUpdateDTO;
import gr.aueb.cf.bluemargarita.model.User;
import gr.aueb.cf.bluemargarita.repository.UserRepository;
import gr.aueb.cf.bluemargarita.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserRestController {

    private final UserService userService;
    private final UserRepository userRepository;

    @Operation(
            summary = "Register a new user",
            description = "Creates a new user account. This endpoint is public and doesn't require authentication.",
            responses = {
                    @ApiResponse(
                            responseCode = "201",
                            description = "User created successfully",
                            content = @Content(
                                    mediaType = "application/json",
                                    schema = @Schema(implementation = UserReadOnlyDTO.class)
                            )
                    ),
                    @ApiResponse(
                            responseCode = "400",
                            description = "Validation errors",
                            content = @Content(mediaType = "application/json")
                    ),
                    @ApiResponse(
                            responseCode = "409",
                            description = "User already exists",
                            content = @Content(mediaType = "application/json")
                    )
            }
    )
    @PostMapping("/users/register")
    public ResponseEntity<UserReadOnlyDTO> registerUser(
            @Valid @RequestBody UserInsertDTO userInsertDTO,
            BindingResult bindingResult) throws ValidationException, EntityAlreadyExistsException {

        if (bindingResult.hasErrors()) {
            throw new ValidationException(bindingResult);
        }

        UserReadOnlyDTO userReadOnlyDTO = userService.createUser(userInsertDTO);
        return new ResponseEntity<>(userReadOnlyDTO, HttpStatus.CREATED);
    }

    @Operation(
            summary = "Get user by ID",
            description = "Retrieves user information by user ID. Requires authentication.",
            security = @SecurityRequirement(name = "Bearer Authentication"),
            responses = {
                    @ApiResponse(
                            responseCode = "200",
                            description = "User found",
                            content = @Content(
                                    mediaType = "application/json",
                                    schema = @Schema(implementation = UserReadOnlyDTO.class)
                            )
                    ),
                    @ApiResponse(
                            responseCode = "401",
                            description = "Unauthorized",
                            content = @Content
                    ),
                    @ApiResponse(
                            responseCode = "403",
                            description = "Access Denied",
                            content = @Content
                    ),
                    @ApiResponse(
                            responseCode = "404",
                            description = "User not found",
                            content = @Content
                    )
            }
    )
    @GetMapping("/users/{id}")
    public ResponseEntity<UserReadOnlyDTO> getUserById(@PathVariable Long id,
                                                       Authentication authentication)
            throws EntityNotFoundException, EntityNotAuthorizedException {

        String currentUsername = authentication.getName();
        User currentUser = userRepository.findByUsername(currentUsername)
                .orElseThrow(()-> new EntityNotFoundException("User", "Current user not found"));

        if(!currentUser.getRole().equals(Role.ADMIN) && !currentUser.getId().equals(id)){
            throw new EntityNotAuthorizedException("User", "You can only access your own user data");
        }

        UserReadOnlyDTO userReadOnlyDTO = userService.getUserById(id);
        return new ResponseEntity<>(userReadOnlyDTO, HttpStatus.OK);
    }

    @Operation(
            summary = "Update user",
            description = "Updates an existing user. Requires authentication.",
            security = @SecurityRequirement(name = "Bearer Authentication"),
            responses = {
                    @ApiResponse(
                            responseCode = "200",
                            description = "User updated successfully",
                            content = @Content(
                                    mediaType = "application/json",
                                    schema = @Schema(implementation = UserReadOnlyDTO.class)
                            )
                    ),
                    @ApiResponse(
                            responseCode = "400",
                            description = "Validation errors",
                            content = @Content(mediaType = "application/json")
                    ),
                    @ApiResponse(
                            responseCode = "401",
                            description = "Unauthorized",
                            content = @Content
                    ),
                    @ApiResponse(
                            responseCode = "403",
                            description = "Access Denied",
                            content = @Content
                    ),
                    @ApiResponse(
                            responseCode = "404",
                            description = "User not found",
                            content = @Content
                    ),
                    @ApiResponse(
                            responseCode = "409",
                            description = "Username already exists",
                            content = @Content
                    )
            }
    )
    @PutMapping("/users/update")
    public ResponseEntity<UserReadOnlyDTO> updateUser(
            @Valid @RequestBody UserUpdateDTO userUpdateDTO,
            BindingResult bindingResult) throws ValidationException, EntityNotFoundException, EntityAlreadyExistsException {

        if (bindingResult.hasErrors()) {
            throw new ValidationException(bindingResult);
        }

        UserReadOnlyDTO userReadOnlyDTO = userService.updateUser(userUpdateDTO);
        return new ResponseEntity<>(userReadOnlyDTO, HttpStatus.OK);
    }

    @Operation(
            summary = "Delete user",
            description = "Soft deletes a user (sets isActive to false). Requires authentication.",
            security = @SecurityRequirement(name = "Bearer Authentication"),
            responses = {
                    @ApiResponse(
                            responseCode = "204",
                            description = "User deleted successfully"
                    ),
                    @ApiResponse(
                            responseCode = "401",
                            description = "Unauthorized",
                            content = @Content
                    ),
                    @ApiResponse(
                            responseCode = "403",
                            description = "Access Denied",
                            content = @Content
                    ),
                    @ApiResponse(
                            responseCode = "404",
                            description = "User not found",
                            content = @Content
                    )
            }
    )
    @DeleteMapping("/users/{id}")
    @PreAuthorize("hasAnyRole('ADMIN')")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) throws EntityNotFoundException {
        userService.deleteUser(id);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }

    @Operation(
            summary = "Restore a soft-deleted user",
            description = "Restores a soft-deleted user by making it active again. Only accessible by admins.",
            responses = {
                    @ApiResponse(responseCode = "200", description = "user restored successfully",
                            content = @Content(mediaType = "application/json",
                                    schema = @Schema(implementation = UserReadOnlyDTO.class))
                    ),
                    @ApiResponse(responseCode = "404", description = "user not found"
                    ),
                    @ApiResponse(responseCode = "400", description = "user is already active"
                    ),
                    @ApiResponse(responseCode = "403", description = "Access denied - Admin role required"
                    )
            }
    )

    @PutMapping("/{id}/restore")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserReadOnlyDTO> restoreUser(@PathVariable Long id) throws EntityNotFoundException, EntityInvalidArgumentException {
        UserReadOnlyDTO restoredUser = userService.restoreUser(id);
        return ResponseEntity.ok(restoredUser);
    }

    @Operation(
            summary = "Get users with pagination and filters",
            description = "Retrieves users with pagination and filtering support. Only accessible by admins.",
            responses = {
                    @ApiResponse(
                            responseCode = "200",
                            description = "Paginated list of users",
                            content = @Content(
                                    mediaType = "application/json",
                                    schema = @Schema(implementation = Paginated.class)
                            )
                    )
            }
    )
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Paginated<UserReadOnlyDTO>> getUsersFilteredPaginated(
            @Parameter(description = "Username filter (partial match)")
            @RequestParam(required = false) String username,

            @Parameter(description = "Active status filter")
            @RequestParam(required = false) Boolean isActive,

            @Parameter(description = "Page number (0-based)")
            @RequestParam(required = false, defaultValue = "0") int page,

            @Parameter(description = "Page size")
            @RequestParam(required = false, defaultValue = "20") int pageSize,

            @Parameter(description = "Sort field")
            @RequestParam(required = false, defaultValue = "username") String sortBy,

            @Parameter(description = "Sort direction")
            @RequestParam(required = false, defaultValue = "ASC") String sortDirection) {

        UserFilters filters = UserFilters.builder()
                .username(username)
                .isActive(isActive)
                .build();

        // Set pagination properties
        filters.setPage(page);
        filters.setPageSize(pageSize);
        filters.setSortBy(sortBy);
        filters.setSortDirection(Sort.Direction.valueOf(sortDirection.toUpperCase()));

        Paginated<UserReadOnlyDTO> users = userService.getUsersFilteredPaginated(filters);
        return new ResponseEntity<>(users, HttpStatus.OK);
    }
}
