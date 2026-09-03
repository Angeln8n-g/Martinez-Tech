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
  { id: 'prospect', label: '1. Prospecto Nuevo', headerColor: 'border-sky-400 text-sky-900 dark:text-sky-400 bg-sky-100/70 dark:bg-sky-950/30', bgCard: 'bg-white dark:bg-slate-800/90' },
  { id: 'site_visit', label: '2. Levantamiento / Visita', headerColor: 'border-amber-400 text-amber-900 dark:text-amber-400 bg-amber-100/70 dark:bg-amber-950/30', bgCard: 'bg-white dark:bg-slate-800/90' },
  { id: 'quoted', label: '3. Presupuesto Enviado', headerColor: 'border-purple-400 text-purple-900 dark:text-purple-400 bg-purple-100/70 dark:bg-purple-950/30', bgCard: 'bg-white dark:bg-slate-800/90' },
  { id: 'negotiation', label: '4. En Negociación', headerColor: 'border-indigo-400 text-indigo-900 dark:text-indigo-400 bg-indigo-100/70 dark:bg-indigo-950/30', bgCard: 'bg-white dark:bg-slate-800/90' },
  { id: 'won', label: '5. Aprobado / Ganado', headerColor: 'border-emerald-400 text-emerald-900 dark:text-emerald-400 bg-emerald-100/70 dark:bg-emerald-950/30', bgCard: 'bg-white dark:bg-slate-800/90' },
  { id: 'installation', label: '6. En Instalación', headerColor: 'border-cyan-400 text-cyan-900 dark:text-cyan-400 bg-cyan-100/70 dark:bg-cyan-950/30', bgCard: 'bg-white dark:bg-slate-800/90' },
  { id: 'completed', label: '7. Finalizado y Cobrado', headerColor: 'border-brand-green-400 text-brand-green-900 dark:text-brand-green-400 bg-brand-green-100/70 dark:bg-brand-green-950/30', bgCard: 'bg-white dark:bg-slate-800/90' },
  { id: 'lost', label: '8. Cancelado / Perdido', headerColor: 'border-rose-400 text-rose-900 dark:text-rose-400 bg-rose-100/70 dark:bg-rose-950/30', bgCard: 'bg-white dark:bg-slate-800/90' },
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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-300 dark:border-slate-800 shadow-md">
        
        {/* Search & Filters */}
        <div className="flex items-center gap-3 flex-1 flex-wrap">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por cliente, título, teléfono o código..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white placeholder-slate-500 focus:outline-none focus:border-brand-teal-500 shadow-sm"
            />
          </div>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200 font-bold focus:outline-none focus:border-brand-teal-500 shadow-sm"
          >
            <option value="all">Todas las Prioridades</option>
            <option value="high">Prioridad Alta</option>
            <option value="medium">Prioridad Media</option>
            <option value="low">Prioridad Baja</option>
          </select>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200 font-bold focus:outline-none focus:border-brand-teal-500 shadow-sm"
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
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-brand-teal-500 to-brand-green-500 hover:from-brand-teal-400 hover:to-brand-green-400 text-slate-950 font-black text-xs shadow-md border border-brand-teal-600/30"
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
                className="w-72 flex-shrink-0 bg-slate-200/70 dark:bg-slate-900/70 border border-slate-300 dark:border-slate-800 rounded-2xl flex flex-col max-h-[calc(100vh-210px)] shadow-md"
              >
                
                {/* Column Header */}
                <div className={`p-3.5 rounded-t-2xl border-b ${stage.headerColor} flex flex-col gap-1`}>
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-xs uppercase tracking-wider">{stage.label}</h3>
                    <span className="w-5 h-5 rounded-full bg-white/80 dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-[11px] font-bold flex items-center justify-center shadow-sm">
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
                    <div className="p-6 text-center border-2 border-dashed border-slate-300 dark:border-slate-800 rounded-xl text-slate-500 text-[11px] italic font-medium">
                      Sin negociaciones
                    </div>
                  ) : (
                    stageDeals.map((deal) => {
                      const priority = getPriorityBadge(deal.priority);
                      const catInfo = getCategoryInfo(deal.serviceCategory);

                      return (
                        <div
                          key={deal.id}
                          className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 hover:border-brand-teal-500 space-y-2.5 shadow-md hover:shadow-lg transition-all group"
                        >
                          {/* Top Tag & Code */}
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-mono font-bold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded border border-slate-300 dark:border-slate-700">
                              {deal.code}
                            </span>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold border shadow-sm ${priority.color}`}>
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
                              <User className="w-3.5 h-3.5 text-brand-teal-600 dark:text-brand-teal-400 flex-shrink-0" />
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
                              <span className="text-xs font-black text-brand-teal-800 dark:text-brand-teal-300 font-mono block">
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
                                className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-600/30 shadow-2xs"
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
                                      ? 'bg-slate-200 dark:bg-slate-700 text-slate-950 dark:text-white border-slate-400'
                                      : 'bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 text-slate-600 dark:text-slate-300 border-slate-300 dark:border-slate-700'
                                  }`}
                                  title="Más opciones de la negociación"
                                >
                                  <MoreHorizontal className="w-3.5 h-3.5" />
                                </button>

                                {actionMenuDealId === deal.id && (
                                  <div className="absolute right-0 bottom-full mb-1.5 w-48 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl shadow-xl z-30 py-1.5 text-xs text-left animate-fadeIn">
                                    {!deal.quoteId ? (
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setActionMenuDealId(null);
                                          openNewQuoteForDeal(deal);
                                        }}
                                        className="w-full px-3 py-1.5 flex items-center gap-2 text-brand-teal-800 dark:text-brand-teal-300 hover:bg-brand-teal-50 dark:hover:bg-brand-teal-950/40 font-bold"
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
                                        className="w-full px-3 py-1.5 flex items-center gap-2 text-brand-green-800 dark:text-brand-green-300 hover:bg-brand-green-50 dark:hover:bg-brand-green-950/40 font-bold"
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
                              className="w-full text-[10px] font-bold py-1 px-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-brand-teal-500 shadow-2xs"
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
