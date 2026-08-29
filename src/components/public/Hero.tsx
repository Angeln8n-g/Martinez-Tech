import React from 'react';
import { 
  ShieldCheck, 
  ArrowRight, 
  Calculator, 
  CheckCircle2, 
  Camera, 
  Network, 
  Car, 
  Lock, 
  Fingerprint, 
  Clock, 
  Bell, 
  PhoneCall,
  Sparkles
} from 'lucide-react';
import { useAppState } from '../../context/AppStateContext';

export const Hero: React.FC = () => {
  const { companySettings } = useAppState();

  const serviceBadges = [
    { name: 'Cámaras de Vigilancia', icon: Camera, color: 'text-brand-teal-600 dark:text-brand-teal-400' },
    { name: 'Redes Informáticas', icon: Network, color: 'text-blue-600 dark:text-blue-400' },
    { name: 'Motores para Portón', icon: Car, color: 'text-amber-600 dark:text-amber-400' },
    { name: 'Cerraduras Magnéticas', icon: Lock, color: 'text-rose-600 dark:text-rose-400' },
    { name: 'Control de Acceso', icon: Fingerprint, color: 'text-purple-600 dark:text-purple-400' },
    { name: 'Ponchadores Biométricos', icon: Clock, color: 'text-orange-600 dark:text-orange-400' },
    { name: 'Alarmas de Seguridad', icon: Bell, color: 'text-red-600 dark:text-red-400' },
    { name: 'Intercom & Video Porteros', icon: PhoneCall, color: 'text-emerald-600 dark:text-emerald-400' },
  ];

  return (
    <section id="hero" className="relative pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden bg-slate-50 dark:bg-slate-950 transition-colors duration-200">
      {/* Background Glows & Circuit Accents */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-brand-teal-500/10 dark:bg-brand-teal-500/10 blur-[130px] rounded-full pointer-events-none -z-10" />
      <div className="absolute top-1/3 right-10 w-[400px] h-[300px] bg-brand-green-500/10 dark:bg-brand-green-500/10 blur-[120px] rounded-full pointer-events-none -z-10" />

      {/* Grid Pattern */}
      <div 
        className="absolute inset-0 opacity-[0.03] dark:opacity-[0.03] pointer-events-none -z-10" 
        style={{ 
          backgroundImage: `radial-gradient(#00a896 1px, transparent 1px)`,
          backgroundSize: '32px 32px' 
        }} 
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-4xl mx-auto space-y-6">
          
          {/* Top Pill Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-teal-50 dark:bg-gradient-to-r dark:from-brand-teal-950/80 dark:to-brand-green-950/80 border border-brand-teal-200 dark:border-brand-teal-500/30 text-brand-teal-800 dark:text-brand-teal-300 text-xs sm:text-sm font-semibold shadow-sm">
            <Sparkles className="w-4 h-4 text-brand-green-600 dark:text-brand-green-400 animate-pulse" />
            <span>Seguridad Electrónica · Redes · Automatización Inteligente</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-slate-900 dark:text-white tracking-tight leading-[1.1]">
            Soluciones Tecnológicas con{' '}
            <span className="bg-gradient-to-r from-brand-teal-600 via-emerald-600 to-brand-green-600 dark:from-brand-teal-400 dark:via-emerald-400 dark:to-brand-green-400 bg-clip-text text-transparent">
              Calidad y Garantía
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg md:text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto font-normal leading-relaxed">
            Especialistas en instalación de <span className="text-slate-900 dark:text-white font-semibold">cámaras de seguridad</span>, <span className="text-slate-900 dark:text-white font-semibold">redes de datos</span>, <span className="text-slate-900 dark:text-white font-semibold">motores de portón</span>, <span className="text-slate-900 dark:text-white font-semibold">control de acceso</span> y <span className="text-slate-900 dark:text-white font-semibold">alarmas</span>.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <a
              href="#cotizador"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 text-base font-bold text-slate-950 bg-gradient-to-r from-brand-teal-400 to-brand-green-400 hover:from-brand-teal-300 hover:to-brand-green-300 rounded-xl shadow-lg shadow-brand-teal-500/20 hover:shadow-brand-teal-500/35 transition-all transform hover:-translate-y-0.5"
            >
              <Calculator className="w-5 h-5" />
              <span>Cotizador Rápido en Línea</span>
              <ArrowRight className="w-4 h-4" />
            </a>

            <a
              href="#servicios"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-4 text-base font-semibold text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-900/90 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-brand-teal-500/50 rounded-xl shadow-sm transition-all"
            >
              <span>Explorar Servicios</span>
            </a>
          </div>

          {/* Trust Value Points */}
          <div className="pt-6 flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-brand-green-600 dark:text-brand-green-400" />
              <span>1 Año de Garantía Escrita</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-brand-green-600 dark:text-brand-green-400" />
              <span>Levantamiento Técnico en Sitio</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-brand-green-600 dark:text-brand-green-400" />
              <span>Marcas Líderes Certificadas</span>
            </div>
          </div>
        </div>

        {/* Quick Grid of the 8 Services */}
        <div className="mt-16 pt-10 border-t border-slate-200 dark:border-slate-800/80">
          <p className="text-center text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-6">
            Nuestras Áreas de Especialidad Técnica
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
            {serviceBadges.map((service, index) => {
              const Icon = service.icon;
              return (
                <a
                  key={index}
                  href="#servicios"
                  className="group flex flex-col items-center text-center p-3.5 rounded-xl bg-white dark:bg-slate-900/60 hover:bg-slate-50 dark:hover:bg-slate-800/90 border border-slate-200/80 dark:border-slate-800 hover:border-brand-teal-500/40 shadow-sm transition-all duration-200 hover:-translate-y-1"
                >
                  <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800/80 group-hover:bg-slate-200 dark:group-hover:bg-slate-700/80 flex items-center justify-center mb-2.5 transition-colors shadow-inner">
                    <Icon className={`w-5 h-5 ${service.color}`} />
                  </div>
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 group-hover:text-slate-950 dark:group-hover:text-white leading-snug">
                    {service.name}
                  </span>
                </a>
              );
            })}
          </div>
        </div>

      </div>
    </section>
  );
};
