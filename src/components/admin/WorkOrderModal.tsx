import React, { useState, useEffect, useRef } from 'react';
import { useAppState } from '../../context/AppStateContext';
import { WorkOrder, WorkOrderChecklistItem, ServiceCategory, WorkOrderStatus } from '../../types';
import { 
  X, 
  Save, 
  Plus, 
  Trash2, 
  Wrench, 
  CheckCircle2, 
  Image as ImageIcon, 
  Upload, 
  Camera, 
  Sparkles, 
  Eye, 
  Maximize2,
  FileCheck2,
  FolderOpen
} from 'lucide-react';

const PRESET_EVIDENCE_GALLERIES: Record<ServiceCategory, { label: string; before: string[]; after: string[] }> = {
  camaras: {
    label: 'CCTV / Cámaras de Vigilancia',
    before: [
      'https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=800&q=80'
    ],
    after: [
      'https://images.unsplash.com/photo-1557597774-9d273605dfa9?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?auto=format&fit=crop&w=800&q=80'
    ]
  },
  redes: {
    label: 'Redes & Cableado Estructurado',
    before: [
      'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=800&q=80'
    ],
    after: [
      'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1544197150-199123fa6d70?auto=format&fit=crop&w=800&q=80'
    ]
  },
  motores: {
    label: 'Motores para Portón Eléctrico',
    before: [
      'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80'
    ],
    after: [
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80'
    ]
  },
  cerraduras: {
    label: 'Cerraduras Magnéticas & Biométricas',
    before: [
      'https://images.unsplash.com/photo-1517646287270-a5a9ca602e5c?auto=format&fit=crop&w=800&q=80'
    ],
    after: [
      'https://images.unsplash.com/photo-1582139329536-e7284fece509?auto=format&fit=crop&w=800&q=80'
    ]
  },
  acceso: {
    label: 'Control de Acceso',
    before: [
      'https://images.unsplash.com/photo-1517646287270-a5a9ca602e5c?auto=format&fit=crop&w=800&q=80'
    ],
    after: [
      'https://images.unsplash.com/photo-1582139329536-e7284fece509?auto=format&fit=crop&w=800&q=80'
    ]
  },
  ponchadores: {
    label: 'Ponchadores Biométricos',
    before: [
      'https://images.unsplash.com/photo-1517646287270-a5a9ca602e5c?auto=format&fit=crop&w=800&q=80'
    ],
    after: [
      'https://images.unsplash.com/photo-1582139329536-e7284fece509?auto=format&fit=crop&w=800&q=80'
    ]
  },
  alarmas: {
    label: 'Sistemas de Alarma',
    before: [
      'https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?auto=format&fit=crop&w=800&q=80'
    ],
    after: [
      'https://images.unsplash.com/photo-1557597774-9d273605dfa9?auto=format&fit=crop&w=800&q=80'
    ]
  },
  intercom: {
    label: 'Intercom & Videoporteros',
    before: [
      'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80'
    ],
    after: [
      'https://images.unsplash.com/photo-1557597774-9d273605dfa9?auto=format&fit=crop&w=800&q=80'
    ]
  },
  otros: {
    label: 'Servicios Generales de Tecnología',
    before: [
      'https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?auto=format&fit=crop&w=800&q=80'
    ],
    after: [
      'https://images.unsplash.com/photo-1557597774-9d273605dfa9?auto=format&fit=crop&w=800&q=80'
    ]
  }
};

export const WorkOrderModal: React.FC = () => {
  const { 
    isWorkOrderModalOpen, 
    setIsWorkOrderModalOpen, 
    activeWorkOrderForEdit, 
    addWorkOrder, 
    updateWorkOrder, 
    quotes, 
    deals,
    currentUser 
  } = useAppState();

  const [selectedQuoteId, setSelectedQuoteId] = useState('');
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientAddress, setClientAddress] = useState('');
  const [serviceCategory, setServiceCategory] = useState<ServiceCategory>('camaras');
  const [assignedTechnician, setAssignedTechnician] = useState('Rafael Martínez (Técnico Líder)');
  const [scheduledDate, setScheduledDate] = useState(new Date().toISOString().slice(0, 10));
  const [completedDate, setCompletedDate] = useState(new Date().toISOString().slice(0, 10));
  const [status, setStatus] = useState<WorkOrderStatus>('in_progress');
  const [scopeOfWork, setScopeOfWork] = useState('');
  const [technicianNotes, setTechnicianNotes] = useState('');
  const [clientFeedback, setClientFeedback] = useState('');

  // Checklist items
  const [checklist, setChecklist] = useState<WorkOrderChecklistItem[]>([
    { id: '1', task: 'Instalación y fijación mecánica de equipos', completed: true },
    { id: '2', task: 'Tendido, canalizado y peinado de cableado', completed: true },
    { id: '3', task: 'Conexión eléctrica, polarización y puesta en marcha', completed: false },
    { id: '4', task: 'Calibración, enfoque y configuración de software/app móvil', completed: false },
    { id: '5', task: 'Prueba de funcionamiento en presencia del cliente', completed: false },
    { id: '6', task: 'Entrega de manual de usuario y claves de acceso', completed: false }
  ]);
  const [newChecklistTask, setNewChecklistTask] = useState('');

  // Evidence Photos State
  const [beforeImages, setBeforeImages] = useState<string[]>([]);
  const [afterImages, setAfterImages] = useState<string[]>([]);
  const [beforeImgInput, setBeforeImgInput] = useState('');
  const [afterImgInput, setAfterImgInput] = useState('');
  const [previewZoomImage, setPreviewZoomImage] = useState<string | null>(null);

  const beforeFileInputRef = useRef<HTMLInputElement>(null);
  const afterFileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (activeWorkOrderForEdit) {
      setSelectedQuoteId(activeWorkOrderForEdit.quoteId || '');
      setClientName(activeWorkOrderForEdit.clientName);
      setClientPhone(activeWorkOrderForEdit.clientPhone);
      setClientAddress(activeWorkOrderForEdit.clientAddress);
      setServiceCategory(activeWorkOrderForEdit.serviceCategory);
      setAssignedTechnician(activeWorkOrderForEdit.assignedTechnician);
      setScheduledDate(activeWorkOrderForEdit.scheduledDate);
      setCompletedDate(activeWorkOrderForEdit.completedDate || new Date().toISOString().slice(0, 10));
      setStatus(activeWorkOrderForEdit.status);
      setScopeOfWork(activeWorkOrderForEdit.scopeOfWork);
      setChecklist(activeWorkOrderForEdit.checklist || []);
      setBeforeImages(activeWorkOrderForEdit.beforeImages || []);
      setAfterImages(activeWorkOrderForEdit.afterImages || []);
      setTechnicianNotes(activeWorkOrderForEdit.technicianNotes || '');
      setClientFeedback(activeWorkOrderForEdit.clientFeedback || '');
    } else {
      setSelectedQuoteId('');
      setClientName('');
      setClientPhone('');
      setClientAddress('');
      setServiceCategory('camaras');
      setAssignedTechnician(currentUser?.name || 'Rafael Martínez (Técnico Líder)');
      setScheduledDate(new Date().toISOString().slice(0, 10));
      setCompletedDate(new Date().toISOString().slice(0, 10));
      setStatus('in_progress');
      setScopeOfWork('Instalación, configuración y puesta en marcha de equipos según especificaciones técnicas.');
      setChecklist([
        { id: `c-${Date.now()}-1`, task: 'Instalación y fijación física de equipos y herrajes', completed: true },
        { id: `c-${Date.now()}-2`, task: 'Tendido, canalizado y peinado de cableado', completed: true },
        { id: `c-${Date.now()}-3`, task: 'Conexión eléctrica, polarización y encendido', completed: false },
        { id: `c-${Date.now()}-4`, task: 'Calibración, enfoque y configuración de software/app móvil', completed: false },
        { id: `c-${Date.now()}-5`, task: 'Prueba de funcionamiento en presencia del cliente', completed: false },
        { id: `c-${Date.now()}-6`, task: 'Entrega de manual de usuario y claves de acceso', completed: false }
      ]);
      setBeforeImages(PRESET_EVIDENCE_GALLERIES.camaras.before);
      setAfterImages(PRESET_EVIDENCE_GALLERIES.camaras.after);
      setTechnicianNotes('Instalación efectuada conforme a normas técnicas y códigos eléctricos.');
      setClientFeedback('Servicio entregado y probado a entera satisfacción.');
    }
  }, [activeWorkOrderForEdit, isWorkOrderModalOpen]);

  if (!isWorkOrderModalOpen) return null;

  const handleSelectQuote = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const qId = e.target.value;
    setSelectedQuoteId(qId);
    const q = quotes.find(quote => quote.id === qId);
    if (q) {
      setClientName(q.clientName);
      setClientPhone(q.clientPhone);
      setClientAddress(q.clientAddress);
      setScopeOfWork(`Instalación según Presupuesto ${q.quoteNumber}: ${q.items.map(i => `${i.quantity}x ${i.name}`).join(', ')}`);
      
      const newItems: WorkOrderChecklistItem[] = q.items.map((it, idx) => ({
        id: `chk-${idx}`,
        task: `Suministro e instalación de ${it.quantity}x ${it.name}`,
        completed: false
      }));
      newItems.push({ id: `chk-test`, task: 'Pruebas generales y configuración en dispositivos del cliente', completed: false });
      newItems.push({ id: `chk-sign`, task: 'Firma de conformidad y entrega de garantía escrita', completed: false });
      setChecklist(newItems);
    }
  };

  const handleToggleChecklist = (id: string) => {
    setChecklist(prev => prev.map(c => c.id === id ? { ...c, completed: !c.completed } : c));
  };

  const handleAddChecklistTask = () => {
    if (!newChecklistTask.trim()) return;
    setChecklist(prev => [...prev, { id: `chk-${Date.now()}`, task: newChecklistTask.trim(), completed: false }]);
    setNewChecklistTask('');
  };

  const handleRemoveChecklistTask = (id: string) => {
    setChecklist(prev => prev.filter(c => c.id !== id));
  };

  // Upload Local Files as Base64 for Before Images
  const handleUploadBeforeFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setBeforeImages(prev => [...prev, event.target!.result as string]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  // Upload Local Files as Base64 for After Images
  const handleUploadAfterFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setAfterImages(prev => [...prev, event.target!.result as string]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleAddBeforeImage = () => {
    if (!beforeImgInput.trim()) return;
    setBeforeImages(prev => [...prev, beforeImgInput.trim()]);
    setBeforeImgInput('');
  };

  const handleAddAfterImage = () => {
    if (!afterImgInput.trim()) return;
    setAfterImages(prev => [...prev, afterImgInput.trim()]);
    setAfterImgInput('');
  };

  // Apply Sample Gallery Preset
  const handleApplyPresetGallery = () => {
    const preset = PRESET_EVIDENCE_GALLERIES[serviceCategory] || PRESET_EVIDENCE_GALLERIES.camaras;
    setBeforeImages(preset.before);
    setAfterImages(preset.after);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName || !clientPhone) {
      alert('Por favor ingrese el nombre y teléfono del cliente.');
      return;
    }

    const linkedQuote = quotes.find(q => q.id === selectedQuoteId);
    const linkedDeal = deals.find(d => d.quoteId === selectedQuoteId || (linkedQuote && d.id === linkedQuote.dealId));

    if (activeWorkOrderForEdit) {
      await updateWorkOrder(activeWorkOrderForEdit.id, {
        quoteId: selectedQuoteId || undefined,
        quoteNumber: linkedQuote?.quoteNumber,
        dealId: linkedDeal?.id,
        dealCode: linkedDeal?.code,
        clientName,
        clientPhone,
        clientAddress,
        serviceCategory,
        assignedTechnician,
        scheduledDate,
        completedDate,
        status,
        scopeOfWork,
        checklist,
        beforeImages,
        afterImages,
        technicianNotes,
        clientFeedback
      });
    } else {
      await addWorkOrder({
        quoteId: selectedQuoteId || undefined,
        quoteNumber: linkedQuote?.quoteNumber,
        dealId: linkedDeal?.id,
        dealCode: linkedDeal?.code,
        clientName,
        clientPhone,
        clientAddress,
        serviceCategory,
        assignedTechnician,
        scheduledDate,
        completedDate,
        status,
        scopeOfWork,
        checklist,
        beforeImages,
        afterImages,
        technicianNotes,
        clientFeedback,
        createdBy: currentUser?.name || 'Rafael Martínez'
      });
    }

    setIsWorkOrderModalOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-3xl max-w-4xl w-full p-5 sm:p-7 relative max-h-[95vh] overflow-y-auto shadow-2xl space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b-2 border-slate-200 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-green-50 dark:bg-brand-green-500/10 border border-brand-green-300 dark:border-brand-green-500/30 flex items-center justify-center text-brand-green-700 dark:text-brand-green-400 shadow-sm">
              <Wrench className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-900 dark:text-white">
                {activeWorkOrderForEdit ? `Editar Orden de Trabajo (${activeWorkOrderForEdit.orderNumber})` : 'Nueva Orden de Trabajo / Acta de Entrega'}
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                Documento técnico con checklist de calidad, galería de fotos de evidencia antes/después y firma de entrega.
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsWorkOrderModalOpen(false)}
            className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-black dark:hover:text-white border border-slate-300 dark:border-slate-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Linked Quote */}
          {quotes.length > 0 && !activeWorkOrderForEdit && (
            <div className="space-y-1 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-300 dark:border-slate-700 shadow-sm">
              <label className="text-[11px] font-bold text-brand-teal-800 dark:text-brand-teal-300">
                ¿Vincular a un Presupuesto Aprobado? (Autollenar datos y tareas)
              </label>
              <select
                value={selectedQuoteId}
                onChange={handleSelectQuote}
                className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-200 font-medium"
              >
                <option value="">-- Ingresar orden independiente o seleccionar presupuesto --</option>
                {quotes.map(q => (
                  <option key={q.id} value={q.id}>
                    {q.quoteNumber} - {q.clientName} ({q.items.length} equipos cotizados)
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Client & Metadata */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-800 dark:text-slate-300">Cliente / Empresa *</label>
              <input
                type="text"
                required
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="Ej. Ing. Carlos Mendoza"
                className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white shadow-sm"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-800 dark:text-slate-300">Teléfono / WhatsApp *</label>
              <input
                type="tel"
                required
                value={clientPhone}
                onChange={(e) => setClientPhone(e.target.value)}
                placeholder="809-555-1234"
                className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white shadow-sm"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-800 dark:text-slate-300">Estado de la Orden</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as WorkOrderStatus)}
                className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-200 font-bold"
              >
                <option value="pending">🟡 Pendiente de Iniciar</option>
                <option value="in_progress">🔵 En Ejecución / Trabajo de Campo</option>
                <option value="completed">🟢 Trabajo Terminado</option>
                <option value="signed">✍️ Firmada & Aceptada por Cliente</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1 sm:col-span-2">
              <label className="text-xs font-bold text-slate-800 dark:text-slate-300">Ubicación / Dirección de la Obra</label>
              <input
                type="text"
                value={clientAddress}
                onChange={(e) => setClientAddress(e.target.value)}
                placeholder="Calle, nave, sector, ciudad"
                className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white shadow-sm"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-800 dark:text-slate-300">Área de Servicio</label>
              <select
                value={serviceCategory}
                onChange={(e) => setServiceCategory(e.target.value as ServiceCategory)}
                className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-200 font-medium"
              >
                <option value="camaras">CCTV / Cámaras IP</option>
                <option value="redes">Redes & Wi-Fi</option>
                <option value="motores">Motores para Portón</option>
                <option value="cerraduras">Cerraduras Magnéticas</option>
                <option value="acceso">Control de Acceso</option>
                <option value="ponchadores">Ponchadores</option>
                <option value="alarmas">Alarmas</option>
                <option value="intercom">Intercom</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-800 dark:text-slate-300">Técnico Responsable</label>
              <input
                type="text"
                value={assignedTechnician}
                onChange={(e) => setAssignedTechnician(e.target.value)}
                placeholder="Nombre del técnico"
                className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white shadow-sm"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-800 dark:text-slate-300">Fecha Programada</label>
              <input
                type="date"
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-200"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-800 dark:text-slate-300">Fecha de Culminación</label>
              <input
                type="date"
                value={completedDate}
                onChange={(e) => setCompletedDate(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-200"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-800 dark:text-slate-300">Alcance de los Trabajos (Scope of Work)</label>
            <textarea
              rows={2}
              value={scopeOfWork}
              onChange={(e) => setScopeOfWork(e.target.value)}
              placeholder="Detalle de los equipos que se instalan y pruebas requeridas..."
              className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white resize-none shadow-sm"
            />
          </div>

          {/* Checklist of Quality and Completion */}
          <div className="space-y-3 pt-3 border-t-2 border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-brand-teal-600 dark:text-brand-teal-400" />
                <span>Checklist de Conformidad Técnica ({checklist.filter(c => c.completed).length}/{checklist.length})</span>
              </label>
            </div>

            <div className="space-y-2">
              {checklist.map((item) => (
                <div 
                  key={item.id}
                  onClick={() => handleToggleChecklist(item.id)}
                  className={`p-2.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                    item.completed
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-500/40 text-slate-900 dark:text-white'
                      : 'bg-slate-50 dark:bg-slate-800/60 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={item.completed}
                      onChange={() => handleToggleChecklist(item.id)}
                      className="rounded border-slate-300 text-brand-green-600 focus:ring-brand-green-500 w-4 h-4"
                    />
                    <span className={`text-xs font-semibold ${item.completed ? 'line-through text-slate-500 dark:text-slate-400' : ''}`}>
                      {item.task}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); handleRemoveChecklistTask(item.id); }}
                    className="p-1 text-slate-400 hover:text-rose-500"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Agregar nuevo punto de verificación técnica..."
                value={newChecklistTask}
                onChange={(e) => setNewChecklistTask(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddChecklistTask(); } }}
                className="flex-1 px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white shadow-sm"
              />
              <button
                type="button"
                onClick={handleAddChecklistTask}
                className="px-3.5 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-800 dark:text-slate-300 border border-slate-300 dark:border-slate-700"
              >
                + Agregar
              </button>
            </div>
          </div>

          {/* ULTRA POLISHED Photo Evidence Section (Before / After) */}
          <div className="space-y-4 pt-3 border-t-2 border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                <ImageIcon className="w-4 h-4 text-brand-teal-600" />
                <span>Galería de Evidencia Fotográfica (Antes & Después)</span>
              </h4>

              <button
                type="button"
                onClick={handleApplyPresetGallery}
                className="px-3 py-1.5 rounded-lg bg-brand-teal-50 dark:bg-brand-teal-950/80 hover:bg-brand-teal-100 text-brand-teal-800 dark:text-brand-teal-300 border border-brand-teal-300 dark:border-brand-teal-500/40 text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
              >
                <Sparkles className="w-3.5 h-3.5 text-brand-teal-600" />
                <span>Cargar Fotos de Muestra de {PRESET_EVIDENCE_GALLERIES[serviceCategory]?.label || 'Servicio'}</span>
              </button>
            </div>

            {/* Hidden file inputs for local uploads */}
            <input
              type="file"
              ref={beforeFileInputRef}
              onChange={handleUploadBeforeFile}
              accept="image/*"
              multiple
              className="hidden"
            />
            <input
              type="file"
              ref={afterFileInputRef}
              onChange={handleUploadAfterFile}
              accept="image/*"
              multiple
              className="hidden"
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              
              {/* BEFORE GALLERY BOX */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border-2 border-slate-300 dark:border-slate-700 space-y-3 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                    <span className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wide">
                      Estado Inicial (Antes)
                    </span>
                  </div>
                  <span className="text-[11px] font-mono font-bold text-slate-500">
                    {beforeImages.length} fotos
                  </span>
                </div>

                {/* Upload & URL Controls */}
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => beforeFileInputRef.current?.click()}
                      className="flex-1 py-2 px-3 rounded-xl bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center justify-center gap-2 shadow-sm transition-all"
                    >
                      <Camera className="w-4 h-4 text-amber-600" />
                      <span>Subir / Tomar Foto</span>
                    </button>
                  </div>

                  <div className="flex gap-1.5">
                    <input
                      type="url"
                      placeholder="O pegar URL web..."
                      value={beforeImgInput}
                      onChange={(e) => setBeforeImgInput(e.target.value)}
                      className="flex-1 px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white shadow-sm"
                    />
                    <button
                      type="button"
                      onClick={handleAddBeforeImage}
                      className="px-3 py-1.5 rounded-lg bg-slate-200 dark:bg-slate-700 text-xs font-bold text-slate-800 dark:text-slate-200"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Before Images Grid */}
                {beforeImages.length === 0 ? (
                  <div 
                    onClick={() => beforeFileInputRef.current?.click()}
                    className="p-6 text-center border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl text-slate-400 text-xs cursor-pointer hover:bg-slate-100/50 dark:hover:bg-slate-800/30 transition-all flex flex-col items-center gap-1.5"
                  >
                    <Upload className="w-6 h-6 text-slate-400" />
                    <span className="font-semibold">Haz clic para subir fotos del estado inicial</span>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-1">
                    {beforeImages.map((img, i) => (
                      <div key={i} className="relative h-24 rounded-xl overflow-hidden border border-slate-300 dark:border-slate-700 group shadow-sm bg-black/10">
                        <img src={img} alt={`Antes ${i}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                        
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                          <button
                            type="button"
                            onClick={() => setPreviewZoomImage(img)}
                            className="p-1.5 bg-white/90 text-slate-900 rounded-lg hover:bg-white shadow"
                            title="Ampliar foto"
                          >
                            <Maximize2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setBeforeImages(prev => prev.filter((_, idx) => idx !== i))}
                            className="p-1.5 bg-rose-600 text-white rounded-lg hover:bg-rose-700 shadow"
                            title="Eliminar foto"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <span className="absolute bottom-1 left-1 px-1.5 py-0.2 rounded bg-black/70 text-[9px] font-bold text-amber-300">
                          Antes #{i + 1}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* AFTER GALLERY BOX */}
              <div className="p-4 rounded-2xl bg-emerald-50/40 dark:bg-emerald-950/20 border-2 border-emerald-300 dark:border-emerald-600/40 space-y-3 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-xs font-black text-emerald-950 dark:text-emerald-300 uppercase tracking-wide">
                      Trabajo Culminado (Después)
                    </span>
                  </div>
                  <span className="text-[11px] font-mono font-bold text-emerald-700 dark:text-emerald-400">
                    {afterImages.length} fotos
                  </span>
                </div>

                {/* Upload & URL Controls */}
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => afterFileInputRef.current?.click()}
                      className="flex-1 py-2 px-3 rounded-xl bg-white dark:bg-slate-900 hover:bg-emerald-50 dark:hover:bg-slate-800 border border-emerald-300 dark:border-emerald-500/40 text-xs font-bold text-emerald-950 dark:text-emerald-200 flex items-center justify-center gap-2 shadow-sm transition-all"
                    >
                      <Camera className="w-4 h-4 text-emerald-600" />
                      <span>Subir / Tomar Foto</span>
                    </button>
                  </div>

                  <div className="flex gap-1.5">
                    <input
                      type="url"
                      placeholder="O pegar URL web..."
                      value={afterImgInput}
                      onChange={(e) => setAfterImgInput(e.target.value)}
                      className="flex-1 px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white shadow-sm"
                    />
                    <button
                      type="button"
                      onClick={handleAddAfterImage}
                      className="px-3 py-1.5 rounded-lg bg-emerald-200 dark:bg-emerald-800 text-xs font-bold text-emerald-950 dark:text-emerald-100"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* After Images Grid */}
                {afterImages.length === 0 ? (
                  <div 
                    onClick={() => afterFileInputRef.current?.click()}
                    className="p-6 text-center border-2 border-dashed border-emerald-300 dark:border-emerald-700 rounded-xl text-emerald-700/70 dark:text-emerald-400 text-xs cursor-pointer hover:bg-emerald-100/50 dark:hover:bg-emerald-900/30 transition-all flex flex-col items-center gap-1.5"
                  >
                    <Upload className="w-6 h-6 text-emerald-600" />
                    <span className="font-semibold">Haz clic para subir fotos del trabajo terminado</span>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-1">
                    {afterImages.map((img, i) => (
                      <div key={i} className="relative h-24 rounded-xl overflow-hidden border-2 border-emerald-500 group shadow-sm bg-black/10">
                        <img src={img} alt={`Después ${i}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                        
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                          <button
                            type="button"
                            onClick={() => setPreviewZoomImage(img)}
                            className="p-1.5 bg-white/90 text-slate-900 rounded-lg hover:bg-white shadow"
                            title="Ampliar foto"
                          >
                            <Maximize2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setAfterImages(prev => prev.filter((_, idx) => idx !== i))}
                            className="p-1.5 bg-rose-600 text-white rounded-lg hover:bg-rose-700 shadow"
                            title="Eliminar foto"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <span className="absolute bottom-1 left-1 px-1.5 py-0.2 rounded bg-emerald-950 text-[9px] font-bold text-emerald-300">
                          Después #{i + 1}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          </div>

          {/* Notes & Feedback */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-800 dark:text-slate-300">Observaciones del Técnico</label>
              <textarea
                rows={2}
                value={technicianNotes}
                onChange={(e) => setTechnicianNotes(e.target.value)}
                placeholder="Observaciones de terreno, calibración..."
                className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white resize-none shadow-sm"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-800 dark:text-slate-300">Comentarios de Conformidad del Cliente</label>
              <textarea
                rows={2}
                value={clientFeedback}
                onChange={(e) => setClientFeedback(e.target.value)}
                placeholder="Comentarios del cliente al momento de recibir los trabajos..."
                className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white resize-none shadow-sm"
              />
            </div>
          </div>

          {/* Submit */}
          <div className="pt-4 border-t-2 border-slate-200 dark:border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsWorkOrderModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-slate-300 text-xs font-semibold border border-slate-300 dark:border-slate-700"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-brand-green-500 to-brand-teal-500 hover:from-brand-green-400 hover:to-brand-teal-400 text-slate-950 font-black text-xs shadow-md border border-brand-green-600/30 flex items-center gap-1.5"
            >
              <Save className="w-4 h-4" />
              <span>Guardar Orden de Trabajo</span>
            </button>
          </div>

        </form>

        {/* Fullscreen Photo Zoom Lightbox */}
        {previewZoomImage && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fadeIn">
            <div className="relative max-w-3xl w-full max-h-[85vh] flex flex-col items-center">
              <button
                onClick={() => setPreviewZoomImage(null)}
                className="absolute -top-12 right-0 p-2 rounded-full bg-white/20 text-white hover:bg-white/40 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
              <img
                src={previewZoomImage}
                alt="Vista previa ampliada"
                className="max-w-full max-h-[80vh] rounded-2xl object-contain border-2 border-slate-700 shadow-2xl"
              />
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
