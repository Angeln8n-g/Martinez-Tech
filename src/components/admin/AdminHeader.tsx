import React from 'react';
import { BrandLogo } from '../ui/BrandLogo';
import { useAppState, AdminTab } from '../../context/AppStateContext';
import { 
  LayoutDashboard, 
  Kanban, 
  FileText, 
  DollarSign,
  Calendar,
  Package,
  Users, 
  Layers, 
  Settings, 
  Globe, 
  Plus, 
  Sun, 
  Moon, 
  Calculator, 
  LogOut,
  Wrench,
  MessageCircle,
  FileSpreadsheet,
  Receipt
} from 'lucide-react';

export const AdminHeader: React.FC = () => {
  const { 
    adminTab, 
    setAdminTab, 
    setCurrentView, 
    setIsDealModalOpen, 
    setActiveDealForEdit,
    setIsQuoteModalOpen,
    setActiveQuoteForEdit,
    setIsSettingsModalOpen,
    setIsReportsModalOpen,
    openWhatsAppTemplates,
    theme, 
    toggleTheme, 
    isServerConnected, 
    currentUser, 
    logout, 
    deals, 
    quotes, 
    payments, 
    visits,
    workOrders,
    invoices
  } = useAppState();

  const handleNewDeal = () => {
    setActiveDealForEdit(null);
    setIsDealModalOpen(true);
  };

  const handleNewQuote = () => {
    setActiveQuoteForEdit(null);
    setIsQuoteModalOpen(true);
  };

  const navTabs: { id: AdminTab; label: string; icon: any; badge?: number }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'pipeline', label: 'Negociaciones', icon: Kanban, badge: deals.length },
    { id: 'quotes', label: 'Presupuestos', icon: FileText, badge: quotes.length },
    { id: 'invoices', label: 'Facturación Fiscal (NCF)', icon: Receipt, badge: invoices.length },
    { id: 'payments', label: 'Cobros & Recibos', icon: DollarSign, badge: payments.length },
    { id: 'work_orders', label: 'Órdenes de Trabajo', icon: Wrench, badge: workOrders.length },
    { id: 'calendar', label: 'Agenda Técnica', icon: Calendar, badge: visits.length },
    { id: 'catalog', label: 'Catálogo & Precios', icon: Package },
    { id: 'clients', label: 'Directorio Clientes', icon: Users },
    { id: 'portfolio', label: 'Portafolio Web', icon: Layers },
  ];

  return (
    <header className="bg-white dark:bg-slate-900 border-b border-slate-300 dark:border-slate-800 sticky top-0 z-40 shadow-sm transition-colors duration-200">
      
      {/* Top Row */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-wrap items-center justify-between gap-3">
        
        {/* Brand, CRM Badge & Server Connection */}
        <div className="flex items-center gap-3">
          <BrandLogo size="md" showSubtitle={false} onClick={() => setCurrentView('public')} />
          <span className="hidden sm:inline-flex px-2.5 py-0.5 rounded-md bg-brand-teal-50 dark:bg-brand-teal-950/80 border border-brand-teal-300 dark:border-brand-teal-500/30 text-brand-teal-800 dark:text-brand-teal-400 text-[11px] font-bold tracking-wide uppercase shadow-sm">
            Sistema CRM
          </span>
          
          <div 
            className={`hidden md:inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-semibold border ${
              isServerConnected 
                ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-400 border-emerald-400 dark:border-emerald-500/30 shadow-sm' 
                : 'bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-400 border-amber-400 dark:border-amber-500/30 shadow-sm'
            }`}
            title={isServerConnected ? 'Conectado a la API REST del Servidor' : 'Operando en Modo Local (LocalStorage)'}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${isServerConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
            <span>{isServerConnected ? 'Backend Activo' : 'Modo Local'}</span>
          </div>
        </div>

        {/* Global Actions & User Profile */}
        <div className="flex items-center gap-2 flex-wrap">
          
          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:border-brand-teal-500 transition-colors shadow-sm"
            title={theme === 'dark' ? 'Cambiar a Modo Claro' : 'Cambiar a Modo Oscuro'}
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
          </button>

          {/* WhatsApp Templates Button */}
          <button
            onClick={() => openWhatsAppTemplates('quote')}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 border border-emerald-300 dark:border-emerald-500/30 text-emerald-800 dark:text-emerald-300 font-bold text-xs shadow-sm transition-colors"
            title="Centro de Mensajería WhatsApp 1-Clic"
          >
            <MessageCircle className="w-4 h-4 text-emerald-600" />
            <span className="hidden sm:inline">WhatsApp</span>
          </button>

          {/* Financial Reports Button */}
          <button
            onClick={() => setIsReportsModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-purple-50 dark:bg-purple-950/60 hover:bg-purple-100 border border-purple-300 dark:border-purple-500/30 text-purple-800 dark:text-purple-300 font-bold text-xs shadow-sm transition-colors"
            title="Reportes Financieros y Exportación a Excel"
          >
            <FileSpreadsheet className="w-4 h-4 text-purple-600" />
            <span className="hidden sm:inline">Reportes</span>
          </button>

          {/* Quick Create Deal */}
          <button
            onClick={handleNewDeal}
            className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl bg-brand-green-600 hover:bg-brand-green-500 text-slate-950 font-bold text-xs shadow-md border border-brand-green-700/20 transition-colors"
          >
            <Plus className="w-4 h-4 text-slate-950" />
            <span>Negociación</span>
          </button>

          {/* Quick Create Quote */}
          <button
            onClick={handleNewQuote}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-brand-teal-600 hover:bg-brand-teal-500 text-white font-bold text-xs shadow-md border border-brand-teal-700/20 transition-colors"
          >
            <Calculator className="w-4 h-4" />
            <span>Presupuesto</span>
          </button>

          {/* Settings */}
          {currentUser?.role === 'admin' && (
            <button
              onClick={() => setIsSettingsModalOpen(true)}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700 transition-colors shadow-sm"
              title="Configuración de la Empresa"
            >
              <Settings className="w-4 h-4" />
            </button>
          )}

          {/* View Public Website */}
          <button
            onClick={() => setCurrentView('public')}
            className="flex items-center gap-1 px-2.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold border border-slate-300 dark:border-slate-700 shadow-sm"
            title="Ver Sitio Web Público"
          >
            <Globe className="w-4 h-4 text-brand-teal-600 dark:text-brand-teal-400" />
            <span className="hidden sm:inline">Web</span>
          </button>

          {/* User Badge & Logout */}
          <div className="flex items-center gap-2 pl-2 border-l border-slate-300 dark:border-slate-800">
            <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 py-1 px-2.5 rounded-xl border border-slate-300 dark:border-slate-700 shadow-sm">
              <div className="w-6 h-6 rounded-full bg-gradient-to-r from-brand-teal-500 to-brand-green-500 text-slate-950 font-black text-[10px] flex items-center justify-center">
                {currentUser?.avatar || 'MT'}
              </div>
              <div className="hidden lg:block text-left">
                <div className="text-[11px] font-bold text-slate-900 dark:text-white leading-tight">
                  {currentUser?.name || 'Rafael Martínez'}
                </div>
                <div className="text-[9px] text-brand-teal-700 dark:text-brand-teal-400 font-bold uppercase">
                  {currentUser?.role === 'admin' ? 'Administrador' : 'Técnico Campo'}
                </div>
              </div>
            </div>

            <button
              onClick={logout}
              className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 hover:bg-rose-100 border border-rose-200 dark:border-rose-800/60 shadow-sm"
              title="Cerrar Sesión"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>

        </div>

      </div>

      {/* Navigation Sub-header (Tabs) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-slate-200 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/50">
        <nav className="flex space-x-1 sm:space-x-2 overflow-x-auto py-2 scrollbar-none">
          {navTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = adminTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setAdminTab(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-brand-teal-600 text-white shadow-md'
                    : 'text-slate-700 dark:text-slate-400 hover:text-black dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/80'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500 dark:text-slate-400'}`} />
                <span>{tab.label}</span>
                {tab.badge !== undefined && tab.badge > 0 && (
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold ${
                    isActive 
                      ? 'bg-white/20 text-white' 
                      : 'bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-300'
                  }`}>
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

    </header>
  );
};
