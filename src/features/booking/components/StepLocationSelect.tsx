import React from 'react';
import { Building, MapPin, Phone, IndianRupee, CheckCircle2, ShieldCheck, AlertCircle } from 'lucide-react';
import { PublicDoctorProfile, PublicPracticeLocation } from '../../../types/public-doctor';

interface StepLocationSelectProps {
  doctor: PublicDoctorProfile;
  selectedLocationId: string;
  onSelectLocation: (location: PublicPracticeLocation) => void;
}

export const StepLocationSelect: React.FC<StepLocationSelectProps> = ({
  doctor,
  selectedLocationId,
  onSelectLocation,
}) => {
  const activeLocations = doctor.locations.filter((loc) => loc.isActive);

  return (
    <div className="space-y-6">
      {/* Step Header */}
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-teal-700">
          Step 1 of 5
        </span>
        <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-0.5">
          Select Practice Location
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 mt-1">
          Choose where you would like to consult Dr. {doctor.fullName}. Online appointments are
          scheduled per clinic facility.
        </p>
      </div>

      {/* Doctor Summary Banner */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-slate-900 text-sm">{doctor.fullName}</h3>
            <span className="text-[11px] font-semibold text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
              {doctor.specialization}
            </span>
          </div>
          <span className="text-slate-500 block mt-0.5">
            {doctor.qualifications} {doctor.experienceYears ? `· ${doctor.experienceYears} Years Clinical Exp.` : ''}
          </span>
        </div>
        <div className="text-left sm:text-right shrink-0">
          <span className="text-[11px] text-slate-500 block">Standard OPD Fee</span>
          <span className="text-base font-extrabold text-slate-900 font-mono">
            ₹{doctor.consultationFee}
          </span>
        </div>
      </div>

      {/* Locations Selection Cards */}
      <div className="space-y-3">
        {activeLocations.length === 0 ? (
          <div className="p-5 rounded-xl border border-rose-200 bg-rose-50 text-rose-900 text-xs flex items-center gap-2.5">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            <span>No active practice locations are currently accepting online bookings for this practitioner.</span>
          </div>
        ) : (
          activeLocations.map((loc) => {
            const isSelected = selectedLocationId === loc.id;
            const fee = loc.consultationFee || doctor.consultationFee;

            return (
              <div
                key={loc.id}
                onClick={() => onSelectLocation(loc)}
                className={`p-4 sm:p-5 rounded-xl border transition-all cursor-pointer shadow-2xs ${
                  isSelected
                    ? 'border-teal-600 bg-teal-50/20 ring-2 ring-teal-200'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                        isSelected
                          ? 'border-teal-600 bg-teal-600 text-white'
                          : 'border-slate-300 bg-white'
                      }`}
                    >
                      {isSelected && <CheckCircle2 className="w-3.5 h-3.5" />}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <strong className="text-sm font-bold text-slate-900">{loc.name}</strong>
                        {loc.isPrimary && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded font-bold bg-teal-100 text-teal-800">
                            Primary
                          </span>
                        )}
                      </div>

                      <div className="text-xs text-slate-600 mt-1 flex items-start gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                        <span>
                          {loc.addressLine}, {loc.locality}
                          {loc.landmark ? `, Near ${loc.landmark}` : ''}, {loc.city}, {loc.state} –{' '}
                          <span className="font-mono">{loc.pincode}</span>
                        </span>
                      </div>

                      {loc.phone && (
                        <div className="text-xs text-slate-600 mt-1.5 flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5 text-slate-400" />
                          <span>Clinic Reception: {loc.phone}</span>
                        </div>
                      )}

                      {loc.facilities && loc.facilities.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2.5">
                          {loc.facilities.map((fac) => (
                            <span
                              key={fac}
                              className="text-[10px] px-2 py-0.5 rounded bg-slate-50 text-slate-600 border border-slate-200"
                            >
                              {fac}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-[11px] text-slate-400 block">Consultation</span>
                    <span className="text-base font-extrabold text-slate-900 font-mono">
                      ₹{fee}
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Booking Notice */}
      <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 text-xs text-slate-600 flex items-start gap-2">
        <ShieldCheck className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
        <span>
          Online booking reserves a guaranteed token in Dr. {doctor.fullName}&apos;s OPD queue. Consultation fees are settled on-site at the clinic reception desk upon arrival.
        </span>
      </div>
    </div>
  );
};
