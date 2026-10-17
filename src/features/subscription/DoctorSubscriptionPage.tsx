import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  CheckCircle2,
  Clock,
  CreditCard,
  Sparkles,
  ArrowLeft,
  AlertCircle,
  HelpCircle,
  Smartphone,
  Lock,
  Calendar,
  Building,
} from 'lucide-react';
import { useAuth } from '../doctor-auth/AuthContext';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import {
  SUBSCRIPTION_PLANS,
  ORDERED_PLAN_IDS,
  SubscriptionPlanConfig,
  getRemainingDays,
} from './plans';
import {
  subscribeToDoctorSubscription,
  ensureDoctorTrial,
  getDoctorPaymentHistory,
} from './subscriptionService';
import { DoctorSubscription, PaymentRecord } from '../../types/subscription';
import { SubscriptionPlanCard } from './components/SubscriptionPlanCard';
import { UpiPaymentModal } from './components/UpiPaymentModal';
import { PaymentHistoryTable } from './components/PaymentHistoryTable';
import { TrialStatusBanner } from './components/TrialStatusBanner';

export const DoctorSubscriptionPage: React.FC = () => {
  const { user, doctorProfile } = useAuth();

  const [subscription, setSubscription] = useState<DoctorSubscription | null>(null);
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isPaymentsLoading, setIsPaymentsLoading] = useState<boolean>(true);

  // Modal checkout state
  const [selectedPlanForCheckout, setSelectedPlanForCheckout] =
    useState<SubscriptionPlanConfig | null>(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState<boolean>(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Initialize trial idempotently and subscribe to real-time subscription document
  useEffect(() => {
    if (!user?.uid) return;

    let unsub: (() => void) | undefined;

    const init = async () => {
      setIsLoading(true);
      try {
        await ensureDoctorTrial(user.uid);
      } catch (err) {
        console.warn('Trial ensure warning:', err);
      }

      unsub = subscribeToDoctorSubscription(user.uid, (sub) => {
        setSubscription(sub);
        setIsLoading(false);
      });
    };

    init();

    return () => {
      if (unsub) unsub();
    };
  }, [user?.uid]);

  // Fetch payment history
  const loadPayments = async () => {
    if (!user?.uid) return;
    setIsPaymentsLoading(true);
    const list = await getDoctorPaymentHistory(user.uid);
    setPayments(list);
    setIsPaymentsLoading(false);
  };

  useEffect(() => {
    loadPayments();
  }, [user?.uid]);

  const handleSelectPlan = (plan: SubscriptionPlanConfig) => {
    setSelectedPlanForCheckout(plan);
    setIsCheckoutOpen(true);
  };

  const handlePaymentSuccess = (
    updatedSub: DoctorSubscription,
    paymentRecord: PaymentRecord
  ) => {
    setSubscription(updatedSub);
    setPayments((prev) => [paymentRecord, ...prev]);
    setSuccessToast(
      `Payment verified! Your practice subscription is now active through ${new Date(
        updatedSub.currentPeriodEndAt
      ).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })}.`
    );
    setTimeout(() => setSuccessToast(null), 6000);
  };

  const currentPlanId = subscription?.planId;
  const isTrial = subscription?.status === 'trialing';
  const remainingDays = getRemainingDays(
    subscription?.currentPeriodEndAt || subscription?.trialEndAt || ''
  );

  return (
    <div className="bg-slate-50 min-h-screen py-8 lg:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Navigation Breadcrumb & Back Link */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <Link
            to="/doctor/dashboard"
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 text-teal-600" />
            <span>Return to OPD Dashboard</span>
          </Link>

          <div className="flex items-center gap-2 text-xs text-slate-500 font-mono">
            <span>Doctor UID:</span>
            <strong className="text-slate-800">{user?.uid?.slice(0, 14)}...</strong>
          </div>
        </div>

        {/* Global Toast Alert */}
        {successToast && (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-medium flex items-center justify-between shadow-2xs animate-in fade-in">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>{successToast}</span>
            </div>
            <button
              type="button"
              onClick={() => setSuccessToast(null)}
              className="text-emerald-700 hover:text-emerald-950 font-bold ml-2 cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Hero Section: Status & Highlights */}
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <span className="text-xs font-bold uppercase tracking-wider text-teal-700">
            Transparent Pricing · No Silent Charges
          </span>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight">
            Practice Subscription &amp; UPI Billing
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            One subscription covers your entire individual medical practice across all registered clinic locations. Renew conveniently using Google Pay, PhonePe, Paytm, BHIM, or any UPI app.
          </p>
        </div>

        {/* Real-time Trial / Status Banner */}
        <TrialStatusBanner subscription={subscription} />

        {/* Current Subscription Status Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 shadow-xs">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Current Subscription State
              </span>
              <div className="flex flex-wrap items-center gap-3">
                <h2 className="text-xl font-extrabold text-slate-900">
                  {isTrial
                    ? '1-Month Free Trial'
                    : currentPlanId && currentPlanId !== 'free_trial'
                    ? SUBSCRIPTION_PLANS[currentPlanId]?.name
                    : 'Active Practice Account'}
                </h2>
                <span
                  className={`px-3 py-0.5 rounded-full text-xs font-bold ${
                    isTrial
                      ? 'bg-amber-100 text-amber-800 border border-amber-300'
                      : subscription?.status === 'active'
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                      : 'bg-rose-100 text-rose-800 border border-rose-200'
                  }`}
                >
                  {isTrial
                    ? 'Trial Active'
                    : subscription?.status === 'active'
                    ? 'Subscription Active'
                    : 'Expired'}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                {isTrial
                  ? `Your trial gives you full access to online appointment booking and live OPD queues.`
                  : `Your subscription is active. All practice locations and patient queues are operational.`}
              </p>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0 md:pl-6 text-xs">
              <div>
                <span className="text-slate-400 block text-[11px]">Valid Until</span>
                <strong className="text-slate-900 font-mono text-sm block mt-0.5">
                  {subscription?.currentPeriodEndAt
                    ? new Date(subscription.currentPeriodEndAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })
                    : '—'}
                </strong>
              </div>

              <div>
                <span className="text-slate-400 block text-[11px]">Remaining</span>
                <strong
                  className={`font-mono text-sm block mt-0.5 ${
                    remainingDays <= 5 ? 'text-rose-600 font-black' : 'text-slate-900'
                  }`}
                >
                  {remainingDays} Days
                </strong>
              </div>

              <div>
                <span className="text-slate-400 block text-[11px]">Billing Policy</span>
                <span className="text-emerald-700 font-semibold block mt-0.5">
                  Prepaid (No Auto-Debit)
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Pricing Plans Grid */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-teal-700">
                Select Your Access Period
              </span>
              <h2 className="text-xl font-extrabold text-slate-900 mt-0.5">
                Official Doctor Subscription Plans
              </h2>
            </div>
            <p className="text-xs text-slate-500">
              Prices stored as authoritative integer paise. Renewals extend your current end date.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {ORDERED_PLAN_IDS.map((planId) => {
              const plan = SUBSCRIPTION_PLANS[planId];
              const isCurrent = currentPlanId === planId;
              return (
                <SubscriptionPlanCard
                  key={plan.id}
                  plan={plan}
                  isCurrentPlan={isCurrent}
                  onSelectPlan={handleSelectPlan}
                />
              );
            })}
          </div>
        </div>

        {/* Payment History Audit Section */}
        <div className="space-y-3 pt-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-teal-600" />
                <span>Payment &amp; Invoice History</span>
              </h3>
              <p className="text-xs text-slate-500">
                Immutable audit trail of verified UPI subscription transactions.
              </p>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={loadPayments}
              className="text-xs"
            >
              Refresh History
            </Button>
          </div>

          <PaymentHistoryTable payments={payments} isLoading={isPaymentsLoading} />
        </div>

        {/* Frequently Asked Questions (FAQ) & Transparency */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 space-y-5 shadow-xs">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-teal-600" />
            <span>Doctor Billing FAQ &amp; Policy Guarantees</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-slate-600 leading-relaxed">
            <div className="space-y-1.5">
              <h4 className="font-bold text-slate-900">
                1. Will my bank account or card be automatically debited when my trial ends?
              </h4>
              <p>
                <strong>Never.</strong> DocPulse operates strictly on a prepaid UPI basis. We never collect or store your UPI PIN, card numbers, or mandate auto-debits. You decide when and if you wish to renew.
              </p>
            </div>

            <div className="space-y-1.5">
              <h4 className="font-bold text-slate-900">
                2. If I upgrade while on free trial, do I lose my remaining free trial days?
              </h4>
              <p>
                <strong>No.</strong> Your purchased plan period is added on top of your existing trial end date. For example, if you have 20 days remaining on trial and purchase an Annual Plan, your subscription will be valid for 385 days (20 trial days + 365 plan days).
              </p>
            </div>

            <div className="space-y-1.5">
              <h4 className="font-bold text-slate-900">
                3. Do multiple clinic practice locations cost extra?
              </h4>
              <p>
                <strong>No.</strong> Your individual doctor subscription covers all your registered practice locations, schedules, and OPD queues without additional per-location surcharges.
              </p>
            </div>

            <div className="space-y-1.5">
              <h4 className="font-bold text-slate-900">
                4. What UPI apps are supported for payment?
              </h4>
              <p>
                We support all major Indian UPI applications including <strong>Google Pay, PhonePe, Paytm, BHIM, CRED UPI</strong>, as well as desktop dynamic QR code scanning from any Indian banking application.
              </p>
            </div>
          </div>
        </div>

        {/* UPI Checkout Modal */}
        <UpiPaymentModal
          isOpen={isCheckoutOpen}
          plan={selectedPlanForCheckout}
          onClose={() => setIsCheckoutOpen(false)}
          onSuccess={handlePaymentSuccess}
        />
      </div>
    </div>
  );
};
