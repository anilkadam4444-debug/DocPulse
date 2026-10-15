import React from 'react';
import {
  Sliders,
  QrCode,
  MessageSquare,
  Users,
  Calendar,
  Clock,
  CheckCircle2,
  Bell,
  Sparkles,
} from 'lucide-react';
import { BookingPreferences } from '../../../types/auth';

interface PreferencesSectionProps {
  preferences: BookingPreferences;
  onChange: (preferences: BookingPreferences) => void;
}

export const PreferencesSection: React.FC<PreferencesSectionProps> = ({
  preferences,
  onChange,
}) => {
  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="border-b border-slate-200 pb-4">
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <Sliders className="w-5 h-5 text-teal-600" />
          Queue Automation &amp; Patient Booking Preferences
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Configure live patient token capacity, reception walk-in stand behavior, and automated WhatsApp alert triggers.
        </p>
      </div>

      {/* Main Settings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Token Quota */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-3">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-teal-600" />
            <h3 className="text-xs font-bold text-slate-900">
              Daily OPD Token Limit / Patient Capacity
            </h3>
          </div>
          <p className="text-xs text-slate-500">
            Maximum number of patient tokens issued per OPD session across online bookings and walk-ins.
          </p>
          <div className="pt-1">
            <select
              value={preferences.dailyTokenLimit}
              onChange={(e) =>
                onChange({
                  ...preferences,
                  dailyTokenLimit: parseInt(e.target.value, 10),
                })
              }
              className="w-full h-10 px-3 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-teal-600 font-semibold text-slate-800"
            >
              <option value={15}>15 Patients per session (Boutique practice)</option>
              <option value={20}>20 Patients per session</option>
              <option value={25}>25 Patients per session</option>
              <option value={30}>30 Patients per session (Standard OPD)</option>
              <option value={40}>40 Patients per session (High volume)</option>
              <option value={50}>50 Patients per session (Max cap)</option>
            </select>
          </div>
        </div>

        {/* WhatsApp Notification Alert Trigger */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-3">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-emerald-600" />
            <h3 className="text-xs font-bold text-slate-900">
              WhatsApp Dynamic Arrival Ping Threshold
            </h3>
          </div>
          <p className="text-xs text-slate-500">
            Automatically dispatch an SMS/WhatsApp reminder pinging the patient when their turn is approaching.
          </p>
          <div className="pt-1">
            <select
              value={preferences.whatsAppAlertThreshold}
              onChange={(e) =>
                onChange({
                  ...preferences,
                  whatsAppAlertThreshold: parseInt(e.target.value, 10),
                })
              }
              className="w-full h-10 px-3 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-teal-600 font-semibold text-slate-800"
            >
              <option value={2}>Alert when 2 patients are ahead (Immediate proximity)</option>
              <option value={3}>Alert when 3 patients are ahead (Recommended ~30-45 mins)</option>
              <option value={4}>Alert when 4 patients are ahead (~1 hour notice)</option>
              <option value={5}>Alert when 5 patients are ahead</option>
            </select>
          </div>
        </div>

        {/* Advance Booking Calendar Horizon */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-3">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-indigo-600" />
            <h3 className="text-xs font-bold text-slate-900">
              Patient Advance Booking Window
            </h3>
          </div>
          <p className="text-xs text-slate-500">
            How many days in advance patients can book online appointments through your public clinic portal.
          </p>
          <div className="pt-1">
            <select
              value={preferences.advanceBookingDays}
              onChange={(e) =>
                onChange({
                  ...preferences,
                  advanceBookingDays: parseInt(e.target.value, 10),
                })
              }
              className="w-full h-10 px-3 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-teal-600 font-semibold text-slate-800"
            >
              <option value={1}>Same Day Only (07:00 AM onwards)</option>
              <option value={3}>Up to 3 Days in Advance</option>
              <option value={7}>Up to 7 Days in Advance (Standard 1 Week)</option>
              <option value={14}>Up to 14 Days in Advance</option>
              <option value={30}>Up to 30 Days in Advance</option>
            </select>
          </div>
        </div>

        {/* Cancellation Notice Cutoff */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-3">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-slate-600" />
            <h3 className="text-xs font-bold text-slate-900">
              Patient Cancellation Notice Policy
            </h3>
          </div>
          <p className="text-xs text-slate-500">
            Minimum lead time required for patients to cancel or reschedule without marking as no-show.
          </p>
          <div className="pt-1">
            <select
              value={preferences.cancellationNoticeHours}
              onChange={(e) =>
                onChange({
                  ...preferences,
                  cancellationNoticeHours: parseInt(e.target.value, 10),
                })
              }
              className="w-full h-10 px-3 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-teal-600 font-semibold text-slate-800"
            >
              <option value={1}>1 hour prior to session</option>
              <option value={2}>2 hours prior to session (Standard)</option>
              <option value={4}>4 hours prior to session</option>
              <option value={12}>12 hours prior to session</option>
            </select>
          </div>
        </div>
      </div>

      {/* Feature Toggles Card */}
      <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 space-y-4">
        <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider text-slate-600">
          Reception &amp; Automated Dispatch Toggles
        </h3>

        <div className="space-y-3">
          {/* Walk-in QR toggle */}
          <div className="flex items-center justify-between p-3 rounded-lg bg-white border border-slate-200">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-teal-50 text-teal-700 mt-0.5">
                <QrCode className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-900 block">
                  Reception Stand QR Check-In
                </span>
                <span className="text-xs text-slate-500">
                  Allow walk-in patients to scan clinic reception QR code with their camera to join the queue.
                </span>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer shrink-0">
              <input
                type="checkbox"
                checked={preferences.walkInQREnabled}
                onChange={(e) =>
                  onChange({ ...preferences, walkInQREnabled: e.target.checked })
                }
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-teal-600" />
            </label>
          </div>

          {/* Auto confirm online */}
          <div className="flex items-center justify-between p-3 rounded-lg bg-white border border-slate-200">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-emerald-50 text-emerald-700 mt-0.5">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-900 block">
                  Instant Auto-Confirmation for Online Bookings
                </span>
                <span className="text-xs text-slate-500">
                  Instantly issue queue token numbers upon online booking without requiring manual assistant confirmation.
                </span>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer shrink-0">
              <input
                type="checkbox"
                checked={preferences.autoConfirmOnline}
                onChange={(e) =>
                  onChange({ ...preferences, autoConfirmOnline: e.target.checked })
                }
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-teal-600" />
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};
