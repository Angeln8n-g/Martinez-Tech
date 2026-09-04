import { FiscalInvoice } from '../types';
import { validateDominicanRNC } from './formatters';

export interface DgiiValidationIssue {
  invoiceId: string;
  invoiceNumber: string;
  ncf: string;
  severity: 'error' | 'warning';
  message: string;
}

export interface Dgii607Summary {
  periodMonth: number;
  periodYear: number;
  totalRecords: number;
  totalInvoicedAmount: number;
  totalTaxableAmount: number;
  totalTaxAmount: number;
  totalRetainedItbis: number;
  totalRetainedIsr: number;
  b01Count: number;
  b02Count: number;
  otherNcfCount: number;
  issues: DgiiValidationIssue[];
}

/**
 * Limpia el RNC o Cédula removiendo guiones, espacios y caracteres no numéricos.
 */
export function cleanDocNumber(doc: string | undefined): string {
  if (!doc) return '';
  return doc.replace(/\D/g, '');
}

/**
 * Determina el tipo de identificación según la longitud del documento dominicano:
 * 1 = RNC (9 dígitos)
 * 2 = Cédula (11 dígitos)
 * 3 = Pasaporte / Extranjero
 */
export function getDgiiIdType(doc: string | undefined): string {
  const clean = cleanDocNumber(doc);
  if (clean.length === 9) return '1';
  if (clean.length === 11) return '2';
  return '3';
}

/**
 * Convierte una fecha ISO (YYYY-MM-DD...) a formato DGII (AAAAMMDD).
 */
export function formatDgiiDate(dateStr: string | undefined): string {
  if (!dateStr) return '';
  const clean = dateStr.slice(0, 10).replace(/-/g, '');
  return clean.length === 8 ? clean : '';
}

/**
 * Mapea el método de pago al código oficial DGII:
 * 01 = Efectivo
 * 02 = Cheque / Transferencia / Depósito
 * 03 = Tarjeta Débito / Crédito
 * 04 = A Crédito
 */
export function getDgiiPaymentMethodCode(method: string | undefined): string {
  switch (method?.toLowerCase()) {
    case 'efectivo':
      return '01';
    case 'transferencia':
    case 'cheque':
      return '02';
    case 'tarjeta':
      return '03';
    case 'credito':
      return '04';
    default:
      return '02'; // Predeterminado para transacciones B2B
  }
}

/**
 * Filtra las facturas correspondientes a un periodo mensual fiscal específico.
 */
export function filterInvoicesByPeriod(
  invoices: FiscalInvoice[],
  year: number,
  month: number
): FiscalInvoice[] {
  const targetPrefix = `${year}-${String(month).padStart(2, '0')}`;
  return invoices.filter(inv => {
    if (!inv.date) return false;
    return inv.date.startsWith(targetPrefix);
  });
}

/**
 * Valida un lote de facturas antes de generar el Formato 607, alertando sobre inconsistencias
 * que causarían rechazo en la Oficina Virtual de la DGII.
 */
export function validate607Invoices(
  invoices: FiscalInvoice[],
  year: number,
  month: number
): DgiiValidationIssue[] {
  const issues: DgiiValidationIssue[] = [];

  invoices.forEach(inv => {
    const cleanRnc = cleanDocNumber(inv.clientRnc);

    // 1. Facturas B01 requieren RNC/Cédula obligatorio y válido
    if (inv.ncfType === 'B01') {
      if (!cleanRnc) {
        issues.push({
          invoiceId: inv.id,
          invoiceNumber: inv.invoiceNumber,
          ncf: inv.ncf,
          severity: 'error',
          message: 'Comprobante de Crédito Fiscal (B01) sin RNC/Cédula del cliente.'
        });
      } else {
        const val = validateDominicanRNC(cleanRnc);
        if (!val.isValid) {
          issues.push({
            invoiceId: inv.id,
            invoiceNumber: inv.invoiceNumber,
            ncf: inv.ncf,
            severity: 'error',
            message: `RNC/Cédula "${inv.clientRnc}" no supera el algoritmo de validación DGII.`
          });
        }
      }
    }

    // 2. Longitud y formato del NCF (debe ser 11 caracteres: B + 10 dígitos)
    const cleanNcf = (inv.ncf || '').trim().toUpperCase();
    if (!/^B[0-9]{10}$/.test(cleanNcf)) {
      issues.push({
        invoiceId: inv.id,
        invoiceNumber: inv.invoiceNumber,
        ncf: inv.ncf,
        severity: 'error',
        message: `El NCF "${inv.ncf}" no cumple con el formato estándar de 11 caracteres (ej. B0100000001).`
      });
    }

    // 3. Montos en cero
    if (!inv.total || inv.total <= 0) {
      issues.push({
        invoiceId: inv.id,
        invoiceNumber: inv.invoiceNumber,
        ncf: inv.ncf,
        severity: 'warning',
        message: 'La factura tiene un monto total de RD$ 0.00.'
      });
    }

    // 4. Verificación de fecha
    const invYearMonth = inv.date?.slice(0, 7);
    const targetPeriod = `${year}-${String(month).padStart(2, '0')}`;
    if (invYearMonth !== targetPeriod) {
      issues.push({
        invoiceId: inv.id,
        invoiceNumber: inv.invoiceNumber,
        ncf: inv.ncf,
        severity: 'warning',
        message: `Fecha de emisión (${inv.date}) fuera del periodo seleccionado (${targetPeriod}).`
      });
    }
  });

  return issues;
}

/**
 * Calcula métricas y resumen fiscal del periodo para el Formato 607.
 */
export function calculate607Summary(
  invoices: FiscalInvoice[],
  year: number,
  month: number
): Dgii607Summary {
  const filtered = filterInvoicesByPeriod(invoices, year, month);
  const issues = validate607Invoices(filtered, year, month);

  let totalInvoicedAmount = 0;
  let totalTaxableAmount = 0;
  let totalTaxAmount = 0;
  let b01Count = 0;
  let b02Count = 0;
  let otherNcfCount = 0;

  filtered.forEach(inv => {
    totalInvoicedAmount += inv.total || 0;
    totalTaxableAmount += inv.subtotal || 0;
    totalTaxAmount += inv.taxAmount || 0;

    if (inv.ncfType === 'B01') b01Count++;
    else if (inv.ncfType === 'B02') b02Count++;
    else otherNcfCount++;
  });

  return {
    periodMonth: month,
    periodYear: year,
    totalRecords: filtered.length,
    totalInvoicedAmount,
    totalTaxableAmount,
    totalTaxAmount,
    totalRetainedItbis: 0,
    totalRetainedIsr: 0,
    b01Count,
    b02Count,
    otherNcfCount,
    issues
  };
}

/**
 * Genera el archivo oficial de texto plano (.txt) del Formato 607 delimitado por plecas (|)
 * para carga directa en la Oficina Virtual de la DGII.
 * 
 * Estructura de cabecera:
 * 607|RNC_EMPRESA|PERIODO_AAAAMM|CANTIDAD_REGISTROS
 */
export function generate607Txt(
  invoices: FiscalInvoice[],
  year: number,
  month: number,
  companyRnc: string
): string {
  const filtered = filterInvoicesByPeriod(invoices, year, month);
  const cleanCompanyRnc = cleanDocNumber(companyRnc) || '131994451';
  const periodStr = `${year}${String(month).padStart(2, '0')}`;

  const header = `607|${cleanCompanyRnc}|${periodStr}|${filtered.length}`;

  const rows = filtered.map(inv => {
    const clientDoc = cleanDocNumber(inv.clientRnc);
    const idType = getDgiiIdType(inv.clientRnc);
    const ncf = (inv.ncf || '').trim().toUpperCase();
    const modifiedNcf = ''; // Notas de crédito B04
    const incomeType = '01'; // 01 = Operaciones no financieras (instalación y venta de tecnología)
    const invoiceDate = formatDgiiDate(inv.date);
    const retentionDate = ''; // Vacío si no hubo retención

    // Monto facturado neto (sin ITBIS)
    const taxableAmount = (inv.subtotal || 0).toFixed(2);
    // ITBIS liquidado (18%)
    const itbisAmount = (inv.taxAmount || 0).toFixed(2);
    // Retenciones
    const itbisRetained = '0.00';
    const itbisPerceived = '0.00';
    const isrRetained = '0.00';
    const isrPerceived = '0.00';
    const selectiveTax = '0.00';
    const otherTaxes = '0.00';
    const legalTip = '0.00';

    // Medios de pago
    const cash = inv.paymentMethod === 'efectivo' ? (inv.total || 0).toFixed(2) : '0.00';
    const wireOrCheck = (inv.paymentMethod === 'transferencia' || inv.paymentMethod === 'cheque') 
      ? (inv.total || 0).toFixed(2) : '0.00';
    const card = inv.paymentMethod === 'tarjeta' ? (inv.total || 0).toFixed(2) : '0.00';
    const credit = (inv.paymentStatus === 'pending') ? (inv.total || 0).toFixed(2) : '0.00';
    const giftCertificates = '0.00';
    const swap = '0.00';
    const otherPaymentForms = '0.00';

    return [
      clientDoc,
      idType,
      ncf,
      modifiedNcf,
      incomeType,
      invoiceDate,
      retentionDate,
      taxableAmount,
      itbisAmount,
      itbisRetained,
      itbisPerceived,
      isrRetained,
      isrPerceived,
      selectiveTax,
      otherTaxes,
      legalTip,
      cash,
      wireOrCheck,
      card,
      credit,
      giftCertificates,
      swap,
      otherPaymentForms
    ].join('|');
  });

  return [header, ...rows].join('\r\n');
}

/**
 * Genera el reporte en formato CSV compatible con Excel para auditoría contable interna.
 */
export function generate607Csv(
  invoices: FiscalInvoice[],
  year: number,
  month: number
): string {
  const filtered = filterInvoicesByPeriod(invoices, year, month);

  const headers = [
    'RNC/Cédula Comprador',
    'Tipo Identificación',
    'NCF',
    'Tipo Comprobante',
    'Fecha Emisión',
    'Cliente / Razón Social',
    'Monto Facturado (Neto)',
    'ITBIS Facturado (18%)',
    'Total Facturado (DOP)',
    'Forma de Pago',
    'Estado de Pago'
  ];

  const rows = filtered.map(inv => [
    cleanDocNumber(inv.clientRnc),
    getDgiiIdType(inv.clientRnc) === '1' ? '1 (RNC)' : '2 (Cédula)',
    inv.ncf,
    inv.ncfType,
    inv.date,
    inv.clientName,
    (inv.subtotal || 0).toFixed(2),
    (inv.taxAmount || 0).toFixed(2),
    (inv.total || 0).toFixed(2),
    inv.paymentMethod,
    inv.paymentStatus === 'paid' ? 'Pagada' : 'Pendiente'
  ]);

  const escapeCell = (c: any) => `"${(c || '').toString().replace(/"/g, '""')}"`;

  const csvRows = [
    headers.map(escapeCell).join(','),
    ...rows.map(row => row.map(escapeCell).join(','))
  ];

  return '\uFEFF' + csvRows.join('\n');
}
