package com.medicare360.security;

import com.medicare360.entity.User;
import com.medicare360.repository.UserRepository;
import io.jsonwebtoken.Claims;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Optional;

@Component
public class JwtAuthFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final TokenBlacklistService tokenBlacklistService;
    private final UserRepository userRepository;

    public JwtAuthFilter(JwtService jwtService,
                         TokenBlacklistService tokenBlacklistService,
                         UserRepository userRepository) {
        this.jwtService = jwtService;
        this.tokenBlacklistService = tokenBlacklistService;
        this.userRepository = userRepository;
    }

    @Override
    protected void doFilterInternal(@NonNull HttpServletRequest request,
                                    @NonNull HttpServletResponse response,
                                    @NonNull FilterChain filterChain)
            throws ServletException, IOException {

        String authHeader = request.getHeader("Authorization");

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        String token = authHeader.substring(7);

        try {
            Claims claims = jwtService.validateToken(token);
            if (claims == null) {
                filterChain.doFilter(request, response);
                return;
            }

            String tokenType = jwtService.extractType(claims);
            if (!"access".equals(tokenType)) {
                filterChain.doFilter(request, response);
                return;
            }

            String jti = jwtService.extractJti(claims);
            if (tokenBlacklistService.isBlacklisted(jti)) {
                filterChain.doFilter(request, response);
                return;
            }

            String userId = jwtService.extractUserId(claims);
            Optional<User> userOpt = userRepository.findById(userId);
            if (userOpt.isEmpty()) {
                filterChain.doFilter(request, response);
                return;
            }

            User user = userOpt.get();
            if (!user.isActive()) {
                filterChain.doFilter(request, response);
                return;
            }

            UserPrincipal userPrincipal = new UserPrincipal(
                    user.getId(),
                    user.getEmail(),
                    user.getRole(),
                    user.isActive()
            );

            UsernamePasswordAuthenticationToken authToken =
                    new UsernamePasswordAuthenticationToken(userPrincipal, null, userPrincipal.getAuthorities());
            authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

            SecurityContextHolder.getContext().setAuthentication(authToken);

        } catch (Exception e) {
            // On any failure, continue chain without setting auth — Spring Security returns 401
        }

        filterChain.doFilter(request, response);
    }
}
