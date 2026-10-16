import React from 'react';
import { User, Phone, Mail, FileText, IndianRupee, ShieldAlert, Check } from 'lucide-react';
import { Input } from '../../../components/ui/Input';

interface StepPatientDetailsProps {
  patientName: string;
  patientMobile: string;
  patientEmail: string;
  visitReason: string;
  consultationFee: string;
  errors: Record<string, string>;
  onChange: (fields: Partial<{
    patientName: string;
    patientMobile: string;
    patientEmail: string;
    visitReason: string;
  }>) => void;
}

export const StepPatientDetails: React.FC<StepPatientDetailsProps> = ({
  patientName,
  patientMobile,
  patientEmail,
  visitReason,
  consultationFee,
  errors,
  onChange,
}) => {
  return (
    <div className="space-y-6">
      {/* Step Header */}
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-teal-700">
          Step 4 of 5
        </span>
        <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-0.5">
          Patient Information
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 mt-1">
          No account registration is required. Enter the patient details to confirm your appointment
          token and SMS updates.
        </p>
      </div>

      {/* Form Fields Grid */}
      <div className="space-y-4">
        {/* Patient Full Name */}
        <Input
          label="Patient Full Name"
          required
          placeholder="e.g. Ramesh Kulkarni"
          value={patientName}
          onChange={(e) => onChange({ patientName: e.target.value })}
          error={errors.patientName}
          leftIcon={<User className="w-4 h-4 text-slate-400" />}
          helperText="As registered with government photo ID (Aadhaar / PAN) for clinic reception verification."
        />

        {/* Mobile Number */}
        <div className="space-y-1">
          <label htmlFor="patient-mobile-input" className="block text-xs font-semibold text-slate-700">
            Mobile Number (SMS / WhatsApp Updates) <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-1 text-slate-500 pointer-events-none">
              <Phone className="w-4 h-4 text-slate-400" />
              <span className="text-xs font-bold text-slate-700 border-r border-slate-300 pr-1.5">
                +91
              </span>
            </div>
            <input
              id="patient-mobile-input"
              type="tel"
              maxLength={10}
              placeholder="9876543210"
              value={patientMobile}
              onChange={(e) => {
                const clean = e.target.value.replace(/\D/g, '').slice(0, 10);
                onChange({ patientMobile: clean });
              }}
              className={`w-full bg-slate-50 hover:bg-white text-slate-900 font-mono text-sm rounded-lg border py-2.5 pl-18 pr-3 transition-colors ${
                errors.patientMobile
                  ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-100'
                  : 'border-slate-300 focus:border-teal-600 focus:ring-teal-100'
              }`}
            />
          </div>
          {errors.patientMobile ? (
            <p className="text-xs text-rose-600 font-medium">{errors.patientMobile}</p>
          ) : (
            <p className="text-[11px] text-slate-500">
              Your queue position, live arrival estimates, and token confirmation will be sent here.
            </p>
          )}
        </div>

        {/* Optional Email */}
        <Input
          label="Email Address (Optional)"
          type="email"
          placeholder="patient@example.com"
          value={patientEmail}
          onChange={(e) => onChange({ patientEmail: e.target.value })}
          error={errors.patientEmail}
          leftIcon={<Mail className="w-4 h-4 text-slate-400" />}
          helperText="Receive calendar invitation and digital consultation receipt."
        />

        {/* Visit Reason */}
        <div className="space-y-1">
          <label htmlFor="visit-reason-textarea" className="block text-xs font-semibold text-slate-700">
            Reason for Consultation (Optional)
          </label>
          <div className="relative">
            <textarea
              id="visit-reason-textarea"
              rows={3}
              maxLength={300}
              placeholder="e.g. High fever for 2 days, seasonal allergies, follow-up on previous prescription..."
              value={visitReason}
              onChange={(e) => onChange({ visitReason: e.target.value })}
              className="w-full bg-slate-50 hover:bg-white text-slate-900 text-sm rounded-lg border border-slate-300 focus:border-teal-600 focus:bg-white focus:ring-2 focus:ring-teal-100 p-3 transition-colors"
            />
          </div>
          <div className="flex justify-between items-center text-[11px] text-slate-400">
            <span>Briefly share symptoms or purpose of consultation.</span>
            <span>{visitReason.length}/300</span>
          </div>
        </div>
      </div>

      {/* Payment / Confirmation Policy Banner */}
      <div className="p-4 rounded-xl bg-teal-50/60 border border-teal-200/80 text-xs text-teal-950 flex items-start gap-3">
        <IndianRupee className="w-5 h-5 text-teal-700 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <strong className="block font-bold">
            Consultation Fee: ₹{consultationFee} (Payable at Clinic)
          </strong>
          <p className="leading-relaxed text-teal-900">
            No advance payment is collected today. Consultation charges are paid directly at the
            clinic reception counter via UPI, Card, or Cash when checking in.
          </p>
        </div>
      </div>
    </div>
  );
};
