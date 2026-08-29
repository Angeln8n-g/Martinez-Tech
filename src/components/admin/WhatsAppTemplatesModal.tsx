import React, { useState, useEffect } from 'react';
import { useAppState } from '../../context/AppStateContext';
import { 
  X, 
  MessageCircle, 
  Copy, 
  Check, 
  ExternalLink, 
  FileText, 
  Calendar, 
  CreditCard, 
  Receipt, 
  Star 
} from 'lucide-react';
import { createWhatsAppUrl, formatCurrency, formatDate } from '../../utils/formatters';

export type TemplateType = 'quote' | 'visit' | 'payment_reminder' | 'receipt' | 'review';

export const WhatsAppTemplatesModal: React.FC = () => {
  const { 
    isWhatsAppModalOpen, 
    setIsWhatsAppModalOpen, 
    whatsAppModalData, 
    companySettings 
  } = useAppState();

  const [activeTab, setActiveTab] = useState<TemplateType>('quote');
  const [recipientPhone, setRecipientPhone] = useState('');
  const [clientName, setClientName] = useState('');
  const [messageText, setMessageText] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (whatsAppModalData) {
      if (whatsAppModalData.templateType) {
        setActiveTab(whatsAppModalData.templateType);
      }
      setRecipientPhone(whatsAppModalData.clientPhone || '');
      setClientName(whatsAppModalData.clientName || 'Estimado(a) Cliente');
    }
  }, [whatsAppModalData, isWhatsAppModalOpen]);

  // Generate message based on active template
  useEffect(() => {
    const data = whatsAppModalData || {};
    const name = clientName || data.clientName || 'Estimado(a) Cliente';
    const cName = companySettings.name;

    switch (activeTab) {
      case 'quote': {
        const qNum = data.quoteNumber || 'COT-2026-001';
        const totalFormatted = data.total ? formatCurrency(data.total, data.currency || 'DOP') : 'RD$ 0.00';
        const validUntilFormatted = data.validUntil ? formatDate(data.validUntil) : '15 días';
        
        setMessageText(
`¡Hola *${name}*! 👋

Le saludamos de parte del equipo de *${cName}*.

Adjunto a este mensaje le enviamos su *Presupuesto Formal Oficial* detallado:
📄 *N° de Cotización:* ${qNum}
💰 *Monto Total:* ${totalFormatted}
🗓️ *Vigencia de la Oferta:* ${validUntilFormatted}

Incluye garantía certificada de *${companySettings.defaultWarranty}*, mano de obra profesional y soporte técnico.

Quedamos a su entera disposición para cualquier inquietud o para coordinar la fecha de inicio de los trabajos.

¡Que tenga un excelente día!`
        );
        break;
      }

      case 'visit': {
        const vDate = data.date ? formatDate(data.date) : 'Próxima fecha';
        const vTime = data.time || '10:00 AM';
        const tech = data.technician || 'Técnico Especialista de Martínez Tech';
        const addr = data.address || 'su dirección registrada';

        setMessageText(
`¡Hola *${name}*! 👋

Le confirmamos que su *Visita Técnica / Levantamiento* con *${cName}* ha sido programada exitosamente:

📅 *Fecha:* ${vDate}
⏰ *Hora Estimada:* ${vTime}
📍 *Lugar:* ${addr}
👷 *Técnico Responsable:* ${tech}

Nuestro equipo se presentará debidamente uniformado e identificado con su carnet institucional. 

Cualquier cambio de horario, favor avisarnos por esta misma vía. ¡Gracias por preferirnos!`
        );
        break;
      }

      case 'payment_reminder': {
        const total = data.total ? formatCurrency(data.total, data.currency || 'DOP') : 'RD$ 0.00';
        const paid = data.paid ? formatCurrency(data.paid, data.currency || 'DOP') : 'RD$ 0.00';
        const balance = data.balance ? formatCurrency(data.balance, data.currency || 'DOP') : 'RD$ 0.00';
        const firstBank = companySettings.bankAccounts[0] || { bank: 'Banco Popular', accountNumber: '809283746' };

        setMessageText(
`Estimado(a) *${name}*,

Le saludamos cordialmente desde el departamento de facturación de *${cName}*.

Le compartimos el estado de cuenta correspondiente a su proyecto:
💵 *Monto Total del Proyecto:* ${total}
✅ *Anticipo Recibido:* ${paid}
⏳ *Saldo Pendiente por Liquidar:* *${balance}*

Para su comodidad, puede realizar la transferencia a nuestra cuenta:
🏦 *${firstBank.bank}*: Cuenta #${firstBank.accountNumber} (${firstBank.holder})

Favor remitir el comprobante por este chat para emitir su recibo de saldo formal. ¡Muchas gracias!`
        );
        break;
      }

      case 'receipt': {
        const recNum = data.receiptNumber || 'REC-2026-001';
        const amt = data.amount ? formatCurrency(data.amount, data.currency || 'DOP') : 'RD$ 0.00';
        const concept = data.concept || 'Anticipo de instalación de seguridad';

        setMessageText(
`¡Hola *${name}*! 👋

Confirmamos la recepción satisfactoria de su pago en *${cName}*:

🧾 *Comprobante N°:* ${recNum}
💵 *Monto Recibido:* ${amt}
📌 *Concepto:* ${concept}
🗓️ *Fecha:* ${formatDate(new Date().toISOString())}

Su recibo digital se encuentra registrado en nuestro sistema oficial. ¡Agradecemos su confianza y puntualidad!`
        );
        break;
      }

      case 'review': {
        setMessageText(
`¡Hola *${name}*! 🌟

Ha sido un verdadero placer haber ejecutado la instalación de sus sistemas de tecnología y seguridad.

En *${cName}* trabajamos con altos estándares de calidad y su opinión es fundamental para nosotros:

¿Nos apoyaría con una breve reseña de 5 estrellas en nuestro perfil?
⭐⭐⭐⭐⭐
👉 *Enlace directo:* https://g.page/r/martinez-tech-review

¡Muchísimas gracias por su preferencia y recomendación!`
        );
        break;
      }
    }
  }, [activeTab, whatsAppModalData, clientName, companySettings]);

  if (!isWhatsAppModalOpen) return null;

  const handleOpenWhatsApp = () => {
    if (!recipientPhone) {
      alert('Por favor ingrese el número de WhatsApp del destinatario.');
      return;
    }
    window.open(createWhatsAppUrl(recipientPhone, messageText), '_blank');
  };

  const handleCopyText = () => {
    navigator.clipboard.writeText(messageText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-3xl max-w-2xl w-full p-6 sm:p-7 relative max-h-[90vh] overflow-y-auto shadow-2xl space-y-5">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b-2 border-slate-200 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-300 dark:border-emerald-500/30 flex items-center justify-center text-emerald-700 dark:text-emerald-400 shadow-sm">
              <MessageCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-900 dark:text-white">
                Centro de Mensajería WhatsApp 1-Clic
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                Plantillas profesionales preformateadas con variables automáticas para clientes.
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsWhatsAppModalOpen(false)}
            className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-black dark:hover:text-white border border-slate-300 dark:border-slate-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Template Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
          <button
            onClick={() => setActiveTab('quote')}
            className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap flex items-center gap-1.5 transition-all ${
              activeTab === 'quote'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>1. Cotización</span>
          </button>

          <button
            onClick={() => setActiveTab('visit')}
            className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap flex items-center gap-1.5 transition-all ${
              activeTab === 'visit'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>2. Confirmar Visita</span>
          </button>

          <button
            onClick={() => setActiveTab('payment_reminder')}
            className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap flex items-center gap-1.5 transition-all ${
              activeTab === 'payment_reminder'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span>3. Saldo Pendiente</span>
          </button>

          <button
            onClick={() => setActiveTab('receipt')}
            className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap flex items-center gap-1.5 transition-all ${
              activeTab === 'receipt'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            <Receipt className="w-3.5 h-3.5" />
            <span>4. Recibo de Cobro</span>
          </button>

          <button
            onClick={() => setActiveTab('review')}
            className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap flex items-center gap-1.5 transition-all ${
              activeTab === 'review'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            <Star className="w-3.5 h-3.5" />
            <span>5. Reseña & Calificación</span>
          </button>
        </div>

        {/* Recipient Details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-300 dark:border-slate-700 shadow-sm">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-800 dark:text-slate-300">Destinatario / Cliente</label>
            <input
              type="text"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              placeholder="Ej. Ing. Carlos Mendoza"
              className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white font-semibold"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-800 dark:text-slate-300">Número de WhatsApp *</label>
            <input
              type="tel"
              required
              value={recipientPhone}
              onChange={(e) => setRecipientPhone(e.target.value)}
              placeholder="Ej. 809-555-1234"
              className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white font-mono font-bold"
            />
          </div>
        </div>

        {/* Live Message Textarea */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-800 dark:text-slate-300">
              Vista Previa y Edición del Mensaje:
            </label>
            <span className="text-[11px] text-slate-500 font-mono">{messageText.length} caracteres</span>
          </div>

          <textarea
            rows={10}
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            className="w-full p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white font-mono leading-relaxed resize-none focus:outline-none focus:border-emerald-500 shadow-inner"
          />
        </div>

        {/* Action Buttons */}
        <div className="pt-2 border-t-2 border-slate-200 dark:border-slate-800 flex items-center justify-between flex-wrap gap-2">
          <button
            type="button"
            onClick={handleCopyText}
            className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-slate-300 text-xs font-bold border border-slate-300 dark:border-slate-700 flex items-center gap-1.5 shadow-sm"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? '¡Texto Copiado!' : 'Copiar Mensaje'}</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsWhatsAppModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-300 text-xs font-semibold hover:bg-slate-200"
            >
              Cerrar
            </button>

            <button
              type="button"
              onClick={handleOpenWhatsApp}
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs shadow-md border border-emerald-700/30 flex items-center gap-2"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Abrir en WhatsApp</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
