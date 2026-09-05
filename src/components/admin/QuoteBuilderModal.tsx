import React, { useState, useEffect } from 'react';
import { useAppState } from '../../context/AppStateContext';
import { useToast } from '../ui/ToastNotification';
import { QuoteItem, Quote, CatalogProduct } from '../../types';
import { 
  X, 
  Plus, 
  Trash2, 
  Save, 
  Calculator, 
  Package, 
  FileText,
  TrendingUp,
  Percent,
  Eye,
  EyeOff,
  AlertTriangle,
  RotateCcw,
  CheckCircle2,
  ShieldAlert,
  Users,
  ChevronUp,
  ChevronDown,
  Copy,
  Sparkles,
  Layers,
  Search,
  Boxes,
  Wrench,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import { 
  formatCurrency, 
  validateDominicanRNC, 
  formatDominicanPhone, 
  saveDraft, 
  loadDraft, 
  clearDraft, 
  RNCValidationResult,
  roundToTwoDecimals
} from '../../utils/formatters';
import { CatalogPickerModal } from './quote-builder/CatalogPickerModal';
import { QuoteTemplatesModal } from './quote-builder/QuoteTemplatesModal';

export const QuoteBuilderModal: React.FC = () => {
  const { 
    isQuoteModalOpen, 
    setIsQuoteModalOpen, 
    activeQuoteForEdit, 
    quoteDealPreload, 
    addQuote, 
    updateQuote, 
    setActiveQuoteForView, 
    catalog, 
    currentUser,
    companySettings,
    clients,
    addClient
  } = useAppState();

  const canViewCosts = currentUser?.role === 'admin' || !currentUser?.role;
  const { showToast } = useToast();

  const [clientId, setClientId] = useState<string>('');
  const [saveToDirectory, setSaveToDirectory] = useState<boolean>(false);
  const [clientName, setClientName] = useState('');
  const [clientCompany, setClientCompany] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientRnc, setClientRnc] = useState('');
  const [clientAddress, setClientAddress] = useState('');
  const [selectedDealId, setSelectedDealId] = useState<string>('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  
  const [validUntil, setValidUntil] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 15);
    return d.toISOString().slice(0, 10);
  });

  const [currency, setCurrency] = useState<'DOP' | 'USD'>('DOP');
  const [items, setItems] = useState<QuoteItem[]>([]);
  const [discountPercent, setDiscountPercent] = useState<number>(0);
  const [applyTax, setApplyTax] = useState<boolean>(false);
  const [taxPercent, setTaxPercent] = useState<number>(18);
  const [deliveryTime, setDeliveryTime] = useState('2 a 4 días laborables');
  const [warrantyNotes, setWarrantyNotes] = useState(companySettings.defaultWarranty);
  const [paymentTerms, setPaymentTerms] = useState(companySettings.defaultTerms);
  const [notes, setNotes] = useState('');
  const [showCostMargin, setShowCostMargin] = useState(canViewCosts);

  const [selectedCatalogId, setSelectedCatalogId] = useState('');
  const [isCatalogPickerOpen, setIsCatalogPickerOpen] = useState(false);
  const [isTemplatesModalOpen, setIsTemplatesModalOpen] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [draftRestoredAt, setDraftRestoredAt] = useState<string | null>(null);
  const [rncValidation, setRncValidation] = useState<RNCValidationResult>({ isValid: false, type: 'Inválido', formatted: '', message: '' });

  const handleSelectClient = (cId: string) => {
    setClientId(cId);
    if (!cId) return;
    const cl = clients.find(c => c.id === cId);
    if (cl) {
      setClientName(cl.name);
      setClientCompany(cl.company || '');
      setClientPhone(cl.phone);
      setClientEmail(cl.email || '');
      setClientRnc(cl.rnc || '');
      setClientAddress(cl.address || '');
    }
  };

  // Dirty state tracking
  const isDirty = Boolean(
    clientName.trim() || 
    clientCompany.trim() || 
    clientPhone.trim() || 
    clientRnc.trim() || 
    clientAddress.trim() || 
    notes.trim() || 
    items.length > 1 || 
    (items.length === 1 && items[0].name !== 'Instalación y Configuración Técnica')
  );

  // Auto-save draft debounced
  useEffect(() => {
    if (!isQuoteModalOpen || activeQuoteForEdit) return;
    if (!isDirty) return;

    const timer = setTimeout(() => {
      saveDraft('quote_builder', {
        clientId,
        clientName,
        clientCompany,
        clientPhone,
        clientEmail,
        clientRnc,
        clientAddress,
        selectedDealId,
        date,
        validUntil,
        currency,
        items,
        discountPercent,
        applyTax,
        taxPercent,
        deliveryTime,
        warrantyNotes,
        paymentTerms,
        notes
      });
    }, 1000);

    return () => clearTimeout(timer);
  }, [
    isQuoteModalOpen,
    activeQuoteForEdit,
    isDirty,
    clientId,
    clientName,
    clientCompany,
    clientPhone,
    clientEmail,
    clientRnc,
    clientAddress,
    selectedDealId,
    date,
    validUntil,
    currency,
    items,
    discountPercent,
    applyTax,
    taxPercent,
    deliveryTime,
    warrantyNotes,
    paymentTerms,
    notes
  ]);

  // Restore draft on initial open if exists
  useEffect(() => {
    if (isQuoteModalOpen && !activeQuoteForEdit && !quoteDealPreload) {
      const draft = loadDraft<any>('quote_builder');
      if (draft && draft.data && (draft.data.clientName || draft.data.items?.length > 1)) {
        const d = draft.data;
        setClientId(d.clientId || '');
        setClientName(d.clientName || '');
        setClientCompany(d.clientCompany || '');
        setClientPhone(d.clientPhone || '');
        setClientEmail(d.clientEmail || '');
        setClientRnc(d.clientRnc || '');
        setClientAddress(d.clientAddress || '');
        setSelectedDealId(d.selectedDealId || '');
        setDate(d.date || new Date().toISOString().slice(0, 10));
        setValidUntil(d.validUntil || '');
        setCurrency(d.currency || 'DOP');
        if (d.items?.length) setItems(d.items);
        setDiscountPercent(d.discountPercent || 0);
        setApplyTax(Boolean(d.applyTax));
        setTaxPercent(d.taxPercent || 18);
        setDeliveryTime(d.deliveryTime || '2 a 4 días laborables');
        setWarrantyNotes(d.warrantyNotes || companySettings.defaultWarranty);
        setPaymentTerms(d.paymentTerms || companySettings.defaultTerms);
        setNotes(d.notes || '');
        setDraftRestoredAt(draft.savedAt);
      }
    }
  }, [isQuoteModalOpen, activeQuoteForEdit, quoteDealPreload]);

  // Update RNC validation
  useEffect(() => {
    if (clientRnc) {
      setRncValidation(validateDominicanRNC(clientRnc));
    } else {
      setRncValidation({ isValid: false, type: 'Inválido', formatted: '', message: '' });
    }
  }, [clientRnc]);

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setClientPhone(formatDominicanPhone(e.target.value));
  };

  const handleSafeClose = () => {
    if (isDirty) {
      setShowExitConfirm(true);
    } else {
      setIsQuoteModalOpen(false);
    }
  };

  const handleDiscardAndClose = () => {
    clearDraft('quote_builder');
    setShowExitConfirm(false);
    setDraftRestoredAt(null);
    setIsQuoteModalOpen(false);
  };

  useEffect(() => {
    if (activeQuoteForEdit) {
      setClientId(activeQuoteForEdit.clientId || '');
      setClientName(activeQuoteForEdit.clientName);
      setClientCompany(activeQuoteForEdit.clientCompany || '');
      setClientPhone(activeQuoteForEdit.clientPhone);
      setClientEmail(activeQuoteForEdit.clientEmail || '');
      setClientRnc(activeQuoteForEdit.clientRnc || '');
      setClientAddress(activeQuoteForEdit.clientAddress || '');
      setSelectedDealId(activeQuoteForEdit.dealId || '');
      setDate(activeQuoteForEdit.date);
      setValidUntil(activeQuoteForEdit.validUntil);
      setCurrency(activeQuoteForEdit.currency);
      setItems(activeQuoteForEdit.items || []);
      setDiscountPercent(activeQuoteForEdit.discountPercent || 0);
      setApplyTax(activeQuoteForEdit.applyTax);
      setTaxPercent(activeQuoteForEdit.taxPercent || 18);
      setDeliveryTime(activeQuoteForEdit.deliveryTime || '2 a 4 días laborables');
      setWarrantyNotes(activeQuoteForEdit.warrantyNotes || companySettings.defaultWarranty);
      setPaymentTerms(activeQuoteForEdit.paymentTerms || companySettings.defaultTerms);
      setNotes(activeQuoteForEdit.notes || '');
      setSaveToDirectory(false);
    } else if (quoteDealPreload) {
      setClientId(quoteDealPreload.clientId || '');
      setClientName(quoteDealPreload.clientName);
      setClientCompany(quoteDealPreload.clientType !== 'residential' ? quoteDealPreload.clientName : '');
      setClientPhone(quoteDealPreload.clientPhone);
      setClientEmail(quoteDealPreload.clientEmail || '');
      setClientAddress(quoteDealPreload.clientAddress || '');
      setSelectedDealId(quoteDealPreload.id);
      setDate(new Date().toISOString().slice(0, 10));
      
      const d = new Date();
      d.setDate(d.getDate() + 15);
      setValidUntil(d.toISOString().slice(0, 10));
      
      setCurrency('DOP');
      const val = quoteDealPreload.estimatedValue || 15000;
      setItems([
        {
          id: `item-${Date.now()}`,
          type: 'product',
          name: quoteDealPreload.title,
          description: 'Suministro e instalación completa según especificaciones técnicas.',
          quantity: 1,
          unitPrice: val,
          costPrice: Math.round(val * 0.6),
          total: val
        }
      ]);
      setDiscountPercent(0);
      setApplyTax(false);
      setTaxPercent(18);
      setDeliveryTime('2 a 4 días laborables');
      setWarrantyNotes(companySettings.defaultWarranty);
      setPaymentTerms(companySettings.defaultTerms);
      setNotes('');
      setSaveToDirectory(false);
    } else if (!draftRestoredAt) {
      setClientId('');
      setClientName('');
      setClientCompany('');
      setClientPhone('');
      setClientEmail('');
      setClientRnc('');
      setClientAddress('');
      setSelectedDealId('');
      setDate(new Date().toISOString().slice(0, 10));
      
      const d = new Date();
      d.setDate(d.getDate() + 15);
      setValidUntil(d.toISOString().slice(0, 10));
      
      setCurrency('DOP');
      setItems([
        {
          id: `item-${Date.now()}`,
          type: 'product',
          name: 'Instalación y Configuración Técnica',
          description: 'Mano de obra especializada, materiales e insumos de conexión.',
          quantity: 1,
          unitPrice: 5500,
          costPrice: 2800,
          total: 5500
        }
      ]);
      setDiscountPercent(0);
      setApplyTax(false);
      setTaxPercent(18);
      setDeliveryTime('2 a 4 días laborables');
      setWarrantyNotes(companySettings.defaultWarranty);
      setPaymentTerms(companySettings.defaultTerms);
      setNotes('');
      setSaveToDirectory(false);
    }
  }, [activeQuoteForEdit, quoteDealPreload, isQuoteModalOpen]);

  // Keyboard shortcut Ctrl+Enter or Cmd+Enter to submit
  useEffect(() => {
    if (!isQuoteModalOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        const form = document.getElementById('quote-builder-form') as HTMLFormElement | null;
        if (form) {
          e.preventDefault();
          form.requestSubmit();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isQuoteModalOpen]);

  // Add Item from Catalog Picker Modal
  const handleAddItemFromPicker = (itemData: Omit<QuoteItem, 'id' | 'total'>, qty: number) => {
    const newItem: QuoteItem = {
      id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      ...itemData,
      quantity: qty,
      total: roundToTwoDecimals(qty * itemData.unitPrice)
    };
    setItems(prev => [...prev, newItem]);
    showToast(`"${itemData.name}" agregado al presupuesto`, 'success');
  };

  // Add Item from quick select
  const handleAddFromCatalog = () => {
    if (!selectedCatalogId) return;
    const catItem = catalog.find(c => c.id === selectedCatalogId);
    if (!catItem) return;

    let effectivePrice = catItem.unitPrice;
    let effectiveCost = catItem.costPrice || roundToTwoDecimals(catItem.unitPrice * 0.65);

    if (currency === 'USD') {
      const rate = companySettings.defaultExchangeRate || 60.50;
      effectivePrice = roundToTwoDecimals(catItem.unitPrice / rate);
      effectiveCost = roundToTwoDecimals(effectiveCost / rate);
    }

    const newItem: QuoteItem = {
      id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      productId: catItem.id,
      name: catItem.name,
      description: catItem.description,
      quantity: 1,
      unitPrice: effectivePrice,
      costPrice: effectiveCost,
      total: effectivePrice,
      type: catItem.type
    };

    setItems(prev => [...prev, newItem]);
    setSelectedCatalogId('');
    showToast(`"${catItem.name}" agregado`, 'success');
  };

  // Add Empty Custom Item
  const handleAddItem = (type: QuoteItem['type'] = 'product') => {
    const newItem: QuoteItem = {
      id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      name: '',
      description: '',
      quantity: 1,
      unitPrice: 0,
      costPrice: 0,
      total: 0,
      type
    };
    setItems(prev => [...prev, newItem]);
  };

  // Move line item up or down
  const handleMoveItem = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= items.length) return;
    setItems(prev => {
      const copy = [...prev];
      const temp = copy[index];
      copy[index] = copy[targetIndex];
      copy[targetIndex] = temp;
      return copy;
    });
  };

  // Duplicate line item
  const handleDuplicateItem = (id: string) => {
    const index = items.findIndex(it => it.id === id);
    if (index === -1) return;
    const target = items[index];
    const cloned: QuoteItem = {
      ...target,
      id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      name: target.name ? `${target.name} (Copia)` : '',
      total: roundToTwoDecimals((target.quantity || 1) * (target.unitPrice || 0))
    };
    setItems(prev => {
      const copy = [...prev];
      copy.splice(index + 1, 0, cloned);
      return copy;
    });
    showToast('Partida duplicada exitosamente', 'info');
  };

  // Clear all items with confirmation
  const handleClearAllItems = () => {
    if (items.length === 0) return;
    if (window.confirm('¿Seguro que deseas eliminar todas las partidas del presupuesto actual?')) {
      setItems([]);
      showToast('Todas las partidas han sido eliminadas', 'info');
    }
  };

  // Apply bundle template
  const handleApplyTemplate = (newItems: QuoteItem[], mode: 'append' | 'replace') => {
    if (mode === 'replace') {
      setItems(newItems);
      showToast(`Plantilla aplicada (${newItems.length} partidas)`, 'success');
    } else {
      setItems(prev => [...prev, ...newItems]);
      showToast(`${newItems.length} partidas agregadas desde la plantilla`, 'success');
    }
  };

  // Update Item
  const handleUpdateItem = (id: string, updates: Partial<QuoteItem>) => {
    setItems(prev => prev.map(item => {
      if (item.id === id) {
        const updated = { ...item, ...updates };
        updated.total = roundToTwoDecimals((updated.quantity || 0) * (updated.unitPrice || 0));
        return updated;
      }
      return item;
    }));
  };

  // Delete Item
  const handleDeleteItem = (id: string) => {
    setItems(prev => prev.filter(item => item.id !== id));
  };

  // Financial & Profit Margin Calculations
  const subtotal = roundToTwoDecimals(items.reduce((sum, item) => sum + (item.total || 0), 0));
  const totalCost = roundToTwoDecimals(items.reduce((sum, item) => sum + ((item.costPrice || 0) * (item.quantity || 1)), 0));
  const discountAmount = roundToTwoDecimals((subtotal * (discountPercent || 0)) / 100);
  const taxableAmount = roundToTwoDecimals(Math.max(0, subtotal - discountAmount));
  const taxAmount = applyTax ? roundToTwoDecimals((taxableAmount * (taxPercent || 18)) / 100) : 0;
  const total = roundToTwoDecimals(taxableAmount + taxAmount);

  // Margin Calculations (confidential for Admin)
  const grossProfit = roundToTwoDecimals(Math.max(0, taxableAmount - totalCost));
  const profitMarginPercent = taxableAmount > 0 ? Math.round((grossProfit / taxableAmount) * 100) : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName || items.length === 0) {
      showToast('Por favor ingrese el nombre del cliente y al menos un ítem cotizado.', 'warning');
      return;
    }

    // Auto-save client to directory if checked and not already in directory
    let effectiveClientId = clientId;
    if (saveToDirectory && !clientId && clientName.trim() && clientPhone.trim()) {
      const existingClient = clients.find(c => 
        c.phone === clientPhone.trim() || c.name.toLowerCase() === clientName.trim().toLowerCase()
      );
      if (!existingClient) {
        try {
          const createdClient = await addClient({
            name: clientName.trim(),
            company: clientCompany.trim() || undefined,
            phone: clientPhone.trim(),
            email: clientEmail.trim() || undefined,
            rnc: clientRnc.trim() || undefined,
            address: clientAddress.trim() || 'Santo Domingo',
            city: 'Santo Domingo',
            type: clientCompany ? 'commercial' : 'residential'
          });
          if (createdClient?.id) {
            effectiveClientId = createdClient.id;
          }
        } catch (err) {
          console.warn('No se pudo guardar automáticamente el cliente:', err);
        }
      } else {
        effectiveClientId = existingClient.id;
      }
    }

    let savedQuote: Quote;

    if (activeQuoteForEdit) {
      await updateQuote(activeQuoteForEdit.id, {
        dealId: selectedDealId || undefined,
        clientId: effectiveClientId || undefined,
        clientName,
        clientCompany,
        clientPhone,
        clientEmail,
        clientRnc,
        clientAddress,
        date,
        validUntil,
        items,
        subtotal,
        discountPercent,
        discountAmount,
        applyTax,
        taxPercent,
        taxAmount,
        total,
        currency,
        terms: [paymentTerms],
        warrantyNotes,
        paymentTerms,
        deliveryTime,
        notes,
      });
      savedQuote = {
        ...activeQuoteForEdit,
        clientId: effectiveClientId || undefined,
        clientName,
        total,
        items
      };
    } else {
      savedQuote = await addQuote({
        dealId: selectedDealId || undefined,
        clientId: effectiveClientId || undefined,
        clientName,
        clientCompany,
        clientPhone,
        clientEmail,
        clientRnc,
        clientAddress,
        date,
        validUntil,
        items,
        subtotal,
        discountPercent,
        discountAmount,
        applyTax,
        taxPercent,
        taxAmount,
        total,
        currency,
        terms: [paymentTerms],
        warrantyNotes,
        paymentTerms,
        deliveryTime,
        notes,
        status: 'sent',
        createdBy: currentUser?.name || 'Rafael Martínez'
      });
    }

    clearDraft('quote_builder');
    setDraftRestoredAt(null);
    showToast('Presupuesto guardado exitosamente', 'success');
    setIsQuoteModalOpen(false);
    setActiveQuoteForView(savedQuote);
  };

  if (!isQuoteModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      
      {/* Exit Confirmation Dialog */}
      {showExitConfirm && (
        <div className="fixed inset-0 z-60 bg-black/70 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-fadeIn">
            <div className="flex items-center gap-3 text-amber-600 dark:text-amber-400">
              <AlertTriangle className="w-6 h-6 flex-shrink-0" />
              <h4 className="text-base font-black text-slate-900 dark:text-white">
                ¿Descartar cambios no guardados?
              </h4>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Tienes información ingresada en esta cotización. Si decides salir, los cambios no guardados se perderán.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setShowExitConfirm(false)}
                className="px-4 py-2 rounded-xl bg-brand-teal-600 hover:bg-brand-teal-500 text-white font-bold text-xs shadow-sm"
              >
                Continuar Editando
              </button>
              <button
                type="button"
                onClick={handleDiscardAndClose}
                className="px-3 py-2 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 hover:bg-rose-100 font-bold text-xs border border-rose-300 dark:border-rose-800"
              >
                Descartar y Salir
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-2xl max-w-4xl w-full p-5 sm:p-7 relative max-h-[95vh] overflow-y-auto shadow-2xl space-y-6">
        
        {/* Draft Restored Banner */}
        {draftRestoredAt && (
          <div className="p-3 rounded-xl bg-cyan-50 dark:bg-cyan-950/40 border border-cyan-300 dark:border-cyan-500/30 flex items-center justify-between text-xs text-cyan-900 dark:text-cyan-300">
            <div className="flex items-center gap-2">
              <RotateCcw className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
              <span>Borrador restaurado automáticamente ({new Date(draftRestoredAt).toLocaleTimeString()}).</span>
            </div>
            <button
              type="button"
              onClick={() => { clearDraft('quote_builder'); setDraftRestoredAt(null); }}
              className="text-[11px] font-bold underline hover:no-underline text-cyan-800 dark:text-cyan-200"
            >
              Descartar Borrador
            </button>
          </div>
        )}

        {/* Header */}
        <div className="flex items-center justify-between border-b-2 border-slate-200 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-teal-50 dark:bg-brand-teal-500/10 border border-brand-teal-300 dark:border-brand-teal-500/30 flex items-center justify-center text-brand-teal-600 dark:text-brand-teal-400 shadow-sm">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-900 dark:text-white">
                {activeQuoteForEdit ? `Editar Presupuesto (${activeQuoteForEdit.quoteNumber})` : 'Elaborador de Presupuestos & Cotizaciones'}
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                Genera propuestas formales con diseño membretado de Martínez Tech, exportables a PDF e imprimibles.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowCostMargin(!showCostMargin)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 border transition-all ${
                showCostMargin 
                  ? 'bg-brand-teal-50 dark:bg-brand-teal-950/60 border-brand-teal-400 text-brand-teal-800 dark:text-brand-teal-300'
                  : 'bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400'
              }`}
              title="Alternar vista de costos y márgenes confidenciales de rentabilidad"
            >
              {showCostMargin ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
              <span>{showCostMargin ? 'Costos Activos' : 'Ocultar Costos'}</span>
            </button>

            <button
              type="button"
              onClick={handleSafeClose}
              className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-black dark:hover:text-white border border-slate-300 dark:border-slate-700"
              aria-label="Cerrar Modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <form id="quote-builder-form" onSubmit={handleSubmit} className="space-y-6">
          
          {/* Client & Metadata Grid */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-300 dark:border-slate-800 space-y-4 shadow-sm">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="text-xs font-bold text-brand-teal-800 dark:text-brand-teal-400 uppercase tracking-wider">
                1. Datos del Cliente & Presupuesto
              </div>
              {clients.length > 0 && (
                <div className="flex items-center gap-1.5 bg-white dark:bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-300 dark:border-slate-700 shadow-xs">
                  <Users className="w-3.5 h-3.5 text-brand-teal-600 dark:text-brand-teal-400 flex-shrink-0" />
                  <select
                    value={clientId}
                    onChange={(e) => handleSelectClient(e.target.value)}
                    className="bg-transparent text-[11px] text-slate-800 dark:text-slate-200 font-semibold focus:outline-none cursor-pointer max-w-[240px] truncate"
                  >
                    <option value="">-- Cargar de Directorio de Clientes --</option>
                    {clients.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.name} {c.company ? `(${c.company})` : ''} - {c.phone}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-800 dark:text-slate-300">
                  Cliente o Contacto <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Ing. Carlos Mendoza"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-brand-teal-500 shadow-sm"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-800 dark:text-slate-300">
                  Empresa o Institución (Opcional)
                </label>
                <input
                  type="text"
                  placeholder="Ej. Centro Logístico del Caribe"
                  value={clientCompany}
                  onChange={(e) => setClientCompany(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-brand-teal-500 shadow-sm"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-800 dark:text-slate-300">
                  Teléfono / WhatsApp
                </label>
                <input
                  type="tel"
                  placeholder="Ej. (809) 555-4321"
                  value={clientPhone}
                  onChange={handlePhoneChange}
                  className="w-full px-3 py-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-brand-teal-500 shadow-sm font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold text-slate-800 dark:text-slate-300">
                    RNC / Cédula (Opcional)
                  </label>
                  {clientRnc && (
                    <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded ${
                      rncValidation.isValid 
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-500/30' 
                        : 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-300 dark:border-rose-500/30'
                    }`}>
                      {rncValidation.isValid ? `✓ ${rncValidation.type}` : 'Inválido'}
                    </span>
                  )}
                </div>
                <input
                  type="text"
                  placeholder="Ej. 131-99887-2"
                  value={clientRnc}
                  onChange={(e) => setClientRnc(e.target.value)}
                  className={`w-full px-3 py-2 rounded-lg bg-white dark:bg-slate-800 border text-xs text-slate-900 dark:text-white focus:outline-none shadow-sm font-mono ${
                    clientRnc && !rncValidation.isValid
                      ? 'border-rose-400 focus:border-rose-500'
                      : 'border-slate-300 dark:border-slate-700 focus:border-brand-teal-500'
                  }`}
                />
              </div>

              <div className="space-y-1 sm:col-span-2">
                <label className="text-[11px] font-bold text-slate-800 dark:text-slate-300">
                  Dirección o Lugar de Instalación
                </label>
                <input
                  type="text"
                  placeholder="Ej. Zona Franca San Isidro, Nave 14"
                  value={clientAddress}
                  onChange={(e) => setClientAddress(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-brand-teal-500 shadow-sm"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-800 dark:text-slate-300">
                  Moneda
                </label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value as 'DOP' | 'USD')}
                  className="w-full px-3 py-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-200 font-medium"
                >
                  <option value="DOP">Pesos Dominicanos (RD$ DOP)</option>
                  <option value="USD">Dólares Americanos (USD $)</option>
                </select>
              </div>
            </div>

            {!clientId && clientName.trim().length > 2 && (
              <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={saveToDirectory}
                    onChange={(e) => setSaveToDirectory(e.target.checked)}
                    className="rounded border-slate-300 dark:border-slate-700 text-brand-teal-600"
                  />
                  <span>Guardar este contacto en el Directorio de Clientes al guardar cotización</span>
                </label>
                <span className="text-[10px] text-slate-500 italic hidden sm:inline">Se creará automáticamente en el directorio</span>
              </div>
            )}
          </div>

          {/* Modern Catalog & Templates Action Bar */}
          <div className="p-3.5 rounded-2xl bg-slate-100/90 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-2.5">
            <div className="flex flex-wrap items-center justify-between gap-2.5">
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => setIsCatalogPickerOpen(true)}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-teal-600 hover:bg-brand-teal-500 text-white font-black text-xs shadow-xs transition-all"
                >
                  <Package className="w-4 h-4" />
                  <span>Explorar Catálogo</span>
                  <span className="px-1.5 py-0.5 rounded-full bg-white/20 text-[10px] font-mono">
                    {catalog.length}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsTemplatesModalOpen(true)}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs shadow-xs transition-all"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Paquetes & Plantillas</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleAddItem('product')}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs border border-slate-200 dark:border-slate-700 shadow-2xs transition-colors"
                >
                  <Plus className="w-4 h-4 text-brand-teal-600 dark:text-brand-teal-400" />
                  <span>+ Fila Manual</span>
                </button>
              </div>

              {/* In-line Quick Selector Dropdown for power users */}
              <div className="flex items-center gap-1.5 flex-1 min-w-[240px] max-w-md">
                <select
                  value={selectedCatalogId}
                  onChange={(e) => {
                    setSelectedCatalogId(e.target.value);
                  }}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200 font-medium focus:outline-none focus:border-brand-teal-500 truncate"
                >
                  <option value="">-- Inserción rápida desde catálogo --</option>
                  {catalog.map(c => (
                    <option key={c.id} value={c.id}>
                      [{c.type.toUpperCase()}] {c.name} - {formatCurrency(c.unitPrice, currency)}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={handleAddFromCatalog}
                  disabled={!selectedCatalogId}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-bold text-xs disabled:opacity-40 shrink-0"
                  title="Insertar ítem seleccionado"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Itemized Table */}
          <div className="space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <FileText className="w-4 h-4 text-brand-green-600 dark:text-brand-green-400" />
                <span>2. Detalle de Equipos, Materiales y Mano de Obra</span>
                <span className="px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono text-[11px] font-bold">
                  {items.length} {items.length === 1 ? 'partida' : 'partidas'}
                </span>
              </div>
              
              <div className="flex items-center gap-3">
                {items.length > 1 && (
                  <button
                    type="button"
                    onClick={handleClearAllItems}
                    className="text-[11px] text-slate-400 hover:text-rose-500 font-bold flex items-center gap-1 transition-colors"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Vaciar lista</span>
                  </button>
                )}

                {canViewCosts && (
                  <button
                    type="button"
                    onClick={() => setShowCostMargin(!showCostMargin)}
                    className="text-[11px] text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 font-bold flex items-center gap-1"
                  >
                    {showCostMargin ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                    <span>{showCostMargin ? 'Ocultar Costos' : 'Mostrar Costos'}</span>
                  </button>
                )}
              </div>
            </div>

            {items.length === 0 ? (
              <div className="p-8 text-center rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 space-y-3">
                <Package className="w-8 h-8 text-slate-400 mx-auto" />
                <div>
                  <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                    No hay partidas en este presupuesto
                  </p>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                    Usa <strong>Explorar Catálogo</strong> para agregar productos o <strong>Paquetes & Plantillas</strong> para insertar soluciones completas.
                  </p>
                </div>
                <div className="flex items-center justify-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setIsCatalogPickerOpen(true)}
                    className="px-3.5 py-1.5 rounded-lg bg-brand-teal-600 hover:bg-brand-teal-500 text-white font-bold text-xs shadow-xs"
                  >
                    Abrir Catálogo
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAddItem('product')}
                    className="px-3.5 py-1.5 rounded-lg bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs"
                  >
                    + Fila Manual
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-2.5">
                {items.map((item, idx) => {
                  const typeColors = {
                    product: 'text-cyan-700 bg-cyan-50 dark:text-cyan-300 dark:bg-cyan-950/50 border-cyan-300 dark:border-cyan-800',
                    material: 'text-amber-700 bg-amber-50 dark:text-amber-300 dark:bg-amber-950/50 border-amber-300 dark:border-amber-800',
                    labor: 'text-emerald-700 bg-emerald-50 dark:text-emerald-300 dark:bg-emerald-950/50 border-emerald-300 dark:border-emerald-800',
                    service: 'text-purple-700 bg-purple-50 dark:text-purple-300 dark:bg-purple-950/50 border-purple-300 dark:border-purple-800'
                  };

                  return (
                    <div 
                      key={item.id}
                      className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700/80 grid grid-cols-12 gap-2.5 items-center shadow-2xs hover:border-slate-400 dark:hover:border-slate-600 transition-colors"
                    >
                      {/* Reorder and Index Column */}
                      <div className="col-span-1 flex items-center gap-1 justify-center">
                        <div className="flex flex-col items-center">
                          <button
                            type="button"
                            disabled={idx === 0}
                            onClick={() => handleMoveItem(idx, 'up')}
                            className="p-0.5 rounded text-slate-400 hover:text-slate-700 dark:hover:text-white disabled:opacity-20 disabled:hover:text-slate-400"
                            title="Subir orden"
                          >
                            <ChevronUp className="w-3.5 h-3.5" />
                          </button>
                          <span className="font-mono text-[11px] text-slate-500 font-black leading-none">
                            #{idx + 1}
                          </span>
                          <button
                            type="button"
                            disabled={idx === items.length - 1}
                            onClick={() => handleMoveItem(idx, 'down')}
                            className="p-0.5 rounded text-slate-400 hover:text-slate-700 dark:hover:text-white disabled:opacity-20 disabled:hover:text-slate-400"
                            title="Bajar orden"
                          >
                            <ChevronDown className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Name, Description & Type */}
                      <div className={`space-y-1 ${(showCostMargin && canViewCosts) ? 'col-span-11 sm:col-span-4' : 'col-span-11 sm:col-span-5'}`}>
                        <div className="flex items-center gap-1.5">
                          <select
                            value={item.type || 'product'}
                            onChange={(e) => handleUpdateItem(item.id, { type: e.target.value as QuoteItem['type'] })}
                            className={`text-[10px] font-bold px-1.5 py-0.5 rounded border focus:outline-none cursor-pointer ${typeColors[item.type || 'product']}`}
                          >
                            <option value="product">Equipo</option>
                            <option value="material">Material</option>
                            <option value="labor">Mano de Obra</option>
                            <option value="service">Servicio</option>
                          </select>
                          <input
                            type="text"
                            placeholder="Nombre del equipo o partida"
                            value={item.name}
                            onChange={(e) => handleUpdateItem(item.id, { name: e.target.value })}
                            className="flex-1 px-2.5 py-1 rounded bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white font-semibold focus:outline-none focus:border-brand-teal-500"
                          />
                        </div>
                        <input
                          type="text"
                          placeholder="Descripción técnica, marca o especificaciones (opcional)"
                          value={item.description || ''}
                          onChange={(e) => handleUpdateItem(item.id, { description: e.target.value })}
                          className="w-full px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-900/60 border border-slate-300 dark:border-slate-800 text-[11px] text-slate-600 dark:text-slate-400 focus:outline-none focus:border-brand-teal-500"
                        />
                      </div>

                      {/* Quantity */}
                      <div className="col-span-4 sm:col-span-1 space-y-0.5">
                        <span className="text-[10px] font-bold text-slate-500 block sm:hidden">Cant.</span>
                        <input
                          type="number"
                          min="1"
                          placeholder="Cant"
                          value={item.quantity}
                          onChange={(e) => handleUpdateItem(item.id, { quantity: Math.max(1, Number(e.target.value)) })}
                          className="w-full px-1.5 py-1.5 rounded bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs text-center text-slate-900 dark:text-white font-bold focus:outline-none focus:border-brand-teal-500 font-mono"
                        />
                      </div>

                      {/* Unit Cost (Admin Only) */}
                      {(showCostMargin && canViewCosts) && (
                        <div className="col-span-4 sm:col-span-2 space-y-0.5">
                          <span className="text-[10px] font-bold text-slate-500 block sm:hidden">Costo Unit.</span>
                          <input
                            type="number"
                            min="0"
                            step="any"
                            placeholder="Costo"
                            value={item.costPrice ?? 0}
                            onChange={(e) => handleUpdateItem(item.id, { costPrice: Number(e.target.value) })}
                            className="w-full px-2 py-1.5 rounded bg-amber-50/70 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700/60 text-xs text-right text-amber-900 dark:text-amber-300 font-mono font-bold focus:outline-none focus:border-amber-500"
                            title="Costo de compra interno"
                          />
                        </div>
                      )}

                      {/* Sale Price */}
                      <div className={`space-y-0.5 ${showCostMargin ? 'col-span-4 sm:col-span-2' : 'col-span-4 sm:col-span-2'}`}>
                        <span className="text-[10px] font-bold text-slate-500 block sm:hidden">Precio Venta</span>
                        <input
                          type="number"
                          min="0"
                          step="any"
                          placeholder="Precio"
                          value={item.unitPrice}
                          onChange={(e) => handleUpdateItem(item.id, { unitPrice: Number(e.target.value) })}
                          className="w-full px-2.5 py-1.5 rounded bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs text-right text-slate-900 dark:text-white font-mono font-bold focus:outline-none focus:border-brand-teal-500"
                        />
                      </div>

                      {/* Total & Action Buttons */}
                      <div className={`flex items-center justify-between gap-1.5 ${showCostMargin ? 'col-span-12 sm:col-span-2' : 'col-span-4 sm:col-span-3'}`}>
                        <div className="text-right font-black text-brand-teal-800 dark:text-brand-teal-300 text-xs font-mono truncate flex-1">
                          {formatCurrency(item.total, currency)}
                        </div>
                        
                        <div className="flex items-center gap-0.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => handleDuplicateItem(item.id)}
                            className="p-1 rounded text-slate-400 hover:text-brand-teal-600 dark:hover:text-brand-teal-400 transition-colors"
                            title="Duplicar esta partida"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                          
                          <button
                            type="button"
                            onClick={() => handleDeleteItem(item.id)}
                            className="p-1 rounded text-slate-400 hover:text-rose-500 transition-colors"
                            title="Eliminar partida"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Terms & Financials Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 pt-4 border-t-2 border-slate-200 dark:border-slate-800 items-start">
            
            {/* Commercial terms (7 cols) */}
            <div className="sm:col-span-7 space-y-3">
              <div className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                3. Condiciones Comerciales
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">Tiempo de Entrega</label>
                  <input
                    type="text"
                    value={deliveryTime}
                    onChange={(e) => setDeliveryTime(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">Garantía</label>
                  <input
                    type="text"
                    value={warrantyNotes}
                    onChange={(e) => setWarrantyNotes(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">Forma de Pago Acordada</label>
                <input
                  type="text"
                  value={paymentTerms}
                  onChange={(e) => setPaymentTerms(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">Notas / Exclusiones</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Información adicional visible en el pie del documento..."
                  className="w-full px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white resize-none"
                />
              </div>
            </div>

            {/* Calculations Box (5 cols) */}
            <div className="sm:col-span-5 bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-300 dark:border-slate-800 space-y-3 shadow-sm">
              <div className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider border-b border-slate-200 dark:border-slate-800 pb-2">
                Resumen Financiero
              </div>

              <div className="flex justify-between text-xs text-slate-600 dark:text-slate-400 font-medium">
                <span>Subtotal ({items.length} ítems):</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">{formatCurrency(subtotal, currency)}</span>
              </div>

              {/* Discount */}
              <div className="flex items-center justify-between gap-2 text-xs">
                <span className="text-slate-600 dark:text-slate-400 font-medium">Descuento (%):</span>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={discountPercent}
                    onChange={(e) => setDiscountPercent(Number(e.target.value))}
                    className="w-14 px-2 py-0.5 rounded bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-center font-bold"
                  />
                  <span className="text-amber-700 dark:text-amber-400 font-mono font-bold">
                    -{formatCurrency(discountAmount, currency)}
                  </span>
                </div>
              </div>

              {/* Tax / ITBIS */}
              <div className="flex items-center justify-between text-xs">
                <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-700 dark:text-slate-300">
                  <input
                    type="checkbox"
                    checked={applyTax}
                    onChange={(e) => setApplyTax(e.target.checked)}
                    className="rounded border-slate-300 dark:border-slate-700 text-brand-teal-600"
                  />
                  <span>Aplicar ITBIS (18%)</span>
                </label>
                {applyTax && (
                  <span className="font-mono font-bold text-slate-900 dark:text-slate-300">
                    +{formatCurrency(taxAmount, currency)}
                  </span>
                )}
              </div>

              {/* Grand Total */}
              <div className="pt-3 border-t-2 border-slate-300 dark:border-slate-800 flex items-baseline justify-between">
                <span className="text-sm font-black text-slate-900 dark:text-white uppercase">TOTAL CLIENTE:</span>
                <span className="text-xl font-black font-mono text-brand-teal-700 dark:text-brand-teal-400">
                  {formatCurrency(total, currency)}
                </span>
              </div>

              {/* Cost & Profit Margin Analysis (Confidential for Admin) */}
              {(showCostMargin && canViewCosts) && (
                <div className="border border-amber-300/80 dark:border-amber-700/60 bg-amber-50/60 dark:bg-amber-950/30 p-3.5 rounded-xl space-y-2.5 text-xs">
                  <div className="flex items-center justify-between text-[11px] font-bold text-amber-900 dark:text-amber-300 uppercase">
                    <span className="flex items-center gap-1.5">
                      <TrendingUp className="w-3.5 h-3.5" />
                      <span>Rentabilidad Interna (Admin)</span>
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      profitMarginPercent >= 35 
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700'
                        : profitMarginPercent >= 20
                        ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-300 dark:border-amber-700'
                        : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border border-rose-300 dark:border-rose-700'
                    }`}>
                      {profitMarginPercent}% Margen
                    </span>
                  </div>

                  {/* Health Meter Bar */}
                  <div className="space-y-1">
                    <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-300 ${
                          profitMarginPercent >= 35 
                            ? 'bg-emerald-500' 
                            : profitMarginPercent >= 20 
                            ? 'bg-amber-500' 
                            : 'bg-rose-500'
                        }`}
                        style={{ width: `${Math.min(100, Math.max(0, profitMarginPercent))}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-[10px] text-slate-500">
                      <span>0%</span>
                      <span className="font-semibold">
                        {profitMarginPercent >= 35 
                          ? 'Margen Óptimo' 
                          : profitMarginPercent >= 20 
                          ? 'Margen Estándar' 
                          : 'Margen Ajustado / Riesgoso'}
                      </span>
                      <span>100%</span>
                    </div>
                  </div>

                  <div className="flex justify-between text-[11px] text-slate-600 dark:text-slate-400">
                    <span>Costo Insumos / Compra:</span>
                    <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                      {formatCurrency(totalCost, currency)}
                    </span>
                  </div>

                  <div className="flex justify-between text-xs font-black text-emerald-800 dark:text-emerald-400 pt-1 border-t border-amber-200 dark:border-amber-800/60">
                    <span>Ganancia Bruta Estimada:</span>
                    <span className="font-mono font-black">+{formatCurrency(grossProfit, currency)}</span>
                  </div>

                  {profitMarginPercent < 20 && taxableAmount > 0 && (
                    <div className="p-2 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 text-[10px] text-rose-700 dark:text-rose-300 flex items-start gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-rose-500" />
                      <span>Margen de ganancia inferior al 20% recomendado. Evalúa reducir el descuento o verificar costos de compra.</span>
                    </div>
                  )}
                </div>
              )}
            </div>

          </div>

          {/* Form Actions */}
          <div className="pt-4 border-t-2 border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 hidden sm:flex">
              <span>Atajo:</span>
              <kbd className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 font-mono text-[10px] text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700 font-bold">
                Ctrl + Enter
              </kbd>
              <span>para guardar</span>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setIsQuoteModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-slate-300 text-xs font-semibold border border-slate-300 dark:border-slate-700"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-brand-teal-500 to-brand-green-500 hover:from-brand-teal-400 hover:to-brand-green-400 text-slate-950 font-black text-xs shadow-md border border-brand-teal-600/30 flex items-center gap-2 transition-all hover:shadow-lg"
              >
                <Save className="w-4 h-4" />
                <span>Guardar y Ver Cotización Membretada</span>
              </button>
            </div>
          </div>

        </form>

      </div>

      {/* Catalog Picker Modal */}
      <CatalogPickerModal
        isOpen={isCatalogPickerOpen}
        onClose={() => setIsCatalogPickerOpen(false)}
        catalog={catalog}
        currency={currency}
        exchangeRate={companySettings.defaultExchangeRate || 60.50}
        canViewCosts={canViewCosts}
        onAddItem={handleAddItemFromPicker}
      />

      {/* Quote Templates Modal */}
      <QuoteTemplatesModal
        isOpen={isTemplatesModalOpen}
        onClose={() => setIsTemplatesModalOpen(false)}
        currency={currency}
        exchangeRate={companySettings.defaultExchangeRate || 60.50}
        currentItems={items}
        onApplyTemplate={handleApplyTemplate}
      />

    </div>
  );
};
