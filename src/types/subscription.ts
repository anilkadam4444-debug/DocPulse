export type SubscriptionStatus =
  | 'trialing'
  | 'active'
  | 'past_due'
  | 'expired'
  | 'cancelled'
  | 'suspended';

export type PlanId = 'monthly' | 'quarterly' | 'half_yearly' | 'yearly';

export interface DoctorSubscription {
  doctorUid: string;
  planId: PlanId | 'free_trial';
  status: SubscriptionStatus;
  trialStartAt: string; // ISO 8601
  trialEndAt: string; // ISO 8601
  currentPeriodStartAt?: string; // ISO 8601
  currentPeriodEndAt: string; // ISO 8601
  lastPaymentId?: string;
  lastPaymentStatus?: 'captured' | 'failed' | 'pending';
  lastPaymentAmountPaise?: number;
  autoRenew?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentRecord {
  paymentId: string;
  doctorUid: string;
  orderId: string;
  planId: PlanId;
  amountPaise: number;
  amountInr: number;
  currency: string; // 'INR'
  paymentMethod: 'upi' | 'card' | 'netbanking' | 'wallet';
  upiApp?: string; // e.g. 'Google Pay', 'PhonePe', 'Paytm', 'BHIM', 'QR Code'
  vpa?: string; // Sanitized VPA e.g. 'dr.kadam@okhdfcbank'
  status: 'captured' | 'failed' | 'pending';
  razorpayPaymentId?: string;
  razorpayOrderId?: string;
  razorpaySignature?: string;
  paidAt: string;
  createdAt: string;
  receiptNumber?: string;
}

export interface RazorpayOrderResponse {
  id: string; // e.g. order_OPD123456789
  entity: string;
  amount: number; // in integer paise
  currency: string;
  receipt: string;
  status: string;
  isMockOrder?: boolean;
}

export interface PaymentVerificationRequest {
  planId: PlanId;
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
  doctorUid: string;
  upiApp?: string;
}

export interface PaymentVerificationResult {
  success: boolean;
  subscription?: DoctorSubscription;
  paymentRecord?: PaymentRecord;
  error?: string;
}
