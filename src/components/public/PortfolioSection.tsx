import React, { useState } from 'react';
import { useAppState } from '../../context/AppStateContext';
import { PortfolioProject, ServiceCategory } from '../../types';
import { 
  Building, 
  MapPin, 
  Calendar, 
  CheckCircle, 
  X, 
  ExternalLink, 
  Layers, 
  Sparkles,
  Star
} from 'lucide-react';
import { getCategoryInfo } from '../../utils/formatters';

export const PortfolioSection: React.FC = () => {
  const { portfolio } = useAppState();
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [selectedProject, setSelectedProject] = useState<PortfolioProject | null>(null);

  const categories = [
    { id: 'all', label: 'Todos los Trabajos' },
    { id: 'camaras', label: 'Cámaras CCTV/IP' },
    { id: 'motores', label: 'Motores de Portón' },
    { id: 'acceso', label: 'Control de Acceso' },
    { id: 'redes', label: 'Redes & Wi-Fi' },
    { id: 'intercom', label: 'Intercom' },
  ];

  const filteredProjects = activeCategory === 'all' 
    ? portfolio 
    : portfolio.filter(p => p.category === activeCategory);

  return (
    <section id="portafolio" className="py-24 bg-slate-100/80 dark:bg-slate-900/60 relative transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Title */}
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-brand-teal-100 dark:bg-brand-teal-500/10 border border-brand-teal-300 dark:border-brand-teal-500/20 text-brand-teal-800 dark:text-brand-teal-400 text-xs font-bold uppercase tracking-wider shadow-sm">
            <Layers className="w-4 h-4" />
            Galería de Experiencia
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
            Nuestros Trabajos Realizados
          </h2>
          <p className="text-slate-700 dark:text-slate-400 text-sm sm:text-base font-medium">
            Conoce algunos de los proyectos de instalación y automatización que hemos ejecutado con éxito en todo el país.
          </p>
        </div>

        {/* Category Filter Tabs */}
        <div className="flex items-center justify-center flex-wrap gap-2 mb-12">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-sm ${
                activeCategory === cat.id
                  ? 'bg-gradient-to-r from-brand-teal-500 to-brand-green-500 text-slate-950 shadow-md border border-brand-teal-600/30'
                  : 'bg-white dark:bg-slate-800/80 text-slate-800 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/80 hover:text-black dark:hover:text-white border border-slate-300 dark:border-slate-700/60'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => {
            const catInfo = getCategoryInfo(project.category);
            return (
              <div
                key={project.id}
                onClick={() => setSelectedProject(project)}
                className="group cursor-pointer rounded-2xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 hover:border-brand-teal-500 overflow-hidden transition-all duration-300 hover:-translate-y-1.5 shadow-md hover:shadow-xl flex flex-col justify-between"
              >
                <div>
                  <div className="relative h-52 w-full overflow-hidden bg-slate-200 dark:bg-slate-800 border-b-2 border-slate-200 dark:border-slate-800">
                    <img
                      src={project.images?.[0] || 'https://images.unsplash.com/photo-1557597774-9d273605dfa9?auto=format&fit=crop&w=800&q=80'}
                      alt={project.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />
                    
                    <div className="absolute top-3 left-3">
                      <span className={`px-2.5 py-1 rounded-md text-[11px] font-bold border backdrop-blur-md shadow-sm ${catInfo.color}`}>
                        {catInfo.label}
                      </span>
                    </div>

                    <div className="absolute bottom-3 right-3 text-[11px] text-white bg-slate-900/80 backdrop-blur-md px-2 py-0.5 rounded border border-slate-700 flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-slate-300" />
                      <span>{project.date}</span>
                    </div>
                  </div>

                  <div className="p-6 space-y-3">
                    <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400 font-bold">
                      <Building className="w-3.5 h-3.5 text-brand-teal-600" />
                      <span>Cliente: {project.client} · {project.location}</span>
                    </div>

                    <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-snug group-hover:text-brand-teal-600 dark:group-hover:text-brand-teal-300 transition-colors">
                      {project.title}
                    </h3>

                    <p className="text-xs text-slate-700 dark:text-slate-400 line-clamp-2 leading-relaxed">
                      {project.description}
                    </p>
                  </div>
                </div>

                <div className="px-6 pb-6 pt-2">
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {project.equipmentInstalled?.slice(0, 2).map((s: string, idx: number) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-300 border border-slate-300 dark:border-slate-700"
                      >
                        {s}
                      </span>
                    ))}
                  </div>

                  <div className="pt-3 border-t-2 border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs font-bold text-brand-teal-700 dark:text-brand-teal-400">
                    <span>Ver ficha del proyecto</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

      </div>

      {/* Project Detail Modal */}
      {selectedProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-3xl max-w-2xl w-full p-6 sm:p-8 relative max-h-[90vh] overflow-y-auto shadow-2xl space-y-6">
            <button
              onClick={() => setSelectedProject(null)}
              className="absolute top-5 right-5 p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-black dark:hover:text-white border border-slate-300 dark:border-slate-700"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="rounded-2xl overflow-hidden h-64 bg-slate-200 dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-700">
              <img
                src={selectedProject.images?.[0]}
                alt={selectedProject.title}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded text-xs font-bold bg-brand-teal-100 text-brand-teal-900 dark:bg-brand-teal-950 dark:text-brand-teal-300 border border-brand-teal-300 dark:border-brand-teal-500/30">
                  {selectedProject.client} · {selectedProject.location}
                </span>
              </div>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white">
                {selectedProject.title}
              </h3>
            </div>

            <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed font-medium">
              {selectedProject.description}
            </p>

            {selectedProject.equipmentInstalled && selectedProject.equipmentInstalled.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                  Equipamiento & Especificaciones
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {selectedProject.equipmentInstalled.map((spec: string, i: number) => (
                    <div key={i} className="flex items-center gap-2 text-xs text-slate-800 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-xl border border-slate-300 dark:border-slate-700">
                      <CheckCircle className="w-4 h-4 text-brand-green-600 flex-shrink-0" />
                      <span>{spec}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="pt-4 border-t-2 border-slate-200 dark:border-slate-800 flex justify-end">
              <button
                onClick={() => setSelectedProject(null)}
                className="px-5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-800 dark:text-slate-300 hover:bg-slate-200 border border-slate-300 dark:border-slate-700"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

    </section>
  );
};
