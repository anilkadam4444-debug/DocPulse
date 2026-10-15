import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Stethoscope, Users, ShieldCheck, Lock, ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card } from '../../components/ui/Card';

export const DoctorLoginPlaceholder: React.FC = () => {
  const navigate = useNavigate();
  const [role, setRole] = useState<'doctor' | 'assistant'>('doctor');
  const [identifier, setIdentifier] = useState('dr.arun.sharma@practice.docpulse.in');
  const [password, setPassword] = useState('••••••••••••');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      navigate('/doctor/dashboard');
    }, 400);
  };

  return (
    <div className="bg-slate-50 min-h-screen py-12 lg:py-20 flex items-center justify-center">
      <div className="max-w-md w-full mx-auto px-4 space-y-6">
        {/* Brand Lockup */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-xl bg-slate-900 text-teal-400 flex items-center justify-center mx-auto shadow-sm">
            <Stethoscope className="w-6 h-6 stroke-[2.2]" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Practice Portal Login
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Secure multi-tenant access for Doctors &amp; Authorized Clinic Staff
          </p>
        </div>

        {/* Role Toggle */}
        <div className="bg-slate-200/80 p-1 rounded-xl grid grid-cols-2 gap-1 text-xs font-semibold">
          <button
            type="button"
            onClick={() => {
              setRole('doctor');
              setIdentifier('dr.arun.sharma@practice.docpulse.in');
            }}
            className={`py-2 px-3 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              role === 'doctor'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Stethoscope className="w-3.5 h-3.5 text-teal-600" />
            <span>Doctor Owner</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setRole('assistant');
              setIdentifier('assistant.bandra@aarogyam.in');
            }}
            className={`py-2 px-3 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              role === 'assistant'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Users className="w-3.5 h-3.5 text-teal-600" />
            <span>Authorized Assistant</span>
          </button>
        </div>

        {/* Login Box */}
        <Card className="bg-white border border-slate-200 p-6 md:p-7 space-y-5">
          <form onSubmit={handleLogin} className="space-y-4">
            <Input
              label={role === 'doctor' ? 'Doctor Email or Registered Mobile' : 'Assistant Email or Login ID'}
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder="e.g. doctor@practice.in"
              required
            />

            <Input
              label="Password or One-Time Passcode (OTP)"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              required
            />

            <div className="flex items-center justify-between text-xs text-slate-500">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input type="checkbox" defaultChecked className="rounded accent-teal-600" />
                <span>Remember this terminal</span>
              </label>
              <span className="text-teal-700 hover:underline cursor-pointer">Forgot access?</span>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="md"
              isLoading={isLoading}
              className="w-full justify-center"
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Sign In to {role === 'doctor' ? 'Doctor Portal' : 'Assistant Console'}
            </Button>
          </form>

          <div className="pt-3 border-t border-slate-100 flex items-center gap-2 text-xs text-slate-500">
            <ShieldCheck className="w-4 h-4 text-teal-600 shrink-0" />
            <span>
              {role === 'doctor'
                ? 'Master tenant access with digital prescription authority'
                : 'Receptionist desk console (Queue check-in & token confirmation)'}
            </span>
          </div>
        </Card>

        {/* Trial Link */}
        <div className="text-center text-xs text-slate-500">
          Not yet registered your clinic?{' '}
          <Link to="/doctor/register" className="text-teal-700 font-semibold hover:underline">
            Start 1-Month Free Trial
          </Link>
        </div>
      </div>
    </div>
  );
};
