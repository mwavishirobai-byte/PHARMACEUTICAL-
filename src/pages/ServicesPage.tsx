import React, { useState, useEffect } from 'react';
import {
  Activity,
  Stethoscope,
  HeartPulse,
  Syringe,
  Baby,
  Bandage,
  RefreshCcw,
  Sparkles,
  Calendar,
  PhoneCall,
  ShieldCheck,
  CheckCircle2,
  Clock,
  ArrowRight,
} from 'lucide-react';
import { PharmacyService } from '../types';
import { api } from '../services/api';

interface ServicesPageProps {
  onNavigate: (view: string, data?: any) => void;
}

export const ServicesPage: React.FC<ServicesPageProps> = ({ onNavigate }) => {
  const [services, setServices] = useState<PharmacyService[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadServices() {
      try {
        const data = await api.getServices();
        setServices(data);
      } catch (err) {
        console.error('Failed to load services', err);
      } finally {
        setLoading(false);
      }
    }
    loadServices();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12 animate-in fade-in">
      {/* Header Banner */}
      <div className="bg-emerald-900 rounded-3xl p-8 lg:p-12 text-white shadow-xl relative overflow-hidden">
        <div className="max-w-3xl space-y-4">
          <span className="bg-emerald-500 text-emerald-950 font-black text-xs px-3 py-1 rounded-full uppercase tracking-wider">
            Kitale Community Healthcare
          </span>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight leading-tight">
            Professional Pharmacy & Clinical Healthcare Services
          </h1>
          <p className="text-emerald-100 text-xs sm:text-sm leading-relaxed">
            At Gods Favor Pharmacy along Kijana Wamalwa Road, we do more than dispense medicines. We provide patient-first clinical evaluations, vital checks, chronic disease reviews, and confidential consultations.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              onClick={() => onNavigate('appointments')}
              className="bg-emerald-400 hover:bg-emerald-300 text-emerald-950 font-black px-5 py-3 rounded-xl text-xs transition-all flex items-center gap-2 shadow-md"
            >
              <Calendar className="w-4 h-4" />
              <span>Book Screening / Consultation</span>
            </button>

            <a
              href="tel:07417758578"
              className="bg-white/10 hover:bg-white/20 text-white font-bold px-5 py-3 rounded-xl text-xs transition-all flex items-center gap-2 border border-white/20"
            >
              <PhoneCall className="w-4 h-4 text-emerald-300" />
              <span>Direct Doctor Line: 07417758578</span>
            </a>
          </div>
        </div>
      </div>

      {/* Services Grid */}
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-black text-slate-900">Available Clinic & Pharmacy Services</h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Walk-in available during business hours, or reserve your slot in advance.
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-slate-100 rounded-2xl h-64 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((srv) => (
              <div
                key={srv.id}
                id={`service-card-${srv.id}`}
                className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center">
                      <Activity className="w-6 h-6" />
                    </div>
                    <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md">
                      {srv.duration || '15 mins'}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-slate-900">{srv.name}</h3>
                  <p className="text-xs text-slate-600 mt-2 leading-relaxed">{srv.fullDescription || srv.shortDescription}</p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase font-semibold">Standard Fee</span>
                    <span className="text-base font-black text-emerald-800">{srv.priceEstimate}</span>
                  </div>

                  <button
                    onClick={() => onNavigate('appointments', { serviceId: srv.id })}
                    className="bg-emerald-700 hover:bg-emerald-800 active:scale-95 text-white font-bold px-4 py-2 rounded-xl text-xs transition-colors flex items-center gap-1.5 shadow-xs"
                  >
                    <span>Book Service</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Hospital Referral & Compliance Notice */}
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 text-xs text-slate-600 space-y-2">
        <div className="flex items-center gap-2 font-bold text-slate-800 text-sm">
          <ShieldCheck className="w-4 h-4 text-emerald-700" />
          <span>Patient Safety & Clinical Protocol</span>
        </div>
        <p>
          All pharmaceutical services and patient screenings at Gods Favor Pharmacy are performed by certified pharmacy clinicians following strict clinical guidelines. For complex surgeries, intensive care, or advanced radiology, patients are seamlessly referred to Kitale County Referral Hospital.
        </p>
      </div>
    </div>
  );
};
