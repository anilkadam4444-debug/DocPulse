import React from 'react';
import {
  ShieldCheck,
  Building2,
  Clock,
  Sparkles,
  Lock,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import { RegistrationStep } from './types';
import { Card } from '../../components/ui/Card';

interface WizardInfoSidebarProps {
  currentStep: RegistrationStep;
}

export const WizardInfoSidebar: React.FC<WizardInfoSidebarProps> = ({ currentStep }) => {
  return (
    <aside aria-label="Registration Guidance" className="space-y-4">
      {/* 30-Day Trial Callout */}
      <Card variant="default" className="p-5 border-slate-200/90 space-y-3 bg-white">
        <div className="flex items-center gap-2 text-teal-800 text-xs font-bold uppercase tracking-wider">
          <Sparkles className="w-4 h-4 text-teal-600" />
          <span>Practice Onboarding</span>
        </div>
        <h3 className="text-sm font-bold text-slate-900 leading-snug">
          One Doctor · One Account · Full Clinical Autonomy
        </h3>
        <p className="text-xs text-slate-600 leading-relaxed">
          Every doctor is an independent account holder and tenant. Your clinic locations and patient
          records belong exclusively to your medical practice.
        </p>

        <div className="pt-2 border-t border-slate-100 space-y-2 text-xs text-slate-600">
          <div className="flex items-start gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 shrink-0 mt-0.5" />
            <span>30 days free unrestricted access</span>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 shrink-0 mt-0.5" />
            <span>Zero commission on patient consultation fees</span>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 shrink-0 mt-0.5" />
            <span>No credit card required to onboard</span>
          </div>
        </div>
      </Card>

      {/* Dynamic Contextual Guidance based on active step */}
      {currentStep === 1 && (
        <Card variant="subtle" className="p-4 space-y-2 text-xs text-slate-600">
          <div className="flex items-center gap-1.5 font-bold text-slate-900">
            <Lock className="w-3.5 h-3.5 text-teal-700" />
            <span>Account Security Standards</span>
          </div>
          <p className="leading-relaxed">
            Your WhatsApp mobile number is used for OTP logins, emergency schedule change alerts,
            and clinic notifications. Password must contain at least 8 characters with both letters
            and numbers.
          </p>
        </Card>
      )}

      {currentStep === 2 && (
        <Card variant="subtle" className="p-4 space-y-2 text-xs text-slate-600">
          <div className="flex items-center gap-1.5 font-bold text-slate-900">
            <ShieldCheck className="w-3.5 h-3.5 text-teal-700" />
            <span>Medical Council Verification</span>
          </div>
          <p className="leading-relaxed">
            Provide your valid NMC or State Medical Council registration number. In production,
            credentials undergo standard medical registry validation before displaying verified
            status to patients.
          </p>
        </Card>
      )}

      {currentStep === 3 && (
        <Card variant="subtle" className="p-4 space-y-2 text-xs text-slate-600">
          <div className="flex items-center gap-1.5 font-bold text-slate-900">
            <Building2 className="w-3.5 h-3.5 text-teal-700" />
            <span>Why City is Mandatory</span>
          </div>
          <p className="leading-relaxed">
            DocPulse uses mandatory city-first patient discovery. Patients select their city first
            (e.g. Mumbai, Bengaluru, Pune) to ensure local proximity and eliminate irrelevant
            national search noise.
          </p>
        </Card>
      )}

      {currentStep === 4 && (
        <Card variant="subtle" className="p-4 space-y-2 text-xs text-slate-600">
          <div className="flex items-center gap-1.5 font-bold text-slate-900">
            <Clock className="w-3.5 h-3.5 text-teal-700" />
            <span>Average Duration Impact</span>
          </div>
          <p className="leading-relaxed">
            Your configured average duration powers the queue engine: calculating patient token
            arrival estimates and live theoretical OPD capacity. Actual clinical consultation lengths
            may vary per case.
          </p>
        </Card>
      )}

      {currentStep === 5 && (
        <Card variant="subtle" className="p-4 space-y-2 text-xs text-slate-600">
          <div className="flex items-center gap-1.5 font-bold text-slate-900">
            <ShieldCheck className="w-3.5 h-3.5 text-teal-700" />
            <span>Secure Firebase Cloud Setup</span>
          </div>
          <p className="leading-relaxed">
            Submitting completes your doctor tenant setup: creating your Firebase Authentication account,
            dispatching an email verification link, and initializing your doctor profile in Cloud Firestore.
          </p>
        </Card>
      )}
    </aside>
  );
};
