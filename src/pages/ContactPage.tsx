import React, { useState } from 'react';
import {
  MapPin,
  PhoneCall,
  Clock,
  Smartphone,
  Mail,
  Send,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Compass,
} from 'lucide-react';
import { api } from '../services/api';
import { PochiPaymentCard } from '../components/common/PochiPaymentCard';

export const ContactPage: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone || !message) {
      setError('Please fill in your name, phone number, and message.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await api.sendContactMessage({
        name,
        email,
        phone,
        subject,
        message,
      });
      setSubmitted(true);
    } catch (err: any) {
      setError(err.message || 'Failed to send message.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12 animate-in fade-in">
      {/* Header */}
      <div className="text-center space-y-3 max-w-2xl mx-auto">
        <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
          Location & Contacts &bull; Kitale
        </span>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900">
          Visit or Contact Gods Favor Pharmacy
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
          Conveniently located along Kijana Wamalwa Road in Kitale Town. Reach out to our dispensing pharmacists or visit our counter.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Location & Contact Cards */}
        <div className="lg:col-span-6 space-y-6">
          {/* Physical Address Card */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-emerald-700" />
              <span>Physical Branch Location</span>
            </h2>

            <div className="space-y-4 text-xs sm:text-sm text-slate-600">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
                <strong className="text-slate-900 block font-bold text-sm">Gods Favor Pharmacy</strong>
                <p>Along Kijana Wamalwa Road, Kitale Town</p>
                <p className="text-slate-500">Trans-Nzoia County, Kenya</p>
              </div>

              <div className="flex items-start gap-3">
                <Compass className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-900 block font-semibold">Directions & Landmarks:</strong>
                  <span>Located along the main Kijana Wamalwa road corridor, easily accessible from Kitale Town center with direct parking for counter pickups and courier dispatch.</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-900 block font-semibold">Store Opening Hours:</strong>
                  <span>Monday – Saturday: 7:30 AM – 9:00 PM</span><br />
                  <span>Sunday & Public Holidays: 9:00 AM – 7:00 PM</span>
                </div>
              </div>
            </div>

            {/* Direct Call Button */}
            <a
              href="tel:07417758578"
              className="w-full bg-emerald-700 hover:bg-emerald-800 active:scale-98 text-white font-bold py-3.5 px-4 rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-md"
            >
              <PhoneCall className="w-4 h-4" />
              <span>Call Primary Doctor / Pharmacist: 07417758578</span>
            </a>
          </div>

          {/* Pochi la Biashara Card */}
          <PochiPaymentCard />
        </div>

        {/* Right Column: Contact Form */}
        <div className="lg:col-span-6 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-slate-900">Send an Inquiry or Feedback</h2>
            <p className="text-xs text-slate-500 mt-1">
              Have questions about drug availability, prices, or orders? Drop us a message.
            </p>
          </div>

          {submitted ? (
            <div className="p-8 bg-emerald-50 rounded-2xl border border-emerald-200 text-center space-y-4 animate-in zoom-in-95">
              <div className="w-14 h-14 bg-emerald-100 text-emerald-800 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Message Received!</h3>
              <p className="text-xs text-slate-600 max-w-sm mx-auto">
                Thank you for contacting Gods Favor Pharmacy. Our clinical team will respond shortly.
              </p>
              <button
                onClick={() => {
                  setSubmitted(false);
                  setName('');
                  setPhone('');
                  setMessage('');
                }}
                className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold px-5 py-2.5 rounded-xl text-xs transition-colors"
              >
                Send Another Message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Your Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Mary Achieng"
                  className="w-full text-xs sm:text-sm border border-slate-300 rounded-xl px-3.5 py-2.5 focus:ring-2 focus:ring-emerald-600 bg-slate-50"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Phone Number *
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
                    Email (Optional)
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="mary@example.com"
                    className="w-full text-xs sm:text-sm border border-slate-300 rounded-xl px-3.5 py-2.5 focus:ring-2 focus:ring-emerald-600 bg-slate-50"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Subject
                </label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g. Medication stock inquiry"
                  className="w-full text-xs sm:text-sm border border-slate-300 rounded-xl px-3.5 py-2.5 focus:ring-2 focus:ring-emerald-600 bg-slate-50"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Message *
                </label>
                <textarea
                  rows={4}
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="How can we assist you with medications, deliveries, or consultations?"
                  className="w-full text-xs sm:text-sm border border-slate-300 rounded-xl px-3.5 py-2.5 focus:ring-2 focus:ring-emerald-600 bg-slate-50"
                />
              </div>

              <button
                id="contact-form-submit-btn"
                type="submit"
                disabled={loading}
                className="w-full bg-emerald-700 hover:bg-emerald-800 active:scale-98 text-white font-bold py-3.5 px-6 rounded-xl shadow-lg shadow-emerald-700/20 transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-50"
              >
                {loading ? <span>Sending...</span> : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Send Message</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
