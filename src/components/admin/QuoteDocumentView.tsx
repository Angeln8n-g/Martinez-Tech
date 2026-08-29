import React, { useRef, useState } from 'react';
import { useAppState } from '../../context/AppStateContext';
import { Quote } from '../../types';
import { BrandLogo } from '../ui/BrandLogo';
import { SignaturePad } from '../ui/SignaturePad';
import { 
  Printer, 
  Download, 
  MessageCircle, 
  Edit, 
  X, 
  ShieldCheck, 
  Calendar,
  CreditCard,
  FileCheck,
  DollarSign,
  PenTool,
  CheckCircle2,
  Lock
} from 'lucide-react';
import { formatCurrency, formatDate, generateQuoteWhatsAppText, createWhatsAppUrl } from '../../utils/formatters';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export const QuoteDocumentView: React.FC = () => {
  const { 
    activeQuoteForView, 
    setActiveQuoteForView, 
    companySettings, 
    setActiveQuoteForEdit, 
    setIsQuoteModalOpen,
    openPaymentForQuote,
    signQuote,
    openWhatsAppTemplates
  } = useAppState();

  const printRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);
  const [isSigningOpen, setIsSigningOpen] = useState(false);

  if (!activeQuoteForView) return null;

  const quote = activeQuoteForView;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = async () => {
    if (!printRef.current) return;
    setDownloading(true);
    try {
      const element = printRef.current;
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const imgWidth = 210; // A4 width in mm
      const pageHeight = 297; // A4 height in mm
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

      pdf.save(`Cotizacion_${quote.quoteNumber}_${quote.clientName.replace(/\s+/g, '_')}.pdf`);
    } catch (err) {
      console.error('Error generating PDF', err);
      alert('Hubo un inconveniente al generar el PDF. Puedes utilizar la opción "Imprimir / Guardar como PDF".');
    } finally {
      setDownloading(false);
    }
  };

  const handleSendWhatsApp = () => {
    if (openWhatsAppTemplates) {
      openWhatsAppTemplates('quote', {
        clientName: quote.clientName,
        clientPhone: quote.clientPhone,
        quoteNumber: quote.quoteNumber,
        total: quote.total,
        currency: quote.currency,
        date: quote.date
      });
    } else {
      const text = generateQuoteWhatsAppText(quote, companySettings);
      window.open(createWhatsAppUrl(quote.clientPhone, text), '_blank');
    }
  };

  const handleSaveSignature = async (signatureDataUrl: string) => {
    await signQuote(quote.id, signatureDataUrl, quote.clientName);
    setIsSigningOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/90 backdrop-blur-md animate-fadeIn overflow-y-auto">
      <div className="max-w-4xl w-full my-auto space-y-4">
        
        {/* Floating Top Control Toolbar (Hidden in Print) */}
        <div className="no-print bg-slate-900 border border-slate-700/80 rounded-2xl p-3 sm:p-4 flex flex-wrap items-center justify-between gap-3 shadow-2xl">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-lg bg-purple-950 text-purple-300 font-mono font-bold text-xs border border-purple-500/30">
              {quote.quoteNumber}
            </span>
            <span className="text-xs text-slate-400 font-medium">
              Cliente: <strong className="text-white">{quote.clientName}</strong>
            </span>
            {quote.clientSignature && (
              <span className="px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 text-[11px] font-bold border border-emerald-500/40 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                <span>Aprobada & Firmada</span>
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {!quote.clientSignature && (
              <button
                onClick={() => setIsSigningOpen(true)}
                className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-brand-teal-500 to-brand-green-500 hover:from-brand-teal-400 hover:to-brand-green-400 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-md border border-brand-teal-600/30"
              >
                <PenTool className="w-4 h-4" />
                <span>Firmar y Aprobar</span>
              </button>
            )}

            <button
              onClick={() => openPaymentForQuote(quote)}
              className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md"
            >
              <DollarSign className="w-4 h-4" />
              <span>Registrar Pago / Cobro</span>
            </button>

            <button
              onClick={handleSendWhatsApp}
              className="px-3 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-md"
            >
              <MessageCircle className="w-4 h-4" />
              <span>WhatsApp</span>
            </button>

            <button
              onClick={handlePrint}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center gap-1.5 border border-slate-700"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimir</span>
            </button>

            <button
              onClick={handleDownloadPDF}
              disabled={downloading}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center gap-1.5 border border-slate-700 disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              <span>{downloading ? 'Generando...' : 'Descargar PDF'}</span>
            </button>

            <button
              onClick={() => {
                setActiveQuoteForEdit(quote);
                setActiveQuoteForView(null);
                setIsQuoteModalOpen(true);
              }}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-bold text-xs flex items-center gap-1 border border-slate-700"
            >
              <Edit className="w-4 h-4" />
              <span>Editar</span>
            </button>

            <button
              onClick={() => setActiveQuoteForView(null)}
              className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal for In-Screen Digital Signature */}
        {isSigningOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
            <div className="max-w-lg w-full">
              <SignaturePad
                signerName={quote.clientName}
                title={`Firma Digital de Aceptación (${quote.quoteNumber})`}
                onSave={handleSaveSignature}
                onCancel={() => setIsSigningOpen(false)}
              />
            </div>
          </div>
        )}

        {/* Printable Document Sheet (Letterhead / Membrete Oficial) */}
        <div className="printable-container overflow-x-auto rounded-2xl shadow-2xl">
          <div 
            ref={printRef}
            className="w-full bg-white text-slate-900 p-8 sm:p-12 space-y-8 min-h-[1050px] flex flex-col justify-between"
            style={{ width: '100%', maxWidth: '850px', margin: '0 auto' }}
          >
            
            {/* Document Header */}
            <div className="space-y-6">
              
              <div className="flex items-start justify-between border-b-2 border-slate-800 pb-6">
                <div>
                  <BrandLogo size="lg" />
                  <p className="text-xs text-slate-600 mt-2 font-medium tracking-wide">
                    {companySettings.slogan}
                  </p>
                  <div className="text-[11px] text-slate-500 mt-1 space-y-0.5">
                    <div>RNC: <strong className="text-slate-800">{companySettings.rnc}</strong></div>
                    <div>Tel: {companySettings.phone} · WhatsApp: {companySettings.whatsapp}</div>
                    <div>{companySettings.address}, {companySettings.city}</div>
                    <div>{companySettings.email}</div>
                  </div>
                </div>

                <div className="text-right space-y-1">
                  <div className="inline-block px-3 py-1 bg-slate-900 text-white font-mono font-bold text-xs uppercase tracking-wider rounded">
                    Presupuesto Formal
                  </div>
                  <div className="text-2xl font-black text-slate-900 font-mono tracking-tight">
                    {quote.quoteNumber}
                  </div>
                  <div className="text-xs text-slate-500">
                    Fecha de Emisión: <strong>{formatDate(quote.date)}</strong>
                  </div>
                  <div className="text-xs text-slate-500">
                    Válido Hasta: <strong className="text-rose-600">{formatDate(quote.validUntil)}</strong>
                  </div>
                </div>
              </div>

              {/* Client Info Strip */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                    Cliente / Destinatario:
                  </div>
                  <div className="text-sm font-black text-slate-900">{quote.clientName}</div>
                  {quote.clientCompany && (
                    <div className="font-semibold text-slate-700">{quote.clientCompany}</div>
                  )}
                  {quote.clientRnc && (
                    <div className="text-slate-600">RNC/Cédula: {quote.clientRnc}</div>
                  )}
                </div>

                <div className="sm:text-right space-y-0.5">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                    Contacto & Ubicación:
                  </div>
                  {quote.clientPhone && <div className="text-slate-700">Tel: {quote.clientPhone}</div>}
                  {quote.clientEmail && <div className="text-slate-700">{quote.clientEmail}</div>}
                  {quote.clientAddress && (
                    <div className="text-slate-600 font-medium">Lugar: {quote.clientAddress}</div>
                  )}
                </div>
              </div>

              {/* Items Table */}
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-900 text-white font-bold uppercase text-[10px] tracking-wider">
                      <th className="py-2.5 px-3 text-center w-12">#</th>
                      <th className="py-2.5 px-3">Descripción de Equipos y Servicios</th>
                      <th className="py-2.5 px-3 text-center w-16">Cant.</th>
                      <th className="py-2.5 px-3 text-right w-28">Precio Unit.</th>
                      <th className="py-2.5 px-3 text-right w-32">Total ({quote.currency})</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {quote.items.map((item, idx) => (
                      <tr key={item.id || idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/60'}>
                        <td className="py-3 px-3 text-center font-mono font-bold text-slate-400">
                          {idx + 1}
                        </td>
                        <td className="py-3 px-3">
                          <div className="font-bold text-slate-900">{item.name}</div>
                          {item.description && (
                            <div className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                              {item.description}
                            </div>
                          )}
                        </td>
                        <td className="py-3 px-3 text-center font-bold font-mono">
                          {item.quantity}
                        </td>
                        <td className="py-3 px-3 text-right font-mono text-slate-700">
                          {formatCurrency(item.unitPrice, quote.currency)}
                        </td>
                        <td className="py-3 px-3 text-right font-mono font-bold text-slate-900">
                          {formatCurrency(item.total, quote.currency)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Financial Breakdown & Terms Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 items-start">
                
                {/* Commercial Terms (7 cols) */}
                <div className="sm:col-span-7 space-y-3 text-xs text-slate-600">
                  <div className="font-bold text-slate-900 uppercase text-[11px] tracking-wider border-b border-slate-200 pb-1">
                    Términos y Condiciones del Servicio
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-start gap-2">
                      <ShieldCheck className="w-4 h-4 text-[#6ab329] flex-shrink-0 mt-0.5" />
                      <span><strong>Garantía:</strong> {quote.warrantyNotes || companySettings.defaultWarranty}</span>
                    </div>

                    <div className="flex items-start gap-2">
                      <Calendar className="w-4 h-4 text-[#00a896] flex-shrink-0 mt-0.5" />
                      <span><strong>Tiempo de Entrega / Instalación:</strong> {quote.deliveryTime}</span>
                    </div>

                    <div className="flex items-start gap-2">
                      <FileCheck className="w-4 h-4 text-slate-500 flex-shrink-0 mt-0.5" />
                      <span><strong>Forma de Pago:</strong> {quote.paymentTerms || companySettings.defaultTerms}</span>
                    </div>
                  </div>

                  {/* Bank Accounts */}
                  <div className="pt-2">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                      Cuentas Bancarias para Transferencias:
                    </div>
                    <div className="grid grid-cols-1 gap-1 text-[11px] bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                      {companySettings.bankAccounts.map((acc, i) => (
                        <div key={i} className="text-slate-700">
                          <strong>{acc.bank}:</strong> #{acc.accountNumber} ({acc.accountType})
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Totals Summary Box (5 cols) */}
                <div className="sm:col-span-5 bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2 text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span>Subtotal:</span>
                    <span className="font-mono font-bold text-slate-900">{formatCurrency(quote.subtotal, quote.currency)}</span>
                  </div>

                  {quote.discountAmount > 0 && (
                    <div className="flex justify-between text-amber-700">
                      <span>Descuento ({quote.discountPercent}%):</span>
                      <span className="font-mono font-bold">-{formatCurrency(quote.discountAmount, quote.currency)}</span>
                    </div>
                  )}

                  {quote.applyTax && (
                    <div className="flex justify-between text-slate-600">
                      <span>ITBIS ({quote.taxPercent}%):</span>
                      <span className="font-mono font-bold text-slate-900">+{formatCurrency(quote.taxAmount, quote.currency)}</span>
                    </div>
                  )}

                  <div className="pt-3 border-t-2 border-slate-300 flex items-baseline justify-between">
                    <span className="text-sm font-black text-slate-900 uppercase">Total Final:</span>
                    <span className="text-xl font-black font-mono text-[#00a896]">
                      {formatCurrency(quote.total, quote.currency)}
                    </span>
                  </div>
                </div>

              </div>

            </div>

            {/* Signatures & Verification Block */}
            <div className="pt-8 border-t-2 border-slate-200 grid grid-cols-2 gap-8 text-center text-xs">
              <div className="space-y-2">
                <div className="h-16 flex items-end justify-center pb-1">
                  <div className="border-b border-slate-400 w-48 mx-auto" />
                </div>
                <div className="font-bold text-slate-900">Por Martínez Tech</div>
                <div className="text-[11px] text-slate-500">Firma y Sello Autorizado</div>
              </div>

              <div className="space-y-2">
                <div className="h-16 flex items-center justify-center">
                  {quote.clientSignature ? (
                    <div className="space-y-1">
                      <img
                        src={quote.clientSignature}
                        alt="Firma del cliente"
                        className="max-h-12 max-w-[180px] mx-auto object-contain"
                      />
                      <div className="text-[10px] font-bold text-emerald-700 flex items-center justify-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        <span>Firmado: {quote.signedAt ? formatDate(quote.signedAt) : 'Conforme'}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="border-b border-slate-400 w-48 mx-auto pt-8">
                      <span className="text-[10px] text-slate-400 italic">Pendiente de firma</span>
                    </div>
                  )}
                </div>
                <div className="font-bold text-slate-900">{quote.signedBy || quote.clientName}</div>
                <div className="text-[11px] text-slate-500">Aceptado Conforme / Firma Cliente</div>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};
