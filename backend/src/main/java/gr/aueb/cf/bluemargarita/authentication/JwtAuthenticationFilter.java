package gr.aueb.cf.bluemargarita.authentication;

import gr.aueb.cf.bluemargarita.security.JwtService;
import io.jsonwebtoken.ExpiredJwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private static final Logger LOGGER = LoggerFactory.getLogger(JwtAuthenticationFilter.class);
    private final JwtService jwtService;
    private final UserDetailsService userDetailsService;

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain) throws ServletException, IOException {

        String authHeader = request.getHeader("Authorization");
        String jwt;
        String username;
        String userRole;

        LOGGER.info("Processing request: {} with auth header: {}", request.getRequestURI(), authHeader);

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }
        //we want what is after "Bearer" + " "
        jwt = authHeader.substring(7);

        LOGGER.info("Extracted JWT: {}", jwt.substring(0, Math.min(20, jwt.length())) + "..."); // ADD THIS

        try {
            username = jwtService.extractSubject(jwt);
            userRole = jwtService.getStringClaim(jwt, "role");

            LOGGER.info("Extracted username: {} and role: {}", username, userRole); // ADD THIS

            if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                UserDetails userDetails = userDetailsService.loadUserByUsername(username);
                LOGGER.info("Loaded user details: {}", userDetails.getUsername()); // ADD THIS

                if (jwtService.isTokenValid(jwt, userDetails)) {
                    LOGGER.info("Token is valid, setting authentication"); // ADD THIS
                    UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                            userDetails,
                            null,
                            userDetails.getAuthorities()
                    );
                    authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    SecurityContextHolder.getContext().setAuthentication(authToken);
                } else {
                    LOGGER.warn("Token is not valid for request: {}", request.getRequestURI());
                }
            }
        } catch (Exception e) {
            LOGGER.error("ERROR: Exception in JWT processing: ", e); // CHANGE TO ERROR
            response.setStatus(HttpStatus.FORBIDDEN.value());
            response.setContentType("application/json");
            String jsonBody = "{\"code\": \"invalidToken\", \"description\":\"" + e.getMessage() + "\"}";
            response.getWriter().write(jsonBody);
            return;
        }
        filterChain.doFilter(request, response);
    }
}
