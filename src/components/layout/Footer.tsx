import React from 'react';
import { Link } from 'react-router-dom';
import { Stethoscope, ShieldCheck, MessageSquare, Building2, Lock } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-400 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-10">
          {/* Brand & Purpose */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-2.5 text-white">
              <div className="w-8 h-8 rounded-lg bg-teal-600 flex items-center justify-center text-white">
                <Stethoscope className="w-4 h-4 stroke-[2.2]" />
              </div>
              <span className="text-lg font-bold tracking-tight text-white">
                DocPulse<span className="text-teal-400">.in</span>
              </span>
            </Link>
            <p className="text-sm text-slate-400 max-w-sm leading-relaxed">
              Purpose-built practice management SaaS for individual medical practitioners across India.
              Empowering independent doctors with city-first patient discovery, duration-based token
              queuing, automated WhatsApp visit estimates, and assistant delegation.
            </p>
            <div className="flex items-center gap-3 text-xs text-slate-400 pt-1">
              <span className="inline-flex items-center gap-1.5 text-slate-300">
                <ShieldCheck className="w-4 h-4 text-teal-400" />
                Strict Tenant Isolation
              </span>
              <span aria-hidden="true" className="text-slate-600">·</span>
              <span className="inline-flex items-center gap-1.5 text-slate-300">
                <Lock className="w-3.5 h-3.5 text-teal-400" />
                Encrypted Health Records
              </span>
            </div>
          </div>

          {/* Patient Services */}
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-200">
              For Patients
            </p>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/doctors" className="hover:text-white transition-colors">
                  City-First Doctor Search
                </Link>
              </li>
              <li>
                <a href="/#queue-tech" className="hover:text-white transition-colors">
                  Queue Token Tracking
                </a>
              </li>
              <li>
                <a href="/#walkin-qr" className="hover:text-white transition-colors">
                  Clinic Walk-In QR Booking
                </a>
              </li>
              <li>
                <a href="/#how-it-works" className="hover:text-white transition-colors">
                  WhatsApp Appointment Alerts
                </a>
              </li>
            </ul>
          </div>

          {/* Doctor Practice SaaS */}
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-200">
              For Doctors &amp; Clinics
            </p>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/doctor/register" className="hover:text-white transition-colors">
                  Start 30-Day Free Trial
                </Link>
              </li>
              <li>
                <Link to="/doctor/login" className="hover:text-white transition-colors">
                  Doctor &amp; Assistant Login
                </Link>
              </li>
              <li>
                <Link to="/doctor/dashboard" className="hover:text-white transition-colors">
                  Live Clinic CRM Preview
                </Link>
              </li>
              <li>
                <a href="/#doctor-crm" className="hover:text-white transition-colors">
                  Multi-Location Practice Setup
                </a>
              </li>
              <li>
                <a href="/#queue-tech" className="hover:text-white transition-colors">
                  Consultation Duration Engine
                </a>
              </li>
            </ul>
          </div>

          {/* Trust & Architecture */}
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-200">
              Practice Governance
            </p>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-1.5">
                <Building2 className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
                <span>Single-Doctor Tenant Architecture</span>
              </li>
              <li className="flex items-start gap-1.5">
                <MessageSquare className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
                <span>WhatsApp Business API Readiness</span>
              </li>
              <li>
                <span className="text-xs text-slate-400 block mt-1">
                  National Medical Commission (NMC) professional registration compliance.
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <p>© {new Date().getFullYear()} DocPulse India. Independent Doctor &amp; Patient Practice SaaS.</p>
          <div className="flex items-center gap-6">
            <span className="hover:text-slate-200 cursor-pointer transition-colors">Privacy Policy</span>
            <span className="hover:text-slate-200 cursor-pointer transition-colors">Terms of Practice</span>
            <span className="hover:text-slate-200 cursor-pointer transition-colors">WhatsApp Policy</span>
            <span className="hover:text-slate-200 cursor-pointer transition-colors">Security Architecture</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
