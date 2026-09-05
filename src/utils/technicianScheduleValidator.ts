import { User, TechnicalVisit, TechnicianSchedule } from '../types';

export const DEFAULT_TECHNICIAN_SCHEDULE: TechnicianSchedule = {
  workDays: [1, 2, 3, 4, 5, 6], // Lunes (1) a Sábado (6)
  startTime: '08:00',
  endTime: '18:00',
  lunchStart: '12:00',
  lunchEnd: '13:00',
  maxVisitsPerDay: 6
};

export const DAYS_OF_WEEK_NAMES = [
  'Domingo',
  'Lunes',
  'Martes',
  'Miércoles',
  'Jueves',
  'Viernes',
  'Sábado'
];

/**
 * Parsea un string de hora en minutos desde la medianoche (0 a 1439).
 * Soporta formatos: "09:00 AM", "9:30 am", "02:45 PM", "14:30", "9:00".
 */
export function parseTimeToMinutes(timeStr: string): number | null {
  if (!timeStr) return null;
  const clean = timeStr.trim().toUpperCase();

  // Caso 1: Formato con AM/PM (ej. "09:30 AM", "2:15 PM")
  const ampmMatch = clean.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/);
  if (ampmMatch) {
    let hours = parseInt(ampmMatch[1], 10);
    const minutes = parseInt(ampmMatch[2], 10);
    const meridian = ampmMatch[3];

    if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) return null;

    if (meridian === 'PM' && hours < 12) {
      hours += 12;
    } else if (meridian === 'AM' && hours === 12) {
      hours = 0;
    }
    return hours * 60 + minutes;
  }

  return null;
}

/**
 * Convierte minutos desde la medianoche a formato legible "09:00 AM".
 */
export function formatMinutesToTime(totalMinutes: number): string {
  const normalized = ((totalMinutes % 1440) + 1440) % 1440;
  const hours24 = Math.floor(normalized / 60);
  const minutes = normalized % 60;

  const meridian = hours24 >= 12 ? 'PM' : 'AM';
  const hours12 = hours24 % 12 === 0 ? 12 : hours24 % 12;
  const mm = String(minutes).padStart(2, '0');
  const hh = String(hours12).padStart(2, '0');

  return `${hh}:${mm} ${meridian}`;
}

/**
 * Obtiene el día de la semana (0=Dom, 1=Lun, ..., 6=Sáb) a partir de una fecha YYYY-MM-DD.
 */
export function getDayOfWeekFromDate(dateStr: string): number {
  if (!dateStr) return 1;
  const [y, m, d] = dateStr.split('-').map(n => parseInt(n, 10));
  if (isNaN(y) || isNaN(m) || isNaN(d)) return 1;
  const date = new Date(y, m - 1, d);
  return date.getDay();
}

export interface ConflictingVisitInfo {
  visit: TechnicalVisit;
  startMinutes: number;
  endMinutes: number;
  formattedRange: string;
}

export interface ScheduleValidationResult {
  isValid: boolean;
  severity: 'success' | 'warning' | 'error';
  message: string;
  details: string[];
  hasConflict: boolean;
  conflictingVisits: ConflictingVisitInfo[];
  isNonWorkingDay: boolean;
  isOutsideWorkingHours: boolean;
  isLunchBreak: boolean;
  isOverloaded: boolean;
  workloadCount: number;
  maxVisits: number;
  suggestedSlots: string[];
}

export interface ValidateScheduleParams {
  technician: User;
  date: string; // YYYY-MM-DD
  time: string; // e.g. "09:00 AM" or "09:30"
  durationMinutes?: number; // e.g. 60
  existingVisits: TechnicalVisit[];
  currentVisitId?: string; // para excluir la propia visita cuando se edita
}

/**
 * Valida la disponibilidad del técnico para una fecha y hora determinadas.
 */
export function validateTechnicianSchedule(params: ValidateScheduleParams): ScheduleValidationResult {
  const { technician, date, time, durationMinutes = 60, existingVisits, currentVisitId } = params;
  const schedule = technician.schedule || DEFAULT_TECHNICIAN_SCHEDULE;

  const startMinutes = parseTimeToMinutes(time);
  if (startMinutes === null) {
    return {
      isValid: false,
      severity: 'error',
      message: 'Formato de hora no válido.',
      details: ['Ingrese una hora válida (ej. 09:00 AM, 02:30 PM).'],
      hasConflict: false,
      conflictingVisits: [],
      isNonWorkingDay: false,
      isOutsideWorkingHours: false,
      isLunchBreak: false,
      isOverloaded: false,
      workloadCount: 0,
      maxVisits: schedule.maxVisitsPerDay || 6,
      suggestedSlots: ['09:00 AM', '11:00 AM', '02:30 PM']
    };
  }

  const endMinutes = startMinutes + durationMinutes;
  const dayOfWeek = getDayOfWeekFromDate(date);
  const dayName = DAYS_OF_WEEK_NAMES[dayOfWeek];

  const schedStart = parseTimeToMinutes(schedule.startTime) ?? 8 * 60; // 08:00
  const schedEnd = parseTimeToMinutes(schedule.endTime) ?? 18 * 60;   // 18:00
  const lunchStart = schedule.lunchStart ? parseTimeToMinutes(schedule.lunchStart) : 12 * 60;
  const lunchEnd = schedule.lunchEnd ? parseTimeToMinutes(schedule.lunchEnd) : 13 * 60;
  const maxVisits = schedule.maxVisitsPerDay || 6;

  const details: string[] = [];

  // 1. Día de trabajo
  const isNonWorkingDay = !schedule.workDays.includes(dayOfWeek);
  if (isNonWorkingDay) {
    details.push(`El ${dayName} no es día laboral habitual para ${technician.name}.`);
  }

  // 2. Horario de jornada
  const isOutsideWorkingHours = startMinutes < schedStart || endMinutes > schedEnd;
  if (isOutsideWorkingHours) {
    details.push(
      `La cita (${formatMinutesToTime(startMinutes)} - ${formatMinutesToTime(endMinutes)}) excede la jornada laboral (${formatMinutesToTime(schedStart)} - ${formatMinutesToTime(schedEnd)}).`
    );
  }

  // 3. Almuerzo
  let isLunchBreak = false;
  if (lunchStart !== null && lunchEnd !== null) {
    if (startMinutes < lunchEnd && endMinutes > lunchStart) {
      isLunchBreak = true;
      details.push(`Coincide con el horario de receso/almuerzo (${formatMinutesToTime(lunchStart)} - ${formatMinutesToTime(lunchEnd)}).`);
    }
  }

  // 4. Choque de horarios con otras visitas activas
  const activeVisitsOnDate = existingVisits.filter(v => {
    if (v.status === 'cancelled') return false;
    if (currentVisitId && v.id === currentVisitId) return false;
    if (v.date !== date) return false;

    // Comparar por ID o por nombre
    const matchesId = v.assignedTechnicianId && v.assignedTechnicianId === technician.id;
    const matchesName = v.assignedTechnician && v.assignedTechnician.trim().toLowerCase() === technician.name.trim().toLowerCase();
    return matchesId || matchesName;
  });

  const conflictingVisits: ConflictingVisitInfo[] = [];

  for (const visit of activeVisitsOnDate) {
    const vStart = parseTimeToMinutes(visit.time);
    if (vStart === null) continue;
    const vDuration = visit.durationMinutes || 60;
    const vEnd = vStart + vDuration;

    // Condición de solapamiento: start < vEnd && end > vStart
    if (startMinutes < vEnd && endMinutes > vStart) {
      conflictingVisits.push({
        visit,
        startMinutes: vStart,
        endMinutes: vEnd,
        formattedRange: `${formatMinutesToTime(vStart)} - ${formatMinutesToTime(vEnd)}`
      });
    }
  }

  const hasConflict = conflictingVisits.length > 0;
  if (hasConflict) {
    conflictingVisits.forEach(c => {
      details.push(
        `Conflicto con "${c.visit.title}" (${c.visit.clientName}) programada de ${c.formattedRange}.`
      );
    });
  }

  // 5. Carga de trabajo
  const workloadCount = activeVisitsOnDate.length;
  const isOverloaded = workloadCount >= maxVisits;
  if (isOverloaded) {
    details.push(`El técnico ya tiene ${workloadCount} visitas asignadas para esta fecha (Límite sugerido: ${maxVisits}).`);
  }

  // 6. Sugerencias de horarios libres en esa misma fecha
  const suggestedSlots: string[] = [];
  const candidateMinutes = [
    8 * 60 + 30,  // 08:30 AM
    9 * 60 + 30,  // 09:30 AM
    10 * 60 + 30, // 10:30 AM
    11 * 60 + 30, // 11:30 AM
    14 * 60,      // 02:00 PM
    15 * 60 + 30, // 03:30 PM
    16 * 60 + 30  // 04:30 PM
  ];

  for (const candStart of candidateMinutes) {
    const candEnd = candStart + durationMinutes;
    if (candStart < schedStart || candEnd > schedEnd) continue;
    if (lunchStart !== null && lunchEnd !== null && candStart < lunchEnd && candEnd > lunchStart) continue;

    // Verificar si colisiona con alguna visita
    const hasCandConflict = activeVisitsOnDate.some(v => {
      const vStart = parseTimeToMinutes(v.time);
      if (vStart === null) return false;
      const vEnd = vStart + (v.durationMinutes || 60);
      return candStart < vEnd && candEnd > vStart;
    });

    if (!hasCandConflict && candStart !== startMinutes) {
      suggestedSlots.push(formatMinutesToTime(candStart));
      if (suggestedSlots.length >= 3) break;
    }
  }

  // Determinar severidad y mensaje final
  let severity: 'success' | 'warning' | 'error' = 'success';
  let message = 'Técnico disponible en el horario seleccionado.';

  if (hasConflict) {
    severity = 'error';
    message = `Conflicto de horario: El técnico ya tiene ${conflictingVisits.length === 1 ? 'una visita' : `${conflictingVisits.length} visitas`} en este intervalo.`;
  } else if (isNonWorkingDay || isOutsideWorkingHours || isOverloaded) {
    severity = 'warning';
    if (isNonWorkingDay) {
      message = `${dayName} no es día laboral habitual para este técnico.`;
    } else if (isOutsideWorkingHours) {
      message = 'La cita se encuentra fuera del rango de la jornada habitual.';
    } else {
      message = `Carga diaria alta (${workloadCount} visitas asignadas hoy).`;
    }
  } else if (isLunchBreak) {
    severity = 'warning';
    message = 'La visita coincide con el horario de almuerzo del técnico.';
  }

  return {
    isValid: !hasConflict,
    severity,
    message,
    details,
    hasConflict,
    conflictingVisits,
    isNonWorkingDay,
    isOutsideWorkingHours,
    isLunchBreak,
    isOverloaded,
    workloadCount,
    maxVisits,
    suggestedSlots
  };
}
