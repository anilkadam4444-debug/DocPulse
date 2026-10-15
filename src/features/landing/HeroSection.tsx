import React from 'react';
import { Link } from 'react-router-dom';
import {
  CalendarCheck,
  Clock,
  ArrowRight,
  Shield,
  MessageCircle,
  Building,
  CheckCircle2,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { CitySearchWidget } from './CitySearchWidget';

export const HeroSection: React.FC = () => {
  return (
    <section className="relative overflow-hidden pt-8 pb-16 md:pt-12 md:pb-20 lg:pt-16 lg:pb-24 bg-gradient-to-b from-slate-50 via-slate-50 to-white">
      {/* Subtle background grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage:
            'radial-gradient(#0F172A 1px, transparent 1px), radial-gradient(#0F172A 1px, #F8FAFC 1px)',
          backgroundSize: '32px 32px',
        }}
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main 2-column hero split */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          {/* Column 1: Value Proposition & CTAs */}
          <div className="lg:col-span-7 space-y-6 text-left">
            {/* Human-crafted kicker without pills */}
            <div className="flex items-center gap-2 text-xs font-semibold text-teal-800 tracking-wide uppercase">
              <span className="w-2 h-2 rounded-full bg-teal-600 inline-block" />
              <span>Independent Practice Operating System</span>
              <span aria-hidden="true" className="text-slate-300">·</span>
              <span className="text-slate-500 font-medium">Pan-India Medical Practices</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-[1.15] text-balance">
              Dignified Practice Management for India&apos;s Independent Doctors
            </h1>

            <p className="text-base sm:text-lg text-slate-600 max-w-2xl leading-relaxed">
              Empower your clinic with city-first patient discovery, consultation duration-based
              token scheduling, and automated WhatsApp arrival estimates. Eliminate crowded waiting
              room anxiety while maintaining clinical independence.
            </p>

            {/* Value Highlights */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs text-slate-700">
              <div className="flex items-center gap-2 bg-white/80 border border-slate-200/80 rounded-lg p-2.5">
                <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
                <span>Single-Doctor Tenant Isolation</span>
              </div>
              <div className="flex items-center gap-2 bg-white/80 border border-slate-200/80 rounded-lg p-2.5">
                <Clock className="w-4 h-4 text-teal-600 shrink-0" />
                <span>Duration-Based Token Queue</span>
              </div>
              <div className="flex items-center gap-2 bg-white/80 border border-slate-200/80 rounded-lg p-2.5">
                <MessageCircle className="w-4 h-4 text-teal-600 shrink-0" />
                <span>Automated WhatsApp Alerts</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-3">
              <Link to="/doctor/register">
                <Button
                  variant="primary"
                  size="lg"
                  className="w-full sm:w-auto"
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                >
                  Register Practice (1-Month Free Trial)
                </Button>
              </Link>
              <Link to="/doctors">
                <Button variant="outline" size="lg" className="w-full sm:w-auto">
                  Explore Doctor Directory
                </Button>
              </Link>
            </div>

            <p className="text-xs text-slate-500">
              No credit card required for trial. Transparent flat subscription thereafter. Zero
              commission on patient fees.
            </p>
          </div>

          {/* Column 2: Live Practice Experience Visual Card */}
          <div className="lg:col-span-5">
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-elevated p-5 md:p-6 space-y-4">
              {/* Doctor Practice Header */}
              <div className="flex items-start justify-between pb-3 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-teal-700 uppercase tracking-wider">
                      Live Clinic Session
                    </span>
                    <span className="text-slate-300">·</span>
                    <span className="text-xs text-slate-500">Bandra West, Mumbai</span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900 mt-0.5">
                    Dr. Arun Sharma, MD
                  </h3>
                  <p className="text-xs text-slate-500">Aarogyam Family Care Clinic</p>
                </div>
                <div className="text-right">
                  <span className="text-xs text-slate-500 block">Avg. Consultation</span>
                  <span className="text-sm font-semibold text-slate-900">15 mins</span>
                </div>
              </div>

              {/* Live Queue Token Tracker */}
              <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200/70 space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-700">Token Status Today</span>
                  <span className="text-teal-700 font-medium">Session: 09:30 AM - 01:30 PM</span>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="bg-white rounded-lg p-2.5 border border-slate-200">
                    <span className="text-xs text-slate-500 block">Now Serving</span>
                    <span className="text-lg font-bold text-teal-600 font-mono">T-08</span>
                  </div>
                  <div className="bg-white rounded-lg p-2.5 border border-slate-200">
                    <span className="text-xs text-slate-500 block">Your Token</span>
                    <span className="text-lg font-bold text-slate-900 font-mono">T-11</span>
                  </div>
                  <div className="bg-white rounded-lg p-2.5 border border-slate-200">
                    <span className="text-xs text-slate-500 block">Ahead Of You</span>
                    <span className="text-lg font-bold text-slate-700">2 Patients</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-600 px-1 pt-1">
                  <span>Tentative Consultation:</span>
                  <span className="font-semibold text-slate-900">11:00 AM (±10 min window)</span>
                </div>
              </div>

              {/* WhatsApp Simulated Message Preview */}
              <div className="bg-[#E7F8E8] border border-[#C5E8C8] rounded-xl p-3 space-y-1.5">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-[#1B6628]">
                  <MessageCircle className="w-3.5 h-3.5 text-[#25D366] fill-[#25D366]" />
                  <span>WhatsApp Visit Notification</span>
                  <span className="text-slate-400 font-normal ml-auto text-[11px]">Just now</span>
                </div>
                <p className="text-xs text-slate-800 leading-relaxed font-sans">
                  &ldquo;Namaste Rajeshji, your token with Dr. Arun Sharma is{' '}
                  <span className="font-bold text-slate-900">T-11</span>. Tentative time is{' '}
                  <span className="font-semibold text-slate-900">11:00 AM</span>. Please arrive
                  between 10:50 AM - 11:10 AM.&rdquo;
                </p>
              </div>

              {/* Action summary */}
              <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                <span className="flex items-center gap-1">
                  <Shield className="w-3.5 h-3.5 text-teal-600" />
                  MCI Registered Practice
                </span>
                <span className="text-teal-700 font-medium">QR Walk-in &amp; Online Ready</span>
              </div>
            </div>
          </div>
        </div>

        {/* City-First Search Entry Point (Prominently anchored below hero headline) */}
        <div className="mt-12 lg:mt-16">
          <CitySearchWidget />
        </div>
      </div>
    </section>
  );
};
