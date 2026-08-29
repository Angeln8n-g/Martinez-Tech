import React, { useState, useEffect } from 'react';
import { useAppState } from '../../context/AppStateContext';
import { DealStage, PriorityLevel, ServiceCategory, ClientType } from '../../types';
import { X, Save } from 'lucide-react';

export const DealModal: React.FC = () => {
  const { 
    isDealModalOpen, 
    setIsDealModalOpen, 
    activeDealForEdit, 
    addDeal, 
    updateDeal,
    clients 
  } = useAppState();

  const [title, setTitle] = useState('');
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientAddress, setClientAddress] = useState('');
  const [clientType, setClientType] = useState<ClientType>('residential');
  const [stage, setStage] = useState<DealStage>('prospect');
  const [priority, setPriority] = useState<PriorityLevel>('medium');
  const [serviceCategory, setServiceCategory] = useState<ServiceCategory>('camaras');
  const [estimatedValue, setEstimatedValue] = useState<number>(0);
  const [assignedTechnician, setAssignedTechnician] = useState('');
  const [notes, setNotes] = useState('');
  const [scheduledVisitDate, setScheduledVisitDate] = useState('');

  useEffect(() => {
    if (activeDealForEdit) {
      setTitle(activeDealForEdit.title);
      setClientName(activeDealForEdit.clientName);
      setClientPhone(activeDealForEdit.clientPhone);
      setClientEmail(activeDealForEdit.clientEmail || '');
      setClientAddress(activeDealForEdit.clientAddress || '');
      setClientType(activeDealForEdit.clientType);
      setStage(activeDealForEdit.stage);
      setPriority(activeDealForEdit.priority);
      setServiceCategory(activeDealForEdit.serviceCategory);
      setEstimatedValue(activeDealForEdit.estimatedValue || 0);
      setAssignedTechnician(activeDealForEdit.assignedTechnician || '');
      setNotes(activeDealForEdit.notes || '');
      setScheduledVisitDate(activeDealForEdit.scheduledVisitDate || '');
    } else {
      setTitle('');
      setClientName('');
      setClientPhone('');
      setClientEmail('');
      setClientAddress('');
      setClientType('residential');
      setStage('prospect');
      setPriority('medium');
      setServiceCategory('camaras');
      setEstimatedValue(0);
      setAssignedTechnician('Martínez Tech - Equipo 1');
      setNotes('');
      setScheduledVisitDate('');
    }
  }, [activeDealForEdit, isDealModalOpen]);

  if (!isDealModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !clientName || !clientPhone) return;

    if (activeDealForEdit) {
      updateDeal(activeDealForEdit.id, {
        title,
        clientName,
        clientPhone,
        clientEmail,
        clientAddress,
        clientType,
        stage,
        priority,
        serviceCategory,
        estimatedValue: Number(estimatedValue),
        assignedTechnician,
        notes,
        scheduledVisitDate
      });
    } else {
      addDeal({
        title,
        clientName,
        clientPhone,
        clientEmail,
        clientAddress,
        clientType,
        stage,
        priority,
        serviceCategory,
        estimatedValue: Number(estimatedValue),
        assignedTechnician,
        notes,
        scheduledVisitDate,
        source: 'CRM Manual'
      });
    }

    setIsDealModalOpen(false);
  };

  const handleSelectExistingClient = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = e.target.value;
    if (!selectedId) return;
    const client = clients.find(c => c.id === selectedId);
    if (client) {
      setClientName(client.name);
      setClientPhone(client.phone);
      if (client.email) setClientEmail(client.email);
      if (client.address) setClientAddress(client.address);
      setClientType(client.type);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-2xl max-w-2xl w-full p-6 relative max-h-[90vh] overflow-y-auto shadow-2xl space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b-2 border-slate-200 dark:border-slate-800 pb-4">
          <div>
            <h3 className="text-xl font-black text-slate-900 dark:text-white">
              {activeDealForEdit ? `Editar Negociación (${activeDealForEdit.code})` : 'Nueva Negociación / Oportunidad'}
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5 font-medium">
              Registra los datos del cliente, servicio requerido y etapa en el pipeline.
            </p>
          </div>
          <button
            onClick={() => setIsDealModalOpen(false)}
            className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-black dark:hover:text-white border border-slate-300 dark:border-slate-700 shadow-sm"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Title */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-800 dark:text-slate-300">
              Título o Asunto del Proyecto <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="Ej. Instalación de 8 Cámaras 4K + Motor Corredizo"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-brand-teal-500 shadow-sm"
            />
          </div>

          {/* Client Selection */}
          {clients.length > 0 && !activeDealForEdit && (
            <div className="space-y-1 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-300 dark:border-slate-700/50 shadow-sm">
              <label className="text-[11px] font-bold text-brand-teal-800 dark:text-brand-teal-300">
                ¿Seleccionar cliente existente del directorio? (Opcional)
              </label>
              <select
                onChange={handleSelectExistingClient}
                className="w-full px-3 py-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200 font-medium"
              >
                <option value="">-- Ingresar cliente nuevo abajo o seleccionar aquí --</option>
                {clients.map(c => (
                  <option key={c.id} value={c.id}>{c.name} {c.company ? `(${c.company})` : ''} - {c.phone}</option>
                ))}
              </select>
            </div>
          )}

          {/* Client Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-800 dark:text-slate-300">
                Nombre del Cliente o Empresa <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="Ej. Ing. Juan Pérez / Empresa SRL"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-brand-teal-500 shadow-sm"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-800 dark:text-slate-300">
                Teléfono / WhatsApp <span className="text-rose-500">*</span>
              </label>
              <input
                type="tel"
                required
                placeholder="Ej. 809-555-1234"
                value={clientPhone}
                onChange={(e) => setClientPhone(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-brand-teal-500 shadow-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-800 dark:text-slate-300">
                Correo Electrónico
              </label>
              <input
                type="email"
                placeholder="cliente@correo.com"
                value={clientEmail}
                onChange={(e) => setClientEmail(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-brand-teal-500 shadow-sm"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-800 dark:text-slate-300">
                Tipo de Cliente
              </label>
              <select
                value={clientType}
                onChange={(e) => setClientType(e.target.value as ClientType)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200 font-medium"
              >
                <option value="residential">Residencial / Hogar</option>
                <option value="commercial">Comercial / Oficina</option>
                <option value="building">Condominio / Edificio</option>
                <option value="industrial">Industrial / Nave</option>
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-800 dark:text-slate-300">
              Dirección o Ubicación de la Obra
            </label>
            <input
              type="text"
              placeholder="Ej. Calle 4ta #25, Naco, Santo Domingo"
              value={clientAddress}
              onChange={(e) => setClientAddress(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-brand-teal-500 shadow-sm"
            />
          </div>

          {/* Deal Stage, Priority & Service */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-800 dark:text-slate-300">
                Etapa en Embudo
              </label>
              <select
                value={stage}
                onChange={(e) => setStage(e.target.value as DealStage)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200 font-bold"
              >
                <option value="prospect">1. Prospecto Nuevo</option>
                <option value="site_visit">2. Levantamiento / Visita</option>
                <option value="quoted">3. Presupuesto Enviado</option>
                <option value="negotiation">4. En Negociación</option>
                <option value="won">5. Aprobado / Ganado</option>
                <option value="installation">6. En Instalación</option>
                <option value="completed">7. Finalizado y Cobrado</option>
                <option value="lost">8. Cancelado / Perdido</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-800 dark:text-slate-300">
                Prioridad
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as PriorityLevel)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200 font-medium"
              >
                <option value="high">🔴 Alta Prioridad</option>
                <option value="medium">🟡 Media</option>
                <option value="low">🟢 Baja</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-800 dark:text-slate-300">
                Área de Servicio
              </label>
              <select
                value={serviceCategory}
                onChange={(e) => setServiceCategory(e.target.value as ServiceCategory)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200 font-medium"
              >
                <option value="camaras">Cámaras de Vigilancia</option>
                <option value="redes">Redes Informáticas</option>
                <option value="motores">Motores para Portón</option>
                <option value="cerraduras">Cerraduras Magnéticas</option>
                <option value="acceso">Control de Acceso</option>
                <option value="ponchadores">Ponchadores</option>
                <option value="alarmas">Alarmas</option>
                <option value="intercom">Intercom</option>
                <option value="otros">Otros</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-800 dark:text-slate-300">
                Monto Estimado (RD$)
              </label>
              <input
                type="number"
                min="0"
                step="100"
                placeholder="0"
                value={estimatedValue}
                onChange={(e) => setEstimatedValue(Number(e.target.value))}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-brand-teal-800 dark:text-brand-teal-400 font-bold font-mono shadow-sm"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-800 dark:text-slate-300">
                Técnico o Responsable Asignado
              </label>
              <input
                type="text"
                placeholder="Ej. Rafael Martínez / Equipo 1"
                value={assignedTechnician}
                onChange={(e) => setAssignedTechnician(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white shadow-sm"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-800 dark:text-slate-300">
              Notas y Requerimientos de la Negociación
            </label>
            <textarea
              rows={3}
              placeholder="Detalles sobre las instalaciones, equipos preferidos, condiciones del cliente..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white placeholder-slate-400 resize-none shadow-sm"
            />
          </div>

          <div className="pt-4 border-t-2 border-slate-200 dark:border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsDealModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-slate-300 text-xs font-semibold border border-slate-300 dark:border-slate-700"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-brand-teal-500 to-brand-green-500 hover:from-brand-teal-400 hover:to-brand-green-400 text-slate-950 font-black text-xs shadow-md border border-brand-teal-600/30"
            >
              <Save className="w-4 h-4 inline mr-1" />
              <span>Guardar Negociación</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
