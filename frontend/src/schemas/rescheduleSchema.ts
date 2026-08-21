import { z } from 'zod';

export const rescheduleSchema = z.object({
  requestedDate: z.string().min(1, 'Please select a reschedule date'),
  preferredTimeSlot: z.string().min(1, 'Please select a preferred delivery window'),
  reason: z.string().optional(),
  rescheduleNotes: z.string().optional(),
});

export const failDeliverySchema = z.object({
  failureReason: z.enum([
    'CUSTOMER_UNAVAILABLE',
    'INCORRECT_ADDRESS',
    'CUSTOMER_REJECTED',
    'SECURITY_ACCESS_DENIED',
    'WEATHER_DISRUPTION',
  ]),
  failureNotes: z.string().optional(),
});

export type RescheduleFormData = z.infer<typeof rescheduleSchema>;
export type FailDeliveryFormData = z.infer<typeof failDeliverySchema>;
