import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const registerSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().optional(),
  phoneNumber: z.string().min(10, 'Please enter a valid 10-digit phone number').optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  pinCode: z.string().optional(),
  role: z.enum(['CUSTOMER', 'DELIVERY_AGENT', 'ADMIN']),
  customerType: z.enum(['B2C', 'B2B']).optional(),
  companyName: z.string().optional(),
  gstNumber: z.string().optional(),
  vehicleType: z.enum(['BIKE', 'EV_SCOOTER', 'VAN', 'TRUCK']).optional(),
  vehicleNumber: z.string().optional(),
  assignedZoneId: z.number().optional(),
});

export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
