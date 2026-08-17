import React from 'react';
import { PhoneCall, AlertTriangle } from 'lucide-react';

export const EmergencyBanner: React.FC = () => {
  return (
    <div id="emergency-banner" className="bg-amber-500/10 border-b border-amber-500/20 text-amber-900 px-4 py-2 text-xs md:text-sm">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0" />
          <span className="font-medium">
            Medical Emergency Notice: For severe life-threatening emergencies, please visit Kitale County Referral Hospital emergency department immediately.
          </span>
        </div>
        <a
          href="tel:07417758578"
          className="inline-flex items-center gap-1.5 font-bold text-emerald-800 hover:text-emerald-950 bg-amber-200/60 hover:bg-amber-200 px-3 py-1 rounded-full text-xs transition-colors shrink-0"
        >
          <PhoneCall className="w-3.5 h-3.5" />
          <span>Doctor / Pharmacist Line: 07417758578</span>
        </a>
      </div>
    </div>
  );
};
