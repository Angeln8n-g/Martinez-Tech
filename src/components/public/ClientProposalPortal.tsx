import React, { useState, useRef, useEffect } from 'react';
import { useAppState } from '../../context/AppStateContext';
import { Quote } from '../../types';
import { BrandLogo } from '../ui/BrandLogo';
import { SignaturePad } from '../ui/SignaturePad';
import { 
  ShieldCheck, 
  Download, 
  MessageCircle, 
  CheckCircle2, 
  Copy, 
  Check, 
  Building2, 
  Calendar, 
  Clock, 
  Wrench, 
  FileText, 
  CreditCard,
  Phone,
  Mail,
  MapPin,
  Lock,
  ExternalLink,
  Loader2
} from 'lucide-react';
import { formatCurrency, formatDate, createWhatsAppUrl } from '../../utils/formatters';
import { uploadSignature } from '../../services/supabase';
import confetti from 'canvas-confetti';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { useToast } from '../ui/ToastNotification';

interface ClientProposalPortalProps {
  quoteIdentifier: string; // quoteNumber (e.g. COT-2026-001) or id (e.g. quote-1)
  onBackToHome?: () => void;
}

export const ClientProposalPortal: React.FC<ClientProposalPortalProps> = ({ 
  quoteIdentifier, 
  onBackToHome 
}) => {
  const { quotes, companySettings, signQuote } = useAppState();
  const { showToast } = useToast();
  
  const [quote, setQuote] = useState<Quote | null>(null);
  const [signerName, setSignerName] = useState('');
  const [signerRole, setSignerRole] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copiedBankIdx, setCopiedBankIdx] = useState<number | null>(null);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [justSigned, setJustSigned] = useState(false);

  const printContentRef = useRef<HTMLDivElement>(null);

  // Locate quote from quotes collection
  useEffect(() => {
    const cleanId = quoteIdentifier.trim().toLowerCase();
    const found = quotes.find(q => 
      q.quoteNumber.toLowerCase() === cleanId || 
      q.id.toLowerCase() === cleanId
    );
    if (found) {
      setQuote(found);
      setSignerName(found.signedBy || found.clientName || '');
    }
  }, [quoteIdentifier, quotes]);

  // Copy bank account helper
  const handleCopyAccount = (accNum: string, idx: number) => {
    navigator.clipboard.writeText(accNum.replace(/\s+/g, ''));
    setCopiedBankIdx(idx);
    showToast('Número de cuenta copiado al portapapeles', 'info');
    setTimeout(() => setCopiedBankIdx(null), 2500);
  };

  // Sign Proposal Handler
  const handleSaveSignature = async (dataUrl: string) => {
    if (!quote) return;
    if (!agreeTerms) {
      showToast('Por favor marca la casilla de conformidad de términos y condiciones antes de firmar.', 'warning');
      return;
    }

    setIsSubmitting(true);
    try {
      // Upload signature to Supabase Storage
      const publicSigUrl = await uploadSignature(dataUrl, `client-${quote.id}`);
      
      const fullSigner = signerRole ? `${signerName.trim()} (${signerRole.trim()})` : signerName.trim() || quote.clientName;
      
      await signQuote(quote.id, publicSigUrl, fullSigner);
      
      setJustSigned(true);
      showToast('¡Propuesta firmada formalmente con éxito!', 'success');
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 }
      });
    } catch (err: any) {
      console.error('Error al firmar propuesta:', err);
      showToast('Hubo un inconveniente al registrar la firma. Intenta nuevamente.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Download official PDF
  const handleDownloadPDF = async () => {
    if (!printContentRef.current || !quote) return;
    setIsDownloadingPdf(true);
    try {
      const element = printContentRef.current;
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

      const imgWidth = 210;
      const pageHeight = 297;
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
      window.print();
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  const handleWhatsAppContact = () => {
    if (!quote) return;
    const msg = `¡Hola! Me comunico respecto a la propuesta ${quote.quoteNumber} a nombre de ${quote.clientName}.`;
    window.open(createWhatsAppUrl(companySettings.whatsapp, msg), '_blank');
  };

  // If quote not found
  if (!quote) {
    return (
      <div className="min-h-screen bg-slate-900 text-slate-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full p-8 rounded-3xl bg-slate-800 border border-slate-700 text-center space-y-5 shadow-2xl">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mx-auto">
            <FileText className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-xl font-black text-white">Propuesta No Encontrada</h2>
            <p className="text-xs text-slate-400 mt-2">
              No localizamos una cotización con el identificador <span className="font-mono text-amber-400 font-bold">"{quoteIdentifier}"</span>. Es posible que el enlace haya expirado o sea incorrecto.
            </p>
          </div>
          <div className="flex flex-col gap-2 pt-2">
            <button
              onClick={() => window.open(createWhatsAppUrl(companySettings.whatsapp, `Hola, requiero asistencia con el enlace de cotización ${quoteIdentifier}`), '_blank')}
              className="py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Contactar a Soporte vía WhatsApp</span>
            </button>
            {onBackToHome && (
              <button
                onClick={onBackToHome}
                className="py-2.5 px-4 text-xs font-semibold text-slate-400 hover:text-white"
              >
                Ir a la Página Principal
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  const isAccepted = quote.status === 'accepted';

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans pb-16 selection:bg-brand-teal-500 selection:text-white">
      
      {/* Top Floating Action Bar */}
      <header className="sticky top-0 z-30 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-4 py-3 shadow-lg">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <BrandLogo size="sm" />
            <div className="hidden sm:block">
              <span className="text-[10px] uppercase font-black tracking-widest text-brand-teal-400 block">
                Portal de Clientes
              </span>
              <span className="text-xs font-bold text-slate-300">
                Propuesta #{quote.quoteNumber}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleWhatsAppContact}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
            >
              <MessageCircle className="w-4 h-4 text-emerald-400" />
              <span className="hidden sm:inline">Consultar Dudas</span>
            </button>

            <button
              onClick={handleDownloadPDF}
              disabled={isDownloadingPdf}
              className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all disabled:opacity-60"
            >
              {isDownloadingPdf ? (
                <Loader2 className="w-4 h-4 animate-spin text-brand-teal-400" />
              ) : (
                <Download className="w-4 h-4 text-brand-teal-400" />
              )}
              <span>Descargar PDF</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-4xl mx-auto px-4 pt-6 sm:pt-8 space-y-6">
        
        {/* Official Status Banner */}
        <div className={`p-4 sm:p-5 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl ${
          isAccepted 
            ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-300' 
            : 'bg-brand-teal-950/40 border-brand-teal-500/40 text-brand-teal-200'
        }`}>
          <div className="flex items-center gap-3.5">
            <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 border ${
              isAccepted 
                ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400' 
                : 'bg-brand-teal-500/20 border-brand-teal-500/40 text-brand-teal-400'
            }`}>
              {isAccepted ? <CheckCircle2 className="w-6 h-6" /> : <ShieldCheck className="w-6 h-6" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase tracking-wider">
                  {isAccepted ? '✓ Propuesta Aprobada Formalmente' : 'Propuesta Oficial en Revisión'}
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-white/10">
                  {quote.quoteNumber}
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                {isAccepted 
                  ? `Certificada por ${quote.signedBy || quote.clientName} el ${formatDate(quote.signedAt || quote.date)}.` 
                  : `Válida hasta el ${formatDate(quote.validUntil)} (${companySettings.defaultWarranty}).`}
              </p>
            </div>
          </div>

          {!isAccepted && (
            <a
              href="#seccion-firma"
              className="px-4 py-2 rounded-xl bg-brand-teal-500 hover:bg-brand-teal-400 text-slate-950 font-black text-xs shadow-md border border-brand-teal-400 flex items-center justify-center gap-1.5 transition-all self-start sm:self-auto"
            >
              <span>Firmar y Aprobar Online</span>
              <span>↓</span>
            </a>
          )}
        </div>

        {/* PRINTABLE / VISUAL DOCUMENT WRAPPER */}
        <div ref={printContentRef} className="bg-white text-slate-900 rounded-3xl shadow-2xl p-6 sm:p-10 space-y-8 border border-slate-200">
          
          {/* Header Membretado */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 pb-6 border-b-2 border-slate-200">
            <div className="space-y-2">
              <BrandLogo size="md" />
              <div className="text-xs text-slate-600 space-y-0.5 font-medium pt-1">
                <div className="font-bold text-slate-900">{companySettings.legalName}</div>
                <div>RNC: <strong className="font-mono">{companySettings.rnc}</strong></div>
                <div>{companySettings.address}, {companySettings.city}</div>
                <div>Teléfono: {companySettings.phone} • WhatsApp: {companySettings.whatsapp}</div>
                <div>Web: {companySettings.website} • Correo: {companySettings.email}</div>
              </div>
            </div>

            <div className="sm:text-right space-y-1.5">
              <div className="inline-block px-3 py-1 rounded-lg bg-brand-teal-50 border border-brand-teal-300 text-brand-teal-900 text-xs font-black tracking-wide uppercase">
                Cotización Comercial
              </div>
              <div className="text-2xl font-black font-mono text-slate-900">
                #{quote.quoteNumber}
              </div>
              <div className="text-xs text-slate-600 font-medium">
                <div>Fecha de Emisión: <strong>{formatDate(quote.date)}</strong></div>
                <div>Válida Hasta: <strong className="text-amber-700">{formatDate(quote.validUntil)}</strong></div>
                <div>Moneda: <strong>{quote.currency === 'USD' ? 'Dólares (USD)' : 'Pesos Dominicanos (DOP)'}</strong></div>
              </div>
            </div>
          </div>

          {/* Client Destination Card */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="text-[11px] font-black uppercase tracking-wider text-slate-500">
              Propuesta Preparada Especialmente Para:
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <div className="text-base font-black text-slate-900">{quote.clientName}</div>
                {quote.clientCompany && (
                  <div className="text-xs font-bold text-brand-teal-700 flex items-center gap-1 mt-0.5">
                    <Building2 className="w-3.5 h-3.5" />
                    <span>{quote.clientCompany}</span>
                  </div>
                )}
                {quote.clientRnc && (
                  <div className="text-xs text-slate-600 font-mono mt-0.5">
                    RNC / Cédula: <strong>{quote.clientRnc}</strong>
                  </div>
                )}
              </div>
              <div className="space-y-0.5 text-slate-600">
                <div>Teléfono: <strong className="text-slate-900 font-mono">{quote.clientPhone}</strong></div>
                {quote.clientEmail && <div>Correo: <strong className="text-slate-900">{quote.clientEmail}</strong></div>}
                {quote.clientAddress && <div>Ubicación: <strong className="text-slate-900">{quote.clientAddress}</strong></div>}
              </div>
            </div>
          </div>

          {/* Items Breakdown Table */}
          <div className="space-y-3">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
              <Wrench className="w-4 h-4 text-brand-teal-600" />
              <span>Partidas Técnicas, Equipos & Servicios Incluidos</span>
            </h3>

            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-slate-800 font-bold border-b border-slate-200">
                    <th className="py-2.5 px-3">#</th>
                    <th className="py-2.5 px-3">Descripción Técnica</th>
                    <th className="py-2.5 px-3 text-center">Cant.</th>
                    <th className="py-2.5 px-3 text-right">Precio Unit.</th>
                    <th className="py-2.5 px-3 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {quote.items.map((item, idx) => (
                    <tr key={item.id || idx} className="hover:bg-slate-50/80">
                      <td className="py-3 px-3 font-mono font-bold text-slate-400">{idx + 1}</td>
                      <td className="py-3 px-3">
                        <div className="font-bold text-slate-900">{item.name}</div>
                        {item.description && (
                          <div className="text-[11px] text-slate-500 font-normal leading-relaxed mt-0.5">
                            {item.description}
                          </div>
                        )}
                        <span className="inline-block mt-1 px-1.5 py-0.2 text-[9px] font-bold uppercase rounded bg-slate-100 text-slate-600 border border-slate-200">
                          {item.type === 'product' ? 'Equipo' : item.type === 'service' ? 'Servicio' : item.type === 'labor' ? 'Instalación' : 'Material'}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center font-bold text-slate-800 font-mono">{item.quantity}</td>
                      <td className="py-3 px-3 text-right font-mono text-slate-700">{formatCurrency(item.unitPrice, quote.currency)}</td>
                      <td className="py-3 px-3 text-right font-mono font-bold text-slate-900">{formatCurrency(item.total, quote.currency)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Totals & Taxes Summary */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-6 pt-2">
            <div className="space-y-2 max-w-sm text-xs text-slate-600">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <div className="font-bold text-slate-900 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-brand-teal-600" />
                  <span>Tiempo de Entrega & Ejecución</span>
                </div>
                <div>{quote.deliveryTime || '2 a 4 días laborables tras aprobación.'}</div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <div className="font-bold text-slate-900 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-brand-teal-600" />
                  <span>Garantía Certificada</span>
                </div>
                <div>{quote.warrantyNotes || companySettings.defaultWarranty}</div>
              </div>
            </div>

            <div className="w-full sm:w-72 p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal Partidas:</span>
                <span className="font-mono font-bold text-slate-900">{formatCurrency(quote.subtotal, quote.currency)}</span>
              </div>

              {quote.discountAmount > 0 && (
                <div className="flex justify-between text-emerald-700">
                  <span>Descuento Comercial ({quote.discountPercent}%):</span>
                  <span className="font-mono font-bold">-{formatCurrency(quote.discountAmount, quote.currency)}</span>
                </div>
              )}

              {quote.applyTax && (
                <div className="flex justify-between text-slate-600">
                  <span>ITBIS / IVA ({quote.taxPercent}%):</span>
                  <span className="font-mono font-bold text-slate-900">{formatCurrency(quote.taxAmount, quote.currency)}</span>
                </div>
              )}

              <div className="pt-2 border-t-2 border-slate-300 flex justify-between items-baseline">
                <span className="text-sm font-black text-slate-900">Total a Pagar:</span>
                <span className="text-xl font-black text-brand-teal-800 font-mono">
                  {formatCurrency(quote.total, quote.currency)}
                </span>
              </div>
            </div>
          </div>

          {/* Terms & Payment Conditions */}
          <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-200/80 text-xs text-amber-950 space-y-1.5">
            <div className="font-black flex items-center gap-1.5 text-amber-900 uppercase tracking-wide text-[11px]">
              <CreditCard className="w-3.5 h-3.5" />
              <span>Condiciones Comerciales & Forma de Pago</span>
            </div>
            <p className="leading-relaxed">
              {quote.paymentTerms || companySettings.defaultTerms}
            </p>
          </div>

          {/* Stamped Signature if already accepted */}
          {isAccepted && quote.clientSignature && (
            <div className="pt-4 border-t-2 border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="space-y-1 text-center sm:text-left">
                <span className="text-[10px] uppercase font-bold text-emerald-700 tracking-wider flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Certificación de Firma Digital del Cliente</span>
                </span>
                <div className="text-sm font-black text-slate-900">{quote.signedBy || quote.clientName}</div>
                <div className="text-xs text-slate-500">
                  Fecha y hora: {formatDate(quote.signedAt)} • Verificado Digitalmente
                </div>
              </div>
              <div className="p-2 rounded-xl bg-slate-50 border border-slate-300 shadow-sm max-w-xs">
                <img src={quote.clientSignature} alt="Firma del Cliente" className="h-16 object-contain" />
              </div>
            </div>
          )}

        </div>

        {/* BANK ACCOUNTS SECTION (For Wire Transfers) */}
        <div className="p-6 rounded-3xl bg-slate-800/80 border border-slate-700 space-y-4 shadow-xl">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <h3 className="text-sm font-black text-white flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-emerald-400" />
                <span>Cuentas Bancarias para Transferencias / Depósitos</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Al realizar el pago o anticipo, favor remitir el comprobante de transferencia vía WhatsApp.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
            {(companySettings.bankAccounts || []).map((acc, idx) => (
              <div key={idx} className="p-4 rounded-2xl bg-slate-900/90 border border-slate-700 space-y-2 hover:border-brand-teal-500/50 transition-all flex flex-col justify-between">
                <div>
                  <div className="text-xs font-black text-white">{acc.bank}</div>
                  <div className="text-[11px] text-brand-teal-400 font-semibold">{acc.accountType}</div>
                  <div className="text-sm font-mono font-black text-slate-100 tracking-wider mt-1.5 select-all">
                    {acc.accountNumber}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">Titular: {acc.holder}</div>
                </div>

                <button
                  type="button"
                  onClick={() => handleCopyAccount(acc.accountNumber, idx)}
                  className={`w-full mt-2 py-1.5 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all border ${
                    copiedBankIdx === idx
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
                  }`}
                >
                  {copiedBankIdx === idx ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedBankIdx === idx ? '¡Copiado!' : 'Copiar Cuenta'}</span>
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* INTERACTIVE DIGITAL SIGNATURE SECTION */}
        <section id="seccion-firma">
          {isAccepted ? (
            <div className="p-8 rounded-3xl bg-emerald-950/30 border-2 border-emerald-500/40 text-center space-y-4 shadow-xl">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 mx-auto">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-lg font-black text-white">
                  ¡Muchas gracias por su confianza en Martínez Tech!
                </h3>
                <p className="text-xs text-emerald-300 mt-1 max-w-md mx-auto">
                  Esta propuesta fue aprobada y firmada formalmente. Nuestro equipo de ingeniería y operaciones se encuentra coordinando los equipos y la fecha de instalación.
                </p>
              </div>
              <div className="pt-2">
                <button
                  onClick={handleWhatsAppContact}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg inline-flex items-center gap-2 transition-all"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Coordinar Inicio con Asesor Técnico</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="p-6 sm:p-8 rounded-3xl bg-slate-800/90 border-2 border-brand-teal-500/40 space-y-6 shadow-2xl">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <h3 className="text-base font-black text-white flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-brand-teal-400" />
                    <span>Aprobación & Firma Digital en Línea</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Formalice la aceptación de este presupuesto firmando en el recuadro interactivo (con su dedo o mouse).
                  </p>
                </div>
                <span className="px-2.5 py-1 rounded-lg bg-brand-teal-500/20 text-brand-teal-300 text-[11px] font-bold border border-brand-teal-500/30">
                  Validez Legal & Comercial
                </span>
              </div>

              {/* Checkbox agreement */}
              <label className="flex items-start gap-2.5 cursor-pointer select-none p-4 rounded-2xl bg-slate-900 border border-slate-700">
                <input
                  type="checkbox"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded border-slate-600 text-brand-teal-500 focus:ring-brand-teal-400"
                />
                <span className="text-xs text-slate-300 leading-relaxed font-medium">
                  Declaro que he revisado las partidas técnicas, valores y condiciones de esta propuesta comercial, y doy mi expresa conformidad para el suministro, despacho e inicio de los trabajos correspondientes.
                </span>
              </label>

              {/* SignaturePad Component */}
              <div className="pt-2">
                <SignaturePad 
                  title="Firma Digital de Aceptación del Cliente"
                  signerName={signerName || quote.clientName}
                  onSave={handleSaveSignature}
                />
              </div>
            </div>
          )}
        </section>

      </main>

      {/* Footer */}
      <footer className="max-w-4xl mx-auto px-4 pt-12 text-center text-xs text-slate-500 space-y-1">
        <div>{companySettings.legalName} • RNC: {companySettings.rnc}</div>
        <div>Soluciones - Servicios - Calidad • República Dominicana</div>
      </footer>

    </div>
  );
};
