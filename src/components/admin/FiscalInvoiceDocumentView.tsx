import React from 'react';
import { useAppState } from '../../context/AppStateContext';
import { 
  X, 
  Printer, 
  Download, 
  MessageCircle, 
  Building2, 
  Phone, 
  Mail, 
  Globe, 
  MapPin, 
  ShieldCheck, 
  CheckCircle2,
  Calendar,
  DollarSign
} from 'lucide-react';
import { BrandLogo } from '../ui/BrandLogo';
import { formatCurrency, formatDate } from '../../utils/formatters';

export const FiscalInvoiceDocumentView: React.FC = () => {
  const { 
    activeInvoiceForView, 
    setActiveInvoiceForView, 
    companySettings,
    openWhatsAppTemplates
  } = useAppState();

  if (!activeInvoiceForView) return null;

  const inv = activeInvoiceForView;

  const handlePrint = () => {
    window.print();
  };

  const handleShareWhatsApp = () => {
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

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-md p-4 sm:p-6 flex justify-center items-start animate-fadeIn">
      
      {/* Container A4 / Letter */}
      <div className="bg-white text-slate-900 rounded-3xl max-w-4xl w-full shadow-2xl overflow-hidden my-4 border border-slate-200">
        
        {/* Action Header Bar (Hidden in Print) */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between flex-wrap gap-3 print:hidden">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-mono font-bold">
              {inv.ncf}
            </span>
            <span className="text-xs text-slate-300">
              {inv.ncfTypeName} · {inv.invoiceNumber}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleShareWhatsApp}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-sm transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Enviar WhatsApp</span>
            </button>

            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-brand-teal-600 hover:bg-brand-teal-500 text-white font-bold text-xs shadow-sm transition-colors"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimir / Guardar PDF</span>
            </button>

            <button
              onClick={() => setActiveInvoiceForView(null)}
              className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Document Sheet */}
        <div className="p-8 sm:p-12 space-y-8 bg-white text-slate-900 text-xs print:p-0">
          
          {/* Top Row: Brand & DGII Fiscal Badge */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-6 border-b border-slate-200 pb-8">
            
            {/* Issuer Information */}
            <div className="space-y-2 max-w-md">
              <BrandLogo size="md" />
              <div className="font-bold text-slate-900 text-sm">
                {companySettings.legalName || 'Martínez Tech Soluciones & Servicios S.R.L.'}
              </div>
              <div className="space-y-1 text-slate-600 text-[11px] leading-relaxed">
                <div className="flex items-center gap-1.5 font-bold text-slate-900">
                  <ShieldCheck className="w-3.5 h-3.5 text-brand-teal-600 flex-shrink-0" />
                  <span>RNC Emisor: {companySettings.rnc || '132-45892-1'}</span>
                </div>
                <div className="flex items-start gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0 mt-0.5" />
                  <span>{companySettings.address}, {companySettings.city}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                  <span>{companySettings.phone} · WhatsApp: {companySettings.whatsapp}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                  <span>{companySettings.email}</span>
                </div>
              </div>
            </div>

            {/* Fiscal NCF Box */}
            <div className="w-full sm:w-80 rounded-2xl border-2 border-slate-900 p-4 bg-slate-50 space-y-2.5">
              <div className="text-center pb-2 border-b border-slate-300">
                <div className="text-[10px] uppercase tracking-wider font-extrabold text-slate-600">
                  Comprobante Fiscal Autorizado por DGII
                </div>
                <div className="text-xs font-black text-slate-900 uppercase">
                  {inv.ncfTypeName}
                </div>
              </div>

              <div className="space-y-1.5 text-[11px]">
                <div className="flex justify-between items-center bg-white p-2 rounded-lg border border-slate-200 shadow-sm">
                  <span className="font-bold text-slate-600">e-NCF / NCF:</span>
                  <span className="font-mono font-black text-rose-600 text-sm">{inv.ncf}</span>
                </div>

                <div className="flex justify-between text-slate-700">
                  <span className="font-semibold">No. Factura:</span>
                  <span className="font-mono font-bold text-slate-900">{inv.invoiceNumber}</span>
                </div>

                <div className="flex justify-between text-slate-700">
                  <span className="font-semibold">Fecha Emisión:</span>
                  <span className="font-mono font-medium">{formatDate(inv.date)}</span>
                </div>

                <div className="flex justify-between text-slate-700">
                  <span className="font-semibold">Válida Hasta:</span>
                  <span className="font-mono font-bold text-slate-900">{formatDate(inv.ncfExpiryDate)}</span>
                </div>

                <div className="flex justify-between text-slate-700 border-t border-slate-200 pt-1">
                  <span className="font-semibold">Vencimiento Pago:</span>
                  <span className="font-mono font-bold text-amber-700">{formatDate(inv.dueDate)}</span>
                </div>
              </div>
            </div>

          </div>

          {/* Client Fiscal Data Box */}
          <div className="rounded-2xl border border-slate-200 p-5 bg-slate-50/70 space-y-2">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Datos del Cliente / Adquiriente de Bienes o Servicios
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-slate-500">Razón Social / Nombre:</span>
                <div className="font-black text-slate-900 text-sm mt-0.5">{inv.clientName}</div>
              </div>

              <div>
                <span className="text-slate-500">RNC o Cédula del Cliente:</span>
                <div className="font-mono font-bold text-slate-900 mt-0.5">
                  {inv.clientRnc || 'N/A (Consumo Final)'}
                </div>
              </div>

              {inv.clientAddress && (
                <div>
                  <span className="text-slate-500">Dirección Fiscal:</span>
                  <div className="font-medium text-slate-800 mt-0.5">{inv.clientAddress}</div>
                </div>
              )}

              {inv.clientPhone && (
                <div>
                  <span className="text-slate-500">Teléfono:</span>
                  <div className="font-medium text-slate-800 mt-0.5">{inv.clientPhone}</div>
                </div>
              )}
            </div>
          </div>

          {/* Itemized Table */}
          <div className="border border-slate-300 rounded-2xl overflow-hidden">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-900 text-white font-bold">
                <tr>
                  <th className="p-3 text-center w-12">#</th>
                  <th className="p-3 text-center w-16">Cant.</th>
                  <th className="p-3">Descripción del Producto / Servicio</th>
                  <th className="p-3 text-right w-28">Precio Unit.</th>
                  <th className="p-3 text-center w-24">ITBIS (18%)</th>
                  <th className="p-3 text-right w-28">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {inv.items.map((item, idx) => (
                  <tr key={item.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}>
                    <td className="p-3 text-center text-slate-400 font-mono text-[11px]">{idx + 1}</td>
                    <td className="p-3 text-center font-mono font-bold text-slate-800">{item.quantity}</td>
                    <td className="p-3 font-medium text-slate-900 leading-snug">{item.description}</td>
                    <td className="p-3 text-right font-mono text-slate-700">{formatCurrency(item.unitPrice, inv.currency)}</td>
                    <td className="p-3 text-center font-mono text-slate-600 text-[11px]">{formatCurrency(item.taxAmount, inv.currency)}</td>
                    <td className="p-3 text-right font-mono font-bold text-slate-900">{formatCurrency(item.total, inv.currency)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Breakdown & Payment Details */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 pt-2">
            
            {/* Payment Method & Bank Accounts (7 cols) */}
            <div className="sm:col-span-7 space-y-4">
              
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  Forma de Pago & Cuentas Bancarias para Depósito
                </div>
                <div className="text-xs font-semibold text-slate-800 capitalize">
                  Método Acordado: <span className="font-bold">{inv.paymentMethod}</span>
                </div>

                <div className="space-y-1.5 pt-1 text-[11px] text-slate-600">
                  {companySettings.bankAccounts.map((acc, i) => (
                    <div key={i} className="flex justify-between items-center py-1 border-b border-slate-200 last:border-0">
                      <span className="font-bold text-slate-800">{acc.bank}:</span>
                      <span className="font-mono font-semibold">{acc.accountNumber} ({acc.accountType})</span>
                    </div>
                  ))}
                </div>
              </div>

              {inv.notes && (
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-[11px] text-amber-900">
                  <span className="font-bold">Observaciones: </span>
                  <span>{inv.notes}</span>
                </div>
              )}
            </div>

            {/* Total Financial Summary (5 cols) */}
            <div className="sm:col-span-5 rounded-2xl border-2 border-slate-900 p-5 bg-white space-y-2.5">
              <div className="flex justify-between text-slate-600 text-xs">
                <span>Subtotal Gravado:</span>
                <span className="font-mono font-semibold">{formatCurrency(inv.subtotal, inv.currency)}</span>
              </div>

              {inv.discountPercent > 0 && (
                <div className="flex justify-between text-emerald-600 text-xs">
                  <span>Descuento ({inv.discountPercent}%):</span>
                  <span className="font-mono">-{formatCurrency(inv.discountAmount, inv.currency)}</span>
                </div>
              )}

              <div className="flex justify-between text-slate-700 text-xs font-bold">
                <span>ITBIS Liquidado (18%):</span>
                <span className="font-mono text-slate-900">+{formatCurrency(inv.taxAmount, inv.currency)}</span>
              </div>

              <div className="flex justify-between items-center text-sm font-black text-slate-900 border-t-2 border-slate-900 pt-3">
                <span>TOTAL FACTURA:</span>
                <span className="font-mono text-base text-emerald-700">
                  {formatCurrency(inv.total, inv.currency)}
                </span>
              </div>

              <div className="flex justify-between text-xs border-t border-dashed border-slate-300 pt-2 text-slate-600">
                <span>Monto Pagado / Anticipo:</span>
                <span className="font-mono font-semibold text-emerald-600">{formatCurrency(inv.amountPaid, inv.currency)}</span>
              </div>

              <div className="flex justify-between text-xs font-bold border-t border-slate-200 pt-1.5">
                <span className="text-slate-800">Balance Pendiente:</span>
                <span className={`font-mono ${inv.balanceDue > 0 ? 'text-amber-700' : 'text-emerald-700'}`}>
                  {formatCurrency(inv.balanceDue, inv.currency)}
                </span>
              </div>
            </div>

          </div>

          {/* Legal Footer & Stamp */}
          <div className="border-t border-slate-200 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-[10px] text-slate-500 text-center sm:text-left">
            <div className="space-y-1 max-w-md">
              <p className="font-semibold text-slate-700">
                Factura Válida para Crédito Fiscal según Decreto No. 254-06 de la Dirección General de Impuestos Internos (DGII).
              </p>
              <p>
                Esta factura constituye título ejecutorio de cobro conforme a las disposiciones del Código Tributario Dominicano.
              </p>
            </div>

            <div className="p-3 rounded-xl border border-slate-300 text-center font-mono font-bold text-slate-800 text-[11px] bg-slate-50">
              <div className="text-[9px] uppercase tracking-widest text-slate-500">Comprobante Autorizado</div>
              <div className="text-brand-teal-700">{inv.ncf}</div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
