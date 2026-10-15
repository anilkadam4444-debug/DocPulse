import React, { useState } from 'react';
import { Eye, EyeOff, User, Mail, Phone, Lock } from 'lucide-react';
import { DoctorAccountData } from '../types';
import { Input } from '../../../components/ui/Input';

interface StepAccountProps {
  data: DoctorAccountData;
  errors: Record<string, string>;
  onChange: (data: Partial<DoctorAccountData>) => void;
}

export const StepAccount: React.FC<StepAccountProps> = ({ data, errors, onChange }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      <div>
        <h2 className="text-lg font-bold text-slate-900">Step 1: Doctor Account Information</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Create your primary account credentials. Each doctor is an independent account holder.
        </p>
      </div>

      <div className="space-y-4">
        {/* Full Name */}
        <Input
          id="doctor-full-name"
          label="Doctor's Full Name (with Dr. prefix)"
          placeholder="e.g. Dr. Rajesh Patel"
          value={data.fullName}
          onChange={(e) => onChange({ fullName: e.target.value })}
          error={errors.fullName}
          leftIcon={<User className="w-4 h-4" />}
          helperText="As listed on your medical degree or council registration"
          required
        />

        {/* Email & Mobile */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            id="doctor-email"
            label="Professional Email Address"
            type="email"
            placeholder="doctor@practice.in"
            value={data.email}
            onChange={(e) => onChange({ email: e.target.value })}
            error={errors.email}
            leftIcon={<Mail className="w-4 h-4" />}
            helperText="Used for account recovery and monthly invoicing"
            required
          />

          <div className="w-full space-y-1.5">
            <label
              htmlFor="doctor-mobile"
              className="block text-xs font-semibold uppercase tracking-wider text-slate-700"
            >
              WhatsApp Mobile Number
            </label>
            <div className="flex items-center">
              <span className="inline-flex items-center px-3 py-2.5 rounded-l-lg border border-r-0 border-slate-300 bg-slate-100 text-slate-600 text-sm font-semibold select-none">
                +91
              </span>
              <input
                id="doctor-mobile"
                type="tel"
                maxLength={10}
                placeholder="9820012345"
                value={data.mobile}
                onChange={(e) => onChange({ mobile: e.target.value.replace(/\D/g, '') })}
                className={`w-full bg-white text-slate-900 placeholder:text-slate-400 text-sm rounded-r-lg border transition-all duration-150 py-2.5 px-3.5 ${
                  errors.mobile
                    ? 'border-red-400 focus:border-red-600 focus:ring-2 focus:ring-red-100'
                    : 'border-slate-300 hover:border-slate-400 focus:border-teal-600 focus:ring-2 focus:ring-teal-100'
                } focus:outline-none`}
                required
              />
            </div>
            {errors.mobile ? (
              <p className="text-xs text-red-600 font-medium">{errors.mobile}</p>
            ) : (
              <p className="text-xs text-slate-500">10-digit Indian mobile for OTP login and urgent alerts</p>
            )}
          </div>
        </div>

        {/* Password & Confirm Password */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="relative">
            <Input
              id="doctor-password"
              label="Password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Min. 8 characters"
              value={data.password}
              onChange={(e) => onChange({ password: e.target.value })}
              error={errors.password}
              leftIcon={<Lock className="w-4 h-4" />}
              rightIcon={
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-slate-400 hover:text-slate-600 p-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 rounded"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              }
              helperText="Must contain at least 8 characters, with letters and numbers"
              required
            />
          </div>

          <div className="relative">
            <Input
              id="doctor-confirm-password"
              label="Confirm Password"
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder="Re-enter password"
              value={data.confirmPassword}
              onChange={(e) => onChange({ confirmPassword: e.target.value })}
              error={errors.confirmPassword}
              leftIcon={<Lock className="w-4 h-4" />}
              rightIcon={
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="text-slate-400 hover:text-slate-600 p-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 rounded"
                  aria-label={showConfirmPassword ? 'Hide confirmed password' : 'Show confirmed password'}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              }
              required
            />
          </div>
        </div>

        {/* Terms Acceptance */}
        <div className="pt-2">
          <label className="flex items-start gap-2.5 cursor-pointer select-none">
            <input
              id="doctor-agree-terms"
              type="checkbox"
              checked={data.agreeTerms}
              onChange={(e) => onChange({ agreeTerms: e.target.checked })}
              className="mt-1 w-4 h-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500 accent-teal-600 cursor-pointer"
            />
            <span className="text-xs text-slate-700 leading-relaxed">
              I agree to DocPulse&apos;s{' '}
              <span className="text-teal-700 font-semibold underline underline-offset-2">
                Terms of Practice
              </span>{' '}
              and{' '}
              <span className="text-teal-700 font-semibold underline underline-offset-2">
                Patient Data Privacy Policy
              </span>
              . I understand that each medical practitioner is an independent account holder.
            </span>
          </label>
          {errors.agreeTerms && (
            <p className="text-xs text-red-600 font-medium mt-1 ml-6.5">{errors.agreeTerms}</p>
          )}
        </div>
      </div>
    </div>
  );
};
