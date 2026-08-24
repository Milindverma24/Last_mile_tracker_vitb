package com.gatiman.dto.auth;

import com.gatiman.enums.CustomerType;
import com.gatiman.enums.Role;
import com.gatiman.enums.VehicleType;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RegisterRequest {

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    private String email;

    @NotBlank(message = "Password is required")
    @Size(min = 6, message = "Password must be at least 6 characters")
    private String password;

    @NotBlank(message = "First name is required")
    private String firstName;

    private String lastName;

    private String phoneNumber;

    @Builder.Default
    private Role role = Role.CUSTOMER;

    // Personal Contact & Address Information
    private String address;
    private String city;
    private String state;
    private String pinCode;

    // Optional customer specific fields
    private CustomerType customerType;
    private String companyName;
    private String gstNumber;

    // Optional agent specific fields
    private VehicleType vehicleType;
    private String vehicleNumber;
    private Long assignedZoneId;
}
