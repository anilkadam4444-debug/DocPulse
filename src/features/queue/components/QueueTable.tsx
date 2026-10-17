import React from 'react';
import {
  Clock,
  MessageCircle,
  Phone,
  UserCheck,
  Play,
  CheckCircle2,
  AlertCircle,
  UserX,
  MoreVertical,
  QrCode,
  Calendar,
  AlertTriangle,
  ArrowRight,
} from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Appointment, QueueStatus } from '../../booking/types';
import { QueueEstimationResult } from '../estimationEngine';

interface QueueTableProps {
  queueEntries: Appointment[];
  estimations: Map<string, QueueEstimationResult>;
  onMarkArrived: (apt: Appointment) => void;
  onCallPatient: (apt: Appointment) => void;
  onStartConsultation: (apt: Appointment) => void;
  onRequestComplete: (apt: Appointment) => void;
  onRequestNoShow: (apt: Appointment) => void;
  onRequestCancel: (apt: Appointment) => void;
}

export const QueueTable: React.FC<QueueTableProps> = ({
  queueEntries,
  estimations,
  onMarkArrived,
  onCallPatient,
  onStartConsultation,
  onRequestComplete,
  onRequestNoShow,
  onRequestCancel,
}) => {
  if (queueEntries.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center space-y-3">
        <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
          <Calendar className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-slate-900">No Patient Queue Entries Found</h3>
        <p className="text-xs text-slate-500 max-w-sm mx-auto">
          There are no scheduled appointments or waiting patients for this location and date filter.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 text-slate-600 uppercase tracking-wider font-semibold border-b border-slate-200">
            <tr>
              <th className="py-3.5 px-4 font-bold">Token</th>
              <th className="py-3.5 px-4 font-bold">Patient Details</th>
              <th className="py-3.5 px-4 font-bold">Channel</th>
              <th className="py-3.5 px-4 font-bold">Planned Slot</th>
              <th className="py-3.5 px-4 font-bold">Estimated Visit Time</th>
              <th className="py-3.5 px-4 font-bold">Queue Status</th>
              <th className="py-3.5 px-4 font-bold text-right">OPD Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {queueEntries.map((apt) => {
              const est = estimations.get(apt.appointmentId);
              const rawStatus = (apt.queueStatus || apt.status) as QueueStatus | 'confirmed';
              const formattedToken =
                apt.formattedToken || `T-${(apt.tokenNumber || 0).toString().padStart(2, '0')}`;

              const isServing = rawStatus === 'in_consultation';
              const isCalled = rawStatus === 'called';
              const isWaiting = rawStatus === 'waiting';
              const isScheduled = rawStatus === 'scheduled' || rawStatus === 'confirmed';
              const isFinished = rawStatus === 'completed';
              const isNoShow = rawStatus === 'no_show';
              const isCancelled = rawStatus === 'cancelled';

              const rowBg = isServing
                ? 'bg-teal-50/70 font-medium'
                : isCalled
                ? 'bg-amber-50/70 font-medium'
                : isFinished
                ? 'bg-slate-50/50 text-slate-400'
                : isNoShow || isCancelled
                ? 'bg-rose-50/30 text-slate-400'
                : 'hover:bg-slate-50/80 transition-colors';

              return (
                <tr key={apt.appointmentId} className={rowBg}>
                  {/* Token */}
                  <td className="py-4 px-4 font-mono">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-sm font-extrabold px-2.5 py-1 rounded-lg ${
                          isServing
                            ? 'bg-teal-600 text-white'
                            : isCalled
                            ? 'bg-amber-500 text-white animate-pulse'
                            : isWaiting
                            ? 'bg-slate-900 text-white'
                            : 'bg-slate-100 text-slate-800'
                        }`}
                      >
                        {formattedToken}
                      </span>
                    </div>
                  </td>

                  {/* Patient Details */}
                  <td className="py-4 px-4">
                    <div className="space-y-0.5">
                      <div className="font-bold text-slate-900 flex items-center gap-2">
                        <span>{apt.patientName}</span>
                        {apt.visitReason && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 font-normal truncate max-w-[150px]">
                            {apt.visitReason}
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-500 flex items-center gap-2 font-mono">
                        <span>+91 {apt.patientMobile}</span>
                        <a
                          href={`https://wa.me/91${apt.patientMobile}?text=${encodeURIComponent(
                            `Hello ${apt.patientName}, this is an update regarding your consultation token ${formattedToken} at ${apt.locationName}.`
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-emerald-700 hover:text-emerald-800 font-sans text-[10px] font-semibold"
                          title="Send WhatsApp Ping"
                        >
                          <MessageCircle className="w-3 h-3 fill-emerald-600 text-emerald-600" />
                          <span>WhatsApp</span>
                        </a>
                      </div>
                    </div>
                  </td>

                  {/* Channel */}
                  <td className="py-4 px-4">
                    <span className="inline-flex items-center gap-1.5 text-[11px] text-slate-600 font-medium">
                      {apt.bookingSource === 'walk_in_qr' ? (
                        <>
                          <QrCode className="w-3.5 h-3.5 text-slate-500" />
                          <span>Walk-In QR</span>
                        </>
                      ) : (
                        <>
                          <Clock className="w-3.5 h-3.5 text-teal-600" />
                          <span>Online Booking</span>
                        </>
                      )}
                    </span>
                  </td>

                  {/* Planned Appointment Time */}
                  <td className="py-4 px-4 font-mono font-medium text-slate-800">
                    <div>{apt.startTime} – {apt.endTime}</div>
                    <div className="text-[10px] text-slate-400 font-sans">
                      {apt.sessionType === 'session2' ? 'Evening OPD' : 'Morning OPD'}
                    </div>
                  </td>

                  {/* Estimated Visit Time */}
                  <td className="py-4 px-4">
                    <div className="space-y-0.5 font-mono">
                      <div
                        className={`font-bold ${
                          isServing
                            ? 'text-teal-700 font-sans'
                            : isCalled
                            ? 'text-amber-800 font-sans'
                            : est?.isDelayed
                            ? 'text-rose-600'
                            : 'text-slate-900'
                        }`}
                      >
                        {est?.estimatedStartTime12 || apt.startTime}
                      </div>

                      {est && est.patientsAhead > 0 && !isFinished && !isCancelled && !isNoShow && (
                        <div className="text-[10px] text-slate-500 font-sans flex items-center gap-1">
                          <span>{est.patientsAhead} {est.patientsAhead === 1 ? 'patient' : 'patients'} ahead</span>
                          {est.delayMinutes > 5 && (
                            <span className="text-rose-600 font-semibold">(+{est.delayMinutes}m delay)</span>
                          )}
                        </div>
                      )}
                    </div>
                  </td>

                  {/* Status Badge */}
                  <td className="py-4 px-4">
                    {isServing && (
                      <span className="px-2.5 py-1 rounded-full bg-teal-600 text-white font-bold text-[11px] inline-flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                        In Consultation
                      </span>
                    )}
                    {isCalled && (
                      <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 border border-amber-300 font-bold text-[11px] inline-flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping" />
                        Token Called
                      </span>
                    )}
                    {isWaiting && (
                      <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 font-semibold text-[11px]">
                        Waiting in Clinic
                      </span>
                    )}
                    {isScheduled && (
                      <span className="px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 font-semibold text-[11px]">
                        Scheduled (Not Arrived)
                      </span>
                    )}
                    {isFinished && (
                      <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-500 font-semibold text-[11px]">
                        Completed
                      </span>
                    )}
                    {isNoShow && (
                      <span className="px-2.5 py-1 rounded-full bg-purple-50 text-purple-700 border border-purple-200 font-semibold text-[11px]">
                        No-Show
                      </span>
                    )}
                    {isCancelled && (
                      <span className="px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200 font-semibold text-[11px]">
                        Cancelled
                      </span>
                    )}
                  </td>

                  {/* OPD Actions */}
                  <td className="py-4 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {isScheduled && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onMarkArrived(apt)}
                          leftIcon={<UserCheck className="w-3.5 h-3.5 text-teal-600" />}
                          className="text-xs font-semibold py-1 px-2.5 h-8 bg-white hover:bg-teal-50 hover:border-teal-300"
                        >
                          Mark Arrived
                        </Button>
                      )}

                      {isWaiting && (
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => onCallPatient(apt)}
                          leftIcon={<Phone className="w-3.5 h-3.5 fill-white" />}
                          className="text-xs font-bold py-1 px-3 h-8"
                        >
                          Call Token
                        </Button>
                      )}

                      {isCalled && (
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => onStartConsultation(apt)}
                          leftIcon={<Play className="w-3.5 h-3.5 fill-white" />}
                          className="text-xs font-bold py-1 px-3 h-8 bg-amber-600 hover:bg-amber-700 border-amber-600"
                        >
                          Start Consultation
                        </Button>
                      )}

                      {isServing && (
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => onRequestComplete(apt)}
                          leftIcon={<CheckCircle2 className="w-3.5 h-3.5" />}
                          className="text-xs font-bold py-1 px-3 h-8 bg-emerald-600 hover:bg-emerald-700 border-emerald-600"
                        >
                          Complete
                        </Button>
                      )}

                      {/* Dropdown / Secondary Options */}
                      {!isFinished && !isCancelled && (
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => onRequestNoShow(apt)}
                            title="Mark No-Show"
                            className="p-1.5 text-slate-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors cursor-pointer"
                          >
                            <UserX className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => onRequestCancel(apt)}
                            title="Cancel Appointment"
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          >
                            <AlertCircle className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
