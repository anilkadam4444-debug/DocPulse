import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  User,
  Building2,
  Clock,
  IndianRupee,
  Sliders,
  CheckCircle2,
  Save,
  ArrowLeft,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  ShieldCheck,
  Building,
} from 'lucide-react';
import { useAuth } from '../doctor-auth/AuthContext';
import { DoctorSettingsFormState, SettingsTabId } from './types';
import { ProfileSection } from './components/ProfileSection';
import { LocationsSection } from './components/LocationsSection';
import { ConsultationSection } from './components/ConsultationSection';
import { ScheduleSection } from './components/ScheduleSection';
import { PreferencesSection } from './components/PreferencesSection';
import { ReviewSaveSection } from './components/ReviewSaveSection';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { PracticeLocation } from '../../types/auth';

const TABS: { id: SettingsTabId; label: string; icon: React.ElementType }[] = [
  { id: 'profile', label: '1. Professional Profile', icon: User },
  { id: 'locations', label: '2. Practice Locations', icon: Building2 },
  { id: 'consultation', label: '3. Consultation Settings', icon: IndianRupee },
  { id: 'schedule', label: '4. Working Hours & Breaks', icon: Clock },
  { id: 'preferences', label: '5. Booking Preferences', icon: Sliders },
  { id: 'review', label: '6. Review & Save', icon: CheckCircle2 },
];

export const DoctorSettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, doctorProfile, updateDoctorProfile, isProfileLoading } = useAuth();

  const [activeTab, setActiveTab] = useState<SettingsTabId>('profile');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Compute baseline state from doctorProfile
  const initialFormState: DoctorSettingsFormState = useMemo(() => {
    // If doctor has locations array, use it; otherwise create initial primary location from top-level fields
    let initialLocations: PracticeLocation[] = [];
    if (doctorProfile?.locations && doctorProfile.locations.length > 0) {
      initialLocations = doctorProfile.locations;
    } else if (doctorProfile) {
      initialLocations = [
        {
          id: `loc_${doctorProfile.uid.slice(0, 8)}`,
          name: doctorProfile.clinicName || 'Primary Family Clinic',
          practiceType: doctorProfile.practiceType || 'independent_clinic',
          addressLine: doctorProfile.addressLine || '',
          locality: doctorProfile.locality || '',
          landmark: doctorProfile.landmark || '',
          city: doctorProfile.city || 'Mumbai',
          state: doctorProfile.state || 'Maharashtra',
          pincode: doctorProfile.pincode || '400050',
          phone: doctorProfile.clinicPhone || '',
          consultationFee: doctorProfile.consultationFee || '500',
          facilities: ['Air Conditioned OPD', 'ECG & Vitals Desk'],
          isPrimary: true,
          isActive: true,
          createdAt: new Date().toISOString(),
        },
      ];
    }

    return {
      fullName: doctorProfile?.fullName || user?.displayName || '',
      email: doctorProfile?.email || user?.email || '',
      mobile: doctorProfile?.mobile || '',
      qualifications: doctorProfile?.qualifications || 'MBBS, MD',
      specialization: doctorProfile?.specialization || 'General Physician',
      customSpecialization: doctorProfile?.customSpecialization || '',
      registrationCouncil:
        doctorProfile?.registrationCouncil || 'National Medical Commission (NMC)',
      registrationNumber: doctorProfile?.registrationNumber || '',
      experienceYears: doctorProfile?.experienceYears || '',
      languages: doctorProfile?.languages
        ? doctorProfile.languages.split(',').map((l) => l.trim()).filter(Boolean)
        : ['English', 'Hindi'],
      bio: doctorProfile?.bio || '',

      locations: initialLocations,

      consultation: {
        defaultFee: doctorProfile?.consultationSettings?.defaultFee || doctorProfile?.consultationFee || '500',
        followUpFee: doctorProfile?.consultationSettings?.followUpFee || doctorProfile?.followUpFee || '0',
        followUpDays: doctorProfile?.consultationSettings?.followUpDays || doctorProfile?.followUpDays || 7,
        avgDurationMinutes:
          doctorProfile?.consultationSettings?.avgDurationMinutes ||
          doctorProfile?.avgDurationMinutes ||
          15,
        inPersonEnabled: doctorProfile?.consultationSettings?.inPersonEnabled ?? true,
        videoConsultationEnabled:
          doctorProfile?.consultationSettings?.videoConsultationEnabled ?? false,
        emergencyReserveSlots: doctorProfile?.consultationSettings?.emergencyReserveSlots ?? 2,
      },

      schedule: {
        avgDurationMinutes: doctorProfile?.schedule?.avgDurationMinutes || 15,
        workingDays: doctorProfile?.schedule?.workingDays || ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
        session1: doctorProfile?.schedule?.session1 || {
          openTime: '09:00',
          closeTime: '13:00',
          hasBreak: false,
          breakStart: '11:00',
          breakEnd: '11:30',
        },
        hasSession2: doctorProfile?.schedule?.hasSession2 ?? true,
        session2: doctorProfile?.schedule?.session2 || {
          openTime: '17:00',
          closeTime: '20:30',
          hasBreak: false,
          breakStart: '18:30',
          breakEnd: '19:00',
        },
        acceptsWalkIns: doctorProfile?.schedule?.acceptsWalkIns ?? true,
      },

      preferences: {
        dailyTokenLimit: doctorProfile?.bookingPreferences?.dailyTokenLimit || 30,
        walkInQREnabled: doctorProfile?.bookingPreferences?.walkInQREnabled ?? true,
        whatsAppAlertThreshold: doctorProfile?.bookingPreferences?.whatsAppAlertThreshold || 3,
        advanceBookingDays: doctorProfile?.bookingPreferences?.advanceBookingDays || 7,
        cancellationNoticeHours: doctorProfile?.bookingPreferences?.cancellationNoticeHours || 2,
        autoConfirmOnline: doctorProfile?.bookingPreferences?.autoConfirmOnline ?? true,
      },
    };
  }, [doctorProfile, user]);

  const [formData, setFormData] = useState<DoctorSettingsFormState>(initialFormState);

  // Sync when initialFormState changes (e.g. after refresh)
  useEffect(() => {
    setFormData(initialFormState);
  }, [initialFormState]);

  // Compute dirty flag
  const isDirty = useMemo(() => {
    return JSON.stringify(formData) !== JSON.stringify(initialFormState);
  }, [formData, initialFormState]);

  const handleReset = () => {
    setFormData(initialFormState);
    setErrorMessage(null);
    setSaveSuccess(false);
  };

  const handleSave = async () => {
    setIsSaving(true);
    setErrorMessage(null);
    setSaveSuccess(false);

    try {
      // Find primary location to keep top-level fields synced
      const primaryLoc = formData.locations.find((l) => l.isPrimary) || formData.locations[0];

      const updates = {
        fullName: formData.fullName.trim(),
        qualifications: formData.qualifications.trim(),
        specialization: formData.specialization.trim(),
        customSpecialization: formData.customSpecialization?.trim() || '',
        registrationCouncil: formData.registrationCouncil.trim(),
        registrationNumber: formData.registrationNumber.trim(),
        experienceYears: formData.experienceYears?.trim() || '',
        languages: formData.languages.join(', '),
        bio: formData.bio?.trim() || '',

        // Synced primary clinic fields for backward compatibility
        clinicName: primaryLoc ? primaryLoc.name : formData.locations[0]?.name || 'Clinic',
        practiceType: primaryLoc ? primaryLoc.practiceType || 'independent_clinic' : 'independent_clinic',
        city: primaryLoc ? primaryLoc.city : 'Mumbai',
        state: primaryLoc ? primaryLoc.state : 'Maharashtra',
        locality: primaryLoc ? primaryLoc.locality : '',
        addressLine: primaryLoc ? primaryLoc.addressLine : '',
        landmark: primaryLoc ? primaryLoc.landmark || '' : '',
        pincode: primaryLoc ? primaryLoc.pincode : '400050',
        clinicPhone: primaryLoc ? primaryLoc.phone || '' : '',
        consultationFee: formData.consultation.defaultFee,
        followUpFee: formData.consultation.followUpFee,
        followUpDays: formData.consultation.followUpDays,
        avgDurationMinutes: formData.consultation.avgDurationMinutes,

        // Complex structures
        locations: formData.locations,
        consultationSettings: formData.consultation,
        schedule: {
          ...formData.schedule,
          avgDurationMinutes: formData.consultation.avgDurationMinutes,
        },
        bookingPreferences: formData.preferences,
      };

      const result = await updateDoctorProfile(updates);

      if (result.success) {
        setSaveSuccess(true);
        window.scrollTo({ top: 80, behavior: 'smooth' });
        setTimeout(() => setSaveSuccess(false), 5000);
      } else {
        setErrorMessage(result.error || 'Failed to save practice settings.');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setErrorMessage(msg);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen py-8 lg:py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Top Sticky Bar when Unsaved Changes exist */}
        {isDirty && (
          <div className="sticky top-18 z-30 bg-amber-500 text-slate-950 px-4 py-2.5 rounded-xl shadow-md border border-amber-600 flex items-center justify-between gap-3 animate-in fade-in slide-in-from-top-2 duration-150">
            <div className="flex items-center gap-2 text-xs font-bold">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>You have unsaved changes in your practice settings.</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleReset}
                disabled={isSaving}
                className="text-xs font-semibold px-2.5 py-1 rounded bg-amber-600/30 hover:bg-amber-600/50 text-slate-950 transition-colors cursor-pointer"
              >
                Discard
              </button>
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={handleSave}
                isLoading={isSaving}
                className="bg-slate-900 hover:bg-slate-800 text-white shadow-xs"
              >
                Save Changes
              </Button>
            </div>
          </div>
        )}

        {/* Doctor Header Banner */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 md:p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Link
                to="/doctor/dashboard"
                className="inline-flex items-center gap-1 text-xs font-semibold text-teal-700 hover:text-teal-900 hover:underline"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Back to OPD Consultation Console
              </Link>
              <span className="text-slate-300">·</span>
              <span className="text-xs text-slate-500 font-mono">UID: {user?.uid?.slice(0, 10)}...</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2">
              <span>Doctor Practice Settings</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-teal-100 text-teal-800 font-semibold">
                Multi-Tenant Console
              </span>
            </h1>
            <p className="text-xs text-slate-500">
              Manage verified medical profile, multiple clinic locations, consultation fees, and schedule buffers.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Button
              type="button"
              variant="primary"
              size="md"
              onClick={handleSave}
              isLoading={isSaving}
              leftIcon={<Save className="w-4 h-4" />}
            >
              Save All Settings
            </Button>
          </div>
        </div>

        {/* Alert Notifications */}
        {saveSuccess && (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <div>
              <strong className="block font-bold">Practice Settings Saved Successfully!</strong>
              <span>
                All updates have been committed to your doctor profile and clinic network.
              </span>
            </div>
          </div>
        )}

        {errorMessage && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-xs flex items-center gap-2.5">
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
            <div>
              <strong className="block font-bold">Save Failed</strong>
              <span>{errorMessage}</span>
            </div>
          </div>
        )}

        {/* Main 2-Column Settings Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Navigation Tabs (4 cols) */}
          <div className="lg:col-span-4 space-y-3">
            <Card className="bg-white border-slate-200 p-2 sm:p-3 shadow-xs space-y-1">
              {TABS.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-left transition-all cursor-pointer ${
                      isActive
                        ? 'bg-teal-600 text-white shadow-xs'
                        : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                    <span className="truncate">{tab.label}</span>
                  </button>
                );
              })}
            </Card>

            {/* Quick Practice Summary Card */}
            <div className="bg-white rounded-2xl border border-slate-200 p-4 text-xs space-y-2.5 shadow-xs">
              <span className="font-bold text-slate-800 block text-[11px] uppercase tracking-wider text-slate-400">
                Practice Snapshot
              </span>
              <div className="flex justify-between border-b border-slate-100 pb-1.5">
                <span className="text-slate-500">Clinics Configured:</span>
                <strong className="text-slate-900 font-mono">{formData.locations.length}</strong>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-1.5">
                <span className="text-slate-500">Standard OPD Fee:</span>
                <strong className="text-teal-700 font-bold">₹{formData.consultation.defaultFee}</strong>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-1.5">
                <span className="text-slate-500">Slot Duration:</span>
                <strong className="text-slate-900">{formData.consultation.avgDurationMinutes} mins</strong>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-1.5">
                <span className="text-slate-500">Working Days:</span>
                <strong className="text-slate-900">{formData.schedule.workingDays.length} days/wk</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Council Status:</span>
                <span className="text-amber-600 font-semibold">Under Review</span>
              </div>
            </div>
          </div>

          {/* Right Column: Tab Content Body (8 cols) */}
          <div className="lg:col-span-8">
            <Card className="bg-white border-slate-200 p-5 sm:p-7 shadow-xs">
              {activeTab === 'profile' && (
                <ProfileSection
                  formData={formData}
                  onChange={(updates) => setFormData((prev) => ({ ...prev, ...updates }))}
                  credentialsVerified={doctorProfile?.credentialsVerified ?? false}
                  userEmail={user?.email || undefined}
                  userUid={user?.uid || undefined}
                />
              )}

              {activeTab === 'locations' && (
                <LocationsSection
                  locations={formData.locations}
                  onUpdateLocations={(locs) => setFormData((prev) => ({ ...prev, locations: locs }))}
                />
              )}

              {activeTab === 'consultation' && (
                <ConsultationSection
                  settings={formData.consultation}
                  onChange={(settings) =>
                    setFormData((prev) => ({ ...prev, consultation: settings }))
                  }
                />
              )}

              {activeTab === 'schedule' && (
                <ScheduleSection
                  schedule={formData.schedule}
                  onChange={(sched) => setFormData((prev) => ({ ...prev, schedule: sched }))}
                />
              )}

              {activeTab === 'preferences' && (
                <PreferencesSection
                  preferences={formData.preferences}
                  onChange={(pref) => setFormData((prev) => ({ ...prev, preferences: pref }))}
                />
              )}

              {activeTab === 'review' && (
                <ReviewSaveSection
                  formData={formData}
                  doctorUid={doctorProfile?.uid}
                  isDirty={isDirty}
                  isSaving={isSaving}
                  saveSuccess={saveSuccess}
                  errorMessage={errorMessage}
                  onSave={handleSave}
                  onReset={handleReset}
                  onNavigateTab={(tab) => setActiveTab(tab)}
                />
              )}

              {/* Bottom Navigation buttons */}
              <div className="pt-6 border-t border-slate-200 mt-8 flex items-center justify-between">
                {activeTab !== 'profile' ? (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const idx = TABS.findIndex((t) => t.id === activeTab);
                      if (idx > 0) setActiveTab(TABS[idx - 1].id);
                    }}
                  >
                    Previous Section
                  </Button>
                ) : (
                  <div />
                )}

                {activeTab !== 'review' ? (
                  <Button
                    type="button"
                    variant="primary"
                    size="sm"
                    onClick={() => {
                      const idx = TABS.findIndex((t) => t.id === activeTab);
                      if (idx < TABS.length - 1) setActiveTab(TABS[idx + 1].id);
                    }}
                  >
                    Next Section
                  </Button>
                ) : (
                  <Button
                    type="button"
                    variant="primary"
                    size="sm"
                    onClick={handleSave}
                    isLoading={isSaving}
                    leftIcon={<Save className="w-4 h-4" />}
                  >
                    Save Practice Settings
                  </Button>
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};
