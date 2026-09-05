import React, { useState, useEffect } from 'react';
import { QuoteItem, ServiceCategory } from '../../../types';
import { 
  QuoteTemplate, 
  DEFAULT_QUOTE_TEMPLATES, 
  getCustomQuoteTemplates, 
  saveCustomQuoteTemplate, 
  deleteCustomQuoteTemplate 
} from '../../../data/quoteTemplates';
import { formatCurrency, getCategoryInfo, roundToTwoDecimals } from '../../../utils/formatters';
import { 
  X, 
  Sparkles, 
  Layers, 
  Check, 
  Plus, 
  Trash2, 
  BookmarkPlus, 
  BookmarkCheck, 
  Package, 
  Wrench, 
  Boxes, 
  ShieldCheck, 
  Info,
  ArrowRight
} from 'lucide-react';

interface QuoteTemplatesModalProps {
  isOpen: boolean;
  onClose: () => void;
  currency: 'DOP' | 'USD';
  exchangeRate?: number;
  currentItems: QuoteItem[];
  onApplyTemplate: (items: QuoteItem[], mode: 'append' | 'replace') => void;
}

export const QuoteTemplatesModal: React.FC<QuoteTemplatesModalProps> = ({
  isOpen,
  onClose,
  currency,
  exchangeRate = 60.50,
  currentItems,
  onApplyTemplate
}) => {
  const [activeTab, setActiveTab] = useState<'presets' | 'custom' | 'save_new'>('presets');
  const [customTemplates, setCustomTemplates] = useState<QuoteTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<QuoteTemplate | null>(null);
  const [applyMode, setApplyMode] = useState<'append' | 'replace'>('append');

  // New custom template form state
  const [newTemplateName, setNewTemplateName] = useState('');
  const [newTemplateCategory, setNewTemplateCategory] = useState<ServiceCategory>('camaras');
  const [newTemplateDescription, setNewTemplateDescription] = useState('');
  const [newTemplateBadge, setNewTemplateBadge] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const customs = getCustomQuoteTemplates();
      setCustomTemplates(customs);
      if (!selectedTemplate) {
        setSelectedTemplate(DEFAULT_QUOTE_TEMPLATES[0]);
      }
    }
  }, [isOpen]);

  const handleSelectTemplate = (tpl: QuoteTemplate) => {
    setSelectedTemplate(tpl);
  };

  const handleApply = () => {
    if (!selectedTemplate) return;

    // Map template items to QuoteItem instances with unique IDs and totals
    const convertedItems: QuoteItem[] = selectedTemplate.items.map((item, idx) => {
      let unitPrice = item.unitPrice;
      let costPrice = item.costPrice;

      if (currency === 'USD') {
        unitPrice = roundToTwoDecimals(item.unitPrice / exchangeRate);
        costPrice = item.costPrice ? roundToTwoDecimals(item.costPrice / exchangeRate) : undefined;
      }

      return {
        id: `item-${Date.now()}-${idx}-${Math.random().toString(36).substr(2, 4)}`,
        productId: item.productId,
        type: item.type,
        name: item.name,
        description: item.description,
        quantity: item.quantity,
        unitPrice,
        costPrice,
        total: roundToTwoDecimals(item.quantity * unitPrice)
      };
    });

    onApplyTemplate(convertedItems, applyMode);
    onClose();
  };

  const handleSaveCurrentAsTemplate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTemplateName.trim() || currentItems.length === 0) return;

    const itemsToSave = currentItems.map(item => {
      let unitPrice = item.unitPrice;
      let costPrice = item.costPrice;

      // Normalize to DOP for durable template storage
      if (currency === 'USD') {
        unitPrice = roundToTwoDecimals(item.unitPrice * exchangeRate);
        costPrice = item.costPrice ? roundToTwoDecimals(item.costPrice * exchangeRate) : undefined;
      }

      return {
        productId: item.productId,
        type: item.type,
        name: item.name,
        description: item.description,
        quantity: item.quantity,
        unitPrice,
        costPrice
      };
    });

    const created = saveCustomQuoteTemplate({
      name: newTemplateName.trim(),
      category: newTemplateCategory,
      description: newTemplateDescription.trim() || 'Plantilla guardada por el usuario.',
      badge: newTemplateBadge.trim() || undefined,
      items: itemsToSave
    });

    setCustomTemplates(getCustomQuoteTemplates());
    setSelectedTemplate(created);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      setActiveTab('custom');
      setNewTemplateName('');
      setNewTemplateDescription('');
      setNewTemplateBadge('');
    }, 1200);
  };

  const handleDeleteCustomTemplate = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('¿Seguro que deseas eliminar esta plantilla personalizada?')) {
      deleteCustomQuoteTemplate(id);
      const updated = getCustomQuoteTemplates();
      setCustomTemplates(updated);
      if (selectedTemplate?.id === id) {
        setSelectedTemplate(updated[0] || DEFAULT_QUOTE_TEMPLATES[0]);
      }
    }
  };

  if (!isOpen) return null;

  // Calculate estimated total for previewed template
  const calculateTemplateTotal = (tpl: QuoteTemplate) => {
    return tpl.items.reduce((sum, it) => {
      const price = currency === 'USD' ? roundToTwoDecimals(it.unitPrice / exchangeRate) : it.unitPrice;
      return sum + roundToTwoDecimals(it.quantity * price);
    }, 0);
  };

  return (
    <div className="fixed inset-0 z-[75] flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div 
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl w-full max-w-5xl h-[90vh] max-h-[850px] flex flex-col overflow-hidden text-slate-900 dark:text-white"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-600 dark:text-purple-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
                <span>Paquetes & Plantillas de Presupuesto</span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300">
                  Acelerador Comercial
                </span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Inserta conjuntos completos de equipos, materiales y mano de obra en 1 solo clic.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 px-5 pt-3 gap-3 bg-white dark:bg-slate-900">
          <button
            type="button"
            onClick={() => { setActiveTab('presets'); setSelectedTemplate(DEFAULT_QUOTE_TEMPLATES[0]); }}
            className={`pb-3 px-1 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'presets'
                ? 'border-purple-600 text-purple-600 dark:text-purple-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Paquetes Estándar Martínez Tech ({DEFAULT_QUOTE_TEMPLATES.length})</span>
          </button>

          <button
            type="button"
            onClick={() => { setActiveTab('custom'); setSelectedTemplate(customTemplates[0] || null); }}
            className={`pb-3 px-1 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'custom'
                ? 'border-purple-600 text-purple-600 dark:text-purple-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
            }`}
          >
            <BookmarkCheck className="w-4 h-4" />
            <span>Mis Plantillas Guardadas ({customTemplates.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('save_new')}
            className={`pb-3 px-1 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'save_new'
                ? 'border-purple-600 text-purple-600 dark:text-purple-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
            }`}
          >
            <BookmarkPlus className="w-4 h-4" />
            <span>Guardar Partidas Actuales ({currentItems.length})</span>
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
          {activeTab === 'save_new' ? (
            /* Save New Template Tab */
            <div className="flex-1 overflow-y-auto p-6 max-w-2xl mx-auto space-y-5">
              <div className="p-4 rounded-xl bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800/40 flex items-start gap-3">
                <BookmarkPlus className="w-5 h-5 text-purple-600 dark:text-purple-400 shrink-0 mt-0.5" />
                <div className="text-xs space-y-1">
                  <p className="font-bold text-purple-900 dark:text-purple-200">
                    Crea una plantilla reutilizable con tus partidas actuales
                  </p>
                  <p className="text-purple-700 dark:text-purple-400">
                    Se guardarán las <strong>{currentItems.length} partidas</strong> que tienes en este momento en el presupuesto, incluyendo cantidades y precios base.
                  </p>
                </div>
              </div>

              {currentItems.length === 0 ? (
                <div className="p-8 text-center border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl">
                  <p className="text-sm font-semibold text-slate-500">
                    Tu presupuesto actual no tiene partidas agregadas.
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    Agrega algunos ítems al presupuesto antes de guardarlo como plantilla.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSaveCurrentAsTemplate} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      Nombre de la Plantilla <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ej. Kit Alarma Residencial Inalámbrica 4 Zonas"
                      value={newTemplateName}
                      onChange={(e) => setNewTemplateName(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-semibold focus:outline-none focus:border-purple-500"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        Categoría Principal
                      </label>
                      <select
                        value={newTemplateCategory}
                        onChange={(e) => setNewTemplateCategory(e.target.value as ServiceCategory)}
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-semibold focus:outline-none focus:border-purple-500"
                      >
                        <option value="camaras">Cámaras de Vigilancia</option>
                        <option value="redes">Redes Informáticas</option>
                        <option value="acceso">Control de Acceso</option>
                        <option value="alarmas">Alarmas de Seguridad</option>
                        <option value="intercom">Intercom & Video Porteros</option>
                        <option value="motores">Motores de Portón</option>
                        <option value="cerraduras">Cerraduras Magnéticas</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        Etiqueta / Badge (Opcional)
                      </label>
                      <input
                        type="text"
                        placeholder="Ej. Promoción, Frecuente, Premium"
                        value={newTemplateBadge}
                        onChange={(e) => setNewTemplateBadge(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs focus:outline-none focus:border-purple-500"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      Descripción del Paquete
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Breve explicación de qué incluye este paquete y para qué tipo de cliente se recomienda..."
                      value={newTemplateDescription}
                      onChange={(e) => setNewTemplateDescription(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs focus:outline-none focus:border-purple-500"
                    />
                  </div>

                  {/* Summary of items that will be saved */}
                  <div className="space-y-1.5 pt-2">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      Partidas que se incluirán ({currentItems.length}):
                    </label>
                    <div className="max-h-48 overflow-y-auto space-y-1 p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60">
                      {currentItems.map((item, idx) => (
                        <div key={item.id} className="flex items-center justify-between text-xs py-1 border-b last:border-0 border-slate-200 dark:border-slate-700/40">
                          <span className="font-semibold text-slate-800 dark:text-slate-200 truncate pr-2">
                            {item.quantity}x {item.name}
                          </span>
                          <span className="font-mono text-slate-500 shrink-0">
                            {formatCurrency(item.total, currency)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <button
                    type="submit"
                    className={`w-full py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md ${
                      savedSuccess 
                        ? 'bg-emerald-600 text-white' 
                        : 'bg-purple-600 hover:bg-purple-500 text-white'
                    }`}
                  >
                    {savedSuccess ? (
                      <>
                        <Check className="w-4 h-4" />
                        <span>¡Plantilla Guardada Exitosamente!</span>
                      </>
                    ) : (
                      <>
                        <BookmarkPlus className="w-4 h-4" />
                        <span>Guardar como Plantilla Personalizada</span>
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          ) : (
            /* Presets or Custom Templates Split View */
            <>
              {/* Left column: Templates list */}
              <div className="w-full md:w-5/12 border-b md:border-b-0 md:border-r border-slate-200 dark:border-slate-800 overflow-y-auto p-3 space-y-2">
                {activeTab === 'presets' ? (
                  DEFAULT_QUOTE_TEMPLATES.map(tpl => {
                    const isSelected = selectedTemplate?.id === tpl.id;
                    const catInfo = getCategoryInfo(tpl.category);
                    const totalEst = calculateTemplateTotal(tpl);

                    return (
                      <div
                        key={tpl.id}
                        onClick={() => handleSelectTemplate(tpl)}
                        className={`p-3 rounded-xl border cursor-pointer transition-all space-y-1.5 ${
                          isSelected
                            ? 'bg-purple-50/80 dark:bg-purple-950/40 border-purple-500 shadow-sm'
                            : 'bg-white dark:bg-slate-800/70 border-slate-200 dark:border-slate-700/80 hover:border-purple-300'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-1">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${catInfo.color}`}>
                            {catInfo.label}
                          </span>
                          {tpl.badge && (
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-purple-100 dark:bg-purple-900/60 text-purple-800 dark:text-purple-300">
                              {tpl.badge}
                            </span>
                          )}
                        </div>

                        <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white leading-snug">
                          {tpl.name}
                        </h4>

                        <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2">
                          {tpl.description}
                        </p>

                        <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-100 dark:border-slate-800">
                          <span className="text-slate-400 font-medium">
                            {tpl.items.length} partidas incluidas
                          </span>
                          <span className="font-bold font-mono text-purple-700 dark:text-purple-400">
                            ~ {formatCurrency(totalEst, currency)}
                          </span>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  customTemplates.length === 0 ? (
                    <div className="p-8 text-center space-y-3">
                      <BookmarkPlus className="w-8 h-8 text-slate-400 mx-auto" />
                      <p className="text-xs font-bold text-slate-600 dark:text-slate-300">
                        No tienes plantillas personalizadas aún.
                      </p>
                      <button
                        type="button"
                        onClick={() => setActiveTab('save_new')}
                        className="text-xs font-bold text-purple-600 dark:text-purple-400 hover:underline"
                      >
                        + Guardar presupuesto actual como plantilla
                      </button>
                    </div>
                  ) : (
                    customTemplates.map(tpl => {
                      const isSelected = selectedTemplate?.id === tpl.id;
                      const catInfo = getCategoryInfo(tpl.category);
                      const totalEst = calculateTemplateTotal(tpl);

                      return (
                        <div
                          key={tpl.id}
                          onClick={() => handleSelectTemplate(tpl)}
                          className={`p-3 rounded-xl border cursor-pointer transition-all space-y-1.5 relative group ${
                            isSelected
                              ? 'bg-purple-50/80 dark:bg-purple-950/40 border-purple-500 shadow-sm'
                              : 'bg-white dark:bg-slate-800/70 border-slate-200 dark:border-slate-700/80 hover:border-purple-300'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-1">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${catInfo.color}`}>
                              {catInfo.label}
                            </span>
                            <div className="flex items-center gap-1">
                              {tpl.badge && (
                                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-purple-100 dark:bg-purple-900/60 text-purple-800 dark:text-purple-300">
                                  {tpl.badge}
                                </span>
                              )}
                              <button
                                type="button"
                                onClick={(e) => handleDeleteCustomTemplate(tpl.id, e)}
                                className="p-1 rounded text-slate-400 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                title="Eliminar plantilla"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </div>

                          <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white leading-snug">
                            {tpl.name}
                          </h4>

                          <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2">
                            {tpl.description}
                          </p>

                          <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-100 dark:border-slate-800">
                            <span className="text-slate-400 font-medium">
                              {tpl.items.length} partidas
                            </span>
                            <span className="font-bold font-mono text-purple-700 dark:text-purple-400">
                              ~ {formatCurrency(totalEst, currency)}
                            </span>
                          </div>
                        </div>
                      );
                    })
                  )
                )}
              </div>

              {/* Right column: Selected Template Detail & Apply */}
              <div className="w-full md:w-7/12 flex flex-col justify-between overflow-hidden bg-slate-50/50 dark:bg-slate-900/40">
                {selectedTemplate ? (
                  <>
                    <div className="p-4 sm:p-6 overflow-y-auto space-y-4 flex-1">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${getCategoryInfo(selectedTemplate.category).color}`}>
                            {getCategoryInfo(selectedTemplate.category).label}
                          </span>
                          {selectedTemplate.badge && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-100 dark:bg-purple-900/60 text-purple-800 dark:text-purple-300">
                              {selectedTemplate.badge}
                            </span>
                          )}
                        </div>
                        <h3 className="text-lg font-black text-slate-900 dark:text-white">
                          {selectedTemplate.name}
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                          {selectedTemplate.description}
                        </p>
                      </div>

                      {/* Line items preview */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                          <span>Detalle de Partidas Incluidas:</span>
                          <span className="font-mono text-slate-500">{selectedTemplate.items.length} ítems</span>
                        </div>

                        <div className="rounded-xl border border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-800 overflow-hidden divide-y divide-slate-100 dark:divide-slate-700/60">
                          {selectedTemplate.items.map((item, idx) => {
                            const price = currency === 'USD' 
                              ? roundToTwoDecimals(item.unitPrice / exchangeRate) 
                              : item.unitPrice;
                            const itemTotal = roundToTwoDecimals(item.quantity * price);

                            return (
                              <div key={idx} className="p-2.5 text-xs flex items-start justify-between gap-2">
                                <div className="space-y-0.5">
                                  <div className="flex items-center gap-1.5">
                                    <span className="font-bold text-slate-900 dark:text-white">
                                      {item.quantity}x {item.name}
                                    </span>
                                    <span className="text-[9px] px-1 rounded bg-slate-100 dark:bg-slate-700 text-slate-500 uppercase">
                                      {item.type}
                                    </span>
                                  </div>
                                  {item.description && (
                                    <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">
                                      {item.description}
                                    </p>
                                  )}
                                </div>
                                <span className="font-mono font-bold text-slate-800 dark:text-slate-200 shrink-0">
                                  {formatCurrency(itemTotal, currency)}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Estimated Subtotal Box */}
                      <div className="p-3 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800/60 flex items-center justify-between">
                        <span className="text-xs font-bold text-purple-900 dark:text-purple-200">
                          Total Estimado del Paquete:
                        </span>
                        <span className="font-mono font-black text-base text-purple-700 dark:text-purple-300">
                          {formatCurrency(calculateTemplateTotal(selectedTemplate), currency)}
                        </span>
                      </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col sm:flex-row items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <label className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                          Modo de inserción:
                        </label>
                        <select
                          value={applyMode}
                          onChange={(e) => setApplyMode(e.target.value as 'append' | 'replace')}
                          className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-semibold focus:outline-none"
                        >
                          <option value="append">Sumar a partidas actuales</option>
                          <option value="replace">Reemplazar partidas actuales</option>
                        </select>
                      </div>

                      <button
                        type="button"
                        onClick={handleApply}
                        className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs flex items-center justify-center gap-2 shadow-sm transition-all"
                      >
                        <ArrowRight className="w-4 h-4" />
                        <span>Insertar {selectedTemplate.items.length} Partidas al Presupuesto</span>
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="flex-1 flex items-center justify-center p-8 text-slate-400 text-xs">
                    Selecciona una plantilla de la lista de la izquierda para ver su desglose.
                  </div>
                )}
              </div>
            </>
          )}
        </div>

      </div>
    </div>
  );
};
