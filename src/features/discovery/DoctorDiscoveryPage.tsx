import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  MapPin,
  Stethoscope,
  Building,
  Clock,
  IndianRupee,
  ShieldCheck,
  Award,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Calendar,
  Sparkles,
  X,
  CalendarCheck,
  Phone,
  Globe,
  Info,
  ExternalLink,
  QrCode,
  Eye,
} from 'lucide-react';
import { DoctorSearch } from '../doctor-search/DoctorSearch';
import { searchPublicDoctors } from '../doctor-search/searchService';
import { PublicDoctorProfile, PublicPracticeLocation } from '../../types/public-doctor';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';

export const DoctorDiscoveryPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const cityParam = searchParams.get('city') || '';
  const specParam = searchParams.get('specialization') || 'All Specializations';
  const queryParam = searchParams.get('q') || '';

  const [selectedCity, setSelectedCity] = useState<string>(cityParam);
  const [selectedSpec, setSelectedSpec] = useState<string>(specParam);
  const [searchQuery, setSearchQuery] = useState<string>(queryParam);

  const [doctors, setDoctors] = useState<PublicDoctorProfile[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Quick View Modal State
  const [selectedQuickDoctor, setSelectedQuickDoctor] = useState<PublicDoctorProfile | null>(null);
  const [activeModalLocationId, setActiveModalLocationId] = useState<string>('');

  // Sync state if URL changes
  useEffect(() => {
    if (cityParam !== selectedCity) setSelectedCity(cityParam);
    if (specParam !== selectedSpec) setSelectedSpec(specParam);
    if (queryParam !== searchQuery) setSearchQuery(queryParam);
  }, [cityParam, specParam, queryParam]);

  // Execute Firestore search whenever city, spec, or query change
  useEffect(() => {
    if (!selectedCity) {
      setDoctors([]);
      setIsLoading(false);
      return;
    }

    let isMounted = true;
    setIsLoading(true);
    setFetchError(null);

    const performSearch = async () => {
      const res = await searchPublicDoctors({
        city: selectedCity,
        specialization: selectedSpec,
        query: searchQuery,
      });

      if (isMounted) {
        if (res.error) {
          setFetchError(res.error);
        } else {
          setDoctors(res.doctors);
        }
        setIsLoading(false);
      }
    };

    performSearch();

    return () => {
      isMounted = false;
    };
  }, [selectedCity, selectedSpec, searchQuery]);

  // Update URL search parameters
  const updateUrlParams = (newCity: string, newSpec: string, newQuery: string) => {
    const params = new URLSearchParams();
    if (newCity) params.set('city', newCity);
    if (newSpec && newSpec !== 'All Specializations') params.set('specialization', newSpec);
    if (newQuery.trim()) params.set('q', newQuery.trim());
    setSearchParams(params);
  };

  const handleCityChange = (city: string) => {
    setSelectedCity(city);
    updateUrlParams(city, selectedSpec, searchQuery);
  };

  const handleSpecChange = (spec: string) => {
    setSelectedSpec(spec);
    updateUrlParams(selectedCity, spec, searchQuery);
  };

  const handleQueryChange = (q: string) => {
    setSearchQuery(q);
    updateUrlParams(selectedCity, selectedSpec, q);
  };

  const handleClearFilters = () => {
    setSelectedSpec('All Specializations');
    setSearchQuery('');
    updateUrlParams(selectedCity, 'All Specializations', '');
  };

  // Determine today's day of week (e.g. 'Mon', 'Tue', etc.)
  const todayDay = useMemo(() => {
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return dayNames[new Date().getDay()];
  }, []);

  return (
    <div className="bg-slate-50 min-h-screen py-8 lg:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Architectural / Privacy Notice */}
        <div className="bg-teal-50 border border-teal-200/80 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-teal-900">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-teal-600 shrink-0" />
            <span>
              <strong>Verified Patient Discovery Directory:</strong> Showing real published medical
              practices in Cloud Firestore. Single-tenant doctor isolation ensures private records
              remain protected.
            </span>
          </div>
          <span className="text-teal-800 font-semibold">Public Registry</span>
        </div>

        {/* Doctor Search Widget */}
        <DoctorSearch
          selectedCity={selectedCity}
          selectedSpec={selectedSpec}
          searchQuery={searchQuery}
          onCityChange={handleCityChange}
          onSpecChange={handleSpecChange}
          onQueryChange={handleQueryChange}
          onClearFilters={handleClearFilters}
          totalResults={selectedCity ? doctors.length : undefined}
          isLoading={isLoading}
        />

        {/* Step 1 Mandatory City Prompt (When No City is Selected) */}
        {!selectedCity && (
          <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-8 sm:p-12 text-center max-w-2xl mx-auto space-y-4">
            <div className="w-12 h-12 rounded-full bg-teal-50 text-teal-700 flex items-center justify-center mx-auto">
              <MapPin className="w-6 h-6" />
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900">
              Please Select a City to Browse Independent Doctors
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-lg mx-auto">
              DocPulse practices mandatory city-first discovery. Select your location above (such as
              Mumbai, Delhi-NCR, Bengaluru, Pune, or Hyderabad) to view clinics and practice timings
              in your area.
            </p>
            <div className="pt-2">
              <span className="text-xs font-semibold text-slate-400 block mb-2">
                Popular Practice Hubs:
              </span>
              <div className="flex flex-wrap justify-center gap-2">
                {['Mumbai', 'Delhi-NCR', 'Bengaluru', 'Pune', 'Hyderabad', 'Chennai'].map((city) => (
                  <Button
                    key={city}
                    variant="outline"
                    size="sm"
                    onClick={() => handleCityChange(city)}
                  >
                    {city}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Loading Skeleton */}
        {selectedCity && isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="bg-white rounded-2xl border border-slate-200 p-6 animate-pulse space-y-4 shadow-xs"
              >
                <div className="flex justify-between items-start">
                  <div className="space-y-2 w-3/4">
                    <div className="h-5 bg-slate-200 rounded w-1/2" />
                    <div className="h-4 bg-slate-100 rounded w-1/3" />
                  </div>
                  <div className="h-6 bg-slate-100 rounded w-16" />
                </div>
                <div className="h-12 bg-slate-50 rounded-xl" />
                <div className="h-9 bg-slate-200 rounded-lg w-full" />
              </div>
            ))}
          </div>
        )}

        {/* Error State */}
        {selectedCity && !isLoading && fetchError && (
          <div className="bg-rose-50 border border-rose-200 rounded-xl p-5 text-xs text-rose-900 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h3 className="font-bold text-sm">Unable to load doctor listings</h3>
              <p>{fetchError}</p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleCityChange(selectedCity)}
                className="mt-2 text-rose-800 border-rose-300"
              >
                Try Again
              </Button>
            </div>
          </div>
        )}

        {/* Empty State: No Published Doctors in City */}
        {selectedCity && !isLoading && !fetchError && doctors.length === 0 && (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 sm:p-12 text-center max-w-2xl mx-auto space-y-4 shadow-xs">
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <Stethoscope className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-bold text-slate-900">
              No Published Practice Listings Found in {selectedCity}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
              {searchQuery || (selectedSpec && selectedSpec !== 'All Specializations')
                ? 'No published doctors in this city matched your current search filters. Try resetting filters or searching with a different keyword.'
                : `No independent medical practitioners have published active directory listings in ${selectedCity} yet.`}
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              {(searchQuery || (selectedSpec && selectedSpec !== 'All Specializations')) && (
                <Button variant="outline" size="sm" onClick={handleClearFilters}>
                  Clear Search Filters
                </Button>
              )}
              <Link to="/doctor/register">
                <Button variant="primary" size="sm" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                  Register &amp; Publish Your Practice
                </Button>
              </Link>
            </div>
          </div>
        )}

        {/* Results Grid: Real Published Doctor Cards */}
        {selectedCity && !isLoading && !fetchError && doctors.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {doctors.map((doc) => {
              const primaryLocation =
                doc.locations.find((l) => l.isPrimary) || doc.locations[0];
              const isTodayWorking = doc.schedule.workingDays.includes(todayDay);

              return (
                <Card
                  key={doc.doctorUid}
                  className="bg-white border-slate-200 p-5 md:p-6 shadow-xs flex flex-col justify-between space-y-4 hover:border-slate-300 transition-colors"
                >
                  <div className="space-y-3.5">
                    {/* Header: Name, Spec & Status */}
                    <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-100">
                      <div>
                        <div className="flex items-center gap-2">
                          <h2 className="text-base sm:text-lg font-bold text-slate-900">
                            {doc.fullName}
                          </h2>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 mt-0.5">
                          <span className="text-xs font-semibold text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200/60">
                            {doc.specialization}
                          </span>
                          <span className="text-xs text-slate-500">{doc.qualifications}</span>
                        </div>
                      </div>

                      {/* Consultation Fee */}
                      <div className="text-right shrink-0">
                        <span className="text-[11px] text-slate-400 block">Consultation</span>
                        <div className="text-base font-extrabold text-slate-900 font-mono">
                          ₹{doc.consultationFee}
                        </div>
                      </div>
                    </div>

                    {/* Clinic Location & Experience */}
                    <div className="space-y-2 text-xs text-slate-600">
                      <div className="flex items-start gap-2">
                        <Building className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                        <div>
                          <strong className="text-slate-800 block">
                            {doc.primaryClinicName}
                          </strong>
                          <span>
                            {primaryLocation?.addressLine ? `${primaryLocation.addressLine}, ` : ''}
                            {doc.primaryLocality ? `${doc.primaryLocality}, ` : ''}
                            {doc.city}
                            {doc.primaryPincode ? ` – ${doc.primaryPincode}` : ''}
                          </span>
                        </div>
                      </div>

                      {doc.experienceYears && (
                        <div className="flex items-center gap-2">
                          <Award className="w-3.5 h-3.5 text-slate-400" />
                          <span>{doc.experienceYears} Years Clinical Experience</span>
                        </div>
                      )}

                      {/* OPD Schedule / Session Timing */}
                      <div className="flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>
                          Shift 1: {doc.schedule.session1.openTime} – {doc.schedule.session1.closeTime}
                          {doc.schedule.hasSession2 && doc.schedule.session2 && (
                            <span> · Shift 2: {doc.schedule.session2.openTime} – {doc.schedule.session2.closeTime}</span>
                          )}
                        </span>
                      </div>
                    </div>

                    {/* Operational Availability Badges (Accurate & Non-invented) */}
                    <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px]">
                      {isTodayWorking ? (
                        <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          OPD Open Today ({todayDay})
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-500 font-medium">
                          Closed Today · Open {doc.schedule.workingDays.slice(0, 3).join(', ')}...
                        </span>
                      )}

                      {doc.schedule.acceptsWalkIns ? (
                        <span className="px-2 py-0.5 rounded bg-teal-50 text-teal-800 font-medium border border-teal-200/50">
                          Walk-In QR Stand
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-medium">
                          By Prior Appointment
                        </span>
                      )}

                      {doc.locations.length > 1 && (
                        <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-medium">
                          {doc.locations.length} Clinic Locations
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2.5">
                    <span className="text-[11px] text-slate-400">
                      Council Reg: {doc.registrationNumber}
                    </span>

                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedQuickDoctor(doc);
                          const primaryLoc = doc.locations.find((l) => l.isPrimary) || doc.locations[0];
                          setActiveModalLocationId(primaryLoc?.id || '');
                        }}
                        leftIcon={<Eye className="w-3.5 h-3.5" />}
                        className="text-xs"
                      >
                        Quick View
                      </Button>

                      <Link to={`/doctors/${doc.doctorUid}`}>
                        <Button
                          variant="primary"
                          size="sm"
                          rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                          className="text-xs"
                        >
                          Book Appointment
                        </Button>
                      </Link>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}

        {/* Doctor Quick View Modal / Drawer */}
        {selectedQuickDoctor && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl max-w-2xl w-full border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
              {/* Modal Header */}
              <div className="p-5 sm:p-6 border-b border-slate-100 flex items-start justify-between gap-4 bg-slate-50/60">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-bold text-teal-800 bg-teal-50 px-2.5 py-0.5 rounded border border-teal-200/60">
                      {selectedQuickDoctor.specialization}
                    </span>
                    <span className="text-xs text-slate-500 font-medium">
                      {selectedQuickDoctor.qualifications}
                    </span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
                    {selectedQuickDoctor.fullName}
                  </h2>
                  <div className="text-xs text-slate-600 mt-0.5 flex flex-wrap items-center gap-2">
                    {selectedQuickDoctor.experienceYears && (
                      <span>{selectedQuickDoctor.experienceYears} Years Clinical Experience</span>
                    )}
                    {selectedQuickDoctor.languages.length > 0 && (
                      <span>· Speaks {selectedQuickDoctor.languages.join(', ')}</span>
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedQuickDoctor(null)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                  aria-label="Close modal"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body: Scrollable */}
              <div className="p-5 sm:p-6 space-y-5 overflow-y-auto">
                {/* Registration & Transparency */}
                <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 text-xs flex items-start gap-2.5 text-slate-600">
                  <ShieldCheck className="w-4 h-4 text-teal-700 shrink-0 mt-0.5" />
                  <div>
                    <span>
                      Registered with <strong>{selectedQuickDoctor.registrationCouncil}</strong> under Licence No.{' '}
                      <strong className="font-mono text-slate-800">
                        {selectedQuickDoctor.registrationNumber}
                      </strong>
                    </span>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Independent practice certified on DocPulse live discovery network.
                    </p>
                  </div>
                </div>

                {/* Consultation Fee Card */}
                <div className="flex items-center justify-between p-4 rounded-xl bg-teal-50/50 border border-teal-200/60">
                  <div>
                    <span className="text-xs text-teal-900 font-semibold block">Consultation Fee</span>
                    <span className="text-2xl font-black text-slate-900 font-mono">
                      ₹{selectedQuickDoctor.consultationFee}
                    </span>
                  </div>
                  {selectedQuickDoctor.followUpFee && (
                    <div className="text-right text-xs text-slate-600">
                      <span className="text-slate-400 block text-[11px]">Follow-Up Fee</span>
                      <span className="font-bold text-slate-800">
                        ₹{selectedQuickDoctor.followUpFee} (Within {selectedQuickDoctor.followUpDays || 7} days)
                      </span>
                    </div>
                  )}
                </div>

                {/* Bio if available */}
                {selectedQuickDoctor.bio && (
                  <div className="space-y-1">
                    <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                      About Dr. {selectedQuickDoctor.fullName}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                      {selectedQuickDoctor.bio}
                    </p>
                  </div>
                )}

                {/* Locations Selector */}
                <div className="space-y-2.5">
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                    <Building className="w-4 h-4 text-teal-600" />
                    Practice Locations ({selectedQuickDoctor.locations.length})
                  </h3>

                  <div className="space-y-2">
                    {selectedQuickDoctor.locations.map((loc) => {
                      const isSelected =
                        activeModalLocationId === loc.id ||
                        (!activeModalLocationId && loc.isPrimary);
                      return (
                        <div
                          key={loc.id}
                          onClick={() => setActiveModalLocationId(loc.id)}
                          className={`p-3.5 rounded-xl border text-xs transition-colors cursor-pointer ${
                            isSelected
                              ? 'border-teal-400 bg-teal-50/30 ring-1 ring-teal-300'
                              : 'border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <div className="flex items-center gap-2">
                                <strong className="text-slate-900 font-bold">{loc.name}</strong>
                                {loc.isPrimary && (
                                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-teal-100 text-teal-800 font-bold">
                                    Primary
                                  </span>
                                )}
                              </div>
                              <div className="text-slate-600 mt-1 flex items-start gap-1">
                                <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                                <span>
                                  {loc.addressLine}, {loc.locality}
                                  {loc.landmark ? `, Near ${loc.landmark}` : ''}, {loc.city} – {loc.pincode}
                                </span>
                              </div>
                              {loc.phone && (
                                <div className="text-slate-600 mt-1 flex items-center gap-1">
                                  <Phone className="w-3 h-3 text-slate-400" />
                                  <span>Reception: {loc.phone}</span>
                                </div>
                              )}
                            </div>
                            {loc.consultationFee && (
                              <span className="font-mono font-bold text-slate-900 shrink-0">
                                ₹{loc.consultationFee}
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Working OPD Schedule */}
                <div className="space-y-2">
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-teal-600" />
                    Consultation Shift Timings
                  </h3>
                  <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200 text-xs space-y-2">
                    <div className="flex flex-wrap items-center gap-1">
                      <span className="text-slate-500 mr-1">Working Days:</span>
                      {selectedQuickDoctor.schedule.workingDays.map((d) => (
                        <span
                          key={d}
                          className="px-2 py-0.5 rounded bg-teal-600 text-white font-bold text-[10px]"
                        >
                          {d}
                        </span>
                      ))}
                    </div>
                    <div className="border-t border-slate-200 pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <span className="font-bold text-slate-800 block">Shift 1 (Morning OPD):</span>
                        <span className="font-mono text-slate-600">
                          {selectedQuickDoctor.schedule.session1.openTime} –{' '}
                          {selectedQuickDoctor.schedule.session1.closeTime}
                        </span>
                      </div>
                      {selectedQuickDoctor.schedule.hasSession2 && selectedQuickDoctor.schedule.session2 && (
                        <div>
                          <span className="font-bold text-slate-800 block">Shift 2 (Evening OPD):</span>
                          <span className="font-mono text-slate-600">
                            {selectedQuickDoctor.schedule.session2.openTime} –{' '}
                            {selectedQuickDoctor.schedule.session2.closeTime}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Walk-in notice */}
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2.5">
                  <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="block font-bold">Appointment &amp; Walk-In Guidance</strong>
                    <p className="leading-relaxed mt-0.5">
                      {selectedQuickDoctor.schedule.acceptsWalkIns
                        ? 'Patients may walk in during published OPD shifts and check in on-site using the reception QR token stand.'
                        : 'Patients are requested to arrange consultations by prior appointment.'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-4 sm:p-5 border-t border-slate-100 flex items-center justify-between gap-3 bg-slate-50/60">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedQuickDoctor(null)}
                >
                  Close
                </Button>

                <Link
                  to={`/doctors/${selectedQuickDoctor.doctorUid}`}
                  onClick={() => setSelectedQuickDoctor(null)}
                >
                  <Button
                    variant="primary"
                    size="sm"
                    rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                  >
                    View Full Dedicated Profile
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
