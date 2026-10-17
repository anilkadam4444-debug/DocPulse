import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  ShieldCheck,
  Lock,
  Mail,
  Key,
  ArrowRight,
  AlertCircle,
  Building,
  CheckCircle2,
  Stethoscope,
  Sparkles,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { loginReceptionist } from './receptionistService';

export const ReceptionistLoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [passcode, setPasscode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !passcode.trim()) {
      setErrorMessage('Please enter both your email address and passcode.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    const res = await loginReceptionist(email, passcode);
    setIsLoading(false);

    if (res.success && res.session) {
      navigate('/reception/dashboard');
    } else {
      setErrorMessage(res.error || 'Login failed. Please verify your email and passcode.');
    }
  };

  return (
    <div className="bg-slate-50 min-h-[calc(100vh-64px)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 animate-fade-in">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-xs font-bold tracking-wide uppercase">
            <Building className="w-3.5 h-3.5 text-teal-600" />
            <span>Clinic Front-Desk &amp; Reception Portal</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Receptionist Sign In
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto">
            Log in with the front-desk credentials provided by your doctor to manage today&apos;s walk-ins, online check-ins, and live queue tokens.
          </p>
        </div>

        {/* Login Card */}
        <Card className="p-6 sm:p-8 rounded-3xl border border-slate-200 bg-white shadow-xl space-y-6">
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-xs flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span className="font-medium">{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Receptionist Email <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  placeholder="e.g. pooja.reception@clinic.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-teal-500 text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Clinic Passcode / PIN <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Key className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  placeholder="6-digit passcode"
                  value={passcode}
                  onChange={(e) => setPasscode(e.target.value)}
                  className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-teal-500 text-xs font-mono font-bold tracking-widest"
                />
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={isLoading}
              rightIcon={<ArrowRight className="w-4 h-4" />}
              className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-3 text-xs sm:text-sm mt-2"
            >
              Access Clinic Reception Desk
            </Button>
          </form>

          {/* Security Notice */}
          <div className="pt-4 border-t border-slate-100 text-center space-y-2">
            <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span>Multi-Tenant Reception Desk Isolation Active</span>
            </div>
            <p className="text-[11px] text-slate-500">
              Are you a Doctor?{' '}
              <Link to="/doctor/login" className="text-teal-600 hover:underline font-bold">
                Doctor Portal Sign In
              </Link>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};
