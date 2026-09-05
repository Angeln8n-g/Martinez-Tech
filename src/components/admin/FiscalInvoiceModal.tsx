import React, { useState, useEffect } from 'react';
import { useAppState } from '../../context/AppStateContext';
import { 
  FiscalInvoice, 
  InvoiceItem, 
  NCFType, 
  InvoicePaymentStatus, 
  PaymentMethod 
} from '../../types';
import { 
  X, 
  Save, 
  Receipt, 
  Plus, 
  Trash2, 
  Calculator, 
  Calendar, 
  User, 
  DollarSign, 
  ShieldCheck,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';
import { formatCurrency, validateDominicanRNC, formatDominicanPhone, roundToTwoDecimals } from '../../utils/formatters';

export const FiscalInvoiceModal: React.FC = () => {
  const { 
    isInvoiceModalOpen, 
    setIsInvoiceModalOpen, 
    activeInvoiceForEdit, 
    setActiveInvoiceForEdit,
    invoiceQuotePreload, 
    setInvoiceQuotePreload,
    companySettings,
    clients,
    addInvoice,
    updateInvoice,
    getNextNCF,
    currentUser
  } = useAppState();

  const [ncfType, setNcfType] = useState<NCFType>('B01');
  const [ncf, setNcf] = useState<string>('');
  const [ncfExpiryDate, setNcfExpiryDate] = useState<string>('2027-12-31');
  const [invoiceNumber, setInvoiceNumber] = useState<string>('');
  
  const [clientId, setClientId] = useState<string>('');
  const [clientName, setClientName] = useState<string>('');
  const [clientRnc, setClientRnc] = useState<string>('');
  const [clientPhone, setClientPhone] = useState<string>('');
  const [clientAddress, setClientAddress] = useState<string>('');

  const [date, setDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [dueDate, setDueDate] = useState<string>(
    new Date(Date.now() + 15 * 86400000).toISOString().slice(0, 10)
  );

  const [items, setItems] = useState<InvoiceItem[]>([
    {
      id: `item-1`,
      description: 'Suministro e instalación de equipos tecnológicos',
      quantity: 1,
      unitPrice: 0,
      taxPercent: 18,
      taxAmount: 0,
      total: 0
    }
  ]);

  const [currency, setCurrency] = useState<'DOP' | 'USD'>('DOP');
  const [exchangeRate, setExchangeRate] = useState<number>(companySettings.defaultExchangeRate || 60.50);
  const [discountPercent, setDiscountPercent] = useState<number>(0);
  const [paymentStatus, setPaymentStatus] = useState<InvoicePaymentStatus>('pending');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('transferencia');
  const [amountPaid, setAmountPaid] = useState<number>(0);
  const [notes, setNotes] = useState<string>('');
  const [quoteId, setQuoteId] = useState<string>('');
  const [quoteNumber, setQuoteNumber] = useState<string>('');
  const [dealId, setDealId] = useState<string>('');
  const [dealCode, setDealCode] = useState<string>('');

  const [error, setError] = useState<string>('');

  // Preload from active edit or preload quote
  useEffect(() => {
    if (!isInvoiceModalOpen) return;

    if (activeInvoiceForEdit) {
      setNcfType(activeInvoiceForEdit.ncfType);
      setNcf(activeInvoiceForEdit.ncf);
      setNcfExpiryDate(activeInvoiceForEdit.ncfExpiryDate);
      setInvoiceNumber(activeInvoiceForEdit.invoiceNumber);
      setClientId(activeInvoiceForEdit.clientId || '');
      setClientName(activeInvoiceForEdit.clientName);
      setClientRnc(activeInvoiceForEdit.clientRnc);
      setClientPhone(activeInvoiceForEdit.clientPhone || '');
      setClientAddress(activeInvoiceForEdit.clientAddress || '');
      setDate(activeInvoiceForEdit.date);
      setDueDate(activeInvoiceForEdit.dueDate);
      setItems(activeInvoiceForEdit.items);
      setCurrency(activeInvoiceForEdit.currency);
      setExchangeRate(activeInvoiceForEdit.exchangeRate || companySettings.defaultExchangeRate || 60.50);
      setDiscountPercent(activeInvoiceForEdit.discountPercent);
      setPaymentStatus(activeInvoiceForEdit.paymentStatus);
      setPaymentMethod(activeInvoiceForEdit.paymentMethod);
      setAmountPaid(activeInvoiceForEdit.amountPaid);
      setNotes(activeInvoiceForEdit.notes || '');
      setQuoteId(activeInvoiceForEdit.quoteId || '');
      setQuoteNumber(activeInvoiceForEdit.quoteNumber || '');
      setDealId(activeInvoiceForEdit.dealId || '');
      setDealCode(activeInvoiceForEdit.dealCode || '');
    } else if (invoiceQuotePreload) {
      const { ncf: autoNcf, expiryDate: autoExpiry } = getNextNCF('B01');
      setNcfType('B01');
      setNcf(autoNcf);
      setNcfExpiryDate(autoExpiry);
      setInvoiceNumber('');
      setClientId(invoiceQuotePreload.clientId || '');
      setClientName(invoiceQuotePreload.clientCompany || invoiceQuotePreload.clientName);
      setClientRnc(invoiceQuotePreload.clientRnc || '');
      setClientPhone(invoiceQuotePreload.clientPhone || '');
      setClientAddress(invoiceQuotePreload.clientAddress || '');
      setDate(new Date().toISOString().slice(0, 10));
      setDueDate(new Date(Date.now() + 15 * 86400000).toISOString().slice(0, 10));
      setCurrency(invoiceQuotePreload.currency);
      setExchangeRate(companySettings.defaultExchangeRate || 60.50);
      setDiscountPercent(invoiceQuotePreload.discountPercent || 0);
      setPaymentStatus('pending');
      setPaymentMethod('transferencia');
      setAmountPaid(0);
      setNotes(invoiceQuotePreload.paymentTerms || '');
      setQuoteId(invoiceQuotePreload.id);
      setQuoteNumber(invoiceQuotePreload.quoteNumber);
      setDealId(invoiceQuotePreload.dealId || '');

      // Convert quote items respecting quote's tax configuration
      const hasTax = invoiceQuotePreload.applyTax !== false;
      const quoteTaxPercent = hasTax ? (invoiceQuotePreload.taxPercent || 18) : 0;
      const invoiceItems: InvoiceItem[] = invoiceQuotePreload.items.map((qi, idx) => {
        const itemSubtotal = qi.quantity * qi.unitPrice;
        const itbis = roundToTwoDecimals(itemSubtotal * (quoteTaxPercent / 100));
        return {
          id: `item-${idx + 1}`,
          description: `${qi.name}${qi.description ? ` - ${qi.description}` : ''}`,
          quantity: qi.quantity,
          unitPrice: qi.unitPrice,
          taxPercent: quoteTaxPercent,
          taxAmount: itbis,
          total: roundToTwoDecimals(itemSubtotal + itbis)
        };
      });
      setItems(invoiceItems.length ? invoiceItems : items);
    } else {
      // New from scratch
      const { ncf: autoNcf, expiryDate: autoExpiry } = getNextNCF(ncfType);
      setNcf(autoNcf);
      setNcfExpiryDate(autoExpiry);
      setInvoiceNumber('');
      setClientId('');
      setClientName('');
      setClientRnc('');
      setClientPhone('');
      setClientAddress('');
      setDate(new Date().toISOString().slice(0, 10));
      setDueDate(new Date(Date.now() + 15 * 86400000).toISOString().slice(0, 10));
      setItems([
        {
          id: `item-1`,
          description: 'Suministro e instalación de equipos tecnológicos',
          quantity: 1,
          unitPrice: 0,
          taxPercent: 18,
          taxAmount: 0,
          total: 0
        }
      ]);
      setCurrency('DOP');
      setExchangeRate(companySettings.defaultExchangeRate || 60.50);
      setDiscountPercent(0);
      setPaymentStatus('pending');
      setPaymentMethod('transferencia');
      setAmountPaid(0);
      setNotes('');
      setQuoteId('');
      setQuoteNumber('');
      setDealId('');
      setDealCode('');
    }
  }, [isInvoiceModalOpen, activeInvoiceForEdit, invoiceQuotePreload]);

  // Handle NCF Type change
  const handleNcfTypeChange = (newType: NCFType) => {
    setNcfType(newType);
    const { ncf: autoNcf, expiryDate: autoExpiry } = getNextNCF(newType);
    setNcf(autoNcf);
    setNcfExpiryDate(autoExpiry);
  };

  // Handle client select
  const handleClientSelect = (cId: string) => {
    setClientId(cId);
    const c = clients.find(cl => cl.id === cId);
    if (c) {
      setClientName(c.company || c.name);
      setClientRnc(c.rnc || '');
      setClientPhone(c.phone || '');
      setClientAddress(`${c.address}, ${c.city}`);
    }
  };

  // Item handlers
  const handleAddItem = () => {
    setItems([
      ...items,
      {
        id: `item-${Date.now()}`,
        description: '',
        quantity: 1,
        unitPrice: 0,
        taxPercent: 18,
        taxAmount: 0,
        total: 0
      }
    ]);
  };

  const handleUpdateItem = (index: number, field: keyof InvoiceItem, val: any) => {
    const updated = [...items];
    const item = { ...updated[index], [field]: val };
    
    const qty = Number(item.quantity) || 0;
    const price = Number(item.unitPrice) || 0;
    const itemSub = roundToTwoDecimals(qty * price);
    const itbis = roundToTwoDecimals(itemSub * ((Number(item.taxPercent !== undefined ? item.taxPercent : 18)) / 100));
    
    item.taxAmount = itbis;
    item.total = roundToTwoDecimals(itemSub + itbis);
    updated[index] = item;
    setItems(updated);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length <= 1) return;
    setItems(items.filter((_, i) => i !== index));
  };

  // Calculations with strict decimal precision
  const subtotal = roundToTwoDecimals(items.reduce((sum, item) => sum + (Number(item.quantity || 0) * Number(item.unitPrice || 0)), 0));
  const discountAmount = roundToTwoDecimals(subtotal * ((discountPercent || 0) / 100));
  const taxableAmount = roundToTwoDecimals(Math.max(0, subtotal - discountAmount));
  const discountFactor = (1 - (discountPercent || 0) / 100);
  const taxAmount = roundToTwoDecimals(items.reduce((sum, item) => sum + (Number(item.taxAmount) || 0), 0) * discountFactor);
  const total = roundToTwoDecimals(taxableAmount + taxAmount);
  const balanceDue = roundToTwoDecimals(Math.max(0, total - Number(amountPaid || 0)));

  const getNcfTypeName = (type: NCFType) => {
    switch (type) {
      case 'B01': return 'Factura para Crédito Fiscal';
      case 'B02': return 'Factura de Consumo Final';
      case 'B14': return 'Registro de Regímenes Especiales';
      case 'B15': return 'Comprobante Gubernamental';
      default: return 'Comprobante Fiscal';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!clientName.trim()) {
      setError('Por favor ingresa la Razón Social o Nombre del Cliente.');
      return;
    }

    if (ncfType === 'B01') {
      if (!clientRnc.trim()) {
        setError('El Comprobante Fiscal B01 (Crédito Fiscal) exige un RNC o Cédula válido.');
        return;
      }
      const rncCheck = validateDominicanRNC(clientRnc);
      if (!rncCheck.isValid) {
        setError(`RNC inválido para B01 Crédito Fiscal: ${rncCheck.message}`);
        return;
      }
    }

    if (items.length === 0 || subtotal <= 0) {
      setError('Debes agregar al menos un ítem con precio mayor a 0.');
      return;
    }

    const payload: Omit<FiscalInvoice, 'id' | 'invoiceNumber' | 'createdAt'> = {
      ncf,
      ncfType,
      ncfTypeName: getNcfTypeName(ncfType),
      ncfExpiryDate,
      quoteId: quoteId || undefined,
      quoteNumber: quoteNumber || undefined,
      dealId: dealId || undefined,
      dealCode: dealCode || undefined,
      clientId: clientId || undefined,
      clientName: clientName.trim(),
      clientRnc: clientRnc.trim(),
      clientPhone: clientPhone.trim() || undefined,
      clientAddress: clientAddress.trim() || undefined,
      date,
      dueDate,
      items,
      subtotal,
      discountPercent,
      discountAmount,
      taxPercent: 18,
      taxAmount,
      total,
      currency,
      exchangeRate: currency === 'USD' ? Number(exchangeRate || 60.50) : undefined,
      paymentStatus: balanceDue <= 0 ? 'paid' : (amountPaid > 0 ? 'partial' : paymentStatus),
      paymentMethod,
      amountPaid: Number(amountPaid),
      balanceDue,
      notes,
      createdBy: currentUser?.name || 'Administrador'
    };

    if (activeInvoiceForEdit) {
      await updateInvoice(activeInvoiceForEdit.id, payload);
    } else {
      await addInvoice(payload);
    }

    handleClose();
  };

  const handleClose = () => {
    setActiveInvoiceForEdit(null);
    setInvoiceQuotePreload(null);
    setIsInvoiceModalOpen(false);
  };

  if (!isInvoiceModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-3xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400">
              <Receipt className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black text-slate-900 dark:text-white">
                  {activeInvoiceForEdit ? `Editar Factura ${activeInvoiceForEdit.invoiceNumber}` : 'Emisión de Factura Fiscal (DGII)'}
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700 font-mono">
                  {ncf}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Genera comprobantes fiscales con cálculo automático de ITBIS (18%) conforme a normativas de la DGII.
              </p>
            </div>
          </div>

          <button
            onClick={handleClose}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          
          {error && (
            <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-300 dark:border-rose-500/40 text-rose-900 dark:text-rose-300 flex items-center gap-2 animate-fadeIn">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          {/* Section 1: Fiscal NCF Data */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 space-y-4">
            <h4 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-xs flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-brand-teal-600 dark:text-brand-teal-400" />
              <span>1. Datos del Comprobante Fiscal (NCF)</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">Tipo de Comprobante</label>
                <select
                  value={ncfType}
                  onChange={(e) => handleNcfTypeChange(e.target.value as NCFType)}
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white"
                >
                  <option value="B01">B01 - Crédito Fiscal (Empresas)</option>
                  <option value="B02">B02 - Consumo Final (Personas)</option>
                  <option value="B14">B14 - Régimen Especial (Zonas Francas)</option>
                  <option value="B15">B15 - Gubernamental (Estado)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">Número de NCF</label>
                <input
                  type="text"
                  required
                  value={ncf}
                  onChange={(e) => setNcf(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs font-mono font-bold text-slate-900 dark:text-white uppercase"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">Vencimiento Secuencia</label>
                <input
                  type="date"
                  value={ncfExpiryDate}
                  onChange={(e) => setNcfExpiryDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs font-mono text-slate-900 dark:text-white"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Client Information */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-xs flex items-center gap-2">
                <User className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>2. Datos del Cliente / Receptor</span>
              </h4>

              {clients.length > 0 && (
                <select
                  value={clientId}
                  onChange={(e) => handleClientSelect(e.target.value)}
                  className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-[11px] text-slate-700 dark:text-slate-300 font-medium"
                >
                  <option value="">-- Cargar de Directorio --</option>
                  {clients.map(c => (
                    <option key={c.id} value={c.id}>{c.company || c.name} {c.rnc ? `(RNC: ${c.rnc})` : ''}</option>
                  ))}
                </select>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1 sm:col-span-2">
                <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">Razón Social o Nombre Completo *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Centro Logístico del Caribe S.A."
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white font-medium"
                />
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                    RNC o Cédula {ncfType === 'B01' ? '*' : '(Opcional)'}
                  </label>
                  {clientRnc && (
                    <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded ${
                      validateDominicanRNC(clientRnc).isValid 
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-500/30' 
                        : 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-300 dark:border-rose-500/30'
                    }`}>
                      {validateDominicanRNC(clientRnc).isValid ? `✓ ${validateDominicanRNC(clientRnc).type}` : 'Inválido'}
                    </span>
                  )}
                </div>
                <input
                  type="text"
                  placeholder="Ej. 131-99887-2"
                  value={clientRnc}
                  onChange={(e) => setClientRnc(e.target.value)}
                  className={`w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border text-xs text-slate-900 dark:text-white font-mono ${
                    clientRnc && !validateDominicanRNC(clientRnc).isValid
                      ? 'border-rose-400 focus:border-rose-500'
                      : 'border-slate-300 dark:border-slate-700 focus:border-brand-teal-500'
                  }`}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1 sm:col-span-2">
                <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">Dirección Fiscal</label>
                <input
                  type="text"
                  placeholder="Ej. Zona Franca San Isidro, Nave 14"
                  value={clientAddress}
                  onChange={(e) => setClientAddress(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">Teléfono Contacto</label>
                <input
                  type="tel"
                  placeholder="Ej. (809) 555-0192"
                  value={clientPhone}
                  onChange={(e) => setClientPhone(formatDominicanPhone(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-1">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">Fecha de Emisión</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white font-mono"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">Fecha Límite de Pago</label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white font-mono"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">Moneda</label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value as 'DOP' | 'USD')}
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white font-semibold"
                >
                  <option value="DOP">DOP (RD$)</option>
                  <option value="USD">USD (US$)</option>
                </select>
              </div>
              {currency === 'USD' ? (
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                    <span>Tasa Cambio (RD$)</span>
                    <span className="text-[10px] text-amber-600 dark:text-amber-400 font-normal">DGII 607</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="1"
                    value={exchangeRate}
                    onChange={(e) => setExchangeRate(parseFloat(e.target.value) || 60.50)}
                    placeholder="60.50"
                    className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-amber-300 dark:border-amber-700 text-xs text-slate-900 dark:text-white font-mono font-bold"
                  />
                </div>
              ) : (
                <div className="hidden md:block" />
              )}
            </div>
          </div>

          {/* Section 3: Itemized Table */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-xs flex items-center gap-2">
                <Calculator className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                <span>3. Detalle de Bienes y Servicios Facturados</span>
              </h4>

              <button
                type="button"
                onClick={handleAddItem}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-brand-teal-700 dark:text-brand-teal-400 font-bold text-[11px]"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Agregar Fila</span>
              </button>
            </div>

            <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-700">
                  <tr>
                    <th className="p-3 w-16">Cant.</th>
                    <th className="p-3">Descripción del Bien / Servicio</th>
                    <th className="p-3 w-28 text-right">Precio Unit.</th>
                    <th className="p-3 w-24 text-center">ITBIS (18%)</th>
                    <th className="p-3 w-28 text-right">Total</th>
                    <th className="p-3 w-10"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  {items.map((item, idx) => (
                    <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="p-2.5">
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => handleUpdateItem(idx, 'quantity', parseFloat(e.target.value) || 1)}
                          className="w-14 px-2 py-1 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-center font-mono text-xs"
                        />
                      </td>
                      <td className="p-2.5">
                        <input
                          type="text"
                          required
                          placeholder="Descripción detallada del equipo o servicio..."
                          value={item.description}
                          onChange={(e) => handleUpdateItem(idx, 'description', e.target.value)}
                          className="w-full px-2.5 py-1 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                        />
                      </td>
                      <td className="p-2.5">
                        <input
                          type="number"
                          min="0"
                          step="any"
                          value={item.unitPrice}
                          onChange={(e) => handleUpdateItem(idx, 'unitPrice', parseFloat(e.target.value) || 0)}
                          className="w-24 px-2 py-1 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-right font-mono text-xs"
                        />
                      </td>
                      <td className="p-2.5 text-center font-mono text-slate-500 text-[11px]">
                        {formatCurrency(item.taxAmount)}
                      </td>
                      <td className="p-2.5 text-right font-mono font-bold text-slate-900 dark:text-white">
                        {formatCurrency(item.total)}
                      </td>
                      <td className="p-2.5 text-center">
                        {items.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(idx)}
                            className="text-slate-400 hover:text-rose-500 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 4: Totals & Payments Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700">
            
            <div className="space-y-3">
              <h4 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-xs">
                Condiciones & Estado de Cobro
              </h4>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">Forma de Pago</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs capitalize"
                  >
                    <option value="transferencia">Transferencia Bancaria</option>
                    <option value="efectivo">Efectivo</option>
                    <option value="tarjeta">Tarjeta de Crédito/Débito</option>
                    <option value="cheque">Cheque Comercial</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                    Monto Abonado ({currency === 'USD' ? 'US$' : 'RD$'})
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={amountPaid}
                    onChange={(e) => setAmountPaid(parseFloat(e.target.value) || 0)}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs font-mono"
                  />
                </div>
              </div>

              {amountPaid > 0 && (
                <div className="p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50 text-[11px] text-emerald-800 dark:text-emerald-300 flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 mt-0.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <div>
                    <span>Se registrará automáticamente un recibo oficial en <strong>Cobros y Pagos</strong> por <strong>{formatCurrency(amountPaid, currency)}</strong>.</span>
                  </div>
                </div>
              )}

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">Observaciones / Términos</label>
                <textarea
                  rows={2}
                  placeholder="Detalles de garantía o instrucciones de transferencia..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs"
                />
              </div>
            </div>

            {/* Calculations Box */}
            <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 space-y-2 text-xs">
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Subtotal Gravado:</span>
                <span className="font-mono">{formatCurrency(subtotal, currency)}</span>
              </div>

              {discountPercent > 0 && (
                <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                  <span>Descuento ({discountPercent}%):</span>
                  <span className="font-mono">-{formatCurrency(discountAmount, currency)}</span>
                </div>
              )}

              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>ITBIS (18%):</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">+{formatCurrency(taxAmount, currency)}</span>
              </div>

              <div className="flex justify-between text-sm font-black text-slate-900 dark:text-white border-t border-slate-200 dark:border-slate-700 pt-2">
                <span>TOTAL GENERAL:</span>
                <span className="font-mono text-emerald-600 dark:text-emerald-400">{formatCurrency(total, currency)}</span>
              </div>

              {currency === 'USD' && (
                <div className="flex justify-between items-center text-[11px] font-semibold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 p-2 rounded-lg border border-amber-200 dark:border-amber-800/60">
                  <span>Equivalente Fiscal DGII (RD$ @ {exchangeRate.toFixed(2)}):</span>
                  <span className="font-mono font-bold text-xs">{formatCurrency(roundToTwoDecimals(total * exchangeRate), 'DOP')}</span>
                </div>
              )}

              <div className="flex justify-between text-xs font-bold border-t border-dashed border-slate-200 dark:border-slate-700 pt-2">
                <span className="text-slate-500">Balance Pendiente:</span>
                <span className={`font-mono ${balanceDue > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600'}`}>
                  {formatCurrency(balanceDue, currency)}
                </span>
              </div>
            </div>

          </div>

        </form>

        {/* Footer */}
        <div className="p-5 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex items-center justify-between">
          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 text-xs font-semibold"
          >
            Cancelar
          </button>

          <button
            onClick={handleSubmit}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-emerald-500 hover:from-amber-400 hover:to-emerald-400 text-slate-950 font-black text-xs uppercase tracking-wider shadow-md hover:shadow-lg transition-all"
          >
            <Save className="w-4 h-4" />
            <span>{activeInvoiceForEdit ? 'Guardar Cambios' : 'Emitir Factura Fiscal'}</span>
          </button>
        </div>

      </div>
    </div>
  );
};
