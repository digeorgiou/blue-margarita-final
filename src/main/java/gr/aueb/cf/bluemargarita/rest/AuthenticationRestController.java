package gr.aueb.cf.bluemargarita.rest;

import gr.aueb.cf.bluemargarita.authentication.AuthenticationService;
import gr.aueb.cf.bluemargarita.core.exceptions.EntityNotAuthorizedException;
import gr.aueb.cf.bluemargarita.dto.authentication.AuthenticationRequestDTO;
import gr.aueb.cf.bluemargarita.dto.authentication.AuthenticationResponseDTO;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthenticationRestController {

    private final AuthenticationService authenticationService;

    @Operation(
            summary = "Authenticate user",
            description = "Authenticates a user and returns a JWT token",
            responses = {
                    @ApiResponse(
                            responseCode = "200",
                            description = "Authentication successful",
                            content = @Content(
                                    mediaType = "application/json",
                                    schema = @Schema(implementation = AuthenticationResponseDTO.class)
                            )
                    ),
                    @ApiResponse(
                            responseCode = "401",
                            description = "Invalid credentials",
                            content = @Content(mediaType = "application/json")
                    )
            }
    )
    @PostMapping("/authenticate")
    public ResponseEntity<AuthenticationResponseDTO> authenticate(
            @Valid @RequestBody AuthenticationRequestDTO authenticationRequestDTO)
            throws EntityNotAuthorizedException {

        AuthenticationResponseDTO response = authenticationService.authenticate(authenticationRequestDTO);
        return new ResponseEntity<>(response, HttpStatus.OK);
    }
}
