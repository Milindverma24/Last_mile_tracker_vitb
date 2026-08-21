import { z } from 'zod';

export const orderBookingSchema = z.object({
  customerType: z.enum(['B2C', 'B2B']),
  paymentType: z.enum(['PREPAID', 'COD']),

  pickupName: z.string().min(2, 'Pickup contact name is required'),
  pickupPhone: z.string().min(10, 'Pickup phone must be at least 10 digits'),
  pickupAddress: z.string().min(5, 'Full pickup address is required'),
  pickupPincode: z.string().regex(/^\d{6}$/, 'Pickup PIN code must be 6 digits'),

  dropName: z.string().min(2, 'Recipient name is required'),
  dropPhone: z.string().min(10, 'Recipient phone must be at least 10 digits'),
  dropAddress: z.string().min(5, 'Full drop address is required'),
  dropPincode: z.string().regex(/^\d{6}$/, 'Drop PIN code must be 6 digits'),

  lengthCm: z.number().positive('Length must be greater than 0'),
  breadthCm: z.number().positive('Breadth must be greater than 0'),
  heightCm: z.number().positive('Height must be greater than 0'),
  actualWeightKg: z.number().positive('Actual weight must be greater than 0'),

  packageDescription: z.string().optional(),
  declaredValue: z.number().nonnegative().optional(),
});

export type OrderBookingFormData = z.infer<typeof orderBookingSchema>;
