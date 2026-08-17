import React, { useState, useEffect } from 'react';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { EmergencyBanner } from './components/common/EmergencyBanner';
import { CartDrawer } from './components/common/CartDrawer';
import { AIHealthAssistantModal } from './components/common/AIHealthAssistantModal';
import { ProductDetailModal } from './components/common/ProductDetailModal';

// Pages
import { HomePage } from './pages/HomePage';
import { CatalogPage } from './pages/CatalogPage';
import { PrescriptionUploadPage } from './pages/PrescriptionUploadPage';
import { ServicesPage } from './pages/ServicesPage';
import { TalkToDoctorPage } from './pages/TalkToDoctorPage';
import { AppointmentsPage } from './pages/AppointmentsPage';
import { OrderTrackPage } from './pages/OrderTrackPage';
import { CartCheckoutPage } from './pages/CartCheckoutPage';
import { ArticlesPage } from './pages/ArticlesPage';
import { ArticleDetailPage } from './pages/ArticleDetailPage';
import { ContactPage } from './pages/ContactPage';
import { AuthPage } from './pages/AuthPage';
import { AdminPage } from './pages/AdminPage';
import { AccountPage } from './pages/AccountPage';

import { Product } from './types';
import { MessageCircle, Sparkles, PhoneCall } from 'lucide-react';

function AppContent() {
  const [currentView, setCurrentView] = useState<string>('home');
  const [viewParams, setViewParams] = useState<any>({});

  // Modals
  const [isAIModalOpen, setIsAIModalOpen] = useState<boolean>(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Scroll to top on view changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentView, viewParams]);

  const handleNavigate = (view: string, data?: any) => {
    setCurrentView(view);
    setViewParams(data || {});
  };

  const handleOpenProduct = (product: Product) => {
    setSelectedProduct(product);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 selection:bg-emerald-200 selection:text-emerald-950 font-sans">
      {/* Top Clinical & Doctor Hotline Alert */}
      <EmergencyBanner />

      {/* Main Global Navigation */}
      <Navbar
        currentView={currentView}
        onNavigate={handleNavigate}
        onOpenAIAssistant={() => setIsAIModalOpen(true)}
      />

      {/* Main Dynamic View Outlet */}
      <main className="flex-1">
        {currentView === 'home' && (
          <HomePage
            onNavigate={handleNavigate}
            onOpenProduct={handleOpenProduct}
            onOpenAIAssistant={() => setIsAIModalOpen(true)}
          />
        )}

        {currentView === 'catalog' && (
          <CatalogPage
            initialCategory={viewParams.category}
            initialSearch={viewParams.search}
            onOpenProduct={handleOpenProduct}
            onUploadPrescription={() => handleNavigate('prescriptions')}
          />
        )}

        {currentView === 'prescriptions' && (
          <PrescriptionUploadPage onNavigate={handleNavigate} />
        )}

        {currentView === 'services' && (
          <ServicesPage onNavigate={handleNavigate} />
        )}

        {currentView === 'talk-to-doctor' && (
          <TalkToDoctorPage
            onNavigate={handleNavigate}
            onOpenAIAssistant={() => setIsAIModalOpen(true)}
          />
        )}

        {currentView === 'appointments' && (
          <AppointmentsPage
            initialServiceId={viewParams.serviceId}
            onNavigate={handleNavigate}
          />
        )}

        {currentView === 'track' && (
          <OrderTrackPage
            initialOrderNumber={viewParams.orderNumber}
            onNavigate={handleNavigate}
          />
        )}

        {currentView === 'cart' && (
          <CartCheckoutPage
            onNavigate={handleNavigate}
            onUploadPrescription={() => handleNavigate('prescriptions')}
          />
        )}

        {currentView === 'articles' && (
          <ArticlesPage onNavigate={handleNavigate} />
        )}

        {currentView === 'article-detail' && (
          <ArticleDetailPage
            slug={viewParams.slug || 'safe-antibiotic-use-kenya'}
            onNavigate={handleNavigate}
          />
        )}

        {currentView === 'contact' && <ContactPage />}

        {currentView === 'auth' && (
          <AuthPage
            onSuccess={() => handleNavigate('account')}
            onNavigate={handleNavigate}
          />
        )}

        {currentView === 'admin' && (
          <AdminPage onNavigate={handleNavigate} />
        )}

        {currentView === 'account' && (
          <AccountPage onNavigate={handleNavigate} />
        )}
      </main>

      {/* Global Modals & Drawers */}
      <CartDrawer
        onProceedToCheckout={() => handleNavigate('cart')}
        onUploadPrescription={() => handleNavigate('prescriptions')}
      />

      <AIHealthAssistantModal
        isOpen={isAIModalOpen}
        onClose={() => setIsAIModalOpen(false)}
      />

      <ProductDetailModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onUploadPrescription={() => {
          setSelectedProduct(null);
          handleNavigate('prescriptions');
        }}
      />

      {/* Floating Quick Action Buttons (AI Assistant & WhatsApp Doctor Hotline) */}
      <div className="fixed bottom-5 right-5 z-40 flex flex-col items-end gap-3 pointer-events-auto">
        {/* Instant AI Health Assistant Pill */}
        <button
          id="floating-ai-assistant-btn"
          onClick={() => setIsAIModalOpen(true)}
          className="group bg-emerald-800 hover:bg-emerald-900 text-white p-3 sm:px-4 sm:py-2.5 rounded-full shadow-2xl flex items-center gap-2 transition-all hover:scale-105 border border-emerald-600/60"
          title="Ask AI Virtual Pharmacist"
        >
          <div className="w-7 h-7 rounded-full bg-emerald-700 flex items-center justify-center text-emerald-200 group-hover:rotate-12 transition-transform">
            <Sparkles className="w-4 h-4" />
          </div>
          <span className="text-xs font-bold hidden sm:inline tracking-wide">
            AI Health Guide
          </span>
        </button>

        {/* WhatsApp Clinical Line Floating Button */}
        <a
          id="floating-whatsapp-doctor-btn"
          href="https://wa.me/2547417758578?text=Hello%20Gods%20Favor%20Pharmacy,%20I%20need%20assistance%20with%20medication%20or%20a%20consultation."
          target="_blank"
          rel="noopener noreferrer"
          className="bg-emerald-600 hover:bg-emerald-700 text-white p-3.5 rounded-full shadow-2xl flex items-center justify-center transition-all hover:scale-110 border-2 border-white"
          title="Chat with Pharmacist on WhatsApp (07417758578)"
        >
          <MessageCircle className="w-6 h-6" />
        </a>
      </div>

      {/* Global Comprehensive Footer */}
      <Footer onNavigate={handleNavigate} />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <AppContent />
      </CartProvider>
    </AuthProvider>
  );
}
