import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  Building,
  Calendar,
  Clock,
  IndianRupee,
  CheckCircle2,
  AlertCircle,
  Stethoscope,
  ShieldCheck,
  QrCode,
} from 'lucide-react';
import { getPublicDoctorById } from '../doctor-search/searchService';
import { PublicDoctorProfile, PublicPracticeLocation } from '../../types/public-doctor';
import { CandidateTimeSlot, BookingFormData, Appointment } from './types';
import { createAuthoritativeAppointment } from './bookingService';
import { StepLocationSelect } from './components/StepLocationSelect';
import { StepDateSelect } from './components/StepDateSelect';
import { StepTimeSlotSelect } from './components/StepTimeSlotSelect';
import { StepPatientDetails } from './components/StepPatientDetails';
import { StepReviewSubmit } from './components/StepReviewSubmit';
import { BookingConfirmationView } from './components/BookingConfirmationView';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';

const STEPS = [
  { id: 1, title: 'Location' },
  { id: 2, title: 'Date' },
  { id: 3, title: 'Time Slot' },
  { id: 4, title: 'Patient Info' },
  { id: 5, title: 'Review' },
];

export const PatientBookingPage: React.FC = () => {
  const { doctorId, locationId: routeLocationId } = useParams<{
    doctorId: string;
    locationId?: string;
  }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const isQrBooking = Boolean(
    routeLocationId ||
      searchParams.get('source') === 'qr' ||
      (typeof window !== 'undefined' && window.location.pathname.startsWith('/book/'))
  );

  const preselectedLocationId = routeLocationId || searchParams.get('locationId') || '';
  const preselectedDate = searchParams.get('date') || '';

  const [doctor, setDoctor] = useState<PublicDoctorProfile | null>(null);
  const [isLoadingDoctor, setIsLoadingDoctor] = useState<boolean>(true);
  const [doctorError, setDoctorError] = useState<string | null>(null);
  const [inactiveLocationWarning, setInactiveLocationWarning] = useState<string | null>(null);

  // Wizard Step State
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [confirmedAppointment, setConfirmedAppointment] = useState<Appointment | null>(null);

  // Form State
  const [selectedLocationId, setSelectedLocationId] = useState<string>(preselectedLocationId);
  const [selectedDate, setSelectedDate] = useState<string>(preselectedDate);
  const [selectedSlot, setSelectedSlot] = useState<CandidateTimeSlot | null>(null);

  const [patientName, setPatientName] = useState<string>('');
  const [patientMobile, setPatientMobile] = useState<string>('');
  const [patientEmail, setPatientEmail] = useState<string>('');
  const [visitReason, setVisitReason] = useState<string>('');

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null);

  // Fetch Doctor Profile
  useEffect(() => {
    if (!doctorId) {
      setIsLoadingDoctor(false);
      setDoctorError('Doctor ID is missing.');
      return;
    }

    let isMounted = true;
    setIsLoadingDoctor(true);

    const load = async () => {
      const data = await getPublicDoctorById(doctorId);
      if (isMounted) {
        if (!data) {
          setDoctorError('The requested doctor was not found or is currently not published for online booking.');
        } else {
          setDoctor(data);

          // Check if specific requested location exists
          const allLocs = data.locations || [];
          const requestedLoc = allLocs.find((l) => l.id === preselectedLocationId);

          if (requestedLoc && requestedLoc.isActive === false) {
            setInactiveLocationWarning(
              `Notice: The clinic "${requestedLoc.name}" is temporarily not accepting appointments. Please choose another active clinic location below.`
            );
          }

          // Filter active locations
          const activeLocs = allLocs.filter((l) => l.isActive !== false);
          const found = activeLocs.find((l) => l.id === preselectedLocationId);

          if (found) {
            setSelectedLocationId(found.id);
            // Can jump directly to step 2 if location is already set
            if (!preselectedDate) {
              setCurrentStep(2);
            } else {
              setCurrentStep(3);
            }
          } else if (activeLocs.length > 0) {
            const primary = activeLocs.find((l) => l.isPrimary) || activeLocs[0];
            setSelectedLocationId(primary.id);
          }
        }
        setIsLoadingDoctor(false);
      }
    };

    load();

    return () => {
      isMounted = false;
    };
  }, [doctorId, preselectedLocationId, preselectedDate]);

  // Derived selected location
  const selectedLocation: PublicPracticeLocation | undefined = doctor?.locations.find(
    (l) => l.id === selectedLocationId
  );

  const currentFee = selectedLocation?.consultationFee || doctor?.consultationFee || '500';

  // Navigation handlers
  const handleLocationSelect = (loc: PublicPracticeLocation) => {
    setSelectedLocationId(loc.id);
    // Reset slot if location changed
    setSelectedSlot(null);
    setCurrentStep(2);
    window.scrollTo({ top: 100, behavior: 'smooth' });
  };

  const handleDateSelect = (dateStr: string) => {
    setSelectedDate(dateStr);
    setSelectedSlot(null);
    setCurrentStep(3);
    window.scrollTo({ top: 100, behavior: 'smooth' });
  };

  const handleSlotSelect = (slot: CandidateTimeSlot) => {
    setSelectedSlot(slot);
    setCurrentStep(4);
    window.scrollTo({ top: 100, behavior: 'smooth' });
  };

  const validatePatientDetails = (): boolean => {
    const errs: Record<string, string> = {};
    if (!patientName.trim()) {
      errs.patientName = 'Patient full name is required.';
    } else if (patientName.trim().length < 2) {
      errs.patientName = 'Please enter at least 2 characters.';
    }

    if (!patientMobile.trim()) {
      errs.patientMobile = '10-digit Indian mobile number is required.';
    } else if (!/^[6-9]\d{9}$/.test(patientMobile.trim())) {
      errs.patientMobile = 'Please enter a valid 10-digit Indian mobile number starting with 6-9.';
    }

    if (patientEmail.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(patientEmail.trim())) {
      errs.patientEmail = 'Please enter a valid email address.';
    }

    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleContinueFromDetails = () => {
    if (validatePatientDetails()) {
      setCurrentStep(5);
      window.scrollTo({ top: 100, behavior: 'smooth' });
    }
  };

  const handleSubmitBooking = async () => {
    if (!doctor || !selectedLocation || !selectedSlot) return;

    if (!validatePatientDetails()) {
      setCurrentStep(4);
      return;
    }

    setIsSubmitting(true);
    setSubmissionError(null);

    const bookingData: BookingFormData = {
      doctorUid: doctor.doctorUid,
      locationId: selectedLocation.id,
      appointmentDate: selectedDate,
      selectedSlot,
      patientName,
      patientMobile,
      patientEmail,
      visitReason,
      bookingSource: isQrBooking ? 'qr' : 'online',
    };

    const result = await createAuthoritativeAppointment(bookingData, doctor);
    setIsSubmitting(false);

    if (result.success && result.appointment) {
      setConfirmedAppointment(result.appointment);
      window.scrollTo({ top: 60, behavior: 'smooth' });
    } else {
      setSubmissionError(result.error || 'Failed to confirm appointment. Please choose another slot.');
      if (result.errorCode === 'SLOT_TAKEN') {
        // Reset slot and jump back to step 3 so patient can pick another slot
        setSelectedSlot(null);
      }
      window.scrollTo({ top: 120, behavior: 'smooth' });
    }
  };

  const handleBookAnother = () => {
    setConfirmedAppointment(null);
    setSelectedSlot(null);
    setSubmissionError(null);
    setCurrentStep(2);
  };

  // Loading Screen
  if (isLoadingDoctor) {
    return (
      <div className="bg-slate-50 min-h-screen py-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 space-y-6 animate-pulse">
          <div className="h-4 bg-slate-200 rounded w-48" />
          <div className="bg-white rounded-2xl p-8 border border-slate-200 space-y-4">
            <div className="h-8 bg-slate-200 rounded w-1/3" />
            <div className="h-4 bg-slate-100 rounded w-1/2" />
            <div className="h-48 bg-slate-50 rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  // Doctor Not Available / Ineligible Screen
  if (doctorError || !doctor) {
    return (
      <div className="bg-slate-50 min-h-screen py-16">
        <div className="max-w-md mx-auto px-4 text-center space-y-5">
          <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <AlertCircle className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">
            Booking Unavailable
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            {doctorError || 'The requested doctor is not published or currently not accepting online appointments.'}
          </p>
          <div className="pt-2">
            <Link to="/doctors">
              <Button variant="primary" size="md" leftIcon={<ArrowLeft className="w-4 h-4" />}>
                Browse Doctor Directory
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 min-h-screen py-8 lg:py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Back Link */}
        {!confirmedAppointment && (
          <Link
            to={`/doctors/${doctor.doctorUid}`}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-700 hover:text-teal-900 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Dr. {doctor.fullName}&apos;s Profile
          </Link>
        )}

        {/* Confirmed Screen */}
        {confirmedAppointment ? (
          <BookingConfirmationView
            appointment={confirmedAppointment}
            doctorName={doctor.fullName}
            specialization={doctor.specialization}
            onBookAnother={handleBookAnother}
          />
        ) : (
          /* Booking Stepper & Flow */
          <div className="space-y-6">
            {/* Inactive Location Alert if patient opened an inactive clinic URL */}
            {inactiveLocationWarning && (
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center gap-3 shadow-2xs">
                <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
                <span className="font-medium">{inactiveLocationWarning}</span>
              </div>
            )}

            {/* Clinic QR Booking Banner */}
            {isQrBooking && selectedLocation && (
              <div className="bg-gradient-to-r from-teal-900 to-slate-900 text-white rounded-2xl p-4 sm:p-5 flex items-center justify-between gap-4 shadow-sm border border-teal-800/40">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-teal-800/60 text-teal-300 flex items-center justify-center shrink-0 border border-teal-700/50">
                    <QrCode className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs uppercase font-bold text-teal-400 tracking-wider">
                        Clinic QR Scan Booking
                      </span>
                      <span className="text-slate-600">·</span>
                      <span className="text-xs text-emerald-400 font-semibold">
                        Instant Queue Token
                      </span>
                    </div>
                    <p className="text-sm font-bold text-white">
                      {selectedLocation.name} · {selectedLocation.locality}, {selectedLocation.city}
                    </p>
                  </div>
                </div>
                <span className="hidden sm:inline-flex px-3 py-1 rounded-full bg-teal-800/80 text-teal-200 text-xs font-semibold">
                  Preselected Clinic
                </span>
              </div>
            )}

            {/* Stepper Indicator */}
            <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs">
              <div className="flex items-center justify-between">
                {STEPS.map((s, idx) => {
                  const isCurrent = currentStep === s.id;
                  const isCompleted = currentStep > s.id;

                  return (
                    <React.Fragment key={s.id}>
                      <button
                        type="button"
                        onClick={() => {
                          if (currentStep > s.id) setCurrentStep(s.id);
                        }}
                        disabled={currentStep < s.id}
                        className={`flex flex-col sm:flex-row items-center gap-1.5 text-xs font-bold transition-colors ${
                          isCurrent
                            ? 'text-teal-700'
                            : isCompleted
                            ? 'text-slate-900 hover:text-teal-700 cursor-pointer'
                            : 'text-slate-300 cursor-not-allowed'
                        }`}
                      >
                        <span
                          className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold ${
                            isCurrent
                              ? 'bg-teal-600 text-white'
                              : isCompleted
                              ? 'bg-teal-100 text-teal-800'
                              : 'bg-slate-100 text-slate-400'
                          }`}
                        >
                          {isCompleted ? '✓' : s.id}
                        </span>
                        <span className="hidden sm:inline">{s.title}</span>
                      </button>
                      {idx < STEPS.length - 1 && (
                        <div
                          className={`flex-1 h-0.5 mx-2 ${
                            currentStep > idx + 1 ? 'bg-teal-600' : 'bg-slate-200'
                          }`}
                        />
                      )}
                    </React.Fragment>
                  );
                })}
              </div>
            </div>

            {/* Main Form Body */}
            <Card className="bg-white border-slate-200 p-5 sm:p-7 md:p-8 space-y-6 shadow-xs">
              {currentStep === 1 && (
                <StepLocationSelect
                  doctor={doctor}
                  selectedLocationId={selectedLocationId}
                  onSelectLocation={handleLocationSelect}
                />
              )}

              {currentStep === 2 && (
                <StepDateSelect
                  doctor={doctor}
                  selectedDate={selectedDate}
                  onSelectDate={handleDateSelect}
                />
              )}

              {currentStep === 3 && (
                <StepTimeSlotSelect
                  doctor={doctor}
                  locationId={selectedLocationId}
                  selectedDate={selectedDate}
                  selectedSlot={selectedSlot}
                  onSelectSlot={handleSlotSelect}
                />
              )}

              {currentStep === 4 && (
                <StepPatientDetails
                  patientName={patientName}
                  patientMobile={patientMobile}
                  patientEmail={patientEmail}
                  visitReason={visitReason}
                  consultationFee={currentFee}
                  errors={fieldErrors}
                  onChange={(fields) => {
                    if (fields.patientName !== undefined) setPatientName(fields.patientName);
                    if (fields.patientMobile !== undefined) setPatientMobile(fields.patientMobile);
                    if (fields.patientEmail !== undefined) setPatientEmail(fields.patientEmail);
                    if (fields.visitReason !== undefined) setVisitReason(fields.visitReason);
                  }}
                />
              )}

              {currentStep === 5 && selectedLocation && selectedSlot && (
                <StepReviewSubmit
                  doctor={doctor}
                  location={selectedLocation}
                  appointmentDate={selectedDate}
                  selectedSlot={selectedSlot}
                  patientName={patientName}
                  patientMobile={patientMobile}
                  patientEmail={patientEmail}
                  visitReason={visitReason}
                  consultationFee={currentFee}
                  isSubmitting={isSubmitting}
                  submissionError={submissionError}
                  onSubmitBooking={handleSubmitBooking}
                  onEditStep={(step) => setCurrentStep(step)}
                />
              )}

              {/* Navigation Back / Next Controls for Steps 2 to 4 */}
              <div className="pt-6 border-t border-slate-200 flex items-center justify-between gap-3">
                {currentStep > 1 ? (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentStep((prev) => prev - 1)}
                    leftIcon={<ArrowLeft className="w-3.5 h-3.5" />}
                  >
                    Back
                  </Button>
                ) : (
                  <div />
                )}

                {currentStep === 2 && selectedDate && (
                  <Button
                    type="button"
                    variant="primary"
                    size="sm"
                    onClick={() => setCurrentStep(3)}
                    rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                  >
                    Continue to Time Slots
                  </Button>
                )}

                {currentStep === 3 && selectedSlot && (
                  <Button
                    type="button"
                    variant="primary"
                    size="sm"
                    onClick={() => setCurrentStep(4)}
                    rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                  >
                    Continue to Patient Info
                  </Button>
                )}

                {currentStep === 4 && (
                  <Button
                    type="button"
                    variant="primary"
                    size="sm"
                    onClick={handleContinueFromDetails}
                    rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                  >
                    Review Appointment
                  </Button>
                )}
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};
