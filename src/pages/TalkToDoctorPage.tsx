import React, { useState } from 'react';
import {
  PhoneCall,
  MessageCircle,
  Stethoscope,
  Clock,
  ShieldCheck,
  Sparkles,
  Send,
  CheckCircle2,
  AlertTriangle,
  HeartPulse,
} from 'lucide-react';
import { api } from '../services/api';
import { PochiPaymentCard } from '../components/common/PochiPaymentCard';

interface TalkToDoctorPageProps {
  onOpenAIAssistant: () => void;
  onNavigate: (view: string) => void;
}

export const TalkToDoctorPage: React.FC<TalkToDoctorPageProps> = ({ onOpenAIAssistant, onNavigate }) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [symptoms, setSymptoms] = useState('');
  const [preferredTime, setPreferredTime] = useState('Morning (8:00 AM - 12:00 PM)');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone || !symptoms) return;

    setLoading(true);
    try {
      await api.sendContactMessage({
        name,
        phone,
        subject: `Doctor Consultation Request - ${preferredTime}`,
        message: `Patient: ${name}\nPhone: ${phone}\nPreferred Time: ${preferredTime}\nSymptoms/Questions: ${symptoms}`,
      });
      setSubmitted(true);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12 animate-in fade-in">
      {/* Hero Header */}
      <div className="bg-emerald-900 rounded-3xl p-8 lg:p-12 text-white shadow-2xl relative overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-8 space-y-4">
            <span className="bg-emerald-500 text-emerald-950 font-black text-xs px-3 py-1 rounded-full uppercase tracking-wider">
              Direct Clinical Care &bull; Kitale
            </span>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight leading-tight">
              Talk Directly with our Clinical Doctor & Pharmacists
            </h1>
            <p className="text-emerald-100 text-xs sm:text-sm leading-relaxed max-w-2xl">
              Get confidential medical evaluation, prescription clarifications, dosage guidelines, and chronic disease reviews. We are directly reachable via telephone or WhatsApp.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-4">
              <a
                href="tel:07417758578"
                className="bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-black px-6 py-3.5 rounded-xl text-sm flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition-all"
              >
                <PhoneCall className="w-4 h-4" />
                <span>Call Doctor: 07417758578</span>
              </a>

              <a
                href="https://wa.me/2547417758578?text=Hello%20Doctor%20at%20Gods%20Favor%20Pharmacy,%20I%20would%20like%20a%20clinical%20consultation."
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white/10 hover:bg-white/20 text-white font-bold px-6 py-3.5 rounded-xl border border-white/20 text-sm flex items-center gap-2 transition-all"
              >
                <MessageCircle className="w-4 h-4 text-emerald-300" />
                <span>WhatsApp Clinical Line</span>
              </a>

              <button
                onClick={onOpenAIAssistant}
                className="bg-emerald-800/80 hover:bg-emerald-800 text-emerald-200 font-bold px-5 py-3.5 rounded-xl border border-emerald-600/50 text-sm flex items-center gap-2 transition-all"
              >
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <span>Instant AI Health Guide</span>
              </button>
            </div>
          </div>

          <div className="lg:col-span-4 bg-emerald-950/80 p-6 rounded-2xl border border-emerald-700/50 space-y-3">
            <h3 className="font-bold text-white text-base flex items-center gap-2">
              <Clock className="w-4 h-4 text-emerald-400" />
              Doctor on Call Hours
            </h3>
            <p className="text-xs text-emerald-200">
              Monday – Saturday: <strong>7:30 AM – 9:00 PM</strong><br />
              Sunday: <strong>9:00 AM – 7:00 PM</strong>
            </p>
            <div className="pt-2 border-t border-emerald-900 text-xs text-emerald-300">
              Location: <strong>Kitale Town, along Kijana Wamalwa Road</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Consultation Request Form & Info */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Form */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-slate-900">Request a Callback or Clinical Consultation</h2>
            <p className="text-xs text-slate-500 mt-1">
              Submit your inquiry and our clinical team in Kitale will call you back promptly.
            </p>
          </div>

          {submitted ? (
            <div className="p-8 bg-emerald-50 rounded-2xl border border-emerald-200 text-center space-y-4 animate-in zoom-in-95">
              <div className="w-14 h-14 bg-emerald-100 text-emerald-800 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Request Submitted Successfully!</h3>
              <p className="text-xs text-slate-600 max-w-sm mx-auto">
                Our clinical doctor/pharmacist will review your notes and contact you on <strong>{phone}</strong> during the {preferredTime}.
              </p>
              <button
                onClick={() => {
                  setSubmitted(false);
                  setName('');
                  setPhone('');
                  setSymptoms('');
                }}
                className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold px-5 py-2.5 rounded-xl text-xs transition-colors"
              >
                Send Another Request
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Your Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Samuel Kiprotich"
                  className="w-full text-xs sm:text-sm border border-slate-300 rounded-xl px-3.5 py-2.5 focus:ring-2 focus:ring-emerald-600 bg-slate-50"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Active Phone Number *
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="07XX XXX XXX"
                  className="w-full text-xs sm:text-sm border border-slate-300 rounded-xl px-3.5 py-2.5 focus:ring-2 focus:ring-emerald-600 bg-slate-50"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Preferred Callback Window
                </label>
                <select
                  value={preferredTime}
                  onChange={(e) => setPreferredTime(e.target.value)}
                  className="w-full text-xs sm:text-sm border border-slate-300 rounded-xl px-3.5 py-2.5 focus:ring-2 focus:ring-emerald-600 bg-slate-50 font-medium"
                >
                  <option>Morning (8:00 AM - 12:00 PM)</option>
                  <option>Afternoon (12:00 PM - 4:00 PM)</option>
                  <option>Evening (4:00 PM - 8:00 PM)</option>
                  <option>Immediate / ASAP</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Reason for Consultation / Symptoms / Medication Inquiries *
                </label>
                <textarea
                  rows={4}
                  required
                  value={symptoms}
                  onChange={(e) => setSymptoms(e.target.value)}
                  placeholder="Briefly describe what you're experiencing or medication questions..."
                  className="w-full text-xs sm:text-sm border border-slate-300 rounded-xl px-3.5 py-2.5 focus:ring-2 focus:ring-emerald-600 bg-slate-50"
                />
              </div>

              <button
                id="submit-doctor-consult-btn"
                type="submit"
                disabled={loading}
                className="w-full bg-emerald-700 hover:bg-emerald-800 active:scale-98 text-white font-bold py-3.5 px-6 rounded-xl shadow-lg shadow-emerald-700/20 transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-50"
              >
                {loading ? (
                  <span>Sending Request...</span>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Submit Doctor Consultation Request</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>

        {/* Right Info Cards */}
        <div className="lg:col-span-5 space-y-6">
          <PochiPaymentCard />

          <div className="bg-slate-50 rounded-3xl p-6 border border-slate-200 space-y-3 text-xs text-slate-600">
            <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-700" />
              Confidentiality & Privacy
            </h4>
            <p>
              Your health consultations and prescription history remain strictly confidential between you and the clinical pharmacist in accordance with Kenyan medical standards.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
