import React, { useState } from 'react';
import { useAppState } from '../../context/AppStateContext';
import { 
  X, 
  Download, 
  DollarSign, 
  TrendingUp, 
  CreditCard, 
  FileSpreadsheet, 
  Calendar, 
  PieChart, 
  Users, 
  ArrowUpRight,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';
import { formatCurrency, formatDate } from '../../utils/formatters';

export const FinancialReportsModal: React.FC = () => {
  const { 
    isReportsModalOpen, 
    setIsReportsModalOpen, 
    quotes, 
    payments, 
    clients, 
    deals,
    companySettings 
  } = useAppState();

  const [activeReportTab, setActiveReportTab] = useState<'overview' | 'receivables' | 'categories'>('overview');

  if (!isReportsModalOpen) return null;

  // Financial Metrics
  const totalQuoted = quotes.reduce((sum, q) => sum + (q.total || 0), 0);
  const totalPaid = payments.reduce((sum, p) => sum + (p.amount || 0), 0);
  
  // Calculate Accounts Receivable (Cuentas por cobrar)
  const receivables = quotes
    .filter(q => q.status !== 'rejected' && q.status !== 'draft')
    .map(quote => {
      const quotePayments = payments.filter(p => p.quoteId === quote.id || (p.quoteNumber && p.quoteNumber === quote.quoteNumber));
      const paid = quotePayments.reduce((s, p) => s + (p.amount || 0), 0);
      const balance = Math.max(0, quote.total - paid);
      return {
        ...quote,
        paid,
        balance
      };
    })
    .filter(q => q.balance > 0);

  const totalReceivable = receivables.reduce((sum, r) => sum + r.balance, 0);

  // Sales by Category
  const categorySales: Record<string, number> = {};
  deals.forEach(d => {
    const cat = d.serviceCategory || 'otros';
    categorySales[cat] = (categorySales[cat] || 0) + (d.estimatedValue || 0);
  });

  // Helper to trigger browser CSV download with UTF-8 BOM
  const downloadCSV = (filename: string, rows: string[][]) => {
    const processRow = (row: string[]) => 
      row.map(val => `"${(val || '').toString().replace(/"/g, '""')}"`).join(',');

    const csvContent = '\uFEFF' + rows.map(processRow).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // 1. Export Quotes CSV
  const handleExportQuotes = () => {
    const headers = ['N° Cotización', 'Cliente', 'Empresa', 'Teléfono', 'Fecha', 'Vigencia', 'Subtotal', 'Descuento', 'ITBIS', 'Total', 'Moneda', 'Estado', 'Técnico/Creador'];
    const rows = quotes.map(q => [
      q.quoteNumber,
      q.clientName,
      q.clientCompany || '',
      q.clientPhone,
      q.date,
      q.validUntil,
      q.subtotal.toString(),
      q.discountAmount.toString(),
      q.taxAmount.toString(),
      q.total.toString(),
      q.currency,
      q.status,
      q.createdBy
    ]);
    downloadCSV(`Cotizaciones_Martinez_Tech_${new Date().toISOString().slice(0, 10)}.csv`, [headers, ...rows]);
  };

  // 2. Export Payments CSV
  const handleExportPayments = () => {
    const headers = ['N° Recibo', 'Ref. Cotización', 'Cliente', 'Monto', 'Moneda', 'Método de Pago', 'Banco', 'N° Referencia', 'Concepto', 'Fecha'];
    const rows = payments.map(p => [
      p.receiptNumber,
      p.quoteNumber || '',
      p.clientName,
      p.amount.toString(),
      p.currency,
      p.paymentMethod,
      p.bankName || '',
      p.referenceNumber || '',
      p.concept,
      p.date
    ]);
    downloadCSV(`Cobros_y_Recibos_Martinez_Tech_${new Date().toISOString().slice(0, 10)}.csv`, [headers, ...rows]);
  };

  // 3. Export Accounts Receivable CSV
  const handleExportReceivables = () => {
    const headers = ['N° Cotización', 'Cliente', 'Teléfono', 'Fecha Emisión', 'Total Cotizado', 'Anticipo Pagado', 'Balance Pendiente (RD$)', 'Estado'];
    const rows = receivables.map(r => [
      r.quoteNumber,
      r.clientName,
      r.clientPhone,
      r.date,
      r.total.toString(),
      r.paid.toString(),
      r.balance.toString(),
      r.status
    ]);
    downloadCSV(`Cuentas_por_Cobrar_Martinez_Tech_${new Date().toISOString().slice(0, 10)}.csv`, [headers, ...rows]);
  };

  // 4. Export Clients Directory CSV
  const handleExportClients = () => {
    const headers = ['Nombre', 'Empresa', 'Teléfono', 'Email', 'RNC/Cédula', 'Tipo', 'Dirección', 'Ciudad'];
    const rows = clients.map(c => [
      c.name,
      c.company || '',
      c.phone,
      c.email || '',
      c.rnc || '',
      c.type,
      c.address,
      c.city
    ]);
    downloadCSV(`Directorio_Clientes_Martinez_Tech_${new Date().toISOString().slice(0, 10)}.csv`, [headers, ...rows]);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-3xl max-w-4xl w-full p-5 sm:p-7 relative max-h-[95vh] overflow-y-auto shadow-2xl space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b-2 border-slate-200 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-500/10 border border-purple-300 dark:border-purple-500/30 flex items-center justify-center text-purple-700 dark:text-purple-400 shadow-sm">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-900 dark:text-white">
                Reportes Financieros & Exportación a Excel / CSV
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                Resumen ejecutivo de ingresos, balances por cobrar y descargas en 1-clic compatibles con Excel.
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsReportsModalOpen(false)}
            className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-black dark:hover:text-white border border-slate-300 dark:border-slate-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Top KPI Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 shadow-sm space-y-1">
            <div className="text-[11px] font-bold uppercase text-slate-600 dark:text-slate-400 flex items-center justify-between">
              <span>Total Cotizado ({quotes.length})</span>
              <DollarSign className="w-4 h-4 text-purple-600" />
            </div>
            <div className="text-xl font-black font-mono text-purple-700 dark:text-purple-400">
              {formatCurrency(totalQuoted, 'DOP')}
            </div>
            <div className="text-[10px] text-slate-500 font-medium">
              Propuestas formales emitidas
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-500/40 shadow-sm space-y-1">
            <div className="text-[11px] font-bold uppercase text-emerald-800 dark:text-emerald-400 flex items-center justify-between">
              <span>Total Cobrado en Caja</span>
              <TrendingUp className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-xl font-black font-mono text-emerald-700 dark:text-emerald-300">
              {formatCurrency(totalPaid, 'DOP')}
            </div>
            <div className="text-[10px] text-emerald-800/70 dark:text-emerald-400 font-medium">
              {payments.length} recibos de pago emitidos
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-500/40 shadow-sm space-y-1">
            <div className="text-[11px] font-bold uppercase text-amber-800 dark:text-amber-400 flex items-center justify-between">
              <span>Cuentas por Cobrar</span>
              <CreditCard className="w-4 h-4 text-amber-600" />
            </div>
            <div className="text-xl font-black font-mono text-amber-700 dark:text-amber-300">
              {formatCurrency(totalReceivable, 'DOP')}
            </div>
            <div className="text-[10px] text-amber-800/70 dark:text-amber-400 font-medium">
              {receivables.length} clientes con balance pendiente
            </div>
          </div>

        </div>

        {/* 1-Click Excel / CSV Export Strip */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-300 dark:border-slate-700 space-y-3 shadow-sm">
          <div className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
            <Download className="w-4 h-4 text-brand-teal-600" />
            <span>Descarga de Hojas de Cálculo (.CSV / Excel)</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            
            <button
              type="button"
              onClick={handleExportQuotes}
              className="p-3 rounded-xl bg-white dark:bg-slate-900 hover:bg-brand-teal-50 dark:hover:bg-brand-teal-950/50 border border-slate-300 dark:border-slate-700 text-left transition-all shadow-sm flex flex-col justify-between space-y-2 group"
            >
              <div className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-brand-teal-600">
                Presupuestos
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-500">
                <span>{quotes.length} filas</span>
                <Download className="w-3.5 h-3.5 text-brand-teal-600" />
              </div>
            </button>

            <button
              type="button"
              onClick={handleExportPayments}
              className="p-3 rounded-xl bg-white dark:bg-slate-900 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 border border-slate-300 dark:border-slate-700 text-left transition-all shadow-sm flex flex-col justify-between space-y-2 group"
            >
              <div className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-emerald-600">
                Recibos de Pago
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-500">
                <span>{payments.length} filas</span>
                <Download className="w-3.5 h-3.5 text-emerald-600" />
              </div>
            </button>

            <button
              type="button"
              onClick={handleExportReceivables}
              className="p-3 rounded-xl bg-white dark:bg-slate-900 hover:bg-amber-50 dark:hover:bg-amber-950/50 border border-slate-300 dark:border-slate-700 text-left transition-all shadow-sm flex flex-col justify-between space-y-2 group"
            >
              <div className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-amber-600">
                Por Cobrar (Saldos)
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-500">
                <span>{receivables.length} filas</span>
                <Download className="w-3.5 h-3.5 text-amber-600" />
              </div>
            </button>

            <button
              type="button"
              onClick={handleExportClients}
              className="p-3 rounded-xl bg-white dark:bg-slate-900 hover:bg-blue-50 dark:hover:bg-blue-950/50 border border-slate-300 dark:border-slate-700 text-left transition-all shadow-sm flex flex-col justify-between space-y-2 group"
            >
              <div className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-blue-600">
                Directorio Clientes
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-500">
                <span>{clients.length} filas</span>
                <Download className="w-3.5 h-3.5 text-blue-600" />
              </div>
            </button>

          </div>
        </div>

        {/* Accounts Receivable Table (Cuentas por Cobrar Detalle) */}
        <div className="space-y-3">
          <div className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center justify-between">
            <span>Detalle de Saldos y Cuentas por Cobrar ({receivables.length})</span>
          </div>

          <div className="border border-slate-300 dark:border-slate-700 rounded-2xl overflow-hidden shadow-sm max-h-60 overflow-y-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold uppercase text-[10px] tracking-wider sticky top-0 border-b border-slate-300 dark:border-slate-700">
                <tr>
                  <th className="py-2.5 px-3">Cotización</th>
                  <th className="py-2.5 px-3">Cliente</th>
                  <th className="py-2.5 px-3 text-right">Total</th>
                  <th className="py-2.5 px-3 text-right">Anticipo Pagado</th>
                  <th className="py-2.5 px-3 text-right">Saldo Pendiente</th>
                  <th className="py-2.5 px-3 text-center">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {receivables.map((r, idx) => (
                  <tr key={r.id || idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <td className="py-2.5 px-3 font-mono font-bold text-slate-900 dark:text-white">
                      {r.quoteNumber}
                    </td>
                    <td className="py-2.5 px-3">
                      <div className="font-bold text-slate-900 dark:text-white">{r.clientName}</div>
                      <div className="text-[11px] text-slate-500">{r.clientPhone}</div>
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-700 dark:text-slate-300">
                      {formatCurrency(r.total, r.currency)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-emerald-700 dark:text-emerald-400 font-bold">
                      {formatCurrency(r.paid, r.currency)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-black text-amber-700 dark:text-amber-400">
                      {formatCurrency(r.balance, r.currency)}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                        Por Cobrar
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t-2 border-slate-200 dark:border-slate-800 flex justify-end">
          <button
            type="button"
            onClick={() => setIsReportsModalOpen(false)}
            className="px-5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-xs font-bold text-slate-800 dark:text-slate-300 border border-slate-300 dark:border-slate-700"
          >
            Cerrar
          </button>
        </div>

      </div>
    </div>
  );
};
