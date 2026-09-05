import React, { useState, useMemo } from 'react';
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
  CheckCircle2, 
  ChevronLeft, 
  ChevronRight,
  Filter,
  Navigation,
  Play,
  Check,
  Wrench,
  Timer
} from 'lucide-react';
import { formatDate, getCategoryInfo, createWhatsAppUrl } from '../../utils/formatters';

export const CalendarSchedule: React.FC = () => {
  const { 
    visits, 
    updateVisit, 
    deleteVisit, 
    setActiveVisitForEdit, 
    setIsVisitModalOpen,
    currentUser,
    users
  } = useAppState();

  const isTechnician = currentUser?.role === 'technician';

  // Technicians available for filtering
  const availableTechnicians = useMemo(() => {
    return users.filter(u => u.active !== false && (u.role === 'technician' || u.role === 'admin'));
  }, [users]);

  // Today's date string YYYY-MM-DD
  const todayStr = useMemo(() => new Date().toISOString().slice(0, 10), []);

  const [currentDate, setCurrentDate] = useState(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });
  const [selectedDay, setSelectedDay] = useState<string>(todayStr);

  // If technician, default to filtering by their own name/id
  const [viewScope, setViewScope] = useState<'my' | 'all'>(isTechnician ? 'my' : 'all');
  const [technicianFilter, setTechnicianFilter] = useState<string>(() => {
    if (isTechnician && currentUser) {
      return currentUser.name;
    }
    return 'all';
  });
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Filter visits
  const filteredVisits = useMemo(() => {
    return visits.filter(v => {
      // If technician is in 'my' scope, restrict to their assignments
      if (isTechnician && viewScope === 'my' && currentUser) {
        const matchesMyId = v.assignedTechnicianId && v.assignedTechnicianId === currentUser.id;
        const matchesMyName = v.assignedTechnician && v.assignedTechnician.toLowerCase() === currentUser.name.toLowerCase();
        if (!matchesMyId && !matchesMyName) return false;
      } else if (technicianFilter !== 'all') {
        const matchesId = v.assignedTechnicianId && v.assignedTechnicianId === technicianFilter;
        const matchesName = v.assignedTechnician && v.assignedTechnician.toLowerCase() === technicianFilter.toLowerCase();
        if (!matchesId && !matchesName) return false;
      }

      if (statusFilter !== 'all' && v.status !== statusFilter) {
        return false;
      }

      return true;
    });
  }, [visits, isTechnician, viewScope, currentUser, technicianFilter, statusFilter]);

  // Technician statistics
  const techStats = useMemo(() => {
    if (!currentUser) return { totalAssigned: 0, todayAssigned: 0, completed: 0 };
    const myVisits = visits.filter(v => 
      (v.assignedTechnicianId && v.assignedTechnicianId === currentUser.id) ||
      (v.assignedTechnician && v.assignedTechnician.toLowerCase() === currentUser.name.toLowerCase())
    );
    const today = myVisits.filter(v => v.date === todayStr);
    const completed = myVisits.filter(v => v.status === 'completed');
    return {
      totalAssigned: myVisits.length,
      todayAssigned: today.length,
      todayPending: today.filter(v => v.status !== 'completed' && v.status !== 'cancelled').length,
      completed: completed.length
    };
  }, [visits, currentUser, todayStr]);

  const getStatusBadge = (s: VisitStatus) => {
    switch (s) {
      case 'completed':
        return { label: 'Realizada', color: 'bg-emerald-50 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border-emerald-400 dark:border-emerald-500/40' };
      case 'in_progress':
        return { label: 'En Camino / En Sitio', color: 'bg-blue-50 dark:bg-blue-500/20 text-blue-800 dark:text-blue-300 border-blue-400 dark:border-blue-500/40' };
      case 'cancelled':
        return { label: 'Cancelada', color: 'bg-rose-50 dark:bg-rose-500/20 text-rose-800 dark:text-rose-300 border-rose-400 dark:border-rose-500/40' };
      default:
        return { label: 'Programada', color: 'bg-amber-50 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300 border-amber-400 dark:border-amber-500/40' };
    }
  };

  const handleWhatsApp = (visit: TechnicalVisit) => {
    const techName = visit.assignedTechnician || currentUser?.name || 'Técnico Martínez Tech';
    const text = `¡Hola ${visit.clientName}! Le escribe ${techName} de Martínez Tech respecto a su visita técnica pautada para el *${formatDate(visit.date)}* a las *${visit.time}*. Ya voy en camino a su dirección. ¿Todo listo para recibirnos?`;
    window.open(createWhatsAppUrl(visit.clientPhone, text), '_blank');
  };

  const handleOpenMaps = (address: string) => {
    if (!address) return;
    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
    window.open(url, '_blank');
  };

  const handleQuickStatusChange = async (visit: TechnicalVisit, newStatus: VisitStatus) => {
    await updateVisit(visit.id, { status: newStatus });
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
      
      {/* Technician Personalized Greeting Banner */}
      {isTechnician && currentUser && (
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-brand-teal-500/15 via-brand-green-500/10 to-transparent border border-brand-teal-400/30 dark:border-brand-teal-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-brand-teal-600 text-white font-black flex items-center justify-center text-base shadow-md">
              {currentUser.avatar || currentUser.name.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-brand-teal-100 dark:bg-brand-teal-900/60 text-brand-teal-800 dark:text-brand-teal-300">
                  Técnico de Campo
                </span>
                <span className="text-xs text-slate-500 font-medium">Martínez Tech</span>
              </div>
              <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                ¡Hola, {currentUser.name}!
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Tienes <strong className="text-brand-teal-700 dark:text-brand-teal-300">{techStats.todayPending} visitas pendientes</strong> hoy de un total de {techStats.totalAssigned} asignadas.
              </p>
            </div>
          </div>

          {/* Scope Toggle for Technicians */}
          <div className="flex items-center gap-1.5 p-1 bg-white dark:bg-slate-900 rounded-xl border border-slate-300 dark:border-slate-800 shadow-xs self-start sm:self-auto">
            <button
              onClick={() => {
                setViewScope('my');
                setTechnicianFilter(currentUser.name);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                viewScope === 'my'
                  ? 'bg-brand-teal-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              👨‍🔧 Mis Asignaciones ({techStats.totalAssigned})
            </button>
            <button
              onClick={() => {
                setViewScope('all');
                setTechnicianFilter('all');
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                viewScope === 'all'
                  ? 'bg-brand-teal-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              👥 Todo el Equipo ({visits.length})
            </button>
          </div>
        </div>
      )}

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

          <button
            onClick={() => {
              const d = new Date();
              setCurrentDate(new Date(d.getFullYear(), d.getMonth(), 1));
              setSelectedDay(todayStr);
            }}
            className="px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-[11px] font-bold text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700"
          >
            Hoy
          </button>

          {/* Dynamic Technicians Selector */}
          <select
            value={technicianFilter}
            onChange={(e) => {
              setTechnicianFilter(e.target.value);
              if (isTechnician) {
                setViewScope(e.target.value === currentUser?.name ? 'my' : 'all');
              }
            }}
            className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200 font-bold focus:outline-none focus:border-brand-teal-500 shadow-sm"
          >
            <option value="all">Todos los Técnicos ({availableTechnicians.length})</option>
            {availableTechnicians.map(t => (
              <option key={t.id} value={t.name}>
                {t.name} {t.role === 'technician' ? '(Técnico)' : '(Admin)'}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200 font-medium focus:outline-none focus:border-brand-teal-500 shadow-sm"
          >
            <option value="all">Todos los Estados</option>
            <option value="scheduled">Programadas</option>
            <option value="in_progress">En Camino / En Sitio</option>
            <option value="completed">Realizadas</option>
            <option value="cancelled">Canceladas</option>
          </select>
        </div>

        <button
          onClick={() => {
            setActiveVisitForEdit(null);
            setIsVisitModalOpen(true);
          }}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-teal-600 hover:bg-brand-teal-500 text-white font-bold text-xs shadow-md border border-brand-teal-700/20 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Agendar Visita / Levantamiento</span>
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
              const isToday = item.dateStr === todayStr;

              return (
                <div
                  key={idx}
                  onClick={() => setSelectedDay(item.dateStr)}
                  className={`h-20 sm:h-24 p-1.5 rounded-xl border-2 transition-all cursor-pointer flex flex-col justify-between relative ${
                    isSelected
                      ? 'bg-brand-teal-50 dark:bg-brand-teal-950/60 border-brand-teal-600 ring-2 ring-brand-teal-500/40 shadow-sm'
                      : 'bg-slate-50/60 dark:bg-slate-800/60 border-slate-300 dark:border-slate-700/60 hover:border-brand-teal-500 shadow-sm'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-black flex items-center gap-1 ${
                      isSelected ? 'text-brand-teal-900 dark:text-brand-teal-300' : 'text-slate-800 dark:text-slate-300'
                    }`}>
                      {item.day}
                      {isToday && (
                        <span className="w-1.5 h-1.5 rounded-full bg-brand-teal-500" title="Hoy" />
                      )}
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
                    {dayVisits.length > 2 && (
                      <div className="text-[8px] text-slate-500 font-bold px-1">
                        +{dayVisits.length - 2} más
                      </div>
                    )}
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

          <div className="space-y-3 max-h-[550px] overflow-y-auto custom-scrollbar pr-1">
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
                const isAssignedToMe = currentUser && (
                  (visit.assignedTechnicianId && visit.assignedTechnicianId === currentUser.id) ||
                  (visit.assignedTechnician && visit.assignedTechnician.toLowerCase() === currentUser.name.toLowerCase())
                );

                return (
                  <div
                    key={visit.id}
                    className={`p-4 rounded-2xl border space-y-3 shadow-sm transition-all ${
                      isAssignedToMe
                        ? 'bg-brand-teal-50/40 dark:bg-slate-800/90 border-brand-teal-400/60 dark:border-brand-teal-500/40 ring-1 ring-brand-teal-500/20'
                        : 'bg-slate-50 dark:bg-slate-800/80 border-slate-300 dark:border-slate-700/80'
                    }`}
                  >
                    {/* Top Row: Status & Time */}
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-1.5">
                        <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold border ${status.color}`}>
                          {status.label}
                        </span>
                        {isAssignedToMe && (
                          <span className="px-2 py-0.5 rounded-lg text-[10px] font-black bg-brand-teal-600 text-white shadow-2xs">
                            📌 Asignada a ti
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 text-xs font-bold text-brand-teal-800 dark:text-brand-teal-300 font-mono">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          <span>{visit.time}</span>
                        </div>
                        {visit.durationMinutes && (
                          <span className="text-[10px] text-slate-500 font-sans font-medium">
                            ({visit.durationMinutes} min)
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Title & Deal Reference */}
                    <div>
                      <h4 className="text-xs font-black text-slate-900 dark:text-white leading-snug">
                        {visit.title}
                      </h4>
                      {visit.dealCode && (
                        <span className="text-[10px] font-mono font-medium text-slate-600 dark:text-slate-400">
                          Negociación: {visit.dealCode}
                        </span>
                      )}
                    </div>

                    {/* Client & Address Info */}
                    <div className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300 bg-white/70 dark:bg-slate-900/60 p-2.5 rounded-xl border border-slate-200/80 dark:border-slate-700/60">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white">
                          <User className="w-3.5 h-3.5 text-brand-teal-600 dark:text-brand-teal-400" />
                          <span>{visit.clientName}</span>
                        </div>
                        <span className="text-[10px] text-slate-500 font-mono">
                          {visit.clientPhone}
                        </span>
                      </div>

                      <div className="flex items-start justify-between gap-2 text-slate-600 dark:text-slate-400 text-[11px] font-medium">
                        <div className="flex items-start gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-brand-green-600 dark:text-brand-green-400 flex-shrink-0 mt-0.5" />
                          <span>{visit.address || 'Dirección no especificada'}</span>
                        </div>
                        {visit.address && (
                          <button
                            onClick={() => handleOpenMaps(visit.address)}
                            className="text-[10px] font-bold text-brand-teal-700 dark:text-brand-teal-400 hover:underline flex items-center gap-0.5 shrink-0"
                            title="Abrir en Google Maps"
                          >
                            <Navigation className="w-3 h-3" />
                            <span>GPS</span>
                          </button>
                        )}
                      </div>

                      <div className="text-[11px] font-medium text-slate-800 dark:text-slate-300 pt-1 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                        <span>👨‍🔧 Técnico: <strong className="text-brand-teal-800 dark:text-brand-teal-300">{visit.assignedTechnician}</strong></span>
                        <span className="text-[10px] uppercase font-bold text-slate-500">{visit.type}</span>
                      </div>
                    </div>

                    {visit.notes && (
                      <p className="text-[10px] text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-900 p-2 rounded-xl border border-slate-200 dark:border-slate-800">
                        {visit.notes}
                      </p>
                    )}

                    {/* Quick Status Workflow for Technicians */}
                    <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 flex items-center justify-between gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                        Estado:
                      </span>
                      <div className="flex items-center gap-1">
                        {visit.status !== 'in_progress' && visit.status !== 'completed' && (
                          <button
                            onClick={() => handleQuickStatusChange(visit, 'in_progress')}
                            className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-[10px] flex items-center gap-1 shadow-2xs"
                          >
                            <Play className="w-3 h-3" />
                            <span>En Camino</span>
                          </button>
                        )}

                        {visit.status !== 'completed' && (
                          <button
                            onClick={() => handleQuickStatusChange(visit, 'completed')}
                            className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px] flex items-center gap-1 shadow-2xs"
                          >
                            <Check className="w-3 h-3" />
                            <span>Realizada</span>
                          </button>
                        )}

                        {visit.status === 'completed' && (
                          <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Completada</span>
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Action Bar */}
                    <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleWhatsApp(visit)}
                          className="px-2.5 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/80 hover:bg-emerald-100 text-emerald-800 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-500/30 text-xs font-bold flex items-center gap-1.5 shadow-2xs"
                          title="Avisar por WhatsApp"
                        >
                          <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="text-[10px]">WhatsApp</span>
                        </button>
                        <a
                          href={`tel:${visit.clientPhone}`}
                          className="p-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/80 hover:bg-blue-100 text-blue-800 dark:text-blue-400 border border-blue-300 dark:border-blue-500/30"
                          title="Llamar al cliente"
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
                          className="p-1.5 rounded-xl bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-600 shadow-2xs hover:border-brand-teal-500"
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
                          className="p-1.5 rounded-xl bg-rose-50 dark:bg-rose-950 hover:bg-rose-100 text-rose-600 dark:text-rose-400 border border-rose-300 dark:border-rose-700 shadow-2xs"
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

