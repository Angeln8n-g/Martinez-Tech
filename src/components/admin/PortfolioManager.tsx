import React, { useState } from 'react';
import { useAppState } from '../../context/AppStateContext';
import { PortfolioProject, ServiceCategory } from '../../types';
import { 
  Plus, 
  Search, 
  Trash2, 
  Edit, 
  X, 
  Globe
} from 'lucide-react';
import { getCategoryInfo } from '../../utils/formatters';

export const PortfolioManager: React.FC = () => {
  const { portfolio, addPortfolioProject, updatePortfolioProject, deletePortfolioProject } = useAppState();

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

  const openNewModal = () => {
    setEditingProject(null);
    setTitle('');
    setCategory('camaras');
    setClient('Residencial / Condominio');
    setLocation('Santo Domingo, D.N.');
    setDate(new Date().toISOString().slice(0, 7));
    setDescription('');
    setImageUrl('https://images.unsplash.com/photo-1557597774-9d273605dfa9?auto=format&fit=crop&w=800&q=80');
    setFeatured(false);
    setEquipmentInstalled(['Instalación certificada', 'Garantía 1 año']);
    setIsModalOpen(true);
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-300 dark:border-slate-800 shadow-md">
        
        <div className="flex items-center gap-3 flex-1 flex-wrap">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar proyectos en portafolio por título, cliente o ubicación..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white placeholder-slate-500 focus:outline-none focus:border-brand-teal-500 shadow-sm"
            />
          </div>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200 font-bold focus:outline-none focus:border-brand-teal-500 shadow-sm"
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
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-teal-600 hover:bg-brand-teal-500 text-white font-bold text-xs shadow-md border border-brand-teal-700/20"
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
              className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-2xl overflow-hidden shadow-md hover:shadow-lg transition-all flex flex-col justify-between"
            >
              <div className="relative h-48 bg-slate-100 dark:bg-slate-800 overflow-hidden border-b-2 border-slate-200 dark:border-slate-800">
                <img
                  src={project.images[0] || 'https://images.unsplash.com/photo-1557597774-9d273605dfa9?auto=format&fit=crop&w=800&q=80'}
                  alt={project.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 left-3 flex gap-2">
                  <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold border shadow-sm ${catInfo.color}`}>
                    {catInfo.label}
                  </span>
                  {project.featured && (
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-400 text-slate-950 shadow-sm">
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

                <div className="pt-3 border-t-2 border-slate-200 dark:border-slate-800 flex items-center justify-between">
                  <div className="text-[11px] text-slate-600 dark:text-slate-400 font-medium">
                    {project.equipmentInstalled?.length || 0} equipos instalados
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditModal(project)}
                      className="p-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700"
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
                      className="p-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 hover:bg-rose-100 text-rose-600 dark:text-rose-400 border border-slate-300 dark:border-slate-700"
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
          <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-2xl max-w-lg w-full p-6 relative max-h-[90vh] overflow-y-auto shadow-2xl space-y-5">
            
            <div className="flex items-center justify-between border-b-2 border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                {editingProject ? 'Editar Proyecto' : 'Publicar Nuevo Trabajo en Portafolio'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-black dark:hover:text-white">
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
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white shadow-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-800 dark:text-slate-300">Categoría del Servicio</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as ServiceCategory)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-200 font-medium"
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
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white shadow-sm"
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
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white shadow-sm"
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
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white shadow-sm"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-800 dark:text-slate-300">URL de la Imagen de Portada *</label>
                <input
                  type="url"
                  required
                  placeholder="https://images.unsplash.com/..."
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white font-mono shadow-sm"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-800 dark:text-slate-300">Descripción del Trabajo Realizado *</label>
                <textarea
                  rows={3}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Detalles sobre los equipos instalados, alcance del proyecto y resultados..."
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white resize-none shadow-sm"
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
                    className="flex-1 px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white shadow-sm"
                  />
                  <button
                    type="button"
                    onClick={handleAddEquip}
                    className="px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-800 dark:text-slate-300 border border-slate-300 dark:border-slate-700"
                  >
                    + Agregar
                  </button>
                </div>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  {equipmentInstalled.map((s, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-300 border border-slate-300 dark:border-slate-700 flex items-center gap-1.5"
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
                  className="rounded border-slate-300 text-brand-teal-600 focus:ring-brand-teal-500"
                />
                <label htmlFor="featuredProject" className="text-xs font-bold text-slate-800 dark:text-slate-300 cursor-pointer">
                  Destacar este proyecto en la portada del sitio web
                </label>
              </div>

              <div className="pt-3 border-t-2 border-slate-200 dark:border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-300 border border-slate-300 dark:border-slate-700"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-brand-teal-600 hover:bg-brand-teal-500 text-white font-bold text-xs shadow-md border border-brand-teal-700/20"
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
