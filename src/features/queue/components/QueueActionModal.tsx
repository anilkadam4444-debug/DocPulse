import React, { useState } from 'react';
import { X, AlertTriangle, CheckCircle2, UserX, Ban, Stethoscope } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Appointment, QueueStatus } from '../../booking/types';

interface QueueActionModalProps {
  isOpen: boolean;
  appointment: Appointment | null;
  targetAction: 'complete' | 'no_show' | 'cancel' | null;
  onClose: () => void;
  onConfirm: (appointment: Appointment, newStatus: QueueStatus, notes?: string) => Promise<void>;
}

export const QueueActionModal: React.FC<QueueActionModalProps> = ({
  isOpen,
  appointment,
  targetAction,
  onClose,
  onConfirm,
}) => {
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !appointment || !targetAction) return null;

  const handleConfirm = async () => {
    setIsSubmitting(true);
    let targetStatus: QueueStatus = 'completed';
    if (targetAction === 'no_show') targetStatus = 'no_show';
    if (targetAction === 'cancel') targetStatus = 'cancelled';

    await onConfirm(appointment, targetStatus, notes.trim());
    setIsSubmitting(false);
    setNotes('');
    onClose();
  };

  const titles = {
    complete: 'Complete Patient Consultation',
    no_show: 'Mark Patient as No-Show',
    cancel: 'Cancel Patient Appointment',
  };

  const icons = {
    complete: <CheckCircle2 className="w-5 h-5 text-emerald-600" />,
    no_show: <UserX className="w-5 h-5 text-purple-600" />,
    cancel: <Ban className="w-5 h-5 text-rose-600" />,
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center">
              {icons[targetAction]}
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">{titles[targetAction]}</h3>
              <p className="text-xs text-slate-500">
                Token {appointment.formattedToken || `T-${appointment.tokenNumber}`} · {appointment.patientName}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 text-xs">
          {targetAction === 'complete' && (
            <div className="space-y-3">
              <p className="text-slate-600 leading-relaxed">
                Confirm finishing the consultation for <strong>{appointment.patientName}</strong>. This marks the token as completed and advances the OPD queue.
              </p>
              <div>
                <label htmlFor="clinical-notes-textarea" className="block font-semibold text-slate-700 mb-1">
                  Doctor Clinical Summary / OPD Notes (Optional)
                </label>
                <textarea
                  id="clinical-notes-textarea"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Advised rest, analgesics for 5 days. Follow up in 7 days."
                  rows={3}
                  className="w-full bg-slate-50 text-slate-900 text-xs rounded-lg border border-slate-300 p-2.5 focus:border-teal-600 focus:bg-white focus:outline-none"
                />
              </div>
            </div>
          )}

          {targetAction === 'no_show' && (
            <div className="space-y-3">
              <div className="p-3 bg-purple-50 border border-purple-200 rounded-xl text-purple-900 space-y-1">
                <span className="font-bold block">Patient Missed Turn</span>
                <p>
                  Marking <strong>{appointment.patientName}</strong> as No-Show retains their token record for clinical audit while removing them from the active waiting queue.
                </p>
              </div>
              <div>
                <label htmlFor="no-show-notes-textarea" className="block font-semibold text-slate-700 mb-1">
                  Reason / Notes (Optional)
                </label>
                <input
                  id="no-show-notes-textarea"
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Unreachable on WhatsApp / Called 3 times"
                  className="w-full bg-slate-50 text-slate-900 text-xs rounded-lg border border-slate-300 py-2 px-3 focus:border-teal-600 focus:bg-white focus:outline-none"
                />
              </div>
            </div>
          )}

          {targetAction === 'cancel' && (
            <div className="space-y-3">
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-900 space-y-1">
                <span className="font-bold block">Cancel Appointment</span>
                <p>
                  Are you sure you want to cancel the appointment for <strong>{appointment.patientName}</strong>? The booked time slot will be freed.
                </p>
              </div>
              <div>
                <label htmlFor="cancel-reason-textarea" className="block font-semibold text-slate-700 mb-1">
                  Cancellation Reason
                </label>
                <input
                  id="cancel-reason-textarea"
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Patient requested reschedule / Emergency"
                  className="w-full bg-slate-50 text-slate-900 text-xs rounded-lg border border-slate-300 py-2 px-3 focus:border-teal-600 focus:bg-white focus:outline-none"
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2.5">
          <Button variant="outline" size="sm" onClick={onClose} disabled={isSubmitting}>
            Go Back
          </Button>
          <Button
            variant={targetAction === 'cancel' || targetAction === 'no_show' ? 'danger' : 'primary'}
            size="sm"
            onClick={handleConfirm}
            isLoading={isSubmitting}
          >
            {targetAction === 'complete'
              ? 'Complete Consultation'
              : targetAction === 'no_show'
              ? 'Confirm No-Show'
              : 'Confirm Cancellation'}
          </Button>
        </div>
      </div>
    </div>
  );
};
