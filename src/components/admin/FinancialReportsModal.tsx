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
  CheckCircle2,
  ShieldCheck,
  FileText,
  Check
} from 'lucide-react';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { 
  calculate607Summary, 
  generate607Txt, 
  generate607Csv, 
  cleanDocNumber, 
  filterInvoicesByPeriod 
} from '../../utils/dgiiReportGenerator';

export const FinancialReportsModal: React.FC = () => {
  const { 
    isReportsModalOpen, 
    setIsReportsModalOpen, 
    quotes, 
    payments, 
    clients, 
    deals,
    invoices,
    companySettings 
  } = useAppState();

  const [reportSection, setReportSection] = useState<'dgii_607' | 'receivables'>('dgii_607');
  const [selectedPeriodYear, setSelectedPeriodYear] = useState<number>(new Date().getFullYear());
  const [selectedPeriodMonth, setSelectedPeriodMonth] = useState<number>(new Date().getMonth() + 1);
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

  // DGII 607 Metrics & Handlers
  const summary607 = calculate607Summary(invoices, selectedPeriodYear, selectedPeriodMonth);
  const periodInvoices = filterInvoicesByPeriod(invoices, selectedPeriodYear, selectedPeriodMonth);

  const handleDownload607Txt = () => {
    const txt = generate607Txt(invoices, selectedPeriodYear, selectedPeriodMonth, companySettings.rnc);
    const cleanRnc = cleanDocNumber(companySettings.rnc) || '131994451';
    const periodStr = `${selectedPeriodYear}${String(selectedPeriodMonth).padStart(2, '0')}`;
    const blob = new Blob([txt], { type: 'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `607_${cleanRnc}_${periodStr}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownload607Csv = () => {
    const csv = generate607Csv(invoices, selectedPeriodYear, selectedPeriodMonth);
    const periodStr = `${selectedPeriodYear}_${String(selectedPeriodMonth).padStart(2, '0')}`;
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Reporte_DGII_607_Martinez_Tech_${periodStr}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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

        {/* Tab Selector: DGII 607 vs Cuentas por Cobrar */}
        <div className="flex items-center gap-2 border-b-2 border-slate-200 dark:border-slate-800 pb-2">
          <button
            type="button"
            onClick={() => setReportSection('dgii_607')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${
              reportSection === 'dgii_607'
                ? 'bg-purple-600 text-white shadow-md'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            <span>🇩🇴 Formato Fiscal DGII 607 (Ventas)</span>
            <span className="px-1.5 py-0.5 rounded bg-white/20 text-[10px]">
              {periodInvoices.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setReportSection('receivables')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${
              reportSection === 'receivables'
                ? 'bg-purple-600 text-white shadow-md'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            <span>Cuentas por Cobrar</span>
            <span className="px-1.5 py-0.5 rounded bg-white/20 text-[10px]">
              {receivables.length}
            </span>
          </button>
        </div>

        {/* SECTION 1: DGII 607 Generator */}
        {reportSection === 'dgii_607' && (
          <div className="space-y-4 animate-fadeIn">
            
            {/* Period Selector & Download Actions Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-purple-50/70 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800/60 shadow-sm">
              
              <div className="flex items-center gap-2.5 flex-wrap">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-purple-600" />
                  <span>Periodo Fiscal:</span>
                </span>

                <select
                  value={selectedPeriodMonth}
                  onChange={(e) => setSelectedPeriodMonth(Number(e.target.value))}
                  className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-purple-300 dark:border-purple-700 text-xs font-bold text-slate-900 dark:text-white focus:outline-none"
                >
                  <option value={1}>01 - Enero</option>
                  <option value={2}>02 - Febrero</option>
                  <option value={3}>03 - Marzo</option>
                  <option value={4}>04 - Abril</option>
                  <option value={5}>05 - Mayo</option>
                  <option value={6}>06 - Junio</option>
                  <option value={7}>07 - Julio</option>
                  <option value={8}>08 - Agosto</option>
                  <option value={9}>09 - Septiembre</option>
                  <option value={10}>10 - Octubre</option>
                  <option value={11}>11 - Noviembre</option>
                  <option value={12}>12 - Diciembre</option>
                </select>

                <select
                  value={selectedPeriodYear}
                  onChange={(e) => setSelectedPeriodYear(Number(e.target.value))}
                  className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-purple-300 dark:border-purple-700 text-xs font-bold text-slate-900 dark:text-white focus:outline-none"
                >
                  <option value={2025}>2025</option>
                  <option value={2026}>2026</option>
                  <option value={2027}>2027</option>
                </select>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={handleDownload607Csv}
                  disabled={periodInvoices.length === 0}
                  className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 hover:bg-slate-100 text-slate-800 dark:text-slate-200 text-xs font-bold border border-slate-300 dark:border-slate-700 shadow-xs flex items-center gap-1.5 disabled:opacity-40"
                >
                  <Download className="w-3.5 h-3.5 text-slate-500" />
                  <span>Excel 607</span>
                </button>

                <button
                  type="button"
                  onClick={handleDownload607Txt}
                  disabled={periodInvoices.length === 0}
                  className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-black shadow-md flex items-center gap-1.5 disabled:opacity-40"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Descargar TXT para DGII (|)</span>
                </button>
              </div>

            </div>

            {/* DGII Period KPI Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 shadow-xs">
                <div className="text-[10px] uppercase font-bold text-slate-500">Facturas en Periodo</div>
                <div className="text-lg font-black font-mono text-slate-900 dark:text-white mt-0.5">
                  {summary607.totalRecords}
                </div>
                <div className="text-[10px] text-slate-400">
                  {summary607.b01Count} B01 | {summary607.b02Count} B02
                </div>
              </div>

              <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 shadow-xs">
                <div className="text-[10px] uppercase font-bold text-slate-500">Monto Neto Facturado</div>
                <div className="text-lg font-black font-mono text-purple-700 dark:text-purple-400 mt-0.5">
                  {formatCurrency(summary607.totalTaxableAmount, 'DOP')}
                </div>
                <div className="text-[10px] text-slate-400">Base imponible</div>
              </div>

              <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 shadow-xs">
                <div className="text-[10px] uppercase font-bold text-slate-500">ITBIS Facturado (18%)</div>
                <div className="text-lg font-black font-mono text-emerald-600 dark:text-emerald-400 mt-0.5">
                  {formatCurrency(summary607.totalTaxAmount, 'DOP')}
                </div>
                <div className="text-[10px] text-slate-400">Impuesto liquidado</div>
              </div>

              <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 shadow-xs">
                <div className="text-[10px] uppercase font-bold text-slate-500">Total Facturado Bruto</div>
                <div className="text-lg font-black font-mono text-brand-teal-600 dark:text-brand-teal-400 mt-0.5">
                  {formatCurrency(summary607.totalInvoicedAmount, 'DOP')}
                </div>
                <div className="text-[10px] text-slate-400">Ventas totales DOP</div>
              </div>
            </div>

            {/* Validation Banner */}
            {summary607.issues.length === 0 ? (
              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-600/40 text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>
                  <strong>Validación DGII Exitosa:</strong> Todas las facturas de este periodo cumplen la estructura requerida (NCF válidos, RNC/Cédulas presentes y montos exactos). Listo para carga en la Oficina Virtual.
                </span>
              </div>
            ) : (
              <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-600/40 space-y-1.5 text-xs text-amber-900 dark:text-amber-200">
                <div className="font-bold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Se detectaron inconsistencias que pueden ser rechazadas por la DGII:</span>
                </div>
                <ul className="list-disc pl-5 space-y-0.5 text-[11px]">
                  {summary607.issues.map((iss, i) => (
                    <li key={i}>
                      <strong>Factura {iss.invoiceNumber} ({iss.ncf}):</strong> {iss.message}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* DGII Period Invoices Table */}
            <div className="border border-slate-300 dark:border-slate-700 rounded-2xl overflow-hidden shadow-sm max-h-60 overflow-y-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold uppercase text-[10px] tracking-wider sticky top-0 border-b border-slate-300 dark:border-slate-700">
                  <tr>
                    <th className="py-2.5 px-3">NCF</th>
                    <th className="py-2.5 px-3">RNC / Cédula</th>
                    <th className="py-2.5 px-3">Cliente</th>
                    <th className="py-2.5 px-3">Fecha</th>
                    <th className="py-2.5 px-3 text-right">Neto Facturado</th>
                    <th className="py-2.5 px-3 text-right">ITBIS (18%)</th>
                    <th className="py-2.5 px-3 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  {periodInvoices.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-400">
                        No hay facturas emitidas en el periodo {selectedPeriodMonth}/{selectedPeriodYear}.
                      </td>
                    </tr>
                  ) : (
                    periodInvoices.map((inv) => (
                      <tr key={inv.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                        <td className="py-2 px-3 font-mono font-bold text-slate-900 dark:text-white">
                          {inv.ncf}
                        </td>
                        <td className="py-2 px-3 font-mono text-[11px] text-slate-600 dark:text-slate-400">
                          {inv.clientRnc || '—'}
                        </td>
                        <td className="py-2 px-3">
                          <div className="font-bold text-slate-900 dark:text-white truncate max-w-[180px]">{inv.clientName}</div>
                        </td>
                        <td className="py-2 px-3 text-slate-500 whitespace-nowrap text-[11px]">
                          {inv.date}
                        </td>
                        <td className="py-2 px-3 text-right font-mono text-slate-700 dark:text-slate-300">
                          {formatCurrency(inv.subtotal || 0, 'DOP')}
                        </td>
                        <td className="py-2 px-3 text-right font-mono text-emerald-600 dark:text-emerald-400 font-medium">
                          {formatCurrency(inv.taxAmount || 0, 'DOP')}
                        </td>
                        <td className="py-2 px-3 text-right font-mono font-bold text-slate-900 dark:text-white">
                          {formatCurrency(inv.total || 0, 'DOP')}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

          </div>
        )}

        {/* SECTION 2: Accounts Receivable Table */}
        {reportSection === 'receivables' && (
          <div className="space-y-3 animate-fadeIn">
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
        )}

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
