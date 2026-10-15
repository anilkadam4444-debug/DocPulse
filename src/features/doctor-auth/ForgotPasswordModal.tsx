import React, { useState } from 'react';
import { Mail, CheckCircle2, AlertCircle, X, ArrowRight } from 'lucide-react';
import { useAuth } from './AuthContext';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialEmail?: string;
}

export const ForgotPasswordModal: React.FC<ForgotPasswordModalProps> = ({
  isOpen,
  onClose,
  initialEmail = '',
}) => {
  const { sendPasswordReset } = useAuth();
  const [email, setEmail] = useState(initialEmail);
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(
    null
  );

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setIsLoading(true);
    setStatusMessage(null);

    const res = await sendPasswordReset(email);
    setIsLoading(false);

    if (res.success) {
      setStatusMessage({
        type: 'success',
        text: `Password reset email has been sent to ${email}. Please check your inbox and spam folder.`,
      });
    } else {
      setStatusMessage({
        type: 'error',
        text: res.error || 'Failed to dispatch password reset link. Please try again.',
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-5 border border-slate-200 shadow-xl relative">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 rounded-lg"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="space-y-1">
          <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-200 text-teal-700 flex items-center justify-center mb-3">
            <Mail className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">Reset Doctor Account Password</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Enter the professional email address associated with your doctor practice. We will send an official password reset link.
          </p>
        </div>

        {statusMessage ? (
          <div
            className={`p-4 rounded-xl text-xs space-y-3 ${
              statusMessage.type === 'success'
                ? 'bg-emerald-50 border border-emerald-200 text-emerald-950'
                : 'bg-red-50 border border-red-200 text-red-950'
            }`}
          >
            <div className="flex items-start gap-2">
              {statusMessage.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              )}
              <p className="leading-relaxed">{statusMessage.text}</p>
            </div>

            {statusMessage.type === 'success' && (
              <Button
                variant="outline"
                size="sm"
                onClick={onClose}
                className="w-full justify-center bg-white"
              >
                Return to Doctor Login
              </Button>
            )}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              id="reset-email"
              label="Registered Email Address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. dr.rajesh@practice.in"
              leftIcon={<Mail className="w-4 h-4" />}
              required
            />

            <div className="flex items-center gap-2 pt-1">
              <Button
                type="submit"
                variant="primary"
                size="md"
                isLoading={isLoading}
                className="w-full justify-center"
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Send Password Reset Email
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
