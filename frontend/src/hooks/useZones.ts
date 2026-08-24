import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { zoneApi, CreateAreaPayload, CreateZonePayload } from '../api/zoneApi';

export function useZones() {
  return useQuery({
    queryKey: ['zones'],
    queryFn: () => zoneApi.getAllZones(),
  });
}

export function useZoneMutations() {
  const queryClient = useQueryClient();

  const createZone = useMutation({
    mutationFn: (payload: CreateZonePayload) => zoneApi.createZone(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['zones'] }),
  });

  const updateZone = useMutation({
    mutationFn: ({ id, payload }: { id: number | string; payload: CreateZonePayload }) =>
      zoneApi.updateZone(id, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['zones'] }),
  });

  const deleteZone = useMutation({
    mutationFn: (id: number | string) => zoneApi.deleteZone(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['zones'] }),
  });

  const addArea = useMutation({
    mutationFn: ({ zoneId, payload }: { zoneId: number | string; payload: CreateAreaPayload }) =>
      zoneApi.addAreaToZone(zoneId, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['zones'] }),
  });

  return { createZone, updateZone, deleteZone, addArea };
}
