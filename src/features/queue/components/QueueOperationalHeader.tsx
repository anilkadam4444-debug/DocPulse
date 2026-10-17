import React from 'react';
import {
  MapPin,
  Calendar,
  Clock,
  Play,
  Pause,
  PhoneCall,
  UserCheck,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Users,
  Activity,
} from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { PracticeLocation } from '../../../types/auth';
import { GlobalOPDQueueMetrics } from '../estimationEngine';
import { SessionOperationalStatus } from '../../booking/types';

interface QueueOperationalHeaderProps {
  locations: PracticeLocation[];
  selectedLocationId: string;
  onLocationChange: (locId: string) => void;
  selectedDate: string;
  onDateChange: (date: string) => void;
  metrics: GlobalOPDQueueMetrics;
  sessionStatus: SessionOperationalStatus;
  onToggleSessionStatus: () => void;
  onCallNext: () => void;
  isCallingNext: boolean;
  avgDuration: number;
  onAvgDurationChange: (duration: number) => void;
  onManualRefresh?: () => void;
}

export const QueueOperationalHeader: React.FC<QueueOperationalHeaderProps> = ({
  locations,
  selectedLocationId,
  onLocationChange,
  selectedDate,
  onDateChange,
  metrics,
  sessionStatus,
  onToggleSessionStatus,
  onCallNext,
  isCallingNext,
  avgDuration,
  onAvgDurationChange,
  onManualRefresh,
}) => {
  const selectedLocation = locations.find((l) => l.id === selectedLocationId) || locations[0];

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 md:p-6 shadow-xs space-y-5">
      {/* Top Filter Bar: Location & Date Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div className="flex flex-wrap items-center gap-3">
          {/* Location Selector */}
          <div className="relative min-w-[200px]">
            <label htmlFor="queue-location-selector" className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
              1. Practice Location
            </label>
            <div className="relative">
              <MapPin className="w-3.5 h-3.5 text-teal-600 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <select
                id="queue-location-selector"
                value={selectedLocationId}
                onChange={(e) => onLocationChange(e.target.value)}
                aria-label="Practice location for queue"
                className="w-full bg-slate-50 hover:bg-white text-slate-900 text-xs font-semibold rounded-lg border border-slate-300 py-2 pl-8 pr-7 focus:border-teal-600 focus:bg-white focus:outline-none transition-colors cursor-pointer"
              >
                {locations.map((loc) => (
                  <option key={loc.id} value={loc.id}>
                    {loc.name || loc.clinicName} ({loc.locality || loc.city})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Date Selector */}
          <div className="min-w-[170px]">
            <label htmlFor="queue-date-picker" className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
              2. Consultation Date
            </label>
            <div className="relative">
              <Calendar className="w-3.5 h-3.5 text-teal-600 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                id="queue-date-picker"
                type="date"
                value={selectedDate}
                onChange={(e) => onDateChange(e.target.value)}
                aria-label="Consultation date for queue"
                className="w-full bg-slate-50 hover:bg-white text-slate-900 text-xs font-semibold rounded-lg border border-slate-300 py-2 pl-8 pr-2.5 focus:border-teal-600 focus:bg-white focus:outline-none transition-colors cursor-pointer font-mono"
              />
            </div>
          </div>

          {/* Quick Date Short-cuts */}
          <div className="flex items-end gap-1.5 pt-4 sm:pt-0">
            <button
              type="button"
              onClick={() => {
                const now = new Date();
                const today = now.toISOString().split('T')[0];
                onDateChange(today);
              }}
              className="px-2.5 py-2 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
            >
              Today
            </button>
            <button
              type="button"
              onClick={() => {
                const tomorrow = new Date(Date.now() + 86400000);
                onDateChange(tomorrow.toISOString().split('T')[0]);
              }}
              className="px-2.5 py-2 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
            >
              Tomorrow
            </button>
          </div>
        </div>

        {/* Operational Session Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-2">
            <span
              className={`w-2 h-2 rounded-full ${
                sessionStatus === 'active'
                  ? 'bg-emerald-500 animate-pulse'
                  : sessionStatus === 'paused'
                  ? 'bg-amber-400'
                  : 'bg-slate-300'
              }`}
            />
            <span className="text-xs font-bold text-slate-800">
              {sessionStatus === 'active'
                ? 'OPD Session Live'
                : sessionStatus === 'paused'
                ? 'OPD Session Paused'
                : 'Session Standby'}
            </span>
          </div>

          <Button
            variant={sessionStatus === 'active' ? 'outline' : 'primary'}
            size="sm"
            onClick={onToggleSessionStatus}
            leftIcon={
              sessionStatus === 'active' ? (
                <Pause className="w-3.5 h-3.5 text-amber-600" />
              ) : (
                <Play className="w-3.5 h-3.5 fill-current" />
              )
            }
            className="text-xs font-semibold"
          >
            {sessionStatus === 'active' ? 'Pause OPD' : 'Resume OPD'}
          </Button>

          {onManualRefresh && (
            <button
              type="button"
              onClick={onManualRefresh}
              title="Refresh queue data"
              aria-label="Refresh queue data"
              className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Main Operational Dispatch Row */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
        {/* Card 1: Now Serving Token (4 cols) */}
        <div className="md:col-span-4 bg-teal-50/70 border border-teal-200/90 rounded-xl p-4 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-teal-800 flex items-center gap-1.5">
              <Activity className="w-3 h-3 text-teal-600" />
              Now Inside OPD Room
            </span>
            <div className="text-2xl font-extrabold text-teal-900 font-mono">
              {metrics.currentServingToken ? `T-${metrics.currentServingToken.toString().padStart(2, '0')}` : 'None Active'}
            </div>
            <div className="text-xs text-teal-800 truncate max-w-[200px] font-medium">
              {metrics.currentServingPatientName || 'No patient currently inside'}
            </div>
          </div>
          <div className="w-10 h-10 rounded-full bg-teal-600 text-white flex items-center justify-center font-bold text-sm shadow-xs">
            {metrics.currentServingToken || '—'}
          </div>
        </div>

        {/* Card 2: Next In Line (4 cols) */}
        <div className="md:col-span-4 bg-slate-50 border border-slate-200 rounded-xl p-4 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <Users className="w-3 h-3 text-slate-400" />
              Next Eligible Patient
            </span>
            <div className="text-2xl font-extrabold text-slate-900 font-mono">
              {metrics.nextUpToken ? `T-${metrics.nextUpToken.toString().padStart(2, '0')}` : 'Queue Clear'}
            </div>
            <div className="text-xs text-slate-600 truncate max-w-[200px]">
              {metrics.nextUpPatientName || 'All scheduled patients served'}
            </div>
          </div>
          <div className="w-10 h-10 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-sm">
            {metrics.nextUpToken || '—'}
          </div>
        </div>

        {/* Card 3: Call Next Button & Delay Status (4 cols) */}
        <div className="md:col-span-4 flex flex-col justify-center space-y-2">
          <Button
            variant="primary"
            size="lg"
            onClick={onCallNext}
            isLoading={isCallingNext}
            disabled={!metrics.nextUpToken}
            leftIcon={<PhoneCall className="w-4 h-4 fill-white" />}
            className="w-full justify-center text-sm font-bold shadow-xs py-3"
          >
            {metrics.nextUpToken
              ? `Call Next Patient (T-${metrics.nextUpToken.toString().padStart(2, '0')})`
              : 'All Patients Served'}
          </Button>

          <div className="flex items-center justify-between text-xs px-1 text-slate-500">
            <span className="flex items-center gap-1.5">
              {metrics.overallDelayMinutes > 10 ? (
                <span className="text-rose-600 font-bold flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  ~{metrics.overallDelayMinutes}m OPD Delay
                </span>
              ) : (
                <span className="text-emerald-700 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  OPD Schedule on Track
                </span>
              )}
            </span>

            <div className="flex items-center gap-1">
              <span className="text-[11px] text-slate-400">Duration:</span>
              <select
                value={avgDuration}
                onChange={(e) => onAvgDurationChange(parseInt(e.target.value, 10))}
                aria-label="Set average consultation duration in minutes"
                className="bg-transparent text-xs font-bold text-slate-800 border-none p-0 focus:outline-none cursor-pointer"
              >
                <option value={10}>10m</option>
                <option value={15}>15m</option>
                <option value={20}>20m</option>
                <option value={30}>30m</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
