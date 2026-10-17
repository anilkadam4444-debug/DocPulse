import React from 'react';
import { Check, Sparkles, Shield, ArrowRight, Zap } from 'lucide-react';
import { SubscriptionPlanConfig } from '../plans';
import { Button } from '../../../components/ui/Button';

interface SubscriptionPlanCardProps {
  plan: SubscriptionPlanConfig;
  isCurrentPlan: boolean;
  onSelectPlan: (plan: SubscriptionPlanConfig) => void;
  isLoading?: boolean;
}

export const SubscriptionPlanCard: React.FC<SubscriptionPlanCardProps> = ({
  plan,
  isCurrentPlan,
  onSelectPlan,
  isLoading = false,
}) => {
  const isYearly = plan.id === 'yearly';

  return (
    <div
      className={`relative rounded-2xl flex flex-col justify-between transition-all duration-200 ${
        isYearly
          ? 'bg-gradient-to-b from-teal-900 via-slate-900 to-slate-900 text-white border-2 border-teal-500 shadow-xl ring-2 ring-teal-500/20'
          : plan.isPopular
          ? 'bg-white text-slate-900 border-2 border-teal-600 shadow-md'
          : 'bg-white text-slate-900 border border-slate-200 shadow-xs hover:border-slate-300'
      } p-6 sm:p-7`}
    >
      {/* Floating Badges */}
      <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 flex items-center gap-1.5">
        {plan.badge && (
          <span
            className={`px-3 py-1 rounded-full text-xs font-black tracking-wide uppercase shadow-sm ${
              isYearly
                ? 'bg-amber-400 text-slate-950 ring-2 ring-amber-300/40'
                : 'bg-teal-600 text-white'
            }`}
          >
            {plan.badge}
          </span>
        )}
        {isCurrentPlan && (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500 text-white shadow-xs">
            Current Plan
          </span>
        )}
      </div>

      <div>
        {/* Header Title & Duration */}
        <div className="pt-2">
          <div className="flex items-center justify-between">
            <h3
              className={`text-lg font-extrabold ${
                isYearly ? 'text-white' : 'text-slate-900'
              }`}
            >
              {plan.name}
            </h3>
            {isYearly && (
              <span className="flex items-center gap-1 text-[11px] font-bold text-amber-300 bg-amber-400/10 px-2 py-0.5 rounded-md border border-amber-400/20">
                <Sparkles className="w-3 h-3" />
                Recommended
              </span>
            )}
          </div>
          <p
            className={`text-xs mt-1 ${
              isYearly ? 'text-teal-200' : 'text-slate-500'
            }`}
          >
            Full clinic practice access for {plan.accessPeriodLabel}
          </p>
        </div>

        {/* Pricing Zone */}
        <div className="my-6 pb-6 border-b border-slate-100/10">
          {/* Effective Monthly Price */}
          <div className="flex items-baseline gap-1">
            <span className="text-3xl sm:text-4xl font-black font-mono tracking-tight">
              ₹{plan.effectiveMonthlyInr.toLocaleString('en-IN')}
            </span>
            <span
              className={`text-xs font-medium ${
                isYearly ? 'text-slate-300' : 'text-slate-500'
              }`}
            >
              /month
            </span>
          </div>

          {/* Prominent Total Payable Amount */}
          <div className="mt-2 flex items-center justify-between">
            <div
              className={`text-xs font-bold px-2 py-1 rounded-lg ${
                isYearly
                  ? 'bg-teal-800/60 text-teal-200 border border-teal-700/50'
                  : 'bg-slate-100 text-slate-700'
              }`}
            >
              Total Payable: ₹{plan.totalPriceInr.toLocaleString('en-IN')}
            </div>

            {plan.discountPercent > 0 && (
              <span className="text-xs font-semibold text-emerald-500">
                {plan.discountPercent}% Savings
              </span>
            )}
          </div>
        </div>

        {/* Feature List */}
        <ul className="space-y-3 text-xs mb-6">
          {plan.features.map((feature, idx) => (
            <li key={idx} className="flex items-start gap-2.5">
              <div
                className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                  isYearly
                    ? 'bg-teal-500/20 text-teal-300'
                    : 'bg-teal-100 text-teal-700'
                }`}
              >
                <Check className="w-2.5 h-2.5 stroke-[3]" />
              </div>
              <span
                className={`leading-relaxed ${
                  isYearly ? 'text-slate-200' : 'text-slate-600'
                }`}
              >
                {feature}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {/* Action CTA Button */}
      <div className="pt-2">
        <Button
          variant={isYearly ? 'primary' : plan.isPopular ? 'primary' : 'outline'}
          size="md"
          onClick={() => onSelectPlan(plan)}
          isLoading={isLoading}
          rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
          className={`w-full justify-center text-xs font-bold py-2.5 ${
            isYearly
              ? 'bg-teal-500 hover:bg-teal-400 text-slate-950 font-black shadow-md border-none'
              : ''
          }`}
        >
          {isCurrentPlan ? 'Extend Current Plan' : `Subscribe ${plan.accessPeriodLabel}`}
        </Button>
      </div>
    </div>
  );
};
