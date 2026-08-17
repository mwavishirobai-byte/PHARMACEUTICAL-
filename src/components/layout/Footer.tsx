import React from 'react';
import {
  PhoneCall,
  MapPin,
  Clock,
  ShieldCheck,
  Smartphone,
  Heart,
  FileCheck,
  AlertTriangle,
  Stethoscope,
} from 'lucide-react';

interface FooterProps {
  onNavigate: (view: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-16 pb-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-slate-800">
          {/* Brand & About */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-black">
                <div className="w-5 h-5 flex items-center justify-center relative">
                  <div className="absolute w-5 h-1.5 bg-white rounded-xs" />
                  <div className="absolute w-1.5 h-5 bg-white rounded-xs" />
                </div>
              </div>
              <div>
                <span className="font-black text-white text-lg tracking-tight block">GODS FAVOR</span>
                <span className="text-[11px] font-bold text-emerald-400 tracking-wider block">
                  PHARMACY &bull; KITALE
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              Your trusted licensed community pharmacy in Kitale Town. Providing authentic pharmaceuticals, clinical consultations, rapid diagnostic screenings, and fast doorstep delivery.
            </p>

            <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700/60 text-xs space-y-1">
              <div className="flex items-center gap-2 text-emerald-400 font-bold">
                <Smartphone className="w-4 h-4" />
                <span>Pochi la Biashara Payment</span>
              </div>
              <p className="text-slate-300 font-mono font-bold text-sm">07417758578</p>
              <p className="text-[11px] text-slate-400">Recipient: GODS FAVOR PHARMACY</p>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">Patient Services</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() => onNavigate('catalog')}
                  className="hover:text-emerald-400 transition-colors"
                >
                  Shop Medicines & OTC Essentials
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('prescriptions')}
                  className="hover:text-emerald-400 transition-colors"
                >
                  Upload Doctor's Prescription
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('doctor')}
                  className="hover:text-emerald-400 transition-colors"
                >
                  Talk to Pharmacist / Doctor
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('appointments')}
                  className="hover:text-emerald-400 transition-colors"
                >
                  Book Screening & Diagnostic Test
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('track')}
                  className="hover:text-emerald-400 transition-colors"
                >
                  Track Order & Delivery Status
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('articles')}
                  className="hover:text-emerald-400 transition-colors"
                >
                  Community Health Articles & Advice
                </button>
              </li>
            </ul>
          </div>

          {/* Business Hours & Location */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">Kitale Branch</h4>
            <div className="space-y-2 text-xs">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>Kitale Town, along Kijana Wamalwa Road, Trans-Nzoia County, Kenya</span>
              </div>

              <div className="flex items-start gap-2 pt-1">
                <Clock className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <span className="block font-semibold text-slate-200">Operating Schedule:</span>
                  <span className="text-slate-400">Monday – Saturday: 7:30 AM – 9:00 PM</span>
                  <span className="block text-slate-400">Sunday: 9:00 AM – 7:00 PM</span>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="text-slate-300 font-medium">Licensed Pharmaceutical Practice</span>
              </div>
            </div>
          </div>

          {/* Contact Hotline & Emergency */}
          <div className="space-y-4">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">Clinical Contacts</h4>
            <div className="space-y-2 text-xs">
              <a
                href="tel:07417758578"
                className="flex items-center gap-2 bg-emerald-700 hover:bg-emerald-600 text-white font-bold p-3 rounded-xl transition-colors shadow-sm"
              >
                <PhoneCall className="w-4 h-4 shrink-0" />
                <div>
                  <span className="text-[10px] text-emerald-200 block">Doctor / Pharmacist Line:</span>
                  <span className="text-sm font-mono font-bold">07417758578</span>
                </div>
              </a>

              <a
                href="https://wa.me/2547417758578?text=Hello%20Gods%20Favor%20Pharmacy,%20I%20would%20like%20to%20inquire%20about%20medications."
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-emerald-300 font-bold p-2.5 rounded-xl border border-slate-700 transition-colors"
              >
                <span>WhatsApp Clinical Support</span>
              </a>

              <button
                onClick={() => onNavigate('admin')}
                className="w-full text-left text-[11px] text-slate-500 hover:text-slate-300 pt-2 flex items-center gap-1.5"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Authorized Staff Portal Access</span>
              </button>
            </div>
          </div>
        </div>

        {/* Regulatory & Emergency Disclaimers */}
        <div className="mt-8 pt-6 border-t border-slate-800/60 text-xs text-slate-400 space-y-3">
          <div className="bg-slate-800/40 p-3 rounded-xl border border-slate-700/40 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <p className="text-[11px] leading-relaxed">
              <strong>Medical Disclaimer:</strong> Information on this website is for educational and fulfillment purposes. Prescription medications require a valid prescription verified by a licensed pharmacist before dispensing. In life-threatening emergencies, visit Kitale County Referral Hospital emergency department immediately.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-slate-500">
            <span>&copy; {new Date().getFullYear()} Gods Favor Pharmacy &bull; Kitale Town, Kenya. All rights reserved.</span>
            <span>Regulated Healthcare Provider &bull; Pochi la Biashara: 07417758578</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
