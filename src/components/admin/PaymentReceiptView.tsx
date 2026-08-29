import React, { useRef } from 'react';
import { useAppState } from '../../context/AppStateContext';
import { BrandLogo } from '../ui/BrandLogo';
import { 
  X, 
  Printer, 
  Download, 
  MessageCircle, 
  CheckCircle2, 
  Building, 
  Calendar, 
  CreditCard 
} from 'lucide-react';
import { formatCurrency, formatDate, createWhatsAppUrl } from '../../utils/formatters';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export const PaymentReceiptView: React.FC = () => {
  const { activeReceiptForView, setActiveReceiptForView, companySettings } = useAppState();
  const printRef = useRef<HTMLDivElement>(null);

  if (!activeReceiptForView) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = async () => {
    if (!printRef.current) return;
    try {
      const canvas = await html2canvas(printRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff'
      });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210;
      const pageHeight = 295;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`Recibo_Pago_${activeReceiptForView.receiptNumber}.pdf`);
    } catch (err) {
      console.error('Error generating PDF:', err);
      window.print();
    }
  };

  const handleWhatsApp = () => {
    let msg = `🧾 *COMPROBANTE OFICIAL DE PAGO - ${companySettings.name}*\n`;
    msg += `-------------------------------------------\n`;
    msg += `*Recibo N°:* ${activeReceiptForView.receiptNumber}\n`;
    msg += `*Fecha:* ${formatDate(activeReceiptForView.date)}\n`;
    msg += `*Cliente:* ${activeReceiptForView.clientName}\n`;
    msg += `*Monto Recibido:* ${formatCurrency(activeReceiptForView.amount, activeReceiptForView.currency)}\n`;
    msg += `*Método de Pago:* ${activeReceiptForView.paymentMethod.toUpperCase()}\n`;
    if (activeReceiptForView.referenceNumber) msg += `*Referencia / Transf:* ${activeReceiptForView.referenceNumber}\n`;
    msg += `*Concepto:* ${activeReceiptForView.concept}\n`;
    if (activeReceiptForView.quoteNumber) msg += `*Presupuesto Asociado:* ${activeReceiptForView.quoteNumber}\n`;
    msg += `-------------------------------------------\n`;
    msg += `_¡Gracias por su pago y confianza en Martínez Tech!_`;

    window.open(createWhatsAppUrl(activeReceiptForView.clientPhone || companySettings.whatsapp, msg), '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto animate-fadeIn">
      
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-3xl w-full p-4 sm:p-6 my-auto shadow-2xl space-y-4">
        
        {/* Action Header Bar (Excluded from Print) */}
        <div className="flex flex-wrap items-center justify-between gap-3 no-print bg-slate-800/90 p-3 rounded-xl border border-slate-700">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-bold text-white uppercase tracking-wider">
              Recibo Oficial #{activeReceiptForView.receiptNumber}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-semibold"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimir</span>
            </button>

            <button
              onClick={handleDownloadPDF}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-teal-600 hover:bg-brand-teal-500 text-white text-xs font-bold shadow-sm"
            >
              <Download className="w-4 h-4" />
              <span>Descargar PDF</span>
            </button>

            <button
              onClick={handleWhatsApp}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-sm"
            >
              <MessageCircle className="w-4 h-4" />
              <span>WhatsApp</span>
            </button>

            <button
              onClick={() => setActiveReceiptForView(null)}
              className="p-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-300 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Receipt Paper */}
        <div 
          ref={printRef}
          className="print-page bg-white text-slate-900 p-8 sm:p-10 rounded-xl shadow-lg border border-slate-200 space-y-6"
        >
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 border-b-2 border-emerald-600 pb-6">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-black text-slate-950 tracking-tight">MARTÍNEZ TECH</span>
              </div>
              <p className="text-xs font-bold text-emerald-700 tracking-wide uppercase mt-0.5">
                Soluciones · Servicios · Calidad
              </p>
              <div className="text-[11px] text-slate-600 space-y-0.5 mt-2">
                <p>{companySettings.legalName}</p>
                <p>RNC: {companySettings.rnc}</p>
                <p>{companySettings.address}, {companySettings.city}</p>
                <p>Tel: {companySettings.phone} · {companySettings.email}</p>
              </div>
            </div>

            <div className="sm:text-right bg-emerald-50 border border-emerald-200 p-4 rounded-xl">
              <span className="text-xs font-black text-emerald-800 uppercase tracking-widest block">
                RECIBO DE INGRESO
              </span>
              <div className="text-2xl font-black text-slate-950 font-mono mt-1">
                {activeReceiptForView.receiptNumber}
              </div>
              <div className="text-xs text-slate-600 mt-1">
                Fecha: <strong className="text-slate-900">{formatDate(activeReceiptForView.date)}</strong>
              </div>
              {activeReceiptForView.quoteNumber && (
                <div className="text-[11px] text-emerald-700 font-semibold mt-1">
                  Cotización: {activeReceiptForView.quoteNumber}
                </div>
              )}
            </div>
          </div>

          {/* Amount Callout Strip */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-600 to-brand-green-600 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-100">
                Monto Recibido
              </span>
              <div className="text-3xl sm:text-4xl font-black font-mono">
                {formatCurrency(activeReceiptForView.amount, activeReceiptForView.currency)}
              </div>
            </div>
            <div className="flex items-center gap-2 bg-white/20 px-3 py-1.5 rounded-lg text-xs font-bold backdrop-blur-sm">
              <CheckCircle2 className="w-4 h-4 text-emerald-200" />
              <span className="uppercase">{activeReceiptForView.paymentMethod}</span>
              {activeReceiptForView.bankName && <span>· {activeReceiptForView.bankName}</span>}
            </div>
          </div>

          {/* Payer & Concept Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs">
            <div className="space-y-1">
              <span className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">Recibido de:</span>
              <div className="text-sm font-bold text-slate-950">{activeReceiptForView.clientName}</div>
              {activeReceiptForView.clientPhone && (
                <div className="text-slate-600">Tel: {activeReceiptForView.clientPhone}</div>
              )}
            </div>

            <div className="space-y-1">
              <span className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">Detalle del Pago:</span>
              {activeReceiptForView.referenceNumber && (
                <div>Referencia: <span className="font-mono font-bold text-slate-900">{activeReceiptForView.referenceNumber}</span></div>
              )}
              <div>Emitido por: <span className="font-semibold text-slate-800">{activeReceiptForView.createdBy}</span></div>
            </div>
          </div>

          <div className="space-y-1.5">
            <span className="font-bold text-slate-700 uppercase tracking-wider text-[11px]">Por Concepto de:</span>
            <p className="text-xs font-medium text-slate-800 bg-white p-3 rounded-lg border border-slate-200 leading-relaxed">
              {activeReceiptForView.concept}
            </p>
          </div>

          {activeReceiptForView.notes && (
            <div className="text-xs text-slate-500 italic">
              Nota: {activeReceiptForView.notes}
            </div>
          )}

          {/* Signatures */}
          <div className="pt-10 grid grid-cols-2 gap-10 text-center text-xs text-slate-600">
            <div className="space-y-2">
              <div className="border-t border-slate-400 w-40 mx-auto pt-1"></div>
              <p className="font-bold text-slate-900">Entregado por (Cliente)</p>
            </div>
            <div className="space-y-2">
              <div className="border-t border-slate-400 w-40 mx-auto pt-1"></div>
              <p className="font-bold text-slate-900">Recibido por (Martínez Tech)</p>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
