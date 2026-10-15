import React, { useMemo } from 'react';
import {
  Clock,
  Calendar,
  Coffee,
  Plus,
  Trash2,
  Users,
  AlertCircle,
  Calculator,
  Info,
  CalendarDays,
  Sparkles,
} from 'lucide-react';
import { ConsultationScheduleData, SessionTiming } from '../types';
import { SUGGESTED_DURATIONS, DAYS_OF_WEEK } from '../constants';
import { calculateDailyCapacity, generateTentativeSlotPreview } from '../validation';
import { Card } from '../../../components/ui/Card';

interface StepScheduleProps {
  data: ConsultationScheduleData;
  errors: Record<string, string>;
  onChange: (data: Partial<ConsultationScheduleData>) => void;
}

export const StepSchedule: React.FC<StepScheduleProps> = ({ data, errors, onChange }) => {
  // Live theoretical capacity calculation
  const capacity = useMemo(() => {
    return calculateDailyCapacity(data);
  }, [data]);

  const activeDuration = data.isCustomDuration
    ? parseInt(data.customDurationMinutes || '15', 10) || 15
    : data.avgDurationMinutes;

  // Live tentative slots preview (Session 1)
  const slotPreview = useMemo(() => {
    return generateTentativeSlotPreview(
      data.session1.openTime,
      data.session1.closeTime,
      activeDuration,
      data.session1.hasBreak ? data.session1.breakStart : undefined,
      data.session1.hasBreak ? data.session1.breakEnd : undefined,
      6
    );
  }, [data.session1, activeDuration]);

  const toggleDay = (dayId: string) => {
    const exists = data.workingDays.includes(dayId);
    const updated = exists
      ? data.workingDays.filter((d) => d !== dayId)
      : [...data.workingDays, dayId];
    onChange({ workingDays: updated });
  };

  const updateSession1 = (patch: Partial<SessionTiming>) => {
    onChange({ session1: { ...data.session1, ...patch } });
  };

  const updateSession2 = (patch: Partial<SessionTiming>) => {
    if (data.session2) {
      onChange({ session2: { ...data.session2, ...patch } });
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div>
        <h2 className="text-lg font-bold text-slate-900">Step 4: Consultation &amp; Scheduling Settings</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Configure clinical timings, consultation duration, and preview real-time token scheduling.
        </p>
      </div>

      {/* Average Consultation Duration */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-3.5 shadow-xs">
        <div className="flex items-start justify-between gap-3">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
              Average Consultation Duration Per Patient (Required)
            </label>
            <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
              The average consultation duration helps calculate appointment intervals, daily booking
              capacity, and tentative patient waiting times. Actual consultation times may vary.
            </p>
          </div>
          <span className="font-mono text-sm font-bold text-teal-700 bg-teal-50 px-2.5 py-1 rounded-md border border-teal-200 shrink-0">
            {activeDuration} mins
          </span>
        </div>

        {/* Duration presets */}
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
          {SUGGESTED_DURATIONS.map((mins) => {
            const isSelected = !data.isCustomDuration && data.avgDurationMinutes === mins;
            return (
              <button
                key={mins}
                type="button"
                onClick={() => onChange({ isCustomDuration: false, avgDurationMinutes: mins })}
                className={`py-2 px-2.5 text-xs font-medium rounded-lg border transition-all text-center ${
                  isSelected
                    ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                    : 'bg-white text-slate-700 border-slate-300 hover:border-slate-400'
                }`}
              >
                {mins} mins
              </button>
            );
          })}

          {/* Custom option */}
          <button
            type="button"
            onClick={() =>
              onChange({
                isCustomDuration: true,
                customDurationMinutes: data.customDurationMinutes || '25',
              })
            }
            className={`py-2 px-2.5 text-xs font-medium rounded-lg border transition-all text-center ${
              data.isCustomDuration
                ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                : 'bg-white text-slate-700 border-slate-300 hover:border-slate-400'
            }`}
          >
            Custom
          </button>
        </div>

        {/* Custom duration input field */}
        {data.isCustomDuration && (
          <div className="pt-2 flex items-center gap-3">
            <div className="w-36">
              <input
                id="custom-duration"
                type="number"
                min={3}
                max={120}
                placeholder="25"
                value={data.customDurationMinutes || ''}
                onChange={(e) => onChange({ customDurationMinutes: e.target.value })}
                className="w-full bg-white text-slate-900 text-sm rounded-lg border border-slate-300 py-2 px-3 focus:border-teal-600 focus:ring-2 focus:ring-teal-100 focus:outline-none"
              />
            </div>
            <span className="text-xs text-slate-600">minutes per patient consultation</span>
          </div>
        )}

        {errors.customDurationMinutes && (
          <p className="text-xs text-red-600 font-medium">{errors.customDurationMinutes}</p>
        )}
        {errors.avgDurationMinutes && (
          <p className="text-xs text-red-600 font-medium">{errors.avgDurationMinutes}</p>
        )}
      </div>

      {/* Working Days */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-3 shadow-xs">
        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
          Clinic Working Days (Select at least one)
        </label>
        <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
          {DAYS_OF_WEEK.map((day) => {
            const isSelected = data.workingDays.includes(day.id);
            return (
              <button
                key={day.id}
                type="button"
                onClick={() => toggleDay(day.id)}
                className={`py-2.5 px-2 text-xs font-semibold rounded-lg border transition-all text-center ${
                  isSelected
                    ? 'bg-teal-600 text-white border-teal-600 shadow-xs'
                    : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                }`}
              >
                {day.label}
              </button>
            );
          })}
        </div>
        {errors.workingDays && (
          <p className="text-xs text-red-600 font-medium">{errors.workingDays}</p>
        )}
      </div>

      {/* Primary Session 1 */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4 shadow-xs">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-teal-600" />
            <h3 className="text-sm font-bold text-slate-900">
              Session 1 (Morning / Primary Hours)
            </h3>
          </div>
          <span className="text-xs text-slate-500 font-mono">
            {capacity.session1Minutes} active mins
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label
              htmlFor="s1-open"
              className="block text-xs font-semibold text-slate-700"
            >
              Opening Time
            </label>
            <input
              id="s1-open"
              type="time"
              value={data.session1.openTime}
              onChange={(e) => updateSession1({ openTime: e.target.value })}
              className="w-full bg-slate-50 text-slate-900 text-sm rounded-lg border border-slate-300 p-2.5 focus:border-teal-600 focus:bg-white focus:outline-none"
            />
            {errors.session1_openTime && (
              <p className="text-xs text-red-600 font-medium">{errors.session1_openTime}</p>
            )}
          </div>

          <div className="space-y-1">
            <label
              htmlFor="s1-close"
              className="block text-xs font-semibold text-slate-700"
            >
              Closing Time
            </label>
            <input
              id="s1-close"
              type="time"
              value={data.session1.closeTime}
              onChange={(e) => updateSession1({ closeTime: e.target.value })}
              className="w-full bg-slate-50 text-slate-900 text-sm rounded-lg border border-slate-300 p-2.5 focus:border-teal-600 focus:bg-white focus:outline-none"
            />
            {errors.session1_closeTime && (
              <p className="text-xs text-red-600 font-medium">{errors.session1_closeTime}</p>
            )}
          </div>
        </div>

        {/* Break toggle for Session 1 */}
        <div className="pt-2 border-t border-slate-100 space-y-3">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={data.session1.hasBreak}
              onChange={(e) => updateSession1({ hasBreak: e.target.checked })}
              className="w-4 h-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500 accent-teal-600 cursor-pointer"
            />
            <span className="text-xs font-medium text-slate-700">
              Include clinical break / tea recess during Session 1
            </span>
          </label>

          {data.session1.hasBreak && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-3.5 rounded-lg border border-slate-200">
              <div className="space-y-1">
                <label
                  htmlFor="s1-break-start"
                  className="block text-xs font-semibold text-slate-600"
                >
                  Break Start Time
                </label>
                <input
                  id="s1-break-start"
                  type="time"
                  value={data.session1.breakStart || ''}
                  onChange={(e) => updateSession1({ breakStart: e.target.value })}
                  className="w-full bg-white text-slate-900 text-xs rounded border border-slate-300 p-2 focus:border-teal-600 focus:outline-none"
                />
                {errors.session1_breakStart && (
                  <p className="text-xs text-red-600 font-medium">
                    {errors.session1_breakStart}
                  </p>
                )}
              </div>

              <div className="space-y-1">
                <label
                  htmlFor="s1-break-end"
                  className="block text-xs font-semibold text-slate-600"
                >
                  Break End Time
                </label>
                <input
                  id="s1-break-end"
                  type="time"
                  value={data.session1.breakEnd || ''}
                  onChange={(e) => updateSession1({ breakEnd: e.target.value })}
                  className="w-full bg-white text-slate-900 text-xs rounded border border-slate-300 p-2 focus:border-teal-600 focus:outline-none"
                />
                {errors.session1_breakEnd && (
                  <p className="text-xs text-red-600 font-medium">{errors.session1_breakEnd}</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Optional Session 2 (Evening Hours) */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4 shadow-xs">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-teal-600" />
            <h3 className="text-sm font-bold text-slate-900">
              Session 2 (Evening OPD Hours - Optional)
            </h3>
          </div>
          <button
            type="button"
            onClick={() =>
              onChange({
                hasSession2: !data.hasSession2,
                session2:
                  !data.hasSession2 && !data.session2
                    ? { openTime: '17:00', closeTime: '20:30', hasBreak: false }
                    : data.session2,
              })
            }
            className={`text-xs px-2.5 py-1 rounded font-medium border transition-colors ${
              data.hasSession2
                ? 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100'
                : 'bg-teal-50 text-teal-800 border-teal-200 hover:bg-teal-100'
            }`}
          >
            {data.hasSession2 ? 'Remove Session 2' : '+ Enable Evening Session'}
          </button>
        </div>

        {data.hasSession2 && data.session2 && (
          <div className="space-y-4 animate-in fade-in duration-150">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label
                  htmlFor="s2-open"
                  className="block text-xs font-semibold text-slate-700"
                >
                  Evening Opening Time
                </label>
                <input
                  id="s2-open"
                  type="time"
                  value={data.session2.openTime}
                  onChange={(e) => updateSession2({ openTime: e.target.value })}
                  className="w-full bg-slate-50 text-slate-900 text-sm rounded-lg border border-slate-300 p-2.5 focus:border-teal-600 focus:bg-white focus:outline-none"
                />
                {errors.session2_openTime && (
                  <p className="text-xs text-red-600 font-medium">{errors.session2_openTime}</p>
                )}
              </div>

              <div className="space-y-1">
                <label
                  htmlFor="s2-close"
                  className="block text-xs font-semibold text-slate-700"
                >
                  Evening Closing Time
                </label>
                <input
                  id="s2-close"
                  type="time"
                  value={data.session2.closeTime}
                  onChange={(e) => updateSession2({ closeTime: e.target.value })}
                  className="w-full bg-slate-50 text-slate-900 text-sm rounded-lg border border-slate-300 p-2.5 focus:border-teal-600 focus:bg-white focus:outline-none"
                />
                {errors.session2_closeTime && (
                  <p className="text-xs text-red-600 font-medium">
                    {errors.session2_closeTime}
                  </p>
                )}
              </div>
            </div>

            {/* Break for Session 2 */}
            <div className="pt-2 border-t border-slate-100 space-y-3">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={data.session2.hasBreak}
                  onChange={(e) => updateSession2({ hasBreak: e.target.checked })}
                  className="w-4 h-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500 accent-teal-600 cursor-pointer"
                />
                <span className="text-xs font-medium text-slate-700">
                  Include break during Session 2
                </span>
              </label>

              {data.session2.hasBreak && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-3.5 rounded-lg border border-slate-200">
                  <div className="space-y-1">
                    <label
                      htmlFor="s2-break-start"
                      className="block text-xs font-semibold text-slate-600"
                    >
                      Break Start Time
                    </label>
                    <input
                      id="s2-break-start"
                      type="time"
                      value={data.session2.breakStart || ''}
                      onChange={(e) => updateSession2({ breakStart: e.target.value })}
                      className="w-full bg-white text-slate-900 text-xs rounded border border-slate-300 p-2 focus:border-teal-600 focus:outline-none"
                    />
                    {errors.session2_breakStart && (
                      <p className="text-xs text-red-600 font-medium">
                        {errors.session2_breakStart}
                      </p>
                    )}
                  </div>

                  <div className="space-y-1">
                    <label
                      htmlFor="s2-break-end"
                      className="block text-xs font-semibold text-slate-600"
                    >
                      Break End Time
                    </label>
                    <input
                      id="s2-break-end"
                      type="time"
                      value={data.session2.breakEnd || ''}
                      onChange={(e) => updateSession2({ breakEnd: e.target.value })}
                      className="w-full bg-white text-slate-900 text-xs rounded border border-slate-300 p-2 focus:border-teal-600 focus:outline-none"
                    />
                    {errors.session2_breakEnd && (
                      <p className="text-xs text-red-600 font-medium">
                        {errors.session2_breakEnd}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Live Tentative Token & Slot Generation Preview */}
      <div className="bg-slate-50 rounded-xl border border-slate-200 p-5 space-y-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-teal-600" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
              Live Tentative Slot &amp; Token Preview (Session 1)
            </h3>
          </div>
          <span className="text-[11px] text-slate-500 font-mono">
            {activeDuration}m intervals
          </span>
        </div>

        <p className="text-xs text-slate-600 leading-relaxed">
          Based on your average duration of <strong>{activeDuration} minutes</strong>, here is how
          your sequential queue tokens, consultation windows, and automated WhatsApp patient arrival
          estimates are structured:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 pt-1">
          {slotPreview.map((slot) => (
            <div
              key={slot.tokenNumber}
              className="bg-white p-3 rounded-lg border border-slate-200 space-y-1 text-xs shadow-2xs"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold text-slate-900 text-sm">
                  {slot.formattedToken}
                </span>
                <span className="text-[10px] font-semibold text-teal-700 bg-teal-50 px-1.5 py-0.5 rounded border border-teal-200">
                  Tentative
                </span>
              </div>
              <div className="text-slate-700 font-medium">
                {slot.startTime} – {slot.endTime}
              </div>
              <div className="text-[11px] text-slate-500">
                Patient Arrival: <span className="text-slate-800 font-mono">{slot.arrivalWindow}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Walk-in Acceptance Setting */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-2 shadow-xs">
        <label className="flex items-center gap-3 cursor-pointer select-none">
          <input
            id="accepts-walkins"
            type="checkbox"
            checked={data.acceptsWalkIns}
            onChange={(e) => onChange({ acceptsWalkIns: e.target.checked })}
            className="w-4 h-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500 accent-teal-600 cursor-pointer"
          />
          <div>
            <span className="text-xs font-bold text-slate-900 block">
              Accept Walk-In Patients at Clinic Reception Counter
            </span>
            <span className="text-xs text-slate-500 block mt-0.5">
              Enables printable QR code generation for your reception counter acrylic stand
            </span>
          </div>
        </label>
      </div>

      {/* Live Illustrative Theoretical Capacity Calculator */}
      <div className="bg-slate-900 text-white rounded-xl p-5 md:p-6 border border-slate-800 space-y-4 shadow-sm">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Calculator className="w-4 h-4 text-teal-400" />
            <h3 className="text-sm font-bold text-white">
              Live Theoretical Appointment Capacity
            </h3>
          </div>
          <span className="text-xs font-mono text-teal-400">
            {capacity.availableMinutes} total active mins / day
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          <div className="bg-slate-800/80 rounded-lg p-3.5 border border-slate-700/80">
            <span className="text-xs text-slate-400 block">Active Clinical Time</span>
            <span className="text-xl font-bold font-mono text-white mt-1 block">
              {Math.floor(capacity.availableMinutes / 60)}h {capacity.availableMinutes % 60}m
            </span>
            <span className="text-[11px] text-slate-400 mt-0.5 block">
              Session duration minus breaks
            </span>
          </div>

          <div className="bg-slate-800/80 rounded-lg p-3.5 border border-slate-700/80">
            <span className="text-xs text-slate-400 block">Avg. Duration</span>
            <span className="text-xl font-bold font-mono text-teal-400 mt-1 block">
              {activeDuration} mins
            </span>
            <span className="text-[11px] text-slate-400 mt-0.5 block">Per patient consultation</span>
          </div>

          <div className="bg-teal-950/60 rounded-lg p-3.5 border border-teal-800/80">
            <span className="text-xs text-teal-300 block">Theoretical Daily Max</span>
            <span className="text-2xl font-extrabold font-mono text-teal-300 mt-1 block">
              {capacity.theoreticalCapacity} consultations
            </span>
            <span className="text-[11px] text-teal-400 mt-0.5 block">
              floor({capacity.availableMinutes} / {activeDuration})
            </span>
          </div>
        </div>

        <div className="p-3 bg-slate-800/60 rounded-lg border border-slate-700 text-xs text-slate-300 flex items-start gap-2 leading-relaxed">
          <Info className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
          <span>
            <strong>Capacity Calculation Transparency:</strong> This figure represents a theoretical
            maximum based on uninterrupted slots. Actual consultation capacity may be lower due to
            clinical emergencies, case severity overruns, administrative buffers, and patient
            handover.
          </span>
        </div>
      </div>
    </div>
  );
};
