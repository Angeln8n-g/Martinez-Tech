import React, { useState } from 'react';
import { useAppState } from '../../context/AppStateContext';
import { FiscalInvoice, NCFType, InvoicePaymentStatus } from '../../types';
import { 
  Receipt, 
  Plus, 
  Search, 
  Download, 
  Eye, 
  Edit, 
  Trash2, 
  FileSpreadsheet, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  DollarSign, 
  Printer, 
  MessageCircle,
  FileText,
  ShieldCheck
} from 'lucide-react';
import { formatCurrency, formatDate } from '../../utils/formatters';

export const FiscalInvoicesList: React.FC = () => {
  const { 
    invoices, 
    setIsInvoiceModalOpen, 
    setActiveInvoiceForEdit, 
    setActiveInvoiceForView, 
    deleteInvoice,
    openWhatsAppTemplates 
  } = useAppState();

  const [searchTerm, setSearchTerm] = useState('');
  const [ncfFilter, setNcfFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Open creation modal
  const handleNewInvoice = () => {
    setActiveInvoiceForEdit(null);
    setIsInvoiceModalOpen(true);
  };

  // Open edit modal
  const handleEdit = (inv: FiscalInvoice) => {
    setActiveInvoiceForEdit(inv);
    setIsInvoiceModalOpen(true);
  };

  // View printable document
  const handleView = (inv: FiscalInvoice) => {
    setActiveInvoiceForView(inv);
  };

  // WhatsApp shortcut
  const handleWhatsApp = (inv: FiscalInvoice) => {
    openWhatsAppTemplates('receipt', {
      clientName: inv.clientName,
      clientPhone: inv.clientPhone,
      receiptNumber: `${inv.invoiceNumber} (${inv.ncf})`,
      total: inv.total,
      paid: inv.amountPaid,
      balance: inv.balanceDue,
      amount: inv.total,
      currency: inv.currency,
      concept: `Factura Fiscal ${inv.ncf} (${inv.ncfTypeName})`
    });
  };

  // Delete invoice with confirmation
  const handleDelete = async (id: string, ncf: string) => {
    if (window.confirm(`¿Estás seguro de anular y eliminar la factura fiscal ${ncf}?`)) {
      await deleteInvoice(id);
    }
  };

  // Export DGII Formato 607 (Ventas de Bienes y Servicios)
  const handleExport607 = () => {
    if (invoices.length === 0) {
      alert('No hay facturas fiscales emitidas para generar el reporte DGII 607.');
      return;
    }

    // DGII Formato 607 Official Columns
    const headers = 'RNC_Cedula_Pasaporte,Tipo_Identificacion,Numero_Comprobante_Fiscal_NCF,NCF_Modificado,Tipo_Ingreso,Fecha_Emision_AAAAMMDD,Fecha_Retencion_AAAAMMDD,Monto_Facturado_Total,ITBIS_Facturado,ITBIS_Retenido_por_Terceros,ITBIS_Percibido,Retencion_Renta_por_Terceros,ISR_Percibido,Impuesto_Selectivo_al_Consumo,Otros_Impuestos_o_Tasas,Monto_Propina_Legal,Forma_Pago';
    
    const rows = invoices.map(inv => {
      // Formato fecha DGII AAAAMMDD
      const cleanDate = inv.date.replace(/-/g, '');
      const rncClean = (inv.clientRnc || '').replace(/[^0-9]/g, '');
      // Tipo ID: 1 = RNC (9 digitos), 2 = Cedula (11 digitos), 3 = Pasaporte / Extranjero
      let tipoId = '1';
      if (rncClean.length === 11) tipoId = '2';
      else if (rncClean.length === 0) tipoId = '3';

      // Tipo de pago DGII: 01 = Efectivo, 02 = Cheques/Transferencias/Depósito, 03 = Tarjeta Débito/Crédito, 04 = A Crédito
      let formaPagoDGII = '02';
      if (inv.paymentMethod === 'efectivo') formaPagoDGII = '01';
      else if (inv.paymentMethod === 'tarjeta') formaPagoDGII = '03';
      else if (inv.paymentStatus === 'pending') formaPagoDGII = '04';

      return [
        rncClean || '000000000',
        tipoId,
        inv.ncf,
        '', // NCF modificado
        '01', // Tipo ingreso: 01 = Ingresos por operaciones (no financieros)
        cleanDate,
        '', // Fecha retencion
        (inv.subtotal - (inv.discountAmount || 0)).toFixed(2),
        (inv.taxAmount || 0).toFixed(2),
        '0.00', // ITBIS Retenido
        '0.00', // ITBIS Percibido
        '0.00', // ISR Retenido
        '0.00', // ISR Percibido
        '0.00', // ISC
        '0.00', // Otros
        '0.00', // Propina
        formaPagoDGII
      ].join(',');
    });

    const csvContent = '\uFEFF' + [headers, ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `reporte_607_dgii_martinez_tech_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Filter invoices
  const filteredInvoices = invoices.filter(inv => {
    const term = searchTerm.toLowerCase();
    const matchesSearch = 
      inv.ncf.toLowerCase().includes(term) ||
      inv.invoiceNumber.toLowerCase().includes(term) ||
      inv.clientName.toLowerCase().includes(term) ||
      (inv.clientRnc && inv.clientRnc.toLowerCase().includes(term)) ||
      (inv.quoteNumber && inv.quoteNumber.toLowerCase().includes(term));

    const matchesNcf = ncfFilter === 'all' || inv.ncfType === ncfFilter;
    const matchesStatus = statusFilter === 'all' || inv.paymentStatus === statusFilter;

    return matchesSearch && matchesNcf && matchesStatus;
  });

  // Calculate Metrics
  const totalInvoiced = invoices.reduce((sum, inv) => sum + inv.total, 0);
  const totalITBIS = invoices.reduce((sum, inv) => sum + inv.taxAmount, 0);
  const totalPaid = invoices.reduce((sum, inv) => sum + inv.amountPaid, 0);
  const totalPending = invoices.reduce((sum, inv) => sum + inv.balanceDue, 0);

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase tracking-wider">
            <span>Total Facturado</span>
            <Receipt className="w-4 h-4 text-brand-teal-600 dark:text-brand-teal-400" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white font-mono">
            {formatCurrency(totalInvoiced)}
          </div>
          <div className="text-[11px] text-slate-500 font-medium">
            {invoices.length} facturas fiscales emitidas
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase tracking-wider">
            <span>ITBIS Recaudado (18%)</span>
            <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
            {formatCurrency(totalITBIS)}
          </div>
          <div className="text-[11px] text-slate-500 font-medium">
            Declarable en Formato 607 / IT-1
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase tracking-wider">
            <span>Cobrado Efectivo</span>
            <CheckCircle2 className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-cyan-600 dark:text-cyan-400 font-mono">
            {formatCurrency(totalPaid)}
          </div>
          <div className="text-[11px] text-slate-500 font-medium">
            Ingresos ingresados a cuenta
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase tracking-wider">
            <span>Cuentas por Cobrar</span>
            <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-amber-600 dark:text-amber-400 font-mono">
            {formatCurrency(totalPending)}
          </div>
          <div className="text-[11px] text-slate-500 font-medium">
            Balance pendiente por clientes
          </div>
        </div>

      </div>

      {/* Filter and Actions Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-300 dark:border-slate-800 shadow-md">
        
        <div className="flex items-center gap-3 flex-1 flex-wrap">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por NCF, cliente, RNC o No. de factura..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white placeholder-slate-500 focus:outline-none focus:border-brand-teal-500 shadow-sm"
            />
          </div>

          <select
            value={ncfFilter}
            onChange={(e) => setNcfFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200 font-medium focus:outline-none focus:border-brand-teal-500 shadow-sm"
          >
            <option value="all">Todos los Comprobantes (NCF)</option>
            <option value="B01">B01 - Crédito Fiscal</option>
            <option value="B02">B02 - Consumo Final</option>
            <option value="B14">B14 - Régimen Especial</option>
            <option value="B15">B15 - Gubernamental</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200 font-medium focus:outline-none focus:border-brand-teal-500 shadow-sm"
          >
            <option value="all">Todos los Estados</option>
            <option value="paid">Pagada / Cobrada</option>
            <option value="partial">Abono Parcial</option>
            <option value="pending">Pendiente de Pago</option>
          </select>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleExport607}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs border border-slate-300 dark:border-slate-700 shadow-sm transition-colors"
            title="Exportar archivo CSV formato 607 para la DGII"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Exportar Reporte 607 DGII</span>
          </button>

          <button
            onClick={handleNewInvoice}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-emerald-500 hover:from-amber-400 hover:to-emerald-400 text-slate-950 font-black text-xs uppercase tracking-wider shadow-md transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Emitir Factura Fiscal</span>
          </button>
        </div>

      </div>

      {/* Invoices List Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-300 dark:border-slate-800 shadow-sm overflow-hidden">
        {filteredInvoices.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
              <Receipt className="w-6 h-6" />
            </div>
            <div className="text-sm font-bold text-slate-800 dark:text-slate-200">
              No hay facturas fiscales registradas
            </div>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Puedes emitir una factura desde el botón superior o generarla automáticamente a partir de una cotización aprobada.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="p-3.5">NCF & Factura</th>
                  <th className="p-3.5">Cliente / Razón Social</th>
                  <th className="p-3.5">Fecha & Vencimiento</th>
                  <th className="p-3.5 text-right">Subtotal</th>
                  <th className="p-3.5 text-right">ITBIS (18%)</th>
                  <th className="p-3.5 text-right">Total</th>
                  <th className="p-3.5 text-center">Estado</th>
                  <th className="p-3.5 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {filteredInvoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                    
                    {/* NCF & Invoice Number */}
                    <td className="p-3.5 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700">
                          {inv.ncf}
                        </span>
                      </div>
                      <div className="text-[11px] font-bold text-slate-900 dark:text-white mt-0.5">
                        {inv.invoiceNumber}
                      </div>
                      <div className="text-[10px] text-slate-500 truncate max-w-[140px]">
                        {inv.ncfTypeName}
                      </div>
                    </td>

                    {/* Client & RNC */}
                    <td className="p-3.5">
                      <div className="font-bold text-slate-900 dark:text-white max-w-[200px] truncate">
                        {inv.clientName}
                      </div>
                      {inv.clientRnc && (
                        <div className="text-[11px] font-mono text-slate-500">
                          RNC: {inv.clientRnc}
                        </div>
                      )}
                      {inv.quoteNumber && (
                        <div className="text-[10px] text-brand-teal-600 dark:text-brand-teal-400 font-mono">
                          Cot: {inv.quoteNumber}
                        </div>
                      )}
                    </td>

                    {/* Dates */}
                    <td className="p-3.5 whitespace-nowrap">
                      <div className="text-slate-900 dark:text-white font-medium">
                        {formatDate(inv.date)}
                      </div>
                      <div className="text-[10px] text-slate-500">
                        Vence: {formatDate(inv.dueDate)}
                      </div>
                    </td>

                    {/* Subtotal */}
                    <td className="p-3.5 text-right font-mono text-slate-600 dark:text-slate-400 whitespace-nowrap">
                      {formatCurrency(inv.subtotal, inv.currency)}
                    </td>

                    {/* ITBIS */}
                    <td className="p-3.5 text-right font-mono text-slate-600 dark:text-slate-400 whitespace-nowrap">
                      {formatCurrency(inv.taxAmount, inv.currency)}
                    </td>

                    {/* Total */}
                    <td className="p-3.5 text-right whitespace-nowrap">
                      <div className="font-mono font-black text-slate-900 dark:text-white">
                        {formatCurrency(inv.total, inv.currency)}
                      </div>
                      {inv.balanceDue > 0 && (
                        <div className="text-[10px] text-amber-600 dark:text-amber-400 font-mono font-bold">
                          Pendiente: {formatCurrency(inv.balanceDue, inv.currency)}
                        </div>
                      )}
                    </td>

                    {/* Payment Status */}
                    <td className="p-3.5 text-center whitespace-nowrap">
                      {inv.paymentStatus === 'paid' ? (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700">
                          Cobrada
                        </span>
                      ) : inv.paymentStatus === 'partial' ? (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-cyan-100 dark:bg-cyan-950/80 text-cyan-800 dark:text-cyan-300 border border-cyan-300 dark:border-cyan-700">
                          Abonada
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700">
                          Pendiente
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="p-3.5 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        
                        <button
                          onClick={() => handleView(inv)}
                          className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-brand-teal-50 dark:hover:bg-brand-teal-950/80 text-slate-700 dark:text-slate-300 hover:text-brand-teal-600 transition-colors"
                          title="Ver Factura Membretada DGII / Imprimir"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => handleWhatsApp(inv)}
                          className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/80 hover:bg-emerald-100 text-emerald-700 dark:text-emerald-300 transition-colors"
                          title="Compartir Comprobante por WhatsApp"
                        >
                          <MessageCircle className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => handleEdit(inv)}
                          className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 transition-colors"
                          title="Editar Factura"
                        >
                          <Edit className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => handleDelete(inv.id, inv.ncf)}
                          className="p-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/80 hover:bg-rose-100 text-rose-600 transition-colors"
                          title="Eliminar Comprobante"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>

                      </div>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
};
