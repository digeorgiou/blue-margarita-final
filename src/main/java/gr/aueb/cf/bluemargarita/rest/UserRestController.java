package gr.aueb.cf.bluemargarita.rest;

import gr.aueb.cf.bluemargarita.core.exceptions.EntityAlreadyExistsException;
import gr.aueb.cf.bluemargarita.core.exceptions.EntityNotFoundException;
import gr.aueb.cf.bluemargarita.core.exceptions.ValidationException;
import gr.aueb.cf.bluemargarita.dto.user.UserInsertDTO;
import gr.aueb.cf.bluemargarita.dto.user.UserReadOnlyDTO;
import gr.aueb.cf.bluemargarita.dto.user.UserUpdateDTO;
import gr.aueb.cf.bluemargarita.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class UserRestController {

    private final UserService userService;

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
    public ResponseEntity<UserReadOnlyDTO> getUserById(@PathVariable Long id)
            throws EntityNotFoundException {

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
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) throws EntityNotFoundException {
        userService.deleteUser(id);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }
}
