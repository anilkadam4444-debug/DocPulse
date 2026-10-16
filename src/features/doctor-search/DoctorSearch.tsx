import React, { useState, useEffect } from 'react';
import { MapPin, Stethoscope, Search, X, Filter, RotateCcw } from 'lucide-react';
import { INDIAN_CITIES, SPECIALIZATIONS } from '../../lib/city-data';
import { IndianCity } from '../../types';
import { Button } from '../../components/ui/Button';

export interface DoctorSearchProps {
  selectedCity: string;
  selectedSpec: string;
  searchQuery: string;
  onCityChange: (city: string) => void;
  onSpecChange: (spec: string) => void;
  onQueryChange: (query: string) => void;
  onClearFilters: () => void;
  totalResults?: number;
  isLoading?: boolean;
}

const POPULAR_CITIES: IndianCity[] = [
  'Mumbai',
  'Delhi-NCR',
  'Bengaluru',
  'Pune',
  'Hyderabad',
  'Chennai',
];

export const DoctorSearch: React.FC<DoctorSearchProps> = ({
  selectedCity,
  selectedSpec,
  searchQuery,
  onCityChange,
  onSpecChange,
  onQueryChange,
  onClearFilters,
  totalResults,
  isLoading,
}) => {
  const [citySearch, setCitySearch] = useState('');
  const [isCityDropdownOpen, setIsCityDropdownOpen] = useState(false);

  // Filter cities for search dropdown
  const filteredCities = INDIAN_CITIES.filter((c) =>
    c.toLowerCase().includes(citySearch.toLowerCase())
  );

  const hasActiveFilters =
    Boolean(searchQuery.trim()) || (Boolean(selectedSpec) && selectedSpec !== 'All Specializations');

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 md:p-6 shadow-xs space-y-4">
      {/* Header bar with counter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-teal-700">
            Mandatory City-First Search
          </span>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-0.5">
            {selectedCity ? `Doctors & Clinics in ${selectedCity}` : 'Find Doctors Across India'}
          </h1>
        </div>

        {selectedCity && typeof totalResults === 'number' && (
          <div className="text-xs text-slate-500 flex items-center gap-2">
            <span>
              Showing <strong className="text-slate-900">{totalResults}</strong> published{' '}
              {totalResults === 1 ? 'practice' : 'practices'}
            </span>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={onClearFilters}
                className="text-teal-700 hover:text-teal-900 font-semibold flex items-center gap-1 hover:underline cursor-pointer ml-1"
              >
                <RotateCcw className="w-3 h-3" />
                Reset Filters
              </button>
            )}
          </div>
        )}
      </div>

      {/* Main Search Controls Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5">
        {/* Field 1: City Selection (Mandatory) */}
        <div className="md:col-span-4 space-y-1">
          <label htmlFor="city-selector" className="block text-xs font-semibold text-slate-700">
            1. City Selection (Mandatory)
          </label>
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-teal-600 pointer-events-none">
              <MapPin className="w-4 h-4" />
            </div>
            <input
              id="city-selector"
              list="indian-cities-list"
              value={selectedCity}
              onChange={(e) => onCityChange(e.target.value)}
              placeholder="Type or select city (e.g. Mumbai)..."
              className="w-full bg-slate-50 hover:bg-white text-slate-900 text-sm font-medium rounded-lg border border-slate-300 focus:border-teal-600 focus:bg-white focus:ring-2 focus:ring-teal-100 py-2.5 pl-9 pr-8 transition-colors"
            />
            <datalist id="indian-cities-list">
              {INDIAN_CITIES.map((c) => (
                <option key={c} value={c} />
              ))}
            </datalist>
            {selectedCity && (
              <button
                type="button"
                onClick={() => onCityChange('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                aria-label="Clear city selection"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Field 2: Specialization */}
        <div className="md:col-span-4 space-y-1">
          <label htmlFor="spec-selector" className="block text-xs font-semibold text-slate-700">
            2. Medical Specialization
          </label>
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
              <Stethoscope className="w-4 h-4" />
            </div>
            <select
              id="spec-selector"
              value={selectedSpec}
              onChange={(e) => onSpecChange(e.target.value)}
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

        {/* Field 3: Text Search (Doctor Name or Clinic) */}
        <div className="md:col-span-4 space-y-1">
          <label htmlFor="doctor-search-input" className="block text-xs font-semibold text-slate-700">
            3. Doctor or Clinic Name
          </label>
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
              <Search className="w-4 h-4" />
            </div>
            <input
              id="doctor-search-input"
              type="text"
              value={searchQuery}
              onChange={(e) => onQueryChange(e.target.value)}
              placeholder="e.g. Dr. Rajesh or Aarogyam..."
              className="w-full bg-slate-50 hover:bg-white text-slate-900 placeholder:text-slate-400 text-sm rounded-lg border border-slate-300 focus:border-teal-600 focus:bg-white focus:ring-2 focus:ring-teal-100 py-2.5 pl-9 pr-8 transition-colors"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => onQueryChange('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                aria-label="Clear search text"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Popular City Quick-Select Chips */}
      <div className="flex flex-wrap items-center gap-1.5 pt-1 text-xs">
        <span className="font-medium text-slate-400 mr-1">Quick Select City:</span>
        {POPULAR_CITIES.map((city) => (
          <button
            key={city}
            type="button"
            onClick={() => onCityChange(city)}
            className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer ${
              selectedCity === city
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            {city}
          </button>
        ))}
      </div>
    </div>
  );
};
