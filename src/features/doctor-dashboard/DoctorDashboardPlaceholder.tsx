import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Stethoscope,
  Users,
  Clock,
  QrCode,
  MessageCircle,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Play,
  RotateCcw,
  Building,
  Settings,
  Bell,
} from 'lucide-react';
import { formatQueueToken } from '../../lib/queue-calculator';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';

interface MockQueueItem {
  tokenNumber: number;
  formattedToken: string;
  patientName: string;
  age: number;
  gender: string;
  channel: 'Online Booking' | 'Walk-In QR';
  tentativeTime: string;
  status: 'serving' | 'next' | 'waiting' | 'completed';
  whatsappSent: boolean;
}

export const DoctorDashboardPlaceholder: React.FC = () => {
  const [currentServing, setCurrentServing] = useState(8);
  const [avgDuration, setAvgDuration] = useState(15);
  const [sessionActive, setSessionActive] = useState(true);
  const [alertSent, setAlertSent] = useState<string | null>(null);

  const [queueItems, setQueueItems] = useState<MockQueueItem[]>([
    {
      tokenNumber: 8,
      formattedToken: 'T-08',
      patientName: 'Sunita Mehra',
      age: 48,
      gender: 'F',
      channel: 'Online Booking',
      tentativeTime: '10:45 AM',
      status: 'serving',
      whatsappSent: true,
    },
    {
      tokenNumber: 9,
      formattedToken: 'T-09',
      patientName: 'Vikram Joshi',
      age: 34,
      gender: 'M',
      channel: 'Walk-In QR',
      tentativeTime: '11:00 AM',
      status: 'next',
      whatsappSent: true,
    },
    {
      tokenNumber: 10,
      formattedToken: 'T-10',
      patientName: 'Meera Patel',
      age: 29,
      gender: 'F',
      channel: 'Online Booking',
      tentativeTime: '11:15 AM',
      status: 'waiting',
      whatsappSent: true,
    },
    {
      tokenNumber: 11,
      formattedToken: 'T-11',
      patientName: 'Rajesh Kadam',
      age: 52,
      gender: 'M',
      channel: 'Walk-In QR',
      tentativeTime: '11:30 AM',
      status: 'waiting',
      whatsappSent: true,
    },
    {
      tokenNumber: 12,
      formattedToken: 'T-12',
      patientName: 'Amina Sheikh',
      age: 41,
      gender: 'F',
      channel: 'Online Booking',
      tentativeTime: '11:45 AM',
      status: 'waiting',
      whatsappSent: true,
    },
  ]);

  const handleCallNext = () => {
    if (currentServing < 12) {
      const nextToken = currentServing + 1;
      setCurrentServing(nextToken);
      setQueueItems((prev) =>
        prev.map((item) => {
          if (item.tokenNumber < nextToken) return { ...item, status: 'completed' };
          if (item.tokenNumber === nextToken) return { ...item, status: 'serving' };
          if (item.tokenNumber === nextToken + 1) return { ...item, status: 'next' };
          return item;
        })
      );
      setAlertSent(`Called Token ${formatQueueToken(nextToken)}. Automated WhatsApp arrival ping dispatched.`);
      setTimeout(() => setAlertSent(null), 3500);
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen py-8 lg:py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Phase Architectural Notice */}
        <div className="bg-slate-900 text-white rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs border border-slate-800">
          <div className="flex items-center gap-2.5">
            <span className="w-2 h-2 rounded-full bg-teal-400 shrink-0" />
            <span>
              <strong>Doctor CRM Architecture Preview:</strong> Single-doctor tenant console. Live
              Firestore real-time subscription &amp; WhatsApp Cloud Webhooks will connect in Phase 2.
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-teal-400 font-medium">Dr. Arun Sharma (Owner)</span>
            <span className="text-slate-500">·</span>
            <span className="text-slate-300">Tenant: aarogyam_bandra</span>
          </div>
        </div>

        {/* Practice Session Header Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 md:p-6 shadow-xs space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <Building className="w-3.5 h-3.5 text-teal-600" />
                <span className="font-semibold text-slate-800">Aarogyam Family Care Clinic</span>
                <span>·</span>
                <span>Linking Road, Bandra West, Mumbai</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">
                Today&apos;s OPD Consultation Console
              </h1>
            </div>

            {/* Quick Session Status */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200 text-xs">
                <span className="text-slate-500">Session Hours:</span>{' '}
                <strong className="text-slate-900">09:30 AM – 01:30 PM</strong>
              </div>
              <div className="bg-teal-50 text-teal-800 px-3 py-1.5 rounded-lg border border-teal-200 text-xs font-semibold">
                Status: {sessionActive ? 'Session Active' : 'Session Paused'}
              </div>
              <Button
                variant={sessionActive ? 'outline' : 'primary'}
                size="sm"
                onClick={() => setSessionActive(!sessionActive)}
              >
                {sessionActive ? 'Pause OPD' : 'Resume OPD'}
              </Button>
            </div>
          </div>

          {/* Operational Metrics Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
            <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200/80">
              <span className="text-xs text-slate-500 block">Now Serving Token</span>
              <span className="text-2xl font-bold text-teal-700 font-mono">
                {formatQueueToken(currentServing)}
              </span>
            </div>
            <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200/80">
              <span className="text-xs text-slate-500 block">Total Issued Tokens</span>
              <span className="text-2xl font-bold text-slate-900 font-mono">18</span>
            </div>
            <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200/80">
              <span className="text-xs text-slate-500 block">Avg. Duration Setting</span>
              <div className="flex items-center gap-2 mt-0.5">
                <select
                  value={avgDuration}
                  onChange={(e) => setAvgDuration(parseInt(e.target.value, 10))}
                  aria-label="Average consultation duration"
                  className="bg-white text-xs font-bold text-slate-900 border border-slate-300 rounded px-2 py-1"
                >
                  <option value={10}>10 mins</option>
                  <option value={15}>15 mins</option>
                  <option value={20}>20 mins</option>
                  <option value={30}>30 mins</option>
                </select>
              </div>
            </div>
            <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200/80">
              <span className="text-xs text-slate-500 block">WhatsApp Alert Engine</span>
              <span className="text-xs font-semibold text-emerald-700 flex items-center gap-1 mt-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Active · 100% Sent
              </span>
            </div>
          </div>

          {/* Call Next Action Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
            <div className="flex items-center gap-2 text-xs text-slate-600">
              <span className="font-semibold text-slate-800">Quick Actions:</span>
              <span>Advance queue to trigger automated WhatsApp notification to next in line.</span>
            </div>
            <div className="flex items-center gap-2.5 w-full sm:w-auto">
              <Button
                variant="primary"
                size="md"
                onClick={handleCallNext}
                disabled={currentServing >= 12}
                rightIcon={currentServing < 12 ? <Play className="w-4 h-4 fill-white" /> : undefined}
                className="w-full sm:w-auto justify-center"
              >
                {currentServing >= 12
                  ? "All Today's OPD Patients Served"
                  : `Call Next Patient (${formatQueueToken(currentServing + 1)})`}
              </Button>
            </div>
          </div>

          {alertSent && (
            <div className="p-3 rounded-lg bg-teal-50 border border-teal-200 text-teal-900 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
              <span>{alertSent}</span>
            </div>
          )}
        </div>

        {/* Live Queue Table */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">Today&apos;s Active Patient Queue</h2>
              <p className="text-xs text-slate-500">
                Unified chronological order of Online Bookings and Reception Walk-In QR check-ins
              </p>
            </div>
            <span className="text-xs text-slate-500">
              Assigned Assistant: <strong>Pooja (Reception)</strong>
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Token</th>
                  <th className="py-3 px-4">Patient Name</th>
                  <th className="py-3 px-4">Channel</th>
                  <th className="py-3 px-4">Tentative Time</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">WhatsApp Alert</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {queueItems.map((item) => (
                  <tr
                    key={item.tokenNumber}
                    className={
                      item.status === 'serving'
                        ? 'bg-teal-50/60 font-medium'
                        : item.status === 'completed'
                        ? 'bg-slate-50/60 text-slate-400'
                        : 'hover:bg-slate-50/80 transition-colors'
                    }
                  >
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                      {item.formattedToken}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-900">{item.patientName}</div>
                      <div className="text-[11px] text-slate-400">
                        {item.age} yrs · {item.gender}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1 text-[11px] text-slate-600">
                        {item.channel === 'Walk-In QR' ? (
                          <QrCode className="w-3 h-3 text-slate-500" />
                        ) : (
                          <Clock className="w-3 h-3 text-teal-600" />
                        )}
                        {item.channel}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-800">{item.tentativeTime}</td>
                    <td className="py-3.5 px-4">
                      {item.status === 'serving' && (
                        <span className="px-2 py-0.5 rounded bg-teal-600 text-white font-medium text-[11px]">
                          Now Inside
                        </span>
                      )}
                      {item.status === 'next' && (
                        <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 font-medium text-[11px]">
                          Next Up
                        </span>
                      )}
                      {item.status === 'waiting' && (
                        <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 text-[11px]">
                          In Queue
                        </span>
                      )}
                      {item.status === 'completed' && (
                        <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-400 text-[11px]">
                          Completed
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1 text-emerald-700 font-medium text-[11px]">
                        <MessageCircle className="w-3 h-3 text-emerald-600 fill-emerald-600" />
                        Notified
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => {
                          setAlertSent(
                            `Prescription draft opened for ${item.patientName} (${item.formattedToken})`
                          );
                          setTimeout(() => setAlertSent(null), 3500);
                        }}
                        className="text-xs text-teal-700 hover:text-teal-900 font-medium hover:underline"
                      >
                        Prescribe
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Practice Architecture Notes */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-600">
          <Card className="p-4 bg-white border border-slate-200 space-y-1.5">
            <strong className="text-slate-900 block font-semibold">
              Reception QR Stand Generator
            </strong>
            <p>Download your clinic&apos;s printable vector acrylic counter display anytime.</p>
          </Card>
          <Card className="p-4 bg-white border border-slate-200 space-y-1.5">
            <strong className="text-slate-900 block font-semibold">
              Assistant Access Management
            </strong>
            <p>Pooja (Receptionist) is authorized for walk-in token generation and billing.</p>
          </Card>
          <Card className="p-4 bg-white border border-slate-200 space-y-1.5">
            <strong className="text-slate-900 block font-semibold">30-Day Free Trial Active</strong>
            <p>Zero charges until 15 Nov 2026. Enjoy full unlimited appointments.</p>
          </Card>
        </div>
      </div>
    </div>
  );
};
