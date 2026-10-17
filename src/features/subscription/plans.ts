import type { PlanId } from '../../types/subscription.ts';

export interface SubscriptionPlanConfig {
  id: PlanId;
  name: string;
  badge?: string;
  accessPeriodLabel: string;
  durationMonths: number;
  durationDays: number;
  totalPriceInr: number;
  totalPricePaise: number;
  effectiveMonthlyInr: number;
  discountPercent: number;
  isPopular?: boolean;
  isBestValue?: boolean;
  features: string[];
}

export const SUBSCRIPTION_PLANS: Record<PlanId, SubscriptionPlanConfig> = {
  monthly: {
    id: 'monthly',
    name: 'Monthly Plan',
    accessPeriodLabel: '1 Month',
    durationMonths: 1,
    durationDays: 30,
    totalPriceInr: 1500,
    totalPricePaise: 150000,
    effectiveMonthlyInr: 1500,
    discountPercent: 0,
    features: [
      'Full Clinic Practice Dashboard',
      'Unified Patient Queue & Live OPD Console',
      'Atomic Sequential Token Management (T-01, T-02)',
      'Public Directory Listing & Patient Discovery',
      'Multiple Practice Locations Support',
      'Automated WhatsApp Consultation Alerts',
      'Standard Technical Support',
    ],
  },
  quarterly: {
    id: 'quarterly',
    name: 'Quarterly Plan',
    badge: '5% OFF',
    accessPeriodLabel: '3 Months',
    durationMonths: 3,
    durationDays: 90,
    totalPriceInr: 4275,
    totalPricePaise: 427500,
    effectiveMonthlyInr: 1425,
    discountPercent: 5,
    features: [
      'All Monthly Plan Capabilities Included',
      'Save ₹225 Every Quarter (₹1,425/mo)',
      'Quarterly OPD Footfall & Booking Analytics',
      'Multi-Shift Consultation Scheduling',
      'Priority Email & Chat Support',
    ],
  },
  half_yearly: {
    id: 'half_yearly',
    name: 'Half-Yearly Plan',
    badge: '10% OFF',
    accessPeriodLabel: '6 Months',
    durationMonths: 6,
    durationDays: 180,
    totalPriceInr: 8100,
    totalPricePaise: 810000,
    effectiveMonthlyInr: 1350,
    discountPercent: 10,
    isPopular: true,
    features: [
      'All Quarterly Capabilities Included',
      'Save ₹900 Every 6 Months (₹1,350/mo)',
      'Multi-Location Practice Optimization',
      'Custom Reception Standee Artwork',
      'Dedicated Account Assistance',
    ],
  },
  yearly: {
    id: 'yearly',
    name: 'Yearly Plan',
    badge: '20% OFF · Largest Discount',
    accessPeriodLabel: '12 Months',
    durationMonths: 12,
    durationDays: 365,
    totalPriceInr: 14400,
    totalPricePaise: 1440000,
    effectiveMonthlyInr: 1200,
    discountPercent: 20,
    isBestValue: true,
    features: [
      'All DocPulse Features Unlocked',
      'Save ₹3,600 Annually (Only ₹1,200/mo)',
      'Guaranteed Lowest Rate Lock-In',
      'Custom Clinic QR Stand Artwork Included',
      'Priority 24/7 Phone & WhatsApp Support',
    ],
  },
};

export const ORDERED_PLAN_IDS: PlanId[] = ['monthly', 'quarterly', 'half_yearly', 'yearly'];

/**
 * Calculates a clean 1 calendar-month trial end date.
 * E.g., Oct 17 -> Nov 17. Handles end-of-month boundaries properly.
 */
export function calculateOneMonthTrialEnd(startDate: Date = new Date()): Date {
  const endDate = new Date(startDate);
  const currentDay = endDate.getDate();
  endDate.setMonth(endDate.getMonth() + 1);
  if (endDate.getDate() < currentDay) {
    endDate.setDate(0);
  }
  return endDate;
}

/**
 * Calculates remaining trial or subscription days.
 */
export function getRemainingDays(endDateIso: string): number {
  if (!endDateIso) return 0;
  const diffMs = new Date(endDateIso).getTime() - Date.now();
  return Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
}
