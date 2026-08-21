import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { profileApi, UpdateProfilePayload, ChangePasswordPayload, NotificationPreferences } from '../api/profileApi';
import { useAuth } from '../context/AuthContext';

export const useProfile = () => {
  return useQuery({
    queryKey: ['user', 'profile'],
    queryFn: profileApi.getProfile,
    staleTime: 10000,
  });
};

export const useProfileMutations = () => {
  const queryClient = useQueryClient();
  const { updateUser } = useAuth();

  const updateProfileMutation = useMutation({
    mutationFn: (payload: UpdateProfilePayload) => profileApi.updateProfile(payload),
    onSuccess: (updated) => {
      queryClient.setQueryData(['user', 'profile'], updated);
      if (updateUser) {
        updateUser({
          id: updated.id,
          email: updated.email,
          firstName: updated.firstName,
          lastName: updated.lastName || '',
          phoneNumber: updated.phoneNumber || '',
          role: updated.role,
        });
      }
      queryClient.invalidateQueries({ queryKey: ['user', 'profile'] });
    },
  });

  const changePasswordMutation = useMutation({
    mutationFn: (payload: ChangePasswordPayload) => profileApi.changePassword(payload),
  });

  const updatePreferencesMutation = useMutation({
    mutationFn: (payload: NotificationPreferences) => profileApi.updateNotificationPreferences(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user', 'profile'] });
    },
  });

  const toggleAvailabilityMutation = useMutation({
    mutationFn: (available: boolean) => profileApi.updateAvailability(available),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user', 'profile'] });
      queryClient.invalidateQueries({ queryKey: ['agent', 'profile'] });
      queryClient.invalidateQueries({ queryKey: ['agents'] });
    },
  });

  return {
    updateProfile: updateProfileMutation.mutate,
    updateProfileAsync: updateProfileMutation.mutateAsync,
    isUpdatingProfile: updateProfileMutation.isPending,
    changePassword: changePasswordMutation.mutate,
    changePasswordAsync: changePasswordMutation.mutateAsync,
    isChangingPassword: changePasswordMutation.isPending,
    updatePreferences: updatePreferencesMutation.mutate,
    updatePreferencesAsync: updatePreferencesMutation.mutateAsync,
    isUpdatingPreferences: updatePreferencesMutation.isPending,
    toggleAvailability: toggleAvailabilityMutation.mutate,
    toggleAvailabilityAsync: toggleAvailabilityMutation.mutateAsync,
    isTogglingAvailability: toggleAvailabilityMutation.isPending,
  };
};
