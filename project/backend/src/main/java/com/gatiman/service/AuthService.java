package com.gatiman.service;

import com.gatiman.dto.auth.AuthResponse;
import com.gatiman.dto.auth.LoginRequest;
import com.gatiman.dto.auth.RegisterRequest;
import com.gatiman.dto.auth.UserResponse;
import com.gatiman.entity.User;

import com.gatiman.dto.auth.GoogleAuthRequest;

public interface AuthService {
    AuthResponse login(LoginRequest request);
    AuthResponse register(RegisterRequest request);
    AuthResponse googleLogin(GoogleAuthRequest request);
    UserResponse getCurrentUser(User user);
}
