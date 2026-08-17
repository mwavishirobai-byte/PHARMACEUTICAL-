import React, { useState } from 'react';
import {
  PhoneCall,
  MapPin,
  Clock,
  ShoppingBag,
  Sparkles,
  Menu,
  X,
  User as UserIcon,
  ShieldCheck,
  Search,
  FileText,
  Stethoscope,
  Calendar,
  Truck,
  LogOut,
  ChevronDown,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';

interface NavbarProps {
  currentView: string;
  onNavigate: (view: string, data?: any) => void;
  onOpenAIAssistant: () => void;
  onOpenSearch?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onNavigate,
  onOpenAIAssistant,
}) => {
  const { user, isStaff, logout } = useAuth();
  const { itemCount, setIsCartOpen } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const navLinks = [
    { id: 'home', label: 'Home' },
    { id: 'catalog', label: 'Medicines & OTC' },
    { id: 'services', label: 'Pharmacy Services' },
    { id: 'prescriptions', label: 'Upload Prescription' },
    { id: 'doctor', label: 'Talk to Doctor' },
    { id: 'appointments', label: 'Appointments' },
    { id: 'track', label: 'Track Order' },
    { id: 'articles', label: 'Health Tips' },
    { id: 'contact', label: 'Contact & Location' },
  ];

  const handleNavClick = (view: string) => {
    onNavigate(view);
    setMobileMenuOpen(false);
    setUserDropdownOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-white shadow-xs border-b border-slate-200">
      {/* Top Clinical & Contact Bar */}
      <div className="bg-emerald-900 text-emerald-100 text-xs py-2 px-4 border-b border-emerald-800">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-2">
          {/* Location & Hours */}
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Kitale Town, along Kijana Wamalwa Road</span>
            </span>
            <span className="hidden lg:flex items-center gap-1 text-emerald-300">
              <Clock className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Mon–Sat: 7:30 AM – 9:00 PM | Sun: 9:00 AM – 7:00 PM</span>
            </span>
          </div>

          {/* Direct Phone & Pochi Number */}
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1 bg-emerald-800/80 px-2.5 py-0.5 rounded-full border border-emerald-700">
              <span className="text-[10px] text-emerald-300 font-bold uppercase">Pochi la Biashara:</span>
              <span className="font-mono font-bold text-white">07417758578</span>
            </div>

            <a
              href="tel:07417758578"
              className="flex items-center gap-1 font-bold text-white bg-emerald-700 hover:bg-emerald-600 px-3 py-1 rounded-full transition-colors"
            >
              <PhoneCall className="w-3.5 h-3.5 text-emerald-200" />
              <span>Doctor Hotline: 07417758578</span>
            </a>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4">
          {/* Brand Logo */}
          <div
            id="brand-logo-container"
            onClick={() => handleNavClick('home')}
            className="flex items-center gap-3 cursor-pointer group shrink-0"
          >
            <div className="w-11 h-11 rounded-2xl bg-emerald-700 group-hover:bg-emerald-800 text-white flex items-center justify-center shadow-md shadow-emerald-700/20 transition-all">
              <div className="relative">
                {/* Medical Cross Graphic */}
                <div className="w-6 h-6 flex items-center justify-center">
                  <div className="absolute w-6 h-2 bg-white rounded-xs" />
                  <div className="absolute w-2 h-6 bg-white rounded-xs" />
                </div>
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-black text-lg sm:text-xl text-slate-900 tracking-tight leading-none group-hover:text-emerald-800 transition-colors">
                  GODS FAVOR
                </span>
                <span className="bg-emerald-100 text-emerald-900 font-bold text-[10px] px-1.5 py-0.5 rounded-sm uppercase tracking-wide">
                  PHARMACY
                </span>
              </div>
              <span className="text-[11px] font-semibold text-emerald-800 tracking-wider block">
                KITALE TOWN &bull; HEALTH & WELLNESS
              </span>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden xl:flex items-center gap-1">
            {navLinks.map((link) => (
              <button
                key={link.id}
                id={`nav-link-${link.id}`}
                onClick={() => handleNavClick(link.id)}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                  currentView === link.id
                    ? 'bg-emerald-50 text-emerald-800 font-black'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                {link.label}
              </button>
            ))}
          </nav>

          {/* Right Action Icons & Buttons */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* AI Clinical Assistant Trigger */}
            <button
              id="ai-assistant-header-btn"
              onClick={onOpenAIAssistant}
              className="inline-flex items-center gap-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200 px-3 py-2 rounded-xl text-xs font-bold transition-all shadow-2xs hover:shadow-xs"
              title="Virtual Pharmacist Assistant"
            >
              <Sparkles className="w-4 h-4 text-emerald-700" />
              <span className="hidden sm:inline">AI Health Guide</span>
            </button>

            {/* Cart Button */}
            <button
              id="open-cart-btn"
              onClick={() => setIsCartOpen(true)}
              className="relative p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 transition-colors"
              aria-label="Open shopping cart"
            >
              <ShoppingBag className="w-5 h-5 text-slate-700" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-emerald-700 text-white text-[11px] font-black w-5 h-5 rounded-full flex items-center justify-center shadow-xs">
                  {itemCount}
                </span>
              )}
            </button>

            {/* User Account / Staff Portal Menu */}
            {user ? (
              <div className="relative">
                <button
                  id="user-menu-btn"
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-colors text-xs font-bold text-slate-800"
                >
                  <div className="w-7 h-7 rounded-lg bg-emerald-700 text-white flex items-center justify-center text-xs font-black">
                    {user.fullName.charAt(0).toUpperCase()}
                  </div>
                  <span className="hidden md:inline max-w-[100px] truncate">{user.fullName}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95">
                    <div className="px-4 py-2 border-b border-slate-100">
                      <p className="text-xs font-bold text-slate-900 truncate">{user.fullName}</p>
                      <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
                      <span className="inline-block mt-1 bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                        {user.role}
                      </span>
                    </div>

                    <button
                      onClick={() => handleNavClick('account')}
                      className="w-full text-left px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                    >
                      <UserIcon className="w-4 h-4 text-slate-500" />
                      <span>My Orders & Prescriptions</span>
                    </button>

                    {isStaff && (
                      <button
                        onClick={() => handleNavClick('admin')}
                        className="w-full text-left px-4 py-2 text-xs font-bold text-emerald-800 hover:bg-emerald-50 flex items-center gap-2 border-t border-slate-100"
                      >
                        <ShieldCheck className="w-4 h-4 text-emerald-700" />
                        <span>Staff Management Portal</span>
                      </button>
                    )}

                    <button
                      onClick={() => {
                        logout();
                        setUserDropdownOpen(false);
                        onNavigate('home');
                      }}
                      className="w-full text-left px-4 py-2 text-xs text-red-600 hover:bg-red-50 flex items-center gap-2 border-t border-slate-100"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Log Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                id="login-header-btn"
                onClick={() => handleNavClick('auth')}
                className="inline-flex items-center gap-1.5 bg-emerald-700 hover:bg-emerald-800 active:scale-95 text-white font-bold px-3.5 py-2 rounded-xl text-xs transition-all shadow-xs"
              >
                <UserIcon className="w-4 h-4" />
                <span className="hidden sm:inline">Account / Staff</span>
              </button>
            )}

            {/* Mobile Menu Toggle */}
            <button
              id="mobile-menu-btn"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="xl:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="xl:hidden bg-white border-t border-slate-200 px-4 py-4 space-y-2 animate-in slide-in-from-top duration-200 shadow-xl">
          <div className="grid grid-cols-1 gap-1">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => handleNavClick(link.id)}
                className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-bold transition-colors ${
                  currentView === link.id
                    ? 'bg-emerald-50 text-emerald-800'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                {link.label}
              </button>
            ))}
          </div>

          <div className="pt-3 border-t border-slate-200 space-y-2">
            <a
              href="tel:07417758578"
              className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-bold py-2.5 px-4 rounded-xl text-sm flex items-center justify-center gap-2 shadow-xs"
            >
              <PhoneCall className="w-4 h-4" />
              <span>Call Doctor: 07417758578</span>
            </a>

            <div className="bg-emerald-50 rounded-xl p-3 text-xs text-emerald-950 flex items-center justify-between">
              <span>Pochi la Biashara:</span>
              <span className="font-mono font-bold text-emerald-800">07417758578</span>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
