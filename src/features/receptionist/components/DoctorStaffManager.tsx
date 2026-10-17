import React, { useState, useEffect } from 'react';
import {
  Users,
  UserPlus,
  Shield,
  ShieldCheck,
  Building,
  Key,
  Mail,
  Phone,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  ExternalLink,
  Lock,
  RefreshCw,
} from 'lucide-react';
import { DoctorTenantProfile, PracticeLocation } from '../../../types/auth';
import { ReceptionistAccount } from '../types';
import {
  getDoctorReceptionists,
  saveReceptionistAccount,
  deleteReceptionistAccount,
} from '../receptionistService';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';

interface DoctorStaffManagerProps {
  doctorProfile: DoctorTenantProfile;
  locations: PracticeLocation[];
}

export const DoctorStaffManager: React.FC<DoctorStaffManagerProps> = ({
  doctorProfile,
  locations,
}) => {
  const [receptionists, setReceptionists] = useState<ReceptionistAccount[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showPasscodeId, setShowPasscodeId] = useState<string | null>(null);

  // Form State
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [passcode, setPasscode] = useState('');
  const [selectedLocationIds, setSelectedLocationIds] = useState<string[]>(
    locations.map((l) => l.id)
  );

  const fetchStaff = async () => {
    setIsLoading(true);
    const list = await getDoctorReceptionists(doctorProfile.uid);
    setReceptionists(list);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchStaff();
  }, [doctorProfile.uid]);

  const handleOpenAddModal = () => {
    setFullName('');
    setEmail('');
    setPhone('');
    // Auto-generate a friendly 6-digit PIN
    setPasscode(Math.floor(100000 + Math.random() * 900000).toString());
    setSelectedLocationIds(locations.map((l) => l.id));
    setErrorMessage(null);
    setIsModalOpen(true);
  };

  const handleToggleLocation = (locId: string) => {
    setSelectedLocationIds((prev) =>
      prev.includes(locId) ? prev.filter((id) => id !== locId) : [...prev, locId]
    );
  };

  const handleSubmitNewStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !email.trim() || !phone.trim() || !passcode.trim()) {
      setErrorMessage('Please complete all required fields.');
      return;
    }

    if (selectedLocationIds.length === 0) {
      setErrorMessage('Please assign at least one clinic location to this receptionist.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    const res = await saveReceptionistAccount(doctorProfile, {
      fullName,
      email,
      phone,
      assignedLocationIds: selectedLocationIds,
      passcode,
      status: 'active',
    });

    setIsSubmitting(false);

    if (res.success && res.account) {
      setIsModalOpen(false);
      setToastMessage(`Receptionist account created for ${res.account.fullName}! They can now log in at /reception/login.`);
      setTimeout(() => setToastMessage(null), 4500);
      fetchStaff();
    } else {
      setErrorMessage(res.error || 'Failed to create receptionist account.');
    }
  };

  const handleDeleteStaff = async (staff: ReceptionistAccount) => {
    if (!window.confirm(`Are you sure you want to remove ${staff.fullName} as a receptionist?`)) {
      return;
    }

    const res = await deleteReceptionistAccount(doctorProfile.uid, staff.id, staff.email);
    if (res.success) {
      setToastMessage(`Removed ${staff.fullName} from clinic staff.`);
      setTimeout(() => setToastMessage(null), 3500);
      fetchStaff();
    } else {
      alert(`Error removing staff: ${res.error}`);
    }
  };

  const handleToggleStatus = async (staff: ReceptionistAccount) => {
    const nextStatus = staff.status === 'active' ? 'suspended' : 'active';
    const res = await saveReceptionistAccount(doctorProfile, {
      id: staff.id,
      fullName: staff.fullName,
      email: staff.email,
      phone: staff.phone,
      assignedLocationIds: staff.assignedLocationIds,
      passcode: staff.passcode,
      status: nextStatus,
    });

    if (res.success) {
      setToastMessage(`${staff.fullName} is now ${nextStatus === 'active' ? 'Active' : 'Suspended'}.`);
      setTimeout(() => setToastMessage(null), 3500);
      fetchStaff();
    }
  };

  return (
    <div className="space-y-6">
      {/* Overview Banner */}
      <div className="bg-gradient-to-r from-slate-900 to-teal-950 text-white rounded-2xl p-6 sm:p-7 shadow-sm border border-slate-800 relative overflow-hidden">
        <div className="max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-900/60 text-teal-300 text-xs font-semibold border border-teal-700/50">
            <Shield className="w-3.5 h-3.5" />
            <span>Clinic Staff &amp; Receptionist Access Control</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
            Receptionist Workflow &amp; Desk Walk-In Queue Management
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Authorize your clinic front-desk receptionists with individual, secure login accounts.
            Receptionists can register walk-in patients into the live token sequence, check in arriving online and QR patients, and manage the waiting room—strictly isolated from your billing, credentials, and financial settings.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <Button
              variant="primary"
              size="sm"
              leftIcon={<UserPlus className="w-4 h-4" />}
              onClick={handleOpenAddModal}
              className="bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs"
            >
              + Add Receptionist Account
            </Button>
            <a
              href="/reception/login"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-teal-300 text-xs font-semibold border border-slate-700"
            >
              <span>Receptionist Portal (/reception/login)</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>

      {/* Global Toast */}
      {toastMessage && (
        <div className="p-3.5 rounded-xl bg-teal-50 border border-teal-200 text-teal-900 text-xs flex items-center justify-between shadow-2xs">
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

      {/* Permissions Matrix Info Card */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
        <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-200/80 text-emerald-950 space-y-1.5">
          <span className="font-bold flex items-center gap-1.5 text-emerald-800">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            Receptionist Authorized Actions
          </span>
          <ul className="list-disc list-inside space-y-1 text-emerald-900/90 pl-1">
            <li>Register walk-in patients into the live daily queue with instant token slips</li>
            <li>Check in arriving patients who booked via Online Portal or Clinic QR</li>
            <li>Call next patient to OPD and track waiting room statuses</li>
            <li>Print patient token receipts and manage clinic counter queue</li>
          </ul>
        </div>

        <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-200/80 text-amber-950 space-y-1.5">
          <span className="font-bold flex items-center gap-1.5 text-amber-800">
            <Lock className="w-4 h-4 text-amber-600" />
            Strict Tenant Isolation Guardrails
          </span>
          <ul className="list-disc list-inside space-y-1 text-amber-900/90 pl-1">
            <li>Cannot access doctor billing, subscription plans, or Razorpay accounts</li>
            <li>Cannot modify doctor medical credentials, council registrations, or profile</li>
            <li>Cannot access appointments of other clinics or doctors</li>
            <li>Strictly restricted to the specific practice locations you assign</li>
          </ul>
        </div>
      </div>

      {/* Staff List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
            <Users className="w-4 h-4 text-teal-600" />
            <span>Authorized Clinic Receptionists ({receptionists.length})</span>
          </h3>
          <Button
            variant="outline"
            size="sm"
            leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />}
            onClick={fetchStaff}
            className="text-xs"
          >
            Refresh List
          </Button>
        </div>

        {isLoading ? (
          <div className="bg-white rounded-2xl p-8 border border-slate-200 text-center text-xs text-slate-400 animate-pulse">
            Loading authorized receptionist staff accounts...
          </div>
        ) : receptionists.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 border border-slate-200 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-teal-50 text-teal-600 flex items-center justify-center mx-auto">
              <Users className="w-6 h-6" />
            </div>
            <p className="text-sm font-bold text-slate-800">No Receptionist Accounts Yet</p>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Create an account for your front desk staff so they can register walk-ins and manage the live queue from their counter.
            </p>
            <Button
              variant="primary"
              size="sm"
              leftIcon={<UserPlus className="w-3.5 h-3.5" />}
              onClick={handleOpenAddModal}
              className="bg-teal-600 hover:bg-teal-700 text-xs"
            >
              Add First Receptionist
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {receptionists.map((staff) => {
              const isPasscodeShown = showPasscodeId === staff.id;
              const isActive = staff.status === 'active';

              return (
                <Card
                  key={staff.id}
                  className={`p-5 rounded-2xl border transition-all ${
                    isActive ? 'bg-white border-slate-200 shadow-2xs' : 'bg-slate-50 border-dashed border-slate-300'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-100">
                    <div className="space-y-0.5">
                      <span className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                        {staff.fullName}
                      </span>
                      <p className="text-xs text-slate-500 flex items-center gap-2">
                        <Mail className="w-3.5 h-3.5 text-slate-400" />
                        <span>{staff.email}</span>
                      </p>
                      <p className="text-xs text-slate-500 flex items-center gap-2">
                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                        <span>{staff.phone}</span>
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleToggleStatus(staff)}
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold border cursor-pointer ${
                        isActive
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                          : 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
                      }`}
                      title="Click to toggle active/suspended"
                    >
                      {isActive ? 'Active' : 'Suspended'}
                    </button>
                  </div>

                  {/* Assigned Locations */}
                  <div className="py-3 space-y-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Assigned Clinic Locations
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {staff.assignedLocationNames.map((name, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded-md text-[11px] bg-slate-100 text-slate-700 border border-slate-200 font-medium flex items-center gap-1"
                        >
                          <Building className="w-3 h-3 text-teal-600" />
                          {name}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Credentials & Actions */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="text-slate-500 font-medium text-[11px]">Passcode:</span>
                      <span className="font-mono font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                        {isPasscodeShown ? staff.passcode : '••••••'}
                      </span>
                      <button
                        type="button"
                        onClick={() => setShowPasscodeId(isPasscodeShown ? null : staff.id)}
                        className="text-slate-400 hover:text-slate-600 cursor-pointer"
                        title={isPasscodeShown ? 'Hide Passcode' : 'Show Passcode'}
                      >
                        {isPasscodeShown ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleDeleteStaff(staff)}
                        className="text-rose-500 hover:text-rose-700 p-1.5 rounded-lg hover:bg-rose-50 cursor-pointer transition-colors"
                        title="Remove Receptionist"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Add Staff Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-slate-200 relative my-8 animate-fade-in space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-teal-50 text-teal-600 flex items-center justify-center">
                  <UserPlus className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-slate-900">Add Receptionist Staff</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            {errorMessage && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmitNewStaff} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Pooja Sharma"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-teal-500 text-xs"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Login Email <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="pooja.desk@clinic.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-teal-500 text-xs"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Mobile Number <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    placeholder="9876543210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-teal-500 text-xs font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Access Passcode (6-Digit PIN) <span className="text-rose-500">*</span>
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    required
                    maxLength={8}
                    placeholder="123456"
                    value={passcode}
                    onChange={(e) => setPasscode(e.target.value)}
                    className="flex-1 px-3 py-2 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-teal-500 text-xs font-mono font-bold tracking-wider"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setPasscode(Math.floor(100000 + Math.random() * 900000).toString())}
                    className="text-xs shrink-0"
                  >
                    Generate PIN
                  </Button>
                </div>
                <span className="text-[10px] text-slate-400 block mt-1">
                  The receptionist will use this email and passcode at /reception/login.
                </span>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">
                  Assigned Practice Locations <span className="text-rose-500">*</span>
                </label>
                <div className="space-y-1.5 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                  {locations.map((loc) => {
                    const isChecked = selectedLocationIds.includes(loc.id);
                    return (
                      <label
                        key={loc.id}
                        className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-white cursor-pointer select-none text-xs"
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleToggleLocation(loc.id)}
                          className="w-4 h-4 rounded text-teal-600 focus:ring-teal-500"
                        />
                        <span className="font-semibold text-slate-800">
                          {loc.name || loc.clinicName || 'Clinic'}
                        </span>
                        <span className="text-slate-400 text-[11px]">
                          ({loc.locality}, {loc.city})
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  isLoading={isSubmitting}
                  className="bg-teal-600 hover:bg-teal-700 text-white font-bold"
                >
                  Create Receptionist Account
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
