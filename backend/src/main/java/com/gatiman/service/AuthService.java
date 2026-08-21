package com.gatiman.service;

import com.gatiman.dto.auth.AuthResponse;
import com.gatiman.dto.auth.LoginRequest;
import com.gatiman.dto.auth.RegisterRequest;
import com.gatiman.dto.auth.UserResponse;
import com.gatiman.entity.User;

public interface AuthService {
    AuthResponse login(LoginRequest request);
    AuthResponse register(RegisterRequest request);
    UserResponse getCurrentUser(User user);
}
