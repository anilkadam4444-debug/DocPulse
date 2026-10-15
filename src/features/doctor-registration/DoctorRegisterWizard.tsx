import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, Check } from 'lucide-react';
import {
  RegistrationFormState,
  RegistrationStep,
  DoctorAccountData,
  ProfessionalDetailsData,
  ClinicLocationData,
  ConsultationScheduleData,
} from './types';
import { INITIAL_REGISTRATION_STATE } from './constants';
import {
  validateAccountStep,
  validateProfessionalStep,
  validateClinicLocationStep,
  validateScheduleStep,
} from './validation';
import { WizardProgress } from './WizardProgress';
import { WizardInfoSidebar } from './WizardInfoSidebar';
import { StepAccount } from './steps/StepAccount';
import { StepProfessional } from './steps/StepProfessional';
import { StepClinicLocation } from './steps/StepClinicLocation';
import { StepSchedule } from './steps/StepSchedule';
import { StepReview } from './steps/StepReview';
import { StepCompletion } from './steps/StepCompletion';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { useAuth } from '../doctor-auth/AuthContext';

export const DoctorRegisterWizard: React.FC = () => {
  const { registerDoctorAccount, retryCreateProfile } = useAuth();
  const [formData, setFormData] = useState<RegistrationFormState>(INITIAL_REGISTRATION_STATE);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [maxAccessibleStep, setMaxAccessibleStep] = useState<RegistrationStep>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const [canRetryProfile, setCanRetryProfile] = useState(false);

  const { currentStep, isCompleted } = formData;

  const updateAccount = (patch: Partial<DoctorAccountData>) => {
    setFormData((prev) => ({
      ...prev,
      account: { ...prev.account, ...patch },
    }));
    // Clear field-specific error on change
    if (Object.keys(errors).length > 0) {
      const keys = Object.keys(patch);
      setErrors((prev) => {
        const next = { ...prev };
        keys.forEach((k) => delete next[k]);
        return next;
      });
    }
  };

  const updateProfessional = (patch: Partial<ProfessionalDetailsData>) => {
    setFormData((prev) => ({
      ...prev,
      professional: { ...prev.professional, ...patch },
    }));
    if (Object.keys(errors).length > 0) {
      const keys = Object.keys(patch);
      setErrors((prev) => {
        const next = { ...prev };
        keys.forEach((k) => delete next[k]);
        return next;
      });
    }
  };

  const updateClinic = (patch: Partial<ClinicLocationData>) => {
    setFormData((prev) => ({
      ...prev,
      clinic: { ...prev.clinic, ...patch },
    }));
    if (Object.keys(errors).length > 0) {
      const keys = Object.keys(patch);
      setErrors((prev) => {
        const next = { ...prev };
        keys.forEach((k) => delete next[k]);
        return next;
      });
    }
  };

  const updateSchedule = (patch: Partial<ConsultationScheduleData>) => {
    setFormData((prev) => ({
      ...prev,
      schedule: { ...prev.schedule, ...patch },
    }));
    if (Object.keys(errors).length > 0) {
      const keys = Object.keys(patch);
      setErrors((prev) => {
        const next = { ...prev };
        keys.forEach((k) => delete next[k]);
        return next;
      });
    }
  };

  // Validates current step before allowing forward progression
  const validateCurrentStep = (): boolean => {
    let stepErrors: Record<string, string> = {};

    switch (currentStep) {
      case 1:
        stepErrors = validateAccountStep(formData.account);
        break;
      case 2:
        stepErrors = validateProfessionalStep(formData.professional);
        break;
      case 3:
        stepErrors = validateClinicLocationStep(formData.clinic);
        break;
      case 4:
        stepErrors = validateScheduleStep(formData.schedule);
        break;
      case 5:
        stepErrors = {};
        break;
    }

    setErrors(stepErrors);
    return Object.keys(stepErrors).length === 0;
  };

  const handleNext = () => {
    if (validateCurrentStep()) {
      if (currentStep < 5) {
        const nextStep = (currentStep + 1) as RegistrationStep;
        setFormData((prev) => ({ ...prev, currentStep: nextStep }));
        setMaxAccessibleStep((prev) => (Math.max(prev, nextStep) as RegistrationStep));
        window.scrollTo({ top: 120, behavior: 'smooth' });
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      const prevStep = (currentStep - 1) as RegistrationStep;
      setFormData((prev) => ({ ...prev, currentStep: prevStep }));
      setErrors({});
      window.scrollTo({ top: 120, behavior: 'smooth' });
    }
  };

  const handleJumpToStep = (step: RegistrationStep) => {
    // Only allow jumping if previous steps have been validated or already accessed
    if (step <= maxAccessibleStep) {
      setFormData((prev) => ({ ...prev, currentStep: step }));
      setErrors({});
      window.scrollTo({ top: 120, behavior: 'smooth' });
    }
  };

  const handleCompleteSetup = async () => {
    // 1. Comprehensive pre-submission validation
    const accountErrors = validateAccountStep(formData.account);
    const profErrors = validateProfessionalStep(formData.professional);
    const clinicErrors = validateClinicLocationStep(formData.clinic);
    const schedErrors = validateScheduleStep(formData.schedule);

    if (Object.keys(accountErrors).length > 0) {
      setErrors(accountErrors);
      setFormData((prev) => ({ ...prev, currentStep: 1 }));
      setSubmissionError('Please review and correct your Doctor Account details before submitting.');
      window.scrollTo({ top: 120, behavior: 'smooth' });
      return;
    }
    if (Object.keys(profErrors).length > 0) {
      setErrors(profErrors);
      setFormData((prev) => ({ ...prev, currentStep: 2 }));
      setSubmissionError('Please review and correct your Medical Professional details.');
      window.scrollTo({ top: 120, behavior: 'smooth' });
      return;
    }
    if (Object.keys(clinicErrors).length > 0) {
      setErrors(clinicErrors);
      setFormData((prev) => ({ ...prev, currentStep: 3 }));
      setSubmissionError('Please review and correct your Practice Location details.');
      window.scrollTo({ top: 120, behavior: 'smooth' });
      return;
    }
    if (Object.keys(schedErrors).length > 0) {
      setErrors(schedErrors);
      setFormData((prev) => ({ ...prev, currentStep: 4 }));
      setSubmissionError('Please review and correct your Consultation Schedule.');
      window.scrollTo({ top: 120, behavior: 'smooth' });
      return;
    }

    setIsSubmitting(true);
    setSubmissionError(null);
    setCanRetryProfile(false);

    const result = await registerDoctorAccount(
      formData.account,
      formData.professional,
      formData.clinic,
      formData.schedule
    );

    setIsSubmitting(false);

    if (result.success) {
      setFormData((prev) => ({ ...prev, isCompleted: true }));
      window.scrollTo({ top: 100, behavior: 'smooth' });
    } else {
      setSubmissionError(result.error || 'Failed to complete doctor account registration.');
      if (result.canRetryProfile) {
        setCanRetryProfile(true);
      }
      window.scrollTo({ top: 120, behavior: 'smooth' });
    }
  };

  const handleRetryProfile = async () => {
    setIsSubmitting(true);
    setSubmissionError(null);
    const result = await retryCreateProfile();
    setIsSubmitting(false);

    if (result.success) {
      setCanRetryProfile(false);
      setFormData((prev) => ({ ...prev, isCompleted: true }));
      window.scrollTo({ top: 100, behavior: 'smooth' });
    } else {
      setSubmissionError(result.error || 'Failed to save doctor profile. Please try again.');
    }
  };

  const handleReset = () => {
    setFormData(INITIAL_REGISTRATION_STATE);
    setErrors({});
    setSubmissionError(null);
    setCanRetryProfile(false);
    setMaxAccessibleStep(1);
  };

  return (
    <div className="bg-slate-50 min-h-screen py-8 sm:py-12 lg:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header Intro */}
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <span className="text-xs font-bold uppercase tracking-wider text-teal-700">
            One Doctor · One Account · Independent Tenant
          </span>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight">
            Register Your Medical Practice
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Configure your clinic profile, NMC registration, consultation duration, and live
            theoretical capacity in a straightforward 5-step wizard.
          </p>
        </div>

        {/* Progress Stepper (Always visible unless completed) */}
        {!isCompleted && (
          <div className="bg-white rounded-2xl border border-slate-200 p-3 sm:p-4 shadow-xs">
            <WizardProgress
              currentStep={currentStep}
              onStepClick={handleJumpToStep}
              maxAccessibleStep={maxAccessibleStep}
            />
          </div>
        )}

        {/* Main Content: 2-Column on Desktop, 1-Column on Mobile */}
        {isCompleted ? (
          <div className="max-w-3xl mx-auto">
            <StepCompletion
              formData={formData}
              onReset={handleReset}
              onReviewAgain={() => setFormData((prev) => ({ ...prev, isCompleted: false, currentStep: 5 }))}
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Form Wizard Column (8 cols) */}
            <div className="lg:col-span-8">
              <Card className="bg-white border-slate-200 p-5 sm:p-7 md:p-8 space-y-6 shadow-xs">
                {/* Form Step Body */}
                {currentStep === 1 && (
                  <StepAccount
                    data={formData.account}
                    errors={errors}
                    onChange={updateAccount}
                  />
                )}
                {currentStep === 2 && (
                  <StepProfessional
                    data={formData.professional}
                    errors={errors}
                    onChange={updateProfessional}
                  />
                )}
                {currentStep === 3 && (
                  <StepClinicLocation
                    data={formData.clinic}
                    errors={errors}
                    onChange={updateClinic}
                  />
                )}
                {currentStep === 4 && (
                  <StepSchedule
                    data={formData.schedule}
                    errors={errors}
                    onChange={updateSchedule}
                  />
                )}
                {currentStep === 5 && (
                  <StepReview
                    formData={formData}
                    onEditStep={handleJumpToStep}
                    onComplete={handleCompleteSetup}
                    isSubmitting={isSubmitting}
                    submissionError={submissionError}
                    canRetryProfile={canRetryProfile}
                    onRetryProfile={handleRetryProfile}
                  />
                )}

                {/* Wizard Footer Navigation Controls (Steps 1 to 4) */}
                {currentStep < 5 && (
                  <div className="pt-6 border-t border-slate-200 flex items-center justify-between gap-3">
                    {currentStep > 1 ? (
                      <Button
                        type="button"
                        variant="outline"
                        size="md"
                        onClick={handleBack}
                        leftIcon={<ArrowLeft className="w-4 h-4" />}
                      >
                        Back
                      </Button>
                    ) : (
                      <div />
                    )}

                    <Button
                      type="button"
                      variant="primary"
                      size="md"
                      onClick={handleNext}
                      rightIcon={<ArrowRight className="w-4 h-4" />}
                    >
                      Continue to Step 0{currentStep + 1}
                    </Button>
                  </div>
                )}
              </Card>
            </div>

            {/* Information Sidebar Column (4 cols) */}
            <div className="lg:col-span-4">
              <WizardInfoSidebar currentStep={currentStep} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
