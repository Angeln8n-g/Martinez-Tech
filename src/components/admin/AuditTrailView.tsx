import React, { useState } from 'react';
import { useAppState } from '../../context/AppStateContext';
import { useToast } from '../ui/ToastNotification';
import { AuditLog } from '../../types';
import { 
  ShieldCheck, 
  Search, 
  Filter, 
  Download, 
  Calendar, 
  Clock, 
  User, 
  FileText, 
  Receipt, 
  DollarSign, 
  Wrench, 
  Package, 
  UserCheck,
  CheckCircle2,
  AlertCircle,
  Boxes
} from 'lucide-react';
import { formatDate } from '../../utils/formatters';

export const AuditTrailView: React.FC = () => {
  const { auditLogs, users } = useAppState();
  const { showToast } = useToast();

  const [searchTerm, setSearchTerm] = useState('');
  const [entityFilter, setEntityFilter] = useState<string>('all');
  const [userFilter, setUserFilter] = useState<string>('all');

  // Filtered logs
  const filteredLogs = auditLogs.filter(log => {
    const matchesSearch = 
      log.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (log.entityId && log.entityId.toLowerCase().includes(searchTerm.toLowerCase())) ||
      log.action.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesEntity = entityFilter === 'all' || log.entityType === entityFilter;
    const matchesUser = userFilter === 'all' || log.userName === userFilter || log.userId === userFilter;

    return matchesSearch && matchesEntity && matchesUser;
  });

  // Action Badge Helper
  const getActionBadge = (action: string, entityType: string) => {
    switch (entityType) {
      case 'fiscal_invoice':
        return {
          label: 'Facturación NCF',
          icon: Receipt,
          color: 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-600/40'
        };
      case 'payment':
        return {
          label: 'Cobro / Pago',
          icon: DollarSign,
          color: 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-600/40'
        };
      case 'quote':
        return {
          label: 'Cotización',
          icon: FileText,
          color: 'bg-purple-100 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300 border-purple-300 dark:border-purple-600/40'
        };
      case 'work_order':
        return {
          label: 'Orden de Trabajo',
          icon: Wrench,
          color: 'bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 border-blue-300 dark:border-blue-600/40'
        };
      case 'catalog_product':
        return {
          label: 'Catálogo & Precios',
          icon: Package,
          color: 'bg-cyan-100 dark:bg-cyan-950/60 text-cyan-800 dark:text-cyan-300 border-cyan-300 dark:border-cyan-600/40'
        };
      case 'inventory_movement':
        return {
          label: 'Inventario & Kardex',
          icon: Boxes,
          color: 'bg-teal-100 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300 border-teal-300 dark:border-teal-600/40'
        };
      case 'user':
        return {
          label: 'Usuarios & Seguridad',
          icon: UserCheck,
          color: 'bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border-rose-300 dark:border-rose-600/40'
        };
      default:
        return {
          label: action,
          icon: ShieldCheck,
          color: 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-300 border-slate-300 dark:border-slate-700'
        };
    }
  };

  // Export CSV
  const handleExportCsv = () => {
    if (filteredLogs.length === 0) {
      showToast('No hay registros de auditoría para exportar.', 'warning');
      return;
    }

    const headers = ['Fecha y Hora', 'Usuario', 'Rol', 'Acción', 'Módulo / Entidad', 'ID Referencia', 'Detalle de la Operación'];
    const rows = filteredLogs.map(l => [
      new Date(l.createdAt).toLocaleString('es-DO'),
      l.userName,
      l.userRole,
      l.action,
      l.entityType,
      l.entityId || '',
      `"${l.details.replace(/"/g, '""')}"`
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Auditoria_Operaciones_Martinez_Tech_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    showToast('Bitácora de auditoría exportada en CSV', 'success');
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-300 dark:border-slate-800 shadow-md">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-950/80 border border-purple-300 dark:border-purple-500/40 flex items-center justify-center text-purple-700 dark:text-purple-300 shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-900 dark:text-white">
              Pista de Auditoría & Trazabilidad de Operaciones
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
              Registro inalterable de comprobantes fiscales, transacciones, cobros, firmas de clientes y cambios en el sistema.
            </p>
          </div>
        </div>

        <button
          onClick={handleExportCsv}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs border border-slate-300 dark:border-slate-700 shadow-sm transition-colors whitespace-nowrap self-start sm:self-auto"
        >
          <Download className="w-4 h-4 text-purple-600 dark:text-purple-400" />
          <span>Exportar Bitácora CSV</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 shadow-sm flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 tracking-wider block">
              Total Registros
            </span>
            <span className="text-xl font-black text-slate-900 dark:text-white">
              {auditLogs.length}
            </span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 shadow-sm flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
            <Receipt className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 tracking-wider block">
              Operaciones Fiscales
            </span>
            <span className="text-xl font-black text-slate-900 dark:text-white">
              {auditLogs.filter(l => l.entityType === 'fiscal_invoice').length}
            </span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 shadow-sm flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
            <DollarSign className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 tracking-wider block">
              Cobros Auditados
            </span>
            <span className="text-xl font-black text-slate-900 dark:text-white">
              {auditLogs.filter(l => l.entityType === 'payment').length}
            </span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 shadow-sm flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
            <Wrench className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 tracking-wider block">
              Órdenes de Trabajo
            </span>
            <span className="text-xl font-black text-slate-900 dark:text-white">
              {auditLogs.filter(l => l.entityType === 'work_order').length}
            </span>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-300 dark:border-slate-800 shadow-sm">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por comprobante NCF, usuario, detalle o ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-brand-teal-500"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={entityFilter}
            onChange={(e) => setEntityFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none focus:border-brand-teal-500"
          >
            <option value="all">Todos los Módulos</option>
            <option value="fiscal_invoice">Facturas Fiscales NCF</option>
            <option value="payment">Cobros & Recibos</option>
            <option value="quote">Cotizaciones & Firmas</option>
            <option value="work_order">Órdenes de Trabajo & GPS</option>
            <option value="catalog_product">Catálogo & Precios</option>
            <option value="inventory_movement">Inventario & Kardex</option>
            <option value="user">Usuarios & Seguridad</option>
          </select>

          <select
            value={userFilter}
            onChange={(e) => setUserFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none focus:border-brand-teal-500"
          >
            <option value="all">Todos los Usuarios</option>
            {users.map(u => (
              <option key={u.id} value={u.name}>{u.name} ({u.role})</option>
            ))}
          </select>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-3xl overflow-hidden shadow-md">
        {filteredLogs.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 mx-auto">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">
              No se encontraron registros de auditoría
            </h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Las operaciones críticas (facturación, firmas, cobros y cambios de precio) quedarán registradas aquí automáticamente.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-950/60 text-slate-700 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-800">
                  <th className="py-3 px-4">Fecha & Hora</th>
                  <th className="py-3 px-4">Usuario Responsable</th>
                  <th className="py-3 px-4">Módulo</th>
                  <th className="py-3 px-4">Detalle de la Operación</th>
                  <th className="py-3 px-4 text-right">Referencia</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredLogs.map(log => {
                  const badge = getActionBadge(log.action, log.entityType);
                  const Icon = badge.icon;
                  const dateObj = new Date(log.createdAt);
                  const timeFormatted = dateObj.toLocaleTimeString('es-DO', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
                  const dateFormatted = dateObj.toLocaleDateString('es-DO', { day: '2-digit', month: 'short', year: 'numeric' });

                  return (
                    <tr key={log.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span>{dateFormatted}</span>
                        </div>
                        <div className="text-[11px] text-slate-500 font-mono flex items-center gap-1 mt-0.5">
                          <Clock className="w-3 h-3 text-slate-400" />
                          <span>{timeFormatted}</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-black ${
                            log.userRole === 'admin' 
                              ? 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300' 
                              : log.userRole === 'seller'
                              ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                              : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          }`}>
                            {log.userName.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 dark:text-white leading-tight">{log.userName}</div>
                            <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                              {log.userRole === 'admin' ? 'Administrador' : log.userRole === 'seller' ? 'Vendedor' : 'Técnico'}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold border ${badge.color}`}>
                          <Icon className="w-3.5 h-3.5" />
                          <span>{badge.label}</span>
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <p className="text-slate-800 dark:text-slate-200 font-medium leading-relaxed">
                          {log.details}
                        </p>
                      </td>

                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        {log.entityId ? (
                          <span className="font-mono text-[11px] font-bold px-2 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700">
                            {log.entityId}
                          </span>
                        ) : (
                          <span className="text-slate-400 text-[10px] italic">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
};
