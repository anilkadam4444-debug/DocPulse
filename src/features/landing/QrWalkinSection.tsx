import React from 'react';
import { QrCode, Smartphone, Compass, Clock, CheckCircle2, Shield } from 'lucide-react';
import { Card } from '../../components/ui/Card';

export const QrWalkinSection: React.FC = () => {
  return (
    <section id="walkin-qr" className="py-16 md:py-24 bg-white border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          {/* Left Column: Visual Acrylic Stand & QR Flow Preview */}
          <div className="lg:col-span-5 order-2 lg:order-1">
            <div className="bg-slate-900 rounded-3xl p-6 md:p-8 text-white shadow-elevated relative overflow-hidden border border-slate-800">
              {/* Subtle clinic indicator */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-800 text-xs">
                <span className="text-teal-400 font-semibold uppercase tracking-wider">
                  Clinic Reception Acrylic Stand
                </span>
                <span className="text-slate-400">Zero App Installation</span>
              </div>

              {/* QR Mockup Presentation */}
              <div className="my-6 flex flex-col items-center text-center p-6 bg-white rounded-2xl text-slate-900 shadow-sm border border-slate-200">
                <div className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center font-bold text-sm mb-3">
                  DP
                </div>
                <h4 className="text-sm font-bold text-slate-900">Dr. Arun Sharma&apos;s Clinic</h4>
                <p className="text-xs text-slate-500 mt-0.5">Scan to Check-In as Walk-In Patient</p>

                {/* SVG QR Code Illustration */}
                <div className="my-4 p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-center">
                  <QrCode className="w-36 h-36 text-slate-900" strokeWidth={1.5} />
                </div>

                <div className="text-xs text-slate-600 font-medium bg-teal-50 text-teal-800 px-3 py-1.5 rounded-lg border border-teal-200/60">
                  Instant Token on Your Mobile via WhatsApp
                </div>
              </div>

              {/* Flow Steps */}
              <div className="space-y-2 text-xs text-slate-300">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0" />
                  <span>Works with any smartphone camera or UPI scanner</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0" />
                  <span>Receptionist queue synchronizes instantly</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Explanatory Content */}
          <div className="lg:col-span-7 order-1 lg:order-2 space-y-6">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-700">
              Frictionless Reception Flow
            </span>

            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight text-balance">
              QR-Code Check-In for Walk-In Patients
            </h2>

            <p className="text-slate-600 text-base leading-relaxed">
              In India, walk-in patients represent over 40% of private clinic footfall. Rather than
              forcing patients into a crowded reception lobby or writing manual paper tokens,
              DocPulse supplies each practice location with a unique high-resolution QR stand.
            </p>

            <div className="space-y-4 pt-2">
              <div className="flex items-start gap-3.5">
                <div className="w-8 h-8 rounded-lg bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-700 shrink-0 mt-0.5">
                  <Smartphone className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    No App Download Required for Patients
                  </h3>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    Patients simply point their phone camera at the counter stand. A lightweight mobile
                    web page prompts their name, age, and WhatsApp number. Within 5 seconds, their
                    token number is queued.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="w-8 h-8 rounded-lg bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-700 shrink-0 mt-0.5">
                  <Compass className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Freedom to Wait in Clean, Comfortable Surroundings
                  </h3>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    Instead of sitting in a congested waiting hall, patients can step outside, visit a
                    nearby medical pharmacy, or sit in a cafe. The live mobile link and WhatsApp
                    alerts update them when only two patients remain ahead.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="w-8 h-8 rounded-lg bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-700 shrink-0 mt-0.5">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Unified Queue for Online and Walk-In Bookings
                  </h3>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    Your assistant doesn&apos;t need to manage separate registers. Online bookings and
                    counter walk-ins merge into one sequential, fair token order respecting the
                    doctor&apos;s consultation pace.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
