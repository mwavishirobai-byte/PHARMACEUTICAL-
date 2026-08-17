import React, { useState } from 'react';
import { Lock, Mail, User, Phone, MapPin, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface AuthPageProps {
  onSuccess: () => void;
  onNavigate: (view: string) => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({ onSuccess }) => {
  const { login, register } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail || !loginPassword) return;
    setLoading(true);
    setError(null);
    try {
      await login(loginEmail, loginPassword);
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !registerEmail || !phone || !registerPassword) {
      setError('Please fill in all required fields.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await register({ fullName, email: registerEmail, phone, password: registerPassword, address });
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-12 space-y-6 animate-in fade-in">
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-emerald-800 text-white flex items-center justify-center font-black text-xl mx-auto shadow-md">GF</div>
        <h1 className="text-2xl font-black text-slate-900">{mode === 'login' ? 'Welcome Back' : 'Create Patient Account'}</h1>
        <p className="text-xs text-slate-500">Gods Favor Pharmacy &bull; Kitale Town, Kijana Wamalwa Road</p>
      </div>

      <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200">
        <button onClick={() => { setMode('login'); setError(null); }} className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${mode === 'login' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'}`}>Sign In</button>
        <button onClick={() => { setMode('register'); setError(null); }} className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${mode === 'register' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'}`}>Create Account</button>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
        {error && <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2"><AlertCircle className="w-4 h-4 shrink-0" /><span>{error}</span></div>}

        {mode === 'login' ? (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Email Address</label>
              <div className="relative"><Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" /><input type="email" required value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} placeholder="wekesavictor450@gmail.com" className="w-full text-xs sm:text-sm pl-10 pr-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-600 bg-slate-50" /></div>
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Password</label>
              <div className="relative"><Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" /><input type="password" required value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} placeholder="Enter your password" className="w-full text-xs sm:text-sm pl-10 pr-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-600 bg-slate-50" /></div>
            </div>
            <button id="login-submit-btn" type="submit" disabled={loading} className="w-full bg-emerald-700 hover:bg-emerald-800 active:scale-98 text-white font-bold py-3.5 px-4 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 text-xs sm:text-sm disabled:opacity-50">{loading ? <span>Signing In...</span> : <span>Sign In to Account</span>}</button>
          </form>
        ) : (
          <form onSubmit={handleRegister} className="space-y-4">
            <div><label className="text-xs font-bold text-slate-700 block mb-1">Full Name *</label><div className="relative"><User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" /><input type="text" required value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="e.g. Grace Cherono" className="w-full text-xs sm:text-sm pl-10 pr-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-600 bg-slate-50" /></div></div>
            <div><label className="text-xs font-bold text-slate-700 block mb-1">Email Address *</label><div className="relative"><Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" /><input type="email" required value={registerEmail} onChange={(e) => setRegisterEmail(e.target.value)} placeholder="grace@example.com" className="w-full text-xs sm:text-sm pl-10 pr-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-600 bg-slate-50" /></div></div>
            <div><label className="text-xs font-bold text-slate-700 block mb-1">Phone Number (M-Pesa active) *</label><div className="relative"><Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" /><input type="tel" required value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="07XX XXX XXX" className="w-full text-xs sm:text-sm pl-10 pr-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-600 bg-slate-50" /></div></div>
            <div><label className="text-xs font-bold text-slate-700 block mb-1">Default Estate / Address in Kitale</label><div className="relative"><MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" /><input type="text" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="e.g. Milimani, Kitale" className="w-full text-xs sm:text-sm pl-10 pr-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-600 bg-slate-50" /></div></div>
            <div><label className="text-xs font-bold text-slate-700 block mb-1">Choose Password *</label><div className="relative"><Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" /><input type="password" required minLength={6} value={registerPassword} onChange={(e) => setRegisterPassword(e.target.value)} placeholder="••••••••" className="w-full text-xs sm:text-sm pl-10 pr-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-600 bg-slate-50" /></div></div>
            <button id="register-submit-btn" type="submit" disabled={loading} className="w-full bg-emerald-700 hover:bg-emerald-800 active:scale-98 text-white font-bold py-3.5 px-4 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 text-xs sm:text-sm disabled:opacity-50">{loading ? <span>Creating Account...</span> : <span>Create Account</span>}</button>
          </form>
        )}
      </div>
    </div>
  );
};
