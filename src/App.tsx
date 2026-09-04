import React, { useState, useEffect } from 'react';
import { AppStateProvider, useAppState } from './context/AppStateContext';
import { ToastProvider } from './components/ui/ToastNotification';

// Public Components
import { Navbar } from './components/public/Navbar';
import { Hero } from './components/public/Hero';
import { ProjectsBanner } from './components/public/ProjectsBanner';
import { ServicesSection } from './components/public/ServicesSection';
import { QuickEstimator } from './components/public/QuickEstimator';
import { WhyUs } from './components/public/WhyUs';
import { TestimonialsSection } from './components/public/TestimonialsSection';
import { ContactSection } from './components/public/ContactSection';
import { Footer } from './components/public/Footer';
import { ClientProposalPortal } from './components/public/ClientProposalPortal';

// Admin Components
import { AdminHeader } from './components/admin/AdminHeader';
import { DashboardOverview } from './components/admin/DashboardOverview';
import { PipelineKanban } from './components/admin/PipelineKanban';
import { QuotesList } from './components/admin/QuotesList';
import { PaymentsManager } from './components/admin/PaymentsManager';
import { WorkOrdersList } from './components/admin/WorkOrdersList';
import { FiscalInvoicesList } from './components/admin/FiscalInvoicesList';
import { CalendarSchedule } from './components/admin/CalendarSchedule';
import { CatalogManager } from './components/admin/CatalogManager';
import { ClientDirectory } from './components/admin/ClientDirectory';
import { PortfolioManager } from './components/admin/PortfolioManager';
import { UserManager } from './components/admin/UserManager';
import { AuditTrailView } from './components/admin/AuditTrailView';

// Modals
import { LoginModal } from './components/auth/LoginModal';
import { DealModal } from './components/admin/DealModal';
import { QuoteBuilderModal } from './components/admin/QuoteBuilderModal';
import { QuoteDocumentView } from './components/admin/QuoteDocumentView';
import { PaymentRegisterModal } from './components/admin/PaymentRegisterModal';
import { PaymentReceiptView } from './components/admin/PaymentReceiptView';
import { VisitModal } from './components/admin/VisitModal';
import { WorkOrderModal } from './components/admin/WorkOrderModal';
import { WorkOrderDocumentView } from './components/admin/WorkOrderDocumentView';
import { FiscalInvoiceModal } from './components/admin/FiscalInvoiceModal';
import { FiscalInvoiceDocumentView } from './components/admin/FiscalInvoiceDocumentView';
import { CatalogBulkImportModal } from './components/admin/CatalogBulkImportModal';
import { WhatsAppTemplatesModal } from './components/admin/WhatsAppTemplatesModal';
import { FinancialReportsModal } from './components/admin/FinancialReportsModal';
import { SettingsModal } from './components/admin/SettingsModal';

// Floating WhatsApp button
import { MessageCircle } from 'lucide-react';
import { createWhatsAppUrl } from './utils/formatters';

const MainContent: React.FC = () => {
  const { 
    currentView, 
    setCurrentView,
    adminTab, 
    companySettings, 
    isAuthenticated, 
    setIsLoginModalOpen 
  } = useAppState();

  const [proposalParam, setProposalParam] = useState<string | null>(() => {
    const params = new URLSearchParams(window.location.search);
    const p = params.get('propuesta') || params.get('quote') || params.get('cotizacion');
    if (p) return p;
    const hash = window.location.hash;
    if (hash.includes('propuesta/')) {
      return hash.split('propuesta/')[1]?.split('?')[0] || null;
    }
    return null;
  });

  useEffect(() => {
    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search);
      const p = params.get('propuesta') || params.get('quote') || params.get('cotizacion');
      if (p) {
        setProposalParam(p);
      } else {
        const hash = window.location.hash;
        if (hash.includes('propuesta/')) {
          setProposalParam(hash.split('propuesta/')[1]?.split('?')[0] || null);
        } else {
          setProposalParam(null);
        }
      }
    };
    window.addEventListener('popstate', handlePopState);
    window.addEventListener('hashchange', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('hashchange', handlePopState);
    };
  }, []);

  const handleWhatsAppFloating = () => {
    const text = `¡Hola! Me comunico desde el sitio web de Martínez Tech para una consulta técnica.`;
    window.open(createWhatsAppUrl(companySettings.whatsapp, text), '_blank');
  };

  // Render Public Proposal Portal if accessed via proposal link
  if (proposalParam) {
    return (
      <ClientProposalPortal 
        quoteIdentifier={proposalParam} 
        onBackToHome={() => {
          setProposalParam(null);
          const url = new URL(window.location.href);
          url.searchParams.delete('propuesta');
          url.searchParams.delete('quote');
          url.searchParams.delete('cotizacion');
          window.history.pushState({}, '', url.pathname);
        }} 
      />
    );
  }

  // Protect Admin Access
  if (currentView === 'admin' && !isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex items-center justify-center p-4">
        <LoginModal />
        <div className="text-center space-y-4 max-w-sm">
          <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-500/30 text-amber-900 dark:text-amber-300 text-xs font-semibold">
            ⚠️ Se requiere autenticación para acceder al Sistema CRM.
          </div>
          <button
            onClick={() => setIsLoginModalOpen(true)}
            className="w-full py-3 rounded-xl bg-brand-teal-600 hover:bg-brand-teal-500 text-white font-black text-xs shadow-md"
          >
            Iniciar Sesión
          </button>
          <button
            onClick={() => setCurrentView('public')}
            className="text-xs text-slate-600 dark:text-slate-400 hover:underline font-bold"
          >
            Volver al Sitio Web Público
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col justify-between selection:bg-brand-teal-500 selection:text-white transition-colors duration-200">
      
      {currentView === 'public' ? (
        /* ================= PUBLIC WEBSITE ================= */
        <>
          <Navbar />
          <main className="flex-1">
            <Hero />
            <ProjectsBanner />
            <ServicesSection />
            <QuickEstimator />
            <WhyUs />
            <TestimonialsSection />
            <ContactSection />
          </main>
          <Footer />

          {/* Floating WhatsApp Button */}
          <button
            onClick={handleWhatsAppFloating}
            className="fixed bottom-6 right-6 z-40 p-3.5 sm:p-4 rounded-full bg-emerald-500 hover:bg-emerald-400 text-white shadow-xl hover:scale-110 active:scale-95 transition-all duration-300 flex items-center justify-center group border border-emerald-600/30"
            aria-label="Chatear por WhatsApp"
          >
            <MessageCircle className="w-6 h-6 sm:w-7 sm:h-7" />
            <span className="max-w-0 overflow-hidden whitespace-nowrap group-hover:max-w-xs transition-all duration-500 ease-in-out font-black text-xs pl-0 group-hover:pl-2">
              WhatsApp
            </span>
          </button>
        </>
      ) : (
        /* ================= ADMIN CRM SYSTEM ================= */
        <div className="min-h-screen flex flex-col bg-slate-100/60 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200">
          <AdminHeader />
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
            {adminTab === 'dashboard' && <DashboardOverview />}
            {adminTab === 'pipeline' && <PipelineKanban />}
            {adminTab === 'quotes' && <QuotesList />}
            {adminTab === 'invoices' && <FiscalInvoicesList />}
            {adminTab === 'payments' && <PaymentsManager />}
            {adminTab === 'work_orders' && <WorkOrdersList />}
            {adminTab === 'calendar' && <CalendarSchedule />}
            {adminTab === 'catalog' && <CatalogManager />}
            {adminTab === 'clients' && <ClientDirectory />}
            {adminTab === 'portfolio' && <PortfolioManager />}
            {adminTab === 'users' && <UserManager />}
            {adminTab === 'audit' && <AuditTrailView />}
          </main>
        </div>
      )}

      {/* Global Modals */}
      <LoginModal />
      <DealModal />
      <QuoteBuilderModal />
      <QuoteDocumentView />
      <PaymentRegisterModal />
      <PaymentReceiptView />
      <VisitModal />
      <WorkOrderModal />
      <WorkOrderDocumentView />
      <FiscalInvoiceModal />
      <FiscalInvoiceDocumentView />
      <CatalogBulkImportModal />
      <WhatsAppTemplatesModal />
      <FinancialReportsModal />
      <SettingsModal />

    </div>
  );
};

export default function App() {
  return (
    <AppStateProvider>
      <ToastProvider>
        <MainContent />
      </ToastProvider>
    </AppStateProvider>
  );
}
