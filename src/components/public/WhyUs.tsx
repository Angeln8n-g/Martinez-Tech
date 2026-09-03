import React from 'react';
import { 
  Award, 
  Wrench, 
  FileCheck, 
  Headphones 
} from 'lucide-react';

export const WhyUs: React.FC = () => {
  const pillars = [
    {
      icon: Award,
      title: 'Equipos 100% Originales y Certificados',
      description: 'Trabajamos únicamente con fabricantes de prestigio mundial como Hikvision, Dahua, ZKTeco, Ubiquiti y BFT.',
      color: 'text-brand-green-700 dark:text-brand-green-400',
      bgColor: 'bg-brand-green-50 dark:bg-brand-green-500/10',
      borderColor: 'border-brand-green-300 dark:border-brand-green-500/30'
    },
    {
      icon: Wrench,
      title: 'Instalaciones Estéticas y Limpias',
      description: 'Cuidamos cada detalle: canalizaciones rectas, peinado de racks profesional, etiquetado de cables y orden impecable.',
      color: 'text-brand-teal-700 dark:text-brand-teal-400',
      bgColor: 'bg-brand-teal-50 dark:bg-brand-teal-500/10',
      borderColor: 'border-brand-teal-300 dark:border-brand-teal-500/30'
    },
    {
      icon: FileCheck,
      title: 'Garantía Escrita y Comprobantes Fiscales',
      description: 'Todos nuestros trabajos incluyen garantía por escrito de 1 año en equipos y soporte técnico ante cualquier eventualidad.',
      color: 'text-amber-700 dark:text-amber-400',
      bgColor: 'bg-amber-50 dark:bg-amber-500/10',
      borderColor: 'border-amber-300 dark:border-amber-500/30'
    },
    {
      icon: Headphones,
      title: 'Soporte y Asistencia Post-Venta',
      description: 'No te dejamos solo después de instalar. Te capacitamos en el uso de las aplicaciones y te asistimos cuando lo requieras.',
      color: 'text-cyan-700 dark:text-cyan-400',
      bgColor: 'bg-cyan-50 dark:bg-cyan-500/10',
      borderColor: 'border-cyan-300 dark:border-cyan-500/30'
    },
  ];

  const stats = [
    { value: '+500', label: 'Instalaciones Realizadas' },
    { value: '100%', label: 'Garantía en Equipos' },
    { value: '8+', label: 'Áreas Técnicas Especializadas' },
    { value: '24/7', label: 'Monitoreo y Conectividad' },
  ];

  return (
    <section id="nosotros" className="py-24 relative overflow-hidden bg-slate-100/60 dark:bg-slate-950 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-brand-green-100 dark:bg-brand-green-500/10 border border-brand-green-300 dark:border-brand-green-500/20 text-brand-green-800 dark:text-brand-green-400 text-xs font-bold uppercase tracking-wider shadow-sm">
            Compromiso con la Excelencia
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
            ¿Por Qué Confiar en Martínez Tech?
          </h2>
          <p className="text-slate-700 dark:text-slate-400 text-sm sm:text-base font-medium">
            Nos distinguimos por nuestra puntualidad, seriedad en el cumplimiento de los tiempos acordados y la calidad insuperable de cada instalación.
          </p>
        </div>

        {/* Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {pillars.map((pillar, idx) => {
            const Icon = pillar.icon;
            return (
              <div 
                key={idx}
                className="p-6 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-300 dark:border-slate-800 hover:border-brand-teal-500 transition-all duration-300 hover:-translate-y-1 space-y-4 shadow-md hover:shadow-lg"
              >
                <div className={`w-12 h-12 rounded-xl ${pillar.bgColor} border ${pillar.borderColor} flex items-center justify-center ${pillar.color} shadow-sm`}>
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white leading-snug">
                  {pillar.title}
                </h3>
                <p className="text-xs text-slate-700 dark:text-slate-400 leading-relaxed font-normal">
                  {pillar.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* Stats Strip */}
        <div className="p-8 rounded-2xl bg-white dark:bg-gradient-to-r dark:from-brand-teal-950/60 dark:via-slate-900 dark:to-brand-green-950/60 border border-slate-300 dark:border-slate-800 shadow-md">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center divide-y lg:divide-y-0 lg:divide-x divide-slate-300 dark:divide-slate-800">
            {stats.map((stat, idx) => (
              <div key={idx} className={`${idx > 0 ? 'pt-4 lg:pt-0' : ''} space-y-1`}>
                <div className="text-3xl sm:text-4xl font-black font-mono tracking-tight text-brand-teal-700 dark:text-brand-teal-400">
                  {stat.value}
                </div>
                <div className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
};
