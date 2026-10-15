import React, { useState } from 'react';
import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../../features/doctor-auth/AuthContext';
import { Stethoscope, AlertTriangle, Mail, CheckCircle2, RotateCw } from 'lucide-react';
import { Button } from '../ui/Button';

interface ProtectedRouteProps {
  children?: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, isLoading, isProfileLoading, resendVerificationEmail, reloadUserStatus } = useAuth();
  const location = useLocation();
  const [resendStatus, setResendStatus] = useState<string | null>(null);
  const [isChecking, setIsChecking] = useState(false);

  // 1. Wait for auth state to resolve
  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-8 max-w-sm w-full text-center space-y-4 shadow-sm animate-pulse">
          <div className="w-12 h-12 rounded-xl bg-slate-900 text-teal-400 flex items-center justify-center mx-auto">
            <Stethoscope className="w-6 h-6 stroke-[2.2]" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">Verifying Practice Session</h3>
            <p className="text-xs text-slate-500 mt-1">Connecting to secure doctor tenant identity...</p>
          </div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
            <div className="bg-teal-600 h-full w-2/3 animate-ping" />
          </div>
        </div>
      </div>
    );
  }

  // 2. If not authenticated, redirect to login with return path
  if (!user) {
    return <Navigate to="/doctor/login" state={{ from: location }} replace />;
  }

  const handleResend = async () => {
    setResendStatus('Sending verification email...');
    const result = await resendVerificationEmail();
    if (result.success) {
      setResendStatus('Verification link dispatched to your inbox! Please check Spam folder if not received.');
    } else {
      setResendStatus(result.error || 'Failed to send verification email.');
    }
  };

  const handleCheckVerification = async () => {
    setIsChecking(true);
    await reloadUserStatus();
    setIsChecking(false);
  };

  // 3. Render authenticated doctor route with unverified email alert banner if applicable
  return (
    <div>
      {!user.emailVerified && (
        <div className="bg-amber-500/10 border-b border-amber-300 text-amber-950 px-4 py-3 text-xs">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-amber-700 shrink-0" />
              <span>
                <strong>Email Verification Pending:</strong> A verification link was sent to{' '}
                <strong className="underline">{user.email}</strong>. Please confirm your email to ensure uninterrupted practice notifications.
              </span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Button
                variant="outline"
                size="sm"
                onClick={handleResend}
                className="text-[11px] h-7 bg-white/80 border-amber-300 text-amber-900 hover:bg-amber-100"
              >
                Resend Email
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleCheckVerification}
                isLoading={isChecking}
                leftIcon={<RotateCw className="w-3 h-3" />}
                className="text-[11px] h-7"
              >
                I Verified It
              </Button>
            </div>
          </div>
          {resendStatus && (
            <div className="max-w-7xl mx-auto text-[11px] font-medium text-amber-900 mt-1 pl-6">
              {resendStatus}
            </div>
          )}
        </div>
      )}

      {children ? <>{children}</> : <Outlet />}
    </div>
  );
};
