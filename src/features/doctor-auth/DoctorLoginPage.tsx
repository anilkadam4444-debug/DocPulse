import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Stethoscope, Lock, Mail, ArrowRight, ShieldCheck, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { useAuth } from './AuthContext';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card } from '../../components/ui/Card';
import { ForgotPasswordModal } from './ForgotPasswordModal';

export const DoctorLoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberTerminal, setRememberTerminal] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showForgotModal, setShowForgotModal] = useState(false);

  // Read return path if coming from a protected route
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/doctor/dashboard';

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email.trim()) {
      setErrorMessage('Please enter your registered professional email address.');
      return;
    }

    if (!password) {
      setErrorMessage('Please enter your account password.');
      return;
    }

    setIsLoading(true);
    const result = await login(email, password);
    setIsLoading(false);

    if (result.success) {
      navigate(from, { replace: true });
    } else {
      setErrorMessage(result.error || 'Authentication failed. Please verify your credentials.');
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen py-12 lg:py-20 flex items-center justify-center">
      <div className="max-w-md w-full mx-auto px-4 space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-xl bg-slate-900 text-teal-400 flex items-center justify-center mx-auto shadow-sm">
            <Stethoscope className="w-6 h-6 stroke-[2.2]" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Doctor Practice Portal
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Secure multi-tenant access for registered medical practitioners
          </p>
        </div>

        {/* Login Box */}
        <Card className="bg-white border border-slate-200 p-6 md:p-7 space-y-5 shadow-xs">
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-950 text-xs flex items-start gap-2.5 animate-in fade-in duration-150">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <div className="flex-1 leading-relaxed">{errorMessage}</div>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <Input
              id="login-email"
              label="Doctor Professional Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. dr.rajesh@practice.in"
              leftIcon={<Mail className="w-4 h-4" />}
              autoComplete="email"
              required
            />

            <div className="relative">
              <Input
                id="login-password"
                label="Account Password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your account password"
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
                autoComplete="current-password"
                required
              />
            </div>

            <div className="flex items-center justify-between text-xs text-slate-500 pt-0.5">
              <label className="flex items-center gap-1.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberTerminal}
                  onChange={(e) => setRememberTerminal(e.target.checked)}
                  className="rounded border-slate-300 text-teal-600 focus:ring-teal-500 accent-teal-600 cursor-pointer"
                />
                <span>Persistent browser session</span>
              </label>

              <button
                type="button"
                onClick={() => setShowForgotModal(true)}
                className="text-teal-700 hover:text-teal-900 hover:underline font-medium cursor-pointer"
              >
                Forgot password?
              </button>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="md"
              isLoading={isLoading}
              className="w-full justify-center mt-2"
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Sign In to Doctor Portal
            </Button>
          </form>

          <div className="pt-3 border-t border-slate-100 flex items-center gap-2 text-xs text-slate-500">
            <ShieldCheck className="w-4 h-4 text-teal-600 shrink-0" />
            <span>
              Doctor tenant identity protected via Firebase Authentication session token.
            </span>
          </div>
        </Card>

        {/* Registration CTA */}
        <div className="text-center text-xs text-slate-600">
          Not yet registered your clinic?{' '}
          <Link to="/doctor/register" className="text-teal-700 font-semibold hover:underline">
            Register Practice (1-Month Free Trial)
          </Link>
        </div>
      </div>

      {/* Forgot Password Modal */}
      <ForgotPasswordModal
        isOpen={showForgotModal}
        onClose={() => setShowForgotModal(false)}
        initialEmail={email}
      />
    </div>
  );
};
