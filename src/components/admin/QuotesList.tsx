import React, { useState } from 'react';
import { useAppState } from '../../context/AppStateContext';
import { Quote } from '../../types';
import { 
  Plus, 
  Search, 
  Eye, 
  MessageCircle, 
  Trash2, 
  Edit,
  DollarSign,
  PenTool,
  CheckCircle2,
  Wrench
} from 'lucide-react';
import { 
  formatCurrency, 
  formatDate 
} from '../../utils/formatters';

export const QuotesList: React.FC = () => {
  const { 
    quotes, 
    deleteQuote, 
    setActiveQuoteForView, 
    setActiveQuoteForEdit, 
    setIsQuoteModalOpen,
    openPaymentForQuote,
    updateQuote,
    openWhatsAppTemplates,
    setActiveWorkOrderForEdit,
    setIsWorkOrderModalOpen
  } = useAppState();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredQuotes = quotes.filter(quote => {
    const matchesSearch = 
      quote.quoteNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      quote.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      quote.clientPhone.includes(searchTerm);

    const matchesStatus = statusFilter === 'all' || quote.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleWhatsApp = (quote: Quote) => {
    openWhatsAppTemplates('quote', {
      clientName: quote.clientName,
      clientPhone: quote.clientPhone,
      quoteNumber: quote.quoteNumber,
      total: quote.total,
      currency: quote.currency,
      validUntil: quote.validUntil
    });
  };

  const handleCreateWorkOrder = (quote: Quote) => {
    setActiveWorkOrderForEdit({
      id: '',
      orderNumber: '',
      quoteId: quote.id,
      quoteNumber: quote.quoteNumber,
      dealId: quote.dealId,
      clientName: quote.clientName,
      clientPhone: quote.clientPhone,
      clientAddress: quote.clientAddress,
      serviceCategory: 'camaras',
      assignedTechnician: 'Rafael Martínez',
      scheduledDate: new Date().toISOString().slice(0, 10),
      status: 'in_progress',
      scopeOfWork: `Instalación según Presupuesto ${quote.quoteNumber}: ${quote.items.map(i => `${i.quantity}x ${i.name}`).join(', ')}`,
      checklist: quote.items.map((it, idx) => ({
        id: `chk-${idx}`,
        task: `Instalación de ${it.quantity}x ${it.name}`,
        completed: false
      })),
      beforeImages: [],
      afterImages: [],
      createdBy: 'Rafael Martínez',
      createdAt: new Date().toISOString()
    });
    setIsWorkOrderModalOpen(true);
  };

  const getStatusBadge = (quote: Quote) => {
    if (quote.clientSignature) {
      return { 
        label: 'Aprobada & Firmada', 
        color: 'bg-emerald-50 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border-emerald-400 dark:border-emerald-500/40' 
      };
    }

    switch (quote.status) {
      case 'accepted':
        return { label: 'Aprobada', color: 'bg-emerald-50 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border-emerald-400 dark:border-emerald-500/40' };
      case 'sent':
        return { label: 'Enviada', color: 'bg-purple-50 dark:bg-purple-500/20 text-purple-800 dark:text-purple-300 border-purple-400 dark:border-purple-500/40' };
      case 'invoiced':
        return { label: 'Facturada', color: 'bg-brand-green-50 dark:bg-brand-green-500/20 text-brand-green-800 dark:text-brand-green-300 border-brand-green-400 dark:border-brand-green-500/40' };
      case 'rejected':
        return { label: 'Rechazada', color: 'bg-rose-50 dark:bg-rose-500/20 text-rose-800 dark:text-rose-300 border-rose-400 dark:border-rose-500/40' };
      default:
        return { label: 'Borrador', color: 'bg-slate-100 dark:bg-slate-500/20 text-slate-800 dark:text-slate-300 border-slate-400 dark:border-slate-500/40' };
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-300 dark:border-slate-800 shadow-md">
        <div className="flex items-center gap-3 flex-1 flex-wrap">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por número de cotización, cliente o teléfono..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white placeholder-slate-500 focus:outline-none focus:border-brand-teal-500 shadow-sm"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200 font-bold focus:outline-none focus:border-brand-teal-500 shadow-sm"
          >
            <option value="all">Todos los Estados</option>
            <option value="sent">Enviadas</option>
            <option value="accepted">Aprobadas</option>
            <option value="invoiced">Facturadas</option>
            <option value="draft">Borradores</option>
            <option value="rejected">Rechazadas</option>
          </select>
        </div>

        <button
          onClick={() => {
            setActiveQuoteForEdit(null);
            setIsQuoteModalOpen(true);
          }}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-teal-600 hover:bg-brand-teal-500 text-white font-bold text-xs shadow-md border border-brand-teal-700/20"
        >
          <Plus className="w-4 h-4" />
          <span>Elaborar Nuevo Presupuesto</span>
        </button>
      </div>

      {/* Quotes Table Container */}
      <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-2xl overflow-hidden shadow-md">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            
            {/* Table Header */}
            <thead>
              <tr className="bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-300 font-bold uppercase text-[10px] tracking-wider border-b-2 border-slate-300 dark:border-slate-700">
                <th className="py-3.5 px-4">N° Cotización</th>
                <th className="py-3.5 px-4">Cliente & Empresa</th>
                <th className="py-3.5 px-4">Fecha Emisión</th>
                <th className="py-3.5 px-4">Ítems</th>
                <th className="py-3.5 px-4 text-right">Monto Total</th>
                <th className="py-3.5 px-4 text-center">Estado & Firma</th>
                <th className="py-3.5 px-4 text-right">Acciones</th>
              </tr>
            </thead>

            {/* Table Body */}
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {filteredQuotes.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400 italic">
                    No se encontraron presupuestos registrados con los filtros aplicados.
                  </td>
                </tr>
              ) : (
                filteredQuotes.map((quote) => {
                  const badge = getStatusBadge(quote);

                  return (
                    <tr 
                      key={quote.id}
                      className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group"
                    >
                      {/* Quote Number */}
                      <td className="py-3.5 px-4 font-mono font-bold text-brand-teal-800 dark:text-brand-teal-400">
                        {quote.quoteNumber}
                      </td>

                      {/* Client */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900 dark:text-white">
                          {quote.clientName}
                        </div>
                        {quote.clientCompany && (
                          <div className="text-[11px] text-slate-600 dark:text-slate-400 font-medium">
                            {quote.clientCompany}
                          </div>
                        )}
                        <div className="text-[10px] text-slate-500 font-mono">
                          {quote.clientPhone}
                        </div>
                      </td>

                      {/* Date */}
                      <td className="py-3.5 px-4 text-slate-700 dark:text-slate-300 font-medium">
                        <div>{formatDate(quote.date)}</div>
                        <div className="text-[10px] text-slate-500">Válido hasta: {formatDate(quote.validUntil)}</div>
                      </td>

                      {/* Items count */}
                      <td className="py-3.5 px-4 text-slate-700 dark:text-slate-400 font-medium">
                        {quote.items.length} {quote.items.length === 1 ? 'equipo/servicio' : 'equipos/servicios'}
                      </td>

                      {/* Total */}
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900 dark:text-white text-sm">
                        {formatCurrency(quote.total, quote.currency)}
                      </td>

                      {/* Status & Digital Signature */}
                      <td className="py-3.5 px-4 text-center">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold border shadow-sm ${badge.color}`}>
                          {quote.clientSignature ? <CheckCircle2 className="w-3 h-3 text-emerald-600" /> : null}
                          <span>{badge.label}</span>
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          
                          {/* View Letterhead Document */}
                          <button
                            onClick={() => setActiveQuoteForView(quote)}
                            className="p-1.5 rounded-lg bg-purple-50 dark:bg-purple-950/80 hover:bg-purple-100 text-purple-700 dark:text-purple-300 border border-purple-300 dark:border-purple-500/30"
                            title="Ver Cotización Membretada Oficial / Firmar / PDF"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {/* Register Payment */}
                          <button
                            onClick={() => openPaymentForQuote(quote)}
                            className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/80 hover:bg-emerald-100 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-500/30"
                            title="Registrar Cobro / Anticipo"
                          >
                            <DollarSign className="w-4 h-4" />
                          </button>

                          {/* WhatsApp Template */}
                          <button
                            onClick={() => handleWhatsApp(quote)}
                            className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/80 hover:bg-emerald-100 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-500/30"
                            title="Enviar por WhatsApp"
                          >
                            <MessageCircle className="w-4 h-4" />
                          </button>

                          {/* Work Order if signed/accepted */}
                          {(quote.status === 'accepted' || quote.clientSignature) && (
                            <button
                              onClick={() => handleCreateWorkOrder(quote)}
                              className="p-1.5 rounded-lg bg-brand-green-50 dark:bg-brand-green-950/80 hover:bg-brand-green-100 text-brand-green-800 dark:text-brand-green-300 border border-brand-green-300 dark:border-brand-green-500/30"
                              title="Generar Orden de Trabajo / Conduce"
                            >
                              <Wrench className="w-4 h-4" />
                            </button>
                          )}

                          {/* Edit */}
                          <button
                            onClick={() => {
                              setActiveQuoteForEdit(quote);
                              setIsQuoteModalOpen(true);
                            }}
                            className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700"
                            title="Editar"
                          >
                            <Edit className="w-4 h-4" />
                          </button>

                          {/* Delete */}
                          <button
                            onClick={() => {
                              if (confirm(`¿Eliminar la cotización ${quote.quoteNumber}?`)) {
                                deleteQuote(quote.id);
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
