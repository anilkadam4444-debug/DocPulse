import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Building,
  Users,
  UserPlus,
  Clock,
  Printer,
  CheckCircle2,
  AlertCircle,
  LogOut,
  Search,
  Filter,
  Phone,
  Sparkles,
  QrCode,
  Globe,
  ArrowRight,
  ShieldCheck,
  Calendar,
  Check,
  RotateCw,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { ReceptionistSession, WalkInRegistrationData } from './types';
import {
  getStoredReceptionistSession,
  logoutReceptionist,
  registerWalkInAtDesk,
  checkInPatientAtDesk,
} from './receptionistService';
import { Appointment, DailyQueue, QueueStatus } from '../booking/types';
import {
  subscribeToDailyQueue,
  updateQueueEntryStatus,
} from '../queue/queueService';
import { getNowInKolkata } from '../booking/bookingService';
import { calculateQueueEstimations } from '../queue/estimationEngine';

export const ReceptionistDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [session, setSession] = useState<ReceptionistSession | null>(null);

  // Date and location state
  const { dateStr: todayKolkata, timeStr: currentKolkataTime } = useMemo(() => getNowInKolkata(), []);
  const [selectedLocationId, setSelectedLocationId] = useState<string>('');

  // Queue state
  const [queueAppointments, setQueueAppointments] = useState<Appointment[]>([]);
  const [dailyQueueData, setDailyQueueData] = useState<DailyQueue | null>(null);
  const [activeFilter, setActiveFilter] = useState<'all' | 'waiting' | 'scheduled' | 'active' | 'completed'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Walk-in Registration Modal State
  const [isWalkInModalOpen, setIsWalkInModalOpen] = useState(false);
  const [isSubmittingWalkIn, setIsSubmittingWalkIn] = useState(false);
  const [walkInName, setWalkInName] = useState('');
  const [walkInMobile, setWalkInMobile] = useState('');
  const [walkInAge, setWalkInAge] = useState<string>('');
  const [walkInGender, setWalkInGender] = useState<'male' | 'female' | 'other'>('male');
  const [walkInComplaint, setWalkInComplaint] = useState('');
  const [walkInError, setWalkInError] = useState<string | null>(null);

  // Print Token Slip Modal State
  const [printSlipAppointment, setPrintSlipAppointment] = useState<Appointment | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Verify receptionist session on mount
  useEffect(() => {
    const activeSession = getStoredReceptionistSession();
    if (!activeSession) {
      navigate('/reception/login');
      return;
    }
    setSession(activeSession);

    // Default to first assigned location
    if (activeSession.receptionist.assignedLocationIds.length > 0) {
      setSelectedLocationId(activeSession.receptionist.assignedLocationIds[0]);
    } else if (activeSession.doctorProfile.locations.length > 0) {
      setSelectedLocationId(activeSession.doctorProfile.locations[0].id);
    }
  }, [navigate]);

  const assignedLocations = useMemo(() => {
    if (!session) return [];
    const ids = new Set(session.receptionist.assignedLocationIds);
    return session.doctorProfile.locations.filter((loc) => ids.has(loc.id));
  }, [session]);

  const currentLocation = useMemo(() => {
    if (!session) return null;
    return assignedLocations.find((l) => l.id === selectedLocationId) || assignedLocations[0] || null;
  }, [session, assignedLocations, selectedLocationId]);

  // Real-time Firestore subscription to selected clinic's queue
  useEffect(() => {
    if (!session || !session.doctorProfile.uid || !selectedLocationId) return;

    const unsubscribe = subscribeToDailyQueue(
      session.doctorProfile.uid,
      selectedLocationId,
      todayKolkata,
      (apts) => {
        setQueueAppointments(apts);
      },
      (queueMeta) => {
        setDailyQueueData(queueMeta);
      }
    );

    return () => {
      unsubscribe();
    };
  }, [session, selectedLocationId, todayKolkata]);

  // Queue estimations & metrics
  const { metrics, sortedQueue } = useMemo(() => {
    if (!session) {
      return {
        metrics: {
          totalTokens: 0,
          waitingCount: 0,
          calledCount: 0,
          inConsultationCount: 0,
          completedCount: 0,
          scheduledCount: 0,
          currentServingToken: null,
          currentServingPatientName: null,
          nextUpToken: null,
          nextUpPatientName: null,
        },
        sortedQueue: [],
      };
    }

    const docProfile = {
      ...session.doctorProfile,
      avgDurationMinutes: session.doctorProfile.avgDurationMinutes || 15,
      locations: session.doctorProfile.locations as any,
    };

    return calculateQueueEstimations(
      queueAppointments,
      docProfile as any,
      currentKolkataTime,
      dailyQueueData?.sessionStatus || 'active'
    );
  }, [session, queueAppointments, currentKolkataTime, dailyQueueData]);

  // Filtered queue items
  const displayedEntries = useMemo(() => {
    let list = sortedQueue;

    if (activeFilter === 'waiting') {
      list = list.filter((a) => (a.queueStatus || a.status) === 'waiting');
    } else if (activeFilter === 'scheduled') {
      list = list.filter((a) => {
        const s = a.queueStatus || a.status;
        return s === 'scheduled' || s === 'confirmed';
      });
    } else if (activeFilter === 'active') {
      list = list.filter((a) => {
        const s = a.queueStatus || a.status;
        return s === 'in_consultation' || s === 'called';
      });
    } else if (activeFilter === 'completed') {
      list = list.filter((a) => (a.queueStatus || a.status) === 'completed');
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (a) =>
          a.patientName.toLowerCase().includes(q) ||
          a.patientMobile.includes(q) ||
          (a.formattedToken && a.formattedToken.toLowerCase().includes(q)) ||
          a.bookingReference.toLowerCase().includes(q)
      );
    }

    return list;
  }, [sortedQueue, activeFilter, searchQuery]);

  // Handlers
  const handleLogout = () => {
    logoutReceptionist();
    navigate('/reception/login');
  };

  const handleOpenWalkIn = () => {
    setWalkInName('');
    setWalkInMobile('');
    setWalkInAge('');
    setWalkInGender('male');
    setWalkInComplaint('');
    setWalkInError(null);
    setIsWalkInModalOpen(true);
  };

  const handleSubmitWalkIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session || !currentLocation) return;

    if (!walkInName.trim() || !walkInMobile.trim()) {
      setWalkInError('Patient name and 10-digit mobile number are required.');
      return;
    }

    if (walkInMobile.trim().length !== 10) {
      setWalkInError('Please enter a valid 10-digit Indian mobile number.');
      return;
    }

    setIsSubmittingWalkIn(true);
    setWalkInError(null);

    const res = await registerWalkInAtDesk(session, {
      patientName: walkInName,
      patientMobile: walkInMobile,
      patientAge: walkInAge ? parseInt(walkInAge, 10) : undefined,
      patientGender: walkInGender,
      chiefComplaint: walkInComplaint,
      locationId: currentLocation.id,
    });

    setIsSubmittingWalkIn(false);

    if (res.success && res.appointment) {
      setIsWalkInModalOpen(false);
      setPrintSlipAppointment(res.appointment);
      setToastMessage(
        `Walk-in patient ${res.appointment.patientName} allocated Token ${res.appointment.formattedToken || `T-${res.appointment.tokenNumber}`}.`
      );
      setTimeout(() => setToastMessage(null), 4000);
    } else {
      setWalkInError(res.error || 'Failed to register walk-in patient. Please try again.');
    }
  };

  const handleCheckIn = async (apt: Appointment) => {
    if (!session) return;
    const res = await checkInPatientAtDesk(session.doctorProfile.uid, apt);
    if (res.success) {
      setToastMessage(
        `Patient ${apt.patientName} (${apt.formattedToken || `T-${apt.tokenNumber}`}) checked in and placed in waiting room.`
      );
      setTimeout(() => setToastMessage(null), 3500);
    } else {
      alert(`Check-in error: ${res.error}`);
    }
  };

  const handleStatusChange = async (apt: Appointment, newStatus: QueueStatus) => {
    if (!session) return;
    const res = await updateQueueEntryStatus(
      session.doctorProfile.uid,
      apt.appointmentId,
      newStatus,
      apt,
      `Updated by receptionist ${session.receptionist.fullName}`
    );
    if (res.success) {
      setToastMessage(`Token ${apt.formattedToken || `T-${apt.tokenNumber}`} updated to ${newStatus}.`);
      setTimeout(() => setToastMessage(null), 3000);
    }
  };

  if (!session) return null;

  return (
    <div className="bg-slate-50 min-h-screen py-6 sm:py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Receptionist Top App Bar */}
        <div className="bg-slate-900 text-white rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 border border-slate-800 shadow-sm">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
              <span className="text-xs uppercase tracking-wider font-bold text-teal-400">
                Clinic Front-Desk &amp; Receptionist Portal
              </span>
              <span className="text-slate-600">·</span>
              <span className="text-xs text-slate-400 font-mono">
                Staff: {session.receptionist.fullName}
              </span>
            </div>
            <div className="text-base sm:text-lg font-bold text-white flex flex-wrap items-center gap-2">
              <span>{currentLocation?.name || currentLocation?.clinicName || session.doctorProfile.clinicName}</span>
              <span className="text-xs px-2 py-0.5 rounded bg-teal-900/60 text-teal-300 border border-teal-700/50 font-normal">
                Dr. {session.doctorProfile.fullName} ({session.doctorProfile.specialization})
              </span>
            </div>
            <div className="text-xs text-slate-400 flex flex-wrap items-center gap-3">
              <span>
                Today: <strong className="text-slate-200">{todayKolkata}</strong> (Asia/Kolkata)
              </span>
              <span>·</span>
              <span>
                Consultation Fee: <strong className="text-emerald-400">₹{currentLocation?.consultationFee || session.doctorProfile.consultationFee || '500'}</strong>
              </span>
            </div>
          </div>

          {/* Controls: Location Selector, Walk-in Button, Logout */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            {assignedLocations.length > 1 && (
              <div className="relative">
                <select
                  value={selectedLocationId}
                  onChange={(e) => setSelectedLocationId(e.target.value)}
                  className="bg-slate-800 text-teal-300 border border-slate-700 rounded-xl px-3 py-1.5 text-xs font-semibold focus:outline-hidden focus:ring-2 focus:ring-teal-500 cursor-pointer"
                >
                  {assignedLocations.map((loc) => (
                    <option key={loc.id} value={loc.id}>
                      {loc.name || loc.clinicName} ({loc.locality})
                    </option>
                  ))}
                </select>
              </div>
            )}

            <Button
              variant="primary"
              size="sm"
              leftIcon={<UserPlus className="w-3.5 h-3.5" />}
              onClick={handleOpenWalkIn}
              className="bg-teal-500 hover:bg-teal-600 text-white font-bold text-xs"
            >
              + Register Walk-In
            </Button>

            <Button
              variant="outline"
              size="sm"
              leftIcon={<LogOut className="w-3.5 h-3.5" />}
              onClick={handleLogout}
              className="bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700 text-xs"
            >
              Sign Out
            </Button>
          </div>
        </div>

        {/* Global Toast */}
        {toastMessage && (
          <div className="p-3.5 rounded-xl bg-teal-50 border border-teal-200 text-teal-900 text-xs flex items-center justify-between shadow-2xs animate-fade-in">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
              <span className="font-medium">{toastMessage}</span>
            </div>
            <button
              type="button"
              onClick={() => setToastMessage(null)}
              className="text-teal-700 hover:text-teal-900 font-bold ml-2 cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Live Queue Metrics Row */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
          <Card className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
              Total Tokens Issued
            </span>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-2xl font-black text-slate-900 font-mono">
                {metrics.totalTokens}
              </span>
              <span className="text-[10px] text-slate-400">today</span>
            </div>
          </Card>

          <Card className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 shadow-2xs">
            <span className="text-[11px] font-semibold text-emerald-800 uppercase tracking-wider block">
              Currently Serving
            </span>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-2xl font-black text-emerald-900 font-mono">
                {metrics.currentServingToken ? `T-${metrics.currentServingToken.toString().padStart(2, '0')}` : 'None'}
              </span>
              <span className="text-[10px] text-emerald-700 truncate max-w-[90px]">
                {metrics.currentServingPatientName || 'in room'}
              </span>
            </div>
          </Card>

          <Card className="p-4 rounded-2xl bg-teal-50/70 border border-teal-200/80 shadow-2xs">
            <span className="text-[11px] font-semibold text-teal-800 uppercase tracking-wider block">
              Waiting in Clinic
            </span>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-2xl font-black text-teal-900 font-mono">
                {metrics.waitingCount}
              </span>
              <span className="text-[10px] text-teal-700">patients</span>
            </div>
          </Card>

          <Card className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 shadow-2xs">
            <span className="text-[11px] font-semibold text-amber-800 uppercase tracking-wider block">
              Arriving Online / QR
            </span>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-2xl font-black text-amber-900 font-mono">
                {metrics.scheduledCount}
              </span>
              <span className="text-[10px] text-amber-700">need check-in</span>
            </div>
          </Card>

          <Card className="p-4 rounded-2xl bg-slate-50 border border-slate-200 shadow-2xs">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
              Completed
            </span>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-2xl font-black text-slate-700 font-mono">
                {metrics.completedCount}
              </span>
              <span className="text-[10px] text-slate-400">finished</span>
            </div>
          </Card>
        </div>

        {/* Main Queue Console Card */}
        <Card className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
          {/* Header & Filters */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            {/* Filter Tabs */}
            <div className="flex flex-wrap items-center gap-1.5">
              <button
                type="button"
                onClick={() => setActiveFilter('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeFilter === 'all'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                All Tokens ({sortedQueue.length})
              </button>

              <button
                type="button"
                onClick={() => setActiveFilter('waiting')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeFilter === 'waiting'
                    ? 'bg-teal-700 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Waiting in Clinic ({metrics.waitingCount})
              </button>

              <button
                type="button"
                onClick={() => setActiveFilter('scheduled')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeFilter === 'scheduled'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Pre-Booked (Online / QR) ({metrics.scheduledCount})
              </button>

              <button
                type="button"
                onClick={() => setActiveFilter('active')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeFilter === 'active'
                    ? 'bg-emerald-700 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                In OPD Room ({metrics.inConsultationCount + metrics.calledCount})
              </button>

              <button
                type="button"
                onClick={() => setActiveFilter('completed')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeFilter === 'completed'
                    ? 'bg-slate-700 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Completed ({metrics.completedCount})
              </button>
            </div>

            {/* Quick Search */}
            <div className="relative w-full md:w-64">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search patient, token, mobile..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-teal-500 text-xs"
              />
            </div>
          </div>

          {/* Table */}
          {displayedEntries.length === 0 ? (
            <div className="text-center py-12 space-y-3">
              <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                <Users className="w-6 h-6" />
              </div>
              <p className="text-sm font-bold text-slate-800">No Patients in Current View</p>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                {activeFilter === 'scheduled'
                  ? 'No online or QR pre-bookings waiting for desk check-in.'
                  : activeFilter === 'waiting'
                  ? 'The clinic waiting lounge is currently clear.'
                  : 'Click "+ Register Walk-In" to register a patient arriving at the counter.'}
              </p>
              <Button
                variant="primary"
                size="sm"
                leftIcon={<UserPlus className="w-3.5 h-3.5" />}
                onClick={handleOpenWalkIn}
                className="bg-teal-600 hover:bg-teal-700 text-xs"
              >
                Register Walk-In Patient
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 uppercase text-[10px] tracking-wider">
                    <th className="py-2.5 px-3">Token #</th>
                    <th className="py-2.5 px-3">Patient Details</th>
                    <th className="py-2.5 px-3">Source</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3">Slot / Check-in</th>
                    <th className="py-2.5 px-3 text-right">Desk Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {displayedEntries.map((apt) => {
                    const status = apt.queueStatus || apt.status;
                    const isWaiting = status === 'waiting';
                    const isScheduled = status === 'scheduled' || status === 'confirmed';
                    const isInRoom = status === 'in_consultation' || status === 'called';
                    const isCompleted = status === 'completed';

                    return (
                      <tr key={apt.appointmentId} className="hover:bg-slate-50/70 transition-colors">
                        {/* Token */}
                        <td className="py-3 px-3">
                          <span
                            className={`inline-flex items-center px-2.5 py-1 rounded-lg font-mono font-bold text-xs ${
                              isInRoom
                                ? 'bg-emerald-600 text-white animate-pulse'
                                : isWaiting
                                ? 'bg-teal-100 text-teal-800 border border-teal-200'
                                : isScheduled
                                ? 'bg-amber-100 text-amber-800 border border-amber-200'
                                : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {apt.formattedToken || `T-${apt.tokenNumber || '?'}`}
                          </span>
                        </td>

                        {/* Patient Details */}
                        <td className="py-3 px-3">
                          <div>
                            <span className="font-bold text-slate-900 block">{apt.patientName}</span>
                            <span className="text-slate-500 font-mono text-[11px] flex items-center gap-1.5">
                              <Phone className="w-3 h-3 text-slate-400" />
                              {apt.patientMobile}
                              {apt.patientAge && <span>· {apt.patientAge}y</span>}
                              {apt.patientGender && <span>· {apt.patientGender}</span>}
                            </span>
                            {apt.visitReason && (
                              <span className="text-[10px] text-slate-400 block truncate max-w-xs">
                                {apt.visitReason}
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Booking Source */}
                        <td className="py-3 px-3">
                          {apt.bookingSource === 'walk_in' ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-purple-50 text-purple-700 border border-purple-200">
                              <Users className="w-3 h-3" />
                              Desk Walk-In
                            </span>
                          ) : apt.bookingSource === 'qr' || apt.bookingSource === 'walk_in_qr' ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-teal-50 text-teal-700 border border-teal-200">
                              <QrCode className="w-3 h-3" />
                              Clinic QR
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-sky-50 text-sky-700 border border-sky-200">
                              <Globe className="w-3 h-3" />
                              Online
                            </span>
                          )}
                        </td>

                        {/* Status */}
                        <td className="py-3 px-3">
                          {isScheduled && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                              Booked (Awaiting Desk)
                            </span>
                          )}
                          {isWaiting && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-100 text-teal-800">
                              Waiting in Lounge
                            </span>
                          )}
                          {status === 'called' && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-800">
                              Called to Room
                            </span>
                          )}
                          {status === 'in_consultation' && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                              In Consultation
                            </span>
                          )}
                          {isCompleted && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600">
                              Completed
                            </span>
                          )}
                          {status === 'no_show' && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-700">
                              No-Show
                            </span>
                          )}
                        </td>

                        {/* Slot / Time */}
                        <td className="py-3 px-3 text-slate-600 text-[11px]">
                          <div>
                            <span className="font-mono font-bold block">{apt.startTime}</span>
                            <span className="text-[10px] text-slate-400">
                              {apt.checkInTime ? 'Arrived at desk' : 'Scheduled time'}
                            </span>
                          </div>
                        </td>

                        {/* Desk Actions */}
                        <td className="py-3 px-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* If pre-booked and patient arrives at desk: Check-In Button */}
                            {isScheduled && (
                              <Button
                                variant="primary"
                                size="sm"
                                leftIcon={<Check className="w-3 h-3" />}
                                onClick={() => handleCheckIn(apt)}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] py-1 px-2.5 shadow-2xs"
                              >
                                Check In
                              </Button>
                            )}

                            {/* If waiting in lounge: Call or In Room */}
                            {isWaiting && (
                              <>
                                <button
                                  type="button"
                                  onClick={() => handleStatusChange(apt, 'called')}
                                  className="px-2.5 py-1 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-bold text-[11px] cursor-pointer shadow-2xs"
                                >
                                  Call
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleStatusChange(apt, 'in_consultation')}
                                  className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] cursor-pointer shadow-2xs"
                                >
                                  In Room
                                </button>
                              </>
                            )}

                            {/* If in consultation: Complete */}
                            {isInRoom && (
                              <button
                                type="button"
                                onClick={() => handleStatusChange(apt, 'completed')}
                                className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold text-[11px] cursor-pointer"
                              >
                                Done
                              </button>
                            )}

                            {/* Print Token Slip */}
                            <button
                              type="button"
                              onClick={() => setPrintSlipAppointment(apt)}
                              className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 cursor-pointer"
                              title="Print Token Slip"
                            >
                              <Printer className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>

      {/* Register Walk-In Modal */}
      {isWalkInModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-slate-200 relative my-8 animate-fade-in space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-teal-50 text-teal-600 flex items-center justify-center">
                  <UserPlus className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-slate-900">Desk Walk-In Registration</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsWalkInModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            {walkInError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{walkInError}</span>
              </div>
            )}

            <form onSubmit={handleSubmitWalkIn} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Patient Full Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh Patil"
                  value={walkInName}
                  onChange={(e) => setWalkInName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-teal-500 text-xs font-semibold"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  10-Digit Mobile / WhatsApp <span className="text-rose-500">*</span>
                </label>
                <input
                  type="tel"
                  required
                  maxLength={10}
                  placeholder="9876543210"
                  value={walkInMobile}
                  onChange={(e) => setWalkInMobile(e.target.value.replace(/\D/g, ''))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-teal-500 text-xs font-mono font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Age (Years)</label>
                  <input
                    type="number"
                    min={1}
                    max={120}
                    placeholder="35"
                    value={walkInAge}
                    onChange={(e) => setWalkInAge(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-teal-500 text-xs"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Gender</label>
                  <select
                    value={walkInGender}
                    onChange={(e) => setWalkInGender(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-teal-500 text-xs bg-white"
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Chief Complaint / Reason for Visit
                </label>
                <input
                  type="text"
                  placeholder="e.g. Fever, Knee pain, General check-up"
                  value={walkInComplaint}
                  onChange={(e) => setWalkInComplaint(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-teal-500 text-xs"
                />
              </div>

              <div className="p-3 bg-teal-50 rounded-xl border border-teal-200 text-teal-900 text-[11px] space-y-1">
                <span className="font-bold flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-teal-600" />
                  Instant Queue Token Allocation
                </span>
                <p className="text-teal-800">
                  This patient will receive the next consecutive authoritative token in today&apos;s unified queue and be immediately marked as <strong>Waiting in Clinic</strong>.
                </p>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsWalkInModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  isLoading={isSubmittingWalkIn}
                  className="bg-teal-600 hover:bg-teal-700 text-white font-bold"
                >
                  Issue Token &amp; Check In
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Printable Counter Token Slip Modal */}
      {printSlipAppointment && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 relative my-8 animate-fade-in text-center space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-teal-600">
                Clinic Token Slip
              </span>
              <button
                type="button"
                onClick={() => setPrintSlipAppointment(null)}
                className="text-slate-400 hover:text-slate-700 font-bold cursor-pointer text-sm"
              >
                ✕
              </button>
            </div>

            {/* Slip Paper */}
            <div className="p-5 border-2 border-dashed border-slate-300 rounded-2xl bg-slate-50 space-y-3 font-mono text-left">
              <div className="text-center border-b border-slate-200 pb-2">
                <h4 className="font-bold text-slate-900 text-base">
                  {currentLocation?.name || currentLocation?.clinicName || session.doctorProfile.clinicName}
                </h4>
                <p className="text-[10px] text-slate-500">
                  Dr. {session.doctorProfile.fullName} · {session.doctorProfile.specialization}
                </p>
                <p className="text-[9px] text-slate-400">
                  {currentLocation?.locality}, {currentLocation?.city}
                </p>
              </div>

              {/* Big Token */}
              <div className="text-center py-2 bg-white rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-400 uppercase tracking-widest block font-sans">
                  QUEUE TOKEN NUMBER
                </span>
                <span className="text-4xl font-black text-teal-700 block tracking-wider">
                  {printSlipAppointment.formattedToken || `T-${printSlipAppointment.tokenNumber}`}
                </span>
                <span className="text-[10px] text-emerald-600 font-bold font-sans">
                  Checked In · Waiting in Clinic
                </span>
              </div>

              <div className="text-[11px] text-slate-700 space-y-1 pt-1 font-sans">
                <p>
                  <strong>Patient:</strong> {printSlipAppointment.patientName}
                </p>
                <p>
                  <strong>Mobile:</strong> {printSlipAppointment.patientMobile}
                </p>
                <p>
                  <strong>Date:</strong> {printSlipAppointment.appointmentDate}
                </p>
                <p>
                  <strong>Ref ID:</strong> {printSlipAppointment.bookingReference}
                </p>
                <p>
                  <strong>Consultation Fee:</strong> ₹{printSlipAppointment.consultationFee}
                </p>
              </div>

              <div className="border-t border-slate-200 pt-2 text-center text-[10px] text-slate-400 font-sans">
                Please wait in the clinic lounge. Your token will be announced when it is your turn.
              </div>
            </div>

            <div className="flex items-center justify-center gap-2 pt-1">
              <Button
                variant="primary"
                size="sm"
                leftIcon={<Printer className="w-3.5 h-3.5" />}
                onClick={() => window.print()}
                className="bg-teal-600 hover:bg-teal-700 text-xs font-bold"
              >
                Print Slip
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPrintSlipAppointment(null)}
                className="text-xs"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
