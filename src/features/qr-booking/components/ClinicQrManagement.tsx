import React, { useState, useRef } from 'react';
import { QRCodeSVG, QRCodeCanvas } from 'qrcode.react';
import {
  QrCode,
  Download,
  Printer,
  Copy,
  Check,
  RotateCw,
  Building,
  MapPin,
  IndianRupee,
  Phone,
  AlertTriangle,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { DoctorTenantProfile, PracticeLocation } from '../../../types/auth';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';

interface ClinicQrManagementProps {
  doctorProfile: DoctorTenantProfile;
  locations: PracticeLocation[];
  onUpdateLocation?: (updatedLocation: PracticeLocation) => Promise<void>;
}

export const ClinicQrManagement: React.FC<ClinicQrManagementProps> = ({
  doctorProfile,
  locations,
  onUpdateLocation,
}) => {
  const [copiedLocationId, setCopiedLocationId] = useState<string | null>(null);
  const [printLocation, setPrintLocation] = useState<PracticeLocation | null>(null);
  const [isRegenerating, setIsRegenerating] = useState<string | null>(null);
  const [qrVersions, setQrVersions] = useState<Record<string, number>>({});
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const getBookingUrl = (location: PracticeLocation) => {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://docpulseind.web.app';
    const version = qrVersions[location.id] || (location.qrCodeId ? 1 : 0);
    const versionParam = version > 0 ? `?v=${version}` : '';
    return `${origin}/book/${doctorProfile.uid}/${location.id}${versionParam}`;
  };

  const handleCopyLink = (location: PracticeLocation) => {
    const url = getBookingUrl(location);
    navigator.clipboard.writeText(url).then(() => {
      setCopiedLocationId(location.id);
      setToastMessage(`Booking link copied for ${location.name || location.clinicName || 'Clinic'}!`);
      setTimeout(() => setCopiedLocationId(null), 3000);
      setTimeout(() => setToastMessage(null), 3500);
    });
  };

  const handleDownloadQr = (location: PracticeLocation) => {
    const canvas = document.getElementById(`qr-canvas-${location.id}`) as HTMLCanvasElement | null;
    if (!canvas) return;

    const url = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    const clinicSlug = (location.name || location.clinicName || 'clinic').toLowerCase().replace(/[^a-z0-9]/g, '-');
    a.download = `docpulse-qr-${clinicSlug}-${location.id}.png`;
    a.href = url;
    a.click();

    setToastMessage(`Downloaded high-resolution QR PNG for ${location.name || location.clinicName}`);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleRegenerateQr = async (location: PracticeLocation) => {
    setIsRegenerating(location.id);
    const nextVersion = (qrVersions[location.id] || 1) + 1;
    const newQrCodeId = `qr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    setQrVersions((prev) => ({ ...prev, [location.id]: nextVersion }));

    if (onUpdateLocation) {
      await onUpdateLocation({
        ...location,
        qrCodeId: newQrCodeId,
      });
    }

    setTimeout(() => {
      setIsRegenerating(null);
      setToastMessage(`QR Code regenerated successfully for ${location.name || location.clinicName}. Previous links remain compatible.`);
      setTimeout(() => setToastMessage(null), 4000);
    }, 600);
  };

  return (
    <div className="space-y-6">
      {/* Overview Card */}
      <div className="bg-gradient-to-r from-teal-900 to-slate-900 text-white rounded-2xl p-6 sm:p-7 shadow-sm border border-teal-800/40 relative overflow-hidden">
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-800/60 text-teal-200 text-xs font-semibold border border-teal-600/40">
            <QrCode className="w-3.5 h-3.5" />
            <span>Clinic QR Booking Standee &amp; Digital Reception</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
            Clinic-Specific QR Codes &amp; Instant Walk-in Standees
          </h2>
          <p className="text-xs sm:text-sm text-teal-100/90 leading-relaxed">
            Every active practice location has its own permanent, cryptographically-safe QR code.
            Display this QR code at your reception counter, waiting lounge, or front door. When patients scan it with any smartphone camera, it opens your authoritative DocPulse booking portal pre-configured for that specific clinic with live queue tokens.
          </p>
          <div className="flex flex-wrap items-center gap-4 pt-1 text-xs text-teal-200">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              100% Zero-PII QR URLs
            </span>
            <span>·</span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-teal-300" />
              Location Tenant Isolation
            </span>
            <span>·</span>
            <span className="flex items-center gap-1.5">
              <Printer className="w-4 h-4 text-amber-300" />
              Ready-to-Print Clinic Standee
            </span>
          </div>
        </div>
      </div>

      {/* Global Toast */}
      {toastMessage && (
        <div className="p-3.5 rounded-xl bg-teal-50 border border-teal-200 text-teal-900 text-xs flex items-center justify-between shadow-2xs animate-fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
            <span className="font-medium">{toastMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            className="text-teal-700 hover:text-teal-900 font-bold ml-2 cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Location QR Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {locations.map((loc) => {
          const bookingUrl = getBookingUrl(loc);
          const isCopied = copiedLocationId === loc.id;
          const isActive = loc.isActive !== false;
          const clinicTitle = loc.name || loc.clinicName || 'Moraya Healthcare';
          const fullAddress = `${loc.addressLine}, ${loc.locality}, ${loc.city} - ${loc.pincode}`;

          return (
            <Card
              key={loc.id}
              className={`p-6 rounded-2xl border transition-all ${
                isActive
                  ? 'bg-white border-slate-200 hover:shadow-md'
                  : 'bg-slate-50/80 border-dashed border-slate-300 opacity-90'
              }`}
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-100">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-base font-bold text-slate-900 flex items-center gap-2">
                      <Building className="w-4 h-4 text-teal-600" />
                      {clinicTitle}
                    </span>
                    {loc.isPrimary && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] bg-teal-100 text-teal-800 font-semibold border border-teal-200">
                        Primary Clinic
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{loc.locality}, {loc.city}</span>
                  </p>
                </div>

                <div>
                  {isActive ? (
                    <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      Active Clinic
                    </span>
                  ) : (
                    <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                      Disabled / Inactive
                    </span>
                  )}
                </div>
              </div>

              {/* Inactive Warning */}
              {!isActive && (
                <div className="mt-4 p-3 bg-amber-50/90 rounded-xl border border-amber-200 text-amber-900 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>
                    This location is currently marked <strong>inactive</strong>. Patients scanning this QR code will see an unavailable clinic message and be guided to your active clinics.
                  </span>
                </div>
              )}

              {/* QR Preview & Details */}
              <div className="py-5 flex flex-col sm:flex-row items-center gap-6">
                {/* QR Code Container */}
                <div className="bg-white p-3.5 rounded-2xl border-2 border-slate-200 shadow-xs flex flex-col items-center shrink-0">
                  <div className="relative">
                    {/* Rendered SVG for sharp vector display */}
                    <QRCodeSVG
                      value={bookingUrl}
                      size={148}
                      level="H"
                      includeMargin={false}
                    />
                    {/* Hidden Canvas for PNG export */}
                    <div className="hidden">
                      <QRCodeCanvas
                        id={`qr-canvas-${loc.id}`}
                        value={bookingUrl}
                        size={512}
                        level="H"
                        includeMargin={true}
                      />
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-slate-500 mt-2 font-bold tracking-wider">
                    SCAN FOR TOKEN
                  </span>
                </div>

                {/* Info & URL */}
                <div className="flex-1 space-y-3 text-left w-full">
                  <div>
                    <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                      Authoritative Booking Route
                    </span>
                    <div className="mt-1 flex items-center gap-2 bg-slate-50 p-2 rounded-lg border border-slate-200 font-mono text-xs text-slate-700 break-all select-all">
                      <span className="truncate">{bookingUrl}</span>
                      <a
                        href={bookingUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-teal-600 hover:text-teal-800 shrink-0 p-1"
                        title="Test URL in new tab"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-slate-50 p-2 rounded-lg border border-slate-200">
                      <span className="text-slate-400 block text-[10px]">Consultation Fee</span>
                      <strong className="text-slate-900 font-bold flex items-center">
                        <IndianRupee className="w-3 h-3 text-teal-600 mr-0.5" />
                        {loc.consultationFee || doctorProfile.consultationFee || '500'}
                      </strong>
                    </div>
                    <div className="bg-slate-50 p-2 rounded-lg border border-slate-200">
                      <span className="text-slate-400 block text-[10px]">Avg Duration</span>
                      <strong className="text-slate-900 font-bold">
                        {doctorProfile.avgDurationMinutes || 15} mins / patient
                      </strong>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-500 leading-normal">
                    {fullAddress}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    variant="primary"
                    size="sm"
                    leftIcon={<Printer className="w-3.5 h-3.5" />}
                    onClick={() => setPrintLocation(loc)}
                    className="text-xs bg-teal-600 hover:bg-teal-700"
                  >
                    Print Standee
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    leftIcon={<Download className="w-3.5 h-3.5" />}
                    onClick={() => handleDownloadQr(loc)}
                    className="text-xs"
                  >
                    Download PNG
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    leftIcon={isCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    onClick={() => handleCopyLink(loc)}
                    className="text-xs"
                  >
                    {isCopied ? 'Link Copied!' : 'Copy Link'}
                  </Button>
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  leftIcon={
                    <RotateCw
                      className={`w-3.5 h-3.5 ${
                        isRegenerating === loc.id ? 'animate-spin text-teal-600' : 'text-slate-400'
                      }`}
                    />
                  }
                  onClick={() => handleRegenerateQr(loc)}
                  disabled={isRegenerating === loc.id}
                  className="text-xs text-slate-500 hover:text-slate-800"
                  title="Rotate QR version"
                >
                  Regenerate QR
                </Button>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Printable Standee Poster Modal */}
      {printLocation && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 relative my-8 animate-fade-in text-center space-y-6">
            {/* Modal Header Controls */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-teal-600">
                Clinic Counter QR Standee
              </span>
              <button
                type="button"
                onClick={() => setPrintLocation(null)}
                className="text-slate-400 hover:text-slate-700 font-bold text-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Printable Poster Container */}
            <div
              id="printable-standee-card"
              className="border-4 border-teal-600 rounded-3xl p-6 sm:p-8 bg-gradient-to-b from-teal-50/50 via-white to-slate-50 text-slate-900 space-y-5 shadow-inner"
            >
              {/* Brand Banner */}
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-teal-600 text-white text-[11px] font-bold tracking-wide uppercase">
                  <Sparkles className="w-3 h-3" />
                  DocPulse Verified Practice
                </div>
                <h3 className="text-2xl sm:text-3xl font-black text-slate-900 pt-1">
                  {printLocation.name || printLocation.clinicName || 'Clinic'}
                </h3>
                <p className="text-xs sm:text-sm font-semibold text-teal-700">
                  {doctorProfile.fullName} · {doctorProfile.qualifications}
                </p>
                <p className="text-xs text-slate-500 font-medium">
                  {doctorProfile.specialization} · Reg #{doctorProfile.registrationNumber}
                </p>
              </div>

              {/* Central Big QR Code */}
              <div className="bg-white p-5 rounded-2xl border-2 border-slate-200 shadow-md inline-block mx-auto">
                <QRCodeSVG
                  value={getBookingUrl(printLocation)}
                  size={200}
                  level="H"
                  includeMargin={false}
                />
              </div>

              {/* Instructions */}
              <div className="space-y-2">
                <p className="text-base sm:text-lg font-bold text-slate-900">
                  Scan to book your consultation
                </p>
                <div className="grid grid-cols-3 gap-2 text-center pt-2">
                  <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-2xs">
                    <span className="w-5 h-5 rounded-full bg-teal-100 text-teal-800 text-[11px] font-bold inline-flex items-center justify-center mb-1">
                      1
                    </span>
                    <span className="block text-[11px] font-semibold text-slate-700">Scan QR</span>
                    <span className="block text-[9px] text-slate-400">With phone camera</span>
                  </div>
                  <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-2xs">
                    <span className="w-5 h-5 rounded-full bg-teal-100 text-teal-800 text-[11px] font-bold inline-flex items-center justify-center mb-1">
                      2
                    </span>
                    <span className="block text-[11px] font-semibold text-slate-700">Choose Slot</span>
                    <span className="block text-[9px] text-slate-400">Available time</span>
                  </div>
                  <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-2xs">
                    <span className="w-5 h-5 rounded-full bg-teal-100 text-teal-800 text-[11px] font-bold inline-flex items-center justify-center mb-1">
                      3
                    </span>
                    <span className="block text-[11px] font-semibold text-slate-700">Get Live Token</span>
                    <span className="block text-[9px] text-slate-400">Instant SMS &amp; alert</span>
                  </div>
                </div>
              </div>

              {/* Clinic Location Details */}
              <div className="border-t border-slate-200 pt-3 text-[11px] text-slate-500 space-y-1">
                <p className="font-semibold text-slate-700">
                  {printLocation.addressLine}, {printLocation.locality}, {printLocation.city} - {printLocation.pincode}
                </p>
                <p className="text-teal-700 font-bold">
                  Consultation Fee: ₹{printLocation.consultationFee || doctorProfile.consultationFee || '500'}
                </p>
              </div>
            </div>

            {/* Print Buttons */}
            <div className="flex items-center justify-center gap-3 pt-2">
              <Button
                variant="primary"
                size="md"
                leftIcon={<Printer className="w-4 h-4" />}
                onClick={() => window.print()}
                className="bg-teal-600 hover:bg-teal-700 font-bold px-6"
              >
                Print Standee Now
              </Button>
              <Button
                variant="outline"
                size="md"
                onClick={() => setPrintLocation(null)}
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
