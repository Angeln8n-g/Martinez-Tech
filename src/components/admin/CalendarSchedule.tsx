import React, { useState } from 'react';
import { useAppState } from '../../context/AppStateContext';
import { TechnicalVisit, VisitStatus } from '../../types';
import { 
  Calendar as CalendarIcon, 
  Plus, 
  Clock, 
  MapPin, 
  User, 
  Phone, 
  MessageCircle, 
  Edit, 
  Trash2, 
  CheckCircle, 
  ChevronLeft, 
  ChevronRight,
  Filter
} from 'lucide-react';
import { formatDate, getCategoryInfo, createWhatsAppUrl } from '../../utils/formatters';

export const CalendarSchedule: React.FC = () => {
  const { 
    visits, 
    addVisit, 
    updateVisit, 
    deleteVisit, 
    setActiveVisitForEdit, 
    setIsVisitModalOpen,
    companySettings 
  } = useAppState();

  const [currentDate, setCurrentDate] = useState(new Date(2026, 2, 1)); // March 2026
  const [selectedDay, setSelectedDay] = useState<string>('2026-03-01');
  const [technicianFilter, setTechnicianFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredVisits = visits.filter(v => {
    const matchesTech = technicianFilter === 'all' || v.assignedTechnician === technicianFilter;
    const matchesStatus = statusFilter === 'all' || v.status === statusFilter;
    return matchesTech && matchesStatus;
  });

  const getStatusBadge = (s: VisitStatus) => {
    switch (s) {
      case 'completed':
        return { label: 'Realizada', color: 'bg-emerald-50 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border-emerald-400 dark:border-emerald-500/40' };
      case 'in_progress':
        return { label: 'En Progreso', color: 'bg-blue-50 dark:bg-blue-500/20 text-blue-800 dark:text-blue-300 border-blue-400 dark:border-blue-500/40' };
      case 'cancelled':
        return { label: 'Cancelada', color: 'bg-rose-50 dark:bg-rose-500/20 text-rose-800 dark:text-rose-300 border-rose-400 dark:border-rose-500/40' };
      default:
        return { label: 'Programada', color: 'bg-amber-50 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300 border-amber-400 dark:border-amber-500/40' };
    }
  };

  const handleWhatsApp = (visit: TechnicalVisit) => {
    const text = `¡Hola ${visit.clientName}! Le recordamos su visita técnica pautada para el *${formatDate(visit.date)}* a las *${visit.time}* con nuestro técnico *${visit.assignedTechnician}* de Martínez Tech. ¿Todo en orden?`;
    window.open(createWhatsAppUrl(visit.clientPhone, text), '_blank');
  };

  // Calendar matrix generator
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const daysArray = [];
  for (let i = 0; i < firstDay; i++) {
    daysArray.push(null);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    daysArray.push({ day: d, dateStr });
  }

  const selectedDayVisits = filteredVisits.filter(v => v.date === selectedDay);

  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-300 dark:border-slate-800 shadow-md">
        
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-300 dark:border-slate-700 shadow-sm">
            <button onClick={handlePrevMonth} className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-300">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-bold text-slate-900 dark:text-white px-2">
              {monthNames[month]} {year}
            </span>
            <button onClick={handleNextMonth} className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-300">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <select
            value={technicianFilter}
            onChange={(e) => setTechnicianFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200 font-medium focus:outline-none focus:border-brand-teal-500 shadow-sm"
          >
            <option value="all">Todos los Técnicos</option>
            <option value="Rafael Martínez">Rafael Martínez</option>
            <option value="Carlos Gómez">Carlos Gómez</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200 font-medium focus:outline-none focus:border-brand-teal-500 shadow-sm"
          >
            <option value="all">Todos los Estados</option>
            <option value="scheduled">Programadas</option>
            <option value="in_progress">En Progreso</option>
            <option value="completed">Realizadas</option>
          </select>
        </div>

        <button
          onClick={() => {
            setActiveVisitForEdit(null);
            setIsVisitModalOpen(true);
          }}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-teal-600 hover:bg-brand-teal-500 text-white font-bold text-xs shadow-md border border-brand-teal-700/20"
        >
          <Plus className="w-4 h-4" />
          <span>Agendar Visita / Instalación</span>
        </button>
      </div>

      {/* Grid: Interactive Month Calendar (7 cols) & Day Agenda (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Calendar Grid (7 cols) */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-2xl p-5 shadow-md space-y-4">
          
          <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider pb-2 border-b-2 border-slate-200 dark:border-slate-800">
            <span>Dom</span>
            <span>Lun</span>
            <span>Mar</span>
            <span>Mié</span>
            <span>Jue</span>
            <span>Vie</span>
            <span>Sáb</span>
          </div>

          <div className="grid grid-cols-7 gap-2">
            {daysArray.map((item, idx) => {
              if (!item) {
                return <div key={idx} className="h-16 rounded-xl bg-slate-100/50 dark:bg-slate-950/30 opacity-40 border border-transparent" />;
              }

              const dayVisits = filteredVisits.filter(v => v.date === item.dateStr);
              const isSelected = selectedDay === item.dateStr;

              return (
                <div
                  key={idx}
                  onClick={() => setSelectedDay(item.dateStr)}
                  className={`h-20 sm:h-24 p-1.5 rounded-xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'bg-brand-teal-50 dark:bg-brand-teal-950/60 border-brand-teal-600 ring-2 ring-brand-teal-500/40 shadow-sm'
                      : 'bg-slate-50/60 dark:bg-slate-800/60 border-slate-250 dark:border-slate-700/60 hover:border-brand-teal-500 shadow-sm'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-black ${
                      isSelected ? 'text-brand-teal-900 dark:text-brand-teal-300' : 'text-slate-800 dark:text-slate-300'
                    }`}>
                      {item.day}
                    </span>
                    {dayVisits.length > 0 && (
                      <span className="w-4 h-4 rounded-full bg-brand-green-500 text-slate-950 text-[9px] font-black flex items-center justify-center shadow-sm">
                        {dayVisits.length}
                      </span>
                    )}
                  </div>

                  <div className="space-y-0.5 overflow-hidden">
                    {dayVisits.slice(0, 2).map(v => (
                      <div
                        key={v.id}
                        className="text-[9px] font-bold truncate px-1 py-0.5 rounded bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-200 border border-slate-200 dark:border-slate-800 shadow-2xs"
                        title={`${v.time} - ${v.clientName} (${v.title})`}
                      >
                        {v.time.split(' ')[0]} {v.clientName.split(' ')[0]}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

        </div>

        {/* Selected Day Agenda (5 cols) */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-2xl p-5 shadow-md space-y-4">
          
          <div className="flex items-center justify-between border-b-2 border-slate-200 dark:border-slate-800 pb-3">
            <div>
              <span className="text-[10px] font-bold text-brand-teal-800 dark:text-brand-teal-400 uppercase tracking-wider">
                Agenda del Día
              </span>
              <h3 className="text-sm font-black text-slate-900 dark:text-white">
                {formatDate(selectedDay)}
              </h3>
            </div>
            <span className="px-2.5 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-800 dark:text-slate-300 border border-slate-300 dark:border-slate-700">
              {selectedDayVisits.length} Citas
            </span>
          </div>

          <div className="space-y-3 max-h-[500px] overflow-y-auto custom-scrollbar">
            {selectedDayVisits.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-500 space-y-2">
                <CalendarIcon className="w-8 h-8 text-slate-400 dark:text-slate-700 mx-auto" />
                <p className="font-medium">No hay visitas agendadas para esta fecha.</p>
                <button
                  onClick={() => {
                    setActiveVisitForEdit(null);
                    setIsVisitModalOpen(true);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs font-bold text-brand-teal-700 dark:text-brand-teal-400 hover:underline border border-slate-300 dark:border-slate-700"
                >
                  + Programar cita aquí
                </button>
              </div>
            ) : (
              selectedDayVisits.map((visit) => {
                const status = getStatusBadge(visit.status);
                const catInfo = getCategoryInfo(visit.serviceCategory || 'camaras');

                return (
                  <div
                    key={visit.id}
                    className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700/80 space-y-3 shadow-sm"
                  >
                    <div className="flex items-center justify-between">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${status.color}`}>
                        {status.label}
                      </span>
                      <div className="flex items-center gap-1 text-xs font-bold text-brand-teal-800 dark:text-brand-teal-300 font-mono">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{visit.time}</span>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white leading-snug">
                        {visit.title}
                      </h4>
                      {visit.dealCode && (
                        <span className="text-[10px] font-mono font-medium text-slate-600 dark:text-slate-400">
                          Negociación: {visit.dealCode}
                        </span>
                      )}
                    </div>

                    <div className="space-y-1 text-xs text-slate-700 dark:text-slate-300">
                      <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white">
                        <User className="w-3.5 h-3.5 text-brand-teal-600 dark:text-brand-teal-400" />
                        <span>{visit.clientName}</span>
                      </div>

                      <div className="flex items-start gap-1.5 text-slate-600 dark:text-slate-400 text-[11px] font-medium">
                        <MapPin className="w-3.5 h-3.5 text-brand-green-600 dark:text-brand-green-400 flex-shrink-0 mt-0.5" />
                        <span>{visit.address}</span>
                      </div>

                      <div className="text-[11px] font-medium text-slate-800 dark:text-slate-300 pt-1">
                        👨‍🔧 Técnico: <strong className="text-brand-teal-800 dark:text-brand-teal-300">{visit.assignedTechnician}</strong>
                      </div>
                    </div>

                    {visit.notes && (
                      <p className="text-[10px] text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-900 p-2 rounded border border-slate-200 dark:border-slate-800">
                        {visit.notes}
                      </p>
                    )}

                    <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleWhatsApp(visit)}
                          className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/80 hover:bg-emerald-100 text-emerald-800 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-500/30"
                          title="Recordar por WhatsApp"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                        </button>
                        <a
                          href={`tel:${visit.clientPhone}`}
                          className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/80 hover:bg-blue-100 text-blue-800 dark:text-blue-400 border border-blue-300 dark:border-blue-500/30"
                          title="Llamar"
                        >
                          <Phone className="w-3.5 h-3.5" />
                        </a>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => {
                            setActiveVisitForEdit(visit);
                            setIsVisitModalOpen(true);
                          }}
                          className="p-1.5 rounded-lg bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-600 shadow-2xs"
                          title="Editar Cita"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`¿Eliminar la visita de ${visit.clientName}?`)) {
                              deleteVisit(visit.id);
                            }
                          }}
                          className="p-1.5 rounded-lg bg-rose-50 dark:bg-rose-950 hover:bg-rose-100 text-rose-600 dark:text-rose-400 border border-rose-300 dark:border-rose-700 shadow-2xs"
                          title="Eliminar"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

        </div>

      </div>

    </div>
  );
};
