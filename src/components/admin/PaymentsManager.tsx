import React, { useState } from 'react';
import { useAppState } from '../../context/AppStateContext';
import { Payment } from '../../types';
import { 
  Plus, 
  Search, 
  DollarSign, 
  Eye, 
  MessageCircle, 
  Trash2, 
  TrendingUp, 
  Calendar,
  FileSpreadsheet
} from 'lucide-react';
import { formatCurrency, formatDate } from '../../utils/formatters';

export const PaymentsManager: React.FC = () => {
  const { 
    payments, 
    companySettings, 
    deletePayment, 
    setActiveReceiptForView, 
    setIsPaymentModalOpen, 
    setQuoteForPayment,
    openWhatsAppTemplates,
    setIsReportsModalOpen
  } = useAppState();

  const [searchTerm, setSearchTerm] = useState('');
  const [methodFilter, setMethodFilter] = useState<string>('all');

  const totalCollectedDOP = payments
    .filter(p => p.currency === 'DOP' || !p.currency)
    .reduce((sum, p) => sum + p.amount, 0);

  const totalCollectedUSD = payments
    .filter(p => p.currency === 'USD')
    .reduce((sum, p) => sum + p.amount, 0);

  const filteredPayments = payments.filter(payment => {
    const matchesSearch = 
      payment.receiptNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (payment.quoteNumber && payment.quoteNumber.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (payment.referenceNumber && payment.referenceNumber.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesMethod = methodFilter === 'all' || payment.paymentMethod === methodFilter;
    return matchesSearch && matchesMethod;
  });

  const handleOpenNewPayment = () => {
    setQuoteForPayment(null);
    setIsPaymentModalOpen(true);
  };

  const handleWhatsAppReceipt = (p: Payment) => {
    openWhatsAppTemplates('receipt', {
      clientName: p.clientName,
      clientPhone: p.clientPhone,
      receiptNumber: p.receiptNumber,
      amount: p.amount,
      currency: p.currency,
      concept: p.concept
    });
  };

  const getMethodBadge = (method: Payment['paymentMethod']) => {
    switch (method) {
      case 'transferencia':
        return { label: '🏦 Transferencia', color: 'bg-blue-50 dark:bg-blue-950/80 text-blue-800 dark:text-blue-300 border-blue-300 dark:border-blue-500/30' };
      case 'efectivo':
        return { label: '💵 Efectivo', color: 'bg-emerald-50 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-500/30' };
      case 'tarjeta':
        return { label: '💳 Tarjeta', color: 'bg-purple-50 dark:bg-purple-950/80 text-purple-800 dark:text-purple-300 border-purple-300 dark:border-purple-500/30' };
      default:
        return { label: '📜 Cheque', color: 'bg-amber-50 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-500/30' };
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* Top Metrics Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 space-y-2 shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
              Total Cobrado (Pesos)
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-300 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-400 flex items-center justify-center shadow-sm">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-700 dark:text-emerald-400 font-mono">
            {formatCurrency(totalCollectedDOP, 'DOP')}
          </div>
          <div className="text-[11px] text-slate-600 dark:text-slate-400 font-medium">
            {payments.filter(p => p.currency === 'DOP' || !p.currency).length} recibos emitidos
          </div>
        </div>

        {totalCollectedUSD > 0 && (
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 space-y-2 shadow-md">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                Total Cobrado (Dólares)
              </span>
              <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-500/10 border border-blue-300 dark:border-blue-500/30 text-blue-700 dark:text-blue-400 flex items-center justify-center shadow-sm">
                <DollarSign className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-blue-700 dark:text-blue-400 font-mono">
              {formatCurrency(totalCollectedUSD, 'USD')}
            </div>
            <div className="text-[11px] text-slate-600 dark:text-slate-400 font-medium">
              {payments.filter(p => p.currency === 'USD').length} recibos en moneda extranjera
            </div>
          </div>
        )}

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 space-y-2 shadow-md flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
              Reportes & Saldos
            </span>
            <div className="w-8 h-8 rounded-lg bg-purple-50 dark:bg-purple-500/10 border border-purple-300 dark:border-purple-500/30 text-purple-700 dark:text-purple-400 flex items-center justify-center shadow-sm">
              <FileSpreadsheet className="w-4 h-4" />
            </div>
          </div>
          <button
            onClick={() => setIsReportsModalOpen(true)}
            className="w-full py-2 px-3 rounded-xl bg-purple-100 hover:bg-purple-200 dark:bg-purple-950/80 dark:hover:bg-purple-900 text-purple-800 dark:text-purple-300 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors border border-purple-300 dark:border-purple-700"
          >
            <span>Ver Cuentas por Cobrar & Excel</span>
          </button>
        </div>

      </div>

      {/* Filter and Register Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-300 dark:border-slate-800 shadow-md">
        
        <div className="flex items-center gap-3 flex-1 flex-wrap">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por N° recibo, cliente, cotización o referencia..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white placeholder-slate-500 focus:outline-none focus:border-brand-teal-500 shadow-sm"
            />
          </div>

          <select
            value={methodFilter}
            onChange={(e) => setMethodFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200 font-bold focus:outline-none focus:border-brand-teal-500 shadow-sm"
          >
            <option value="all">Todos los Métodos</option>
            <option value="transferencia">Transferencia Bancaria</option>
            <option value="efectivo">Efectivo</option>
            <option value="tarjeta">Tarjeta</option>
            <option value="cheque">Cheque</option>
          </select>
        </div>

        <button
          onClick={handleOpenNewPayment}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md border border-emerald-700/20"
        >
          <Plus className="w-4 h-4" />
          <span>Registrar Nuevo Cobro</span>
        </button>
      </div>

      {/* Receipts Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-2xl overflow-hidden shadow-md">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-300 font-bold uppercase text-[10px] tracking-wider border-b-2 border-slate-300 dark:border-slate-700">
                <th className="py-3.5 px-4">N° Recibo</th>
                <th className="py-3.5 px-4">Cliente / Empresa</th>
                <th className="py-3.5 px-4">Concepto del Pago</th>
                <th className="py-3.5 px-4">Método & Banco</th>
                <th className="py-3.5 px-4">Fecha</th>
                <th className="py-3.5 px-4 text-right">Monto Recibido</th>
                <th className="py-3.5 px-4 text-right">Acciones</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {filteredPayments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400 italic">
                    No se han registrado cobros o anticipos con los filtros actuales.
                  </td>
                </tr>
              ) : (
                filteredPayments.map((p) => {
                  const methodBadge = getMethodBadge(p.paymentMethod);

                  return (
                    <tr 
                      key={p.id}
                      className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group"
                    >
                      {/* Receipt Code */}
                      <td className="py-3.5 px-4 font-mono font-bold text-emerald-700 dark:text-emerald-400">
                        {p.receiptNumber}
                      </td>

                      {/* Client */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900 dark:text-white">
                          {p.clientName}
                        </div>
                        {p.quoteNumber && (
                          <div className="text-[10px] text-purple-700 dark:text-purple-400 font-mono">
                            Ref: {p.quoteNumber}
                          </div>
                        )}
                      </td>

                      {/* Concept */}
                      <td className="py-3.5 px-4 max-w-xs">
                        <div className="text-slate-800 dark:text-slate-200 line-clamp-1 font-medium">
                          {p.concept}
                        </div>
                        {p.referenceNumber && (
                          <div className="text-[10px] text-slate-500 font-mono">
                            Ref: {p.referenceNumber}
                          </div>
                        )}
                      </td>

                      {/* Method */}
                      <td className="py-3.5 px-4">
                        <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold border ${methodBadge.color}`}>
                          {methodBadge.label}
                        </span>
                        {p.bankName && (
                          <div className="text-[10px] text-slate-500 mt-0.5">
                            {p.bankName}
                          </div>
                        )}
                      </td>

                      {/* Date */}
                      <td className="py-3.5 px-4 text-slate-700 dark:text-slate-300 font-medium">
                        {formatDate(p.date)}
                      </td>

                      {/* Amount */}
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-emerald-700 dark:text-emerald-400 text-sm">
                        {formatCurrency(p.amount, p.currency)}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          
                          {/* View Official Receipt */}
                          <button
                            onClick={() => setActiveReceiptForView(p)}
                            className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/80 hover:bg-emerald-100 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-500/30"
                            title="Ver Recibo Oficial Membretado / Descargar PDF / Imprimir"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {/* WhatsApp Template Notification */}
                          <button
                            onClick={() => handleWhatsAppReceipt(p)}
                            className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-emerald-50 text-emerald-700 dark:text-emerald-400 border border-slate-300 dark:border-slate-700"
                            title="Enviar Comprobante por WhatsApp"
                          >
                            <MessageCircle className="w-4 h-4" />
                          </button>

                          {/* Delete */}
                          <button
                            onClick={() => {
                              if (confirm(`¿Eliminar el recibo ${p.receiptNumber}?`)) {
                                deletePayment(p.id);
                              }
                            }}
                            className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-rose-100 text-rose-600 dark:text-rose-400 border border-slate-300 dark:border-slate-700"
                            title="Eliminar"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>

                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
