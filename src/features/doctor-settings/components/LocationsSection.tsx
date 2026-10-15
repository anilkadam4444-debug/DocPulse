import React, { useState } from 'react';
import {
  Building2,
  Plus,
  MapPin,
  Phone,
  IndianRupee,
  Star,
  CheckCircle2,
  PowerOff,
  Power,
  Edit2,
  Trash2,
  Info,
} from 'lucide-react';
import { PracticeLocation } from '../../../types/auth';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { LocationModal } from './LocationModal';

interface LocationsSectionProps {
  locations: PracticeLocation[];
  onUpdateLocations: (locations: PracticeLocation[]) => void;
}

export const LocationsSection: React.FC<LocationsSectionProps> = ({
  locations,
  onUpdateLocations,
}) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingLocation, setEditingLocation] = useState<PracticeLocation | null>(null);

  const handleOpenAdd = () => {
    setEditingLocation(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (loc: PracticeLocation) => {
    setEditingLocation(loc);
    setModalOpen(true);
  };

  const handleSaveLocation = (savedLocation: PracticeLocation) => {
    let updated: PracticeLocation[];

    // If marked as primary, unmark others
    if (savedLocation.isPrimary) {
      const exists = locations.some((l) => l.id === savedLocation.id);
      if (exists) {
        updated = locations.map((l) =>
          l.id === savedLocation.id ? savedLocation : { ...l, isPrimary: false }
        );
      } else {
        updated = [
          ...locations.map((l) => ({ ...l, isPrimary: false })),
          savedLocation,
        ];
      }
    } else {
      // If no other location is primary, keep this one primary
      const hasOtherPrimary = locations.some(
        (l) => l.id !== savedLocation.id && l.isPrimary
      );
      if (!hasOtherPrimary && locations.length > 0) {
        savedLocation.isPrimary = true;
      }

      const exists = locations.some((l) => l.id === savedLocation.id);
      if (exists) {
        updated = locations.map((l) => (l.id === savedLocation.id ? savedLocation : l));
      } else {
        updated = [...locations, savedLocation];
      }
    }

    onUpdateLocations(updated);
  };

  const handleSetPrimary = (id: string) => {
    const updated = locations.map((loc) => ({
      ...loc,
      isPrimary: loc.id === id,
    }));
    onUpdateLocations(updated);
  };

  const handleToggleActive = (id: string) => {
    const updated = locations.map((loc) => {
      if (loc.id === id) {
        return { ...loc, isActive: !loc.isActive };
      }
      return loc;
    });
    onUpdateLocations(updated);
  };

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-teal-600" />
            Practice Locations &amp; Clinics ({locations.length})
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage multiple consultation clinics, hospital chambers, or polyclinics under your doctor tenant.
          </p>
        </div>
        <Button
          type="button"
          variant="primary"
          size="sm"
          onClick={handleOpenAdd}
          leftIcon={<Plus className="w-4 h-4" />}
        >
          Add Clinic Location
        </Button>
      </div>

      {/* Tenancy Explanation Card */}
      <div className="bg-sky-50 border border-sky-200 rounded-xl p-3.5 text-xs text-sky-900 flex items-start gap-2.5">
        <Info className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong>Unified Doctor Tenant Architecture:</strong> Each practice location shares your
          master patient database, medical records, and council credentials, but maintains its own
          reception contact, consultation fee, and active OPD status. Deactivating a location
          preserves all historical appointment logs and audit records.
        </p>
      </div>

      {/* Locations List */}
      <div className="space-y-4">
        {locations.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-dashed border-slate-300 p-6 space-y-3">
            <Building2 className="w-10 h-10 text-slate-300 mx-auto" />
            <h3 className="text-sm font-semibold text-slate-700">No practice locations added yet</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Add your primary clinic or visiting hospital chamber to start receiving patient bookings.
            </p>
            <Button variant="primary" size="sm" onClick={handleOpenAdd} leftIcon={<Plus className="w-4 h-4" />}>
              Add Primary Location
            </Button>
          </div>
        ) : (
          locations.map((loc) => (
            <div
              key={loc.id}
              className={`bg-white rounded-xl border p-5 transition-all shadow-2xs ${
                loc.isPrimary
                  ? 'border-teal-300 ring-1 ring-teal-200/50'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                {/* Location Info */}
                <div className="space-y-2 max-w-xl">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-base font-bold text-slate-900">{loc.name}</h3>
                    {loc.isPrimary && (
                      <span className="px-2 py-0.5 rounded-full bg-teal-100 text-teal-800 text-[11px] font-bold flex items-center gap-1">
                        <Star className="w-3 h-3 fill-teal-700 text-teal-700" />
                        Primary Location
                      </span>
                    )}
                    <span
                      className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                        loc.isActive
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-slate-100 text-slate-500 border border-slate-200'
                      }`}
                    >
                      {loc.isActive ? 'Active for OPD' : 'Deactivated / Inactive'}
                    </span>
                    <span className="text-xs text-slate-400 capitalize">
                      · {loc.practiceType?.replace(/_/g, ' ')}
                    </span>
                  </div>

                  {/* Address */}
                  <div className="flex items-start gap-1.5 text-xs text-slate-600">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                    <span>
                      {loc.addressLine}, {loc.locality}
                      {loc.landmark ? `, Near ${loc.landmark}` : ''}, {loc.city}, {loc.state} –{' '}
                      <strong className="font-mono text-slate-800">{loc.pincode}</strong>
                    </span>
                  </div>

                  {/* Phone & Fee */}
                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 pt-1">
                    {loc.phone && (
                      <div className="flex items-center gap-1 text-slate-700">
                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                        <span>Reception: {loc.phone}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1 font-semibold text-teal-800 bg-teal-50 px-2.5 py-0.5 rounded border border-teal-200/60">
                      <IndianRupee className="w-3 h-3 text-teal-600" />
                      <span>Fee: ₹{loc.consultationFee || '500'}</span>
                    </div>
                  </div>

                  {/* Facilities Chips */}
                  {loc.facilities && loc.facilities.length > 0 && (
                    <div className="flex flex-wrap gap-1 pt-1.5">
                      {loc.facilities.map((fac) => (
                        <span
                          key={fac}
                          className="text-[11px] px-2 py-0.5 rounded bg-slate-50 text-slate-600 border border-slate-200"
                        >
                          {fac}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Location Action Buttons */}
                <div className="flex flex-wrap md:flex-col items-end gap-2 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100">
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenEdit(loc)}
                      leftIcon={<Edit2 className="w-3.5 h-3.5" />}
                    >
                      Edit
                    </Button>

                    {!loc.isPrimary && (
                      <button
                        type="button"
                        onClick={() => handleSetPrimary(loc.id)}
                        className="text-xs text-teal-700 hover:text-teal-900 font-semibold px-2 py-1.5 rounded hover:bg-teal-50 transition-colors cursor-pointer"
                      >
                        Set as Primary
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleToggleActive(loc.id)}
                      className={`text-xs px-2.5 py-1.5 rounded border transition-colors flex items-center gap-1 cursor-pointer font-medium ${
                        loc.isActive
                          ? 'border-amber-200 text-amber-800 hover:bg-amber-50'
                          : 'border-emerald-200 text-emerald-700 hover:bg-emerald-50'
                      }`}
                    >
                      {loc.isActive ? (
                        <>
                          <PowerOff className="w-3.5 h-3.5" /> Deactivate
                        </>
                      ) : (
                        <>
                          <Power className="w-3.5 h-3.5" /> Activate
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal Dialog */}
      <LocationModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSaveLocation}
        initialData={editingLocation}
        isFirstLocation={locations.length === 0}
      />
    </div>
  );
};
