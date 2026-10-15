import React, { useState, useMemo } from 'react';
import { MessageCircle, AlertCircle } from 'lucide-react';
import {
  calculateQueueSlotEstimate,
  CONSULTATION_DURATIONS,
  formatQueueToken,
} from '../../lib/queue-calculator';
import { Card } from '../../components/ui/Card';

export const QueueAndTimingSection: React.FC = () => {
  const [selectedDuration, setSelectedDuration] = useState<number>(15);
  const [selectedToken, setSelectedToken] = useState<number>(7);
  const [currentServingToken, setCurrentServingToken] = useState<number>(3);
  const sessionStartTime = '09:30 AM';

  const estimate = useMemo(() => {
    return calculateQueueSlotEstimate(
      sessionStartTime,
      selectedToken,
      currentServingToken,
      selectedDuration,
      10
    );
  }, [selectedDuration, selectedToken, currentServingToken]);

  return (
    <section id="queue-tech" className="py-16 md:py-24 bg-white border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-teal-700">
            Intelligent Practice Timing
          </span>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight">
            Consultation-Based Scheduling &amp; Tentative Queue Estimates
          </h2>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
            Every doctor works at their own clinical pace. DocPulse schedules appointments based on
            your calibrated average consultation duration—providing patients with tentative arrival
            windows and live token updates without making rigid, unrealistic promises.
          </p>
        </div>

        {/* Interactive Timing Simulator */}
        <div className="mt-12 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Controls Column */}
          <div className="lg:col-span-5 space-y-6">
            <Card variant="subtle" className="space-y-5">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Interactive Practice Simulator
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Adjust doctor settings below to see how token times and WhatsApp alerts compute
                  in real time.
                </p>
              </div>

              {/* Setting 1: Average Consultation Duration */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-700">
                  1. Doctor&apos;s Average Consultation Duration
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {CONSULTATION_DURATIONS.map((mins) => (
                    <button
                      key={mins}
                      type="button"
                      onClick={() => setSelectedDuration(mins)}
                      className={`py-2 px-2.5 text-xs font-medium rounded-lg border transition-all text-center ${
                        selectedDuration === mins
                          ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                          : 'bg-white text-slate-700 border-slate-300 hover:border-slate-400'
                      }`}
                    >
                      {mins} mins
                    </button>
                  ))}
                </div>
                <p className="text-[11px] text-slate-500">
                  {selectedDuration <= 10
                    ? 'Recommended for routine seasonal checkups & quick follow-ups'
                    : selectedDuration === 15
                    ? 'Ideal for general internal medicine & pediatric examinations'
                    : 'Suited for comprehensive cardiac, orthopedic, or specialty consultations'}
                </p>
              </div>

              {/* Setting 2: Token Selector */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-700">2. Select Patient Token</span>
                  <span className="font-mono font-bold text-teal-700 text-sm">
                    {estimate.formattedToken}
                  </span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={15}
                  value={selectedToken}
                  onChange={(e) => setSelectedToken(parseInt(e.target.value, 10))}
                  className="w-full accent-teal-600 cursor-pointer"
                  aria-label="Select token number"
                />
                <div className="flex justify-between text-[11px] text-slate-400 font-mono">
                  <span>T-01 (Start)</span>
                  <span>T-07</span>
                  <span>T-15</span>
                </div>
              </div>

              {/* Setting 3: Currently Serving */}
              <div className="space-y-2 pt-2 border-t border-slate-200/80">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-700">Currently Serving in Clinic</span>
                  <span className="font-mono font-bold text-slate-900">
                    Token {formatQueueToken(currentServingToken)}
                  </span>
                </div>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setCurrentServingToken(num)}
                      className={`flex-1 py-1 text-xs rounded border transition-colors ${
                        currentServingToken === num
                          ? 'bg-teal-600 text-white border-teal-600 font-medium'
                          : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {formatQueueToken(num)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Clinical Realism Disclaimer */}
              <div className="flex items-start gap-2.5 p-3 rounded-lg bg-amber-50/80 border border-amber-200 text-amber-900 text-xs leading-relaxed">
                <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <span>
                  <strong>Clinical Reality:</strong> Emergency cases and variable patient severity
                  take medical precedence. Tentative time windows guide arrival without guaranteeing
                  exact second precision.
                </span>
              </div>
            </Card>
          </div>

          {/* Real-Time Result & WhatsApp Preview */}
          <div className="lg:col-span-7 space-y-5">
            {/* Calculation Card */}
            <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-md border border-slate-800 space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-800">
                <div>
                  <span className="text-xs font-semibold text-teal-400 uppercase tracking-wider">
                    Calculated Arrival Schedule
                  </span>
                  <h3 className="text-xl font-bold mt-0.5">
                    Token {estimate.formattedToken} Schedule
                  </h3>
                </div>
                <div className="text-xs text-slate-400 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700">
                  Session Start: <strong className="text-slate-200">{sessionStartTime}</strong>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-slate-800/60 rounded-xl p-4 border border-slate-700/80">
                  <span className="text-xs text-slate-400 block">Tentative Visit Time</span>
                  <div className="text-xl font-bold text-teal-400 font-mono mt-1">
                    {estimate.tentativeTime}
                  </div>
                  <span className="text-[11px] text-slate-400 mt-1 block">
                    Based on {selectedDuration}m / patient
                  </span>
                </div>

                <div className="bg-slate-800/60 rounded-xl p-4 border border-slate-700/80">
                  <span className="text-xs text-slate-400 block">Advised Arrival Window</span>
                  <div className="text-base font-bold text-white font-mono mt-1">
                    {estimate.windowStart} - {estimate.windowEnd}
                  </div>
                  <span className="text-[11px] text-slate-400 mt-1 block">±10 min buffer</span>
                </div>

                <div className="bg-slate-800/60 rounded-xl p-4 border border-slate-700/80">
                  <span className="text-xs text-slate-400 block">Queue Position</span>
                  <div className="text-xl font-bold text-white font-mono mt-1">
                    {estimate.tokensAhead === 0
                      ? 'Serving Now'
                      : `${estimate.tokensAhead} Ahead`}
                  </div>
                  <span className="text-[11px] text-slate-400 mt-1 block">
                    Now inside: {formatQueueToken(currentServingToken)}
                  </span>
                </div>
              </div>
            </div>

            {/* WhatsApp Live Template Simulator */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 md:p-6 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-[#25D366]/20 flex items-center justify-center">
                    <MessageCircle className="w-4 h-4 text-[#25D366] fill-[#25D366]" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-900">
                    Simulated Patient WhatsApp Message
                  </h4>
                </div>
                <span className="text-xs text-slate-500">Official WhatsApp Business API</span>
              </div>

              {/* Chat Bubble Presentation */}
              <div className="bg-[#E7F8E8] border border-[#C5E8C8] rounded-xl p-4 space-y-2 text-sm text-slate-800">
                <div className="flex items-center justify-between text-xs font-semibold text-[#1B6628] pb-1 border-b border-[#C5E8C8]">
                  <span>DOCPULSE PRACTICE NOTIFIER</span>
                  <span className="text-[11px] font-normal text-slate-500">Delivered</span>
                </div>
                <p className="leading-relaxed">
                  Namaste <strong>Patient</strong>, your appointment at{' '}
                  <strong>Aarogyam Family Care Clinic</strong> with{' '}
                  <strong>Dr. Arun Sharma</strong> is confirmed.
                </p>
                <div className="bg-white/90 rounded-lg p-3 space-y-1 text-xs border border-[#BCE4C0]">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Your Queue Token:</span>
                    <strong className="text-teal-800 font-mono text-sm">
                      {estimate.formattedToken}
                    </strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Tentative Visit Time:</span>
                    <strong className="text-slate-900">{estimate.tentativeTime}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Recommended Arrival:</span>
                    <strong className="text-slate-900">
                      {estimate.windowStart} – {estimate.windowEnd}
                    </strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Consultation Duration:</span>
                    <span className="text-slate-700">{selectedDuration} mins allocated</span>
                  </div>
                </div>
                <p className="text-[11px] text-slate-600 italic">
                  Note: Emergency consultations may adjust times slightly. You will receive an SMS/WhatsApp reminder when only 2 patients are ahead of you.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
