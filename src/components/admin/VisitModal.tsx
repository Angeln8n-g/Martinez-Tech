import React, { useState, useEffect } from 'react';
import { useAppState } from '../../context/AppStateContext';
import { VisitType, VisitStatus, ServiceCategory } from '../../types';
import { X, Save, Calendar, Clock, MapPin, User, Phone } from 'lucide-react';

export const VisitModal: React.FC = () => {
  const { 
    isVisitModalOpen, 
    setIsVisitModalOpen, 
    activeVisitForEdit, 
    addVisit, 
    updateVisit, 
    deals 
  } = useAppState();

  const [title, setTitle] = useState('');
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [address, setAddress] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [time, setTime] = useState('09:00 AM');
  const [type, setType] = useState<VisitType>('levantamiento');
  const [assignedTechnician, setAssignedTechnician] = useState('Rafael Martínez');
  const [status, setStatus] = useState<VisitStatus>('scheduled');
  const [serviceCategory, setServiceCategory] = useState<ServiceCategory>('camaras');
  const [notes, setNotes] = useState('');
  const [selectedDealId, setSelectedDealId] = useState('');

  useEffect(() => {
    if (activeVisitForEdit) {
      setTitle(activeVisitForEdit.title);
      setClientName(activeVisitForEdit.clientName);
      setClientPhone(activeVisitForEdit.clientPhone);
      setAddress(activeVisitForEdit.address);
      setDate(activeVisitForEdit.date);
      setTime(activeVisitForEdit.time);
      setType(activeVisitForEdit.type);
      setAssignedTechnician(activeVisitForEdit.assignedTechnician);
      setStatus(activeVisitForEdit.status);
      setServiceCategory(activeVisitForEdit.serviceCategory || 'camaras');
      setNotes(activeVisitForEdit.notes || '');
      setSelectedDealId(activeVisitForEdit.dealId || '');
    } else {
      setTitle('');
      setClientName('');
      setClientPhone('');
      setAddress('');
      setDate(new Date().toISOString().slice(0, 10));
      setTime('09:30 AM');
      setType('levantamiento');
      setAssignedTechnician('Rafael Martínez');
      setStatus('scheduled');
      setServiceCategory('camaras');
      setNotes('');
      setSelectedDealId('');
    }
  }, [activeVisitForEdit, isVisitModalOpen]);

  if (!isVisitModalOpen) return null;

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
      if (d.assignedTechnician) setAssignedTechnician(d.assignedTechnician);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !clientName || !date) return;

    const linkedDeal = deals.find(d => d.id === selectedDealId);

    if (activeVisitForEdit) {
      await updateVisit(activeVisitForEdit.id, {
        dealId: selectedDealId || undefined,
        dealCode: linkedDeal?.code,
        title,
        clientName,
        clientPhone,
        address,
        date,
        time,
        type,
        assignedTechnician,
        status,
        serviceCategory,
        notes
      });
    } else {
      await addVisit({
        dealId: selectedDealId || undefined,
        dealCode: linkedDeal?.code,
        title,
        clientName,
        clientPhone,
        address,
        date,
        time,
        type,
        assignedTechnician,
        status,
        serviceCategory,
        notes
      });
    }

    setIsVisitModalOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 rounded-2xl max-w-lg w-full p-6 relative max-h-[90vh] overflow-y-auto shadow-2xl space-y-5">
        
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-brand-teal-600 dark:text-brand-teal-400" />
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              {activeVisitForEdit ? 'Editar Cita / Visita Técnica' : 'Agendar Nueva Visita Técnica'}
            </h3>
          </div>
          <button onClick={() => setIsVisitModalOpen(false)} className="text-slate-400 hover:text-black dark:hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          
          {deals.length > 0 && !activeVisitForEdit && (
            <div className="space-y-1 bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700/60">
              <label className="text-[11px] font-semibold text-brand-teal-700 dark:text-brand-teal-300">
                ¿Vincular a una negociación existente? (Opcional)
              </label>
              <select
                value={selectedDealId}
                onChange={handleSelectDeal}
                className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200"
              >
                <option value="">-- Cita independiente o seleccionar negociación --</option>
                {deals.map(d => (
                  <option key={d.id} value={d.id}>{d.code} - {d.clientName} ({d.title})</option>
                ))}
              </select>
            </div>
          )}

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Motivo o Título de la Visita *
            </label>
            <input
              type="text"
              required
              placeholder="Ej. Levantamiento de Cámaras y Cableado"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Cliente *</label>
              <input
                type="text"
                required
                placeholder="Nombre del cliente"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Teléfono *</label>
              <input
                type="tel"
                required
                placeholder="809-555-1234"
                value={clientPhone}
                onChange={(e) => setClientPhone(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Dirección o Sector</label>
            <input
              type="text"
              placeholder="Ej. Calle 4ta #12, Bella Vista, S.D."
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Fecha *</label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Hora Aproximada</label>
              <input
                type="text"
                placeholder="09:00 AM"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Tipo de Visita</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as VisitType)}
                className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200"
              >
                <option value="levantamiento">📋 Levantamiento Técnico</option>
                <option value="instalacion">🛠️ Instalación / Montaje</option>
                <option value="mantenimiento">🔧 Mantenimiento Preventivo</option>
                <option value="soporte">📞 Soporte / Garantía</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Técnico Asignado</label>
              <select
                value={assignedTechnician}
                onChange={(e) => setAssignedTechnician(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200"
              >
                <option value="Rafael Martínez">Rafael Martínez (Senior)</option>
                <option value="Carlos Gómez">Carlos Gómez (Técnico 1)</option>
                <option value="Equipo de Instalación A">Equipo de Instalación A</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Estado de la Cita</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as VisitStatus)}
                className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200 font-semibold"
              >
                <option value="scheduled">🟡 Programada</option>
                <option value="in_progress">🔵 En Camino / En Sitio</option>
                <option value="completed">🟢 Realizada con Éxito</option>
                <option value="cancelled">🔴 Cancelada / Pospuesta</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Área Técnica</label>
              <select
                value={serviceCategory}
                onChange={(e) => setServiceCategory(e.target.value as ServiceCategory)}
                className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200"
              >
                <option value="camaras">Cámaras de Vigilancia</option>
                <option value="redes">Redes Informáticas</option>
                <option value="motores">Motores de Portón</option>
                <option value="cerraduras">Cerraduras Magnéticas</option>
                <option value="acceso">Control de Acceso</option>
                <option value="ponchadores">Ponchadores</option>
                <option value="alarmas">Alarmas</option>
                <option value="intercom">Intercom</option>
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Notas de Campo / Requerimientos</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Herramientas especiales necesarias (escalera alta, taladro rotomartillo, etc.)"
              className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white resize-none"
            />
          </div>

          <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsVisitModalOpen(false)}
              className="px-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs text-slate-700 dark:text-slate-300"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-lg bg-brand-teal-600 hover:bg-brand-teal-500 text-white font-bold text-xs"
            >
              Guardar Cita
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
