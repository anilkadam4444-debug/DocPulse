import React from 'react';
import {
  User,
  ShieldCheck,
  Building2,
  Calendar,
  Clock,
  Edit2,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  GraduationCap,
  MapPin,
  IndianRupee,
  CalendarCheck,
} from 'lucide-react';
import { RegistrationFormState, RegistrationStep } from '../types';
import { calculateDailyCapacity } from '../validation';
import { PRACTICE_TYPE_OPTIONS } from '../constants';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';

interface StepReviewProps {
  formData: RegistrationFormState;
  onEditStep: (step: RegistrationStep) => void;
  onComplete: () => void;
  isSubmitting?: boolean;
}

export const StepReview: React.FC<StepReviewProps> = ({
  formData,
  onEditStep,
  onComplete,
  isSubmitting = false,
}) => {
  const { account, professional, clinic, schedule } = formData;
  const capacity = calculateDailyCapacity(schedule);
  const activeDuration = schedule.isCustomDuration
    ? parseInt(schedule.customDurationMinutes || '15', 10) || 15
    : schedule.avgDurationMinutes;

  const practiceTypeLabel =
    PRACTICE_TYPE_OPTIONS.find((p) => p.id === clinic.practiceType)?.label || clinic.practiceType;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div>
        <h2 className="text-lg font-bold text-slate-900">Step 5: Review &amp; Completion</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Carefully verify your practice details before finalizing your onboarding configuration.
        </p>
      </div>

      {/* Prototype Context Banner */}
      <div className="p-3.5 bg-teal-50 border border-teal-200 rounded-xl text-xs text-teal-950 flex items-start gap-2.5 leading-relaxed">
        <Sparkles className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
        <div>
          <strong>Prototype Registration Review:</strong> This is a frontend architectural prototype.
          Submitting this review validates the complete practice profile in memory. No live database
          write, credentials verification, or email dispatch occurs until Phase 2.
        </div>
      </div>

      <div className="space-y-4">
        {/* Card 1: Account Details */}
        <Card className="bg-white border-slate-200 p-5 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-teal-600" />
              <h3 className="text-sm font-bold text-slate-900">1. Doctor Account Details</h3>
            </div>
            <button
              type="button"
              onClick={() => onEditStep(1)}
              className="text-xs font-semibold text-teal-700 hover:text-teal-900 flex items-center gap-1 hover:underline cursor-pointer"
            >
              <Edit2 className="w-3 h-3" />
              Edit
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-slate-500 block">Full Name:</span>
              <strong className="text-slate-900">{account.fullName}</strong>
            </div>
            <div>
              <span className="text-slate-500 block">Email Address:</span>
              <strong className="text-slate-900">{account.email}</strong>
            </div>
            <div>
              <span className="text-slate-500 block">WhatsApp Mobile:</span>
              <strong className="text-slate-900">+91 {account.mobile}</strong>
            </div>
            <div>
              <span className="text-slate-500 block">Account Password:</span>
              <span className="text-slate-600 font-mono tracking-widest">••••••••••••</span>
            </div>
            <div className="sm:col-span-2 text-emerald-700 font-medium flex items-center gap-1.5 pt-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Terms of Practice &amp; Privacy Policy Accepted</span>
            </div>
          </div>
        </Card>

        {/* Card 2: Professional Details */}
        <Card className="bg-white border-slate-200 p-5 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-teal-600" />
              <h3 className="text-sm font-bold text-slate-900">2. Professional Details</h3>
            </div>
            <button
              type="button"
              onClick={() => onEditStep(2)}
              className="text-xs font-semibold text-teal-700 hover:text-teal-900 flex items-center gap-1 hover:underline cursor-pointer"
            >
              <Edit2 className="w-3 h-3" />
              Edit
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-slate-500 block">Qualifications / Degrees:</span>
              <strong className="text-slate-900 font-medium">{professional.qualifications}</strong>
            </div>
            <div>
              <span className="text-slate-500 block">Specialization:</span>
              <strong className="text-slate-900">
                {professional.specialization === 'Other'
                  ? `${professional.customSpecialization} (Other)`
                  : professional.specialization}
              </strong>
            </div>
            <div>
              <span className="text-slate-500 block">Registration Council:</span>
              <strong className="text-slate-900">{professional.registrationCouncil}</strong>
            </div>
            <div>
              <span className="text-slate-500 block">Registration Number:</span>
              <strong className="text-slate-900 font-mono">
                {professional.registrationNumber}
              </strong>
            </div>
            <div>
              <span className="text-slate-500 block">Clinical Experience:</span>
              <span className="text-slate-800">
                {professional.experienceYears ? `${professional.experienceYears} Years` : 'Not specified'}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block">Languages Spoken:</span>
              <div className="flex flex-wrap gap-1 mt-0.5">
                {professional.languages.map((l) => (
                  <span
                    key={l}
                    className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-medium text-[11px]"
                  >
                    {l}
                  </span>
                ))}
              </div>
            </div>
            {professional.bio && (
              <div className="sm:col-span-2">
                <span className="text-slate-500 block">Doctor Profile Bio:</span>
                <p className="text-slate-700 italic mt-0.5">{professional.bio}</p>
              </div>
            )}
          </div>
        </Card>

        {/* Card 3: Clinic Location */}
        <Card className="bg-white border-slate-200 p-5 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-teal-600" />
              <h3 className="text-sm font-bold text-slate-900">3. Primary Clinic Location</h3>
            </div>
            <button
              type="button"
              onClick={() => onEditStep(3)}
              className="text-xs font-semibold text-teal-700 hover:text-teal-900 flex items-center gap-1 hover:underline cursor-pointer"
            >
              <Edit2 className="w-3 h-3" />
              Edit
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-slate-500 block">Clinic Name:</span>
              <strong className="text-slate-900">{clinic.clinicName}</strong>
            </div>
            <div>
              <span className="text-slate-500 block">Practice Facility Type:</span>
              <span className="text-slate-800 font-medium">{practiceTypeLabel}</span>
            </div>
            <div>
              <span className="text-slate-500 block">Discovery City &amp; Locality:</span>
              <strong className="text-slate-900">{clinic.locality}, {clinic.city}</strong> ({clinic.state})
            </div>
            <div>
              <span className="text-slate-500 block">Postal PIN:</span>
              <span className="text-slate-800 font-mono">{clinic.pincode}</span>
            </div>
            <div className="sm:col-span-2">
              <span className="text-slate-500 block">Full Clinic Address:</span>
              <span className="text-slate-800">
                {clinic.addressLine}
                {clinic.landmark ? ` (Landmark: ${clinic.landmark})` : ''}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block">Consultation Fee:</span>
              <strong className="text-slate-900 text-sm">₹{clinic.consultationFee}</strong>
            </div>
            <div>
              <span className="text-slate-500 block">Follow-Up Policy:</span>
              <span className="text-slate-800">
                {clinic.followUpFee === '0' || !clinic.followUpFee ? 'Free' : `₹${clinic.followUpFee}`} within {clinic.followUpDays} days
              </span>
            </div>
            <div>
              <span className="text-slate-500 block">Reception Phone:</span>
              <span className="text-slate-800">{clinic.clinicPhone || 'Not specified'}</span>
            </div>
          </div>
        </Card>

        {/* Card 4: Schedule Settings */}
        <Card className="bg-white border-slate-200 p-5 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-teal-600" />
              <h3 className="text-sm font-bold text-slate-900">4. Consultation Schedule</h3>
            </div>
            <button
              type="button"
              onClick={() => onEditStep(4)}
              className="text-xs font-semibold text-teal-700 hover:text-teal-900 flex items-center gap-1 hover:underline cursor-pointer"
            >
              <Edit2 className="w-3 h-3" />
              Edit
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-slate-500 block">Average Duration:</span>
              <strong className="text-slate-900">{activeDuration} minutes / patient</strong>
            </div>
            <div>
              <span className="text-slate-500 block">Theoretical Daily Capacity:</span>
              <strong className="text-teal-700">{capacity.theoreticalCapacity} consultations / day</strong>
            </div>
            <div>
              <span className="text-slate-500 block">Session 1 Hours:</span>
              <span className="text-slate-800">
                {schedule.session1.openTime} – {schedule.session1.closeTime}
                {schedule.session1.hasBreak &&
                  ` (Break: ${schedule.session1.breakStart} - ${schedule.session1.breakEnd})`}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block">Session 2 Hours:</span>
              <span className="text-slate-800">
                {schedule.hasSession2 && schedule.session2
                  ? `${schedule.session2.openTime} – ${schedule.session2.closeTime}`
                  : 'None (Single Session)'}
              </span>
            </div>
            <div className="sm:col-span-2">
              <span className="text-slate-500 block">Working Days:</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {schedule.workingDays.map((d) => (
                  <span
                    key={d}
                    className="px-2 py-0.5 rounded bg-teal-50 text-teal-800 font-semibold text-[11px] border border-teal-200/60"
                  >
                    {d}
                  </span>
                ))}
              </div>
            </div>
            <div className="sm:col-span-2 pt-1 text-slate-600">
              Reception QR Check-In:{' '}
              <strong className="text-slate-900">
                {schedule.acceptsWalkIns ? 'Enabled for Walk-In Patients' : 'Online Only'}
              </strong>
            </div>
          </div>
        </Card>
      </div>

      {/* Completion CTA */}
      <div className="pt-4 border-t border-slate-200">
        <Button
          variant="primary"
          size="lg"
          onClick={onComplete}
          isLoading={isSubmitting}
          className="w-full justify-center"
        >
          Complete Registration Setup
        </Button>
      </div>
    </div>
  );
};
