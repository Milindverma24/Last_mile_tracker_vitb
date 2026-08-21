import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { rateCardApi } from '../api/rateCardApi';
import { RateCard } from '../types';

export function useRateCards() {
  return useQuery({
    queryKey: ['rateCards'],
    queryFn: () => rateCardApi.getAllRateCards(),
  });
}

export function useRateCardMutations() {
  const queryClient = useQueryClient();

  const createRateCard = useMutation({
    mutationFn: (payload: Partial<RateCard>) => rateCardApi.createRateCard(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['rateCards'] }),
  });

  const updateRateCard = useMutation({
    mutationFn: ({ id, payload }: { id: number | string; payload: Partial<RateCard> }) =>
      rateCardApi.updateRateCard(id, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['rateCards'] }),
  });

  return { createRateCard, updateRateCard };
}
