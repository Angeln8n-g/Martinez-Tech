import React from 'react';
import { validateDgiiDocument } from '../../utils/dgiiValidator';
import { CheckCircle2, AlertCircle, Building2, User } from 'lucide-react';

interface RncValidatorBadgeProps {
  value: string;
  className?: string;
  showWhenEmpty?: boolean;
}

export const RncValidatorBadge: React.FC<RncValidatorBadgeProps> = ({ 
  value, 
  className = '',
  showWhenEmpty = false 
}) => {
  if (!value && !showWhenEmpty) return null;

  const result = validateDgiiDocument(value);

  if (result.type === 'vacio') {
    if (!showWhenEmpty) return null;
    return (
      <div className={`flex items-center gap-1.5 text-[11px] font-medium text-slate-400 ${className}`}>
        <span>Ingrese RNC (9 dígitos) o Cédula (11 dígitos)</span>
      </div>
    );
  }

  if (result.isValid) {
    return (
      <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-bold transition-all ${
        result.type === 'empresa'
          ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-600/40'
          : 'bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-400 border border-blue-300 dark:border-blue-600/40'
      } ${className}`}>
        <CheckCircle2 className="w-3.5 h-3.5" />
        {result.type === 'empresa' ? (
          <span className="flex items-center gap-1">
            <Building2 className="w-3 h-3" />
            ✓ RNC Jurídico Válido (DGII)
          </span>
        ) : (
          <span className="flex items-center gap-1">
            <User className="w-3 h-3" />
            ✓ Cédula Válida
          </span>
        )}
      </div>
    );
  }

  // Inválido o en digitación
  return (
    <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-amber-50 dark:bg-amber-950/50 text-amber-800 dark:text-amber-400 border border-amber-300 dark:border-amber-600/40 ${className}`}>
      <AlertCircle className="w-3.5 h-3.5" />
      <span>{result.message}</span>
    </div>
  );
};
