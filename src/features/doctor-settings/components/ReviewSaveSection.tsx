import React from 'react';
import {
  CheckCircle2,
  AlertCircle,
  Building2,
  Clock,
  IndianRupee,
  ShieldCheck,
  Calendar,
  Save,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { DoctorSettingsFormState, SettingsTabId } from '../types';
import { Button } from '../../../components/ui/Button';

interface ReviewSaveSectionProps {
  formData: DoctorSettingsFormState;
  isDirty: boolean;
  isSaving: boolean;
  saveSuccess: boolean;
  errorMessage: string | null;
  onSave: () => void;
  onReset: () => void;
  onNavigateTab: (tab: SettingsTabId) => void;
}

export const ReviewSaveSection: React.FC<ReviewSaveSectionProps> = ({
  formData,
  isDirty,
  isSaving,
  saveSuccess,
  errorMessage,
  onSave,
  onReset,
  onNavigateTab,
}) => {
  const primaryLoc = formData.locations.find((l) => l.isPrimary) || formData.locations[0];

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="border-b border-slate-200 pb-4">
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-teal-600" />
          Review &amp; Commit Practice Settings
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Verify your practice configuration across all modules before saving to the live Firestore tenant store.
        </p>
      </div>

      {/* Notifications */}
      {saveSuccess && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center gap-2.5 animate-in fade-in duration-200">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <div>
            <strong className="block font-bold">Practice Settings Saved Successfully!</strong>
            <span>
              Your profile, clinic locations, and OPD parameters have been updated across your doctor tenant.
            </span>
          </div>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-xs flex items-center gap-2.5">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <div>
            <strong className="block font-bold">Failed to Save Practice Settings</strong>
            <span>{errorMessage}</span>
          </div>
        </div>
      )}

      {/* Overview Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Card 1: Professional Profile */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-2.5">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-teal-600" />
              Professional Identity
            </h3>
            <button
              type="button"
              onClick={() => onNavigateTab('profile')}
              className="text-[11px] text-teal-700 hover:text-teal-900 font-medium hover:underline cursor-pointer"
            >
              Edit
            </button>
          </div>
          <div className="text-xs space-y-1 text-slate-600">
            <div className="font-bold text-slate-900 text-sm">{formData.fullName}</div>
            <div className="text-teal-800 font-semibold">{formData.specialization}</div>
            <div className="text-[11px] text-slate-500">
              Council: {formData.registrationCouncil} (Reg #{formData.registrationNumber})
            </div>
            <div className="text-[11px] text-slate-500">
              Qualifications: {formData.qualifications} · {formData.experienceYears || '0'} yrs exp
            </div>
            <div className="text-[11px] text-slate-500">
              Languages: {formData.languages.join(', ') || 'English, Hindi'}
            </div>
          </div>
        </div>

        {/* Card 2: Primary Location */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-2.5">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <Building2 className="w-4 h-4 text-teal-600" />
              Practice Locations ({formData.locations.length})
            </h3>
            <button
              type="button"
              onClick={() => onNavigateTab('locations')}
              className="text-[11px] text-teal-700 hover:text-teal-900 font-medium hover:underline cursor-pointer"
            >
              Manage
            </button>
          </div>
          {primaryLoc ? (
            <div className="text-xs space-y-1 text-slate-600">
              <div className="font-bold text-slate-900 flex items-center gap-1.5">
                <span>{primaryLoc.name}</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-teal-100 text-teal-800 font-bold">
                  Primary
                </span>
              </div>
              <div className="text-[11px] text-slate-500">
                {primaryLoc.addressLine}, {primaryLoc.locality}, {primaryLoc.city} – {primaryLoc.pincode}
              </div>
              <div className="text-[11px] text-slate-500">
                Fee: ₹{primaryLoc.consultationFee || '500'} · Phone: {primaryLoc.phone || 'N/A'}
              </div>
              <div className="text-[11px] text-slate-500">
                Total Locations: {formData.locations.length} ({formData.locations.filter((l) => l.isActive).length} active)
              </div>
            </div>
          ) : (
            <p className="text-xs text-amber-700">No locations configured.</p>
          )}
        </div>

        {/* Card 3: Consultation Settings */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-2.5">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <IndianRupee className="w-4 h-4 text-teal-600" />
              Fees &amp; Duration
            </h3>
            <button
              type="button"
              onClick={() => onNavigateTab('consultation')}
              className="text-[11px] text-teal-700 hover:text-teal-900 font-medium hover:underline cursor-pointer"
            >
              Edit
            </button>
          </div>
          <div className="text-xs space-y-1 text-slate-600">
            <div>
              OPD Fee: <strong className="text-slate-900">₹{formData.consultation.defaultFee}</strong> ·
              Follow-up: <strong className="text-slate-900">₹{formData.consultation.followUpFee}</strong> ({formData.consultation.followUpDays} days)
            </div>
            <div>
              Slot Duration: <strong className="text-slate-900">{formData.consultation.avgDurationMinutes} mins</strong>
            </div>
            <div className="text-[11px] text-slate-500">
              Emergency buffer: {formData.consultation.emergencyReserveSlots} reserve tokens per session
            </div>
            <div className="text-[11px] text-slate-500">
              Video Consultations: {formData.consultation.videoConsultationEnabled ? 'Enabled' : 'Disabled'}
            </div>
          </div>
        </div>

        {/* Card 4: Operating Hours & Booking */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-2.5">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-teal-600" />
              Operating Hours &amp; Capacity
            </h3>
            <button
              type="button"
              onClick={() => onNavigateTab('schedule')}
              className="text-[11px] text-teal-700 hover:text-teal-900 font-medium hover:underline cursor-pointer"
            >
              Edit
            </button>
          </div>
          <div className="text-xs space-y-1 text-slate-600">
            <div>
              Working Days: <strong className="text-slate-900">{formData.schedule.workingDays.join(', ')}</strong>
            </div>
            <div>
              Shift 1: <strong className="text-slate-900 font-mono">{formData.schedule.session1.openTime} – {formData.schedule.session1.closeTime}</strong>
              {formData.schedule.hasSession2 && formData.schedule.session2 && (
                <span> · Shift 2: <strong className="text-slate-900 font-mono">{formData.schedule.session2.openTime} – {formData.schedule.session2.closeTime}</strong></span>
              )}
            </div>
            <div className="text-[11px] text-slate-500">
              Capacity: Max {formData.preferences.dailyTokenLimit} patients/session
            </div>
            <div className="text-[11px] text-slate-500">
              WhatsApp alert threshold: {formData.preferences.whatsAppAlertThreshold} patients ahead
            </div>
          </div>
        </div>
      </div>

      {/* Save Action Bar */}
      <div className="p-5 rounded-2xl bg-slate-900 text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
        <div>
          <div className="text-sm font-bold flex items-center gap-2">
            <span>Commit Practice Settings</span>
            {isDirty && (
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-400 text-slate-900">
                Unsaved Changes
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Synchronizes your profile, multiple clinics, and schedule with your secure doctor Firestore document.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0 w-full sm:w-auto">
          {isDirty && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onReset}
              disabled={isSaving}
              leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
              className="text-slate-300 border-slate-700 hover:bg-slate-800"
            >
              Discard Changes
            </Button>
          )}

          <Button
            type="button"
            variant="primary"
            size="md"
            onClick={onSave}
            isLoading={isSaving}
            leftIcon={<Save className="w-4 h-4" />}
            className="w-full sm:w-auto justify-center"
          >
            Save Practice Settings
          </Button>
        </div>
      </div>
    </div>
  );
};
