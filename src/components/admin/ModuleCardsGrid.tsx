import React from 'react';
import { useAppState, AdminTab } from '../../context/AppStateContext';
import { 
  Kanban, 
  FileText, 
  Users, 
  Wrench, 
  Calendar, 
  Package, 
  Receipt, 
  DollarSign, 
  Layers, 
  UserCheck, 
  ShieldCheck,
  ArrowRight,
  Sparkles,
  AlertTriangle,
  LayoutDashboard
} from 'lucide-react';

interface ModuleCardItem {
  id: AdminTab;
  label: string;
  category: 'Comercial' | 'Operaciones' | 'Finanzas' | 'Sistema';
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  iconBg: string;
  iconColor: string;
  badge?: string | number;
  badgeType?: 'info' | 'warning' | 'success' | 'neutral';
}

interface ModuleCardsGridProps {
  onSelectModule?: (tab: AdminTab) => void;
  className?: string;
  showCategoryHeaders?: boolean;
}

export const ModuleCardsGrid: React.FC<ModuleCardsGridProps> = ({ 
  onSelectModule, 
  className = '',
  showCategoryHeaders = true 
}) => {
  const { 
    adminTab, 
    setAdminTab, 
    deals, 
    quotes, 
    clients, 
    workOrders, 
    visits, 
    catalog, 
    invoices, 
    payments, 
    users, 
    currentUser 
  } = useAppState();

  const isTechnician = currentUser?.role === 'technician';
  const isAdmin = currentUser?.role === 'admin' || !currentUser?.role;

  const lowStockCount = (catalog || []).filter(p => p.type === 'product' && (typeof p.stock !== 'number' || p.stock <= 3)).length;
  const pendingQuotesCount = quotes.filter(q => q.status === 'sent' || q.status === 'draft').length;
  const activeOrdersCount = workOrders.filter(w => w.status === 'pending' || !w.clientSignature).length;

  const modules: ModuleCardItem[] = [
    // Comercial
    ...(!isTechnician ? [
      {
        id: 'pipeline' as AdminTab,
        label: 'Negociaciones CRM',
        category: 'Comercial' as const,
        description: 'Embudo de ventas, seguimiento de prospectos y cierre',
        icon: Kanban,
        iconBg: 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-200 dark:border-indigo-800/60',
        iconColor: 'text-indigo-600 dark:text-indigo-400',
        badge: `${deals.length} deals`,
        badgeType: 'info' as const
      },
      {
        id: 'quotes' as AdminTab,
        label: 'Presupuestos',
        category: 'Comercial' as const,
        description: 'Cotizaciones con cálculo de margen, PDF y firma digital',
        icon: FileText,
        iconBg: 'bg-brand-teal-50 dark:bg-brand-teal-950/60 border-brand-teal-200 dark:border-brand-teal-800/60',
        iconColor: 'text-brand-teal-600 dark:text-brand-teal-400',
        badge: pendingQuotesCount > 0 ? `${pendingQuotesCount} pendientes` : `${quotes.length} total`,
        badgeType: pendingQuotesCount > 0 ? 'warning' as const : 'neutral' as const
      },
      {
        id: 'clients' as AdminTab,
        label: 'Directorio de Clientes',
        category: 'Comercial' as const,
        description: 'Base de datos, empresas, historial de obras y validación RNC',
        icon: Users,
        iconBg: 'bg-sky-50 dark:bg-sky-950/60 border-sky-200 dark:border-sky-800/60',
        iconColor: 'text-sky-600 dark:text-sky-400',
        badge: `${clients.length} clientes`,
        badgeType: 'neutral' as const
      }
    ] : []),

    // Operaciones
    {
      id: 'work_orders' as AdminTab,
      label: 'Órdenes de Trabajo',
      category: 'Operaciones' as const,
      description: 'Actas de entrega con fotos antes/después, GPS y firmas',
      icon: Wrench,
      iconBg: 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800/60',
      iconColor: 'text-emerald-600 dark:text-emerald-400',
      badge: activeOrdersCount > 0 ? `${activeOrdersCount} activas` : `${workOrders.length} total`,
      badgeType: activeOrdersCount > 0 ? 'success' as const : 'neutral' as const
    },
    {
      id: 'calendar' as AdminTab,
      label: 'Agenda Técnica',
      category: 'Operaciones' as const,
      description: 'Programación de visitas en campo y levantamientos técnicos',
      icon: Calendar,
      iconBg: 'bg-amber-50 dark:bg-amber-950/60 border-amber-200 dark:border-amber-800/60',
      iconColor: 'text-amber-600 dark:text-amber-400',
      badge: `${visits.length} visitas`,
      badgeType: 'neutral' as const
    },
    {
      id: 'catalog' as AdminTab,
      label: 'Catálogo & Precios',
      category: 'Operaciones' as const,
      description: 'Inventario de equipos, control de stock y tarifas de mano de obra',
      icon: Package,
      iconBg: 'bg-violet-50 dark:bg-violet-950/60 border-violet-200 dark:border-violet-800/60',
      iconColor: 'text-violet-600 dark:text-violet-400',
      badge: lowStockCount > 0 ? `${lowStockCount} stock bajo` : `${catalog.length} ítems`,
      badgeType: lowStockCount > 0 ? 'warning' as const : 'neutral' as const
    },

    // Finanzas & Fiscal
    ...(isAdmin ? [
      {
        id: 'invoices' as AdminTab,
        label: 'Facturación NCF',
        category: 'Finanzas' as const,
        description: 'Comprobantes fiscales B01, B02 y exportación oficial DGII 607',
        icon: Receipt,
        iconBg: 'bg-rose-50 dark:bg-rose-950/60 border-rose-200 dark:border-rose-800/60',
        iconColor: 'text-rose-600 dark:text-rose-400',
        badge: `${invoices.length} facturas`,
        badgeType: 'info' as const
      },
      {
        id: 'payments' as AdminTab,
        label: 'Cobros & Recibos',
        category: 'Finanzas' as const,
        description: 'Registro de cobros, anticipos de clientes y recibos membretados',
        icon: DollarSign,
        iconBg: 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800/60',
        iconColor: 'text-emerald-600 dark:text-emerald-400',
        badge: `${payments.length} recibos`,
        badgeType: 'success' as const
      }
    ] : []),

    // Sistema
    {
      id: 'portfolio' as AdminTab,
      label: 'Portafolio Web',
      category: 'Sistema' as const,
      description: 'Gestión de proyectos y evidencias visibles en la web pública',
      icon: Layers,
      iconBg: 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700',
      iconColor: 'text-slate-700 dark:text-slate-300',
      badge: 'Público',
      badgeType: 'neutral' as const
    },
    ...(isAdmin ? [
      {
        id: 'users' as AdminTab,
        label: 'Usuarios & Accesos',
        category: 'Sistema' as const,
        description: 'Control de técnicos, vendedores y permisos administrativos',
        icon: UserCheck,
        iconBg: 'bg-cyan-50 dark:bg-cyan-950/60 border-cyan-200 dark:border-cyan-800/60',
        iconColor: 'text-cyan-600 dark:text-cyan-400',
        badge: `${users.length} usuarios`,
        badgeType: 'neutral' as const
      },
      {
        id: 'audit' as AdminTab,
        label: 'Pista de Auditoría',
        category: 'Sistema' as const,
        description: 'Bitácora inmutable de emisión fiscal, cobros y firmas',
        icon: ShieldCheck,
        iconBg: 'bg-purple-50 dark:bg-purple-950/60 border-purple-200 dark:border-purple-800/60',
        iconColor: 'text-purple-600 dark:text-purple-400',
        badge: 'Inmutable',
        badgeType: 'info' as const
      }
    ] : [])
  ];

  const handleSelect = (tab: AdminTab) => {
    setAdminTab(tab);
    if (onSelectModule) {
      onSelectModule(tab);
    }
  };

  const categories: Array<{ name: 'Comercial' | 'Operaciones' | 'Finanzas' | 'Sistema'; label: string; icon: string }> = [
    { name: 'Comercial', label: 'Área Comercial & Ventas', icon: '💼' },
    { name: 'Operaciones', label: 'Operaciones & Campo Técnico', icon: '🛠️' },
    { name: 'Finanzas', label: 'Finanzas & Fiscal DGII', icon: '💰' },
    { name: 'Sistema', label: 'Configuración & Seguridad', icon: '⚙️' },
  ];

  return (
    <div className={`space-y-6 ${className}`}>
      {categories.map(cat => {
        const catModules = modules.filter(m => m.category === cat.name);
        if (catModules.length === 0) return null;

        return (
          <div key={cat.name} className="space-y-2.5">
            {showCategoryHeaders && (
              <div className="flex items-center gap-2 px-1">
                <span className="text-xs">{cat.icon}</span>
                <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  {cat.label}
                </span>
                <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800 ml-2" />
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {catModules.map(mod => {
                const Icon = mod.icon;
                const isActive = adminTab === mod.id;

                const badgeColors = {
                  info: 'bg-sky-100 text-sky-800 dark:bg-sky-950/70 dark:text-sky-300 border-sky-300 dark:border-sky-700/50',
                  warning: 'bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300 border-amber-300 dark:border-amber-700/50',
                  success: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700/50',
                  neutral: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-300 dark:border-slate-700'
                }[mod.badgeType || 'neutral'];

                return (
                  <div
                    key={mod.id}
                    onClick={() => handleSelect(mod.id)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleSelect(mod.id);
                      }
                    }}
                    className={`group relative p-4 rounded-2xl border transition-all duration-200 cursor-pointer flex flex-col justify-between gap-3 text-left focus:outline-none ${
                      isActive
                        ? 'bg-brand-teal-50/90 dark:bg-brand-teal-950/40 border-brand-teal-500 ring-2 ring-brand-teal-500/20 shadow-md'
                        : 'bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-800 hover:border-brand-teal-500/80 hover:shadow-md dark:hover:bg-slate-850'
                    }`}
                  >
                    {/* Top Row: Icon, Title & Badge */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 ${mod.iconBg} ${mod.iconColor} shadow-sm group-hover:scale-105 transition-transform`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white leading-tight">
                              {mod.label}
                            </h4>
                            {isActive && (
                              <span className="w-2 h-2 rounded-full bg-brand-teal-500 shrink-0" title="Módulo Activo" />
                            )}
                          </div>
                          {mod.badge && (
                            <span className={`inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${badgeColors}`}>
                              {mod.badge}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className={`p-1 rounded-lg text-slate-400 group-hover:text-brand-teal-600 dark:group-hover:text-brand-teal-400 group-hover:translate-x-0.5 transition-all ${
                        isActive ? 'text-brand-teal-600 dark:text-brand-teal-400' : ''
                      }`}>
                        <ArrowRight className="w-4 h-4" />
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-[11px] text-slate-600 dark:text-slate-400 font-normal leading-relaxed">
                      {mod.description}
                    </p>

                    {/* Bottom active pill if selected */}
                    {isActive && (
                      <div className="pt-2 border-t border-brand-teal-200 dark:border-brand-teal-800/40 flex items-center justify-between text-[10px] font-bold text-brand-teal-800 dark:text-brand-teal-300">
                        <span>Módulo en pantalla</span>
                        <span>Abierto &rarr;</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
};
