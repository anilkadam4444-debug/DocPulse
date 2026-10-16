import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  MapPin,
  Building,
  Clock,
  IndianRupee,
  ShieldCheck,
  Award,
  Globe,
  GraduationCap,
  Calendar,
  AlertCircle,
  CheckCircle2,
  Phone,
  QrCode,
  Info,
  CalendarCheck,
} from 'lucide-react';
import { getPublicDoctorById } from '../doctor-search/searchService';
import { PublicDoctorProfile, PublicPracticeLocation } from '../../types/public-doctor';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';

export const PublicDoctorProfilePage: React.FC = () => {
  const { doctorId } = useParams<{ doctorId: string }>();

  const [doctor, setDoctor] = useState<PublicDoctorProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedLocation, setSelectedLocation] = useState<PublicPracticeLocation | null>(null);

  useEffect(() => {
    if (!doctorId) {
      setIsLoading(false);
      return;
    }

    let isMounted = true;
    setIsLoading(true);

    const loadProfile = async () => {
      const data = await getPublicDoctorById(doctorId);
      if (isMounted) {
        setDoctor(data);
        if (data && data.locations.length > 0) {
          const primary = data.locations.find((l) => l.isPrimary) || data.locations[0];
          setSelectedLocation(primary);
        }
        setIsLoading(false);
      }
    };

    loadProfile();

    return () => {
      isMounted = false;
    };
  }, [doctorId]);

  // Loading state
  if (isLoading) {
    return (
      <div className="bg-slate-50 min-h-screen py-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 animate-pulse">
          <div className="h-4 bg-slate-200 rounded w-40" />
          <div className="bg-white rounded-2xl p-8 border border-slate-200 space-y-4">
            <div className="h-8 bg-slate-200 rounded w-1/3" />
            <div className="h-4 bg-slate-100 rounded w-1/4" />
            <div className="h-20 bg-slate-50 rounded" />
          </div>
        </div>
      </div>
    );
  }

  // Not Found / Unpublished State
  if (!doctor) {
    return (
      <div className="bg-slate-50 min-h-screen py-16">
        <div className="max-w-xl mx-auto px-4 text-center space-y-5">
          <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <AlertCircle className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">
            Doctor Profile Not Available
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            The requested doctor profile could not be found, or has not yet been published to the
            public directory.
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
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Navigation Breadcrumb */}
        <Link
          to={`/doctors?city=${encodeURIComponent(doctor.city)}`}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-700 hover:text-teal-900 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Doctors in {doctor.city}
        </Link>

        {/* Doctor Header Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 shadow-xs space-y-5">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 pb-6 border-b border-slate-100">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-teal-700 bg-teal-50 px-2.5 py-0.5 rounded border border-teal-200/60">
                  {doctor.specialization}
                </span>
                {doctor.customSpecialization && (
                  <span className="text-xs text-slate-500">({doctor.customSpecialization})</span>
                )}
                <span className="text-xs text-slate-400 font-mono">
                  · {doctor.city}
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                {doctor.fullName}
              </h1>

              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600">
                <span className="font-semibold text-slate-800">{doctor.qualifications}</span>
                {doctor.experienceYears && (
                  <>
                    <span className="text-slate-300">·</span>
                    <span>{doctor.experienceYears} Years Clinical Experience</span>
                  </>
                )}
                {doctor.languages.length > 0 && (
                  <>
                    <span className="text-slate-300">·</span>
                    <span>Speaks {doctor.languages.join(', ')}</span>
                  </>
                )}
              </div>
            </div>

            {/* Fee & Action Block */}
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200/80 text-right space-y-2 shrink-0 md:min-w-[200px]">
              <div>
                <span className="text-[11px] text-slate-500 block">Consultation Fee</span>
                <span className="text-2xl font-black text-slate-900 font-mono">
                  ₹{doctor.consultationFee}
                </span>
              </div>
              {doctor.followUpFee && (
                <div className="text-[11px] text-slate-500 border-t border-slate-200 pt-1.5">
                  Follow-up: ₹{doctor.followUpFee} (Within {doctor.followUpDays || 7} days)
                </div>
              )}
              <Link to={`/doctors/${doctor.doctorUid}/book${selectedLocation ? `?locationId=${selectedLocation.id}` : ''}`}>
                <Button
                  variant="primary"
                  size="md"
                  className="w-full justify-center mt-1"
                  leftIcon={<CalendarCheck className="w-4 h-4" />}
                >
                  Book Appointment
                </Button>
              </Link>
            </div>
          </div>

          {/* Medical Registration Transparency Note */}
          <div className="bg-slate-50/80 rounded-xl p-3.5 border border-slate-200 text-xs flex items-start gap-2.5 text-slate-600">
            <ShieldCheck className="w-4 h-4 text-teal-700 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <span>
                Registered with <strong>{doctor.registrationCouncil}</strong> under Licence No.{' '}
                <strong className="font-mono text-slate-800">{doctor.registrationNumber}</strong>.
              </span>
              <p className="text-[11px] text-slate-400">
                Council Credential Cross-Reference: Under Review with state medical register.
              </p>
            </div>
          </div>

          {/* Biography */}
          {doctor.bio && (
            <div className="space-y-2 pt-2">
              <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                About the Practitioner
              </h2>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                {doctor.bio}
              </p>
            </div>
          )}
        </div>

        {/* 2-Column: Practice Locations & Consultation Schedule */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
          {/* Practice Locations (7 cols) */}
          <div className="md:col-span-7 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Building className="w-4 h-4 text-teal-600" />
                Active Practice Locations ({doctor.locations.length})
              </h2>
              <span className="text-xs text-slate-500">Walk-In &amp; In-Person OPD</span>
            </div>

            <div className="space-y-3">
              {doctor.locations.map((loc) => {
                const isSelected = selectedLocation?.id === loc.id;
                return (
                  <div
                    key={loc.id}
                    onClick={() => setSelectedLocation(loc)}
                    className={`bg-white rounded-xl border p-4 sm:p-5 transition-all cursor-pointer shadow-2xs ${
                      isSelected
                        ? 'border-teal-400 ring-1 ring-teal-300'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-bold text-slate-900">{loc.name}</h3>
                          {loc.isPrimary && (
                            <span className="text-[10px] px-2 py-0.5 rounded bg-teal-100 text-teal-800 font-bold">
                              Primary
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-slate-600 mt-1 flex items-start gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                          <span>
                            {loc.addressLine}, {loc.locality}
                            {loc.landmark ? `, Near ${loc.landmark}` : ''}, {loc.city}, {loc.state} –{' '}
                            <strong className="font-mono text-slate-800">{loc.pincode}</strong>
                          </span>
                        </div>
                      </div>

                      {loc.consultationFee && (
                        <span className="text-xs font-bold text-slate-900 font-mono shrink-0">
                          ₹{loc.consultationFee}
                        </span>
                      )}
                    </div>

                    {loc.phone && (
                      <div className="mt-2 text-xs text-slate-600 flex items-center gap-1.5">
                        <Phone className="w-3 h-3 text-slate-400" />
                        <span>Reception Contact: {loc.phone}</span>
                      </div>
                    )}

                    {loc.facilities && loc.facilities.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-3 pt-2 border-t border-slate-100">
                        {loc.facilities.map((fac) => (
                          <span
                            key={fac}
                            className="text-[10px] px-2 py-0.5 rounded bg-slate-50 text-slate-600 border border-slate-200"
                          >
                            {fac}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Working Schedule (5 cols) */}
          <div className="md:col-span-5 space-y-4">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Clock className="w-4 h-4 text-teal-600" />
              OPD Working Hours
            </h2>

            <Card className="bg-white border-slate-200 p-5 space-y-4 shadow-xs">
              <div className="space-y-1">
                <span className="text-xs text-slate-500 block">Consulting Working Days:</span>
                <div className="flex flex-wrap gap-1">
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => {
                    const isOpen = doctor.schedule.workingDays.includes(day);
                    return (
                      <span
                        key={day}
                        className={`text-xs px-2 py-1 rounded font-medium ${
                          isOpen
                            ? 'bg-teal-600 text-white font-bold'
                            : 'bg-slate-100 text-slate-400'
                        }`}
                      >
                        {day}
                      </span>
                    );
                  })}
                </div>
              </div>

              {/* Shift 1 */}
              <div className="border-t border-slate-100 pt-3 space-y-1 text-xs">
                <span className="font-bold text-slate-800 block">Morning Shift OPD:</span>
                <span className="text-slate-600 font-mono text-sm block">
                  {doctor.schedule.session1.openTime} – {doctor.schedule.session1.closeTime}
                </span>
                {doctor.schedule.session1.hasBreak && (
                  <span className="text-[11px] text-slate-400 block">
                    (Mid-shift buffer: {doctor.schedule.session1.breakStart} -{' '}
                    {doctor.schedule.session1.breakEnd})
                  </span>
                )}
              </div>

              {/* Shift 2 */}
              {doctor.schedule.hasSession2 && doctor.schedule.session2 && (
                <div className="border-t border-slate-100 pt-3 space-y-1 text-xs">
                  <span className="font-bold text-slate-800 block">Evening Shift OPD:</span>
                  <span className="text-slate-600 font-mono text-sm block">
                    {doctor.schedule.session2.openTime} – {doctor.schedule.session2.closeTime}
                  </span>
                  {doctor.schedule.session2.hasBreak && (
                    <span className="text-[11px] text-slate-400 block">
                      (Mid-shift buffer: {doctor.schedule.session2.breakStart} -{' '}
                      {doctor.schedule.session2.breakEnd})
                    </span>
                  )}
                </div>
              )}

              {/* Walk-in QR Stand */}
              <div className="border-t border-slate-100 pt-3 text-xs space-y-1 text-slate-600">
                <div className="flex items-center gap-1.5 font-semibold text-slate-800">
                  <QrCode className="w-4 h-4 text-teal-600" />
                  <span>Reception QR Stand Check-In</span>
                </div>
                <p className="text-[11px] text-slate-500">
                  {doctor.bookingPreferences.walkInQREnabled
                    ? 'Walk-in patients can check in on-site at the clinic reception by scanning the DocPulse QR stand.'
                    : 'Visits are arranged by appointment only.'}
                </p>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};
