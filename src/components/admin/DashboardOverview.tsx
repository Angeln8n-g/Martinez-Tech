import React from 'react';
import { useAppState } from '../../context/AppStateContext';
import { 
  DollarSign, 
  TrendingUp, 
  CheckCircle, 
  FileText, 
  Wrench, 
  Clock, 
  Users, 
  ArrowUpRight, 
  Kanban, 
  Plus, 
  MessageCircle,
  Phone,
  Eye,
  AlertTriangle,
  LayoutGrid,
  Calendar,
  CheckCircle2,
  Navigation,
  MapPin
} from 'lucide-react';
import { formatCurrency, formatDate, getStageInfo, getPriorityBadge, getCategoryInfo, createWhatsAppUrl } from '../../utils/formatters';
import { ModuleCardsGrid } from './ModuleCardsGrid';

export const DashboardOverview: React.FC = () => {
  const { 
    deals, 
    quotes, 
    clients, 
    catalog,
    visits,
    workOrders,
    currentUser,
    setAdminTab, 
    setIsDealModalOpen, 
    setActiveDealForEdit,
    setActiveQuoteForView,
    openNewQuoteForDeal 
  } = useAppState();

  // If logged-in user is a Technician, render Operational Technician Dashboard
  if (currentUser?.role === 'technician') {
    const todayStr = new Date().toISOString().slice(0, 10);
    const myVisits = visits.filter(v => 
      (v.assignedTechnicianId && v.assignedTechnicianId === currentUser.id) ||
      (v.assignedTechnician && v.assignedTechnician.toLowerCase() === currentUser.name.toLowerCase())
    );
    const todayVisits = myVisits.filter(v => v.date === todayStr);
    const pendingVisits = myVisits.filter(v => v.status !== 'completed' && v.status !== 'cancelled');
    const completedVisits = myVisits.filter(v => v.status === 'completed');
    const myWorkOrders = workOrders.filter(w => 
      w.assignedTechnician && w.assignedTechnician.toLowerCase().includes(currentUser.name.toLowerCase())
    );

    return (
      <div className="space-y-8 animate-fadeIn">
        {/* Technician Welcome Card */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-brand-teal-500/10 via-brand-green-500/10 to-white dark:to-slate-900 p-6 rounded-3xl border border-brand-teal-400/30 dark:border-slate-800 shadow-md">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-brand-teal-600 text-white font-black flex items-center justify-center text-xl shadow-lg">
              {currentUser.avatar || currentUser.name.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-brand-teal-100 dark:bg-brand-teal-900 text-brand-teal-800 dark:text-brand-teal-300">
                Panel de Operaciones de Campo
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-0.5">
                ¡Bienvenido, {currentUser.name}!
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                Aquí tienes el control de tus visitas técnicas y órdenes de trabajo asignadas.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setAdminTab('calendar')}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-brand-teal-600 hover:bg-brand-teal-500 text-white font-bold text-xs shadow-md transition-all"
            >
              <Calendar className="w-4 h-4" />
              <span>Ver mi Agenda Técnica</span>
            </button>
          </div>
        </div>

        {/* Technician Operational KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 space-y-2 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Citas para Hoy</span>
              <div className="p-2 rounded-xl bg-brand-teal-50 dark:bg-brand-teal-950/80 text-brand-teal-600 dark:text-brand-teal-400">
                <Calendar className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl font-black text-slate-900 dark:text-white font-mono">{todayVisits.length}</div>
            <div className="text-[11px] text-slate-500">Programadas para hoy</div>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 space-y-2 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Visitas Pendientes</span>
              <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/80 text-amber-600 dark:text-amber-400">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl font-black text-amber-600 dark:text-amber-400 font-mono">{pendingVisits.length}</div>
            <div className="text-[11px] text-slate-500">Por realizar o en camino</div>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 space-y-2 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Visitas Realizadas</span>
              <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl font-black text-emerald-600 dark:text-emerald-400 font-mono">{completedVisits.length}</div>
            <div className="text-[11px] text-slate-500">Completadas con éxito</div>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 space-y-2 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Órdenes de Trabajo</span>
              <div className="p-2 rounded-xl bg-cyan-50 dark:bg-cyan-950/80 text-cyan-600 dark:text-cyan-400">
                <Wrench className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl font-black text-cyan-600 dark:text-cyan-400 font-mono">{myWorkOrders.length}</div>
            <div className="text-[11px] text-slate-500">Instalaciones asignadas</div>
          </div>
        </div>

        {/* Next Assigned Visits List */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 bg-white dark:bg-slate-900 rounded-3xl border border-slate-300 dark:border-slate-800 p-6 shadow-md space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div>
                <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">
                  Mis Próximas Visitas Asignadas
                </h3>
                <p className="text-[11px] text-slate-500">Ordenadas cronológicamente para tu atención en campo</p>
              </div>
              <button
                onClick={() => setAdminTab('calendar')}
                className="text-xs text-brand-teal-700 dark:text-brand-teal-400 hover:underline font-bold"
              >
                Abrir Calendario &rarr;
              </button>
            </div>

            {myVisits.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-500 space-y-2">
                <Calendar className="w-8 h-8 text-slate-400 mx-auto" />
                <p>No tienes visitas técnicas asignadas en este momento.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {myVisits.slice(0, 5).map(visit => (
                  <div
                    key={visit.id}
                    className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          visit.status === 'completed'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : visit.status === 'in_progress'
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                            : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                        }`}>
                          {visit.status === 'completed' ? 'Realizada' : visit.status === 'in_progress' ? 'En Sitio' : 'Programada'}
                        </span>
                        <span className="text-xs font-mono font-bold text-brand-teal-800 dark:text-brand-teal-300">
                          {formatDate(visit.date)} - {visit.time}
                        </span>
                      </div>
                      <h4 className="text-xs font-black text-slate-900 dark:text-white">{visit.title}</h4>
                      <div className="flex items-center gap-2 text-[11px] text-slate-600 dark:text-slate-400">
                        <span>👤 {visit.clientName}</span>
                        {visit.address && <span>📍 {visit.address}</span>}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {visit.address && (
                        <a
                          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(visit.address)}`}
                          target="_blank"
                          rel="noreferrer"
                          className="px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold flex items-center gap-1 hover:bg-slate-200"
                        >
                          <Navigation className="w-3.5 h-3.5" />
                          <span>GPS</span>
                        </a>
                      )}
                      <button
                        onClick={() => {
                          const text = `¡Hola ${visit.clientName}! Le escribe ${currentUser.name} de Martínez Tech sobre su visita técnica pautada para el ${formatDate(visit.date)} a las ${visit.time}.`;
                          window.open(createWhatsAppUrl(visit.clientPhone, text), '_blank');
                        }}
                        className="px-2.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white text-xs font-bold flex items-center gap-1"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>WhatsApp</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Work Orders Column */}
          <div className="lg:col-span-4 bg-white dark:bg-slate-900 rounded-3xl border border-slate-300 dark:border-slate-800 p-6 shadow-md space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">
                Órdenes de Trabajo
              </h3>
              <button
                onClick={() => setAdminTab('work_orders')}
                className="text-xs text-cyan-600 hover:underline font-bold"
              >
                Ver todas ({myWorkOrders.length})
              </button>
            </div>

            {myWorkOrders.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-500 space-y-2">
                <Wrench className="w-8 h-8 text-slate-400 mx-auto" />
                <p>No tienes órdenes de trabajo activas asignadas.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {myWorkOrders.slice(0, 4).map(wo => (
                  <div
                    key={wo.id}
                    onClick={() => setAdminTab('work_orders')}
                    className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 cursor-pointer hover:border-cyan-500 transition-colors space-y-1"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-mono font-bold text-cyan-600">{wo.orderNumber}</span>
                      <span className="text-[10px] text-slate-500">{formatDate(wo.scheduledDate)}</span>
                    </div>
                    <div className="text-xs font-bold text-slate-900 dark:text-white truncate">{wo.clientName}</div>
                    <div className="text-[11px] text-slate-500 truncate">{wo.scopeOfWork}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  const activeDeals = deals.filter(d => d.stage !== 'completed' && d.stage !== 'lost');
  const totalPipelineValue = activeDeals.reduce((sum, d) => sum + (d.estimatedValue || 0), 0);
  
  const wonDeals = deals.filter(d => d.stage === 'won' || d.stage === 'installation' || d.stage === 'completed');
  const totalWonValue = wonDeals.reduce((sum, d) => sum + (d.estimatedValue || 0), 0);

  const pendingQuotes = quotes.filter(q => q.status === 'sent' || q.status === 'draft');
  const inInstallationCount = deals.filter(d => d.stage === 'installation').length;

  const stageCounts: Record<string, number> = {
    prospect: deals.filter(d => d.stage === 'prospect').length,
    site_visit: deals.filter(d => d.stage === 'site_visit').length,
    quoted: deals.filter(d => d.stage === 'quoted').length,
    negotiation: deals.filter(d => d.stage === 'negotiation').length,
    won: deals.filter(d => d.stage === 'won').length,
    installation: deals.filter(d => d.stage === 'installation').length,
    completed: deals.filter(d => d.stage === 'completed').length,
  };

  const recentDeals = deals.slice(0, 5);
  const lowStockItems = (catalog || []).filter(p => p.type === 'product' && (typeof p.stock !== 'number' || p.stock <= 3));

  return (
    <div className="space-y-8 animate-fadeIn">
      
      {/* Top Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-300 dark:border-slate-800 shadow-md">
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white">
            Panel de Negociaciones & Control Comercial
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1 font-medium">
            Resumen en tiempo real de presupuestos, cobros, instalaciones activas y embudo de ventas.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setActiveDealForEdit(null);
              setIsDealModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-brand-teal-500 to-brand-green-500 hover:from-brand-teal-400 hover:to-brand-green-400 text-slate-950 font-bold text-xs shadow-md border border-brand-teal-600/30 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Registrar Nueva Negociación</span>
          </button>
        </div>
      </div>

      {/* Low Stock Alert Banner */}
      {lowStockItems.length > 0 && (
        <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-600/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center text-amber-700 dark:text-amber-400 shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-black text-amber-950 dark:text-amber-200">
                Alerta de Inventario: {lowStockItems.length} {lowStockItems.length === 1 ? 'producto tiene' : 'productos tienen'} existencia crítica (&le; 3 unidades)
              </h4>
              <p className="text-[11px] text-amber-800/80 dark:text-amber-400 font-medium">
                {lowStockItems.slice(0, 3).map(p => `${p.name} (${p.stock || 0} disp.)`).join(', ')}
                {lowStockItems.length > 3 ? ` y ${lowStockItems.length - 3} más...` : ''}
              </p>
            </div>
          </div>
          <button
            onClick={() => setAdminTab('catalog')}
            className="px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold shadow-sm whitespace-nowrap self-start sm:self-auto transition-colors"
          >
            Gestionar Stock &rarr;
          </button>
        </div>
      )}

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Card 1: Pipeline Activo */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 space-y-3 shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
              En Cartera / Pipeline Activo
            </span>
            <div className="w-9 h-9 rounded-xl bg-brand-teal-50 dark:bg-brand-teal-500/10 border border-brand-teal-300 dark:border-brand-teal-500/20 flex items-center justify-center text-brand-teal-700 dark:text-brand-teal-400 shadow-sm">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-mono">
            {formatCurrency(totalPipelineValue)}
          </div>
          <div className="text-xs text-slate-600 dark:text-slate-400 flex items-center gap-1">
            <strong className="text-brand-teal-700 dark:text-brand-teal-400 font-bold">{activeDeals.length}</strong> negociaciones en curso
          </div>
        </div>

        {/* Card 2: Ganado / Facturado */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 space-y-3 shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
              Monto Aprobado / Ganado
            </span>
            <div className="w-9 h-9 rounded-xl bg-brand-green-50 dark:bg-brand-green-500/10 border border-brand-green-300 dark:border-brand-green-500/20 flex items-center justify-center text-brand-green-700 dark:text-brand-green-400 shadow-sm">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-brand-green-700 dark:text-brand-green-400 font-mono">
            {formatCurrency(totalWonValue)}
          </div>
          <div className="text-xs text-slate-600 dark:text-slate-400 flex items-center gap-1">
            <strong className="text-brand-green-800 dark:text-brand-green-300 font-bold">{wonDeals.length}</strong> proyectos cerrados
          </div>
        </div>

        {/* Card 3: Presupuestos Emitidos */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 space-y-3 shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
              Cotizaciones Registradas
            </span>
            <div className="w-9 h-9 rounded-xl bg-purple-50 dark:bg-purple-500/10 border border-purple-300 dark:border-purple-500/20 flex items-center justify-center text-purple-700 dark:text-purple-400 shadow-sm">
              <FileText className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-mono">
            {quotes.length}
          </div>
          <div className="text-xs text-slate-600 dark:text-slate-400 flex items-center gap-1">
            <strong className="text-purple-700 dark:text-purple-400 font-bold">{pendingQuotes.length}</strong> en espera de decisión
          </div>
        </div>

        {/* Card 4: En Instalación */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 space-y-3 shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
              Obras en Ejecución
            </span>
            <div className="w-9 h-9 rounded-xl bg-cyan-50 dark:bg-cyan-500/10 border border-cyan-300 dark:border-cyan-500/20 flex items-center justify-center text-cyan-700 dark:text-cyan-400 shadow-sm">
              <Wrench className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-cyan-700 dark:text-cyan-400 font-mono">
            {inInstallationCount}
          </div>
          <div className="text-xs text-slate-600 dark:text-slate-400 flex items-center gap-1 font-medium">
            Técnicos activos en campo
          </div>
        </div>

      </div>

      {/* Primary Navigation Hub: Accessible Module Cards Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-brand-teal-500 text-slate-950 shadow-sm">
              <LayoutGrid className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Módulos del Sistema CRM & Operaciones
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Acceso directo en cuadrícula a todas las áreas de gestión de Martínez Tech.
              </p>
            </div>
          </div>
          <span className="text-[11px] text-brand-teal-700 dark:text-brand-teal-400 font-mono font-bold hidden sm:inline">
            10 Módulos Disponibles
          </span>
        </div>

        <ModuleCardsGrid />
      </div>

      {/* Pipeline Funnel Visual Strip */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 space-y-4 shadow-md">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
            <Kanban className="w-4 h-4 text-brand-teal-600 dark:text-brand-teal-400" />
            Distribución del Embudo Comercial
          </h3>
          <button
            onClick={() => setAdminTab('pipeline')}
            className="text-xs font-bold text-brand-teal-700 dark:text-brand-teal-400 hover:underline flex items-center gap-1"
          >
            <span>Ver Tablero Kanban Completo</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          {[
            { id: 'prospect', label: '1. Prospectos', count: stageCounts.prospect, color: 'border-sky-400 dark:border-sky-500/40 text-sky-800 dark:text-sky-400 bg-sky-50/80 dark:bg-slate-800/60' },
            { id: 'site_visit', label: '2. Levantamiento', count: stageCounts.site_visit, color: 'border-amber-400 dark:border-amber-500/40 text-amber-800 dark:text-amber-400 bg-amber-50/80 dark:bg-slate-800/60' },
            { id: 'quoted', label: '3. Cotizados', count: stageCounts.quoted, color: 'border-purple-400 dark:border-purple-500/40 text-purple-800 dark:text-purple-400 bg-purple-50/80 dark:bg-slate-800/60' },
            { id: 'negotiation', label: '4. Negociación', count: stageCounts.negotiation, color: 'border-indigo-400 dark:border-indigo-500/40 text-indigo-800 dark:text-indigo-400 bg-indigo-50/80 dark:bg-slate-800/60' },
            { id: 'won', label: '5. Aprobados', count: stageCounts.won, color: 'border-emerald-400 dark:border-emerald-500/40 text-emerald-800 dark:text-emerald-400 bg-emerald-50/80 dark:bg-slate-800/60' },
            { id: 'installation', label: '6. Instalando', count: stageCounts.installation, color: 'border-cyan-400 dark:border-cyan-500/40 text-cyan-800 dark:text-cyan-400 bg-cyan-50/80 dark:bg-slate-800/60' },
            { id: 'completed', label: '7. Finalizados', count: stageCounts.completed, color: 'border-brand-green-400 dark:border-brand-green-500/40 text-brand-green-800 dark:text-brand-green-400 bg-brand-green-50/80 dark:bg-slate-800/60' },
          ].map((item) => (
            <div
              key={item.id}
              onClick={() => setAdminTab('pipeline')}
              className={`p-3.5 rounded-xl border ${item.color} cursor-pointer hover:shadow-md transition-all text-center space-y-1`}
            >
              <div className="text-xl font-black text-slate-900 dark:text-white font-mono">{item.count}</div>
              <div className="text-[11px] font-bold truncate">{item.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Two columns: Recent Deals & Recent Quotes */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Recent Deals (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Negociaciones Recientes
            </h3>
            <button
              onClick={() => setAdminTab('pipeline')}
              className="text-xs text-brand-teal-700 dark:text-brand-teal-400 hover:underline font-bold"
            >
              Ver todas ({deals.length})
            </button>
          </div>

          <div className="space-y-3">
            {recentDeals.map((deal) => {
              const stage = getStageInfo(deal.stage);
              const priority = getPriorityBadge(deal.priority);

              return (
                <div
                  key={deal.id}
                  className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 hover:border-brand-teal-500 shadow-sm hover:shadow-md transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-mono font-bold text-slate-600 dark:text-slate-400">{deal.code}</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${priority.color}`}>
                        {priority.label}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${stage.color}`}>
                        {stage.shortLabel}
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                      {deal.title}
                    </h4>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 dark:text-slate-400 font-medium">
                      <span>👤 {deal.clientName}</span>
                      <span>📞 {deal.clientPhone}</span>
                    </div>
                  </div>

                  <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-200 dark:border-slate-800">
                    <div className="text-base font-black text-brand-teal-800 dark:text-brand-teal-300 font-mono">
                      {formatCurrency(deal.estimatedValue)}
                    </div>
                    
                    <div className="flex items-center gap-1">
                      {!deal.quoteId ? (
                        <button
                          onClick={() => openNewQuoteForDeal(deal)}
                          className="px-2.5 py-1 rounded bg-brand-teal-50 dark:bg-brand-teal-950/80 text-brand-teal-800 dark:text-brand-teal-400 hover:bg-brand-teal-100 border border-brand-teal-300 dark:border-brand-teal-500/30 text-[11px] font-bold shadow-sm"
                        >
                          + Cotizar
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            const q = quotes.find(quote => quote.id === deal.quoteId);
                            if (q) setActiveQuoteForView(q);
                          }}
                          className="px-2.5 py-1 rounded bg-purple-50 dark:bg-purple-950/80 text-purple-800 dark:text-purple-300 hover:bg-purple-100 border border-purple-300 dark:border-purple-500/30 text-[11px] font-bold flex items-center gap-1 shadow-sm"
                        >
                          <Eye className="w-3 h-3" />
                          <span>Ver Cotización</span>
                        </button>
                      )}
                      
                      <button
                        onClick={() => {
                          setActiveDealForEdit(deal);
                          setIsDealModalOpen(true);
                        }}
                        className="px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-300 text-[11px] font-semibold border border-slate-300 dark:border-slate-700 shadow-sm"
                      >
                        Editar
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quick Presupuestos List (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Últimas Cotizaciones
            </h3>
            <button
              onClick={() => setAdminTab('quotes')}
              className="text-xs text-brand-teal-700 dark:text-brand-teal-400 hover:underline font-bold"
            >
              Ver todas ({quotes.length})
            </button>
          </div>

          <div className="space-y-3">
            {quotes.slice(0, 4).map((quote) => (
              <div
                key={quote.id}
                onClick={() => setActiveQuoteForView(quote)}
                className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 hover:border-purple-500 cursor-pointer shadow-sm hover:shadow-md transition-all space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-purple-700 dark:text-purple-400">{quote.quoteNumber}</span>
                  <span className="text-xs font-bold text-slate-900 dark:text-white font-mono">{formatCurrency(quote.total, quote.currency)}</span>
                </div>
                <div className="text-xs font-bold text-slate-900 dark:text-slate-200 truncate">
                  {quote.clientName}
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-600 dark:text-slate-400 font-medium">
                  <span>{quote.items.length} ítems cotizados</span>
                  <span>{formatDate(quote.date)}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Quick Direct Link to Clients */}
          <div className="p-4 rounded-xl bg-white dark:bg-slate-900/60 border border-slate-300 dark:border-slate-800 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 flex items-center justify-center text-slate-800 dark:text-slate-300">
                <Users className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900 dark:text-white">Directorio de Clientes</div>
                <div className="text-[11px] text-slate-600 dark:text-slate-400 font-medium">{clients.length} clientes registrados</div>
              </div>
            </div>
            <button
              onClick={() => setAdminTab('clients')}
              className="px-3 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-bold text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700 shadow-sm"
            >
              Ver Directorio
            </button>
          </div>
        </div>

      </div>

    </div>
  );
};
