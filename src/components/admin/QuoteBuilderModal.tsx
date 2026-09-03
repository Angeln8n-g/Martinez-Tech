import React, { useState, useEffect } from 'react';
import { useAppState } from '../../context/AppStateContext';
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
  EyeOff
} from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';

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
    companySettings 
  } = useAppState();

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
  const [showCostMargin, setShowCostMargin] = useState(true);

  const [selectedCatalogId, setSelectedCatalogId] = useState('');

  useEffect(() => {
    if (activeQuoteForEdit) {
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
    } else if (quoteDealPreload) {
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
    } else {
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
    }
  }, [activeQuoteForEdit, quoteDealPreload, isQuoteModalOpen]);

  if (!isQuoteModalOpen) return null;

  // Add Item from Catalog
  const handleAddFromCatalog = () => {
    if (!selectedCatalogId) return;
    const catItem = catalog.find(c => c.id === selectedCatalogId);
    if (!catItem) return;

    const newItem: QuoteItem = {
      id: `item-${Date.now()}`,
      productId: catItem.id,
      name: catItem.name,
      description: catItem.description,
      quantity: 1,
      unitPrice: catItem.unitPrice,
      costPrice: catItem.costPrice || Math.round(catItem.unitPrice * 0.65),
      total: catItem.unitPrice,
      type: catItem.type
    };

    setItems(prev => [...prev, newItem]);
    setSelectedCatalogId('');
  };

  // Add Empty Custom Item
  const handleAddItem = (type: QuoteItem['type'] = 'product') => {
    const newItem: QuoteItem = {
      id: `item-${Date.now()}`,
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

  // Update Item
  const handleUpdateItem = (id: string, updates: Partial<QuoteItem>) => {
    setItems(prev => prev.map(item => {
      if (item.id === id) {
        const updated = { ...item, ...updates };
        updated.total = (updated.quantity || 0) * (updated.unitPrice || 0);
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
  const subtotal = items.reduce((sum, item) => sum + (item.total || 0), 0);
  const totalCost = items.reduce((sum, item) => sum + ((item.costPrice || 0) * (item.quantity || 1)), 0);
  const discountAmount = Math.round((subtotal * (discountPercent || 0)) / 100);
  const taxableAmount = Math.max(0, subtotal - discountAmount);
  const taxAmount = applyTax ? Math.round((taxableAmount * (taxPercent || 18)) / 100) : 0;
  const total = taxableAmount + taxAmount;

  // Margin Calculations (confidential for Admin)
  const grossProfit = Math.max(0, taxableAmount - totalCost);
  const profitMarginPercent = taxableAmount > 0 ? Math.round((grossProfit / taxableAmount) * 100) : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName || items.length === 0) {
      alert('Por favor ingrese el nombre del cliente y al menos un ítem cotizado.');
      return;
    }

    let savedQuote: Quote;

    if (activeQuoteForEdit) {
      await updateQuote(activeQuoteForEdit.id, {
        dealId: selectedDealId || undefined,
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
        clientName,
        total,
        items
      };
    } else {
      savedQuote = await addQuote({
        dealId: selectedDealId || undefined,
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
        createdBy: 'Rafael Martínez'
      });
    }

    setIsQuoteModalOpen(false);
    setActiveQuoteForView(savedQuote);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-2xl max-w-4xl w-full p-5 sm:p-7 relative max-h-[95vh] overflow-y-auto shadow-2xl space-y-6">
        
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
              onClick={() => setIsQuoteModalOpen(false)}
              className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-black dark:hover:text-white border border-slate-300 dark:border-slate-700"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Client & Metadata Grid */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-300 dark:border-slate-800 space-y-4 shadow-sm">
            <div className="text-xs font-bold text-brand-teal-800 dark:text-brand-teal-400 uppercase tracking-wider">
              1. Datos del Cliente & Presupuesto
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
                  placeholder="Ej. 809-555-4321"
                  value={clientPhone}
                  onChange={(e) => setClientPhone(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-brand-teal-500 shadow-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-800 dark:text-slate-300">
                  RNC / Cédula (Opcional)
                </label>
                <input
                  type="text"
                  placeholder="Ej. 131-99887-2"
                  value={clientRnc}
                  onChange={(e) => setClientRnc(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-brand-teal-500 shadow-sm"
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
          </div>

          {/* Quick Catalog Adder */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 bg-brand-teal-50 dark:bg-brand-teal-950/30 p-3.5 rounded-xl border-2 border-brand-teal-300 dark:border-brand-teal-500/30 shadow-sm">
            <div className="flex items-center gap-2 flex-1">
              <Package className="w-4 h-4 text-brand-teal-700 dark:text-brand-teal-400 flex-shrink-0" />
              <select
                value={selectedCatalogId}
                onChange={(e) => setSelectedCatalogId(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-200 font-medium focus:outline-none focus:border-brand-teal-500"
              >
                <option value="">-- Agregar ítem rápido desde el Catálogo Martínez Tech --</option>
                {catalog.map(c => (
                  <option key={c.id} value={c.id}>
                    [{c.type.toUpperCase()}] {c.name} - Venta: {formatCurrency(c.unitPrice, currency)} {c.costPrice ? `(Costo: ${formatCurrency(c.costPrice, currency)})` : ''}
                  </option>
                ))}
              </select>
            </div>
            <button
              type="button"
              onClick={handleAddFromCatalog}
              disabled={!selectedCatalogId}
              className="px-4 py-2 rounded-lg bg-brand-teal-600 hover:bg-brand-teal-500 disabled:opacity-50 text-white font-bold text-xs flex items-center justify-center gap-1 shadow-sm border border-brand-teal-700/20"
            >
              <Plus className="w-4 h-4" />
              <span>Agregar al Presupuesto</span>
            </button>
          </div>

          {/* Itemized Table */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <FileText className="w-4 h-4 text-brand-green-600 dark:text-brand-green-400" />
                2. Detalle de Equipos, Materiales y Mano de Obra ({items.length})
              </div>
              <button
                type="button"
                onClick={() => handleAddItem()}
                className="text-xs text-brand-teal-700 dark:text-brand-teal-400 hover:underline font-bold flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Fila Personalizada</span>
              </button>
            </div>

            <div className="space-y-2.5">
              {items.map((item, idx) => (
                <div 
                  key={item.id}
                  className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700/80 grid grid-cols-12 gap-2.5 items-center shadow-sm"
                >
                  <div className="col-span-1 text-center font-mono text-xs text-slate-500 font-bold">
                    #{idx + 1}
                  </div>

                  <div className={`space-y-1 ${showCostMargin ? 'col-span-11 sm:col-span-4' : 'col-span-11 sm:col-span-5'}`}>
                    <input
                      type="text"
                      placeholder="Nombre del equipo o servicio"
                      value={item.name}
                      onChange={(e) => handleUpdateItem(item.id, { name: e.target.value })}
                      className="w-full px-2.5 py-1.5 rounded bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white font-semibold focus:outline-none focus:border-brand-teal-500"
                    />
                    <input
                      type="text"
                      placeholder="Descripción técnica o detalles (opcional)"
                      value={item.description || ''}
                      onChange={(e) => handleUpdateItem(item.id, { description: e.target.value })}
                      className="w-full px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-900/60 border border-slate-300 dark:border-slate-800 text-[11px] text-slate-600 dark:text-slate-400 focus:outline-none focus:border-brand-teal-500"
                    />
                  </div>

                  <div className="col-span-4 sm:col-span-1 space-y-0.5">
                    <span className="text-[10px] font-bold text-slate-600 block sm:hidden">Cant.</span>
                    <input
                      type="number"
                      min="1"
                      placeholder="Cant"
                      value={item.quantity}
                      onChange={(e) => handleUpdateItem(item.id, { quantity: Number(e.target.value) })}
                      className="w-full px-2 py-1.5 rounded bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs text-center text-slate-900 dark:text-white font-bold focus:outline-none focus:border-brand-teal-500"
                    />
                  </div>

                  {showCostMargin && (
                    <div className="col-span-4 sm:col-span-2 space-y-0.5">
                      <span className="text-[10px] font-bold text-slate-500 block sm:hidden">Costo Unit.</span>
                      <input
                        type="number"
                        min="0"
                        placeholder="Costo"
                        value={item.costPrice ?? 0}
                        onChange={(e) => handleUpdateItem(item.id, { costPrice: Number(e.target.value) })}
                        className="w-full px-2 py-1.5 rounded bg-amber-50/70 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700/60 text-xs text-right text-amber-900 dark:text-amber-300 font-mono font-bold focus:outline-none focus:border-amber-500"
                        title="Costo de compra interno"
                      />
                    </div>
                  )}

                  <div className={`space-y-0.5 ${showCostMargin ? 'col-span-4 sm:col-span-2' : 'col-span-4 sm:col-span-2'}`}>
                    <span className="text-[10px] font-bold text-slate-600 block sm:hidden">Precio Venta</span>
                    <input
                      type="number"
                      min="0"
                      step="10"
                      placeholder="Precio"
                      value={item.unitPrice}
                      onChange={(e) => handleUpdateItem(item.id, { unitPrice: Number(e.target.value) })}
                      className="w-full px-2.5 py-1.5 rounded bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs text-right text-slate-900 dark:text-white font-mono font-bold focus:outline-none focus:border-brand-teal-500"
                    />
                  </div>

                  <div className={`flex items-center justify-between gap-1 ${showCostMargin ? 'col-span-12 sm:col-span-2' : 'col-span-4 sm:col-span-2'}`}>
                    <div className="text-right font-black text-brand-teal-800 dark:text-brand-teal-300 text-xs font-mono truncate">
                      {formatCurrency(item.total, currency)}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDeleteItem(item.id)}
                      className="p-1 rounded text-slate-400 hover:text-rose-500"
                      title="Eliminar fila"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
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
              {showCostMargin && (
                <div className="border border-amber-300/80 dark:border-amber-700/60 bg-amber-50/60 dark:bg-amber-950/30 p-3 rounded-lg space-y-2 text-xs">
                  <div className="flex items-center justify-between text-[11px] font-bold text-amber-900 dark:text-amber-300 uppercase">
                    <span className="flex items-center gap-1">
                      <TrendingUp className="w-3.5 h-3.5" />
                      <span>Rentabilidad Interna (Admin)</span>
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      profitMarginPercent >= 35 
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : profitMarginPercent >= 20
                        ? 'bg-amber-100 text-amber-800 border border-amber-300'
                        : 'bg-rose-100 text-rose-800 border border-rose-300'
                    }`}>
                      {profitMarginPercent}% Margen
                    </span>
                  </div>

                  <div className="flex justify-between text-[11px] text-slate-600 dark:text-slate-400">
                    <span>Costo Insumos / Compra:</span>
                    <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                      {formatCurrency(totalCost, currency)}
                    </span>
                  </div>

                  <div className="flex justify-between text-xs font-black text-emerald-800 dark:text-emerald-400 pt-1 border-t border-amber-200 dark:border-amber-800/60">
                    <span>Ganancia Bruta Estimada:</span>
                    <span className="font-mono">+{formatCurrency(grossProfit, currency)}</span>
                  </div>
                </div>
              )}
            </div>

          </div>

          {/* Form Actions */}
          <div className="pt-4 border-t-2 border-slate-200 dark:border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsQuoteModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-slate-300 text-xs font-semibold border border-slate-300 dark:border-slate-700"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-brand-teal-500 to-brand-green-500 hover:from-brand-teal-400 hover:to-brand-green-400 text-slate-950 font-black text-xs shadow-md border border-brand-teal-600/30 flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>Guardar y Ver Cotización Membretada</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
