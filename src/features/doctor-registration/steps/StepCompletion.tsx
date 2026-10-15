import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  CheckCircle2,
  Building2,
  Clock,
  ShieldCheck,
  ArrowRight,
  RotateCcw,
  Sparkles,
  AlertCircle,
  Stethoscope,
  QrCode,
  Printer,
  X,
  CalendarCheck,
  Smartphone,
} from 'lucide-react';
import { RegistrationFormState } from '../types';
import { calculateDailyCapacity } from '../validation';
import { PRACTICE_TYPE_OPTIONS } from '../constants';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';

interface StepCompletionProps {
  formData: RegistrationFormState;
  onReset: () => void;
  onReviewAgain: () => void;
}

export const StepCompletion: React.FC<StepCompletionProps> = ({
  formData,
  onReset,
  onReviewAgain,
}) => {
  const { account, professional, clinic, schedule } = formData;
  const capacity = calculateDailyCapacity(schedule);
  const activeDuration = schedule.isCustomDuration
    ? parseInt(schedule.customDurationMinutes || '15', 10) || 15
    : schedule.avgDurationMinutes;

  const [showQrModal, setShowQrModal] = useState(false);

  const practiceTypeLabel =
    PRACTICE_TYPE_OPTIONS.find((p) => p.id === clinic.practiceType)?.label || clinic.practiceType;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <Card className="p-6 md:p-8 text-center space-y-6 bg-white border-slate-200 shadow-sm">
        {/* Success Icon */}
        <div className="w-16 h-16 rounded-2xl bg-teal-50 border border-teal-200 flex items-center justify-center mx-auto text-teal-600 shadow-xs">
          <CheckCircle2 className="w-10 h-10 stroke-[2]" />
        </div>

        <div className="space-y-2 max-w-lg mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-teal-600" />
            <span>Registration Profile Configured</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Welcome to DocPulse, {account.fullName}!
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            Your independent practice account for <strong>{clinic.clinicName}</strong> in{' '}
            <strong>{clinic.locality}, {clinic.city}</strong> has been structured with a daily capacity of{' '}
            <strong>{capacity.theoreticalCapacity} consultations</strong>.
          </p>
        </div>

        {/* Structured Profile Summary Card */}
        <div className="bg-slate-50 rounded-xl p-4 sm:p-5 border border-slate-200 text-xs max-w-md mx-auto space-y-2.5 text-left">
          <div className="flex justify-between pb-1.5 border-b border-slate-200">
            <span className="text-slate-500">Doctor Tenant:</span>
            <strong className="text-slate-900">{account.fullName}</strong>
          </div>
          <div className="flex justify-between pb-1.5 border-b border-slate-200">
            <span className="text-slate-500">Qualifications:</span>
            <span className="text-slate-900 font-semibold">{professional.qualifications}</span>
          </div>
          <div className="flex justify-between pb-1.5 border-b border-slate-200">
            <span className="text-slate-500">Specialization:</span>
            <strong className="text-slate-900">
              {professional.specialization === 'Other'
                ? professional.customSpecialization
                : professional.specialization}
            </strong>
          </div>
          <div className="flex justify-between pb-1.5 border-b border-slate-200">
            <span className="text-slate-500">Council Reg. No:</span>
            <span className="text-slate-900 font-mono font-semibold">
              {professional.registrationNumber}
            </span>
          </div>
          <div className="flex justify-between pb-1.5 border-b border-slate-200">
            <span className="text-slate-500">Facility Type:</span>
            <span className="text-slate-800">{practiceTypeLabel}</span>
          </div>
          <div className="flex justify-between pb-1.5 border-b border-slate-200">
            <span className="text-slate-500">Clinic Location:</span>
            <span className="text-slate-900 font-medium">
              {clinic.clinicName}, {clinic.locality}, {clinic.city}
            </span>
          </div>
          <div className="flex justify-between pb-1.5 border-b border-slate-200">
            <span className="text-slate-500">Avg Duration &amp; Fee:</span>
            <span className="text-slate-900 font-semibold">
              {activeDuration} mins · ₹{clinic.consultationFee}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">30-Day Free Trial:</span>
            <span className="text-teal-700 font-bold">Activated (₹0 due today)</span>
          </div>
        </div>

        {/* Quick Action Feature Highlights */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-lg mx-auto text-left text-xs">
          <button
            type="button"
            onClick={() => setShowQrModal(true)}
            className="p-3 bg-white rounded-xl border border-slate-200 hover:border-teal-500 hover:shadow-xs transition-all text-left flex items-start gap-2.5 cursor-pointer"
          >
            <QrCode className="w-5 h-5 text-teal-600 shrink-0 mt-0.5" />
            <div>
              <strong className="text-slate-900 block font-semibold">Clinic QR Stand Ready</strong>
              <span className="text-slate-500 text-[11px]">Click to view or print your reception counter QR display</span>
            </div>
          </button>

          <Link
            to="/doctors"
            className="p-3 bg-white rounded-xl border border-slate-200 hover:border-teal-500 hover:shadow-xs transition-all text-left flex items-start gap-2.5"
          >
            <Building2 className="w-5 h-5 text-teal-600 shrink-0 mt-0.5" />
            <div>
              <strong className="text-slate-900 block font-semibold">Patient Discovery Page</strong>
              <span className="text-slate-500 text-[11px]">Preview how patients discover doctors in {clinic.city}</span>
            </div>
          </Link>
        </div>

        {/* Transparent Prototype Notice */}
        <div className="p-3.5 bg-amber-50/90 border border-amber-200 rounded-xl text-xs text-amber-900 max-w-md mx-auto text-left leading-relaxed flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
          <div>
            <strong>Phase 2 Implementation Scope:</strong> As specified in the architecture, no live
            database records or permanent authentication credentials have been created yet. In Step 3
            and beyond, this onboarding payload will connect to Firebase Authentication and Cloud
            Firestore tenant collections.
          </div>
        </div>

        {/* Navigation Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link to="/doctor/dashboard">
            <Button variant="primary" size="md" rightIcon={<ArrowRight className="w-4 h-4" />}>
              Open Doctor Dashboard Console
            </Button>
          </Link>
          <Button variant="outline" size="md" onClick={onReviewAgain}>
            Review Entered Details
          </Button>
          <Button variant="ghost" size="md" onClick={onReset} leftIcon={<RotateCcw className="w-4 h-4" />}>
            Start Over
          </Button>
        </div>
      </Card>

      {/* Reception QR Code Acrylic Stand Modal */}
      {showQrModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-5 border border-slate-200 shadow-xl relative">
            <button
              type="button"
              onClick={() => setShowQrModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              aria-label="Close QR Modal"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center space-y-1">
              <span className="text-[11px] font-bold text-teal-700 uppercase tracking-wider">
                Reception Acrylic Counter Stand Preview
              </span>
              <h3 className="text-lg font-bold text-slate-900">{clinic.clinicName}</h3>
              <p className="text-xs text-slate-500">
                {account.fullName} · {clinic.locality}, {clinic.city}
              </p>
            </div>

            {/* QR Mock Stand View */}
            <div className="bg-slate-50 border-2 border-dashed border-teal-300 rounded-xl p-5 text-center space-y-3">
              <div className="w-36 h-36 bg-white p-3 rounded-xl border border-slate-200 shadow-xs mx-auto flex flex-col items-center justify-center">
                <QrCode className="w-28 h-28 text-slate-900" />
              </div>
              <div className="space-y-1 text-xs">
                <span className="font-bold text-slate-900 block">Scan to Check-In (Walk-In Patients)</span>
                <p className="text-slate-500 text-[11px] leading-relaxed">
                  Point camera to receive next queue token and WhatsApp live arrival estimate
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
              <span>Token Interval: <strong>{activeDuration} mins</strong></span>
              <span>Fee: <strong>₹{clinic.consultationFee}</strong></span>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <Button
                variant="primary"
                size="sm"
                className="w-full justify-center"
                onClick={() => window.print()}
                leftIcon={<Printer className="w-4 h-4" />}
              >
                Print Clinic Stand Display
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowQrModal(false)}
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
