import React, { useState, useEffect } from 'react';
import {
  PhoneCall,
  MapPin,
  Clock,
  ShieldCheck,
  Smartphone,
  Upload,
  Stethoscope,
  ShoppingBag,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Truck,
  HeartPulse,
  Pill,
  Award,
  Users,
  Activity,
} from 'lucide-react';
import { Product, Category, PharmacyService, HealthArticle } from '../types';
import { api } from '../services/api';
import { ProductCard } from '../components/common/ProductCard';
import { ProductDetailModal } from '../components/common/ProductDetailModal';
import { PochiPaymentCard } from '../components/common/PochiPaymentCard';

interface HomePageProps {
  onNavigate: (view: string, data?: any) => void;
  onOpenAIAssistant: () => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onNavigate, onOpenAIAssistant }) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [services, setServices] = useState<PharmacyService[]>([]);
  const [articles, setArticles] = useState<HealthArticle[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadHomeData() {
      try {
        const [cats, prodsRes, srvs, arts] = await Promise.all([
          api.getCategories(),
          api.getProducts({ featured: true, limit: 8 }),
          api.getServices(),
          api.getArticles(),
        ]);
        setCategories(cats);
        setFeaturedProducts(prodsRes.products);
        setServices(srvs.slice(0, 4));
        setArticles(arts.slice(0, 3));
      } catch (err) {
        console.error('Failed to load homepage data', err);
      } finally {
        setLoading(false);
      }
    }
    loadHomeData();
  }, []);

  return (
    <div className="space-y-16 pb-16 animate-in fade-in duration-300">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-emerald-900 via-emerald-950 to-slate-900 text-white overflow-hidden py-16 lg:py-24">
        {/* Subtle grid accent */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:16px_16px]" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Hero Text */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 bg-emerald-800/80 border border-emerald-600/50 px-3.5 py-1.5 rounded-full text-xs font-bold text-emerald-200">
                <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                <span>Kitale Town &bull; Along Kijana Wamalwa Road</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
                Authentic Medicines, Clinical Care & Rapid Delivery in <span className="text-emerald-400">Kitale</span>
              </h1>

              <p className="text-sm sm:text-base text-emerald-100/90 leading-relaxed max-w-2xl">
                Gods Favor Pharmacy is your trusted neighborhood pharmacy. Order genuine prescription medications, OTC remedies, mother & baby care, or talk directly with our clinical doctor and pharmacists.
              </p>

              {/* CTAs */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  id="hero-shop-medicines-btn"
                  onClick={() => onNavigate('catalog')}
                  className="bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-emerald-950 font-black px-6 py-3.5 rounded-xl shadow-lg shadow-emerald-500/25 transition-all text-sm flex items-center gap-2"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Shop Medicines</span>
                </button>

                <a
                  href="tel:07417758578"
                  className="bg-white/10 hover:bg-white/20 active:scale-95 text-white font-bold px-5 py-3.5 rounded-xl border border-white/20 transition-all text-sm flex items-center gap-2 backdrop-blur-xs"
                >
                  <PhoneCall className="w-4 h-4 text-emerald-400" />
                  <span>Doctor Hotline: 07417758578</span>
                </a>

                <button
                  id="hero-upload-rx-btn"
                  onClick={() => onNavigate('prescriptions')}
                  className="bg-emerald-900/60 hover:bg-emerald-900 text-emerald-200 font-bold px-4 py-3.5 rounded-xl border border-emerald-700/60 transition-all text-sm flex items-center gap-2"
                >
                  <Upload className="w-4 h-4" />
                  <span>Upload Rx</span>
                </button>
              </div>

              {/* Badges / Guarantees */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-6 border-t border-emerald-800/80 text-xs text-emerald-200">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>100% Genuine Certified Drugs</span>
                </div>
                <div className="flex items-center gap-2">
                  <Truck className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Doorstep Delivery in Kitale</span>
                </div>
                <div className="flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Pochi: 07417758578</span>
                </div>
              </div>
            </div>

            {/* Right Hero Pochi & AI Feature Card */}
            <div className="lg:col-span-5 space-y-4">
              <PochiPaymentCard />

              {/* Quick AI Clinical Card */}
              <div
                onClick={onOpenAIAssistant}
                className="bg-white/10 hover:bg-white/15 cursor-pointer rounded-2xl p-4 border border-emerald-500/30 backdrop-blur-md transition-all flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white shrink-0 shadow-xs">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-sm">Clinical Health & Dosage Guide</h4>
                    <p className="text-xs text-emerald-200">Ask our AI medication safety assistant</p>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-emerald-400 shrink-0" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Fast Action Quick Access Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 -mt-8 relative z-10">
          <div
            onClick={() => onNavigate('doctor')}
            className="bg-white rounded-2xl p-5 shadow-lg border border-slate-200/80 hover:border-emerald-500 hover:shadow-xl transition-all cursor-pointer group"
          >
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-3 group-hover:bg-emerald-700 group-hover:text-white transition-colors">
              <Stethoscope className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-900 text-base">Doctor Consultation</h3>
            <p className="text-xs text-slate-500 mt-1">Speak directly with our clinical doctor and pharmacists.</p>
            <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-800 mt-3 group-hover:gap-2 transition-all">
              Call 07417758578 &rarr;
            </span>
          </div>

          <div
            onClick={() => onNavigate('prescriptions')}
            className="bg-white rounded-2xl p-5 shadow-lg border border-slate-200/80 hover:border-emerald-500 hover:shadow-xl transition-all cursor-pointer group"
          >
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-3 group-hover:bg-emerald-700 group-hover:text-white transition-colors">
              <Upload className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-900 text-base">Prescription Refills</h3>
            <p className="text-xs text-slate-500 mt-1">Upload a photo of your doctor's slip for pharmacist review.</p>
            <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-800 mt-3 group-hover:gap-2 transition-all">
              Upload Prescription &rarr;
            </span>
          </div>

          <div
            onClick={() => onNavigate('appointments')}
            className="bg-white rounded-2xl p-5 shadow-lg border border-slate-200/80 hover:border-emerald-500 hover:shadow-xl transition-all cursor-pointer group"
          >
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-3 group-hover:bg-emerald-700 group-hover:text-white transition-colors">
              <HeartPulse className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-900 text-base">Health Screenings</h3>
            <p className="text-xs text-slate-500 mt-1">Book blood pressure, blood glucose, and malaria testing.</p>
            <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-800 mt-3 group-hover:gap-2 transition-all">
              Book Appointment &rarr;
            </span>
          </div>

          <div
            onClick={() => onNavigate('track')}
            className="bg-white rounded-2xl p-5 shadow-lg border border-slate-200/80 hover:border-emerald-500 hover:shadow-xl transition-all cursor-pointer group"
          >
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-3 group-hover:bg-emerald-700 group-hover:text-white transition-colors">
              <Truck className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-900 text-base">Track Delivery</h3>
            <p className="text-xs text-slate-500 mt-1">Enter your order reference code to track dispatch status.</p>
            <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-800 mt-3 group-hover:gap-2 transition-all">
              Track Order Status &rarr;
            </span>
          </div>
        </div>
      </section>

      {/* Categories Showcase */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">Browse Catalog</span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">Pharmaceutical Categories</h2>
          </div>
          <button
            onClick={() => onNavigate('catalog')}
            className="text-xs font-bold text-emerald-800 hover:text-emerald-950 flex items-center gap-1"
          >
            <span>View all products</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {categories.map((cat) => (
            <div
              key={cat.id}
              onClick={() => onNavigate('catalog', { categoryId: cat.id })}
              className="bg-white rounded-2xl p-4 border border-slate-200/80 hover:border-emerald-500 hover:shadow-md transition-all cursor-pointer text-center group flex flex-col items-center justify-center"
            >
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-800 flex items-center justify-center mb-2 group-hover:scale-110 group-hover:bg-emerald-700 group-hover:text-white transition-all">
                <Pill className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-800 text-xs group-hover:text-emerald-800 transition-colors">
                {cat.name}
              </h3>
              <span className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">
                {cat.description}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">In-Stock Medicines</span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">Popular Medicines & Health Essentials</h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Verified clinical formulations ready for same-day Kitale counter pickup or doorstep delivery.
            </p>
          </div>

          <button
            onClick={() => onNavigate('catalog')}
            className="inline-flex items-center gap-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold px-4 py-2 rounded-xl text-xs transition-colors shrink-0 shadow-xs"
          >
            <span>Explore Full Catalog</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="bg-slate-100 rounded-2xl h-64 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {featuredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onQuickView={(p) => setSelectedProduct(p)}
              />
            ))}
          </div>
        )}
      </section>

      {/* Pharmacy Services Highlights */}
      <section className="bg-slate-50 border-y border-slate-200 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">Clinical Expertise</span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">Comprehensive Pharmacy Services</h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-2">
              Beyond medication dispensing, we offer licensed clinical evaluations, patient vitals monitoring, and maternal consultations in Kitale.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map((srv) => (
              <div
                key={srv.id}
                className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs hover:shadow-lg transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center mb-4">
                    <Activity className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-slate-900 text-base">{srv.name}</h3>
                  <p className="text-xs text-slate-600 mt-2 leading-relaxed">{srv.shortDescription}</p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs font-black text-emerald-800">{srv.priceEstimate}</span>
                  <button
                    onClick={() => onNavigate('appointments', { serviceId: srv.id })}
                    className="text-xs font-bold text-emerald-800 hover:text-emerald-950 flex items-center gap-1"
                  >
                    <span>Book</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-10">
            <button
              onClick={() => onNavigate('services')}
              className="inline-flex items-center gap-2 bg-emerald-800 hover:bg-emerald-900 text-white font-bold px-6 py-3 rounded-xl text-xs transition-colors shadow-sm"
            >
              <span>View All 10+ Clinical Services</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* Why Choose Gods Favor Pharmacy */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-emerald-900 rounded-3xl p-8 lg:p-12 text-white shadow-2xl relative overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-6">
              <span className="bg-emerald-500 text-emerald-950 text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider">
                Why Patients Trust Us
              </span>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black leading-tight">
                Dedicated to Patient Safety, Genuine Quality & Kitale Community Care
              </h2>
              <p className="text-emerald-100 text-xs sm:text-sm leading-relaxed">
                We take medication safety seriously. Every drug dispensed is verified for batch potency, stored in temperature-regulated pharmacy environments, and cross-checked by certified clinical staff.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                  <div>
                    <strong className="block text-white">Licensed Pharmacists</strong>
                    Qualified clinical professionals available for consultation.
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                  <div>
                    <strong className="block text-white">Strict Batch Traceability</strong>
                    100% authentic drugs sourced from registered Kenyan distributors.
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                  <div>
                    <strong className="block text-white">Direct Doctor Line</strong>
                    Immediate telephone & WhatsApp access on 07417758578.
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                  <div>
                    <strong className="block text-white">Seamless Pochi Payment</strong>
                    Official M-Pesa business number (07417758578) with instant verification.
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-5 bg-emerald-950/80 p-6 rounded-2xl border border-emerald-700/50 space-y-4">
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <Clock className="w-4 h-4 text-emerald-400" />
                <span>Kitale Store Operating Hours</span>
              </h3>
              <div className="space-y-2 text-xs text-emerald-200">
                <div className="flex justify-between py-1 border-b border-emerald-900">
                  <span>Monday – Friday</span>
                  <span className="font-mono text-white font-bold">7:30 AM – 9:00 PM</span>
                </div>
                <div className="flex justify-between py-1 border-b border-emerald-900">
                  <span>Saturday</span>
                  <span className="font-mono text-white font-bold">8:00 AM – 9:00 PM</span>
                </div>
                <div className="flex justify-between py-1">
                  <span>Sunday & Public Holidays</span>
                  <span className="font-mono text-white font-bold">9:00 AM – 7:00 PM</span>
                </div>
              </div>

              <div className="pt-2">
                <a
                  href="tel:07417758578"
                  className="w-full bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-black py-3 px-4 rounded-xl text-xs flex items-center justify-center gap-2 transition-all shadow-md"
                >
                  <PhoneCall className="w-4 h-4" />
                  <span>Call Duty Pharmacist (07417758578)</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Health Articles & Tips Preview */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">Community Wellness</span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">Health Tips & Medication Education</h2>
          </div>
          <button
            onClick={() => onNavigate('articles')}
            className="text-xs font-bold text-emerald-800 hover:text-emerald-950 flex items-center gap-1"
          >
            <span>Read all articles</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {articles.map((art) => (
            <div
              key={art.id}
              onClick={() => onNavigate('article-detail', { slug: art.slug })}
              className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-xl transition-all cursor-pointer flex flex-col justify-between group"
            >
              <div className="aspect-16/9 bg-slate-100 overflow-hidden">
                <img
                  src={art.imageUrl}
                  alt={art.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider bg-emerald-50 px-2 py-0.5 rounded-md">
                    {art.category}
                  </span>
                  <h3 className="font-bold text-slate-900 text-base mt-2 group-hover:text-emerald-800 transition-colors line-clamp-2">
                    {art.title}
                  </h3>
                  <p className="text-xs text-slate-600 mt-2 line-clamp-2 leading-relaxed">{art.excerpt}</p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                  <span>{art.readTime}</span>
                  <span className="font-bold text-emerald-800 group-hover:translate-x-1 transition-transform inline-flex items-center gap-0.5">
                    Read &rarr;
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Modal View */}
      {selectedProduct && (
        <ProductDetailModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onUploadPrescription={() => onNavigate('prescriptions')}
        />
      )}
    </div>
  );
};
