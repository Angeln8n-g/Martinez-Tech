import React, { useState, useEffect } from 'react';
import { useAppState } from '../../context/AppStateContext';
import { Deal, DealStage } from '../../types';
import { 
  Plus, 
  Search, 
  MessageCircle, 
  Phone, 
  Trash2, 
  Edit, 
  User, 
  MapPin, 
  Eye, 
  Calculator,
  Wrench,
  MoreHorizontal
} from 'lucide-react';
import { 
  formatCurrency, 
  getPriorityBadge, 
  getCategoryInfo 
} from '../../utils/formatters';

const STAGES: { id: DealStage; label: string; headerColor: string; bgCard: string }[] = [
  { id: 'prospect', label: '1. Prospecto Nuevo', headerColor: 'border-sky-200 dark:border-sky-500/30 text-sky-900 dark:text-sky-300 bg-sky-50/90 dark:bg-sky-950/30', bgCard: 'bg-white dark:bg-slate-800/90' },
  { id: 'site_visit', label: '2. Levantamiento / Visita', headerColor: 'border-amber-200 dark:border-amber-500/30 text-amber-900 dark:text-amber-300 bg-amber-50/90 dark:bg-amber-950/30', bgCard: 'bg-white dark:bg-slate-800/90' },
  { id: 'quoted', label: '3. Presupuesto Enviado', headerColor: 'border-purple-200 dark:border-purple-500/30 text-purple-900 dark:text-purple-300 bg-purple-50/90 dark:bg-purple-950/30', bgCard: 'bg-white dark:bg-slate-800/90' },
  { id: 'negotiation', label: '4. En Negociación', headerColor: 'border-indigo-200 dark:border-indigo-500/30 text-indigo-900 dark:text-indigo-300 bg-indigo-50/90 dark:bg-indigo-950/30', bgCard: 'bg-white dark:bg-slate-800/90' },
  { id: 'won', label: '5. Aprobado / Ganado', headerColor: 'border-emerald-200 dark:border-emerald-500/30 text-emerald-900 dark:text-emerald-300 bg-emerald-50/90 dark:bg-emerald-950/30', bgCard: 'bg-white dark:bg-slate-800/90' },
  { id: 'installation', label: '6. En Instalación', headerColor: 'border-cyan-200 dark:border-cyan-500/30 text-cyan-900 dark:text-cyan-300 bg-cyan-50/90 dark:bg-cyan-950/30', bgCard: 'bg-white dark:bg-slate-800/90' },
  { id: 'completed', label: '7. Finalizado y Cobrado', headerColor: 'border-emerald-200 dark:border-emerald-500/30 text-emerald-900 dark:text-emerald-300 bg-emerald-50/90 dark:bg-emerald-950/30', bgCard: 'bg-white dark:bg-slate-800/90' },
  { id: 'lost', label: '8. Cancelado / Perdido', headerColor: 'border-rose-200 dark:border-rose-500/30 text-rose-900 dark:text-rose-300 bg-rose-50/90 dark:bg-rose-950/30', bgCard: 'bg-white dark:bg-slate-800/90' },
];

export const PipelineKanban: React.FC = () => {
  const { 
    deals, 
    quotes, 
    moveDealStage, 
    deleteDeal, 
    setActiveDealForEdit, 
    setIsDealModalOpen, 
    setActiveQuoteForView,
    openNewQuoteForDeal,
    openWhatsAppTemplates,
    setActiveWorkOrderForEdit,
    setIsWorkOrderModalOpen
  } = useAppState();

  const [searchTerm, setSearchTerm] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');
  const [actionMenuDealId, setActionMenuDealId] = useState<string | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setActionMenuDealId(null);
    };
    const handleClickOutside = (e: MouseEvent) => {
      if (!(e.target as HTMLElement).closest('.deal-action-menu-container')) {
        setActionMenuDealId(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('click', handleClickOutside);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('click', handleClickOutside);
    };
  }, []);

  const filteredDeals = deals.filter(deal => {
    const matchesSearch = 
      deal.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      deal.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      deal.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      deal.clientPhone.includes(searchTerm);

    const matchesPriority = priorityFilter === 'all' || deal.priority === priorityFilter;
    const matchesCategory = categoryFilter === 'all' || deal.serviceCategory === categoryFilter;

    return matchesSearch && matchesPriority && matchesCategory;
  });

  const handleOpenWhatsApp = (deal: Deal) => {
    const linkedQuote = quotes.find(q => q.id === deal.quoteId);
    openWhatsAppTemplates(linkedQuote ? 'quote' : 'visit', {
      clientName: deal.clientName,
      clientPhone: deal.clientPhone,
      quoteNumber: linkedQuote?.quoteNumber,
      total: deal.estimatedValue,
      address: deal.clientAddress
    });
  };

  const handleCreateWorkOrder = (deal: Deal) => {
    setActiveWorkOrderForEdit({
      id: '',
      orderNumber: '',
      dealId: deal.id,
      dealCode: deal.code,
      quoteId: deal.quoteId,
      clientName: deal.clientName,
      clientPhone: deal.clientPhone,
      clientAddress: deal.clientAddress || '',
      serviceCategory: deal.serviceCategory,
      assignedTechnician: deal.assignedTechnician || 'Rafael Martínez',
      scheduledDate: new Date().toISOString().slice(0, 10),
      status: 'in_progress',
      scopeOfWork: `Instalación y ejecución: ${deal.title}`,
      checklist: [
        { id: 'chk-1', task: 'Instalación y fijación mecánica de equipos', completed: true },
        { id: 'chk-2', task: 'Tendido, canalizado y peinado de cableado', completed: false },
        { id: 'chk-3', task: 'Conexión eléctrica y pruebas de funcionamiento', completed: false },
        { id: 'chk-4', task: 'Configuración remota en app móvil del cliente', completed: false }
      ],
      beforeImages: [],
      afterImages: [],
      createdBy: 'Rafael Martínez',
      createdAt: new Date().toISOString()
    });
    setIsWorkOrderModalOpen(true);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* Top Filter & Action Bar */}
      {/* Search & Filters Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        
        {/* Search & Filters */}
        <div className="flex items-center gap-3 flex-1 flex-wrap">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por cliente, título, teléfono o código..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-nexablue-500 shadow-2xs"
            />
          </div>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200 font-bold focus:outline-none focus:border-nexablue-500 shadow-2xs"
          >
            <option value="all">Todas las Prioridades</option>
            <option value="high">Prioridad Alta</option>
            <option value="medium">Prioridad Media</option>
            <option value="low">Prioridad Baja</option>
          </select>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200 font-bold focus:outline-none focus:border-nexablue-500 shadow-2xs"
          >
            <option value="all">Todos los Servicios</option>
            <option value="camaras">Cámaras de Vigilancia</option>
            <option value="redes">Redes Informáticas</option>
            <option value="motores">Motores para Portón</option>
            <option value="cerraduras">Cerraduras Magnéticas</option>
            <option value="acceso">Control de Acceso</option>
            <option value="ponchadores">Ponchadores</option>
            <option value="alarmas">Alarmas</option>
            <option value="intercom">Intercom</option>
          </select>
        </div>

        {/* View Mode & New Deal */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setActiveDealForEdit(null);
              setIsDealModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-nexablue-600 hover:bg-nexablue-500 text-white font-bold text-xs shadow-sm border border-nexablue-700/30 active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Nueva Negociación</span>
          </button>
        </div>

      </div>

      {/* Kanban Board */}
      <div className="overflow-x-auto pb-4 scrollbar-thin">
        <div className="flex gap-4 min-w-[1700px] items-start">
          
          {STAGES.map((stage) => {
            const stageDeals = filteredDeals.filter(d => d.stage === stage.id);
            const totalStageValue = stageDeals.reduce((sum, d) => sum + (d.estimatedValue || 0), 0);

            return (
              <div 
                key={stage.id}
                className="w-72 flex-shrink-0 bg-slate-200/50 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 rounded-2xl flex flex-col max-h-[calc(100vh-210px)] shadow-2xs"
              >
                
                {/* Column Header */}
                <div className={`p-3.5 rounded-t-2xl border-b ${stage.headerColor} flex flex-col gap-1`}>
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-xs uppercase tracking-wider">{stage.label}</h3>
                    <span className="w-5 h-5 rounded-full bg-white/90 dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-[11px] font-bold flex items-center justify-center shadow-2xs">
                      {stageDeals.length}
                    </span>
                  </div>
                  <div className="text-[11px] font-mono font-bold text-slate-800 dark:text-slate-300">
                    {formatCurrency(totalStageValue)}
                  </div>
                </div>

                {/* Cards Container */}
                <div className="p-2.5 space-y-2.5 overflow-y-auto flex-1 scrollbar-thin">
                  {stageDeals.length === 0 ? (
                    <div className="p-6 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl text-slate-600 dark:text-slate-400 text-xs italic font-medium">
                      Sin negociaciones
                    </div>
                  ) : (
                    stageDeals.map((deal) => {
                      const priority = getPriorityBadge(deal.priority);
                      const catInfo = getCategoryInfo(deal.serviceCategory);

                      return (
                        <div
                          key={deal.id}
                          className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-nexablue-500/80 space-y-2.5 shadow-2xs hover:shadow-sm transition-all group"
                        >
                          {/* Top Tag & Code */}
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-mono font-bold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                              {deal.code}
                            </span>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold border shadow-xs ${priority.color}`}>
                              {priority.label}
                            </span>
                          </div>

                          {/* Deal Title */}
                          <h4 className="text-xs font-bold text-slate-900 dark:text-white leading-snug line-clamp-2">
                            {deal.title}
                          </h4>

                          {/* Client info */}
                          <div className="space-y-1 text-[11px] text-slate-600 dark:text-slate-300">
                            <div className="flex items-center gap-1.5 truncate">
                              <User className="w-3.5 h-3.5 text-nexablue-600 dark:text-nexablue-400 flex-shrink-0" />
                              <span className="truncate font-bold text-slate-900 dark:text-white">{deal.clientName}</span>
                            </div>
                            {deal.clientAddress && (
                              <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400 truncate text-[10px] font-medium">
                                <MapPin className="w-3.5 h-3.5 text-brand-green-600 dark:text-brand-green-400 flex-shrink-0" />
                                <span className="truncate">{deal.clientAddress}</span>
                              </div>
                            )}
                          </div>

                          {/* Value & Actions Bar */}
                          <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-1.5">
                            <div>
                              <span className="text-xs font-black text-nexablue-700 dark:text-nexablue-300 font-mono block">
                                {formatCurrency(deal.estimatedValue)}
                              </span>
                              <span className={`inline-block px-1.5 py-0.5 rounded text-[9px] font-bold border mt-0.5 ${catInfo.color}`}>
                                {catInfo.label.split(' ')[0]}
                              </span>
                            </div>

                            {/* Quick Actions & Menu */}
                            <div className="flex items-center gap-1 deal-action-menu-container relative">
                              <button
                                type="button"
                                onClick={() => handleOpenWhatsApp(deal)}
                                title="Enviar Plantilla por WhatsApp"
                                className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-600/30 shadow-2xs transition-colors"
                              >
                                <MessageCircle className="w-3.5 h-3.5" />
                              </button>

                              <div className="relative">
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setActionMenuDealId(actionMenuDealId === deal.id ? null : deal.id);
                                  }}
                                  className={`p-1.5 rounded-lg border transition-all ${
                                    actionMenuDealId === deal.id
                                      ? 'bg-slate-200 dark:bg-slate-700 text-slate-950 dark:text-white border-slate-300'
                                      : 'bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                                  }`}
                                  title="Más opciones de la negociación"
                                >
                                  <MoreHorizontal className="w-3.5 h-3.5" />
                                </button>

                                {actionMenuDealId === deal.id && (
                                  <div className="absolute right-0 bottom-full mb-1.5 w-48 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl z-30 py-1.5 text-xs text-left animate-fadeIn">
                                    {!deal.quoteId ? (
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setActionMenuDealId(null);
                                          openNewQuoteForDeal(deal);
                                        }}
                                        className="w-full px-3 py-1.5 flex items-center gap-2 text-nexablue-700 dark:text-cyan-300 hover:bg-nexablue-50 dark:hover:bg-nexablue-950/40 font-bold"
                                      >
                                        <Calculator className="w-3.5 h-3.5" />
                                        <span>Elaborar Cotización</span>
                                      </button>
                                    ) : (
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setActionMenuDealId(null);
                                          const q = quotes.find(quote => quote.id === deal.quoteId);
                                          if (q) setActiveQuoteForView(q);
                                        }}
                                        className="w-full px-3 py-1.5 flex items-center gap-2 text-purple-700 dark:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-950/40 font-bold"
                                      >
                                        <Eye className="w-3.5 h-3.5" />
                                        <span>Ver Presupuesto</span>
                                      </button>
                                    )}

                                    {(deal.stage === 'won' || deal.stage === 'installation') && (
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setActionMenuDealId(null);
                                          handleCreateWorkOrder(deal);
                                        }}
                                        className="w-full px-3 py-1.5 flex items-center gap-2 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 font-bold"
                                      >
                                        <Wrench className="w-3.5 h-3.5" />
                                        <span>Crear Orden / Acta</span>
                                      </button>
                                    )}

                                    <a
                                      href={`tel:${deal.clientPhone}`}
                                      onClick={() => setActionMenuDealId(null)}
                                      className="w-full px-3 py-1.5 flex items-center gap-2 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 font-medium"
                                    >
                                      <Phone className="w-3.5 h-3.5 text-blue-600" />
                                      <span>Llamar al Cliente</span>
                                    </a>

                                    <div className="my-1 border-t border-slate-200 dark:border-slate-800" />

                                    <button
                                      type="button"
                                      onClick={() => {
                                        setActionMenuDealId(null);
                                        setActiveDealForEdit(deal);
                                        setIsDealModalOpen(true);
                                      }}
                                      className="w-full px-3 py-1.5 flex items-center gap-2 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 font-medium"
                                    >
                                      <Edit className="w-3.5 h-3.5 text-slate-500" />
                                      <span>Editar Negociación</span>
                                    </button>

                                    <button
                                      type="button"
                                      onClick={() => {
                                        setActionMenuDealId(null);
                                        if (confirm(`¿Eliminar la negociación ${deal.code}?`)) {
                                          deleteDeal(deal.id);
                                        }
                                      }}
                                      className="w-full px-3 py-1.5 flex items-center gap-2 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 font-medium"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                      <span>Eliminar Negociación</span>
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Stage Selector Dropdown */}
                          <div className="pt-1.5">
                            <select
                              value={deal.stage}
                              onChange={(e) => moveDealStage(deal.id, e.target.value as DealStage)}
                              className="w-full text-[10px] font-bold py-1 px-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-nexablue-500 shadow-2xs"
                            >
                              {STAGES.map(s => (
                                <option key={s.id} value={s.id}>{s.label}</option>
                              ))}
                            </select>
                          </div>

                        </div>
                      );
                    })
                  )}
                </div>

              </div>
            );
          })}

        </div>
      </div>

    </div>
  );
};
