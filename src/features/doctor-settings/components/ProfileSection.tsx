import React from 'react';
import {
  User,
  ShieldCheck,
  Award,
  AlertTriangle,
  Lock,
  Globe,
  GraduationCap,
  FileText,
  Mail,
  Phone,
  Info,
} from 'lucide-react';
import { DoctorSettingsFormState } from '../types';
import { Input } from '../../../components/ui/Input';
import {
  SPECIALIZATION_OPTIONS,
  REGISTRATION_COUNCILS,
  COMMON_LANGUAGES,
  COMMON_QUALIFICATIONS,
} from '../../doctor-registration/constants';

interface ProfileSectionProps {
  formData: DoctorSettingsFormState;
  onChange: (updates: Partial<DoctorSettingsFormState>) => void;
  credentialsVerified: boolean;
  userEmail?: string;
  userUid?: string;
}

export const ProfileSection: React.FC<ProfileSectionProps> = ({
  formData,
  onChange,
  credentialsVerified,
  userEmail,
  userUid,
}) => {
  const toggleLanguage = (lang: string) => {
    const exists = formData.languages.includes(lang);
    const updated = exists
      ? formData.languages.filter((l) => l !== lang)
      : [...formData.languages, lang];
    onChange({ languages: updated });
  };

  const handleAddQualification = (deg: string) => {
    const current = formData.qualifications.trim();
    if (!current) {
      onChange({ qualifications: deg });
    } else if (!current.includes(deg)) {
      onChange({ qualifications: `${current}, ${deg}` });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="border-b border-slate-200 pb-4">
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <GraduationCap className="w-5 h-5 text-teal-600" />
          Professional Profile &amp; Medical Registration
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Manage your verified professional identity, medical qualifications, and clinical biography.
        </p>
      </div>

      {/* Security & Verification Notice Banner */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex flex-col sm:flex-row items-start gap-3">
        <div className="p-2 rounded-lg bg-amber-100 text-amber-800 shrink-0">
          <ShieldCheck className="w-5 h-5" />
        </div>
        <div className="space-y-1 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-bold text-amber-900">
              Medical Council Credential Verification:
            </span>
            <span className="px-2 py-0.5 rounded bg-amber-200/70 text-amber-900 font-semibold text-[11px]">
              {credentialsVerified ? 'Verified Active' : 'Under Review / Pending State Council Cross-Reference'}
            </span>
          </div>
          <p className="text-amber-800 leading-relaxed">
            In compliance with Indian healthcare regulations and NMC norms, your medical council
            registration number is cross-referenced with official state medical council gazettes.
            Tenants cannot alter verification flags directly.
          </p>
        </div>
      </div>

      {/* Account Identity (Read-only security fields) */}
      <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-3">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
          <Lock className="w-3.5 h-3.5 text-slate-400" />
          <span>Tenant Account Identifiers (Managed by Firebase Authentication)</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div>
            <span className="text-slate-400 block text-[11px]">Registered Email</span>
            <span className="font-mono text-slate-800 font-medium break-all">
              {userEmail || formData.email}
            </span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">Registered Mobile</span>
            <span className="font-mono text-slate-800 font-medium">+91 {formData.mobile}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">Tenant UID</span>
            <span className="font-mono text-slate-800 font-medium truncate block">
              {userUid || 'Protected'}
            </span>
          </div>
        </div>
      </div>

      {/* Editable Fields */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Input
            label="Doctor Full Legal Name (with Dr. prefix)"
            placeholder="Dr. Rajesh Sharma"
            value={formData.fullName}
            onChange={(e) => onChange({ fullName: e.target.value })}
            required
            leftIcon={<Award className="w-4 h-4 text-slate-400" />}
          />
        </div>
        <div>
          <Input
            label="Clinical Experience (in Years)"
            type="number"
            placeholder="e.g. 12"
            value={formData.experienceYears || ''}
            onChange={(e) => onChange({ experienceYears: e.target.value })}
            leftIcon={<Award className="w-4 h-4 text-slate-400" />}
          />
        </div>
      </div>

      {/* Specialization & Custom Specialization */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Primary Medical Specialization
          </label>
          <select
            value={formData.specialization}
            onChange={(e) => onChange({ specialization: e.target.value })}
            className="w-full h-10 px-3 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-teal-600 text-slate-800"
          >
            {SPECIALIZATION_OPTIONS.map((spec) => (
              <option key={spec} value={spec}>
                {spec}
              </option>
            ))}
          </select>
        </div>

        {formData.specialization === 'Other' && (
          <div>
            <Input
              label="Specify Custom Specialization"
              placeholder="e.g. Pediatric Pulmonologist"
              value={formData.customSpecialization || ''}
              onChange={(e) => onChange({ customSpecialization: e.target.value })}
              required
            />
          </div>
        )}
      </div>

      {/* Medical Registration Authority & Council */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            State Medical Council / Authority
          </label>
          <select
            value={formData.registrationCouncil}
            onChange={(e) => onChange({ registrationCouncil: e.target.value })}
            className="w-full h-10 px-3 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-teal-600 text-slate-800"
          >
            {REGISTRATION_COUNCILS.map((council) => (
              <option key={council} value={council}>
                {council}
              </option>
            ))}
          </select>
        </div>
        <div>
          <Input
            label="Medical Registration / Licence Number"
            placeholder="e.g. MMC-2012-08-1234"
            value={formData.registrationNumber}
            onChange={(e) => onChange({ registrationNumber: e.target.value })}
            required
            leftIcon={<ShieldCheck className="w-4 h-4 text-slate-400" />}
          />
        </div>
      </div>

      {/* Qualifications */}
      <div className="space-y-1.5">
        <Input
          label="Medical Degrees & Qualifications"
          placeholder="MBBS, MD (General Medicine), DNB"
          value={formData.qualifications}
          onChange={(e) => onChange({ qualifications: e.target.value })}
          required
          leftIcon={<GraduationCap className="w-4 h-4 text-slate-400" />}
        />
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <span className="text-[11px] text-slate-400">Quick add:</span>
          {COMMON_QUALIFICATIONS.map((deg) => (
            <button
              key={deg}
              type="button"
              onClick={() => handleAddQualification(deg)}
              className="text-[11px] px-2 py-0.5 rounded bg-slate-100 hover:bg-teal-50 hover:text-teal-700 text-slate-600 border border-slate-200 transition-colors cursor-pointer"
            >
              + {deg}
            </button>
          ))}
        </div>
      </div>

      {/* Languages */}
      <div>
        <label className="block text-xs font-semibold text-slate-700 mb-1.5">
          Languages Spoken during Consultation
        </label>
        <div className="flex flex-wrap gap-1.5">
          {COMMON_LANGUAGES.map((lang) => {
            const isSelected = formData.languages.includes(lang);
            return (
              <button
                key={lang}
                type="button"
                onClick={() => toggleLanguage(lang)}
                className={`text-xs px-2.5 py-1 rounded-md border font-medium transition-colors cursor-pointer ${
                  isSelected
                    ? 'bg-teal-50 border-teal-300 text-teal-800 font-semibold'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                {lang}
              </button>
            );
          })}
        </div>
      </div>

      {/* Clinical Biography */}
      <div>
        <div className="flex justify-between items-center mb-1">
          <label className="block text-xs font-semibold text-slate-700">
            Professional Biography &amp; Practice Overview
          </label>
          <span className="text-[11px] text-slate-400">
            {(formData.bio || '').length} / 1000 characters
          </span>
        </div>
        <textarea
          rows={4}
          maxLength={1000}
          value={formData.bio || ''}
          onChange={(e) => onChange({ bio: e.target.value })}
          placeholder="Briefly describe your clinical focus, specialty interests, hospital affiliations, and approach to patient care..."
          className="w-full text-xs p-3 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-teal-600 text-slate-800 leading-relaxed"
        />
      </div>
    </div>
  );
};
