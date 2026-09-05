import React, { useState, useEffect, useMemo } from 'react';
import { useAppState } from '../../context/AppStateContext';
import { VisitType, VisitStatus, ServiceCategory, User as UserType } from '../../types';
import { 
  X, 
  Calendar, 
  Clock, 
  User, 
  Phone, 
  MapPin, 
  AlertCircle, 
  CheckCircle2, 
  AlertTriangle, 
  Timer, 
  Sparkles,
  ShieldCheck,
  Wrench
} from 'lucide-react';
import { validateTechnicianSchedule, formatMinutesToTime, parseTimeToMinutes } from '../../utils/technicianScheduleValidator';

export const VisitModal: React.FC = () => {
  const { 
    isVisitModalOpen, 
    setIsVisitModalOpen, 
    activeVisitForEdit, 
    addVisit, 
    updateVisit, 
    deals,
    users,
    visits
  } = useAppState();

  const [title, setTitle] = useState('');
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [address, setAddress] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [time, setTime] = useState('09:00 AM');
  const [durationMinutes, setDurationMinutes] = useState<number>(60);
  const [type, setType] = useState<VisitType>('levantamiento');
  const [assignedTechnician, setAssignedTechnician] = useState('');
  const [assignedTechnicianId, setAssignedTechnicianId] = useState('');
  const [status, setStatus] = useState<VisitStatus>('scheduled');
  const [serviceCategory, setServiceCategory] = useState<ServiceCategory>('camaras');
  const [notes, setNotes] = useState('');
  const [selectedDealId, setSelectedDealId] = useState('');
  const [showOverrideWarning, setShowOverrideWarning] = useState(false);

  // Filter available technicians and admins
  const availableTechnicians = useMemo(() => {
    return users.filter(u => u.active !== false && (u.role === 'technician' || u.role === 'admin'));
  }, [users]);

  // Sync state when modal opens or activeVisitForEdit changes
  useEffect(() => {
    if (activeVisitForEdit) {
      setTitle(activeVisitForEdit.title);
      setClientName(activeVisitForEdit.clientName);
      setClientPhone(activeVisitForEdit.clientPhone);
      setAddress(activeVisitForEdit.address);
      setDate(activeVisitForEdit.date);
      setTime(activeVisitForEdit.time);
      setDurationMinutes(activeVisitForEdit.durationMinutes || 60);
      setType(activeVisitForEdit.type);
      setStatus(activeVisitForEdit.status);
      setServiceCategory(activeVisitForEdit.serviceCategory || 'camaras');
      setNotes(activeVisitForEdit.notes || '');
      setSelectedDealId(activeVisitForEdit.dealId || '');

      // Resolve technician ID or match by name
      const matched = availableTechnicians.find(
        t => t.id === activeVisitForEdit.assignedTechnicianId || t.name.toLowerCase() === activeVisitForEdit.assignedTechnician?.toLowerCase()
      );
      if (matched) {
        setAssignedTechnicianId(matched.id);
        setAssignedTechnician(matched.name);
      } else {
        setAssignedTechnicianId(activeVisitForEdit.assignedTechnicianId || '');
        setAssignedTechnician(activeVisitForEdit.assignedTechnician || 'Rafael Martínez');
      }
    } else {
      setTitle('');
      setClientName('');
      setClientPhone('');
      setAddress('');
      setDate(new Date().toISOString().slice(0, 10));
      setTime('09:30 AM');
      setDurationMinutes(60);
      setType('levantamiento');
      setStatus('scheduled');
      setServiceCategory('camaras');
      setNotes('');
      setSelectedDealId('');

      // Default to first technician or admin
      const defaultTech = availableTechnicians.find(u => u.role === 'technician') || availableTechnicians[0];
      if (defaultTech) {
        setAssignedTechnicianId(defaultTech.id);
        setAssignedTechnician(defaultTech.name);
      } else {
        setAssignedTechnicianId('');
        setAssignedTechnician('Rafael Martínez');
      }
    }
    setShowOverrideWarning(false);
  }, [activeVisitForEdit, isVisitModalOpen, availableTechnicians]);

  // Find selected technician User object
  const selectedTechUser = useMemo(() => {
    return availableTechnicians.find(u => u.id === assignedTechnicianId) 
      || availableTechnicians.find(u => u.name.toLowerCase() === assignedTechnician.toLowerCase())
      || availableTechnicians[0];
  }, [availableTechnicians, assignedTechnicianId, assignedTechnician]);

  // Real-time schedule validation
  const validation = useMemo(() => {
    if (!selectedTechUser || !date || !time) return null;
    return validateTechnicianSchedule({
      technician: selectedTechUser,
      date,
      time,
      durationMinutes,
      existingVisits: visits,
      currentVisitId: activeVisitForEdit?.id
    });
  }, [selectedTechUser, date, time, durationMinutes, visits, activeVisitForEdit]);

  if (!isVisitModalOpen) return null;

  const handleSelectTechnician = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const techId = e.target.value;
    setAssignedTechnicianId(techId);
    const tech = availableTechnicians.find(t => t.id === techId);
    if (tech) {
      setAssignedTechnician(tech.name);
    }
    setShowOverrideWarning(false);
  };

  const handleSelectDeal = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const dId = e.target.value;
    setSelectedDealId(dId);
    const d = deals.find(deal => deal.id === dId);
    if (d) {
      setTitle(`Visita Técnica: ${d.title}`);
      setClientName(d.clientName);
      setClientPhone(d.clientPhone);
      if (d.clientAddress) setAddress(d.clientAddress);
      setServiceCategory(d.serviceCategory);
      if (d.assignedTechnician) {
        const matched = availableTechnicians.find(
          t => t.name.toLowerCase() === d.assignedTechnician?.toLowerCase()
        );
        if (matched) {
          setAssignedTechnicianId(matched.id);
          setAssignedTechnician(matched.name);
        }
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent, force: boolean = false) => {
    e.preventDefault();
    if (!title || !clientName || !date) return;

    // Check for blocking schedule conflict
    if (validation?.hasConflict && !force && !showOverrideWarning) {
      setShowOverrideWarning(true);
      return;
    }

    const linkedDeal = deals.find(d => d.id === selectedDealId);

    const visitPayload = {
      dealId: selectedDealId || undefined,
      dealCode: linkedDeal?.code,
      title,
      clientName,
      clientPhone,
      address,
      date,
      time,
      durationMinutes,
      type,
      assignedTechnician,
      assignedTechnicianId: selectedTechUser?.id || assignedTechnicianId || undefined,
      assignedTechnicianEmail: selectedTechUser?.email,
      status,
      serviceCategory,
      notes
    };

    if (activeVisitForEdit) {
      await updateVisit(activeVisitForEdit.id, visitPayload);
    } else {
      await addVisit(visitPayload);
    }

    setIsVisitModalOpen(false);
  };

  const quickTimes = ['08:30 AM', '09:30 AM', '10:30 AM', '11:30 AM', '02:00 PM', '03:30 PM', '04:30 PM'];
  const durationOptions = [
    { label: '30 min', value: 30 },
    { label: '45 min', value: 45 },
    { label: '1 hora (60m)', value: 60 },
    { label: '1.5 horas (90m)', value: 90 },
    { label: '2 horas (120m)', value: 120 },
    { label: '3 horas (180m)', value: 180 }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-3xl max-w-xl w-full p-6 relative max-h-[92vh] overflow-y-auto shadow-2xl space-y-5">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3.5">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-brand-teal-50 dark:bg-brand-teal-950/80 text-brand-teal-600 dark:text-brand-teal-400 border border-brand-teal-300 dark:border-brand-teal-500/30">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white">
                {activeVisitForEdit ? 'Editar Cita / Visita Técnica' : 'Agendar Visita Técnica'}
              </h3>
              <p className="text-[11px] text-slate-500 font-medium">
                Asignación de técnico con validación automática de disponibilidad
              </p>
            </div>
          </div>
          <button 
            onClick={() => setIsVisitModalOpen(false)} 
            className="p-1.5 rounded-lg text-slate-400 hover:text-black dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={(e) => handleSubmit(e, false)} className="space-y-4">
          
          {/* Linked Deal */}
          {deals.length > 0 && !activeVisitForEdit && (
            <div className="space-y-1 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-2xl border border-slate-200 dark:border-slate-700/60">
              <label className="text-[11px] font-bold text-brand-teal-700 dark:text-brand-teal-300">
                ¿Vincular a una negociación existente? (Opcional)
              </label>
              <select
                value={selectedDealId}
                onChange={handleSelectDeal}
                className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-brand-teal-500"
              >
                <option value="">-- Cita independiente o seleccionar negociación --</option>
                {deals.map(d => (
                  <option key={d.id} value={d.id}>{d.code} - {d.clientName} ({d.title})</option>
                ))}
              </select>
            </div>
          )}

          {/* Title */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Motivo o Título de la Visita *
            </label>
            <input
              type="text"
              required
              placeholder="Ej. Levantamiento técnico de 8 cámaras y cableado estructurado"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-brand-teal-500"
            />
          </div>

          {/* Client & Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Cliente *</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  placeholder="Nombre del cliente o empresa"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-brand-teal-500"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Teléfono / WhatsApp *</label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="tel"
                  required
                  placeholder="809-555-1234"
                  value={clientPhone}
                  onChange={(e) => setClientPhone(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-brand-teal-500"
                />
              </div>
            </div>
          </div>

          {/* Address */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Dirección Exacta o Sector</label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Ej. Calle Manuel de Jesús Galván #45, Gazcue, Santo Domingo"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-brand-teal-500"
              />
            </div>
          </div>

          {/* Technician Assignment */}
          <div className="p-3.5 rounded-2xl bg-brand-teal-50/50 dark:bg-brand-teal-950/20 border border-brand-teal-200 dark:border-brand-teal-900/40 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-brand-teal-900 dark:text-brand-teal-300 flex items-center gap-1.5">
                <Wrench className="w-4 h-4 text-brand-teal-600" />
                <span>Asignar Técnico Responsable *</span>
              </label>
              {selectedTechUser && (
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-brand-teal-100 dark:bg-brand-teal-900 text-brand-teal-800 dark:text-brand-teal-300 border border-brand-teal-300 dark:border-brand-teal-700">
                  {selectedTechUser.role === 'technician' ? 'Técnico Instalador' : 'Administrador'}
                </span>
              )}
            </div>

            <select
              value={assignedTechnicianId || (selectedTechUser?.id || '')}
              onChange={handleSelectTechnician}
              className="w-full px-3 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200 font-bold focus:outline-none focus:border-brand-teal-500 shadow-xs"
            >
              {availableTechnicians.map(t => (
                <option key={t.id} value={t.id}>
                  {t.name} ({t.role === 'technician' ? 'Técnico' : 'Admin'}) {t.phone ? `- ${t.phone}` : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Date, Time & Duration Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Date */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Fecha *</label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200 font-bold focus:outline-none focus:border-brand-teal-500"
              />
            </div>

            {/* Time */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Hora de Inicio *</label>
              <div className="relative">
                <Clock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  placeholder="09:00 AM"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200 font-mono font-bold focus:outline-none focus:border-brand-teal-500"
                />
              </div>
            </div>

            {/* Duration */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Duración Estimada</label>
              <div className="relative">
                <Timer className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <select
                  value={durationMinutes}
                  onChange={(e) => setDurationMinutes(Number(e.target.value))}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200 font-medium focus:outline-none focus:border-brand-teal-500"
                >
                  {durationOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Quick Time Selector Chips */}
          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Horarios Rápidos Sugeridos:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {quickTimes.map((qTime) => (
                <button
                  key={qTime}
                  type="button"
                  onClick={() => setTime(qTime)}
                  className={`px-2 py-1 rounded-lg text-[10px] font-bold font-mono transition-all ${
                    time.toUpperCase().trim() === qTime
                      ? 'bg-brand-teal-600 text-white shadow-xs'
                      : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {qTime}
                </button>
              ))}
            </div>
          </div>

          {/* REAL-TIME SCHEDULE VALIDATION CARD */}
          {validation && (
            <div
              className={`p-3.5 rounded-2xl border transition-all animate-fadeIn ${
                validation.severity === 'error'
                  ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-500/50 text-rose-900 dark:text-rose-200'
                  : validation.severity === 'warning'
                  ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-500/50 text-amber-900 dark:text-amber-200'
                  : 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-500/50 text-emerald-900 dark:text-emerald-200'
              }`}
            >
              <div className="flex items-start gap-2.5">
                {validation.severity === 'error' ? (
                  <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                ) : validation.severity === 'warning' ? (
                  <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                ) : (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                )}

                <div className="flex-1 space-y-1 text-xs">
                  <div className="font-bold flex items-center justify-between">
                    <span>{validation.message}</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-white/70 dark:bg-black/30">
                      {validation.workloadCount} {validation.workloadCount === 1 ? 'visita hoy' : 'visitas hoy'}
                    </span>
                  </div>

                  {validation.details.length > 0 && (
                    <ul className="list-disc list-inside text-[11px] opacity-90 space-y-0.5">
                      {validation.details.map((d, i) => (
                        <li key={i}>{d}</li>
                      ))}
                    </ul>
                  )}

                  {/* Suggested alternative free slots */}
                  {validation.hasConflict && validation.suggestedSlots.length > 0 && (
                    <div className="pt-2 border-t border-rose-200 dark:border-rose-800/60 mt-2">
                      <span className="text-[11px] font-bold text-rose-800 dark:text-rose-300 block mb-1">
                        Horarios libres recomendados para {selectedTechUser?.name} hoy:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {validation.suggestedSlots.map((slot) => (
                          <button
                            key={slot}
                            type="button"
                            onClick={() => {
                              setTime(slot);
                              setShowOverrideWarning(false);
                            }}
                            className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 border border-rose-300 dark:border-rose-700 text-rose-700 dark:text-rose-300 hover:bg-rose-100 font-mono font-bold text-[10px] shadow-2xs"
                          >
                            + Asignar a las {slot}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Conflict Confirmation Box */}
          {showOverrideWarning && (
            <div className="p-3 rounded-xl bg-rose-100 dark:bg-rose-950 border-2 border-rose-500 text-rose-950 dark:text-rose-200 text-xs space-y-2 animate-bounce-short">
              <div className="font-black flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 text-rose-600" />
                <span>¿Deseas sobreasignar al técnico de todos modos?</span>
              </div>
              <p className="text-[11px]">
                Existe una colisión directa de horario con otra cita. Si continúas, el técnico tendrá dos visitas solapadas.
              </p>
              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowOverrideWarning(false)}
                  className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold text-[11px]"
                >
                  Corregir Horario
                </button>
                <button
                  type="button"
                  onClick={(e) => handleSubmit(e, true)}
                  className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-black text-[11px] shadow-sm"
                >
                  Confirmar y Forzar Asignación
                </button>
              </div>
            </div>
          )}

          {/* Type and Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Tipo de Visita</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as VisitType)}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200 font-medium focus:outline-none focus:border-brand-teal-500"
              >
                <option value="levantamiento">📋 Levantamiento Técnico</option>
                <option value="instalacion">🛠️ Instalación / Montaje</option>
                <option value="mantenimiento">🔧 Mantenimiento Preventivo</option>
                <option value="soporte">📞 Soporte / Garantía</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Área Técnica</label>
              <select
                value={serviceCategory}
                onChange={(e) => setServiceCategory(e.target.value as ServiceCategory)}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200 font-medium focus:outline-none focus:border-brand-teal-500"
              >
                <option value="camaras">Cámaras de Vigilancia</option>
                <option value="redes">Redes Informáticas</option>
                <option value="motores">Motores de Portón</option>
                <option value="cerraduras">Cerraduras Magnéticas</option>
                <option value="acceso">Control de Acceso</option>
                <option value="ponchadores">Ponchadores</option>
                <option value="alarmas">Alarmas</option>
                <option value="intercom">Intercom</option>
                <option value="otros">Otros Servicios</option>
              </select>
            </div>
          </div>

          {/* Status */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Estado de la Cita</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as VisitStatus)}
              className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200 font-bold focus:outline-none focus:border-brand-teal-500"
            >
              <option value="scheduled">🟡 Programada</option>
              <option value="in_progress">🔵 En Camino / En Sitio</option>
              <option value="completed">🟢 Realizada con Éxito</option>
              <option value="cancelled">🔴 Cancelada / Pospuesta</option>
            </select>
          </div>

          {/* Notes */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Notas de Campo / Requerimientos</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Herramientas especiales necesarias (escalera alta, taladro rotomartillo, etc.)"
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-brand-teal-500 resize-none"
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setIsVisitModalOpen(false)}
              className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs text-slate-700 dark:text-slate-300 font-bold"
            >
              Cancelar
            </button>

            <button
              type="submit"
              className={`px-6 py-2.5 rounded-xl font-black text-xs shadow-md transition-all ${
                validation?.hasConflict
                  ? 'bg-rose-600 hover:bg-rose-500 text-white'
                  : 'bg-brand-teal-600 hover:bg-brand-teal-500 text-white'
              }`}
            >
              {validation?.hasConflict ? 'Revisar Conflicto' : (activeVisitForEdit ? 'Guardar Cambios' : 'Agendar Cita')}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};

