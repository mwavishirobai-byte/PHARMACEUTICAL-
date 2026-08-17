import React, { useState } from 'react';
import { Smartphone, Check, Copy, ShieldCheck, HelpCircle } from 'lucide-react';

interface PochiPaymentCardProps {
  amount?: number;
  showSteps?: boolean;
}

export const PochiPaymentCard: React.FC<PochiPaymentCardProps> = ({ amount, showSteps = true }) => {
  const [copied, setCopied] = useState(false);
  const pochiNumber = '07417758578';

  const copyToClipboard = () => {
    navigator.clipboard.writeText(pochiNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div id="pochi-payment-guide-card" className="bg-emerald-900 text-white rounded-2xl p-5 md:p-6 shadow-xl border border-emerald-700/50">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-emerald-800 pb-4 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-emerald-500 text-emerald-950 font-black text-xs px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              Official Pharmacy Payment
            </span>
            <span className="text-emerald-300 text-xs flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> Pochi la Biashara
            </span>
          </div>
          <h3 className="text-xl font-bold text-white mt-1">Gods Favor Pharmacy Payment</h3>
          <p className="text-emerald-200 text-xs">Direct instant mobile checkout via Safaricom M-Pesa Pochi</p>
        </div>

        {amount !== undefined && (
          <div className="bg-emerald-800/80 px-4 py-2 rounded-xl text-right">
            <span className="text-xs text-emerald-300 block">Amount to Pay</span>
            <span className="text-2xl font-black text-emerald-300">KSh {amount.toLocaleString()}</span>
          </div>
        )}
      </div>

      {/* Pochi Number Callout */}
      <div className="bg-emerald-950/80 rounded-xl p-4 border border-emerald-600/40 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div>
          <span className="text-xs font-semibold text-emerald-300 block uppercase tracking-wider">
            Send Payment to Pochi Number:
          </span>
          <span className="text-2xl sm:text-3xl font-black tracking-wider text-white font-mono">
            {pochiNumber}
          </span>
          <span className="text-xs text-emerald-300/80 block mt-0.5">
            Recipient Name: <strong className="text-white font-semibold">GODS FAVOR PHARMACY</strong>
          </span>
        </div>

        <button
          id="copy-pochi-number-btn"
          onClick={copyToClipboard}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-emerald-950 font-bold px-4 py-2.5 rounded-xl transition-all shadow-md text-sm"
        >
          {copied ? (
            <>
              <Check className="w-4 h-4 text-emerald-950" />
              <span>Copied 07417758578!</span>
            </>
          ) : (
            <>
              <Copy className="w-4 h-4" />
              <span>Copy Pochi Number</span>
            </>
          )}
        </button>
      </div>

      {/* Step by Step M-Pesa Guide */}
      {showSteps && (
        <div className="mt-5">
          <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-300 flex items-center gap-1.5 mb-2.5">
            <Smartphone className="w-3.5 h-3.5" /> How to Pay using M-Pesa on your Phone:
          </h4>
          <ol className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5 text-xs text-emerald-100">
            <li className="bg-emerald-800/40 p-2.5 rounded-lg border border-emerald-700/40">
              <strong className="text-emerald-300 block mb-0.5">1. Open M-Pesa</strong>
              Go to Lipa na M-Pesa on SIM toolkit or M-Pesa App
            </li>
            <li className="bg-emerald-800/40 p-2.5 rounded-lg border border-emerald-700/40">
              <strong className="text-emerald-300 block mb-0.5">2. Pochi la Biashara</strong>
              Select <em>Pochi la Biashara</em> option
            </li>
            <li className="bg-emerald-800/40 p-2.5 rounded-lg border border-emerald-700/40">
              <strong className="text-emerald-300 block mb-0.5">3. Enter Phone</strong>
              Enter <span className="font-mono font-bold text-white">07417758578</span> and amount
            </li>
            <li className="bg-emerald-800/40 p-2.5 rounded-lg border border-emerald-700/40">
              <strong className="text-emerald-300 block mb-0.5">4. Enter M-Pesa PIN</strong>
              Confirm recipient is Gods Favor & submit reference
            </li>
          </ol>
        </div>
      )}

      <div className="mt-4 pt-3 border-t border-emerald-800/60 flex items-center justify-between text-[11px] text-emerald-300">
        <span className="flex items-center gap-1">
          <HelpCircle className="w-3.5 h-3.5" /> Need assistance paying? Call Doctor: <strong className="text-white">07417758578</strong>
        </span>
        <span className="hidden sm:inline text-emerald-400">Payment verification is verified by pharmacy staff</span>
      </div>
    </div>
  );
};
