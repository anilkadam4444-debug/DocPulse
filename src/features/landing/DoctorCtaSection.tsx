import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ShieldCheck, Check, Sparkles } from 'lucide-react';
import { Button } from '../../components/ui/Button';

export const DoctorCtaSection: React.FC = () => {
  return (
    <section className="py-16 md:py-20 bg-slate-900 text-white relative overflow-hidden border-t border-slate-800">
      {/* Background accents */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-teal-600/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-950/80 border border-teal-800/60 text-teal-300 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5 text-teal-400" />
          <span>30-Day Free Trial For All Registered Indian Doctors</span>
        </div>

        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white max-w-3xl mx-auto text-balance">
          Transform Your Clinic Waiting Experience Today
        </h2>

        <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
          Join modern independent physicians across Mumbai, Delhi, Bengaluru, and Pune. Set your
          average consultation duration, print your reception QR stand, and give patients the
          respect of tentative time windows.
        </p>

        {/* Feature Checkpoints */}
        <div className="flex flex-wrap items-center justify-center gap-y-2 gap-x-6 text-xs sm:text-sm text-slate-300">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-teal-400" />
            <span>Full 30-Day Unrestricted Free Trial</span>
          </div>
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-teal-400" />
            <span>No Credit Card Required</span>
          </div>
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-teal-400" />
            <span>Independent Doctor Tenant Isolation</span>
          </div>
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-teal-400" />
            <span>Zero Commission on Patient Fees</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
          <Link to="/doctor/register" className="w-full sm:w-auto">
            <Button
              variant="primary"
              size="lg"
              className="w-full sm:w-auto px-8"
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Start 30-Day Free Trial
            </Button>
          </Link>
          <Link to="/doctor/login" className="w-full sm:w-auto">
            <Button
              variant="outline"
              size="lg"
              className="w-full sm:w-auto bg-slate-800/80 text-white border-slate-700 hover:bg-slate-800 hover:text-white"
            >
              Doctor &amp; Assistant Login
            </Button>
          </Link>
        </div>

        <p className="text-xs text-slate-400">
          Requires valid MCI or State Medical Council registration number during onboarding.
        </p>
      </div>
    </section>
  );
};
