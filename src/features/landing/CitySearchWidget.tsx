import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Stethoscope, Search, ArrowRight } from 'lucide-react';
import { INDIAN_CITIES, SPECIALIZATIONS } from '../../lib/city-data';
import { IndianCity, MedicalSpecialization } from '../../types';
import { Button } from '../../components/ui/Button';

export const CitySearchWidget: React.FC = () => {
  const navigate = useNavigate();
  const [selectedCity, setSelectedCity] = useState<string>('');
  const [selectedSpec, setSelectedSpec] = useState<string>('All Specializations');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (selectedCity && selectedCity !== 'All Cities') params.set('city', selectedCity);
    if (selectedSpec && selectedSpec !== 'All Specializations') {
      params.set('specialization', selectedSpec);
    }
    if (searchQuery.trim()) {
      params.set('q', searchQuery.trim());
    }
    navigate(`/doctors?${params.toString()}`);
  };

  const popularCities: string[] = ['All Cities', 'Pune', 'Mumbai', 'Delhi-NCR', 'Bengaluru'];

  return (
    <div className="w-full bg-white rounded-2xl border border-slate-200/90 shadow-card p-5 md:p-6 lg:p-7">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-teal-700">
            Mandatory City-First Discovery
          </span>
          <h2 className="text-base sm:text-lg font-bold text-slate-900 mt-0.5">
            Find Independent Doctors &amp; Clinics Near You
          </h2>
        </div>
        <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-500">
          <span className="font-medium text-slate-400">Popular:</span>
          {popularCities.map((city) => (
            <button
              key={city}
              type="button"
              onClick={() => setSelectedCity(city === 'All Cities' ? '' : city)}
              className={`px-2 py-1 rounded text-xs transition-colors cursor-pointer ${
                (city === 'All Cities' && !selectedCity) || selectedCity === city
                  ? 'bg-slate-900 text-white font-medium'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {city}
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={handleSearch} className="mt-4 grid grid-cols-1 md:grid-cols-12 gap-3.5">
        {/* Mandatory City Field */}
        <div className="md:col-span-3 space-y-1">
          <label htmlFor="city-select" className="block text-xs font-semibold text-slate-700">
            1. City (Location Filter)
          </label>
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-teal-600 pointer-events-none">
              <MapPin className="w-4 h-4" />
            </div>
            <select
              id="city-select"
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="w-full bg-slate-50 hover:bg-white text-slate-900 text-sm font-medium rounded-lg border border-slate-300 focus:border-teal-600 focus:bg-white focus:ring-2 focus:ring-teal-100 py-2.5 pl-9 pr-8 transition-colors cursor-pointer"
            >
              <option value="">All Cities (Across India)</option>
              {INDIAN_CITIES.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Specialization Field */}
        <div className="md:col-span-4 space-y-1">
          <label htmlFor="spec-select" className="block text-xs font-semibold text-slate-700">
            2. Specialization
          </label>
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
              <Stethoscope className="w-4 h-4" />
            </div>
            <select
              id="spec-select"
              value={selectedSpec}
              onChange={(e) => setSelectedSpec(e.target.value)}
              className="w-full bg-slate-50 hover:bg-white text-slate-900 text-sm rounded-lg border border-slate-300 focus:border-teal-600 focus:bg-white focus:ring-2 focus:ring-teal-100 py-2.5 pl-9 pr-8 transition-colors cursor-pointer"
            >
              <option value="All Specializations">All Specializations</option>
              {SPECIALIZATIONS.map((spec) => (
                <option key={spec} value={spec}>
                  {spec}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Doctor Name / Clinic Search */}
        <div className="md:col-span-3 space-y-1">
          <label htmlFor="search-input" className="block text-xs font-semibold text-slate-700">
            3. Doctor or Clinic Name
          </label>
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
              <Search className="w-4 h-4" />
            </div>
            <input
              id="search-input"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="e.g. Dr. Sharma or Aarogyam"
              className="w-full bg-slate-50 hover:bg-white text-slate-900 placeholder:text-slate-400 text-sm rounded-lg border border-slate-300 focus:border-teal-600 focus:bg-white focus:ring-2 focus:ring-teal-100 py-2.5 pl-9 pr-3 transition-colors"
            />
          </div>
        </div>

        {/* Submit Button */}
        <div className="md:col-span-2 flex items-end">
          <Button
            type="submit"
            variant="primary"
            size="md"
            className="w-full h-[42px] justify-center"
            rightIcon={<ArrowRight className="w-4 h-4" />}
          >
            Find Doctors
          </Button>
        </div>
      </form>
    </div>
  );
};
