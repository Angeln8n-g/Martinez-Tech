/**
 * DGII Dominican Republic Tax ID (RNC / Cédula) Validator and Formatter
 * 
 * Complies with the official algorithms from Dirección General de Impuestos Internos (DGII):
 * - RNC (Persona Jurídica / Empresas): 9 dígitos numéricos, validado con Módulo 11.
 * - Cédula (Persona Física): 11 dígitos numéricos, validado con algoritmo de Luhn (Módulo 10).
 */

export interface DgiiValidationResult {
  isValid: boolean;
  type: 'empresa' | 'cedula' | 'invalido' | 'vacio';
  formatted: string;
  message: string;
  rawDigits: string;
}

/**
 * Valida un RNC empresarial de 9 dígitos según el algoritmo oficial Módulo 11 de la DGII.
 */
export function validateRncEmpresa(digits: string): boolean {
  if (digits.length !== 9 || !/^\d+$/.test(digits)) return false;

  const weights = [7, 9, 8, 6, 5, 4, 3, 2];
  let sum = 0;

  for (let i = 0; i < 8; i++) {
    sum += parseInt(digits[i], 10) * weights[i];
  }

  const remainder = sum % 11;
  let checkDigit = 0;

  if (remainder === 0) {
    checkDigit = 2;
  } else if (remainder === 1) {
    checkDigit = 1;
  } else {
    checkDigit = 11 - remainder;
  }

  return parseInt(digits[8], 10) === checkDigit;
}

/**
 * Valida una Cédula de Identidad de 11 dígitos según el algoritmo oficial Módulo 10 (Luhn modificado) de la JCE / DGII.
 */
export function validateCedula(digits: string): boolean {
  if (digits.length !== 11 || !/^\d+$/.test(digits)) return false;

  const multipliers = [1, 2, 1, 2, 1, 2, 1, 2, 1, 2];
  let sum = 0;

  for (let i = 0; i < 10; i++) {
    let mult = parseInt(digits[i], 10) * multipliers[i];
    if (mult >= 10) {
      mult = Math.floor(mult / 10) + (mult % 10);
    }
    sum += mult;
  }

  const remainder = sum % 10;
  const checkDigit = (10 - remainder) % 10;

  return parseInt(digits[10], 10) === checkDigit;
}

/**
 * Función principal para validar e identificar si un valor es RNC Jurídico o Cédula Dominicana.
 */
export function validateDgiiDocument(value: string | undefined | null): DgiiValidationResult {
  if (!value) {
    return {
      isValid: false,
      type: 'vacio',
      formatted: '',
      message: 'Campo vacío',
      rawDigits: ''
    };
  }

  // Limpiar guiones, espacios y otros caracteres
  const clean = value.replace(/\D/g, '');

  if (clean.length === 0) {
    return {
      isValid: false,
      type: 'vacio',
      formatted: '',
      message: 'Ingrese RNC o Cédula',
      rawDigits: ''
    };
  }

  // Caso 1: RNC de Empresa (9 dígitos)
  if (clean.length === 9) {
    const isValid = validateRncEmpresa(clean);
    // Formato: 1-31-99445-1
    const formatted = `${clean.slice(0, 1)}-${clean.slice(1, 3)}-${clean.slice(3, 8)}-${clean.slice(8)}`;
    return {
      isValid,
      type: isValid ? 'empresa' : 'invalido',
      formatted,
      rawDigits: clean,
      message: isValid ? 'RNC Jurídico Válido (DGII)' : 'RNC Inválido (Dígito verificador incorrecto)'
    };
  }

  // Caso 2: Cédula de Persona Física (11 dígitos)
  if (clean.length === 11) {
    const isValid = validateCedula(clean);
    // Formato: 001-1234567-8
    const formatted = `${clean.slice(0, 3)}-${clean.slice(3, 10)}-${clean.slice(10)}`;
    return {
      isValid,
      type: isValid ? 'cedula' : 'invalido',
      formatted,
      rawDigits: clean,
      message: isValid ? 'Cédula de Identidad Válida' : 'Cédula Inválida (Dígito verificador incorrecto)'
    };
  }

  // Longitud en proceso de digitación o incorrecta
  return {
    isValid: false,
    type: 'invalido',
    formatted: clean,
    rawDigits: clean,
    message: clean.length < 9 
      ? `Faltan dígitos (${clean.length}/9 RNC o 11 Cédula)` 
      : `Longitud incorrecta (${clean.length} dígitos. Debe ser 9 u 11)`
  };
}

/**
 * Formatea automáticamente el RNC o Cédula mientras el usuario escribe.
 */
export function formatDgiiInput(val: string): string {
  const clean = val.replace(/\D/g, '');
  if (clean.length <= 9) {
    if (clean.length <= 1) return clean;
    if (clean.length <= 3) return `${clean.slice(0, 1)}-${clean.slice(1)}`;
    if (clean.length <= 8) return `${clean.slice(0, 1)}-${clean.slice(1, 3)}-${clean.slice(3)}`;
    return `${clean.slice(0, 1)}-${clean.slice(1, 3)}-${clean.slice(3, 8)}-${clean.slice(8)}`;
  }
  // Si supera 9 dígitos, formatear como Cédula (11 dígitos)
  if (clean.length <= 3) return clean;
  if (clean.length <= 10) return `${clean.slice(0, 3)}-${clean.slice(3)}`;
  return `${clean.slice(0, 3)}-${clean.slice(3, 10)}-${clean.slice(10, 11)}`;
}
