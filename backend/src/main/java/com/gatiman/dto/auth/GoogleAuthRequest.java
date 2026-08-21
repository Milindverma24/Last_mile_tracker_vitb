package com.gatiman.dto.auth;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GoogleAuthRequest {

    /**
     * Google ID Token / Credential returned by Google Identity Services (GIS SDK).
     */
    @NotBlank(message = "Google ID token or credential is required")
    private String credential;

    /**
     * Account type when registering: B2C (Individual) or B2B (Business / Enterprise).
     */
    private com.gatiman.enums.CustomerType customerType;
    private String companyName;
    private String gstNumber;

    /**
     * Optional client-extracted fields (if testing or frontend decoded).
     */
    private String email;
    private String firstName;
    private String lastName;
    private String pictureUrl;
}
