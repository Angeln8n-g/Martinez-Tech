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
  Eye
} from 'lucide-react';
import { formatCurrency, formatDate, getStageInfo, getPriorityBadge, getCategoryInfo } from '../../utils/formatters';

export const DashboardOverview: React.FC = () => {
  const { 
    deals, 
    quotes, 
    clients, 
    setAdminTab, 
    setIsDealModalOpen, 
    setActiveDealForEdit,
    setActiveQuoteForView,
    openNewQuoteForDeal 
  } = useAppState();

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
