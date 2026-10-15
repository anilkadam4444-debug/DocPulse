import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Stethoscope,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Building,
  MapPin,
  MessageCircle,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { INDIAN_CITIES, SPECIALIZATIONS } from '../../lib/city-data';
import { IndianCity, MedicalSpecialization } from '../../types';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Card } from '../../components/ui/Card';

export const DoctorRegisterPlaceholder: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    registrationNumber: '',
    stateCouncil: 'Maharashtra Medical Council',
    specialization: 'General Medicine' as MedicalSpecialization,
    clinicName: '',
    city: 'Mumbai' as IndianCity,
    avgConsultationMinutes: '15',
  });

  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!formData.fullName.trim()) errs.fullName = 'Doctor name is required';
    if (!formData.registrationNumber.trim())
      errs.registrationNumber = 'Medical registration number is mandatory';
    if (!formData.clinicName.trim()) errs.clinicName = 'Clinic or practice name is required';
    if (!formData.phone.trim() || formData.phone.length < 10)
      errs.phone = 'Valid 10-digit Indian WhatsApp mobile number is required';
    if (!formData.email.trim() || !formData.email.includes('@'))
      errs.email = 'Valid professional email is required';

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      setSubmitted(true);
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen py-10 lg:py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-teal-600" />
            <span>30-Day Free Trial · Single-Doctor Independent Tenant</span>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight">
            Register Your Independent Medical Practice
          </h1>
          <p className="text-sm sm:text-base text-slate-600 max-w-xl mx-auto">
            Set up your practice in under 5 minutes. Enjoy full access to duration-based token
            scheduling, WhatsApp notifications, and assistant delegation.
          </p>
        </div>

        {submitted ? (
          <Card className="p-8 text-center space-y-5 bg-white border border-slate-200">
            <div className="w-14 h-14 rounded-full bg-teal-50 border border-teal-200 flex items-center justify-center mx-auto text-teal-600">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-bold text-slate-900">
                Practice Tenant Configuration Prepared!
              </h2>
              <p className="text-sm text-slate-600 max-w-lg mx-auto">
                Welcome, <strong>{formData.fullName}</strong>. Your independent practice profile for{' '}
                <strong>{formData.clinicName}</strong> ({formData.city}) with average duration of{' '}
                <strong>{formData.avgConsultationMinutes} minutes</strong> has been structured.
              </p>
            </div>

            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 text-xs text-left max-w-md mx-auto space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-500">Tenant Account:</span>
                <span className="font-semibold text-slate-900">
                  tenant_{formData.fullName.toLowerCase().replace(/[^a-z0-9]/g, '_')}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Registration Number:</span>
                <span className="font-semibold text-slate-900">{formData.registrationNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Subscription Status:</span>
                <span className="text-teal-700 font-semibold">
                  30-Day Free Trial (Active until 15 Nov 2026)
                </span>
              </div>
            </div>

            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-900 max-w-md mx-auto text-left">
              <strong>Phase 1 Note:</strong> Live Firebase Authentication and phone OTP verification
              will be wired in Phase 2. You can explore the Doctor CRM Dashboard preview right now.
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <Link to="/doctor/dashboard">
                <Button variant="primary" size="md" rightIcon={<ArrowRight className="w-4 h-4" />}>
                  Enter Doctor Dashboard Preview
                </Button>
              </Link>
              <Button variant="outline" size="md" onClick={() => setSubmitted(false)}>
                Edit Details
              </Button>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Registration Form (8 cols) */}
            <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200 p-6 md:p-8 shadow-xs">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Section 1: Doctor Credentials */}
                <div className="space-y-4">
                  <div className="pb-2 border-b border-slate-100 flex items-center justify-between">
                    <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900">
                      1. Doctor Credentials
                    </h2>
                    <span className="text-xs text-slate-400">NMC Verification Ready</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      label="Full Name (with Dr. prefix)"
                      placeholder="Dr. Rajesh Patel"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      error={errors.fullName}
                      required
                    />

                    <div className="space-y-1.5">
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                        Specialization
                      </label>
                      <select
                        value={formData.specialization}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            specialization: e.target.value as MedicalSpecialization,
                          })
                        }
                        className="w-full bg-white text-slate-900 text-sm rounded-lg border border-slate-300 py-2.5 px-3.5 focus:border-teal-600 focus:ring-2 focus:ring-teal-100 focus:outline-none"
                      >
                        {SPECIALIZATIONS.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      label="State Medical Council Reg. No."
                      placeholder="e.g. MMC-2015-88392"
                      value={formData.registrationNumber}
                      onChange={(e) =>
                        setFormData({ ...formData, registrationNumber: e.target.value })
                      }
                      error={errors.registrationNumber}
                      helperText="Required for digital prescriptions"
                      required
                    />

                    <div className="space-y-1.5">
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                        State Medical Council
                      </label>
                      <select
                        value={formData.stateCouncil}
                        onChange={(e) =>
                          setFormData({ ...formData, stateCouncil: e.target.value })
                        }
                        className="w-full bg-white text-slate-900 text-sm rounded-lg border border-slate-300 py-2.5 px-3.5 focus:border-teal-600 focus:ring-2 focus:ring-teal-100 focus:outline-none"
                      >
                        <option value="Maharashtra Medical Council">Maharashtra Medical Council</option>
                        <option value="Karnataka Medical Council">Karnataka Medical Council</option>
                        <option value="Delhi Medical Council">Delhi Medical Council</option>
                        <option value="Tamil Nadu Medical Council">Tamil Nadu Medical Council</option>
                        <option value="Telangana State Medical Council">
                          Telangana State Medical Council
                        </option>
                        <option value="West Bengal Medical Council">West Bengal Medical Council</option>
                        <option value="Gujarat Medical Council">Gujarat Medical Council</option>
                        <option value="National Medical Commission">National Medical Commission</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Section 2: Practice Location & City */}
                <div className="space-y-4 pt-2">
                  <div className="pb-2 border-b border-slate-100">
                    <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900">
                      2. Practice Location
                    </h2>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      label="Primary Clinic / Practice Name"
                      placeholder="e.g. Patel Family Care Clinic"
                      value={formData.clinicName}
                      onChange={(e) => setFormData({ ...formData, clinicName: e.target.value })}
                      error={errors.clinicName}
                      required
                    />

                    <div className="space-y-1.5">
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                        Practice City
                      </label>
                      <select
                        value={formData.city}
                        onChange={(e) =>
                          setFormData({ ...formData, city: e.target.value as IndianCity })
                        }
                        className="w-full bg-white text-slate-900 text-sm rounded-lg border border-slate-300 py-2.5 px-3.5 focus:border-teal-600 focus:ring-2 focus:ring-teal-100 focus:outline-none"
                      >
                        {INDIAN_CITIES.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Section 3: Timing & WhatsApp Contact */}
                <div className="space-y-4 pt-2">
                  <div className="pb-2 border-b border-slate-100">
                    <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900">
                      3. Consultation Duration &amp; Contact
                    </h2>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      label="Doctor WhatsApp Phone Number"
                      placeholder="9820012345"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      error={errors.phone}
                      helperText="For CRM alerts and two-factor authentication"
                      required
                    />

                    <Input
                      label="Professional Email"
                      placeholder="doctor@practice.com"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      error={errors.email}
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                      Average Consultation Duration (Used for Queue Timing)
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                      {['10', '15', '20', '30'].map((d) => (
                        <button
                          key={d}
                          type="button"
                          onClick={() => setFormData({ ...formData, avgConsultationMinutes: d })}
                          className={`py-2 px-3 text-xs font-medium rounded-lg border transition-all text-center ${
                            formData.avgConsultationMinutes === d
                              ? 'bg-slate-900 text-white border-slate-900'
                              : 'bg-white text-slate-700 border-slate-300 hover:border-slate-400'
                          }`}
                        >
                          {d} mins
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 space-y-3">
                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    className="w-full justify-center"
                    rightIcon={<ArrowRight className="w-4 h-4" />}
                  >
                    Complete Practice Registration (Start 30-Day Free Trial)
                  </Button>

                  <p className="text-xs text-center text-slate-500">
                    By registering, you agree to DocPulse&apos;s Terms of Practice and Patient Data Privacy Standards.
                  </p>
                </div>
              </form>
            </div>

            {/* Side summary (4 cols) */}
            <div className="lg:col-span-4 space-y-4">
              <Card className="p-5 space-y-4 bg-white border border-slate-200">
                <h3 className="text-sm font-bold text-slate-900">Free Trial Guarantees</h3>
                <ul className="space-y-3 text-xs text-slate-600">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                    <span>
                      <strong>1 Full Month:</strong> Zero subscription charge for the first 30 days.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                    <span>
                      <strong>Independent Ownership:</strong> Your patient roster is strictly your
                      intellectual property.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                    <span>
                      <strong>Printable QR Stand:</strong> High-resolution vector file generated for
                      your reception desk.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                    <span>
                      <strong>Authorized Assistant:</strong> Free secondary login for your
                      receptionist.
                    </span>
                  </li>
                </ul>

                <div className="pt-3 border-t border-slate-100 text-xs text-slate-500">
                  Already registered?{' '}
                  <Link to="/doctor/login" className="text-teal-700 font-semibold hover:underline">
                    Sign in to Practice Portal
                  </Link>
                </div>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
