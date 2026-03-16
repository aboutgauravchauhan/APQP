package com.apqp.main.auth.dto;

public record AuthResponse(
    String accessToken,
    String tokenType,
    Long userId,
    String email,
    String fullName,
    String employeeCode,
    String roleCode
) {
    public AuthResponse(String token, Long userId, String email, String fullName, String empCode, String role) {
        this(token, "Bearer", userId, email, fullName, empCode, role);
    }
}
