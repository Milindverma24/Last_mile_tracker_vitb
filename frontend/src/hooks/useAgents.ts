import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { agentApi } from '../api/agentApi';

export function useAgents() {
  return useQuery({
    queryKey: ['agents'],
    queryFn: () => agentApi.getAllAgents(),
  });
}

export function useAgentProfile() {
  return useQuery({
    queryKey: ['agentProfile'],
    queryFn: () => agentApi.getMyProfile(),
  });
}

export function useAgentMutations() {
  const queryClient = useQueryClient();

  const toggleAvailability = useMutation({
    mutationFn: (isAvailable: boolean) => agentApi.toggleMyAvailability(isAvailable),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agentProfile'] });
      queryClient.invalidateQueries({ queryKey: ['agents'] });
    },
  });

  const updateLocation = useMutation({
    mutationFn: ({ lat, lng }: { lat: number; lng: number }) => agentApi.updateMyLocation(lat, lng),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agentProfile'] });
      queryClient.invalidateQueries({ queryKey: ['agents'] });
    },
  });

  return {
    toggleAvailability,
    updateLocation,
  };
}
