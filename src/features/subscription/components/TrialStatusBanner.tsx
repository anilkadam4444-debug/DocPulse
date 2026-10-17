import React from 'react';
import { Link } from 'react-router-dom';
import {
  Clock,
  Sparkles,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  Gift,
} from 'lucide-react';
import { DoctorSubscription } from '../../../types/subscription';
import { SUBSCRIPTION_PLANS, getRemainingDays } from '../plans';
import { Button } from '../../../components/ui/Button';

interface TrialStatusBannerProps {
  subscription: DoctorSubscription | null;
  onUpgradeClick?: () => void;
}

export const TrialStatusBanner: React.FC<TrialStatusBannerProps> = ({
  subscription,
  onUpgradeClick,
}) => {
  if (!subscription) return null;

  const isTrial = subscription.status === 'trialing';
  const isActive = subscription.status === 'active';
  const isExpired = subscription.status === 'expired' || subscription.status === 'past_due';

  const endTimestamp = subscription.currentPeriodEndAt || subscription.trialEndAt;
  const remainingDays = getRemainingDays(endTimestamp);

  const formattedEndDate = endTimestamp
    ? new Date(endTimestamp).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    : '';

  const activePlanConfig =
    subscription.planId && subscription.planId !== 'free_trial'
      ? SUBSCRIPTION_PLANS[subscription.planId]
      : null;

  if (isTrial) {
    return (
      <div className="bg-gradient-to-r from-teal-900 via-slate-900 to-slate-900 text-white rounded-2xl p-4 sm:p-5 border border-teal-500/40 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-teal-500/20 text-teal-300 border border-teal-500/30 flex items-center justify-center shrink-0">
            <Gift className="w-5 h-5 text-teal-300" />
          </div>
          <div className="space-y-0.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-black uppercase tracking-wider text-teal-300 bg-teal-950/80 px-2 py-0.5 rounded border border-teal-700/60">
                1-Month Free Trial Active
              </span>
              <span className="text-xs text-amber-300 font-bold flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {remainingDays} {remainingDays === 1 ? 'day' : 'days'} remaining
              </span>
            </div>
            <p className="text-xs text-slate-300">
              Full practice management unlocked until <strong>{formattedEndDate}</strong>. Subscription becomes payable after trial expires.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Link to="/doctor/subscription">
            <Button
              variant="primary"
              size="sm"
              rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
              className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs border-none shadow-sm"
              onClick={onUpgradeClick}
            >
              Choose Plan · Save 20% on Annual
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  if (isActive) {
    return (
      <div className="bg-emerald-50/80 border border-emerald-200/90 text-emerald-950 rounded-2xl p-4 sm:p-4.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <strong className="text-slate-900 font-bold">
                {activePlanConfig?.name || 'Active Paid Subscription'}
              </strong>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-600 text-white">
                Active
              </span>
            </div>
            <p className="text-slate-600 text-[11px] mt-0.5">
              Valid through <strong>{formattedEndDate}</strong> ({remainingDays} days remaining).
            </p>
          </div>
        </div>

        <Link to="/doctor/subscription">
          <Button variant="outline" size="sm" className="text-xs font-semibold shrink-0">
            Manage Subscription
          </Button>
        </Link>
      </div>
    );
  }

  if (isExpired) {
    return (
      <div className="bg-rose-50 border border-rose-200 text-rose-950 rounded-2xl p-4 sm:p-4.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center shrink-0">
            <AlertCircle className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <strong className="text-rose-900 font-bold">Subscription Expired</strong>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-600 text-white">
                Expired {formattedEndDate}
              </span>
            </div>
            <p className="text-slate-600 text-[11px] mt-0.5">
              Please renew your subscription to maintain active online patient bookings and live queue WhatsApp alerts.
            </p>
          </div>
        </div>

        <Link to="/doctor/subscription">
          <Button variant="danger" size="sm" className="text-xs font-bold shrink-0">
            Renew Subscription Now
          </Button>
        </Link>
      </div>
    );
  }

  return null;
};
