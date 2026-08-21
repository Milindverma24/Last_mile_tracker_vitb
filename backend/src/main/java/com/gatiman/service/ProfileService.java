package com.gatiman.service;

import com.gatiman.dto.profile.*;
import com.gatiman.entity.User;

public interface ProfileService {
    ProfileResponse getProfile(User user);
    ProfileResponse updateProfile(User user, UpdateProfileRequest request);
    void changePassword(User user, ChangePasswordRequest request);
    NotificationPreferencesDto getNotificationPreferences(User user);
    NotificationPreferencesDto updateNotificationPreferences(User user, NotificationPreferencesRequest request);
    void updateAgentAvailability(User user, boolean available);
}
