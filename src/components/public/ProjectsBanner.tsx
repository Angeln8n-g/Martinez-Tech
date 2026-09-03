import React, { useState, useEffect, useRef } from 'react';
import { useAppState } from '../../context/AppStateContext';
import { PortfolioProject } from '../../types';
import { getCategoryInfo, createWhatsAppUrl } from '../../utils/formatters';
import {
  ChevronLeft,
  ChevronRight,
  Sparkles,
  ShieldCheck,
  Building,
  Calendar,
  CheckCircle2,
  ExternalLink,
  MessageCircle,
  X,
  Award,
  Layers,
  Star,
  Filter
} from 'lucide-react';

export const ProjectsBanner: React.FC = () => {
  const { portfolio, companySettings } = useAppState();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [selectedProject, setSelectedProject] = useState<PortfolioProject | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const categories = [
    { id: 'all', label: 'Todos los Trabajos' },
    { id: 'camaras', label: 'Cámaras CCTV' },
    { id: 'motores', label: 'Motores de Portón' },
    { id: 'acceso', label: 'Control de Acceso' },
    { id: 'redes', label: 'Redes & Wi-Fi' },
    { id: 'alarmas', label: 'Alarmas' },
    { id: 'intercom', label: 'Intercom' },
  ];

  // Filter projects by category
  const displayProjects = selectedCategory === 'all'
    ? portfolio
    : portfolio.filter((p) => p.category === selectedCategory);

  // Reset index when category changes
  useEffect(() => {
    setCurrentIndex(0);
  }, [selectedCategory]);

  // Auto-play timer
  useEffect(() => {
    if (displayProjects.length <= 1 || isPaused) return;

    timerRef.current = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % displayProjects.length);
    }, 5500);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [displayProjects.length, isPaused]);

  const handlePrev = () => {
    if (displayProjects.length === 0) return;
    setCurrentIndex((prev) => (prev === 0 ? displayProjects.length - 1 : prev - 1));
  };

  const handleNext = () => {
    if (displayProjects.length === 0) return;
    setCurrentIndex((prev) => (prev + 1) % displayProjects.length);
  };

  const handleQuoteProject = (project: PortfolioProject) => {
    const text = `¡Hola Martínez Tech! Vi el trabajo realizado *"# ${project.title}"* en su sitio web y me gustaría cotizar un proyecto similar para mi inmueble.`;
    window.open(createWhatsAppUrl(companySettings.whatsapp, text), '_blank');
  };

  if (portfolio.length === 0) return null;

  const current = displayProjects[currentIndex] || displayProjects[0] || portfolio[0];
  const catInfo = current ? getCategoryInfo(current.category) : { label: 'General', color: 'bg-slate-100 text-slate-800' };

  return (
    <section 
      id="portafolio" 
      className="py-14 sm:py-20 bg-gradient-to-b from-slate-50 via-slate-100/90 to-slate-50 dark:from-slate-950 dark:via-slate-900/80 dark:to-slate-950 border-y border-slate-200 dark:border-slate-800/80 relative overflow-hidden transition-colors duration-200 scroll-mt-20"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Background Subtle Glows */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-brand-teal-500/5 dark:bg-brand-teal-500/10 blur-[100px] rounded-full pointer-events-none -z-10" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-brand-green-500/5 dark:bg-brand-green-500/10 blur-[100px] rounded-full pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Banner Top Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-brand-teal-100 dark:bg-brand-teal-500/10 border border-brand-teal-300 dark:border-brand-teal-500/20 text-brand-teal-800 dark:text-brand-teal-400 text-xs font-black uppercase tracking-wider mb-2.5 shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-brand-green-600 dark:text-brand-green-400" />
              <span>Garantía de Experiencia Comprobada</span>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
              Nuestros Trabajos Realizados
            </h2>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 font-normal mt-1 max-w-2xl">
              Explora instalaciones y proyectos reales ejecutados por nuestro equipo técnico con los más altos estándares de calidad.
            </p>
          </div>

          {/* Slider Navigation Arrows */}
          <div className="flex items-center gap-2 self-start md:self-end">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 hidden sm:inline-block mr-2">
              {displayProjects.length > 0 ? `${currentIndex + 1} de ${displayProjects.length} trabajos` : '0 trabajos'}
            </span>
            <button
              onClick={handlePrev}
              disabled={displayProjects.length <= 1}
              aria-label="Trabajo anterior"
              className="p-2.5 rounded-xl bg-white dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 hover:text-black dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700/80 border border-slate-300 dark:border-slate-700 shadow-sm transition-all active:scale-95 disabled:opacity-40 disabled:pointer-events-none"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleNext}
              disabled={displayProjects.length <= 1}
              aria-label="Trabajo siguiente"
              className="p-2.5 rounded-xl bg-white dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 hover:text-black dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700/80 border border-slate-300 dark:border-slate-700 shadow-sm transition-all active:scale-95 disabled:opacity-40 disabled:pointer-events-none"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-3 mb-6 scrollbar-thin">
          <div className="flex items-center gap-1 text-xs font-bold text-slate-500 dark:text-slate-400 mr-2 flex-shrink-0">
            <Filter className="w-3.5 h-3.5" />
            <span>Filtrar:</span>
          </div>
          {categories.map((cat) => {
            const isActive = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all shadow-xs flex-shrink-0 ${
                  isActive
                    ? 'bg-gradient-to-r from-brand-teal-500 to-brand-green-500 text-slate-950 font-black shadow-sm border border-brand-teal-600/30'
                    : 'bg-white dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-black dark:hover:text-white border border-slate-200 dark:border-slate-700/80'
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* Main Showcase Banner Card */}
        {displayProjects.length > 0 && current ? (
          <div className="relative rounded-3xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 shadow-xl overflow-hidden group transition-all duration-300">
            
            <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[380px] lg:min-h-[420px]">
              
              {/* Left Image Showcase (7 Cols on desktop) */}
              <div className="lg:col-span-7 relative h-72 sm:h-96 lg:h-auto overflow-hidden bg-slate-950">
                <img
                  src={current.images[0] || 'https://images.unsplash.com/photo-1557597774-9d273605dfa9?auto=format&fit=crop&w=1200&q=80'}
                  alt={current.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                />
                {/* Gradient Overlays */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent" />
                <div className="hidden lg:block absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-white dark:from-slate-900 to-transparent" />

                {/* Floating Badges over image */}
                <div className="absolute top-4 left-4 flex flex-wrap items-center gap-2">
                  <span className={`px-3 py-1 rounded-lg text-xs font-bold backdrop-blur-md border shadow-md ${catInfo.color}`}>
                    {catInfo.label}
                  </span>
                  {current.featured && (
                    <span className="px-2.5 py-1 rounded-lg text-xs font-extrabold bg-amber-400 text-amber-950 shadow-md flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 fill-amber-950" />
                      Destacado
                    </span>
                  )}
                </div>

                <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-xs text-white">
                  <div className="flex items-center gap-2 bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-700/80">
                    <Building className="w-3.5 h-3.5 text-brand-teal-400" />
                    <span className="font-semibold truncate max-w-[200px] sm:max-w-xs">{current.client}</span>
                  </div>

                  <div className="flex items-center gap-1.5 bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-700/80">
                    <Calendar className="w-3.5 h-3.5 text-brand-green-400" />
                    <span>{current.date}</span>
                  </div>
                </div>
              </div>

              {/* Right Information & CTAs (5 Cols on desktop) */}
              <div className="lg:col-span-5 p-6 sm:p-8 flex flex-col justify-between space-y-6">
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-brand-green-500 animate-ping" />
                      {current.location}
                    </span>
                    <span className="text-xs font-bold text-brand-teal-600 dark:text-brand-teal-400">
                      Proyecto {currentIndex + 1} de {displayProjects.length}
                    </span>
                  </div>

                  <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white leading-tight">
                    {current.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
                    {current.description}
                  </p>

                  {/* Equipment Highlights */}
                  {current.equipmentInstalled && current.equipmentInstalled.length > 0 && (
                    <div className="space-y-2 pt-2">
                      <p className="text-[11px] font-bold text-slate-700 dark:text-slate-400 uppercase tracking-wider">
                        Equipamiento & Componentes Clave:
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {current.equipmentInstalled.slice(0, 4).map((item, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700/80 shadow-xs"
                          >
                            <CheckCircle2 className="w-3 h-3 text-brand-green-600 dark:text-brand-green-400 flex-shrink-0" />
                            <span>{item}</span>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Testimonial Quote Snippet if available */}
                  {current.testimonial && (
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 text-xs italic text-slate-700 dark:text-slate-300 flex items-start gap-2">
                      <span className="text-brand-teal-500 font-serif text-lg leading-none">“</span>
                      <div>
                        <p className="line-clamp-2">{current.testimonial.text}</p>
                        <span className="not-italic font-bold text-[10px] text-slate-500 dark:text-slate-400 block mt-1">
                          — {current.testimonial.author} ({current.testimonial.role})
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center gap-3">
                  <button
                    onClick={() => handleQuoteProject(current)}
                    className="w-full sm:flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md hover:shadow-lg transition-all active:scale-95"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>Cotizar Trabajo Similar</span>
                  </button>

                  <button
                    onClick={() => setSelectedProject(current)}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs border border-slate-300 dark:border-slate-700 transition-colors shadow-xs"
                  >
                    <span>Ficha Técnica</span>
                    <ExternalLink className="w-3.5 h-3.5 text-brand-teal-600 dark:text-brand-teal-400" />
                  </button>
                </div>

              </div>

            </div>

            {/* Dots Indicator & Quick Thumbnail Nav Bar */}
            <div className="bg-slate-50 dark:bg-slate-950/70 border-t border-slate-200 dark:border-slate-800 px-4 py-3 flex items-center justify-between flex-wrap gap-3">
              
              {/* Dots */}
              <div className="flex items-center gap-1.5">
                {displayProjects.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentIndex(idx)}
                    aria-label={`Ir al proyecto ${idx + 1}`}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      currentIndex === idx 
                        ? 'w-7 bg-brand-teal-500' 
                        : 'w-2 bg-slate-300 dark:bg-slate-700 hover:bg-slate-400'
                    }`}
                  />
                ))}
              </div>

              {/* Quick Project Mini Thumbnails on Large Screens */}
              <div className="hidden sm:flex items-center gap-2 overflow-x-auto">
                {displayProjects.map((proj, idx) => (
                  <button
                    key={proj.id}
                    onClick={() => setCurrentIndex(idx)}
                    className={`flex items-center gap-2 px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all ${
                      currentIndex === idx
                        ? 'bg-white dark:bg-slate-800 text-brand-teal-700 dark:text-brand-teal-400 border-brand-teal-500 shadow-xs'
                        : 'bg-transparent text-slate-600 dark:text-slate-400 border-transparent hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    <img
                      src={proj.images[0] || 'https://images.unsplash.com/photo-1557597774-9d273605dfa9?auto=format&fit=crop&w=100&q=80'}
                      alt={proj.title}
                      className="w-5 h-5 rounded object-cover"
                    />
                    <span className="truncate max-w-[110px] text-[11px]">{proj.title}</span>
                  </button>
                ))}
              </div>

              {/* Status auto-slide info */}
              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                {isPaused ? '⏸ Pausado' : '▶ Rotación automática'}
              </span>

            </div>

          </div>
        ) : (
          <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
            <p className="text-slate-600 dark:text-slate-400 text-sm font-medium">
              No hay proyectos en esta categoría por el momento.
            </p>
            <button
              onClick={() => setSelectedCategory('all')}
              className="mt-3 px-4 py-2 rounded-xl bg-brand-teal-500 text-slate-950 font-bold text-xs"
            >
              Ver todos los proyectos
            </button>
          </div>
        )}

        {/* Trust Badges Bar below showcase */}
        <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-brand-teal-50 dark:bg-brand-teal-950/60 text-brand-teal-600 dark:text-brand-teal-400">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <strong className="block text-xs sm:text-sm font-black text-slate-900 dark:text-white">+150 Proyectos</strong>
              <span className="text-[11px] text-slate-600 dark:text-slate-400">Instalados y operativos</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-brand-green-50 dark:bg-brand-green-950/60 text-brand-green-600 dark:text-brand-green-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <strong className="block text-xs sm:text-sm font-black text-slate-900 dark:text-white">1 Año Garantía</strong>
              <span className="text-[11px] text-slate-600 dark:text-slate-400">Certificada por escrito</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
              <Building className="w-5 h-5" />
            </div>
            <div>
              <strong className="block text-xs sm:text-sm font-black text-slate-900 dark:text-white">Residencial e Industrial</strong>
              <span className="text-[11px] text-slate-600 dark:text-slate-400">Soluciones a la medida</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
              <MessageCircle className="w-5 h-5" />
            </div>
            <div>
              <strong className="block text-xs sm:text-sm font-black text-slate-900 dark:text-white">Levantamiento en Sitio</strong>
              <span className="text-[11px] text-slate-600 dark:text-slate-400">Evaluación técnica sin costo</span>
            </div>
          </div>
        </div>

      </div>

      {/* Project Detail Modal */}
      {selectedProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-3xl max-w-2xl w-full p-6 sm:p-8 relative max-h-[90vh] overflow-y-auto shadow-2xl space-y-6">
            
            <button
              onClick={() => setSelectedProject(null)}
              className="absolute top-5 right-5 p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-black dark:hover:text-white border border-slate-300 dark:border-slate-700 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="rounded-2xl overflow-hidden h-64 sm:h-72 bg-slate-200 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700">
              <img
                src={selectedProject.images[0]}
                alt={selectedProject.title}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-3 py-1 rounded-md text-xs font-bold bg-brand-teal-100 text-brand-teal-900 dark:bg-brand-teal-950 dark:text-brand-teal-300 border border-brand-teal-300 dark:border-brand-teal-500/30">
                  {selectedProject.client} · {selectedProject.location}
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  {selectedProject.date}
                </span>
              </div>

              <h3 className="text-2xl font-black text-slate-900 dark:text-white">
                {selectedProject.title}
              </h3>
            </div>

            <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed font-normal">
              {selectedProject.description}
            </p>

            {/* Equipment list */}
            {selectedProject.equipmentInstalled && selectedProject.equipmentInstalled.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                  Equipamiento & Especificaciones Instaladas
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {selectedProject.equipmentInstalled.map((spec: string, i: number) => (
                    <div key={i} className="flex items-center gap-2 text-xs text-slate-800 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-xl border border-slate-300 dark:border-slate-700">
                      <CheckCircle2 className="w-4 h-4 text-brand-green-600 flex-shrink-0" />
                      <span>{spec}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Testimonial if present */}
            {selectedProject.testimonial && (
              <div className="p-4 rounded-2xl bg-brand-teal-50 dark:bg-brand-teal-950/40 border border-brand-teal-200 dark:border-brand-teal-500/30 space-y-2">
                <div className="flex items-center gap-1 text-amber-500">
                  {[...Array(selectedProject.testimonial.rating || 5)].map((_, idx) => (
                    <Star key={idx} className="w-4 h-4 fill-amber-400" />
                  ))}
                </div>
                <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 italic">
                  "{selectedProject.testimonial.text}"
                </p>
                <span className="block text-[11px] font-bold text-brand-teal-800 dark:text-brand-teal-400">
                  — {selectedProject.testimonial.author}, {selectedProject.testimonial.role}
                </span>
              </div>
            )}

            {/* Actions */}
            <div className="pt-4 border-t-2 border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
              <button
                onClick={() => setSelectedProject(null)}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-800 dark:text-slate-300 hover:bg-slate-200 border border-slate-300 dark:border-slate-700"
              >
                Cerrar
              </button>

              <button
                onClick={() => {
                  handleQuoteProject(selectedProject);
                  setSelectedProject(null);
                }}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Cotizar Proyecto Similar por WhatsApp</span>
              </button>
            </div>

          </div>
        </div>
      )}

    </section>
  );
};
