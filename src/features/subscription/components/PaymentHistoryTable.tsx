import React from 'react';
import { CreditCard, CheckCircle2, Clock, AlertTriangle, Download, Receipt } from 'lucide-react';
import { PaymentRecord } from '../../../types/subscription';
import { SUBSCRIPTION_PLANS } from '../plans';

interface PaymentHistoryTableProps {
  payments: PaymentRecord[];
  isLoading?: boolean;
}

export const PaymentHistoryTable: React.FC<PaymentHistoryTableProps> = ({
  payments,
  isLoading = false,
}) => {
  if (isLoading) {
    return (
      <div className="p-8 text-center text-xs text-slate-400 animate-pulse">
        Loading payment transaction history from Firestore...
      </div>
    );
  }

  if (payments.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-8 sm:p-10 text-center space-y-2">
        <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
          <Receipt className="w-5 h-5" />
        </div>
        <h4 className="text-sm font-bold text-slate-800">No Payment Transactions Recorded Yet</h4>
        <p className="text-xs text-slate-500 max-w-sm mx-auto">
          You are currently enjoying the 1-month free trial. When you renew or upgrade to a paid plan via UPI, your official payment receipts will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 text-slate-600 uppercase tracking-wider font-semibold border-b border-slate-200">
            <tr>
              <th className="py-3.5 px-4">Receipt / Date</th>
              <th className="py-3.5 px-4">Subscription Plan</th>
              <th className="py-3.5 px-4">Payment Method</th>
              <th className="py-3.5 px-4">Amount (INR)</th>
              <th className="py-3.5 px-4">Gateway Ref</th>
              <th className="py-3.5 px-4 text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {payments.map((pay) => {
              const plan = SUBSCRIPTION_PLANS[pay.planId];
              const formattedDate = new Date(pay.paidAt || pay.createdAt).toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              });

              return (
                <tr key={pay.paymentId} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-4 font-mono">
                    <div className="font-bold text-slate-900">{pay.receiptNumber || pay.paymentId}</div>
                    <div className="text-[11px] text-slate-400 font-sans">{formattedDate}</div>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-slate-900">{plan?.name || pay.planId}</div>
                    <div className="text-[11px] text-slate-500">{plan?.accessPeriodLabel || 'Prepaid'}</div>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-medium text-[11px]">
                      <span>UPI</span>
                      {pay.upiApp && <span className="text-slate-400">({pay.upiApp})</span>}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                    ₹{pay.amountInr.toLocaleString('en-IN')}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-[11px] text-slate-500">
                    {pay.razorpayPaymentId || pay.orderId || '—'}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 inline-flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      Captured
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
