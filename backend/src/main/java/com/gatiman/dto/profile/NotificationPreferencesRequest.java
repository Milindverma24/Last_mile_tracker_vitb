package com.gatiman.dto.profile;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificationPreferencesRequest {
    private Boolean orderUpdates;
    private Boolean deliveryUpdates;
    private Boolean rescheduleUpdates;
    private Boolean securityAlerts;
    private Boolean marketing;
    private String language;
    private String timezone;
    private String dateFormat;
}
