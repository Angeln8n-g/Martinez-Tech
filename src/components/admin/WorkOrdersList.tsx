import React, { useState } from 'react';
import { useAppState } from '../../context/AppStateContext';
import { WorkOrder, WorkOrderStatus } from '../../types';
import { 
  Plus, 
  Search, 
  Wrench, 
  CheckCircle2, 
  Clock, 
  FileText, 
  User, 
  Calendar, 
  MapPin, 
  Trash2, 
  Edit, 
  Eye,
  PenTool,
  Printer,
  Image as ImageIcon
} from 'lucide-react';
import { formatDate, getCategoryInfo } from '../../utils/formatters';

export const WorkOrdersList: React.FC = () => {
  const { 
    workOrders, 
    deleteWorkOrder, 
    setIsWorkOrderModalOpen, 
    setActiveWorkOrderForEdit, 
    setActiveWorkOrderForView 
  } = useAppState();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [technicianFilter, setTechnicianFilter] = useState<string>('all');

  // Extract unique technicians
  const technicians = Array.from(new Set(workOrders.map(w => w.assignedTechnician))).filter(Boolean);

  const filteredOrders = workOrders.filter(w => {
    const matchesSearch = 
      w.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      w.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      w.clientAddress.toLowerCase().includes(searchTerm.toLowerCase()) ||
      w.scopeOfWork.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || w.status === statusFilter;
    const matchesTech = technicianFilter === 'all' || w.assignedTechnician === technicianFilter;

    return matchesSearch && matchesStatus && matchesTech;
  });

  const getStatusBadge = (status: WorkOrderStatus) => {
    switch (status) {
      case 'signed':
        return (
          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-500/30 flex items-center gap-1 shadow-sm">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            <span>Firmada & Aceptada</span>
          </span>
        );
      case 'completed':
        return (
          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-100 dark:bg-blue-950/80 text-blue-800 dark:text-blue-300 border border-blue-300 dark:border-blue-500/30 flex items-center gap-1 shadow-sm">
            <CheckCircle2 className="w-3 h-3 text-blue-600" />
            <span>Trabajo Terminado</span>
          </span>
        );
      case 'in_progress':
        return (
          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-500/30 flex items-center gap-1 shadow-sm">
            <Clock className="w-3 h-3 text-amber-600" />
            <span>En Ejecución</span>
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-300 border border-slate-300 dark:border-slate-700 flex items-center gap-1">
            <Clock className="w-3 h-3 text-slate-500" />
            <span>Pendiente</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-300 dark:border-slate-800 shadow-md">
        
        <div className="flex items-center gap-3 flex-1 flex-wrap">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por N° de orden, cliente, dirección o alcance..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white placeholder-slate-500 focus:outline-none focus:border-brand-teal-500 shadow-sm"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200 font-bold focus:outline-none focus:border-brand-teal-500 shadow-sm"
          >
            <option value="all">Todos los Estados</option>
            <option value="pending">Pendientes</option>
            <option value="in_progress">En Ejecución</option>
            <option value="completed">Trabajo Terminado</option>
            <option value="signed">Firmadas Conforme</option>
          </select>

          {technicians.length > 0 && (
            <select
              value={technicianFilter}
              onChange={(e) => setTechnicianFilter(e.target.value)}
              className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200 font-bold focus:outline-none focus:border-brand-teal-500 shadow-sm"
            >
              <option value="all">Todos los Técnicos</option>
              {technicians.map((t, idx) => (
                <option key={idx} value={t}>{t}</option>
              ))}
            </select>
          )}
        </div>

        <button
          onClick={() => {
            setActiveWorkOrderForEdit(null);
            setIsWorkOrderModalOpen(true);
          }}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-green-600 hover:bg-brand-green-500 text-white font-bold text-xs shadow-md border border-brand-green-700/20"
        >
          <Plus className="w-4 h-4" />
          <span>Nueva Orden de Trabajo</span>
        </button>
      </div>

      {/* Orders Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredOrders.map((order) => {
          const catInfo = getCategoryInfo(order.serviceCategory);
          const completedCount = order.checklist?.filter(c => c.completed).length || 0;
          const totalCount = order.checklist?.length || 0;
          const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
          const totalPhotos = (order.beforeImages?.length || 0) + (order.afterImages?.length || 0);

          return (
            <div
              key={order.id}
              className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 hover:border-brand-teal-500 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-0.5">
                    <span className="text-xs font-mono font-bold text-emerald-800 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-300 dark:border-emerald-500/30">
                      {order.orderNumber}
                    </span>
                    <h4 className="text-base font-bold text-slate-900 dark:text-white leading-tight pt-1">
                      {order.clientName}
                    </h4>
                  </div>
                  {getStatusBadge(order.status)}
                </div>

                <p className="text-xs text-slate-700 dark:text-slate-400 line-clamp-2">
                  {order.scopeOfWork}
                </p>

                <div className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
                  <div className="flex items-center gap-2">
                    <User className="w-3.5 h-3.5 text-brand-teal-600 flex-shrink-0" />
                    <span>{order.assignedTechnician}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
                    <span>Fecha: {formatDate(order.completedDate || order.scheduledDate)}</span>
                  </div>

                  {order.clientAddress && (
                    <div className="flex items-start gap-2 text-[11px] text-slate-600 dark:text-slate-400">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0 mt-0.5" />
                      <span className="truncate">{order.clientAddress}</span>
                    </div>
                  )}
                </div>

                {/* Evidence Thumbnails Preview Strip */}
                {totalPhotos > 0 && (
                  <div 
                    onClick={() => setActiveWorkOrderForView(order)}
                    className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-300 dark:border-slate-700 space-y-1.5 cursor-pointer hover:border-brand-teal-500 transition-all"
                  >
                    <div className="flex items-center justify-between text-[11px] font-bold text-slate-700 dark:text-slate-300">
                      <span className="flex items-center gap-1">
                        <ImageIcon className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Evidencia Fotográfica ({totalPhotos})</span>
                      </span>
                      <span className="text-[10px] text-brand-teal-600 font-medium">Ver galería &gt;</span>
                    </div>

                    <div className="flex items-center gap-1.5 overflow-hidden">
                      {order.beforeImages?.slice(0, 2).map((img, i) => (
                        <div key={`b-${i}`} className="relative w-12 h-10 rounded-lg overflow-hidden border border-amber-300 flex-shrink-0">
                          <img src={img} alt="Antes" className="w-full h-full object-cover" />
                          <span className="absolute bottom-0 left-0 right-0 bg-black/70 text-[8px] text-amber-300 text-center font-bold">
                            Antes
                          </span>
                        </div>
                      ))}
                      {order.afterImages?.slice(0, 2).map((img, i) => (
                        <div key={`a-${i}`} className="relative w-12 h-10 rounded-lg overflow-hidden border-2 border-emerald-500 flex-shrink-0">
                          <img src={img} alt="Después" className="w-full h-full object-cover" />
                          <span className="absolute bottom-0 left-0 right-0 bg-emerald-950 text-[8px] text-emerald-300 text-center font-bold">
                            Después
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Progress Bar */}
                <div className="space-y-1 pt-1">
                  <div className="flex justify-between text-[11px] font-bold text-slate-600 dark:text-slate-400">
                    <span>Checklist de Calidad:</span>
                    <span>{completedCount}/{totalCount} ({progressPercent}%)</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-brand-green-500 rounded-full transition-all duration-300"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>

              </div>

              {/* Actions Footer */}
              <div className="pt-3 border-t-2 border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${catInfo.color}`}>
                  {catInfo.label}
                </span>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setActiveWorkOrderForView(order)}
                    className="p-1.5 rounded-lg bg-brand-teal-50 dark:bg-brand-teal-950/80 hover:bg-brand-teal-100 text-brand-teal-800 dark:text-brand-teal-400 border border-brand-teal-300 dark:border-brand-teal-500/30"
                    title="Ver Acta de Entrega Membretada / Imprimir / Firmar"
                  >
                    <Eye className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => {
                      setActiveWorkOrderForEdit(order);
                      setIsWorkOrderModalOpen(true);
                    }}
                    className="p-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700"
                    title="Editar Orden"
                  >
                    <Edit className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => {
                      if (confirm(`¿Eliminar la orden de trabajo ${order.orderNumber}?`)) {
                        deleteWorkOrder(order.id);
                      }
                    }}
                    className="p-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 hover:bg-rose-100 text-rose-600 dark:text-rose-400 border border-slate-300 dark:border-slate-700"
                    title="Eliminar"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
};
