import React from 'react';
import { Building2, MapPin, IndianRupee, Phone, AlertCircle, Compass, CalendarCheck } from 'lucide-react';
import { ClinicLocationData, PracticeType } from '../types';
import { INDIAN_CITIES } from '../../../lib/city-data';
import { INDIAN_STATES, PRACTICE_TYPE_OPTIONS } from '../constants';
import { Input } from '../../../components/ui/Input';

interface StepClinicLocationProps {
  data: ClinicLocationData;
  errors: Record<string, string>;
  onChange: (data: Partial<ClinicLocationData>) => void;
}

export const StepClinicLocation: React.FC<StepClinicLocationProps> = ({
  data,
  errors,
  onChange,
}) => {
  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      <div>
        <h2 className="text-lg font-bold text-slate-900">Step 3: Clinic &amp; Practice Location</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Define your primary practice location. Additional clinic branches can be added later in your CRM.
        </p>
      </div>

      <div className="p-3 bg-teal-50/80 border border-teal-200/70 rounded-xl text-xs text-teal-950 flex items-start gap-2.5 leading-relaxed">
        <Building2 className="w-4 h-4 text-teal-700 shrink-0 mt-0.5" />
        <div>
          <strong>Practice Location Context:</strong> In DocPulse, this location is attached directly
          to your individual doctor account. A separate hospital or enterprise account is not required.
        </div>
      </div>

      <div className="space-y-4">
        {/* Practice Type */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
            Practice Facility Type
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {PRACTICE_TYPE_OPTIONS.map((opt) => {
              const isSelected = data.practiceType === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => onChange({ practiceType: opt.id as PracticeType })}
                  className={`text-left p-3 rounded-xl border transition-all ${
                    isSelected
                      ? 'bg-teal-50/70 border-teal-600 ring-1 ring-teal-600 shadow-xs'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="text-xs font-bold text-slate-900">{opt.label}</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">{opt.description}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Clinic Name */}
        <Input
          id="clinic-name"
          label="Clinic / Practice Name (Required)"
          placeholder="e.g. Aarogyam Family Care Clinic"
          value={data.clinicName}
          onChange={(e) => onChange({ clinicName: e.target.value })}
          error={errors.clinicName}
          leftIcon={<Building2 className="w-4 h-4" />}
          helperText="The public name patients see on the website, receipts, and WhatsApp"
          required
        />

        {/* City & State */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label
              htmlFor="city-select"
              className="block text-xs font-semibold uppercase tracking-wider text-slate-700"
            >
              City (Mandatory for Patient Discovery)
            </label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-teal-600 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <select
                id="city-select"
                value={data.city}
                onChange={(e) => onChange({ city: e.target.value })}
                className="w-full bg-white text-slate-900 text-sm font-medium rounded-lg border border-slate-300 focus:border-teal-600 focus:ring-2 focus:ring-teal-100 py-2.5 pl-10 pr-8 transition-colors cursor-pointer"
              >
                {INDIAN_CITIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            {errors.city ? (
              <p className="text-xs text-red-600 font-medium">{errors.city}</p>
            ) : (
              <p className="text-xs text-slate-500">Patients must select a city to find your clinic</p>
            )}
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="state-select"
              className="block text-xs font-semibold uppercase tracking-wider text-slate-700"
            >
              State / Union Territory
            </label>
            <select
              id="state-select"
              value={data.state}
              onChange={(e) => onChange({ state: e.target.value })}
              className="w-full bg-white text-slate-900 text-sm rounded-lg border border-slate-300 focus:border-teal-600 focus:ring-2 focus:ring-teal-100 py-2.5 px-3.5 transition-colors cursor-pointer"
            >
              {INDIAN_STATES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            {errors.state && <p className="text-xs text-red-600 font-medium">{errors.state}</p>}
          </div>
        </div>

        {/* Locality & Landmark */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            id="clinic-locality"
            label="Area / Locality (Required)"
            placeholder="e.g. Bandra West, Indiranagar, Alwarpet"
            value={data.locality}
            onChange={(e) => onChange({ locality: e.target.value })}
            error={errors.locality}
            leftIcon={<Compass className="w-4 h-4" />}
            helperText="Used for neighborhood level search filtering"
            required
          />

          <Input
            id="clinic-landmark"
            label="Nearby Landmark / Maps Pin Note (Optional)"
            placeholder="e.g. Opposite Linking Road Police Chowki"
            value={data.landmark || ''}
            onChange={(e) => onChange({ landmark: e.target.value })}
            error={errors.landmark}
            leftIcon={<MapPin className="w-4 h-4" />}
            helperText="Appended to patient WhatsApp arrival directions"
          />
        </div>

        {/* Full Address */}
        <Input
          id="clinic-address"
          label="Full Clinic Address (Premises, Floor, Building)"
          placeholder="e.g. Shop 4, 1st Floor, Sunrise Arcade, Linking Road"
          value={data.addressLine}
          onChange={(e) => onChange({ addressLine: e.target.value })}
          error={errors.addressLine}
          leftIcon={<MapPin className="w-4 h-4" />}
          helperText="Full street address printed on digital receipts & appointment cards"
          required
        />

        {/* Pincode & Fee */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            id="clinic-pincode"
            label="Postal PIN Code"
            type="text"
            maxLength={6}
            placeholder="e.g. 400050"
            value={data.pincode}
            onChange={(e) => onChange({ pincode: e.target.value.replace(/\D/g, '') })}
            error={errors.pincode}
            helperText="6-digit Indian postal code"
            required
          />

          <Input
            id="consultation-fee"
            label="In-Clinic Consultation Fee (in INR ₹)"
            type="number"
            min={1}
            placeholder="e.g. 500"
            value={data.consultationFee}
            onChange={(e) => onChange({ consultationFee: e.target.value })}
            error={errors.consultationFee}
            leftIcon={<IndianRupee className="w-4 h-4" />}
            helperText="Your base consultation charge (100% goes to you)"
            required
          />
        </div>

        {/* Follow-up Policy */}
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
            <CalendarCheck className="w-4 h-4 text-teal-600" />
            <span>Follow-Up Consultation Policy</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label htmlFor="followup-days" className="block text-xs font-semibold text-slate-700">
                Follow-Up Validity Window
              </label>
              <select
                id="followup-days"
                value={data.followUpDays}
                onChange={(e) => onChange({ followUpDays: parseInt(e.target.value, 10) || 7 })}
                className="w-full bg-white text-slate-900 text-xs rounded-lg border border-slate-300 py-2 px-3 focus:border-teal-600 focus:outline-none"
              >
                <option value={3}>Within 3 Days</option>
                <option value={5}>Within 5 Days</option>
                <option value={7}>Within 7 Days (Standard)</option>
                <option value={10}>Within 10 Days</option>
                <option value={14}>Within 14 Days</option>
              </select>
            </div>

            <div className="space-y-1">
              <label htmlFor="followup-fee" className="block text-xs font-semibold text-slate-700">
                Follow-Up Fee (₹0 for Free)
              </label>
              <div className="relative">
                <IndianRupee className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="followup-fee"
                  type="number"
                  min={0}
                  placeholder="0"
                  value={data.followUpFee}
                  onChange={(e) => onChange({ followUpFee: e.target.value })}
                  className="w-full bg-white text-slate-900 text-xs rounded-lg border border-slate-300 py-2 pl-8 pr-3 focus:border-teal-600 focus:outline-none"
                />
              </div>
              <p className="text-[11px] text-slate-500">Enter 0 for complimentary review</p>
            </div>
          </div>
        </div>

        {/* Clinic Phone */}
        <Input
          id="clinic-phone"
          label="Clinic Reception Contact Number (Optional)"
          placeholder="e.g. 022-26401234 or +91 98200 99887"
          value={data.clinicPhone || ''}
          onChange={(e) => onChange({ clinicPhone: e.target.value })}
          error={errors.clinicPhone}
          leftIcon={<Phone className="w-4 h-4" />}
          helperText="Public contact line for patient inquiries"
        />
      </div>
    </div>
  );
};
