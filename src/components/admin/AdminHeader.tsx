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
  Radio,
  ShieldCheck,
  Search,
  LayoutGrid,
  X
} from 'lucide-react';
import { CommandPaletteModal } from './CommandPaletteModal';
import { ModuleCardsGrid } from './ModuleCardsGrid';

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
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isGridNavOpen, setIsGridNavOpen] = useState(false);
  const [activeClusterDropdown, setActiveClusterDropdown] = useState<string | null>(null);
  const actionMenuRef = useRef<HTMLDivElement>(null);
  const clusterMenuRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside or Escape, and listen for Ctrl+K
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (actionMenuRef.current && !actionMenuRef.current.contains(event.target as Node)) {
        setIsNewActionOpen(false);
      }
      if (clusterMenuRef.current && !clusterMenuRef.current.contains(event.target as Node)) {
        setActiveClusterDropdown(null);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsNewActionOpen(false);
        setActiveClusterDropdown(null);
      }
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setIsCommandPaletteOpen(prev => !prev);
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

  // Role Access Evaluation (RBAC)
  const isTechnician = currentUser?.role === 'technician';
  const isSeller = currentUser?.role === 'seller';
  const isAdmin = currentUser?.role === 'admin' || !currentUser?.role;

  // Consolidated Navigation Clusters with RBAC
  const navGroups: NavGroup[] = [];

  // 1. Comercial (Admin & Seller only)
  if (!isTechnician) {
    navGroups.push({
      id: 'commercial',
      name: 'Comercial',
      tabs: [
        { id: 'pipeline', label: 'Negociaciones', icon: Kanban, badge: deals.length },
        { id: 'quotes', label: 'Presupuestos', icon: FileText, badge: quotes.length },
        { id: 'clients', label: 'Clientes', icon: Users, badge: clients.length },
      ]
    });
  }

  // Filter counts for technician vs admin
  const calendarBadgeCount = isTechnician && currentUser
    ? visits.filter(v => 
        ((v.assignedTechnicianId && v.assignedTechnicianId === currentUser.id) ||
        (v.assignedTechnician && v.assignedTechnician.toLowerCase() === currentUser.name.toLowerCase())) &&
        v.status !== 'completed' && v.status !== 'cancelled'
      ).length
    : visits.length;

  const workOrdersBadgeCount = isTechnician && currentUser
    ? workOrders.filter(w => 
        w.assignedTechnician && w.assignedTechnician.toLowerCase().includes(currentUser.name.toLowerCase()) &&
        w.status !== 'completed'
      ).length
    : workOrders.length;

  // 2. Operaciones (Visible to All Roles)
  navGroups.push({
    id: 'operations',
    name: 'Operaciones',
    tabs: [
      { id: 'work_orders', label: 'Órdenes de Trabajo', icon: Wrench, badge: workOrdersBadgeCount },
      { id: 'calendar', label: 'Agenda Técnica', icon: Calendar, badge: calendarBadgeCount },
      { id: 'catalog', label: 'Catálogo & Precios', icon: Package },
    ]
  });

  // 3. Finanzas & Fiscal (Admin only)
  if (isAdmin) {
    navGroups.push({
      id: 'finance',
      name: 'Finanzas & Fiscal',
      tabs: [
        { id: 'invoices', label: 'Facturación NCF', icon: Receipt, badge: invoices.length },
        { id: 'payments', label: 'Cobros & Recibos', icon: DollarSign, badge: payments.length },
      ]
    });
  }

  // 4. Sistema & Auditoría
  const systemTabs: {
    id: AdminTab;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: number;
  }[] = [
    { id: 'portfolio' as AdminTab, label: 'Portafolio Web', icon: Layers },
  ];
  if (isAdmin) {
    systemTabs.push({ id: 'users' as AdminTab, label: 'Usuarios', icon: UserCheck, badge: users.length });
    systemTabs.push({ id: 'audit' as AdminTab, label: 'Auditoría', icon: ShieldCheck });
  }

  if (isAdmin || !isTechnician) {
    navGroups.push({
      id: 'system',
      name: 'Sistema',
      tabs: systemTabs
    });
  }

  // Flat list of all tabs to resolve breadcrumb and active module metadata
  const allTabs = [
    { id: 'dashboard' as AdminTab, label: 'Dashboard General', icon: LayoutDashboard },
    ...navGroups.flatMap(g => g.tabs)
  ];
  const currentActiveTabInfo = allTabs.find(t => t.id === adminTab) || allTabs[0];
  const CurrentActiveIcon = currentActiveTabInfo.icon;

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
          
          {/* Quick Search Spotlight Trigger */}
          <button
            onClick={() => setIsCommandPaletteOpen(true)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700/80 border border-slate-300 dark:border-slate-700 text-xs text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white transition-all shadow-xs group"
            title="Búsqueda rápida en todo el sistema (Ctrl+K)"
            aria-label="Abrir búsqueda rápida"
          >
            <Search className="w-3.5 h-3.5 text-slate-400 group-hover:text-brand-teal-500 transition-colors" />
            <span className="hidden sm:inline font-medium text-[11px]">Buscar...</span>
            <kbd className="hidden sm:inline-block text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-500 shadow-2xs">
              Ctrl K
            </kbd>
          </button>

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

      {/* Sub-Navigation Bar: Structured Domain Clusters (Zero Horizontal Scroll!) */}
      <div className="border-t border-slate-200 dark:border-slate-800 bg-slate-50/90 dark:bg-slate-950/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 flex flex-wrap items-center justify-between gap-3">
          
          {/* Left: Dashboard Button, Grid Cards Toggle & Current View Breadcrumb */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => {
                setAdminTab('dashboard');
                setIsGridNavOpen(false);
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-xs ${
                adminTab === 'dashboard' && !isGridNavOpen
                  ? 'bg-brand-teal-600 text-white shadow-sm'
                  : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700 hover:border-brand-teal-500'
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>Dashboard</span>
            </button>

            {/* Prominent Button: Módulos en Grilla (Cards View) */}
            <button
              onClick={() => setIsGridNavOpen(!isGridNavOpen)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-xs ${
                isGridNavOpen
                  ? 'bg-slate-900 text-white dark:bg-brand-teal-500 dark:text-slate-950 ring-2 ring-brand-teal-500/40'
                  : 'bg-brand-teal-50 text-brand-teal-800 dark:bg-brand-teal-950/60 dark:text-brand-teal-300 border border-brand-teal-300 dark:border-brand-teal-500/40 hover:bg-brand-teal-100 dark:hover:bg-brand-teal-900/50'
              }`}
              title="Alternar vista de cards en cuadrícula para mejor accesibilidad"
            >
              <LayoutGrid className="w-4 h-4" />
              <span>{isGridNavOpen ? 'Ocultar Grilla' : 'Módulos en Grilla'}</span>
              <span className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded ${
                isGridNavOpen 
                  ? 'bg-white/20 text-white dark:text-slate-950' 
                  : 'bg-brand-teal-200/70 dark:bg-brand-teal-900/60 text-brand-teal-900 dark:text-brand-teal-200'
              }`}>
                {isGridNavOpen ? '✕' : '⊞'}
              </span>
            </button>

            {/* Current Active Module Breadcrumb Pill */}
            {!isGridNavOpen && (
              <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-xl bg-white dark:bg-slate-900 text-xs text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 shadow-2xs">
                <span className="text-[10px] uppercase font-mono font-bold text-slate-400">Módulo:</span>
                <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <CurrentActiveIcon className="w-3.5 h-3.5 text-brand-teal-500" />
                  {currentActiveTabInfo.label}
                </span>
              </div>
            )}
          </div>

          {/* Right: Clustered Dropdowns (Wrapping smoothly, Never Horizontal Overflowing!) */}
          <div className="flex items-center gap-1.5 flex-wrap" ref={clusterMenuRef}>
            {navGroups.map((group) => {
              const hasActiveTab = group.tabs.some(t => t.id === adminTab);
              const isOpen = activeClusterDropdown === group.id;

              return (
                <div key={group.id} className="relative">
                  <button
                    onClick={() => setActiveClusterDropdown(isOpen ? null : group.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
                      hasActiveTab && !isGridNavOpen
                        ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 border-slate-900 dark:border-white shadow-sm font-bold'
                        : isOpen
                        ? 'bg-slate-200 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white'
                        : 'bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700/80 text-slate-700 dark:text-slate-300 hover:border-brand-teal-500 shadow-2xs'
                    }`}
                  >
                    <span>{group.name}</span>
                    <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-full ${
                      hasActiveTab && !isGridNavOpen
                        ? 'bg-white/20 text-white dark:bg-slate-900/20 dark:text-slate-900' 
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700'
                    }`}>
                      {group.tabs.length}
                    </span>
                    <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Dropdown Menu */}
                  {isOpen && (
                    <div className="absolute right-0 mt-1.5 w-60 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-2xl shadow-xl py-2 z-50 animate-fadeIn space-y-1">
                      <div className="px-3 py-1 text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 dark:border-slate-800 mb-1">
                        Área {group.name}
                      </div>
                      {group.tabs.map((tab) => {
                        const Icon = tab.icon;
                        const isTabActive = adminTab === tab.id;

                        return (
                          <button
                            key={tab.id}
                            onClick={() => {
                              setAdminTab(tab.id);
                              setActiveClusterDropdown(null);
                              setIsGridNavOpen(false);
                            }}
                            className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between gap-2 transition-colors ${
                              isTabActive
                                ? 'bg-brand-teal-50 dark:bg-brand-teal-950/60 text-brand-teal-700 dark:text-brand-teal-300 font-bold'
                                : 'text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                            }`}
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <Icon className={`w-4 h-4 shrink-0 ${isTabActive ? 'text-brand-teal-600 dark:text-brand-teal-400' : 'text-slate-500'}`} />
                              <span className="truncate">{tab.label}</span>
                            </div>
                            {tab.badge !== undefined && tab.badge > 0 && (
                              <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                                {tab.badge}
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

        </div>
      </div>

      {/* Expandable Module Cards Grid Panel (When toggled) */}
      {isGridNavOpen && (
        <div className="border-t border-slate-300 dark:border-slate-800 bg-slate-100/95 dark:bg-slate-950/95 backdrop-blur-md p-4 sm:p-6 animate-slideUp shadow-2xl">
          <div className="max-w-7xl mx-auto space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-brand-teal-500 text-slate-950 shadow-sm">
                  <LayoutGrid className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Centro de Navegación por Módulos (Vista de Tarjetas)
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Selecciona cualquier tarjeta para ir directamente a la sección correspondiente.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsGridNavOpen(false)}
                className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white shadow-sm flex items-center gap-1"
              >
                <X className="w-3.5 h-3.5" />
                <span>Cerrar Cuadrícula</span>
              </button>
            </div>

            <ModuleCardsGrid onSelectModule={() => setIsGridNavOpen(false)} />
          </div>
        </div>
      )}

      {/* Global Command Palette (Spotlight Ctrl+K) */}
      <CommandPaletteModal 
        isOpen={isCommandPaletteOpen} 
        onClose={() => setIsCommandPaletteOpen(false)} 
      />

    </header>
  );
};
