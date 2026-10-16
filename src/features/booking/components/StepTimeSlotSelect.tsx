import React, { useState, useEffect } from 'react';
import { Clock, Sun, Moon, AlertCircle, CheckCircle2, RefreshCw } from 'lucide-react';
import { PublicDoctorProfile } from '../../../types/public-doctor';
import { CandidateTimeSlot } from '../types';
import { getAuthoritativeSlotsForDate } from '../bookingService';
import { Button } from '../../../components/ui/Button';

interface StepTimeSlotSelectProps {
  doctor: PublicDoctorProfile;
  locationId: string;
  selectedDate: string;
  selectedSlot: CandidateTimeSlot | null;
  onSelectSlot: (slot: CandidateTimeSlot) => void;
}

export const StepTimeSlotSelect: React.FC<StepTimeSlotSelectProps> = ({
  doctor,
  locationId,
  selectedDate,
  selectedSlot,
  onSelectSlot,
}) => {
  const [slots, setSlots] = useState<CandidateTimeSlot[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSlots = async () => {
    if (!selectedDate || !locationId) return;
    setIsLoading(true);
    setError(null);

    const result = await getAuthoritativeSlotsForDate(doctor, locationId, selectedDate);
    if (result.error) {
      setError(result.error);
    } else {
      setSlots(result.slots);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchSlots();
  }, [doctor.doctorUid, locationId, selectedDate]);

  const morningSlots = slots.filter((s) => s.sessionType === 'session1');
  const eveningSlots = slots.filter((s) => s.sessionType === 'session2');

  const availableCount = slots.filter((s) => s.isAvailable).length;

  return (
    <div className="space-y-6">
      {/* Step Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-teal-700">
            Step 3 of 5
          </span>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-0.5">
            Select Consultation Time Slot
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Authoritative slot availability on{' '}
            <strong className="text-slate-900">{selectedDate}</strong> (Duration:{' '}
            {doctor.avgDurationMinutes || 15} mins/slot).
          </p>
        </div>

        {!isLoading && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={fetchSlots}
            leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
            className="text-xs shrink-0 self-start sm:self-auto"
          >
            Refresh Slots
          </Button>
        )}
      </div>

      {/* Loading Skeleton */}
      {isLoading && (
        <div className="space-y-4 animate-pulse">
          <div className="h-4 bg-slate-200 rounded w-1/4" />
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="h-12 bg-slate-100 rounded-xl" />
            ))}
          </div>
        </div>
      )}

      {/* Error State */}
      {!isLoading && error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-xs flex items-start gap-2.5">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <strong className="font-bold">Unable to load time slots</strong>
            <p>{error}</p>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchSlots}
              className="mt-1 text-rose-800 border-rose-300"
            >
              Try Again
            </Button>
          </div>
        </div>
      )}

      {/* No Slots Available State */}
      {!isLoading && !error && slots.length > 0 && availableCount === 0 && (
        <div className="p-6 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-center space-y-2">
          <Clock className="w-8 h-8 text-amber-600 mx-auto" />
          <h3 className="font-bold text-sm">All Slots Full for {selectedDate}</h3>
          <p className="text-xs text-amber-800 max-w-md mx-auto">
            All appointments for this date are fully reserved. Please return to Step 2 and choose
            another consulting date or consult walk-in token availability at reception.
          </p>
        </div>
      )}

      {/* Slots Available */}
      {!isLoading && !error && slots.length > 0 && availableCount > 0 && (
        <div className="space-y-6">
          {/* Morning Shift */}
          {morningSlots.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                <Sun className="w-4 h-4 text-amber-500" />
                <span>Morning OPD Shift ({doctor.schedule.session1.openTime} – {doctor.schedule.session1.closeTime})</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
                {morningSlots.map((slot) => {
                  const isSelected = selectedSlot?.slotId === slot.slotId;
                  const isAvailable = slot.isAvailable;

                  return (
                    <button
                      key={slot.slotId}
                      type="button"
                      disabled={!isAvailable}
                      onClick={() => onSelectSlot(slot)}
                      className={`p-3 rounded-xl border text-xs font-medium transition-all text-left flex flex-col justify-between ${
                        !isAvailable
                          ? 'border-slate-200 bg-slate-50 text-slate-400 opacity-60 cursor-not-allowed'
                          : isSelected
                          ? 'border-teal-600 bg-teal-50 ring-2 ring-teal-200 text-teal-950 font-bold shadow-xs cursor-pointer'
                          : 'border-slate-200 bg-white hover:border-slate-300 text-slate-700 cursor-pointer'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1">
                        <span className="font-mono text-xs font-semibold">{slot.startTime}</span>
                        {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-teal-700" />}
                      </div>
                      <span className="text-[10px] text-slate-500 block mt-1">
                        {isAvailable ? 'Available' : slot.unavailableReason || 'Unavailable'}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Evening Shift */}
          {eveningSlots.length > 0 && (
            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                <Moon className="w-4 h-4 text-indigo-500" />
                <span>Evening OPD Shift ({doctor.schedule.session2?.openTime} – {doctor.schedule.session2?.closeTime})</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
                {eveningSlots.map((slot) => {
                  const isSelected = selectedSlot?.slotId === slot.slotId;
                  const isAvailable = slot.isAvailable;

                  return (
                    <button
                      key={slot.slotId}
                      type="button"
                      disabled={!isAvailable}
                      onClick={() => onSelectSlot(slot)}
                      className={`p-3 rounded-xl border text-xs font-medium transition-all text-left flex flex-col justify-between ${
                        !isAvailable
                          ? 'border-slate-200 bg-slate-50 text-slate-400 opacity-60 cursor-not-allowed'
                          : isSelected
                          ? 'border-teal-600 bg-teal-50 ring-2 ring-teal-200 text-teal-950 font-bold shadow-xs cursor-pointer'
                          : 'border-slate-200 bg-white hover:border-slate-300 text-slate-700 cursor-pointer'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1">
                        <span className="font-mono text-xs font-semibold">{slot.startTime}</span>
                        {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-teal-700" />}
                      </div>
                      <span className="text-[10px] text-slate-500 block mt-1">
                        {isAvailable ? 'Available' : slot.unavailableReason || 'Unavailable'}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Selected Slot Confirmation Badge */}
      {selectedSlot && (
        <div className="p-3.5 rounded-xl bg-teal-50 border border-teal-200 text-xs text-teal-950 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
            <span>
              Selected Time: <strong className="font-mono">{selectedSlot.displayTime}</strong> ({selectedSlot.sessionLabel})
            </span>
          </div>
          <span className="text-[11px] font-bold text-teal-700">Slot Confirmed</span>
        </div>
      )}
    </div>
  );
};
