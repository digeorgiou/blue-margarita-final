package gr.aueb.cf.bluemargarita.rest;

import gr.aueb.cf.bluemargarita.authentication.AuthenticationService;
import gr.aueb.cf.bluemargarita.core.exceptions.EntityNotAuthorizedException;
import gr.aueb.cf.bluemargarita.dto.authentication.AuthenticationRequestDTO;
import gr.aueb.cf.bluemargarita.dto.authentication.AuthenticationResponseDTO;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Authentication", description = "Authentication endpoints for login and token management")
public class AuthenticationRestController {

    private final AuthenticationService authenticationService;

    @Operation(
            summary = "Authenticate user",
            description = "Authenticates a user with username and password, returns a JWT token if successful",
            responses = {
                    @ApiResponse(
                            responseCode = "200",
                            description = "Authentication successful - JWT token returned",
                            content = @Content(
                                    mediaType = "application/json",
                                    schema = @Schema(implementation = AuthenticationResponseDTO.class)
                            )
                    ),
                    @ApiResponse(
                            responseCode = "400",
                            description = "Bad request - validation errors in request body",
                            content = @Content(mediaType = "application/json")
                    ),
                    @ApiResponse(
                            responseCode = "401",
                            description = "Unauthorized - invalid credentials",
                            content = @Content(mediaType = "application/json")
                    ),
                    @ApiResponse(
                            responseCode = "500",
                            description = "Internal server error",
                            content = @Content(mediaType = "application/json")
                    )
            }
    )
    @PostMapping("/authenticate")
    public ResponseEntity<?> authenticate(
            @Valid @RequestBody AuthenticationRequestDTO authenticationRequestDTO,
            BindingResult bindingResult) {

        try {
            // Log authentication attempt (without sensitive data)
            log.info("Authentication attempt for username: {}", authenticationRequestDTO.username());

            // Validate request
            if (bindingResult.hasErrors()) {
                log.warn("Authentication failed due to validation errors for username: {}",
                        authenticationRequestDTO.username());

                Map<String, String> errorResponse = new HashMap<>();
                errorResponse.put("error", "Validation failed");
                errorResponse.put("message", "Invalid request data");
                return ResponseEntity.badRequest().body(errorResponse);
            }

            // Authenticate user
            AuthenticationResponseDTO response = authenticationService.authenticate(authenticationRequestDTO);

            log.info("Authentication successful for username: {}", authenticationRequestDTO.username());
            return ResponseEntity.ok(response);

        } catch (EntityNotAuthorizedException e) {
            log.warn("Authentication failed for username: {} - {}",
                    authenticationRequestDTO.username(), e.getMessage());

            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Authentication failed");
            errorResponse.put("message", "Invalid username or password");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(errorResponse);

        } catch (Exception e) {
            log.error("Unexpected error during authentication for username: {}",
                    authenticationRequestDTO.username(), e);

            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Internal server error");
            errorResponse.put("message", "An unexpected error occurred");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    @Operation(
            summary = "Validate token",
            description = "Validates if the provided JWT token is still valid",
            responses = {
                    @ApiResponse(
                            responseCode = "200",
                            description = "Token is valid"
                    ),
                    @ApiResponse(
                            responseCode = "401",
                            description = "Token is invalid or expired"
                    )
            }
    )
    @GetMapping("/validate")
    public ResponseEntity<Void> validateToken() {
        // If this endpoint is reached, the JWT filter has already validated the token
        return ResponseEntity.ok().build();
    }

    @Operation(
            summary = "Logout user",
            description = "Logout endpoint (token invalidation handled on client side for stateless JWT)",
            responses = {
                    @ApiResponse(
                            responseCode = "200",
                            description = "Logout successful"
                    )
            }
    )
    @PostMapping("/logout")
    public ResponseEntity<Void> logout() {
        // For stateless JWT, logout is typically handled on the client side
        // by removing the token from storage
        log.info("Logout endpoint called");
        return ResponseEntity.ok().build();
    }
}
