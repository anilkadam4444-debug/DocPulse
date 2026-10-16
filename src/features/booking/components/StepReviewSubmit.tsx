import React from 'react';
import {
  User,
  Building,
  Calendar,
  Clock,
  IndianRupee,
  Phone,
  Mail,
  AlertCircle,
  ShieldCheck,
  CheckCircle2,
  FileText,
  Lock,
} from 'lucide-react';
import { PublicDoctorProfile, PublicPracticeLocation } from '../../../types/public-doctor';
import { CandidateTimeSlot } from '../types';
import { Button } from '../../../components/ui/Button';

interface StepReviewSubmitProps {
  doctor: PublicDoctorProfile;
  location: PublicPracticeLocation;
  appointmentDate: string;
  selectedSlot: CandidateTimeSlot;
  patientName: string;
  patientMobile: string;
  patientEmail: string;
  visitReason: string;
  consultationFee: string;
  isSubmitting: boolean;
  submissionError: string | null;
  onSubmitBooking: () => void;
  onEditStep: (stepNumber: number) => void;
}

export const StepReviewSubmit: React.FC<StepReviewSubmitProps> = ({
  doctor,
  location,
  appointmentDate,
  selectedSlot,
  patientName,
  patientMobile,
  patientEmail,
  visitReason,
  consultationFee,
  isSubmitting,
  submissionError,
  onSubmitBooking,
  onEditStep,
}) => {
  return (
    <div className="space-y-6">
      {/* Step Header */}
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-teal-700">
          Step 5 of 5
        </span>
        <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-0.5">
          Review &amp; Confirm Appointment
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 mt-1">
          Review all details before committing your reservation to the clinic&apos;s live schedule.
        </p>
      </div>

      {/* Submission Error Banner */}
      {submissionError && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-xs flex items-start gap-3 animate-in fade-in duration-200">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <strong className="block font-bold">Booking Request Not Confirmed</strong>
            <p>{submissionError}</p>
          </div>
        </div>
      )}

      {/* Summary Cards */}
      <div className="space-y-4">
        {/* Card 1: Doctor & Clinic Location */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
              <Building className="w-4 h-4 text-teal-600" />
              <span>Doctor &amp; Clinic Facility</span>
            </div>
            <button
              type="button"
              onClick={() => onEditStep(1)}
              className="text-xs text-teal-700 hover:text-teal-900 font-semibold hover:underline cursor-pointer"
            >
              Change Location
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-slate-400 block">Consulting Doctor</span>
              <strong className="text-slate-900 text-sm block mt-0.5">{doctor.fullName}</strong>
              <span className="text-teal-800 font-semibold">{doctor.specialization}</span>
              <span className="text-slate-500 block text-[11px] mt-0.5">
                Reg: {doctor.registrationNumber} ({doctor.registrationCouncil})
              </span>
            </div>

            <div>
              <span className="text-slate-400 block">Clinic Location</span>
              <strong className="text-slate-900 block mt-0.5">{location.name}</strong>
              <span className="text-slate-600 block mt-0.5">
                {location.addressLine}, {location.locality}, {location.city} – {location.pincode}
              </span>
              {location.phone && (
                <span className="text-slate-500 block text-[11px] mt-0.5">
                  Reception Contact: {location.phone}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Card 2: Date, Time & Fee */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
              <Calendar className="w-4 h-4 text-teal-600" />
              <span>Consultation Timing &amp; Fee</span>
            </div>
            <button
              type="button"
              onClick={() => onEditStep(2)}
              className="text-xs text-teal-700 hover:text-teal-900 font-semibold hover:underline cursor-pointer"
            >
              Change Time
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div>
              <span className="text-slate-400 block">Appointment Date</span>
              <strong className="text-slate-900 text-sm block mt-0.5 font-mono">
                {appointmentDate}
              </strong>
            </div>

            <div>
              <span className="text-slate-400 block">Consultation Time Slot</span>
              <strong className="text-slate-900 text-sm block mt-0.5 font-mono">
                {selectedSlot.displayTime}
              </strong>
              <span className="text-[11px] text-teal-700 font-medium">
                {selectedSlot.sessionLabel}
              </span>
            </div>

            <div>
              <span className="text-slate-400 block">Consultation Fee</span>
              <strong className="text-slate-900 text-lg block mt-0.5 font-mono font-bold">
                ₹{consultationFee}
              </strong>
              <span className="text-[10px] text-slate-400 block">Payable on-site at reception</span>
            </div>
          </div>
        </div>

        {/* Card 3: Patient Details */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
              <User className="w-4 h-4 text-teal-600" />
              <span>Patient Contact Details</span>
            </div>
            <button
              type="button"
              onClick={() => onEditStep(4)}
              className="text-xs text-teal-700 hover:text-teal-900 font-semibold hover:underline cursor-pointer"
            >
              Edit Details
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-slate-400 block">Patient Name</span>
              <strong className="text-slate-900 text-sm block mt-0.5">{patientName}</strong>
            </div>

            <div>
              <span className="text-slate-400 block">Mobile Number</span>
              <strong className="text-slate-900 font-mono text-sm block mt-0.5">
                +91 {patientMobile}
              </strong>
            </div>

            {patientEmail && (
              <div>
                <span className="text-slate-400 block">Email Address</span>
                <span className="text-slate-800 block mt-0.5">{patientEmail}</span>
              </div>
            )}

            {visitReason && (
              <div>
                <span className="text-slate-400 block">Consultation Reason</span>
                <span className="text-slate-800 block mt-0.5">{visitReason}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Arrival & Cancellation Policy */}
      <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 text-xs text-slate-600 space-y-1.5">
        <strong className="text-slate-800 font-bold block">Clinic Arrival &amp; Cancellation Notice:</strong>
        <p className="leading-relaxed">
          • Please arrive at <strong>{location.name}</strong> 10-15 minutes prior to{' '}
          <strong className="font-mono">{selectedSlot.startTime}</strong> to complete basic vitals checking and reception verification.
        </p>
        <p className="leading-relaxed">
          • If you need to reschedule or cancel, please provide at least 2 hours notice so the slot can be released to other patients in need.
        </p>
      </div>

      {/* Submit Action Box */}
      <div className="pt-2">
        <Button
          type="button"
          variant="primary"
          size="lg"
          onClick={onSubmitBooking}
          isLoading={isSubmitting}
          leftIcon={<Lock className="w-4 h-4" />}
          className="w-full justify-center text-sm py-3.5 shadow-sm"
        >
          {isSubmitting ? 'Verifying & Reserving Slot...' : 'Confirm & Book Appointment'}
        </Button>
        <p className="text-center text-[11px] text-slate-400 mt-2">
          By clicking Confirm, your slot will be atomically reserved in Dr. {doctor.fullName}&apos;s schedule.
        </p>
      </div>
    </div>
  );
};
