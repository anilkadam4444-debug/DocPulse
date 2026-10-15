import React from 'react';
import {
  Users,
  ShieldCheck,
  FileText,
  Building,
  BellRing,
  CreditCard,
  CheckCircle,
  Lock,
} from 'lucide-react';
import { Card } from '../../components/ui/Card';

export const DoctorCrmSection: React.FC = () => {
  return (
    <section id="doctor-crm" className="py-16 md:py-24 bg-slate-50 border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-teal-700">
            Clinical Independence &amp; Practice Flow
          </span>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight">
            Doctor &amp; Authorized Assistant CRM
          </h2>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
            Built specifically for individual practitioners across India. Keep clinical autonomy
            with dedicated tenant architecture, delegate front-desk duties to your assistant, and
            manage multiple clinic locations seamlessly.
          </p>
        </div>

        {/* Bento Grid */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Card 1: Multi-Tenant Architecture (Span 2 on lg) */}
          <div className="lg:col-span-2">
            <Card className="h-full space-y-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-lg bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-700">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    True Single-Doctor Tenant Isolation
                  </h3>
                  <p className="text-xs text-slate-500">
                    Independent ownership — not a cog in a hospital software chain
                  </p>
                </div>
              </div>

              <p className="text-sm text-slate-600 leading-relaxed">
                You own your patient relationships, practice timings, and clinical notes. Clinics
                and hospital visiting hours are registered as practice locations tied to your
                individual doctor account. If you switch or add a clinic branch, your patient history
                and credentials remain securely yours.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                  <strong className="text-slate-900 block font-semibold mb-1">
                    Multi-Location Practice Setup
                  </strong>
                  <p className="text-slate-600">
                    Run morning OPD at your private clinic and evening consulting hours at a nursing
                    home with independent queues.
                  </p>
                </div>
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                  <strong className="text-slate-900 block font-semibold mb-1">
                    Zero Patient Poaching
                  </strong>
                  <p className="text-slate-600">
                    Your patient list is never shared or cross-promoted to competitor clinics or
                    third-party pharmaceutical brokers.
                  </p>
                </div>
              </div>
            </Card>
          </div>

          {/* Card 2: Assistant Role Delegation */}
          <div>
            <Card className="h-full space-y-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-lg bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-700">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Assistant &amp; Receptionist Roles
                  </h3>
                  <p className="text-xs text-slate-500">Strict permission boundaries</p>
                </div>
              </div>

              <p className="text-sm text-slate-600 leading-relaxed">
                Authorize your clinic receptionist to confirm bookings, register walk-ins, and update
                queue arrivals, while keeping diagnosis notes and digital prescriptions strictly
                confidential to your doctor login.
              </p>

              <ul className="space-y-2 text-xs text-slate-600 pt-1">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-3.5 h-3.5 text-teal-600" />
                  <span>Assistant can confirm &amp; queue tokens</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-3.5 h-3.5 text-teal-600" />
                  <span>Assistant cannot view medical records</span>
                </li>
                <li className="flex items-center gap-2">
                  <Lock className="w-3.5 h-3.5 text-teal-600" />
                  <span>Doctor retains master clinical override</span>
                </li>
              </ul>
            </Card>
          </div>

          {/* Card 3: WhatsApp Confirmations */}
          <div>
            <Card className="h-full space-y-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-lg bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-700">
                  <BellRing className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    1-Click WhatsApp Confirmations
                  </h3>
                  <p className="text-xs text-slate-500">Zero manual typing or calling</p>
                </div>
              </div>

              <p className="text-sm text-slate-600 leading-relaxed">
                Whenever an appointment is requested or confirmed via your CRM, DocPulse dispatches
                an automated WhatsApp notification with the token number, clinic address, and
                tentative arrival window directly to the patient&apos;s phone.
              </p>
            </Card>
          </div>

          {/* Card 4: Digital Prescriptions & Records */}
          <div>
            <Card className="h-full space-y-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-lg bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-700">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Digital Prescriptions &amp; History
                  </h3>
                  <p className="text-xs text-slate-500">Quick templates for Indian practices</p>
                </div>
              </div>

              <p className="text-sm text-slate-600 leading-relaxed">
                Formulate standardized prescriptions with dosage frequencies (e.g. 1-0-1 after food),
                investigation requests, and follow-up reminders. Patients receive a tamper-proof PDF
                on WhatsApp immediately following consultation.
              </p>
            </Card>
          </div>

          {/* Card 5: Basic Billing & Receipts */}
          <div>
            <Card className="h-full space-y-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-lg bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-700">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Transparent Practice Billing
                  </h3>
                  <p className="text-xs text-slate-500">UPI, Cash &amp; Receipt Records</p>
                </div>
              </div>

              <p className="text-sm text-slate-600 leading-relaxed">
                Track daily cash, card, and UPI collections effortlessly. Issue printed or digital
                consultation receipts with your MCI registration number and tax summary for clean
                accounting.
              </p>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};
