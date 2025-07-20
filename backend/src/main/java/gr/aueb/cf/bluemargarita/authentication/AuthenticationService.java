package gr.aueb.cf.bluemargarita.authentication;

import gr.aueb.cf.bluemargarita.core.exceptions.EntityNotAuthorizedException;
import gr.aueb.cf.bluemargarita.dto.authentication.AuthenticationRequestDTO;
import gr.aueb.cf.bluemargarita.dto.authentication.AuthenticationResponseDTO;
import gr.aueb.cf.bluemargarita.model.User;
import gr.aueb.cf.bluemargarita.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import gr.aueb.cf.bluemargarita.security.JwtService;

@Service
@RequiredArgsConstructor
public class AuthenticationService {

    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final UserRepository userRepository;


    public AuthenticationResponseDTO authenticate(AuthenticationRequestDTO dto)
            throws EntityNotAuthorizedException {

        // Validates username/password against database
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(dto.username(),
                        dto.password()));

        User user = userRepository.findByUsername(authentication.getName())
                .orElseThrow(() -> new EntityNotAuthorizedException("User",
                        "User not authorized"));

        String token = jwtService.generateToken(authentication.getName(), user.getRole().name());
        return new AuthenticationResponseDTO(user.getUsername(),
                token);
    }
}
