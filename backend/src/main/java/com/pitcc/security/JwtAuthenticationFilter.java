package com.pitcc.security;

import com.pitcc.repository.UserRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.List;
import java.util.Optional;
import org.springframework.http.HttpHeaders;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;

public class JwtAuthenticationFilter extends OncePerRequestFilter {

  private static final String BEARER_PREFIX = "Bearer ";

  private final JwtService jwtService;
  private final UserRepository userRepository;

  public JwtAuthenticationFilter(JwtService jwtService, UserRepository userRepository) {
    this.jwtService = jwtService;
    this.userRepository = userRepository;
  }

  @Override
  protected void doFilterInternal(
      HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
      throws ServletException, IOException {
    String header = request.getHeader(HttpHeaders.AUTHORIZATION);
    if (header != null && header.startsWith(BEARER_PREFIX)) {
      String token = header.substring(BEARER_PREFIX.length()).trim();
      jwtService.parse(token).flatMap(this::currentState).ifPresent(this::authenticate);
    }
    filterChain.doFilter(request, response);
  }

  // O perfil vale o que está no banco agora, não o que foi gravado no token na hora do login.
  private Optional<AuthenticatedUser> currentState(AuthenticatedUser fromToken) {
    return userRepository
        .findById(fromToken.id())
        .filter(user -> user.getRole() != null)
        .map(user -> new AuthenticatedUser(user.getId(), user.getRole()));
  }

  private void authenticate(AuthenticatedUser user) {
    UsernamePasswordAuthenticationToken authentication =
        new UsernamePasswordAuthenticationToken(
            user, null, List.of(new SimpleGrantedAuthority("ROLE_" + user.role().name())));
    SecurityContext context = SecurityContextHolder.createEmptyContext();
    context.setAuthentication(authentication);
    SecurityContextHolder.setContext(context);
  }
}
