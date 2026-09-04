import React, { useState, useEffect } from 'react';
import { useAppState } from '../../context/AppStateContext';
import { useToast } from '../ui/ToastNotification';
import { PaymentMethod } from '../../types';
import { X, Save, DollarSign, CheckCircle } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';

export const PaymentRegisterModal: React.FC = () => {
  const { 
    isPaymentModalOpen, 
    setIsPaymentModalOpen, 
    quoteForPayment, 
    quotes, 
    deals,
    addPayment, 
    setActiveReceiptForView,
    currentUser 
  } = useAppState();

  const { showToast } = useToast();

  const [selectedQuoteId, setSelectedQuoteId] = useState('');
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [amount, setAmount] = useState<number>(0);
  const [currency, setCurrency] = useState<'DOP' | 'USD'>('DOP');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('transferencia');
  const [bankName, setBankName] = useState('Banco Popular Dominicano');
  const [referenceNumber, setReferenceNumber] = useState('');
  const [concept, setConcept] = useState('');
  const [notes, setNotes] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));

  useEffect(() => {
    if (quoteForPayment) {
      setSelectedQuoteId(quoteForPayment.id);
      setClientName(quoteForPayment.clientName);
      setClientPhone(quoteForPayment.clientPhone);
      setCurrency(quoteForPayment.currency);
      const half = Math.round(quoteForPayment.total * 0.6);
      setAmount(half);
      setConcept(`Anticipo para Presupuesto ${quoteForPayment.quoteNumber} (${quoteForPayment.items[0]?.name || 'Instalación'})`);
      setReferenceNumber('');
      setNotes('Abono inicial registrado a satisfacción.');
    } else {
      setSelectedQuoteId('');
      setClientName('');
      setClientPhone('');
      setAmount(0);
      setCurrency('DOP');
      setConcept('Abono / Anticipo de Servicio Técnico');
      setReferenceNumber('');
      setNotes('');
    }
  }, [quoteForPayment, isPaymentModalOpen]);

  if (!isPaymentModalOpen) return null;

  const handleSelectQuote = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const qId = e.target.value;
    setSelectedQuoteId(qId);
    const q = quotes.find(quote => quote.id === qId);
    if (q) {
      setClientName(q.clientName);
      setClientPhone(q.clientPhone);
      setCurrency(q.currency);
      setAmount(Math.round(q.total * 0.5));
      setConcept(`Anticipo para Cotización ${q.quoteNumber}`);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName || amount <= 0) {
      showToast('Por favor ingrese el nombre del cliente y un monto válido.', 'warning');
      return;
    }

    const linkedQuote = quotes.find(q => q.id === selectedQuoteId);
    const linkedDeal = deals.find(d => d.quoteId === selectedQuoteId || (linkedQuote && d.id === linkedQuote.dealId));

    const newPayment = await addPayment({
      quoteId: selectedQuoteId || undefined,
      quoteNumber: linkedQuote?.quoteNumber,
      dealId: linkedDeal?.id,
      dealCode: linkedDeal?.code,
      clientName,
      clientPhone,
      amount: Number(amount),
      currency,
      date,
      paymentMethod,
      bankName: paymentMethod === 'transferencia' ? bankName : undefined,
      referenceNumber: referenceNumber || undefined,
      concept,
      notes,
      createdBy: currentUser?.name || 'Rafael Martínez'
    });

    showToast('Recibo de pago registrado exitosamente', 'success');
    setIsPaymentModalOpen(false);
    setActiveReceiptForView(newPayment);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-2xl max-w-xl w-full p-6 relative max-h-[90vh] overflow-y-auto shadow-2xl space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b-2 border-slate-200 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-300 dark:border-emerald-500/30 flex items-center justify-center text-emerald-700 dark:text-emerald-400 shadow-sm">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-900 dark:text-white">
                Registrar Pago / Cobro de Anticipo
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                Genera un comprobante oficial de recibo con número único descargable en PDF.
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsPaymentModalOpen(false)}
            className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-black dark:hover:text-white border border-slate-300 dark:border-slate-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Quote selector if not preloaded */}
          {!quoteForPayment && quotes.length > 0 && (
            <div className="space-y-1 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-300 dark:border-slate-700/60 shadow-sm">
              <label className="text-[11px] font-bold text-brand-teal-800 dark:text-brand-teal-300">
                ¿Vincular a un Presupuesto Existente? (Opcional)
              </label>
              <select
                value={selectedQuoteId}
                onChange={handleSelectQuote}
                className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200 font-medium"
              >
                <option value="">-- Cobro independiente o seleccionar cotización --</option>
                {quotes.map(q => (
                  <option key={q.id} value={q.id}>
                    {q.quoteNumber} - {q.clientName} ({formatCurrency(q.total, q.currency)})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Client Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-800 dark:text-slate-300">
                Nombre del Cliente o Empresa <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="Ej. Ing. Carlos Mendoza"
                className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white shadow-sm focus:outline-none focus:border-brand-teal-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-800 dark:text-slate-300">
                Teléfono / WhatsApp
              </label>
              <input
                type="tel"
                value={clientPhone}
                onChange={(e) => setClientPhone(e.target.value)}
                placeholder="809-555-1234"
                className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white shadow-sm focus:outline-none focus:border-brand-teal-500"
              />
            </div>
          </div>

          {/* Amount & Method */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1 sm:col-span-2">
              <label className="text-xs font-bold text-slate-800 dark:text-slate-300">
                Monto Recibido <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  required
                  min="1"
                  step="50"
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-sm font-black text-emerald-700 dark:text-emerald-400 font-mono shadow-sm"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-800 dark:text-slate-300">
                Moneda
              </label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value as 'DOP' | 'USD')}
                className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-200 font-medium"
              >
                <option value="DOP">Pesos (RD$ DOP)</option>
                <option value="USD">Dólares (USD $)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-800 dark:text-slate-300">
                Método de Pago
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-200 font-bold"
              >
                <option value="transferencia">🏦 Transferencia Bancaria</option>
                <option value="efectivo">💵 Efectivo</option>
                <option value="tarjeta">💳 Tarjeta de Débito/Crédito</option>
                <option value="cheque">📜 Cheque</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-800 dark:text-slate-300">
                Fecha del Cobro
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-200"
              />
            </div>
          </div>

          {paymentMethod === 'transferencia' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-300 dark:border-slate-700/50 shadow-sm">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">Banco Receptor</label>
                <select
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-200 font-medium"
                >
                  <option value="Banco Popular Dominicano">Banco Popular Dominicano</option>
                  <option value="Banco BHD">Banco BHD</option>
                  <option value="Banreservas">Banreservas</option>
                  <option value="Otro Banco">Otro Banco / ACH</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">N° de Referencia / Depósito</label>
                <input
                  type="text"
                  placeholder="Ej. TRF-109283"
                  value={referenceNumber}
                  onChange={(e) => setReferenceNumber(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-200 font-mono shadow-sm"
                />
              </div>
            </div>
          )}

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-800 dark:text-slate-300">
              Concepto del Recibo
            </label>
            <input
              type="text"
              required
              value={concept}
              onChange={(e) => setConcept(e.target.value)}
              placeholder="Ej. Anticipo 60% instalación cámaras de seguridad"
              className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white shadow-sm"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-800 dark:text-slate-300">
              Notas Adicionales
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Observaciones de entrega de comprobante..."
              className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white resize-none shadow-sm"
            />
          </div>

          {/* Submit */}
          <div className="pt-4 border-t-2 border-slate-200 dark:border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsPaymentModalOpen(false)}
              className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-semibold border border-slate-300 dark:border-slate-700"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-brand-green-500 hover:from-emerald-400 hover:to-brand-green-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-md border border-emerald-600/30"
            >
              <CheckCircle className="w-4 h-4" />
              <span>Emitir Recibo de Pago</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
