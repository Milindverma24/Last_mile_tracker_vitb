export type Role = 'CUSTOMER' | 'DELIVERY_AGENT' | 'ADMIN';

export type OrderStatus =
  | 'CREATED'
  | 'ASSIGNED'
  | 'PICKED_UP'
  | 'IN_TRANSIT'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED'
  | 'FAILED'
  | 'RESCHEDULED'
  | 'CANCELLED';

export type CustomerType = 'B2C' | 'B2B';
export type PaymentType = 'PREPAID' | 'COD';
export type PaymentStatus = 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';
export type RouteType = 'INTRA_ZONE' | 'INTER_ZONE' | 'INTRA_CITY' | 'INTER_CITY' | 'INTER_STATE';
export type VehicleType = 'BIKE' | 'EV_SCOOTER' | 'CAR' | 'VAN' | 'TEMPO' | 'TRUCK';
export type FailureReason =
  | 'CUSTOMER_UNAVAILABLE'
  | 'ADDRESS_NOT_FOUND'
  | 'CUSTOMER_REFUSED'
  | 'ACCESS_ISSUE'
  | 'PHONE_UNREACHABLE'
  | 'WRONG_ADDRESS'
  | 'SECURITY_ACCESS_DENIED'
  | 'WEATHER_DISRUPTION'
  | 'OTHER';
export type RescheduleStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'COMPLETED' | 'CANCELLED';

export interface User {
  id: number;
  uuid: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  address?: string;
  city?: string;
  state?: string;
  pinCode?: string;
  profileImageUrl?: string;
  role: Role;
  status: string;
  active: boolean;
  createdAt: string;
}

export interface AuthResponse {
  token: string;
  tokenType: string;
  user: User;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
}

export interface Area {
  id: number;
  name: string;
  pincode: string;
  zoneId?: number;
  zoneName?: string;
  latitude?: number;
  longitude?: number;
  active: boolean;
}

export interface Zone {
  id: number;
  code: string;
  name: string;
  description?: string;
  city?: string;
  state?: string;
  active: boolean;
  areas?: Area[];
}

export interface RateCardRule {
  id?: number;
  minWeightKg: number;
  maxWeightKg: number;
  basePrice: number;
  perKgRateAboveMin: number;
  additionalWeightUnit?: number;
}

export interface RateCard {
  id: number;
  name: string;
  customerType: CustomerType;
  routeType: RouteType;
  codSurchargeFlat: number;
  codSurchargePercentage: number;
  active: boolean;
  effectiveFrom?: string;
  effectiveTo?: string;
  rules: RateCardRule[];
}

export interface PackageItem {
  id?: number;
  packageDescription?: string;
  lengthCm: number;
  breadthCm: number;
  heightCm: number;
  declaredValue?: number;
}

export interface TrackingEvent {
  id: number;
  orderId: number;
  previousStatus?: OrderStatus;
  newStatus: OrderStatus;
  actorUserId?: number;
  actorName: string;
  actorRole: string;
  remarks?: string;
  latitude?: number;
  longitude?: number;
  deliveryAttemptId?: number;
  eventTimestamp: string;
}

export interface DeliveryAttempt {
  id: number;
  orderId: number;
  attemptNumber: number;
  agentId: number;
  agentName: string;
  status: string;
  failureReason?: FailureReason;
  failureNotes?: string;
  scheduledDate?: string;
  attemptedAt: string;
  startedAt?: string;
  completedAt?: string;
}

export interface Order {
  id: number;
  trackingNumber: string;
  orderNumber: string;
  customerId: number;
  customerName: string;
  customerEmail: string;
  customerType: CustomerType;
  paymentType: PaymentType;
  paymentStatus?: PaymentStatus;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  status: OrderStatus;

  pickupName: string;
  pickupPhone: string;
  pickupAddress: string;
  pickupPincode: string;
  pickupAreaId?: number;
  pickupAreaName?: string;
  pickupZoneId?: number;
  pickupZoneName?: string;

  dropName: string;
  dropPhone: string;
  dropAddress: string;
  dropPincode: string;
  dropAreaId?: number;
  dropAreaName?: string;
  dropZoneId?: number;
  dropZoneName?: string;

  routeType: RouteType;

  actualWeightKg: number;
  volumetricWeightKg: number;
  billableWeightKg: number;

  baseCharge: number;
  codSurcharge: number;
  totalCharge: number;

  assignedAgentId?: number;
  assignedAgentName?: string;
  assignedAgentPhone?: string;
  assignedAgentVehicle?: string;

  rateCardId?: number;
  rateCardName?: string;

  scheduledDeliveryDate?: string;
  rescheduleCount: number;

  packages: PackageItem[];
  trackingHistory?: TrackingEvent[];
  deliveryAttempts?: DeliveryAttempt[];

  createdAt: string;
  updatedAt: string;
}

export interface DeliveryAgent {
  id: number;
  userId: number;
  name: string;
  email: string;
  phoneNumber?: string;
  vehicleType: VehicleType;
  vehicleNumber: string;
  isAvailable: boolean;
  active: boolean;
  maxActiveOrders: number;
  currentActiveOrders: number;
  assignedZoneId?: number;
  assignedZoneName?: string;
  currentLatitude?: number;
  currentLongitude?: number;
  lastLocationUpdate?: string;
  status: string;
}

export interface NotificationItem {
  id: number;
  userId: number;
  orderId?: number;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  read: boolean;
  createdAt: string;
}

export interface ChargePreviewResult {
  pickupZone: string;
  dropZone: string;
  pickupZoneId: number;
  dropZoneId: number;
  pickupAreaId: number;
  dropAreaId: number;
  pickupAreaName: string;
  dropAreaName: string;
  routeType: RouteType;
  customerType: CustomerType;
  paymentType: PaymentType;
  actualWeightKg: number;
  volumetricWeightKg: number;
  billableWeightKg: number;
  baseCharge: number;
  codSurcharge: number;
  totalCharge: number;
  rateCardId: number;
  rateCardName: string;
  weightFormula: string;
}

export interface DashboardStats {
  totalOrders: number;
  todayOrders?: number;
  pendingOrders: number;
  assignedOrders: number;
  inTransitOrders: number;
  outForDelivery: number;
  deliveredOrders: number;
  failedOrders: number;
  rescheduledOrders?: number;
  availableAgents: number;
  totalAgents: number;
  totalRevenue: number;
  b2cCount: number;
  b2bCount: number;
  ordersByStatus: Record<string, number>;
  ordersByZone: Record<string, number>;
}

export interface RescheduleRequest {
  id: number;
  orderId: number;
  trackingNumber: string;
  customerName: string;
  pickupAddress: string;
  dropAddress: string;
  dropZoneName: string;
  requestedDate: string;
  preferredTimeSlot?: string;
  reason?: string;
  rescheduleNotes?: string;
  status: RescheduleStatus;
  requestedByUserId?: number;
  requestedByName?: string;
  reviewedByUserId?: number;
  reviewedByName?: string;
  rejectionReason?: string;
  requestedAt: string;
  reviewedAt?: string;
}

export interface DailyTrendItem {
  date: string;
  totalCount: number;
  deliveredCount: number;
  failedCount: number;
  revenue: number;
}

export interface OrderAnalytics {
  totalOrders: number;
  deliveredOrders: number;
  failedOrders: number;
  rescheduledOrders: number;
  cancelledOrders: number;
  inTransitOrders: number;
  successRate: number;
  failureRate: number;
  rescheduleRate: number;
  dailyTrends: DailyTrendItem[];
  statusDistribution: Record<string, number>;
}

export interface ZoneAnalytics {
  zoneId: number;
  zoneCode: string;
  zoneName: string;
  pickupCount: number;
  dropCount: number;
  deliveredCount: number;
  failedCount: number;
  averageAttempts: number;
  totalCharges: number;
}

export interface AgentPerformance {
  agentId: number;
  agentName: string;
  vehicleNumber: string;
  vehicleType: string;
  assignedZoneName: string;
  currentWorkload: number;
  maxActiveOrders: number;
  assignedTotal: number;
  completedTotal: number;
  failedTotal: number;
  successRate: number;
  averageAttempts: number;
  isAvailable: boolean;
}

export interface FailureAnalytics {
  totalFailures: number;
  failureByReason: Record<string, number>;
  failureByZone: Record<string, number>;
  failureTrends: DailyTrendItem[];
}

export interface RevenueAnalytics {
  totalDeliveryCharges: number;
  baseCharges: number;
  codSurcharges: number;
  b2bCharges: number;
  b2cCharges: number;
  intraZoneCharges: number;
  interZoneCharges: number;
}

export interface AuditLogItem {
  id: number;
  actor: string;
  role: string;
  action: string;
  entityType: string;
  entityId?: number;
  description: string;
  timestamp: string;
}
