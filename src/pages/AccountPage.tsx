import React, { useState, useEffect } from 'react';
import {
  User,
  Package,
  FileText,
  Calendar,
  Phone,
  Mail,
  MapPin,
  Clock,
  CheckCircle2,
  AlertCircle,
  LogOut,
  ExternalLink,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Order, Prescription, Appointment } from '../types';

interface AccountPageProps {
  onNavigate: (view: string, data?: any) => void;
}

export const AccountPage: React.FC<AccountPageProps> = ({ onNavigate }) => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'orders' | 'prescriptions' | 'appointments'>('orders');

  const [orders, setOrders] = useState<Order[]>([]);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadAccountData() {
      if (!user) return;
      setLoading(true);
      try {
        const [o, p, a] = await Promise.allSettled([
          api.getMyOrders(),
          api.getMyPrescriptions(),
          api.getMyAppointments(),
        ]);
        if (o.status === 'fulfilled') setOrders(o.value || []);
        if (p.status === 'fulfilled') setPrescriptions(p.value || []);
        if (a.status === 'fulfilled') setAppointments(a.value || []);
      } catch (err) {
        console.error('Error loading account data', err);
      } finally {
        setLoading(false);
      }
    }
    loadAccountData();
  }, [user]);

  if (!user) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-800">Please Sign In</h2>
        <p className="text-xs text-slate-500">Sign in or create an account to view your past pharmacy orders and prescriptions.</p>
        <button
          onClick={() => onNavigate('auth')}
          className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold px-6 py-2.5 rounded-xl text-xs"
        >
          Go to Sign In
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 animate-in fade-in">
      {/* Patient Profile Card */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-black text-2xl">
            {user.fullName.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900">{user.fullName}</h1>
              <span className="bg-emerald-50 text-emerald-800 text-xs px-2.5 py-0.5 rounded-md font-bold uppercase">
                {user.role}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 mt-1">
              <span className="flex items-center gap-1">
                <Mail className="w-3.5 h-3.5" />
                {user.email}
              </span>
              <span className="flex items-center gap-1">
                <Phone className="w-3.5 h-3.5" />
                {user.phone}
              </span>
              {user.address && (
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" />
                  {user.address}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {user.role === 'admin' && (
            <button
              onClick={() => onNavigate('admin')}
              className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-colors shadow-xs"
            >
              Open Staff Admin Portal
            </button>
          )}
          <button
            onClick={() => {
              logout();
              onNavigate('home');
            }}
            className="bg-slate-100 hover:bg-red-50 hover:text-red-700 text-slate-700 text-xs font-bold px-4 py-2.5 rounded-xl flex items-center gap-1.5 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-2">
        <button
          onClick={() => setActiveTab('orders')}
          className={`px-5 py-3 font-bold text-xs flex items-center gap-2 border-b-2 transition-all ${
            activeTab === 'orders'
              ? 'border-emerald-700 text-emerald-900 bg-emerald-50/50 rounded-t-xl'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>My Orders ({orders.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('prescriptions')}
          className={`px-5 py-3 font-bold text-xs flex items-center gap-2 border-b-2 transition-all ${
            activeTab === 'prescriptions'
              ? 'border-emerald-700 text-emerald-900 bg-emerald-50/50 rounded-t-xl'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Prescriptions ({prescriptions.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('appointments')}
          className={`px-5 py-3 font-bold text-xs flex items-center gap-2 border-b-2 transition-all ${
            activeTab === 'appointments'
              ? 'border-emerald-700 text-emerald-900 bg-emerald-50/50 rounded-t-xl'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Appointments ({appointments.length})</span>
        </button>
      </div>

      {/* Tab Contents */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="bg-slate-100 rounded-2xl h-24 animate-pulse" />
          ))}
        </div>
      ) : (
        <div>
          {/* ORDERS */}
          {activeTab === 'orders' && (
            <div className="space-y-4">
              {orders.length === 0 ? (
                <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 space-y-3">
                  <p className="text-sm text-slate-600">You have not placed any medication orders yet.</p>
                  <button
                    onClick={() => onNavigate('catalog')}
                    className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold px-5 py-2.5 rounded-xl text-xs"
                  >
                    Browse Medicines & Essentials
                  </button>
                </div>
              ) : (
                orders.map((ord) => (
                  <div
                    key={ord.id}
                    className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-black text-emerald-800 text-sm">{ord.orderNumber}</span>
                        <span className="bg-slate-100 text-slate-700 font-bold px-2 py-0.5 rounded-md text-[11px] uppercase">
                          {ord.status.replace(/_/g, ' ')}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">
                        {new Date(ord.createdAt).toLocaleDateString()} &bull; {ord.items.length} item(s) &bull; KSh {ord.total.toLocaleString()}
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => onNavigate('track', { orderNumber: ord.orderNumber })}
                        className="bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 transition-colors"
                      >
                        <span>Track Order</span>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* PRESCRIPTIONS */}
          {activeTab === 'prescriptions' && (
            <div className="space-y-4">
              {prescriptions.length === 0 ? (
                <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 space-y-3">
                  <p className="text-sm text-slate-600">No prescriptions uploaded yet.</p>
                  <button
                    onClick={() => onNavigate('prescriptions')}
                    className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold px-5 py-2.5 rounded-xl text-xs"
                  >
                    Upload Doctor Prescription
                  </button>
                </div>
              ) : (
                prescriptions.map((p) => (
                  <div
                    key={p.id}
                    className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-black text-emerald-800 text-sm">{p.prescriptionNumber}</span>
                        <span className="bg-slate-100 text-slate-700 font-bold px-2 py-0.5 rounded-md text-[11px] uppercase">
                          {p.status}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">
                        Uploaded: {new Date(p.createdAt).toLocaleDateString()} {p.doctorName ? `&bull; Dr. ${p.doctorName}` : ''}
                      </p>
                    </div>

                    {p.fileUrl && (
                      <a
                        href={p.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-emerald-800 hover:text-emerald-950 font-bold text-xs flex items-center gap-1"
                      >
                        <span>View Prescription</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                ))
              )}
            </div>
          )}

          {/* APPOINTMENTS */}
          {activeTab === 'appointments' && (
            <div className="space-y-4">
              {appointments.length === 0 ? (
                <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 space-y-3">
                  <p className="text-sm text-slate-600">No clinical appointments booked.</p>
                  <button
                    onClick={() => onNavigate('appointments')}
                    className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold px-5 py-2.5 rounded-xl text-xs"
                  >
                    Book Clinical Screening
                  </button>
                </div>
              ) : (
                appointments.map((a) => (
                  <div
                    key={a.id}
                    className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-black text-emerald-800 text-sm">{a.appointmentNumber}</span>
                        <span className="bg-slate-100 text-slate-700 font-bold px-2 py-0.5 rounded-md text-[11px] uppercase">
                          {a.status}
                        </span>
                      </div>
                      <h4 className="font-bold text-slate-900 text-sm mt-1">{a.serviceName}</h4>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Scheduled Date: <strong>{a.appointmentDate}</strong> at <strong>{a.appointmentTime}</strong>
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
