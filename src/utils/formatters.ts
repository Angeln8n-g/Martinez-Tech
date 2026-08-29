import { DealStage, PriorityLevel, ServiceCategory, Quote, CompanySettings } from '../types';

export const formatCurrency = (amount: number, currency: 'DOP' | 'USD' = 'DOP'): string => {
  const prefix = currency === 'USD' ? 'USD $' : 'RD$ ';
  return `${prefix}${amount.toLocaleString('es-DO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

export const formatDate = (dateString?: string): string => {
  if (!dateString) return 'N/A';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return d.toLocaleDateString('es-DO', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } catch {
    return dateString;
  }
};

export const formatDateTime = (dateString?: string): string => {
  if (!dateString) return 'N/A';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return d.toLocaleDateString('es-DO', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch {
    return dateString;
  }
};

export const getStageInfo = (stage: DealStage) => {
  switch (stage) {
    case 'prospect':
      return {
        label: '1. Prospecto Nuevo',
        shortLabel: 'Prospecto',
        color: 'bg-sky-500/10 text-sky-400 border-sky-500/30',
        dotColor: 'bg-sky-400',
        order: 1
      };
    case 'site_visit':
      return {
        label: '2. Levantamiento / Visita',
        shortLabel: 'Levantamiento',
        color: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
        dotColor: 'bg-amber-400',
        order: 2
      };
    case 'quoted':
      return {
        label: '3. Presupuesto Enviado',
        shortLabel: 'Cotizado',
        color: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
        dotColor: 'bg-purple-400',
        order: 3
      };
    case 'negotiation':
      return {
        label: '4. En Negociación',
        shortLabel: 'Negociando',
        color: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30',
        dotColor: 'bg-indigo-400',
        order: 4
      };
    case 'won':
      return {
        label: '5. Aprobado / Ganado',
        shortLabel: 'Aprobado',
        color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
        dotColor: 'bg-emerald-400',
        order: 5
      };
    case 'installation':
      return {
        label: '6. En Instalación',
        shortLabel: 'Instalando',
        color: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
        dotColor: 'bg-cyan-400',
        order: 6
      };
    case 'completed':
      return {
        label: '7. Finalizado y Cobrado',
        shortLabel: 'Completado',
        color: 'bg-brand-green-500/10 text-brand-green-400 border-brand-green-500/30',
        dotColor: 'bg-brand-green-400',
        order: 7
      };
    case 'lost':
      return {
        label: '8. Cancelado / Perdido',
        shortLabel: 'Cancelado',
        color: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
        dotColor: 'bg-rose-400',
        order: 8
      };
    default:
      return {
        label: stage,
        shortLabel: stage,
        color: 'bg-slate-500/10 text-slate-400 border-slate-500/30',
        dotColor: 'bg-slate-400',
        order: 9
      };
  }
};

export const getPriorityBadge = (priority: PriorityLevel) => {
  switch (priority) {
    case 'high':
      return { label: 'Alta', color: 'bg-rose-500/20 text-rose-300 border-rose-500/40' };
    case 'medium':
      return { label: 'Media', color: 'bg-amber-500/20 text-amber-300 border-amber-500/40' };
    case 'low':
      return { label: 'Baja', color: 'bg-slate-500/20 text-slate-300 border-slate-500/40' };
  }
};

export const getCategoryInfo = (category: ServiceCategory) => {
  switch (category) {
    case 'camaras':
      return { label: 'Cámaras de Vigilancia', color: 'text-brand-teal-400 bg-brand-teal-500/10 border-brand-teal-500/30' };
    case 'redes':
      return { label: 'Redes Informáticas', color: 'text-blue-400 bg-blue-500/10 border-blue-500/30' };
    case 'motores':
      return { label: 'Motores de Portón', color: 'text-amber-400 bg-amber-500/10 border-amber-500/30' };
    case 'cerraduras':
      return { label: 'Cerraduras Magnéticas', color: 'text-rose-400 bg-rose-500/10 border-rose-500/30' };
    case 'acceso':
      return { label: 'Control de Acceso', color: 'text-purple-400 bg-purple-500/10 border-purple-500/30' };
    case 'ponchadores':
      return { label: 'Ponchadores Biométricos', color: 'text-orange-400 bg-orange-500/10 border-orange-500/30' };
    case 'alarmas':
      return { label: 'Alarmas de Seguridad', color: 'text-red-400 bg-red-500/10 border-red-500/30' };
    case 'intercom':
      return { label: 'Intercom & Video Porteros', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' };
    default:
      return { label: 'Servicio General', color: 'text-slate-400 bg-slate-500/10 border-slate-500/30' };
  }
};

export const createWhatsAppUrl = (phone: string, message: string): string => {
  // Strip non numeric characters
  const cleanPhone = phone.replace(/\D/g, '');
  const encodedText = encodeURIComponent(message);
  return `https://wa.me/${cleanPhone}?text=${encodedText}`;
};

export const generateQuoteWhatsAppText = (quote: Quote, company: CompanySettings): string => {
  const itemsText = quote.items
    .map((item, idx) => `${idx + 1}. *${item.name}* (x${item.quantity}) - ${formatCurrency(item.total, quote.currency)}`)
    .join('\n');

  return `👋 ¡Hola ${quote.clientName}! Le saludamos de *${company.name}* (${company.slogan}).

Adjuntamos el resumen de su presupuesto oficial:
📄 *Cotización N°:* ${quote.quoteNumber}
📅 *Fecha:* ${formatDate(quote.date)}
⏳ *Válido hasta:* ${formatDate(quote.validUntil)}

*Detalle de Equipos y Servicios:*
${itemsText}

━━━━━━━━━━━━━━━━━━━━
💰 *Subtotal:* ${formatCurrency(quote.subtotal, quote.currency)}
${quote.discountAmount > 0 ? `🏷️ *Descuento (${quote.discountPercent}%):* -${formatCurrency(quote.discountAmount, quote.currency)}\n` : ''}${quote.applyTax ? `🏛️ *ITBIS (${quote.taxPercent}%):* ${formatCurrency(quote.taxAmount, quote.currency)}\n` : ''}💵 *TOTAL FINAL:* *${formatCurrency(quote.total, quote.currency)}*
━━━━━━━━━━━━━━━━━━━━

🛡️ *Garantía:* ${quote.warrantyNotes || company.defaultWarranty}
🚚 *Tiempo estimado:* ${quote.deliveryTime}

Cualquier duda o para agendar la instalación, favor respondernos por este medio. ¡Estamos a su entera orden!`;
};
