package com.apqp.main.auth.controller;

import com.apqp.main.auth.dto.AuthResponse;
import com.apqp.main.auth.dto.LoginRequest;
import com.apqp.main.auth.security.CustomUserDetailsService;
import com.apqp.main.auth.security.JwtTokenProvider;
import com.apqp.main.auth.security.UserPrincipal;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthenticationManager authManager;
    private final JwtTokenProvider tokenProvider;
    private final CustomUserDetailsService userDetailsService;

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        Authentication auth = authManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.email(), request.password()));

        UserPrincipal principal = (UserPrincipal) auth.getPrincipal();
        String token = tokenProvider.generateToken(principal);
        String role = principal.getAuthorities().iterator().next().getAuthority().replace("ROLE_", "");

        return ResponseEntity.ok(new AuthResponse(
                token, principal.getId(), principal.getEmail(),
                principal.getEmployeeCode(), principal.getEmployeeCode(), role));
    }

    @GetMapping("/me")
    public ResponseEntity<UserPrincipal> getCurrentUser(Authentication auth) {
        return ResponseEntity.ok((UserPrincipal) auth.getPrincipal());
    }
}
