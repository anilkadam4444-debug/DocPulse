import React from 'react';
import { Calendar, Clock, AlertCircle, CheckCircle2 } from 'lucide-react';
import { PublicDoctorProfile } from '../../../types/public-doctor';
import { generateEligibleDates } from '../bookingService';

interface StepDateSelectProps {
  doctor: PublicDoctorProfile;
  selectedDate: string;
  onSelectDate: (dateStr: string) => void;
}

export const StepDateSelect: React.FC<StepDateSelectProps> = ({
  doctor,
  selectedDate,
  onSelectDate,
}) => {
  const advanceDays = doctor.bookingPreferences?.advanceBookingDays || 7;
  const eligibleDates = generateEligibleDates(doctor, advanceDays);

  return (
    <div className="space-y-6">
      {/* Step Header */}
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-teal-700">
          Step 2 of 5
        </span>
        <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-0.5">
          Select Appointment Date
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 mt-1">
          Showing available dates for the next {advanceDays} days based on Dr. {doctor.fullName}&apos;s
          consultation schedule (Timezone: Asia/Kolkata).
        </p>
      </div>

      {/* Working Days Summary */}
      <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs flex flex-wrap items-center justify-between gap-2">
        <span className="font-semibold text-slate-700">Regular OPD Consulting Days:</span>
        <div className="flex flex-wrap gap-1">
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => {
            const isWorking = doctor.schedule.workingDays.includes(day);
            return (
              <span
                key={day}
                className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                  isWorking
                    ? 'bg-teal-600 text-white'
                    : 'bg-slate-200 text-slate-400'
                }`}
              >
                {day}
              </span>
            );
          })}
        </div>
      </div>

      {/* Date Selection Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {eligibleDates.map((item) => {
          const isSelected = selectedDate === item.dateStr;
          const isDisabled = !item.isWorkingDay;

          return (
            <button
              key={item.dateStr}
              type="button"
              disabled={isDisabled}
              onClick={() => onSelectDate(item.dateStr)}
              className={`p-3.5 rounded-xl border text-center transition-all flex flex-col items-center justify-center space-y-1 ${
                isDisabled
                  ? 'border-slate-200 bg-slate-100 text-slate-400 opacity-60 cursor-not-allowed'
                  : isSelected
                  ? 'border-teal-600 bg-teal-50 ring-2 ring-teal-200 text-slate-900 cursor-pointer shadow-xs'
                  : 'border-slate-200 bg-white hover:border-slate-300 text-slate-700 cursor-pointer'
              }`}
            >
              <span className="text-[11px] font-bold uppercase tracking-wider block">
                {item.dayName}
              </span>
              <span className="text-base font-extrabold text-slate-900 font-mono block">
                {item.dateStr.slice(8, 10)}
              </span>
              <span className="text-[11px] text-slate-500 block">
                {item.formattedDate.split(',')[1]?.trim() || item.dateStr.slice(5, 7)}
              </span>
              {isDisabled && (
                <span className="text-[9px] font-semibold text-slate-400 block pt-0.5">
                  Clinic Closed
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Note */}
      <p className="text-xs text-slate-500">
        Dates beyond {advanceDays} days are currently locked in accordance with the doctor&apos;s advance
        booking window.
      </p>
    </div>
  );
};
