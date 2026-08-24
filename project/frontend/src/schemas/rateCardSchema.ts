import { z } from 'zod';

export const rateCardRuleSchema = z.object({
  minWeightKg: z.number().nonnegative(),
  maxWeightKg: z.number().positive(),
  basePrice: z.number().nonnegative(),
  perKgRateAboveMin: z.number().nonnegative(),
});

export const rateCardSchema = z.object({
  name: z.string().min(3, 'Rate card title is required'),
  customerType: z.enum(['B2C', 'B2B']),
  routeType: z.enum(['INTRA_ZONE', 'INTER_ZONE']),
  codSurchargeFlat: z.number().nonnegative(),
  codSurchargePercentage: z.number().nonnegative(),
  rules: z.array(rateCardRuleSchema).min(1, 'At least 1 weight slab rule is required'),
});

export type RateCardFormData = z.infer<typeof rateCardSchema>;
