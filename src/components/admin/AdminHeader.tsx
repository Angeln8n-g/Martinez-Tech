import React, { useState, useRef, useEffect } from 'react';
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
  Receipt,
  UserCheck,
  ChevronDown,
  Radio
} from 'lucide-react';

interface NavGroup {
  id: string;
  name: string;
  tabs: {
    id: AdminTab;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: number;
    description?: string;
  }[];
}

export const AdminHeader: React.FC = () => {
  const { 
    adminTab, 
    setAdminTab, 
    setCurrentView, 
    setIsDealModalOpen, 
    setActiveDealForEdit,
    setIsQuoteModalOpen,
    setActiveQuoteForEdit,
    setIsVisitModalOpen,
    setActiveVisitForEdit,
    setIsWorkOrderModalOpen,
    setActiveWorkOrderForEdit,
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
    invoices,
    users,
    clients
  } = useAppState();

  const [isNewActionOpen, setIsNewActionOpen] = useState(false);
  const actionMenuRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside or Escape
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (actionMenuRef.current && !actionMenuRef.current.contains(event.target as Node)) {
        setIsNewActionOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsNewActionOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleNewDeal = () => {
    setActiveDealForEdit(null);
    setIsDealModalOpen(true);
    setIsNewActionOpen(false);
  };

  const handleNewQuote = () => {
    setActiveQuoteForEdit(null);
    setIsQuoteModalOpen(true);
    setIsNewActionOpen(false);
  };

  const handleNewVisit = () => {
    setActiveVisitForEdit(null);
    setIsVisitModalOpen(true);
    setIsNewActionOpen(false);
  };

  const handleNewWorkOrder = () => {
    setActiveWorkOrderForEdit(null);
    setIsWorkOrderModalOpen(true);
    setIsNewActionOpen(false);
  };

  // Consolidated Navigation Clusters
  const navGroups: NavGroup[] = [
    {
      id: 'commercial',
      name: 'Comercial',
      tabs: [
        { id: 'pipeline', label: 'Negociaciones', icon: Kanban, badge: deals.length },
        { id: 'quotes', label: 'Presupuestos', icon: FileText, badge: quotes.length },
        { id: 'clients', label: 'Clientes', icon: Users, badge: clients.length },
      ]
    },
    {
      id: 'operations',
      name: 'Operaciones',
      tabs: [
        { id: 'work_orders', label: 'Órdenes de Trabajo', icon: Wrench, badge: workOrders.length },
        { id: 'calendar', label: 'Agenda Técnica', icon: Calendar, badge: visits.length },
        { id: 'catalog', label: 'Catálogo & Precios', icon: Package },
      ]
    },
    {
      id: 'finance',
      name: 'Finanzas & Fiscal',
      tabs: [
        { id: 'invoices', label: 'Facturación NCF', icon: Receipt, badge: invoices.length },
        { id: 'payments', label: 'Cobros & Recibos', icon: DollarSign, badge: payments.length },
      ]
    },
    {
      id: 'system',
      name: 'Sistema',
      tabs: [
        { id: 'portfolio', label: 'Portafolio Web', icon: Layers },
        ...(currentUser?.role === 'admin' ? [{ id: 'users' as AdminTab, label: 'Usuarios', icon: UserCheck, badge: users.length }] : []),
      ]
    }
  ];

  return (
    <header className="bg-white dark:bg-slate-900 border-b border-slate-300 dark:border-slate-800 sticky top-0 z-40 shadow-sm transition-colors duration-200">
      
      {/* Top Bar: Brand, Status & Quick Action Cluster */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex items-center justify-between gap-3">
        
        {/* Left: Brand Identity & Telemetry Status */}
        <div className="flex items-center gap-3">
          <BrandLogo size="md" showSubtitle={false} onClick={() => setCurrentView('public')} />
          
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800/90 border border-slate-300 dark:border-cyan-500/30 text-[10px] font-mono font-bold tracking-wider uppercase text-cyan-700 dark:text-cyan-400 shadow-2xs">
            <Radio className="w-3 h-3 text-brand-teal-500 animate-pulse" />
            <span>TERMINAL CRM</span>
          </div>
          
          <div 
            className={`hidden md:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-mono font-semibold border ${
              isServerConnected 
                ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-400 border-emerald-400 dark:border-emerald-500/30' 
                : 'bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-400 border-amber-400 dark:border-amber-500/30'
            }`}
            title={isServerConnected ? 'Conectado a la API REST del Servidor' : 'Operando en Modo Local (LocalStorage)'}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${isServerConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
            <span>{isServerConnected ? 'BACKEND ACTIVO' : 'MODO LOCAL'}</span>
          </div>
        </div>

        {/* Right: Unified Action Menu, Utility Tools & Session */}
        <div className="flex items-center gap-2">
          
          {/* Unified Create Action Button with Dropdown */}
          <div className="relative" ref={actionMenuRef}>
            <button
              onClick={() => setIsNewActionOpen(!isNewActionOpen)}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-brand-teal-600 hover:bg-brand-teal-500 text-white font-bold text-xs shadow-md border border-brand-teal-700/30 transition-all active:scale-95"
              aria-expanded={isNewActionOpen}
              aria-haspopup="true"
              aria-label="Crear Nuevo Registro"
            >
              <Plus className="w-4 h-4 text-white" />
              <span>Nuevo</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isNewActionOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu */}
            {isNewActionOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl shadow-xl py-1.5 z-50 animate-fadeIn">
                <div className="px-3 py-1 text-[10px] font-mono font-bold uppercase text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 mb-1">
                  Acciones Rápidas
                </div>
                
                <button
                  onClick={handleNewQuote}
                  className="w-full text-left px-3 py-2 text-xs font-semibold text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2.5 transition-colors"
                >
                  <div className="p-1.5 rounded-lg bg-brand-teal-100 dark:bg-brand-teal-950/80 text-brand-teal-700 dark:text-brand-teal-300">
                    <Calculator className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold">Nuevo Presupuesto</div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400 font-normal">Cotización formal con margen</div>
                  </div>
                </button>

                <button
                  onClick={handleNewDeal}
                  className="w-full text-left px-3 py-2 text-xs font-semibold text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2.5 transition-colors"
                >
                  <div className="p-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300">
                    <Kanban className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold">Nueva Negociación</div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400 font-normal">Lead o prospecto en CRM</div>
                  </div>
                </button>

                <button
                  onClick={handleNewWorkOrder}
                  className="w-full text-left px-3 py-2 text-xs font-semibold text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2.5 transition-colors"
                >
                  <div className="p-1.5 rounded-lg bg-cyan-100 dark:bg-cyan-950/80 text-cyan-700 dark:text-cyan-300">
                    <Wrench className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold">Orden de Trabajo</div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400 font-normal">Acta de entrega & fotos</div>
                  </div>
                </button>

                <button
                  onClick={handleNewVisit}
                  className="w-full text-left px-3 py-2 text-xs font-semibold text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2.5 transition-colors"
                >
                  <div className="p-1.5 rounded-lg bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold">Agendar Visita Técnica</div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400 font-normal">Levantamiento en campo</div>
                  </div>
                </button>
              </div>
            )}
          </div>

          {/* Quick Utility Cluster */}
          <div className="flex items-center gap-1.5 pl-1">
            
            {/* WhatsApp Center */}
            <button
              onClick={() => openWhatsAppTemplates('quote')}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 border border-slate-300 dark:border-slate-700 transition-colors shadow-2xs"
              title="Centro de Plantillas WhatsApp 1-Clic"
              aria-label="Plantillas de WhatsApp"
            >
              <MessageCircle className="w-4 h-4" />
            </button>

            {/* Financial Reports */}
            <button
              onClick={() => setIsReportsModalOpen(true)}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 hover:text-purple-600 dark:hover:text-purple-400 border border-slate-300 dark:border-slate-700 transition-colors shadow-2xs"
              title="Reportes Financieros & DGII 607"
              aria-label="Reportes Financieros"
            >
              <FileSpreadsheet className="w-4 h-4" />
            </button>

            {/* Settings (Admin only) */}
            {currentUser?.role === 'admin' && (
              <button
                onClick={() => setIsSettingsModalOpen(true)}
                className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700 transition-colors shadow-2xs"
                title="Configuración de la Empresa"
                aria-label="Configuración de la Empresa"
              >
                <Settings className="w-4 h-4" />
              </button>
            )}

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700 transition-colors shadow-2xs"
              title={theme === 'dark' ? 'Cambiar a Modo Claro' : 'Cambiar a Modo Oscuro'}
              aria-label={theme === 'dark' ? 'Cambiar a Modo Claro' : 'Cambiar a Modo Oscuro'}
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
            </button>

            {/* View Public Web */}
            <button
              onClick={() => setCurrentView('public')}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700 transition-colors shadow-2xs"
              title="Ver Sitio Web Público"
              aria-label="Ver Sitio Web Público"
            >
              <Globe className="w-4 h-4 text-brand-teal-600 dark:text-brand-teal-400" />
            </button>
          </div>

          {/* User Profile & Logout */}
          <div className="flex items-center gap-1.5 pl-2 border-l border-slate-300 dark:border-slate-800">
            <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800/90 py-1 px-2.5 rounded-xl border border-slate-300 dark:border-slate-700 shadow-2xs">
              <div className="w-6 h-6 rounded-full bg-slate-900 dark:bg-cyan-500/20 text-cyan-600 dark:text-cyan-300 border border-cyan-500/40 font-mono font-bold text-[10px] flex items-center justify-center">
                {currentUser?.avatar || 'MT'}
              </div>
              <div className="hidden lg:block text-left">
                <div className="text-[11px] font-bold text-slate-900 dark:text-white leading-tight">
                  {currentUser?.name || 'Rafael Martínez'}
                </div>
                <div className="text-[9px] font-mono text-cyan-600 dark:text-cyan-400 font-bold uppercase">
                  {currentUser?.role === 'admin' ? 'ADMIN' : 'TÉCNICO'}
                </div>
              </div>
            </div>

            <button
              onClick={logout}
              className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/60 border border-rose-200 dark:border-rose-800/60 transition-colors shadow-2xs"
              title="Cerrar Sesión"
              aria-label="Cerrar Sesión"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>

        </div>

      </div>

      {/* Sub-Navigation Bar: Structured Domain Clusters */}
      <div className="border-t border-slate-200 dark:border-slate-800/90 bg-slate-50/80 dark:bg-slate-950/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-1.5 flex items-center gap-1 sm:gap-2 overflow-x-auto scrollbar-none">
          
          {/* Dashboard Direct Tab */}
          <button
            onClick={() => setAdminTab('dashboard')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
              adminTab === 'dashboard'
                ? 'bg-brand-teal-600 text-white shadow-sm'
                : 'text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white hover:bg-slate-200/70 dark:hover:bg-slate-800/70'
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span>Dashboard</span>
          </button>

          <div className="h-4 w-px bg-slate-300 dark:bg-slate-800 mx-1 hidden sm:block" />

          {/* Grouped Modules */}
          {navGroups.map((group) => {
            const hasActiveTab = group.tabs.some(t => t.id === adminTab);

            return (
              <div 
                key={group.id} 
                className={`flex items-center gap-1 px-1.5 py-0.5 rounded-xl border transition-all ${
                  hasActiveTab 
                    ? 'bg-slate-200/60 dark:bg-slate-900/90 border-slate-300 dark:border-slate-700 shadow-2xs' 
                    : 'border-transparent'
                }`}
              >
                <span className="hidden xl:inline text-[9px] font-mono font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 px-1">
                  {group.name}
                </span>

                {group.tabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = adminTab === tab.id;
                  
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setAdminTab(tab.id)}
                      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                        isActive
                          ? 'bg-brand-teal-600 text-white shadow-sm font-bold'
                          : 'text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white hover:bg-slate-200/80 dark:hover:bg-slate-800/80'
                      }`}
                      title={tab.label}
                    >
                      <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-slate-600 dark:text-slate-400'}`} />
                      <span>{tab.label}</span>
                      {tab.badge !== undefined && tab.badge > 0 && (
                        <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                          isActive 
                            ? 'bg-white/20 text-white' 
                            : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700'
                        }`}>
                          {tab.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            );
          })}

        </div>
      </div>

    </header>
  );
};
