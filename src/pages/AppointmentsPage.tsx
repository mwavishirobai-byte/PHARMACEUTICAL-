import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  Activity,
  CheckCircle2,
  AlertCircle,
  PhoneCall,
  MapPin,
  Send,
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { PharmacyService, Appointment } from '../types';

interface AppointmentsPageProps {
  initialServiceId?: string;
  onNavigate: (view: string) => void;
}

export const AppointmentsPage: React.FC<AppointmentsPageProps> = ({
  initialServiceId,
  onNavigate,
}) => {
  const { user } = useAuth();
  const [services, setServices] = useState<PharmacyService[]>([]);
  const [selectedServiceId, setSelectedServiceId] = useState<string>(initialServiceId || '');
  const [customerName, setCustomerName] = useState(user?.fullName || '');
  const [customerPhone, setCustomerPhone] = useState(user?.phone || '');
  const [customerEmail, setCustomerEmail] = useState(user?.email || '');

  // Default date to tomorrow
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split('T')[0];

  const [appointmentDate, setAppointmentDate] = useState(tomorrowStr);
  const [appointmentTime, setAppointmentTime] = useState('09:30 AM');
  const [notes, setNotes] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [bookedAppointment, setBookedAppointment] = useState<Appointment | null>(null);

  useEffect(() => {
    async function loadServices() {
      try {
        const data = await api.getServices();
        setServices(data);
        if (!selectedServiceId && data.length > 0) {
          setSelectedServiceId(data[0].id);
        }
      } catch (err) {
        console.error(err);
      }
    }
    loadServices();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !customerPhone || !selectedServiceId || !appointmentDate || !appointmentTime) {
      setError('Please fill in all required fields.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await api.requestAppointment({
        customerName,
        customerPhone,
        customerEmail,
        serviceId: selectedServiceId,
        appointmentDate,
        appointmentTime,
        notes,
      });
      setBookedAppointment(res.appointment);
    } catch (err: any) {
      setError(err.message || 'Failed to book appointment');
    } finally {
      setLoading(false);
    }
  };

  const selectedService = services.find((s) => s.id === selectedServiceId);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10 animate-in fade-in">
      <div className="text-center space-y-3 max-w-2xl mx-auto">
        <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
          Kitale Clinic &bull; Rapid Appointments
        </span>
        <h1 className="text-3xl font-black text-slate-900">Book Clinical Screening or Consultation</h1>
        <p className="text-xs sm:text-sm text-slate-600">
          Reserve a convenient time slot for blood pressure, blood glucose, vaccinations, or clinical doctor consultations along Kijana Wamalwa Road.
        </p>
      </div>

      {bookedAppointment ? (
        <div className="bg-white rounded-3xl border border-emerald-200 p-8 shadow-xl text-center space-y-6 animate-in zoom-in-95">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-black text-slate-900">Appointment Requested Successfully!</h2>
            <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto">
              Our clinical staff will review your booking and send an SMS/call confirmation.
            </p>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 max-w-md mx-auto text-left space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-500">Booking Ref:</span>
              <span className="font-mono font-black text-emerald-800 text-sm">
                {bookedAppointment.appointmentNumber}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Service:</span>
              <span className="font-bold text-slate-900">{bookedAppointment.serviceName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Scheduled Date:</span>
              <span className="font-bold text-slate-900">{bookedAppointment.appointmentDate}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Scheduled Time:</span>
              <span className="font-bold text-slate-900">{bookedAppointment.appointmentTime}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Location:</span>
              <span className="font-bold text-slate-900">Kitale, Kijana Wamalwa Road</span>
            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-3 pt-2">
            <button
              onClick={() => onNavigate('home')}
              className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold px-5 py-2.5 rounded-xl text-xs transition-colors"
            >
              Return to Homepage
            </button>
            <a
              href="tel:07417758578"
              className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold px-5 py-2.5 rounded-xl text-xs transition-colors flex items-center gap-1.5"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              <span>Call Pharmacy: 07417758578</span>
            </a>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-3.5 text-xs text-red-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Service Selection */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block mb-1">
                Select Clinical Service *
              </label>
              <select
                id="appointment-service-select"
                required
                value={selectedServiceId}
                onChange={(e) => setSelectedServiceId(e.target.value)}
                className="w-full text-xs sm:text-sm border border-slate-300 rounded-xl px-3.5 py-3 focus:ring-2 focus:ring-emerald-600 bg-slate-50 font-medium"
              >
                {services.map((srv) => (
                  <option key={srv.id} value={srv.id}>
                    {srv.name} &bull; ({srv.priceEstimate})
                  </option>
                ))}
              </select>

              {selectedService && (
                <div className="mt-2 p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-950 flex items-center justify-between">
                  <span>{selectedService.shortDescription}</span>
                  <span className="font-bold text-emerald-800 shrink-0 ml-2">{selectedService.duration}</span>
                </div>
              )}
            </div>

            {/* Date & Time */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Preferred Date *
                </label>
                <input
                  type="date"
                  required
                  min={new Date().toISOString().split('T')[0]}
                  value={appointmentDate}
                  onChange={(e) => setAppointmentDate(e.target.value)}
                  className="w-full text-xs sm:text-sm border border-slate-300 rounded-xl px-3.5 py-2.5 focus:ring-2 focus:ring-emerald-600 bg-slate-50"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Preferred Time Slot *
                </label>
                <select
                  value={appointmentTime}
                  onChange={(e) => setAppointmentTime(e.target.value)}
                  className="w-full text-xs sm:text-sm border border-slate-300 rounded-xl px-3.5 py-2.5 focus:ring-2 focus:ring-emerald-600 bg-slate-50 font-medium"
                >
                  <option>08:00 AM - 09:00 AM</option>
                  <option>09:30 AM - 10:30 AM</option>
                  <option>11:00 AM - 12:00 PM</option>
                  <option>01:00 PM - 02:00 PM</option>
                  <option>02:30 PM - 03:30 PM</option>
                  <option>04:00 PM - 05:00 PM</option>
                  <option>06:00 PM - 07:00 PM</option>
                </select>
              </div>
            </div>

            {/* Patient Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Patient Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="e.g. David Wafula"
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
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="07XX XXX XXX"
                  className="w-full text-xs sm:text-sm border border-slate-300 rounded-xl px-3.5 py-2.5 focus:ring-2 focus:ring-emerald-600 bg-slate-50"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Additional Health Details / Reasons for Appointment
              </label>
              <textarea
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Regular monthly diabetic checkup, blood pressure history..."
                className="w-full text-xs sm:text-sm border border-slate-300 rounded-xl px-3.5 py-2.5 focus:ring-2 focus:ring-emerald-600 bg-slate-50"
              />
            </div>

            <button
              id="submit-appointment-btn"
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-700 hover:bg-emerald-800 active:scale-98 text-white font-bold py-3.5 px-6 rounded-xl shadow-lg shadow-emerald-700/20 transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-50"
            >
              {loading ? <span>Booking...</span> : <span>Confirm Appointment Booking</span>}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
