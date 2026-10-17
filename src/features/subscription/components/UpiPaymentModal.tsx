import React, { useState, useEffect } from 'react';
import {
  X,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  QrCode,
  Smartphone,
  Lock,
  ArrowRight,
  ExternalLink,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import { SubscriptionPlanConfig } from '../plans';
import { Button } from '../../../components/ui/Button';
import {
  createSubscriptionOrder,
  verifyPaymentAndCommit,
} from '../subscriptionService';
import { PaymentRecord, DoctorSubscription } from '../../../types/subscription';
import { useAuth } from '../../doctor-auth/AuthContext';

interface UpiPaymentModalProps {
  isOpen: boolean;
  plan: SubscriptionPlanConfig | null;
  onClose: () => void;
  onSuccess: (subscription: DoctorSubscription, paymentRecord: PaymentRecord) => void;
}

declare global {
  interface Window {
    Razorpay?: unknown;
  }
}

export const UpiPaymentModal: React.FC<UpiPaymentModalProps> = ({
  isOpen,
  plan,
  onClose,
  onSuccess,
}) => {
  const { user, doctorProfile } = useAuth();

  const [checkoutStep, setCheckoutStep] = useState<
    'review' | 'initiating' | 'gateway_active' | 'processing' | 'success' | 'failed'
  >('review');
  const [selectedUpiApp, setSelectedUpiApp] = useState<string>('Google Pay');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [confirmedPayment, setConfirmedPayment] = useState<PaymentRecord | null>(null);

  // Reset state when opening modal with a new plan
  useEffect(() => {
    if (isOpen) {
      setCheckoutStep('review');
      setErrorMessage(null);
      setConfirmedPayment(null);
    }
  }, [isOpen, plan]);

  if (!isOpen || !plan) return null;

  const upiProviders = [
    { name: 'Google Pay', subtitle: 'UPI / GPay app', popular: true, color: 'text-blue-600' },
    { name: 'PhonePe', subtitle: 'UPI / QR Scan', popular: true, color: 'text-purple-600' },
    { name: 'Paytm UPI', subtitle: 'Paytm Wallet / UPI', popular: false, color: 'text-sky-600' },
    { name: 'BHIM UPI', subtitle: 'Govt. NPCI UPI app', popular: false, color: 'text-emerald-700' },
    { name: 'Dynamic UPI QR', subtitle: 'Scan with any bank app', popular: true, color: 'text-slate-800' },
  ];

  // Helper to dynamically load Razorpay script
  const loadRazorpayScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleStartUpiPayment = async () => {
    if (!user?.uid) {
      setErrorMessage('Please sign in to proceed with payment.');
      return;
    }

    setCheckoutStep('initiating');
    setErrorMessage(null);

    // 1. Create authoritative order on backend
    const orderRes = await createSubscriptionOrder(user.uid, plan.id);
    if (!orderRes.success || !orderRes.order) {
      setCheckoutStep('failed');
      setErrorMessage(orderRes.error || 'Failed to initialize payment gateway order.');
      return;
    }

    const { order, keyId } = orderRes;

    // 2. Load Razorpay script
    const scriptLoaded = await loadRazorpayScript();

    // If Razorpay SDK is available and key is configured
    if (scriptLoaded && window.Razorpay && keyId && !order.isMockOrder) {
      setCheckoutStep('gateway_active');

      const options = {
        key: keyId,
        amount: order.amount,
        currency: order.currency,
        name: 'DocPulse India',
        description: `${plan.name} (${plan.accessPeriodLabel}) Practice Management`,
        order_id: order.id,
        prefill: {
          name: doctorProfile?.fullName || user.displayName || 'Doctor',
          email: user.email || '',
          contact: doctorProfile?.mobile || '',
        },
        notes: {
          doctorUid: user.uid,
          planId: plan.id,
          clinicName: doctorProfile?.clinicName || 'Clinic',
        },
        theme: {
          color: '#0d9488',
        },
        handler: async (response: {
          razorpay_payment_id: string;
          razorpay_order_id: string;
          razorpay_signature: string;
        }) => {
          setCheckoutStep('processing');
          const verifyRes = await verifyPaymentAndCommit({
            planId: plan.id,
            doctorUid: user.uid,
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
            upiApp: selectedUpiApp,
          });

          if (verifyRes.success && verifyRes.subscription && verifyRes.paymentRecord) {
            setConfirmedPayment(verifyRes.paymentRecord);
            setCheckoutStep('success');
            onSuccess(verifyRes.subscription, verifyRes.paymentRecord);
          } else {
            setCheckoutStep('failed');
            setErrorMessage(verifyRes.error || 'Payment signature verification failed.');
          }
        },
        modal: {
          ondismiss: () => {
            setCheckoutStep('review');
          },
        },
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const rzpInstance = new (window.Razorpay as any)(options);
      rzpInstance.open();
    } else {
      // Direct sandbox / test verification
      setCheckoutStep('processing');
      const fakePaymentId = `pay_mock_${Date.now()}`;
      const verifyRes = await verifyPaymentAndCommit({
        planId: plan.id,
        doctorUid: user.uid,
        razorpay_order_id: order.id,
        razorpay_payment_id: fakePaymentId,
        razorpay_signature: 'test_verified_sig',
        upiApp: selectedUpiApp,
      });

      if (verifyRes.success && verifyRes.subscription && verifyRes.paymentRecord) {
        setConfirmedPayment(verifyRes.paymentRecord);
        setCheckoutStep('success');
        onSuccess(verifyRes.subscription, verifyRes.paymentRecord);
      } else {
        setCheckoutStep('failed');
        setErrorMessage(verifyRes.error || 'Unable to confirm subscription activation.');
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-teal-600 text-white flex items-center justify-center shadow-xs">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <span>Secure UPI Payment Checkout</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">
                  256-bit Encrypted
                </span>
              </h3>
              <p className="text-xs text-slate-500">
                Official NPCI UPI &amp; Razorpay Gateway
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close checkout modal"
            className="text-slate-400 hover:text-slate-600 transition-colors p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* STEP 1: REVIEW & SELECT UPI METHOD */}
        {checkoutStep === 'review' && (
          <div className="p-6 space-y-5 text-xs">
            {/* Plan Summary Card */}
            <div className="bg-slate-900 text-white rounded-xl p-4.5 space-y-3 shadow-inner">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-teal-400 block">
                    Selected Practice Plan
                  </span>
                  <div className="text-base font-extrabold text-white mt-0.5">
                    {plan.name} ({plan.accessPeriodLabel})
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-black font-mono text-teal-300">
                    ₹{plan.totalPriceInr.toLocaleString('en-IN')}
                  </span>
                  <span className="text-[11px] text-slate-400 block">All taxes included</span>
                </div>
              </div>

              <div className="border-t border-slate-800 pt-2.5 flex items-center justify-between text-slate-300 text-[11px]">
                <span>Effective Rate: ₹{plan.effectiveMonthlyInr.toLocaleString('en-IN')}/month</span>
                {plan.discountPercent > 0 && (
                  <span className="text-amber-300 font-bold flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    {plan.discountPercent}% Savings Applied
                  </span>
                )}
              </div>
            </div>

            {/* UPI Provider Selection */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
                Select Preferred UPI Method / App
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {upiProviders.map((provider) => {
                  const isSelected = selectedUpiApp === provider.name;
                  return (
                    <button
                      key={provider.name}
                      type="button"
                      onClick={() => setSelectedUpiApp(provider.name)}
                      className={`p-3 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                        isSelected
                          ? 'border-teal-600 bg-teal-50/70 shadow-xs ring-1 ring-teal-600'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div>
                        <div className={`font-bold text-xs ${provider.color}`}>
                          {provider.name}
                        </div>
                        <div className="text-[10px] text-slate-500">{provider.subtitle}</div>
                      </div>
                      <div
                        className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                          isSelected
                            ? 'border-teal-600 bg-teal-600 text-white'
                            : 'border-slate-300'
                        }`}
                      >
                        {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Security Guarantee Notice */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-600 space-y-1 text-[11px]">
              <div className="flex items-center gap-1.5 font-bold text-slate-800">
                <Lock className="w-3.5 h-3.5 text-teal-600" />
                <span>Zero PIN Storage · PCI-DSS Compliant</span>
              </div>
              <p>
                Your UPI PIN is entered exclusively inside your bank&apos;s NPCI UPI screen. DocPulse never collects, views, or stores payment credentials.
              </p>
            </div>

            {/* Action Button */}
            <div className="pt-1">
              <Button
                variant="primary"
                size="lg"
                onClick={handleStartUpiPayment}
                className="w-full justify-center text-sm font-bold shadow-md py-3 bg-teal-600 hover:bg-teal-700"
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Pay ₹{plan.totalPriceInr.toLocaleString('en-IN')} via {selectedUpiApp}
              </Button>
            </div>
          </div>
        )}

        {/* STEP 2: INITIATING / PROCESSING */}
        {(checkoutStep === 'initiating' || checkoutStep === 'processing' || checkoutStep === 'gateway_active') && (
          <div className="p-10 text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-teal-50 text-teal-600 flex items-center justify-center mx-auto">
              <RefreshCw className="w-7 h-7 animate-spin" />
            </div>
            <div>
              <h4 className="text-base font-bold text-slate-900">
                {checkoutStep === 'processing'
                  ? 'Verifying Payment & Extending Subscription...'
                  : 'Opening UPI Payment Gateway...'}
              </h4>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Please complete the UPI authorization on your device. Do not refresh or close this browser window.
              </p>
            </div>
          </div>
        )}

        {/* STEP 3: SUCCESS CONFIRMATION */}
        {checkoutStep === 'success' && (
          <div className="p-7 text-center space-y-4 animate-in fade-in zoom-in-95">
            <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-xs">
              <CheckCircle2 className="w-8 h-8 stroke-[2.2]" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                Payment Verified Successfully
              </span>
              <h4 className="text-xl font-extrabold text-slate-900 mt-0.5">
                Subscription Activated
              </h4>
              <p className="text-xs text-slate-600 mt-1">
                Your clinic account has been renewed for <strong>{plan.accessPeriodLabel}</strong>.
              </p>
            </div>

            {confirmedPayment && (
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 text-left text-xs space-y-2 font-mono">
                <div className="flex justify-between">
                  <span className="text-slate-400">Payment ID:</span>
                  <span className="font-bold text-slate-800">{confirmedPayment.razorpayPaymentId || confirmedPayment.paymentId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Amount Paid:</span>
                  <span className="font-bold text-emerald-700">₹{confirmedPayment.amountInr.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Payment Method:</span>
                  <span className="text-slate-700">UPI ({confirmedPayment.upiApp})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Status:</span>
                  <span className="text-emerald-600 font-bold uppercase">Captured / Success</span>
                </div>
              </div>
            )}

            <Button variant="primary" size="md" onClick={onClose} className="w-full justify-center">
              Done &amp; Return to Dashboard
            </Button>
          </div>
        )}

        {/* STEP 4: FAILURE STATE */}
        {checkoutStep === 'failed' && (
          <div className="p-7 text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto shadow-xs">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-rose-700">
                Transaction Incomplete
              </span>
              <h4 className="text-lg font-bold text-slate-900 mt-0.5">
                Payment Could Not Be Completed
              </h4>
              <p className="text-xs text-slate-600 mt-1">
                {errorMessage || 'The payment was cancelled or timed out. No amount has been deducted.'}
              </p>
            </div>

            <div className="flex gap-2.5 pt-2">
              <Button variant="outline" size="md" onClick={() => setCheckoutStep('review')} className="flex-1 justify-center">
                Try Another Method
              </Button>
              <Button variant="primary" size="md" onClick={handleStartUpiPayment} className="flex-1 justify-center">
                Retry Payment
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
