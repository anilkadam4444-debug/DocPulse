import React from 'react';
import { Link } from 'react-router-dom';
import {
  CheckCircle2,
  Calendar,
  Clock,
  Building,
  MapPin,
  Phone,
  IndianRupee,
  Share2,
  Printer,
  ArrowRight,
  ExternalLink,
  ShieldCheck,
  CalendarPlus,
} from 'lucide-react';
import { Appointment } from '../types';
import { Button } from '../../../components/ui/Button';

interface BookingConfirmationViewProps {
  appointment: Appointment;
  doctorName: string;
  specialization: string;
  onBookAnother: () => void;
}

export const BookingConfirmationView: React.FC<BookingConfirmationViewProps> = ({
  appointment,
  doctorName,
  specialization,
  onBookAnother,
}) => {
  // Build Google Calendar URL
  const buildGoogleCalendarUrl = () => {
    const startTimeClean = appointment.startTime.replace(':', '');
    const endTimeClean = appointment.endTime.replace(':', '');
    const dateClean = appointment.appointmentDate.replace(/-/g, '');

    const startIso = `${dateClean}T${startTimeClean}00`;
    const endIso = `${dateClean}T${endTimeClean}00`;

    const title = encodeURIComponent(`Consultation: Dr. ${doctorName} (${specialization})`);
    const details = encodeURIComponent(
      `Appointment Ref: ${appointment.bookingReference}\nClinic: ${appointment.locationName}\nAddress: ${appointment.locationAddress}\nPatient: ${appointment.patientName}\nFee: ₹${appointment.consultationFee} (Payable at clinic)`
    );
    const location = encodeURIComponent(`${appointment.locationName}, ${appointment.locationAddress}, ${appointment.city}`);

    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startIso}/${endIso}&details=${details}&location=${location}`;
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 animate-in fade-in zoom-in-95 duration-250">
      {/* Success Badge & Header */}
      <div className="text-center space-y-3 pb-2">
        <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-xs">
          <CheckCircle2 className="w-9 h-9 stroke-[2.2]" />
        </div>
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
            Authoritative Booking Confirmed
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
            Appointment Reserved Successfully
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-lg mx-auto">
            Your consultation has been reserved directly in Dr. {doctorName}&apos;s practice management schedule.
          </p>
        </div>
      </div>

      {/* Booking Reference Card */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-2xl p-6 sm:p-7 shadow-md relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
              Booking Reference Number
            </span>
            <span className="text-2xl sm:text-3xl font-mono font-black text-teal-300 tracking-wider block mt-1">
              {appointment.bookingReference}
            </span>
            <span className="text-xs text-slate-300 mt-1 block">
              Quote this code upon arrival at clinic reception.
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Confirmed
            </span>
          </div>
        </div>
      </div>

      {/* Appointment Details Grid */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-7 space-y-5 shadow-xs">
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 border-b border-slate-100 pb-3">
          Consultation Summary
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs text-slate-600">
          {/* Doctor & Location */}
          <div className="space-y-3">
            <div>
              <span className="text-slate-400 block">Practitioner</span>
              <strong className="text-sm text-slate-900 block mt-0.5">{doctorName}</strong>
              <span className="text-teal-800 font-semibold">{specialization}</span>
            </div>

            <div>
              <span className="text-slate-400 block">Clinic Location</span>
              <strong className="text-slate-900 block mt-0.5">{appointment.locationName}</strong>
              <div className="flex items-start gap-1 mt-1 text-slate-600">
                <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                <span>
                  {appointment.locationAddress}, {appointment.city}
                </span>
              </div>
            </div>
          </div>

          {/* Timing & Fee */}
          <div className="space-y-3">
            <div>
              <span className="text-slate-400 block">Date &amp; Time</span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <Calendar className="w-3.5 h-3.5 text-teal-600" />
                <strong className="text-slate-900 font-mono text-sm">
                  {appointment.appointmentDate}
                </strong>
              </div>
              <div className="flex items-center gap-1.5 mt-1">
                <Clock className="w-3.5 h-3.5 text-teal-600" />
                <span className="text-slate-900 font-mono font-bold">
                  {appointment.startTime} – {appointment.endTime}
                </span>
                <span className="text-slate-400">({appointment.timeZone})</span>
              </div>
            </div>

            <div>
              <span className="text-slate-400 block">Consultation Fee</span>
              <div className="text-lg font-black text-slate-900 font-mono mt-0.5">
                ₹{appointment.consultationFee}
              </div>
              <span className="text-[11px] text-slate-400">Payable on-site at clinic reception</span>
            </div>
          </div>
        </div>

        {/* Patient Details Row */}
        <div className="border-t border-slate-100 pt-4 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div>
            <span className="text-slate-400 block">Patient Name</span>
            <strong className="text-slate-900 block mt-0.5">{appointment.patientName}</strong>
          </div>
          <div>
            <span className="text-slate-400 block">Mobile (SMS Token Updates)</span>
            <strong className="text-slate-900 font-mono block mt-0.5">+91 {appointment.patientMobile}</strong>
          </div>
          {appointment.patientEmail && (
            <div>
              <span className="text-slate-400 block">Email Address</span>
              <span className="text-slate-800 block mt-0.5">{appointment.patientEmail}</span>
            </div>
          )}
        </div>
      </div>

      {/* Practical Action Buttons */}
      <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
        <a
          href={buildGoogleCalendarUrl()}
          target="_blank"
          rel="noopener noreferrer"
        >
          <Button
            variant="outline"
            size="md"
            leftIcon={<CalendarPlus className="w-4 h-4 text-teal-600" />}
          >
            Add to Google Calendar
          </Button>
        </a>

        <Button
          variant="outline"
          size="md"
          onClick={handlePrint}
          leftIcon={<Printer className="w-4 h-4" />}
        >
          Print / Save Receipt
        </Button>

        <Button
          variant="primary"
          size="md"
          onClick={onBookAnother}
        >
          Book Another Appointment
        </Button>
      </div>

      {/* Return Links */}
      <div className="text-center pt-2">
        <Link
          to={`/doctors/${appointment.doctorUid}`}
          className="text-xs font-semibold text-teal-700 hover:text-teal-900 hover:underline"
        >
          Return to Dr. {doctorName}&apos;s Profile
        </Link>
        <span className="text-slate-300 mx-2">·</span>
        <Link
          to="/doctors"
          className="text-xs font-semibold text-slate-600 hover:text-slate-900 hover:underline"
        >
          Browse All Doctors
        </Link>
      </div>
    </div>
  );
};
