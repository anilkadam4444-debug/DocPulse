import React, { useState, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  MapPin,
  Stethoscope,
  Search,
  Clock,
  ShieldCheck,
  Building,
  Calendar,
  AlertCircle,
  Phone,
  ArrowRight,
  Filter,
} from 'lucide-react';
import { INDIAN_CITIES, SPECIALIZATIONS, SAMPLE_DOCTORS } from '../../lib/city-data';
import { formatQueueToken } from '../../lib/queue-calculator';
import { IndianCity, DoctorProfile } from '../../types';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';

export const DoctorDiscoveryPlaceholder: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const cityParam = (searchParams.get('city') as IndianCity) || 'Mumbai';
  const specParam = searchParams.get('specialization') || 'All Specializations';
  const queryParam = searchParams.get('q') || '';

  const [selectedCity, setSelectedCity] = useState<IndianCity>(cityParam);
  const [selectedSpec, setSelectedSpec] = useState<string>(specParam);
  const [searchQuery, setSearchQuery] = useState<string>(queryParam);
  const [bookedDoctor, setBookedDoctor] = useState<DoctorProfile | null>(null);

  // Close modal on Escape
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setBookedDoctor(null);
    };
    if (bookedDoctor) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [bookedDoctor]);

  // Sync state if URL changes
  const handleCityChange = (newCity: IndianCity) => {
    setSelectedCity(newCity);
    const newParams = new URLSearchParams(searchParams);
    newParams.set('city', newCity);
    setSearchParams(newParams);
  };

  const handleSpecChange = (newSpec: string) => {
    setSelectedSpec(newSpec);
    const newParams = new URLSearchParams(searchParams);
    if (newSpec && newSpec !== 'All Specializations') {
      newParams.set('specialization', newSpec);
    } else {
      newParams.delete('specialization');
    }
    setSearchParams(newParams);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newParams = new URLSearchParams(searchParams);
    newParams.set('city', selectedCity);
    if (selectedSpec && selectedSpec !== 'All Specializations') {
      newParams.set('specialization', selectedSpec);
    } else {
      newParams.delete('specialization');
    }
    if (searchQuery.trim()) {
      newParams.set('q', searchQuery.trim());
    } else {
      newParams.delete('q');
    }
    setSearchParams(newParams);
  };

  // Filter sample doctors
  const filteredDoctors = useMemo(() => {
    return SAMPLE_DOCTORS.filter((doc) => {
      // City matching
      const matchesCity = doc.practiceLocations.some((loc) => loc.city === selectedCity);
      // Spec matching
      const matchesSpec =
        selectedSpec === 'All Specializations' || doc.specialization === selectedSpec;
      // Query matching (doctor name or clinic name)
      const q = searchQuery.toLowerCase().trim();
      const matchesQuery =
        !q ||
        doc.fullName.toLowerCase().includes(q) ||
        doc.practiceLocations.some((loc) => (loc.clinicName || loc.name || '').toLowerCase().includes(q)) ||
        doc.specialization.toLowerCase().includes(q);

      return matchesCity && matchesSpec && matchesQuery;
    });
  }, [selectedCity, selectedSpec, searchQuery]);

  return (
    <div className="bg-slate-50 min-h-screen py-8 lg:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Phase Architectural Notice */}
        <div className="bg-teal-50 border border-teal-200/80 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-teal-900">
          <div className="flex items-center gap-2.5">
            <span className="w-2 h-2 rounded-full bg-teal-600 shrink-0" />
            <span>
              <strong>Platform Foundation Preview:</strong> City-first discovery module. Live
              Firestore database persistence &amp; online booking API will connect in Phase 2.
            </span>
          </div>
          <span className="text-teal-700 font-medium">Architecture Phase 1</span>
        </div>

        {/* Discovery Filter Header */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 md:p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-teal-700">
                Patient Doctor Discovery
              </span>
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">
                Doctors &amp; Clinics in {selectedCity}
              </h1>
            </div>
            <div className="text-xs text-slate-500">
              Showing <strong className="text-slate-900">{filteredDoctors.length}</strong> practice{filteredDoctors.length === 1 ? '' : 's'}
            </div>
          </div>

          {/* Filter Bar */}
          <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 md:grid-cols-12 gap-3">
            {/* City */}
            <div className="md:col-span-3 space-y-1">
              <label htmlFor="city-filter" className="block text-xs font-semibold text-slate-700">
                City (Mandatory)
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-teal-600 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <select
                  id="city-filter"
                  value={selectedCity}
                  onChange={(e) => handleCityChange(e.target.value as IndianCity)}
                  className="w-full bg-slate-50 text-slate-900 text-sm font-medium rounded-lg border border-slate-300 focus:border-teal-600 focus:ring-2 focus:ring-teal-100 py-2 pl-9 pr-7 transition-colors cursor-pointer"
                >
                  {INDIAN_CITIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Specialization */}
            <div className="md:col-span-4 space-y-1">
              <label htmlFor="spec-filter" className="block text-xs font-semibold text-slate-700">
                Specialization
              </label>
              <div className="relative">
                <Stethoscope className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <select
                  id="spec-filter"
                  value={selectedSpec}
                  onChange={(e) => handleSpecChange(e.target.value)}
                  className="w-full bg-slate-50 text-slate-900 text-sm rounded-lg border border-slate-300 focus:border-teal-600 focus:ring-2 focus:ring-teal-100 py-2 pl-9 pr-7 transition-colors cursor-pointer"
                >
                  <option value="All Specializations">All Specializations</option>
                  {SPECIALIZATIONS.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Keyword Search */}
            <div className="md:col-span-3 space-y-1">
              <label htmlFor="query-filter" className="block text-xs font-semibold text-slate-700">
                Doctor or Clinic Name
              </label>
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="query-filter"
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="e.g. Sharma or Aarogyam"
                  className="w-full bg-slate-50 text-slate-900 placeholder:text-slate-400 text-sm rounded-lg border border-slate-300 focus:border-teal-600 focus:ring-2 focus:ring-teal-100 py-2 pl-9 pr-3 transition-colors"
                />
              </div>
            </div>

            {/* Filter Action */}
            <div className="md:col-span-2 flex items-end">
              <Button type="submit" variant="primary" size="md" className="w-full h-[38px] justify-center">
                Filter
              </Button>
            </div>
          </form>
        </div>

        {/* Doctor Results List */}
        <div className="space-y-4">
          {filteredDoctors.length > 0 ? (
            filteredDoctors.map((doc) => {
              const primaryLoc = doc.practiceLocations[0];
              const session = doc.activeSessionToday;

              return (
                <div
                  key={doc.id}
                  className="bg-white rounded-2xl border border-slate-200/90 p-5 md:p-6 shadow-xs hover:border-slate-300 transition-all space-y-4"
                >
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                    {/* Doctor Info */}
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                        <span className="font-semibold text-teal-700">{doc.specialization}</span>
                        <span aria-hidden="true">·</span>
                        <span>{doc.qualifications}</span>
                        <span aria-hidden="true">·</span>
                        <span>{doc.experienceYears} Years Exp</span>
                      </div>

                      <h2 className="text-lg font-bold text-slate-900">{doc.fullName}</h2>

                      <div className="flex items-center gap-2 text-xs text-slate-600">
                        <ShieldCheck className="w-4 h-4 text-teal-600 shrink-0" />
                        <span>
                          Reg: <strong className="text-slate-800">{doc.registrationNumber}</strong>{' '}
                          ({doc.stateCouncil})
                        </span>
                      </div>

                      <div className="flex items-start gap-2 text-xs text-slate-600 pt-1">
                        <Building className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                        <div>
                          <strong className="text-slate-800">{primaryLoc.clinicName}</strong>
                          <p className="text-slate-500">
                            {primaryLoc.addressLine}, {primaryLoc.locality}, {primaryLoc.city} -{' '}
                            {primaryLoc.pincode}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Practice Timing & Pricing Box */}
                    <div className="bg-slate-50 rounded-xl p-4 border border-slate-200/80 md:w-72 shrink-0 space-y-3">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-500">Consultation Fee:</span>
                        <span className="text-sm font-bold text-slate-900">
                          ₹{doc.consultationFeeInr}
                        </span>
                      </div>

                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-500">Avg. Consultation:</span>
                        <span className="font-semibold text-slate-800">
                          {doc.averageConsultationMinutes} mins
                        </span>
                      </div>

                      {session && (
                        <div className="pt-2 border-t border-slate-200 space-y-1 text-xs">
                          <div className="flex justify-between text-slate-600">
                            <span>Today&apos;s Session:</span>
                            <span className="font-medium">
                              {session.startTime} - {session.endTime}
                            </span>
                          </div>
                          <div className="flex justify-between text-slate-600">
                            <span>Now Serving:</span>
                            <span className="font-mono font-bold text-teal-700">
                              {formatQueueToken(session.currentServingToken)}
                            </span>
                          </div>
                        </div>
                      )}

                      <Button
                        variant="primary"
                        size="sm"
                        className="w-full justify-center mt-1"
                        onClick={() => setBookedDoctor(doc)}
                      >
                        Request Token
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
                <Search className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-slate-900">
                  No doctors found matching your filter
                </h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  Try switching city, clearing the doctor name search, or selecting &ldquo;All
                  Specializations&rdquo;.
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSelectedSpec('All Specializations');
                  setSearchQuery('');
                  setSearchParams({ city: selectedCity });
                }}
              >
                Reset Filters
              </Button>
            </div>
          )}
        </div>

        {/* Modal feedback when booking is clicked */}
        {bookedDoctor && (
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="preview-modal-title"
            onClick={(e) => {
              if (e.target === e.currentTarget) setBookedDoctor(null);
            }}
            className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150"
          >
            <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-modal border border-slate-200">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-teal-700">
                    Token Booking Preview
                  </span>
                  <h3 id="preview-modal-title" className="text-lg font-bold text-slate-900 mt-0.5">
                    {bookedDoctor.fullName}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {bookedDoctor.practiceLocations[0].clinicName}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setBookedDoctor(null)}
                  className="text-slate-400 hover:text-slate-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 rounded p-1"
                  aria-label="Close booking preview dialog"
                >
                  ✕
                </button>
              </div>

              <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200 text-xs space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-500">Next Available Token:</span>
                  <span className="font-mono font-bold text-teal-700 text-sm">
                    {formatQueueToken((bookedDoctor.activeSessionToday?.totalIssuedTokens || 10) + 1)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Doctor Duration:</span>
                  <span className="font-semibold text-slate-800">
                    {bookedDoctor.averageConsultationMinutes} mins / patient
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">WhatsApp Notification:</span>
                  <span className="text-emerald-700 font-medium">Ready</span>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-teal-50 border border-teal-200 text-xs text-teal-900">
                <strong>Phase 1 Foundation Note:</strong> In Phase 2, this modal will connect to
                patient phone validation, Firestore appointment records, and instant WhatsApp
                confirmation dispatch.
              </div>

              <Button
                variant="navy"
                size="md"
                className="w-full justify-center"
                onClick={() => setBookedDoctor(null)}
              >
                Close Preview
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
