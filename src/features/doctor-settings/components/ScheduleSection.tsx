import React from 'react';
import {
  Clock,
  Calendar,
  Coffee,
  Sun,
  Moon,
  Copy,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
} from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { DAYS_OF_WEEK } from '../../doctor-registration/constants';

interface SessionTiming {
  openTime: string;
  closeTime: string;
  hasBreak: boolean;
  breakStart?: string;
  breakEnd?: string;
}

interface ScheduleState {
  avgDurationMinutes: number;
  workingDays: string[];
  session1: SessionTiming;
  hasSession2: boolean;
  session2?: SessionTiming;
  acceptsWalkIns: boolean;
}

interface ScheduleSectionProps {
  schedule: ScheduleState;
  onChange: (schedule: ScheduleState) => void;
}

export const ScheduleSection: React.FC<ScheduleSectionProps> = ({
  schedule,
  onChange,
}) => {
  const toggleWorkingDay = (dayId: string) => {
    const exists = schedule.workingDays.includes(dayId);
    const updated = exists
      ? schedule.workingDays.filter((d) => d !== dayId)
      : [...schedule.workingDays, dayId];
    onChange({ ...schedule, workingDays: updated });
  };

  const handleSelectAllWeekdays = () => {
    onChange({
      ...schedule,
      workingDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
    });
  };

  const handleSelectMonToSat = () => {
    onChange({
      ...schedule,
      workingDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    });
  };

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="border-b border-slate-200 pb-4">
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-teal-600" />
          Working Hours, Sessions &amp; Break Buffers
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Configure days of practice, dual morning/evening OPD shifts, and intermission break periods.
        </p>
      </div>

      {/* Days of the Week Selection */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-xs font-bold text-slate-900">Weekly Operating OPD Days</h3>
            <p className="text-xs text-slate-500">
              Select days when you conduct active clinic OPD consultations.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleSelectMonToSat}
              className="text-[11px] text-teal-700 hover:text-teal-900 bg-teal-50 hover:bg-teal-100/70 px-2 py-1 rounded border border-teal-200 transition-colors cursor-pointer"
            >
              Mon – Sat (Standard)
            </button>
            <button
              type="button"
              onClick={handleSelectAllWeekdays}
              className="text-[11px] text-slate-600 hover:text-slate-800 bg-slate-100 hover:bg-slate-200/70 px-2 py-1 rounded border border-slate-200 transition-colors cursor-pointer"
            >
              Weekdays Only
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-2 pt-1">
          {DAYS_OF_WEEK.map((day) => {
            const isWorking = schedule.workingDays.includes(day.id);
            return (
              <button
                key={day.id}
                type="button"
                onClick={() => toggleWorkingDay(day.id)}
                className={`py-3 px-1 rounded-xl border text-center transition-all cursor-pointer ${
                  isWorking
                    ? 'bg-teal-600 border-teal-600 text-white font-bold shadow-xs'
                    : 'bg-slate-50 border-slate-200 text-slate-400 hover:bg-slate-100'
                }`}
              >
                <span className="block text-xs uppercase tracking-wider">{day.label}</span>
                <span className="text-[10px] block mt-1 font-normal opacity-90">
                  {isWorking ? 'Open' : 'Off'}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Session 1: Morning OPD */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Sun className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Morning Session OPD</h3>
              <p className="text-xs text-slate-500">First daily consultation shift</p>
            </div>
          </div>
          <span className="text-xs font-semibold text-teal-800 bg-teal-50 px-2.5 py-1 rounded border border-teal-200/60">
            Shift 1
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Start Time (OPD Opens)
            </label>
            <input
              type="time"
              value={schedule.session1.openTime}
              onChange={(e) =>
                onChange({
                  ...schedule,
                  session1: { ...schedule.session1, openTime: e.target.value },
                })
              }
              className="w-full h-10 px-3 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-teal-600 font-mono text-slate-900"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              End Time (OPD Closes)
            </label>
            <input
              type="time"
              value={schedule.session1.closeTime}
              onChange={(e) =>
                onChange({
                  ...schedule,
                  session1: { ...schedule.session1, closeTime: e.target.value },
                })
              }
              className="w-full h-10 px-3 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-teal-600 font-mono text-slate-900"
            />
          </div>
        </div>

        {/* Morning Session Break */}
        <div className="pt-2 border-t border-slate-100">
          <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={schedule.session1.hasBreak}
              onChange={(e) =>
                onChange({
                  ...schedule,
                  session1: { ...schedule.session1, hasBreak: e.target.checked },
                })
              }
              className="rounded text-teal-600 focus:ring-teal-500 w-4 h-4"
            />
            <span className="font-medium flex items-center gap-1.5">
              <Coffee className="w-3.5 h-3.5 text-slate-500" />
              Add mid-shift tea/procedure break
            </span>
          </label>

          {schedule.session1.hasBreak && (
            <div className="grid grid-cols-2 gap-4 mt-3 pl-6 animate-in fade-in duration-150">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Break Starts
                </label>
                <input
                  type="time"
                  value={schedule.session1.breakStart || '11:00'}
                  onChange={(e) =>
                    onChange({
                      ...schedule,
                      session1: { ...schedule.session1, breakStart: e.target.value },
                    })
                  }
                  className="w-full h-9 px-3 text-xs bg-white border border-slate-300 rounded-lg font-mono text-slate-900"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Break Resumes
                </label>
                <input
                  type="time"
                  value={schedule.session1.breakEnd || '11:30'}
                  onChange={(e) =>
                    onChange({
                      ...schedule,
                      session1: { ...schedule.session1, breakEnd: e.target.value },
                    })
                  }
                  className="w-full h-9 px-3 text-xs bg-white border border-slate-300 rounded-lg font-mono text-slate-900"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Session 2: Evening OPD */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Moon className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Evening Session OPD</h3>
              <p className="text-xs text-slate-500">Second daily shift (afternoon/evening hours)</p>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={schedule.hasSession2}
              onChange={(e) =>
                onChange({
                  ...schedule,
                  hasSession2: e.target.checked,
                  session2: e.target.checked
                    ? schedule.session2 || {
                        openTime: '17:00',
                        closeTime: '20:30',
                        hasBreak: false,
                        breakStart: '18:30',
                        breakEnd: '19:00',
                      }
                    : undefined,
                })
              }
              className="sr-only peer"
            />
            <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-teal-600" />
          </label>
        </div>

        {schedule.hasSession2 && schedule.session2 ? (
          <div className="space-y-4 animate-in fade-in duration-150">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Evening Start Time
                </label>
                <input
                  type="time"
                  value={schedule.session2.openTime}
                  onChange={(e) =>
                    onChange({
                      ...schedule,
                      session2: { ...schedule.session2!, openTime: e.target.value },
                    })
                  }
                  className="w-full h-10 px-3 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-teal-600 font-mono text-slate-900"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Evening End Time
                </label>
                <input
                  type="time"
                  value={schedule.session2.closeTime}
                  onChange={(e) =>
                    onChange({
                      ...schedule,
                      session2: { ...schedule.session2!, closeTime: e.target.value },
                    })
                  }
                  className="w-full h-10 px-3 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-teal-600 font-mono text-slate-900"
                />
              </div>
            </div>

            {/* Evening Break */}
            <div className="pt-2 border-t border-slate-100">
              <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={schedule.session2.hasBreak}
                  onChange={(e) =>
                    onChange({
                      ...schedule,
                      session2: { ...schedule.session2!, hasBreak: e.target.checked },
                    })
                  }
                  className="rounded text-teal-600 focus:ring-teal-500 w-4 h-4"
                />
                <span className="font-medium flex items-center gap-1.5">
                  <Coffee className="w-3.5 h-3.5 text-slate-500" />
                  Add mid-evening break buffer
                </span>
              </label>

              {schedule.session2.hasBreak && (
                <div className="grid grid-cols-2 gap-4 mt-3 pl-6">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Break Starts
                    </label>
                    <input
                      type="time"
                      value={schedule.session2.breakStart || '18:30'}
                      onChange={(e) =>
                        onChange({
                          ...schedule,
                          session2: { ...schedule.session2!, breakStart: e.target.value },
                        })
                      }
                      className="w-full h-9 px-3 text-xs bg-white border border-slate-300 rounded-lg font-mono text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Break Resumes
                    </label>
                    <input
                      type="time"
                      value={schedule.session2.breakEnd || '19:00'}
                      onChange={(e) =>
                        onChange({
                          ...schedule,
                          session2: { ...schedule.session2!, breakEnd: e.target.value },
                        })
                      }
                      className="w-full h-9 px-3 text-xs bg-white border border-slate-300 rounded-lg font-mono text-slate-900"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <p className="text-xs text-slate-400 italic">
            Evening shift disabled. Enable toggle above if you conduct dual shifts.
          </p>
        )}
      </div>
    </div>
  );
};
