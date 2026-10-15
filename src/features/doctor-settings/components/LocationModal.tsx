import React, { useState, useEffect } from 'react';
import { X, Building2, MapPin, Phone, IndianRupee, Check, AlertCircle } from 'lucide-react';
import { PracticeLocation } from '../../../types/auth';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { INDIAN_STATES, PRACTICE_TYPE_OPTIONS } from '../../doctor-registration/constants';

interface LocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (location: PracticeLocation) => void;
  initialData?: PracticeLocation | null;
  isFirstLocation?: boolean;
}

const AVAILABLE_FACILITIES = [
  'Wheelchair Accessible',
  'Air Conditioned OPD',
  'Pharmacy On-Site',
  'ECG & Vitals Desk',
  'Laboratory Sample Collection',
  'Dedicated Patient Parking',
  'Nebulization Facility',
  'Minor OT / Dressing Room',
];

export const LocationModal: React.FC<LocationModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
  isFirstLocation = false,
}) => {
  const [formData, setFormData] = useState<Partial<PracticeLocation>>({
    id: '',
    name: '',
    practiceType: 'independent_clinic',
    addressLine: '',
    locality: '',
    landmark: '',
    city: 'Mumbai',
    state: 'Maharashtra',
    pincode: '',
    phone: '',
    consultationFee: '500',
    facilities: ['Air Conditioned OPD', 'ECG & Vitals Desk'],
    isPrimary: isFirstLocation,
    isActive: true,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      setFormData({
        id: `loc_${Date.now()}`,
        name: '',
        practiceType: 'independent_clinic',
        addressLine: '',
        locality: '',
        landmark: '',
        city: 'Mumbai',
        state: 'Maharashtra',
        pincode: '',
        phone: '',
        consultationFee: '500',
        facilities: ['Air Conditioned OPD', 'ECG & Vitals Desk'],
        isPrimary: isFirstLocation,
        isActive: true,
      });
    }
    setErrors({});
  }, [initialData, isOpen, isFirstLocation]);

  if (!isOpen) return null;

  const toggleFacility = (facility: string) => {
    const current = formData.facilities || [];
    const exists = current.includes(facility);
    setFormData((prev) => ({
      ...prev,
      facilities: exists ? current.filter((f) => f !== facility) : [...current, facility],
    }));
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.name?.trim() || formData.name.trim().length < 3) {
      newErrors.name = 'Clinic name must be at least 3 characters.';
    }
    if (!formData.addressLine?.trim() || formData.addressLine.trim().length < 5) {
      newErrors.addressLine = 'Street address must be at least 5 characters.';
    }
    if (!formData.locality?.trim() || formData.locality.trim().length < 2) {
      newErrors.locality = 'Locality or area name is required.';
    }
    if (!formData.city?.trim() || formData.city.trim().length < 2) {
      newErrors.city = 'City is required.';
    }
    if (!formData.pincode || !/^[1-9][0-9]{5}$/.test(formData.pincode.trim())) {
      newErrors.pincode = 'Valid 6-digit Indian PIN code required.';
    }
    if (formData.phone && !/^[0-9+() -]{6,15}$/.test(formData.phone.trim())) {
      newErrors.phone = 'Valid telephone / mobile format required.';
    }
    if (!formData.consultationFee || parseInt(formData.consultationFee, 10) < 0) {
      newErrors.consultationFee = 'Valid consultation fee is required.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const locationToSave: PracticeLocation = {
      id: formData.id || `loc_${Date.now()}`,
      name: formData.name!.trim(),
      practiceType: formData.practiceType || 'independent_clinic',
      addressLine: formData.addressLine!.trim(),
      locality: formData.locality!.trim(),
      landmark: formData.landmark?.trim() || '',
      city: formData.city!.trim(),
      state: formData.state!.trim(),
      pincode: formData.pincode!.trim(),
      phone: formData.phone?.trim() || '',
      consultationFee: formData.consultationFee?.trim() || '500',
      facilities: formData.facilities || [],
      isPrimary: Boolean(formData.isPrimary),
      isActive: formData.isActive ?? true,
      createdAt: formData.createdAt || new Date().toISOString(),
    };

    onSave(locationToSave);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="location-modal-title"
    >
      <div className="bg-white rounded-2xl max-w-2xl w-full border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-teal-100 text-teal-800 flex items-center justify-center">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <h3 id="location-modal-title" className="text-base font-bold text-slate-900">
                {initialData ? 'Edit Practice Location' : 'Add Practice Location / Clinic'}
              </h3>
              <p className="text-xs text-slate-500">
                Independent OPD clinic or visiting consultant chamber under your doctor account
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-200/50 cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Clinic Name & Practice Type */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Input
                label="Clinic / Center Name"
                placeholder="e.g. LifeCare Wellness Clinic"
                value={formData.name || ''}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                error={errors.name}
                required
                leftIcon={<Building2 className="w-4 h-4 text-slate-400" />}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Facility Category
              </label>
              <select
                value={formData.practiceType || 'independent_clinic'}
                onChange={(e) => setFormData({ ...formData, practiceType: e.target.value })}
                className="w-full h-10 px-3 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-teal-600 text-slate-800"
              >
                {PRACTICE_TYPE_OPTIONS.map((opt) => (
                  <option key={opt.id} value={opt.id}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Street Address & Locality */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Input
                label="Street Address / Building"
                placeholder="Shop 4, Ground Floor, Sai Plaza"
                value={formData.addressLine || ''}
                onChange={(e) => setFormData({ ...formData, addressLine: e.target.value })}
                error={errors.addressLine}
                required
                leftIcon={<MapPin className="w-4 h-4 text-slate-400" />}
              />
            </div>
            <div>
              <Input
                label="Locality / Neighborhood"
                placeholder="e.g. Bandra West"
                value={formData.locality || ''}
                onChange={(e) => setFormData({ ...formData, locality: e.target.value })}
                error={errors.locality}
                required
              />
            </div>
          </div>

          {/* Landmark, City, State, Pincode */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <Input
                label="Landmark (Optional)"
                placeholder="Opp. Metro Station"
                value={formData.landmark || ''}
                onChange={(e) => setFormData({ ...formData, landmark: e.target.value })}
              />
            </div>
            <div>
              <Input
                label="City"
                placeholder="Mumbai"
                value={formData.city || ''}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                error={errors.city}
                required
              />
            </div>
            <div>
              <Input
                label="PIN Code"
                placeholder="400050"
                maxLength={6}
                value={formData.pincode || ''}
                onChange={(e) => setFormData({ ...formData, pincode: e.target.value.replace(/\D/g, '') })}
                error={errors.pincode}
                required
              />
            </div>
          </div>

          {/* State & Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">State / UT</label>
              <select
                value={formData.state || 'Maharashtra'}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                className="w-full h-10 px-3 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-teal-600 text-slate-800"
              >
                {INDIAN_STATES.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Input
                label="Reception Contact Phone"
                placeholder="022-2645-0000 or 98200XXXXX"
                value={formData.phone || ''}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                error={errors.phone}
                leftIcon={<Phone className="w-4 h-4 text-slate-400" />}
              />
            </div>
          </div>

          {/* Consultation Fee for this Location */}
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-xs font-bold text-slate-800 block">
                  OPD Consultation Fee at this Location
                </span>
                <span className="text-[11px] text-slate-500">
                  Different clinics can have location-specific consultation fees
                </span>
              </div>
              <div className="w-40">
                <Input
                  label=""
                  type="number"
                  placeholder="500"
                  value={formData.consultationFee || ''}
                  onChange={(e) => setFormData({ ...formData, consultationFee: e.target.value })}
                  error={errors.consultationFee}
                  leftIcon={<IndianRupee className="w-3.5 h-3.5 text-slate-400" />}
                />
              </div>
            </div>
          </div>

          {/* Facilities / Amenities Chips */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Available Facilities &amp; Amenities
            </label>
            <div className="flex flex-wrap gap-1.5">
              {AVAILABLE_FACILITIES.map((facility) => {
                const selected = (formData.facilities || []).includes(facility);
                return (
                  <button
                    key={facility}
                    type="button"
                    onClick={() => toggleFacility(facility)}
                    className={`text-xs px-2.5 py-1 rounded-md border font-medium transition-colors flex items-center gap-1 cursor-pointer ${
                      selected
                        ? 'bg-teal-50 border-teal-300 text-teal-800 font-semibold'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {selected && <Check className="w-3 h-3 text-teal-600" />}
                    {facility}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Primary & Active Toggles */}
          <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row gap-4">
            <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={Boolean(formData.isPrimary)}
                onChange={(e) => setFormData({ ...formData, isPrimary: e.target.checked })}
                className="rounded text-teal-600 focus:ring-teal-500 w-4 h-4"
              />
              <span className="font-medium">Set as Primary Practice Location</span>
            </label>

            <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={formData.isActive ?? true}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="rounded text-teal-600 focus:ring-teal-500 w-4 h-4"
              />
              <span className="font-medium">Active (Accepting OPD Appointments)</span>
            </label>
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <Button type="button" variant="outline" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm">
              {initialData ? 'Update Location' : 'Add Location'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
