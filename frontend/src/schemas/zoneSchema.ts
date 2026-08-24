import { z } from 'zod';

export const zoneSchema = z.object({
  code: z.string().min(2, 'Zone code is required (e.g. DL-SOUTH)'),
  name: z.string().min(3, 'Zone name is required'),
  description: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
});

export const areaSchema = z.object({
  name: z.string().min(2, 'Area name is required'),
  pincode: z.string().regex(/^\d{6}$/, 'PIN code must be 6 digits'),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
});

export type ZoneFormData = z.infer<typeof zoneSchema>;
export type AreaFormData = z.infer<typeof areaSchema>;
