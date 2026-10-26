import { DealStage, PriorityLevel, ServiceCategory, Quote, CompanySettings } from '../types';

export const roundToTwoDecimals = (num: number): number => {
  if (isNaN(num)) return 0;
  return Math.round((num + Number.EPSILON) * 100) / 100;
};

export const formatCurrency = (amount: number, currency: 'DOP' | 'USD' = 'DOP'): string => {
  const prefix = currency === 'USD' ? 'USD $' : 'RD$ ';
  const cleanAmount = isNaN(amount) ? 0 : amount;
  return `${prefix}${cleanAmount.toLocaleString('es-DO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
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
        color: 'bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 border-sky-300 dark:border-sky-500/40',
        dotColor: 'bg-sky-500',
        order: 1
      };
    case 'site_visit':
      return {
        label: '2. Levantamiento / Visita',
        shortLabel: 'Levantamiento',
        color: 'bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-500/40',
        dotColor: 'bg-amber-500',
        order: 2
      };
    case 'quoted':
      return {
        label: '3. Presupuesto Enviado',
        shortLabel: 'Cotizado',
        color: 'bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border-purple-300 dark:border-purple-500/40',
        dotColor: 'bg-purple-500',
        order: 3
      };
    case 'negotiation':
      return {
        label: '4. En Negociación',
        shortLabel: 'Negociando',
        color: 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border-indigo-300 dark:border-indigo-500/40',
        dotColor: 'bg-indigo-500',
        order: 4
      };
    case 'won':
      return {
        label: '5. Aprobado / Ganado',
        shortLabel: 'Aprobado',
        color: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-500/40',
        dotColor: 'bg-emerald-500',
        order: 5
      };
    case 'installation':
      return {
        label: '6. En Instalación',
        shortLabel: 'Instalando',
        color: 'bg-cyan-50 dark:bg-cyan-950/60 text-cyan-800 dark:text-cyan-300 border-cyan-300 dark:border-cyan-500/40',
        dotColor: 'bg-cyan-500',
        order: 6
      };
    case 'completed':
      return {
        label: '7. Finalizado y Cobrado',
        shortLabel: 'Completado',
        color: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-500/40',
        dotColor: 'bg-emerald-500',
        order: 7
      };
    case 'lost':
      return {
        label: '8. Cancelado / Perdido',
        shortLabel: 'Cancelado',
        color: 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-300 dark:border-rose-500/40',
        dotColor: 'bg-rose-500',
        order: 8
      };
    default:
      return {
        label: stage,
        shortLabel: stage,
        color: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-600',
        dotColor: 'bg-slate-400',
        order: 9
      };
  }
};

export const getPriorityBadge = (priority: PriorityLevel) => {
  switch (priority) {
    case 'high':
      return { label: 'Alta', color: 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-300 dark:border-rose-500/40' };
    case 'medium':
      return { label: 'Media', color: 'bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-500/40' };
    case 'low':
      return { label: 'Baja', color: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-600' };
  }
};

export const getCategoryInfo = (category: ServiceCategory) => {
  switch (category) {
    case 'camaras':
      return { label: 'Cámaras de Vigilancia', color: 'text-nexablue-700 dark:text-nexablue-300 bg-nexablue-50 dark:bg-nexablue-950/60 border-nexablue-200 dark:border-nexablue-800/60' };
    case 'redes':
      return { label: 'Redes Informáticas', color: 'text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 border-blue-200 dark:border-blue-800/60' };
    case 'motores':
      return { label: 'Motores de Portón', color: 'text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 border-amber-200 dark:border-amber-800/60' };
    case 'cerraduras':
      return { label: 'Cerraduras Magnéticas', color: 'text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/60 border-rose-200 dark:border-rose-800/60' };
    case 'acceso':
      return { label: 'Control de Acceso', color: 'text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/60 border-purple-200 dark:border-purple-800/60' };
    case 'ponchadores':
      return { label: 'Ponchadores Biométricos', color: 'text-orange-800 dark:text-orange-300 bg-orange-50 dark:bg-orange-950/60 border-orange-200 dark:border-orange-800/60' };
    case 'alarmas':
      return { label: 'Alarmas de Seguridad', color: 'text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-950/60 border-red-200 dark:border-red-800/60' };
    case 'intercom':
      return { label: 'Intercom & Video Porteros', color: 'text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800/60' };
    default:
      return { label: 'Servicio General', color: 'text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700' };
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

// Validate Dominican RNC (9 digits) and Cédula (11 digits)
export interface RNCValidationResult {
  isValid: boolean;
  type: 'RNC' | 'Cédula' | 'Inválido';
  formatted: string;
  message: string;
}

export const validateDominicanRNC = (input: string): RNCValidationResult => {
  if (!input) {
    return { isValid: false, type: 'Inválido', formatted: '', message: 'Campo vacío' };
  }
  const clean = input.replace(/\D/g, '');
  
  if (!clean) {
    return { isValid: false, type: 'Inválido', formatted: input, message: 'Ingrese un RNC o Cédula' };
  }

  // Check 9-digit RNC (Empresas)
  if (clean.length === 9) {
    const weights = [7, 9, 8, 6, 5, 4, 3, 2];
    let sum = 0;
    for (let i = 0; i < 8; i++) {
      sum += parseInt(clean.charAt(i), 10) * weights[i];
    }
    const remainder = sum % 11;
    let checkDigit = 0;
    if (remainder === 0) checkDigit = 2;
    else if (remainder === 1) checkDigit = 1;
    else checkDigit = 11 - remainder;

    const actualCheck = parseInt(clean.charAt(8), 10);
    const isValid = checkDigit === actualCheck;
    const formatted = `${clean.slice(0, 1)}-${clean.slice(1, 3)}-${clean.slice(3, 8)}-${clean.slice(8)}`;
    
    return {
      isValid,
      type: 'RNC',
      formatted,
      message: isValid ? 'RNC Comercial Válido (DGII)' : 'Dígito verificador de RNC inválido'
    };
  }

  // Check 11-digit Cédula (Personas Físicas)
  if (clean.length === 11) {
    const weights = [1, 2, 1, 2, 1, 2, 1, 2, 1, 2];
    let sum = 0;
    for (let i = 0; i < 10; i++) {
      const prod = parseInt(clean.charAt(i), 10) * weights[i];
      sum += prod < 10 ? prod : Math.floor(prod / 10) + (prod % 10);
    }
    const checkDigit = (10 - (sum % 10)) % 10;
    const actualCheck = parseInt(clean.charAt(10), 10);
    const isValid = checkDigit === actualCheck;
    const formatted = `${clean.slice(0, 3)}-${clean.slice(3, 10)}-${clean.slice(10)}`;

    return {
      isValid,
      type: 'Cédula',
      formatted,
      message: isValid ? 'Cédula de Identidad Válida' : 'Dígito verificador de Cédula inválido'
    };
  }

  return {
    isValid: false,
    type: 'Inválido',
    formatted: clean,
    message: `Requiere 9 dígitos (RNC) u 11 (Cédula). Actual: ${clean.length}`
  };
};

export const formatDominicanPhone = (input: string): string => {
  const clean = input.replace(/\D/g, '');
  if (!clean) return '';
  if (clean.length <= 3) return clean;
  if (clean.length <= 6) return `(${clean.slice(0, 3)}) ${clean.slice(3)}`;
  return `(${clean.slice(0, 3)}) ${clean.slice(3, 6)}-${clean.slice(6, 10)}`;
};

// Draft Storage Helpers
export const saveDraft = <T>(key: string, data: T): void => {
  try {
    localStorage.setItem(`mt_draft_${key}`, JSON.stringify({ data, savedAt: new Date().toISOString() }));
  } catch (err) {
    console.warn('No se pudo guardar el borrador en localStorage', err);
  }
};

export const loadDraft = <T>(key: string): { data: T; savedAt: string } | null => {
  try {
    const item = localStorage.getItem(`mt_draft_${key}`);
    if (!item) return null;
    return JSON.parse(item);
  } catch {
    return null;
  }
};

export const clearDraft = (key: string): void => {
  try {
    localStorage.removeItem(`mt_draft_${key}`);
  } catch {}
};
