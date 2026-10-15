import React from 'react';
import { Search, QrCode, MessageCircle, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '../../components/ui/Button';

export const HowItWorksSection: React.FC = () => {
  const steps = [
    {
      stepNumber: '01',
      title: 'City-First Doctor Discovery',
      description:
        'Select your city first, then search by doctor name, neighborhood clinic, or specialization to find trusted independent medical practitioners.',
      icon: <Search className="w-5 h-5 text-teal-600" />,
      subtext: 'Mumbai, Delhi-NCR, Bengaluru, Pune & 10+ cities',
    },
    {
      stepNumber: '02',
      title: 'Book Online or Scan Walk-In QR',
      description:
        'Reserve your consultation token online from home, or simply scan the acrylic QR stand at the clinic reception counter without installing any app.',
      icon: <QrCode className="w-5 h-5 text-teal-600" />,
      subtext: 'Unified queue for online & counter patients',
    },
    {
      stepNumber: '03',
      title: 'WhatsApp Token & Tentative Arrival Window',
      description:
        'Get your assigned token number, tentative consultation time, and arrival window on WhatsApp, with an automated ping when your turn is imminent.',
      icon: <MessageCircle className="w-5 h-5 text-teal-600" />,
      subtext: 'Track live queue position from anywhere',
    },
  ];

  return (
    <section id="how-it-works" className="py-16 md:py-24 bg-slate-50 border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-teal-700">
            Frictionless Patient Experience
          </span>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight">
            How Patients Use DocPulse in 3 Simple Steps
          </h2>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
            No complicated account registrations or heavy app downloads. Straightforward medical
            access designed for Indian patients and families.
          </p>
        </div>

        {/* 3 Steps */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {steps.map((step, idx) => (
            <div
              key={step.stepNumber}
              className="bg-white rounded-2xl p-6 sm:p-7 border border-slate-200/90 shadow-xs flex flex-col justify-between space-y-5"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-center">
                    {step.icon}
                  </div>
                  <span className="text-2xl font-bold font-mono text-slate-300">
                    {step.stepNumber}
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-900">{step.title}</h3>

                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {step.description}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 text-xs text-slate-500 font-medium">
                {step.subtext}
              </div>
            </div>
          ))}
        </div>

        {/* Action Link */}
        <div className="mt-10 text-center">
          <Link to="/doctors">
            <Button
              variant="outline"
              size="md"
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Search Doctors in Your City Now
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};
