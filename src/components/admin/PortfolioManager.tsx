import React, { useState, useRef } from 'react';
import { useAppState } from '../../context/AppStateContext';
import { useToast } from '../ui/ToastNotification';
import { PortfolioProject, ServiceCategory } from '../../types';
import { 
  Plus, 
  Search, 
  Trash2, 
  Edit, 
  X, 
  Globe,
  UploadCloud,
  Image as ImageIcon,
  Loader2,
  CheckCircle2,
  Link2
} from 'lucide-react';
import { getCategoryInfo } from '../../utils/formatters';
import { uploadPortfolioImage } from '../../services/supabase';
import { compressImage } from '../../utils/imageCompression';

export const PortfolioManager: React.FC = () => {
  const { portfolio, addPortfolioProject, updatePortfolioProject, deletePortfolioProject } = useAppState();
  const { showToast } = useToast();

  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<PortfolioProject | null>(null);

  // Form fields
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<ServiceCategory>('camaras');
  const [client, setClient] = useState('Residencial / Condominio');
  const [location, setLocation] = useState('Santo Domingo, D.N.');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 7));
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [featured, setFeatured] = useState(false);
  const [equipInput, setEquipInput] = useState('');
  const [equipmentInstalled, setEquipmentInstalled] = useState<string[]>([]);

  // Drag and Drop & Storage Upload State
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const openNewModal = () => {
    setEditingProject(null);
    setTitle('');
    setCategory('camaras');
    setClient('Residencial / Condominio');
    setLocation('Santo Domingo, D.N.');
    setDate(new Date().toISOString().slice(0, 7));
    setDescription('');
    setImageUrl('');
    setFeatured(false);
    setEquipmentInstalled(['Instalación certificada', 'Garantía 1 año']);
    setIsUploading(false);
    setUploadProgress(null);
    setIsModalOpen(true);
  };

  const handleProcessAndUploadImage = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      showToast('Por favor selecciona un archivo de imagen válido (JPG, PNG, WebP)', 'error');
      return;
    }

    setIsUploading(true);
    setUploadProgress('Optimizando imagen...');

    try {
      // 1. Client-side compression for blazing fast mobile & desktop upload
      const compressed = await compressImage(file, { maxWidth: 1600, maxHeight: 1200, quality: 0.84 });
      setUploadProgress('Subiendo al Bucket de Almacenamiento...');

      // 2. Upload to Supabase Storage Bucket
      const publicUrl = await uploadPortfolioImage(compressed);

      setImageUrl(publicUrl);
      showToast('¡Imagen subida y alojada exitosamente en el Bucket!', 'success');
    } catch (err: unknown) {
      console.warn('Error uploading to Supabase Storage, falling back to Base64:', err);
      // Fallback to local Base64 URL so the user never gets blocked
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setImageUrl(event.target.result as string);
          showToast('Imagen cargada localmente con éxito', 'info');
        }
      };
      reader.readAsDataURL(file);
    } finally {
      setIsUploading(false);
      setUploadProgress(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      await handleProcessAndUploadImage(files[0]);
    }
  };

  const handleFileInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      await handleProcessAndUploadImage(files[0]);
    }
  };

  const openEditModal = (p: PortfolioProject) => {
    setEditingProject(p);
    setTitle(p.title);
    setCategory(p.category);
    setClient(p.client);
    setLocation(p.location);
    setDate(p.date);
    setDescription(p.description);
    setImageUrl(p.images[0] || '');
    setFeatured(p.featured || false);
    setEquipmentInstalled(p.equipmentInstalled || []);
    setIsModalOpen(true);
  };

  const handleAddEquip = () => {
    if (!equipInput.trim()) return;
    setEquipmentInstalled(prev => [...prev, equipInput.trim()]);
    setEquipInput('');
  };

  const handleRemoveEquip = (idx: number) => {
    setEquipmentInstalled(prev => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description || !imageUrl) return;

    if (editingProject) {
      await updatePortfolioProject(editingProject.id, {
        title,
        category,
        client,
        location,
        date,
        description,
        images: [imageUrl],
        featured,
        equipmentInstalled
      });
    } else {
      await addPortfolioProject({
        title,
        category,
        client,
        location,
        date,
        description,
        images: [imageUrl],
        featured,
        equipmentInstalled
      });
    }

    setIsModalOpen(false);
  };

  const filteredPortfolio = portfolio.filter(p => {
    const matchesSearch = 
      p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.location.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = categoryFilter === 'all' || p.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* Top Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        
        <div className="flex items-center gap-3 flex-1 flex-wrap">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar proyectos en portafolio por título, cliente o ubicación..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white placeholder-slate-500 focus:outline-none focus:border-nexablue-500 shadow-xs"
            />
          </div>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200 font-bold focus:outline-none focus:border-nexablue-500 shadow-xs"
          >
            <option value="all">Todas las Categorías</option>
            <option value="camaras">Cámaras de Vigilancia</option>
            <option value="redes">Redes Informáticas</option>
            <option value="motores">Motores para Portón</option>
            <option value="cerraduras">Cerraduras Magnéticas</option>
            <option value="acceso">Control de Acceso</option>
            <option value="ponchadores">Ponchadores</option>
            <option value="alarmas">Alarmas</option>
            <option value="intercom">Intercom</option>
          </select>
        </div>

        <button
          onClick={openNewModal}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-nexablue-600 hover:bg-nexablue-500 text-white font-bold text-xs shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Publicar Nuevo Proyecto</span>
        </button>
      </div>

      {/* Grid of Portfolio Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPortfolio.map((project) => {
          const catInfo = getCategoryInfo(project.category);

          return (
            <div
              key={project.id}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div className="relative h-48 bg-slate-100 dark:bg-slate-800 overflow-hidden border-b border-slate-200 dark:border-slate-800">
                <img
                  src={project.images[0] || 'https://images.unsplash.com/photo-1557597774-9d273605dfa9?auto=format&fit=crop&w=800&q=80'}
                  alt={project.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 left-3 flex gap-2">
                  <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold border shadow-xs ${catInfo.color}`}>
                    {catInfo.label}
                  </span>
                  {project.featured && (
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-400 text-amber-950 shadow-xs">
                      Destacado
                    </span>
                  )}
                </div>
              </div>

              <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                    Cliente: {project.client} · {project.location}
                  </div>
                  <h4 className="text-base font-bold text-slate-900 dark:text-white leading-snug">
                    {project.title}
                  </h4>
                  <p className="text-xs text-slate-700 dark:text-slate-400 line-clamp-3 leading-relaxed font-normal">
                    {project.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
                  <div className="text-[11px] text-slate-600 dark:text-slate-400 font-medium">
                    {project.equipmentInstalled?.length || 0} equipos instalados
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditModal(project)}
                      className="p-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition-colors"
                      title="Editar"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`¿Eliminar ${project.title}?`)) {
                          deletePortfolioProject(project.id);
                        }
                      }}
                      className="p-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 hover:bg-rose-100 text-rose-600 dark:text-rose-400 border border-slate-200 dark:border-slate-700 transition-colors"
                      title="Eliminar"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Project Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full p-6 relative max-h-[90vh] overflow-y-auto shadow-2xl space-y-5">
            
            <div className="flex items-center justify-between border-b-2 border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                {editingProject ? 'Editar Proyecto' : 'Publicar Nuevo Trabajo en Portafolio'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-black dark:hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5">
              
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-800 dark:text-slate-300">Título del Proyecto *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Sistema CCTV 16 Cámaras 4K en Nave Industrial"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white shadow-xs focus:border-nexablue-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-800 dark:text-slate-300">Categoría del Servicio</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as ServiceCategory)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-200 font-medium focus:border-nexablue-500 focus:outline-none"
                  >
                    <option value="camaras">Cámaras de Vigilancia</option>
                    <option value="redes">Redes Informáticas</option>
                    <option value="motores">Motores para Portón</option>
                    <option value="cerraduras">Cerraduras Magnéticas</option>
                    <option value="acceso">Control de Acceso</option>
                    <option value="ponchadores">Ponchadores</option>
                    <option value="alarmas">Alarmas</option>
                    <option value="intercom">Intercom</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-800 dark:text-slate-300">Cliente o Tipo de Inmueble</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Parque Logístico / Residencial"
                    value={client}
                    onChange={(e) => setClient(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white shadow-xs focus:border-nexablue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-800 dark:text-slate-300">Ubicación / Sector</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. San Isidro, Santo Domingo"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white shadow-xs focus:border-nexablue-500 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-800 dark:text-slate-300">Fecha / Año</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Febrero 2026"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white shadow-xs focus:border-nexablue-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Image Upload Zone (Bucket Storage + Drag and Drop) */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800 dark:text-slate-300 flex items-center gap-1.5">
                    <ImageIcon className="w-3.5 h-3.5 text-nexablue-600 dark:text-cyan-400" />
                    <span>Imagen de Portada del Proyecto *</span>
                  </label>
                  <span className="text-[10px] font-mono font-bold text-slate-500 dark:text-slate-400 uppercase">
                    Bucket Supabase Storage
                  </span>
                </div>

                {/* Hidden File Input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/jpg"
                  onChange={handleFileInputChange}
                  className="hidden"
                />

                {/* Drag and Drop Zone */}
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => !isUploading && fileInputRef.current?.click()}
                  className={`relative cursor-pointer rounded-2xl border-2 border-dashed p-4 transition-all duration-200 text-center ${
                    isDragging
                      ? 'border-nexablue-500 bg-nexablue-50/80 dark:bg-nexablue-950/40 ring-4 ring-nexablue-500/20'
                      : isUploading
                      ? 'border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40 opacity-80 cursor-wait'
                      : imageUrl
                      ? 'border-emerald-500/60 bg-emerald-50/20 dark:bg-emerald-950/20 hover:border-emerald-500'
                      : 'border-slate-300 dark:border-slate-700 hover:border-nexablue-500 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                  }`}
                >
                  {isUploading ? (
                    <div className="py-6 flex flex-col items-center justify-center space-y-2.5">
                      <Loader2 className="w-8 h-8 text-nexablue-600 dark:text-cyan-400 animate-spin" />
                      <div className="text-xs font-bold text-slate-900 dark:text-white">
                        {uploadProgress || 'Subiendo archivo...'}
                      </div>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400">
                        Comprimiendo y alojando de forma segura en la nube...
                      </p>
                    </div>
                  ) : imageUrl ? (
                    <div className="space-y-3">
                      <div className="relative w-full h-40 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 group/prev">
                        <img
                          src={imageUrl}
                          alt="Vista previa de portada"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover/prev:opacity-100 transition-opacity flex items-center justify-center gap-2">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              fileInputRef.current?.click();
                            }}
                            className="px-3 py-1.5 rounded-lg bg-white/90 text-slate-900 text-xs font-bold shadow-md hover:bg-white"
                          >
                            Reemplazar Imagen
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setImageUrl('');
                            }}
                            className="p-1.5 rounded-lg bg-rose-600 text-white shadow-md hover:bg-rose-500"
                            title="Eliminar imagen"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-[11px] px-1 text-emerald-700 dark:text-emerald-400 font-bold">
                        <span className="flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Imagen cargada y lista</span>
                        </span>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono font-normal truncate max-w-[220px]">
                          {imageUrl.startsWith('http') ? 'En la nube (Storage)' : 'En memoria local'}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="py-5 flex flex-col items-center justify-center space-y-2">
                      <div className="w-12 h-12 rounded-2xl bg-nexablue-50 dark:bg-nexablue-950/60 border border-nexablue-200 dark:border-nexablue-800/40 text-nexablue-600 dark:text-cyan-400 flex items-center justify-center shadow-xs">
                        <UploadCloud className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-900 dark:text-white">
                          Arrastra y suelta tu imagen aquí o <span className="text-nexablue-600 dark:text-cyan-400 hover:underline">haz clic para explorar</span>
                        </p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                          Formatos admitidos: PNG, JPG, WebP (Optimización automática &le; 1600px)
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Direct Manual URL Input Fallback */}
                <div className="flex items-center gap-2 pt-1">
                  <div className="relative flex-1">
                    <Link2 className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="url"
                      placeholder="O pega una URL directa de imagen externa..."
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[11px] text-slate-900 dark:text-white font-mono shadow-xs focus:border-nexablue-500 focus:outline-none"
                    />
                  </div>
                  {imageUrl && (
                    <button
                      type="button"
                      onClick={() => setImageUrl('')}
                      className="px-2 py-1.5 text-xs text-rose-600 hover:text-rose-700 dark:text-rose-400 font-bold"
                    >
                      Limpiar
                    </button>
                  )}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-800 dark:text-slate-300">Descripción del Trabajo Realizado *</label>
                <textarea
                  rows={3}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Detalles sobre los equipos instalados, alcance del proyecto y resultados..."
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white resize-none shadow-xs focus:border-nexablue-500 focus:outline-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-800 dark:text-slate-300">Equipamiento Instalado</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Ej. 16x Cámaras Domo 4K ColorVu"
                    value={equipInput}
                    onChange={(e) => setEquipInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddEquip(); } }}
                    className="flex-1 px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white shadow-xs focus:border-nexablue-500 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleAddEquip}
                    className="px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-200 transition-colors"
                  >
                    + Agregar
                  </button>
                </div>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  {equipmentInstalled.map((s, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700 flex items-center gap-1.5"
                    >
                      <span>{s}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveEquip(idx)}
                        className="text-rose-500 hover:text-rose-700 font-bold"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="featuredProject"
                  checked={featured}
                  onChange={(e) => setFeatured(e.target.checked)}
                  className="rounded border-slate-300 text-nexablue-600 focus:ring-nexablue-500"
                />
                <label htmlFor="featuredProject" className="text-xs font-bold text-slate-800 dark:text-slate-300 cursor-pointer">
                  Destacar este proyecto en la portada del sitio web
                </label>
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-200 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-nexablue-600 hover:bg-nexablue-500 text-white font-bold text-xs shadow-sm transition-all"
                >
                  Guardar en Portafolio
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};
