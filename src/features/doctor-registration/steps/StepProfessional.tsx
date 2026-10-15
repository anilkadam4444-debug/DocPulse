import React from 'react';
import { Stethoscope, ShieldCheck, Award, Globe, AlertCircle, GraduationCap, FileText } from 'lucide-react';
import { ProfessionalDetailsData } from '../types';
import {
  SPECIALIZATION_OPTIONS,
  REGISTRATION_COUNCILS,
  COMMON_LANGUAGES,
  COMMON_QUALIFICATIONS,
} from '../constants';
import { Input } from '../../../components/ui/Input';

interface StepProfessionalProps {
  data: ProfessionalDetailsData;
  errors: Record<string, string>;
  onChange: (data: Partial<ProfessionalDetailsData>) => void;
}

export const StepProfessional: React.FC<StepProfessionalProps> = ({
  data,
  errors,
  onChange,
}) => {
  const toggleLanguage = (lang: string) => {
    const exists = data.languages.includes(lang);
    const updated = exists
      ? data.languages.filter((l) => l !== lang)
      : [...data.languages, lang];
    onChange({ languages: updated });
  };

  const handleAddQualification = (deg: string) => {
    const current = data.qualifications.trim();
    if (!current) {
      onChange({ qualifications: deg });
    } else if (!current.includes(deg)) {
      onChange({ qualifications: `${current}, ${deg}` });
    }
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      <div>
        <h2 className="text-lg font-bold text-slate-900">Step 2: Professional &amp; Medical Credentials</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Provide your clinical qualifications, specialization, and state medical council registration.
        </p>
      </div>

      {/* Verification disclosure notice */}
      <div className="p-3 bg-amber-50/90 border border-amber-200/80 rounded-xl text-xs text-amber-900 flex items-start gap-2.5 leading-relaxed">
        <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
        <div>
          <strong>Medical Verification Transparency:</strong> Credentials entered here will undergo
          standard council registry verification prior to verified doctor badge issuance.
        </div>
      </div>

      <div className="space-y-4">
        {/* Medical Qualifications */}
        <div className="space-y-1.5">
          <Input
            id="doctor-qualifications"
            label="Medical Qualifications & Degrees (Required)"
            placeholder="e.g. MBBS, MD (General Medicine)"
            value={data.qualifications}
            onChange={(e) => onChange({ qualifications: e.target.value })}
            error={errors.qualifications}
            leftIcon={<GraduationCap className="w-4 h-4" />}
            helperText="Printed on digital prescriptions, receipts, and patient booking profiles"
            required
          />
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <span className="text-[11px] font-semibold text-slate-500 mr-1">Quick Add:</span>
            {COMMON_QUALIFICATIONS.map((deg) => (
              <button
                key={deg}
                type="button"
                onClick={() => handleAddQualification(deg)}
                className="px-2 py-0.5 text-[11px] rounded bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-colors"
              >
                +{deg}
              </button>
            ))}
          </div>
        </div>

        {/* Specialization Selection */}
        <div className="space-y-1.5">
          <label
            htmlFor="specialization-select"
            className="block text-xs font-semibold uppercase tracking-wider text-slate-700"
          >
            Primary Medical Specialization (Required)
          </label>
          <div className="relative">
            <Stethoscope className="w-4 h-4 text-teal-600 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <select
              id="specialization-select"
              value={data.specialization}
              onChange={(e) => onChange({ specialization: e.target.value })}
              className="w-full bg-white text-slate-900 text-sm rounded-lg border border-slate-300 focus:border-teal-600 focus:ring-2 focus:ring-teal-100 py-2.5 pl-10 pr-8 transition-colors cursor-pointer"
            >
              {SPECIALIZATION_OPTIONS.map((spec) => (
                <option key={spec} value={spec}>
                  {spec}
                </option>
              ))}
            </select>
          </div>
          {errors.specialization && (
            <p className="text-xs text-red-600 font-medium">{errors.specialization}</p>
          )}
        </div>

        {/* Custom specialization if 'Other' */}
        {data.specialization === 'Other' && (
          <Input
            id="custom-specialization"
            label="Specify Your Specialization"
            placeholder="e.g. Pulmonologist, Endocrinologist, etc."
            value={data.customSpecialization || ''}
            onChange={(e) => onChange({ customSpecialization: e.target.value })}
            error={errors.customSpecialization}
            required
          />
        )}

        {/* Registration Council & Number */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label
              htmlFor="council-select"
              className="block text-xs font-semibold uppercase tracking-wider text-slate-700"
            >
              Medical Registration Authority / Council
            </label>
            <div className="relative">
              <ShieldCheck className="w-4 h-4 text-teal-600 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <select
                id="council-select"
                value={data.registrationCouncil}
                onChange={(e) => onChange({ registrationCouncil: e.target.value })}
                className="w-full bg-white text-slate-900 text-sm rounded-lg border border-slate-300 focus:border-teal-600 focus:ring-2 focus:ring-teal-100 py-2.5 pl-10 pr-8 transition-colors cursor-pointer"
              >
                {REGISTRATION_COUNCILS.map((council) => (
                  <option key={council} value={council}>
                    {council}
                  </option>
                ))}
              </select>
            </div>
            {errors.registrationCouncil && (
              <p className="text-xs text-red-600 font-medium">{errors.registrationCouncil}</p>
            )}
          </div>

          <Input
            id="registration-number"
            label="Medical Registration Number"
            placeholder="e.g. MMC-2015-88392"
            value={data.registrationNumber}
            onChange={(e) => onChange({ registrationNumber: e.target.value })}
            error={errors.registrationNumber}
            leftIcon={<ShieldCheck className="w-4 h-4" />}
            helperText="Printed on digital prescriptions & receipts"
            required
          />
        </div>

        {/* Years of Experience & Languages */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            id="experience-years"
            label="Years of Clinical Experience (Optional)"
            type="number"
            min={0}
            max={70}
            placeholder="e.g. 12"
            value={data.experienceYears || ''}
            onChange={(e) => onChange({ experienceYears: e.target.value })}
            error={errors.experienceYears}
            leftIcon={<Award className="w-4 h-4" />}
            helperText="Helps patients understand your seniority"
          />

          {/* Languages Spoken */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
              Languages Spoken (Optional)
            </label>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {COMMON_LANGUAGES.map((lang) => {
                const isSelected = data.languages.includes(lang);
                return (
                  <button
                    key={lang}
                    type="button"
                    onClick={() => toggleLanguage(lang)}
                    className={`px-2.5 py-1 rounded text-xs transition-all ${
                      isSelected
                        ? 'bg-slate-900 text-white font-medium shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {lang}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Clinical Bio / About Doctor */}
        <div className="space-y-1.5">
          <label
            htmlFor="doctor-bio"
            className="block text-xs font-semibold uppercase tracking-wider text-slate-700"
          >
            Brief Clinical Profile / About (Optional)
          </label>
          <div className="relative">
            <textarea
              id="doctor-bio"
              rows={2}
              maxLength={300}
              placeholder="e.g. Senior Consultant Physician specializing in preventive cardiology, diabetes care, and chronic disease management."
              value={data.bio || ''}
              onChange={(e) => onChange({ bio: e.target.value })}
              className="w-full bg-white text-slate-900 text-sm rounded-lg border border-slate-300 p-2.5 focus:border-teal-600 focus:ring-2 focus:ring-teal-100 focus:outline-none transition-colors"
            />
          </div>
          <p className="text-[11px] text-slate-500">Displayed on your public city doctor directory profile</p>
        </div>
      </div>
    </div>
  );
};
