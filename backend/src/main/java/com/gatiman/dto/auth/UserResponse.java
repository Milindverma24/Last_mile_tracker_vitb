package com.gatiman.dto.auth;

import com.gatiman.enums.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserResponse {
    private Long id;
    private String uuid;
    private String email;
    private String firstName;
    private String lastName;
    private String phoneNumber;
    private String address;
    private String city;
    private String state;
    private String pinCode;
    private String profileImageUrl;
    private Role role;
    private String status;
    private Boolean active;
    private Instant createdAt;
}
