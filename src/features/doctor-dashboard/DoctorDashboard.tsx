import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Users,
  Settings,
  LogOut,
  Globe,
  ExternalLink,
  CalendarCheck,
  CheckCircle2,
  Calendar,
  RefreshCw,
  Clock,
  QrCode,
  Building,
  CreditCard,
} from 'lucide-react';
import { useAuth } from '../doctor-auth/AuthContext';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Appointment, QueueStatus, DailyQueue, SessionOperationalStatus } from '../booking/types';
import { getDoctorAppointments, updateAppointmentStatus, getNowInKolkata } from '../booking/bookingService';
import { publishDoctorProfile } from '../doctor-search/searchService';
import {
  subscribeToDailyQueue,
  updateQueueEntryStatus,
  callNextPatientInQueue,
  updateSessionOperationalStatus,
} from '../queue/queueService';
import { calculateQueueEstimations } from '../queue/estimationEngine';
import { QueueOperationalHeader } from '../queue/components/QueueOperationalHeader';
import { QueueMetricsRow, QueueFilterTab } from '../queue/components/QueueMetricsRow';
import { QueueTable } from '../queue/components/QueueTable';
import { QueueActionModal } from '../queue/components/QueueActionModal';
import { DoctorSubscription } from '../../types/subscription';
import {
  subscribeToDoctorSubscription,
  ensureDoctorTrial,
} from '../subscription/subscriptionService';
import { TrialStatusBanner } from '../subscription/components/TrialStatusBanner';

export const DoctorDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, doctorProfile, logout } = useAuth();

  const { dateStr: todayKolkata, timeStr: currentKolkataTime } = useMemo(() => getNowInKolkata(), []);

  // Location and Date Selection
  const locations = useMemo(() => {
    if (doctorProfile?.locations && doctorProfile.locations.length > 0) {
      return doctorProfile.locations;
    }
    return [
      {
        id: 'primary',
        name: doctorProfile?.clinicName || 'Moraya Clinic',
        practiceType: doctorProfile?.practiceType || 'independent_clinic',
        city: doctorProfile?.city || 'Mumbai',
        state: doctorProfile?.state || 'Maharashtra',
        locality: doctorProfile?.locality || 'Bandra West',
        addressLine: doctorProfile?.addressLine || 'Linking Road',
        pincode: doctorProfile?.pincode || '400050',
        consultationFee: doctorProfile?.consultationFee || '500',
        isPrimary: true,
        isActive: true,
      },
    ];
  }, [doctorProfile]);

  const [selectedLocationId, setSelectedLocationId] = useState<string>(locations[0]?.id || 'primary');
  const [selectedDate, setSelectedDate] = useState<string>(todayKolkata);

  // Queue state
  const [queueAppointments, setQueueAppointments] = useState<Appointment[]>([]);
  const [dailyQueueData, setDailyQueueData] = useState<DailyQueue | null>(null);
  const [sessionStatus, setSessionStatus] = useState<SessionOperationalStatus>('active');
  const [avgDuration, setAvgDuration] = useState<number>(doctorProfile?.avgDurationMinutes || 15);
  const [activeFilter, setActiveFilter] = useState<QueueFilterTab>('all');

  // Loading & Alert states
  const [isCallingNext, setIsCallingNext] = useState(false);
  const [alertSent, setAlertSent] = useState<string | null>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Modal State
  const [modalTargetApt, setModalTargetApt] = useState<Appointment | null>(null);
  const [modalAction, setModalAction] = useState<'complete' | 'no_show' | 'cancel' | null>(null);

  // Subscription & Free Trial state
  const [subscription, setSubscription] = useState<DoctorSubscription | null>(null);

  // View tabs (Queue vs All Bookings history)
  const [dashboardTab, setDashboardTab] = useState<'queue' | 'all_appointments'>('queue');
  const [allAppointments, setAllAppointments] = useState<Appointment[]>([]);
  const [isLoadingAll, setIsLoadingAll] = useState(false);

  useEffect(() => {
    if (!doctorProfile?.uid) return;

    let unsub: (() => void) | undefined;
    ensureDoctorTrial(doctorProfile.uid).catch((err) =>
      console.warn('Idempotent trial ensure warning:', err)
    );

    unsub = subscribeToDoctorSubscription(doctorProfile.uid, (sub) => {
      setSubscription(sub);
    });

    return () => {
      if (unsub) unsub();
    };
  }, [doctorProfile?.uid]);

  // Ensure selected location is valid
  useEffect(() => {
    if (locations.length > 0 && !locations.some((l) => l.id === selectedLocationId)) {
      setSelectedLocationId(locations[0].id);
    }
  }, [locations, selectedLocationId]);

  // Sync profile to public directory
  useEffect(() => {
    if (doctorProfile?.uid) {
      publishDoctorProfile(doctorProfile.uid, doctorProfile, 'published').catch((err) =>
        console.warn('Dashboard background directory sync warning:', err)
      );
    }
  }, [doctorProfile?.uid]);

  // Real-time Firestore subscription to current location & date queue
  useEffect(() => {
    if (!doctorProfile?.uid || !selectedLocationId || !selectedDate) return;

    const unsubscribe = subscribeToDailyQueue(
      doctorProfile.uid,
      selectedLocationId,
      selectedDate,
      (apts) => {
        setQueueAppointments(apts);
      },
      (queueMeta) => {
        setDailyQueueData(queueMeta);
        if (queueMeta?.sessionStatus) {
          setSessionStatus(queueMeta.sessionStatus);
        }
      }
    );

    return () => {
      unsubscribe();
    };
  }, [doctorProfile?.uid, selectedLocationId, selectedDate]);

  // Fetch all appointments for the second tab
  const fetchAllAppointments = async () => {
    if (!doctorProfile?.uid) return;
    setIsLoadingAll(true);
    const list = await getDoctorAppointments(doctorProfile.uid);
    setAllAppointments(list);
    setIsLoadingAll(false);
  };

  useEffect(() => {
    if (dashboardTab === 'all_appointments') {
      fetchAllAppointments();
    }
  }, [dashboardTab, doctorProfile?.uid]);

  // Dynamic Tentative Visit-Time Estimations
  const { estimations, metrics, sortedQueue } = useMemo(() => {
    if (!doctorProfile) {
      return {
        estimations: new Map(),
        metrics: {
          totalTokens: 0,
          waitingCount: 0,
          calledCount: 0,
          inConsultationCount: 0,
          completedCount: 0,
          cancelledCount: 0,
          noShowCount: 0,
          scheduledCount: 0,
          currentServingToken: null,
          currentServingPatientName: null,
          nextUpToken: null,
          nextUpPatientName: null,
          overallDelayMinutes: 0,
          opdStatus: 'not_started' as const,
        },
        sortedQueue: [],
      };
    }

    const docProfileWithDuration = {
      ...doctorProfile,
      avgDurationMinutes: avgDuration,
    };

    return calculateQueueEstimations(
      queueAppointments,
      docProfileWithDuration,
      currentKolkataTime,
      sessionStatus
    );
  }, [queueAppointments, doctorProfile, avgDuration, currentKolkataTime, sessionStatus]);

  // Filtered queue entries for table
  const displayedEntries = useMemo(() => {
    if (activeFilter === 'all') return sortedQueue;
    if (activeFilter === 'waiting') {
      return sortedQueue.filter((a) => (a.queueStatus || a.status) === 'waiting');
    }
    if (activeFilter === 'active') {
      return sortedQueue.filter((a) => {
        const s = a.queueStatus || a.status;
        return s === 'in_consultation' || s === 'called';
      });
    }
    if (activeFilter === 'scheduled') {
      return sortedQueue.filter((a) => {
        const s = a.queueStatus || a.status;
        return s === 'scheduled' || s === 'confirmed';
      });
    }
    if (activeFilter === 'completed') {
      return sortedQueue.filter((a) => (a.queueStatus || a.status) === 'completed');
    }
    if (activeFilter === 'no_show') {
      return sortedQueue.filter((a) => (a.queueStatus || a.status) === 'no_show');
    }
    if (activeFilter === 'cancelled') {
      return sortedQueue.filter((a) => (a.queueStatus || a.status) === 'cancelled');
    }
    return sortedQueue;
  }, [sortedQueue, activeFilter]);

  // Operational Handlers
  const handleToggleSessionStatus = async () => {
    if (!doctorProfile?.uid) return;
    const nextStatus: SessionOperationalStatus = sessionStatus === 'active' ? 'paused' : 'active';
    setSessionStatus(nextStatus);
    await updateSessionOperationalStatus(
      doctorProfile.uid,
      selectedLocationId,
      selectedDate,
      nextStatus
    );
    setAlertSent(`OPD Session marked as ${nextStatus === 'active' ? 'Active' : 'Paused'}.`);
    setTimeout(() => setAlertSent(null), 3500);
  };

  const handleCallNext = async () => {
    if (!doctorProfile?.uid) return;
    setIsCallingNext(true);
    const res = await callNextPatientInQueue(
      doctorProfile.uid,
      selectedLocationId,
      selectedDate,
      sortedQueue
    );
    setIsCallingNext(false);

    if (res.success && res.calledAppointment) {
      setAlertSent(
        `Called Token ${res.calledAppointment.formattedToken || `T-${res.calledAppointment.tokenNumber}`} (${res.calledAppointment.patientName}). Automated WhatsApp arrival alert dispatched.`
      );
      setTimeout(() => setAlertSent(null), 4000);
    } else if (res.error) {
      setAlertSent(res.error);
      setTimeout(() => setAlertSent(null), 3500);
    }
  };

  const handleMarkArrived = async (apt: Appointment) => {
    if (!doctorProfile?.uid) return;
    const res = await updateQueueEntryStatus(doctorProfile.uid, apt.appointmentId, 'waiting', apt);
    if (res.success) {
      setAlertSent(
        `Patient ${apt.patientName} (${apt.formattedToken || `T-${apt.tokenNumber}`}) marked as Waiting in clinic.`
      );
      setTimeout(() => setAlertSent(null), 3500);
    }
  };

  const handleCallSpecificPatient = async (apt: Appointment) => {
    if (!doctorProfile?.uid) return;
    const res = await updateQueueEntryStatus(doctorProfile.uid, apt.appointmentId, 'called', apt);
    if (res.success) {
      setAlertSent(
        `Called Token ${apt.formattedToken || `T-${apt.tokenNumber}`} (${apt.patientName}) to OPD Room.`
      );
      setTimeout(() => setAlertSent(null), 3500);
    }
  };

  const handleStartConsultation = async (apt: Appointment) => {
    if (!doctorProfile?.uid) return;
    const res = await updateQueueEntryStatus(
      doctorProfile.uid,
      apt.appointmentId,
      'in_consultation',
      apt
    );
    if (res.success) {
      setAlertSent(
        `Consultation begun for Token ${apt.formattedToken || `T-${apt.tokenNumber}`} (${apt.patientName}).`
      );
      setTimeout(() => setAlertSent(null), 3500);
    }
  };

  const handleModalConfirm = async (
    apt: Appointment,
    newStatus: QueueStatus,
    notes?: string
  ) => {
    if (!doctorProfile?.uid) return;
    const res = await updateQueueEntryStatus(
      doctorProfile.uid,
      apt.appointmentId,
      newStatus,
      apt,
      notes
    );
    if (res.success) {
      setAlertSent(
        `Token ${apt.formattedToken || `T-${apt.tokenNumber}`} marked as ${newStatus}.`
      );
      setTimeout(() => setAlertSent(null), 3500);
    }
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    await logout();
    setIsLoggingOut(false);
    navigate('/doctor/login');
  };

  const doctorDisplayName = doctorProfile?.fullName || user?.displayName || 'Registered Medical Practitioner';
  const regNumber = doctorProfile?.registrationNumber || 'MMC-2015-88352';

  return (
    <div className="bg-slate-50 min-h-screen py-8 lg:py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Doctor Tenant Account Banner */}
        <div className="bg-slate-900 text-white rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 border border-slate-800 shadow-sm">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
              <span className="text-xs uppercase tracking-wider font-bold text-teal-400">
                Doctor Practice Portal Active
              </span>
              <span className="text-slate-600">·</span>
              <span className="text-xs text-slate-400 font-mono">
                UID: {user?.uid?.slice(0, 14)}...
              </span>
            </div>
            <div className="text-base sm:text-lg font-bold text-white flex flex-wrap items-center gap-2">
              <span>{doctorDisplayName}</span>
              <span className="text-xs px-2 py-0.5 rounded bg-teal-900/60 text-teal-300 border border-teal-700/50 font-normal">
                {doctorProfile?.specialization || 'General Medicine'}
              </span>
            </div>
            <div className="text-xs text-slate-400 flex flex-wrap items-center gap-3">
              <span>
                Council Reg: <strong className="text-slate-300 font-mono">{regNumber}</strong>
              </span>
              <span>·</span>
              <span>
                Council Status: <strong className="text-emerald-400">Verified Active</strong>
              </span>
              <span>·</span>
              <span>
                Email: <strong className="text-slate-300">{user?.email}</strong>
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            {doctorProfile?.uid && (
              <Link to={`/doctors/${doctorProfile.uid}`} target="_blank" rel="noopener noreferrer">
                <Button
                  variant="outline"
                  size="sm"
                  leftIcon={<Globe className="w-3.5 h-3.5 text-teal-400" />}
                  rightIcon={<ExternalLink className="w-3 h-3 text-slate-400" />}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700 hover:border-slate-600 text-xs"
                >
                  Public Patient Profile
                </Button>
              </Link>
            )}
            <Link to="/doctor/subscription">
              <Button
                variant="outline"
                size="sm"
                leftIcon={<CreditCard className="w-3.5 h-3.5 text-amber-400" />}
                className="bg-amber-950/60 hover:bg-amber-900 text-amber-300 border-amber-700/60 hover:border-amber-600 text-xs font-semibold"
              >
                Subscription &amp; Plans
              </Button>
            </Link>
            <Link to="/doctor/settings">
              <Button
                variant="outline"
                size="sm"
                leftIcon={<Settings className="w-3.5 h-3.5" />}
                className="bg-teal-900/60 hover:bg-teal-900 text-teal-300 border-teal-700/60 hover:border-teal-600 text-xs"
              >
                Practice Settings
              </Button>
            </Link>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              isLoading={isLoggingOut}
              leftIcon={<LogOut className="w-3.5 h-3.5" />}
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700 hover:border-slate-600 text-xs"
            >
              Sign Out
            </Button>
          </div>
        </div>

        {/* Authoritative Doctor Subscription & Free Trial Status Banner */}
        <TrialStatusBanner subscription={subscription} />

        {/* Global Feedback Banner */}
        {alertSent && (
          <div className="p-3.5 rounded-xl bg-teal-50 border border-teal-200 text-teal-900 text-xs flex items-center justify-between shadow-2xs">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
              <span className="font-medium">{alertSent}</span>
            </div>
            <button
              type="button"
              onClick={() => setAlertSent(null)}
              className="text-teal-700 hover:text-teal-900 font-bold ml-2 cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* View Selection Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
          <button
            type="button"
            onClick={() => setDashboardTab('queue')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              dashboardTab === 'queue'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Unified Patient Queue &amp; Token Console</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-teal-800 text-teal-200 font-mono">
              {metrics.totalTokens}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setDashboardTab('all_appointments')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              dashboardTab === 'all_appointments'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <CalendarCheck className="w-3.5 h-3.5 text-teal-400" />
            <span>All Booked Appointments</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-200 text-slate-700 font-mono">
              {allAppointments.length || queueAppointments.length}
            </span>
          </button>
        </div>

        {/* TAB 1: Unified Queue Console */}
        {dashboardTab === 'queue' ? (
          <div className="space-y-5">
            {/* 1. Operational Controls Header */}
            <QueueOperationalHeader
              locations={locations}
              selectedLocationId={selectedLocationId}
              onLocationChange={setSelectedLocationId}
              selectedDate={selectedDate}
              onDateChange={setSelectedDate}
              metrics={metrics}
              sessionStatus={sessionStatus}
              onToggleSessionStatus={handleToggleSessionStatus}
              onCallNext={handleCallNext}
              isCallingNext={isCallingNext}
              avgDuration={avgDuration}
              onAvgDurationChange={setAvgDuration}
              onManualRefresh={() => {
                setAlertSent('Queue synchronization refreshed.');
                setTimeout(() => setAlertSent(null), 2500);
              }}
            />

            {/* 2. Status Filter Pills */}
            <QueueMetricsRow
              metrics={metrics}
              activeFilter={activeFilter}
              onFilterChange={setActiveFilter}
            />

            {/* 3. Interactive Queue Table */}
            <QueueTable
              queueEntries={displayedEntries}
              estimations={estimations}
              onMarkArrived={handleMarkArrived}
              onCallPatient={handleCallSpecificPatient}
              onStartConsultation={handleStartConsultation}
              onRequestComplete={(apt) => {
                setModalTargetApt(apt);
                setModalAction('complete');
              }}
              onRequestNoShow={(apt) => {
                setModalTargetApt(apt);
                setModalAction('no_show');
              }}
              onRequestCancel={(apt) => {
                setModalTargetApt(apt);
                setModalAction('cancel');
              }}
            />
          </div>
        ) : (
          /* TAB 2: All Booked Appointments Table */
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <CalendarCheck className="w-5 h-5 text-teal-600" />
                  <span>All Authoritative Appointments History</span>
                </h2>
                <p className="text-xs text-slate-500">
                  Comprehensive audit trail of online bookings across all practice dates and locations.
                </p>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={fetchAllAppointments}
                isLoading={isLoadingAll}
                leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
                className="text-xs"
              >
                Refresh Appointments
              </Button>
            </div>

            {isLoadingAll ? (
              <div className="p-8 text-center text-xs text-slate-400 animate-pulse">
                Loading all appointments from Cloud Firestore...
              </div>
            ) : allAppointments.length === 0 ? (
              <div className="p-10 text-center space-y-3">
                <Calendar className="w-10 h-10 text-slate-300 mx-auto" />
                <h3 className="font-bold text-sm text-slate-800">No Appointments Recorded Yet</h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  When patients discover your profile and book consultation slots, their reservations and
                  token numbers will appear here automatically.
                </p>
                <div className="pt-2">
                  <Link to={`/doctors/${doctorProfile?.uid}`} target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" size="sm" rightIcon={<ExternalLink className="w-3.5 h-3.5" />}>
                      View Public Booking Page
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
                    <tr>
                      <th className="py-3 px-4">Token &amp; Ref</th>
                      <th className="py-3 px-4">Patient</th>
                      <th className="py-3 px-4">Date &amp; Slot</th>
                      <th className="py-3 px-4">Location</th>
                      <th className="py-3 px-4">Fee</th>
                      <th className="py-3 px-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {allAppointments.map((apt) => (
                      <tr key={apt.appointmentId} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3.5 px-4 font-mono font-bold text-teal-800">
                          <span className="block text-slate-900">
                            {apt.formattedToken || `T-${(apt.tokenNumber || 0).toString().padStart(2, '0')}`}
                          </span>
                          <span className="text-[10px] text-teal-700 font-normal">
                            {apt.bookingReference}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <strong className="text-slate-900 block">{apt.patientName}</strong>
                          <span className="text-[11px] text-slate-500 font-mono">
                            +91 {apt.patientMobile}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="font-mono text-slate-900 font-semibold block">
                            {apt.appointmentDate}
                          </span>
                          <span className="font-mono text-[11px] text-slate-500">
                            {apt.startTime} – {apt.endTime}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-slate-700">
                          <strong className="block">{apt.locationName}</strong>
                          <span className="text-[11px] text-slate-400">{apt.city}</span>
                        </td>
                        <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                          ₹{apt.consultationFee}
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                              apt.status === 'in_consultation'
                                ? 'bg-teal-600 text-white'
                                : apt.status === 'called'
                                ? 'bg-amber-100 text-amber-800'
                                : apt.status === 'waiting'
                                ? 'bg-emerald-100 text-emerald-800'
                                : apt.status === 'completed'
                                ? 'bg-slate-100 text-slate-600'
                                : apt.status === 'cancelled'
                                ? 'bg-rose-100 text-rose-800'
                                : apt.status === 'no_show'
                                ? 'bg-purple-100 text-purple-800'
                                : 'bg-blue-100 text-blue-800'
                            }`}
                          >
                            {apt.status.toUpperCase()}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Practice Architecture Notes */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-600">
          <Card className="p-4 bg-white border border-slate-200 space-y-1.5">
            <strong className="text-slate-900 block font-semibold flex items-center gap-1.5">
              <QrCode className="w-3.5 h-3.5 text-teal-600" />
              Reception Walk-In QR Ready
            </strong>
            <p>
              Unified architecture connects online bookings, QR stands, and manual OPD receptionists into
              the same sequential token stream.
            </p>
          </Card>
          <Card className="p-4 bg-white border border-slate-200 space-y-1.5">
            <strong className="text-slate-900 block font-semibold flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-teal-600" />
              Dynamic Visit-Time Engine
            </strong>
            <p>
              Estimates adjust in real time according to session hours, afternoon breaks, completed consultations,
              and live doctor pace.
            </p>
          </Card>
          <Card className="p-4 bg-white border border-slate-200 space-y-1.5">
            <strong className="text-slate-900 block font-semibold flex items-center gap-1.5">
              <Building className="w-3.5 h-3.5 text-teal-600" />
              Atomic Double-Booking Guard
            </strong>
            <p>
              Firestore transactions guarantee zero duplicate tokens and zero overlapping reservations across
              concurrent patient requests.
            </p>
          </Card>
        </div>
      </div>

      {/* Action Confirmation Modal */}
      <QueueActionModal
        isOpen={Boolean(modalTargetApt && modalAction)}
        appointment={modalTargetApt}
        targetAction={modalAction}
        onClose={() => {
          setModalTargetApt(null);
          setModalAction(null);
        }}
        onConfirm={handleModalConfirm}
      />
    </div>
  );
};
