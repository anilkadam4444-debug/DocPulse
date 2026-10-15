import React from 'react';
import {
  IndianRupee,
  Clock,
  Video,
  Building,
  AlertCircle,
  ShieldAlert,
  Calendar,
  Sparkles,
} from 'lucide-react';
import { ConsultationSettings } from '../../../types/auth';
import { Input } from '../../../components/ui/Input';

interface ConsultationSectionProps {
  settings: ConsultationSettings;
  onChange: (settings: ConsultationSettings) => void;
}

const DURATION_OPTIONS = [
  { value: 10, label: '10 Mins', desc: 'High-throughput OPD / Follow-ups' },
  { value: 15, label: '15 Mins', desc: 'Standard General Medicine (Recommended)' },
  { value: 20, label: '20 Mins', desc: 'Pediatrics / Chronic Care Reviews' },
  { value: 30, label: '30 Mins', desc: 'Specialty consultations & procedures' },
  { value: 45, label: '45 Mins', desc: 'Psychiatry / Detailed case workups' },
];

export const ConsultationSection: React.FC<ConsultationSectionProps> = ({
  settings,
  onChange,
}) => {
  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="border-b border-slate-200 pb-4">
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <IndianRupee className="w-5 h-5 text-teal-600" />
          Consultation Fees &amp; Session Duration
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Configure baseline OPD pricing, follow-up complimentary windows, consultation slot duration, and emergency buffers.
        </p>
      </div>

      {/* Pricing Matrix */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-2">
          <label className="block text-xs font-semibold text-slate-700">
            Standard OPD Consultation Fee
          </label>
          <Input
            type="number"
            placeholder="500"
            value={settings.defaultFee}
            onChange={(e) => onChange({ ...settings, defaultFee: e.target.value })}
            required
            leftIcon={<IndianRupee className="w-4 h-4 text-slate-400" />}
          />
          <p className="text-[11px] text-slate-500">First-time or routine in-person consultation</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-2">
          <label className="block text-xs font-semibold text-slate-700">
            Follow-Up Consultation Fee
          </label>
          <Input
            type="number"
            placeholder="0"
            value={settings.followUpFee}
            onChange={(e) => onChange({ ...settings, followUpFee: e.target.value })}
            leftIcon={<IndianRupee className="w-4 h-4 text-slate-400" />}
          />
          <p className="text-[11px] text-slate-500">Enter ₹0 for complimentary follow-up</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-2">
          <label className="block text-xs font-semibold text-slate-700">
            Follow-Up Validity Window
          </label>
          <select
            value={settings.followUpDays}
            onChange={(e) =>
              onChange({ ...settings, followUpDays: parseInt(e.target.value, 10) })
            }
            className="w-full h-10 px-3 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-teal-600 text-slate-800"
          >
            <option value={3}>Within 3 days</option>
            <option value={5}>Within 5 days</option>
            <option value={7}>Within 7 days (Standard)</option>
            <option value={10}>Within 10 days</option>
            <option value={14}>Within 14 days (2 weeks)</option>
            <option value={30}>Within 30 days (1 month)</option>
          </select>
          <p className="text-[11px] text-slate-500">Days after initial visit follow-up rate applies</p>
        </div>
      </div>

      {/* Consultation Slot Duration */}
      <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 space-y-3">
        <div>
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Clock className="w-4 h-4 text-teal-600" />
            Average Consultation Slot Duration
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            The mathematical engine uses this duration to calculate WhatsApp arrival estimation and queue capacity.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 pt-1">
          {DURATION_OPTIONS.map((opt) => {
            const isSelected = settings.avgDurationMinutes === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => onChange({ ...settings, avgDurationMinutes: opt.value })}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-teal-50/80 border-teal-500 ring-1 ring-teal-500 shadow-xs'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <span
                  className={`text-base font-extrabold block ${
                    isSelected ? 'text-teal-900' : 'text-slate-800'
                  }`}
                >
                  {opt.label}
                </span>
                <span className="text-[11px] text-slate-500 block mt-1 leading-snug">
                  {opt.desc}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Emergency Reserve & Consultation Modes */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Emergency Slot Buffer */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-2.5">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-amber-600" />
            <h3 className="text-xs font-bold text-slate-900">Emergency &amp; Urgent Case Reserve</h3>
          </div>
          <p className="text-xs text-slate-500">
            Number of reserve slots withheld from public online booking to accommodate walk-in acute emergencies.
          </p>
          <div className="pt-1">
            <select
              value={settings.emergencyReserveSlots}
              onChange={(e) =>
                onChange({
                  ...settings,
                  emergencyReserveSlots: parseInt(e.target.value, 10),
                })
              }
              className="w-full h-10 px-3 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-teal-600 text-slate-800 font-medium"
            >
              <option value={0}>0 slots (No emergency reserve)</option>
              <option value={1}>1 slot per OPD session</option>
              <option value={2}>2 slots per OPD session (Recommended)</option>
              <option value={4}>4 slots per OPD session</option>
            </select>
          </div>
        </div>

        {/* Consultation Modes */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-3">
          <h3 className="text-xs font-bold text-slate-900 flex items-center gap-2">
            <Video className="w-4 h-4 text-teal-600" />
            Enabled Consultation Channels
          </h3>

          <div className="space-y-2">
            <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs">
              <div className="flex items-center gap-2">
                <Building className="w-4 h-4 text-teal-700" />
                <div>
                  <span className="font-semibold text-slate-800 block">In-Clinic OPD Consultation</span>
                  <span className="text-[11px] text-slate-500">In-person physical clinic visits</span>
                </div>
              </div>
              <span className="text-[11px] font-semibold text-teal-700 bg-teal-100/60 px-2 py-0.5 rounded">
                Always Enabled
              </span>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-lg border border-slate-200 text-xs">
              <div className="flex items-center gap-2">
                <Video className="w-4 h-4 text-indigo-600" />
                <div>
                  <span className="font-semibold text-slate-800 block">Telemedicine / Video Consultation</span>
                  <span className="text-[11px] text-slate-500">Remote digital consultation via secure link</span>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.videoConsultationEnabled}
                  onChange={(e) =>
                    onChange({ ...settings, videoConsultationEnabled: e.target.checked })
                  }
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-teal-600" />
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
