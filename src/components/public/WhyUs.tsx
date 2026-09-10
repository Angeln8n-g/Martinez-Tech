import React from 'react';
import { 
  Award, 
  Wrench, 
  FileCheck, 
  Headphones,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';

export const WhyUs: React.FC = () => {
  const pillars = [
    {
      icon: Award,
      title: 'Equipos Homologados de Fábrica',
      description: 'Trabajamos exclusivamente con fabricantes certificados de reconocimiento mundial como Hikvision, Dahua, ZKTeco, Ubiquiti y BFT.',
      accent: 'text-nexablue-400',
      badgeBg: 'bg-nexablue-950/80 border-nexablue-500/30'
    },
    {
      icon: Wrench,
      title: 'Ingeniería de Instalación Limpia',
      description: 'Canalizaciones rectas de grado comercial, peinado estético de racks, etiquetado normativo de cables y orden impecable en cada obra.',
      accent: 'text-slate-200',
      badgeBg: 'bg-slate-900 border-slate-700'
    },
    {
      icon: FileCheck,
      title: 'Garantía Escrita & Comprobantes Fiscales',
      description: 'Póliza formal de 1 año en equipos con soporte de reemplazo inmediato y emisión de comprobantes fiscales autorizados por DGII.',
      accent: 'text-amber-400',
      badgeBg: 'bg-amber-950/60 border-amber-500/30'
    },
    {
      icon: Headphones,
      title: 'Soporte Post-Venta & Asistencia',
      description: 'Capacitación presencial y remota en el uso de aplicaciones móviles, monitoreo y respuesta técnica ágil ante cualquier eventualidad.',
      accent: 'text-emerald-400',
      badgeBg: 'bg-emerald-950/60 border-emerald-500/30'
    },
  ];

  const stats = [
    { value: '+500', label: 'Sistemas Instalados', sub: 'Residencial y Comercial' },
    { value: '100%', label: 'Garantía Certificada', sub: 'Póliza de 1 Año por Escrito' },
    { value: '8+', label: 'Áreas de Especialidad', sub: 'CCTV, Redes, Portones y Accesos' },
    { value: '24/7', label: 'Respaldo Técnico', sub: 'Monitoreo y Asistencia Continua' },
  ];

  return (
    <section id="nosotros" className="py-20 sm:py-28 relative overflow-hidden bg-[#06080e] transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header without banned eyebrow */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight">
            Pilares de Seguridad y Confianza
          </h2>
          <p className="text-slate-300 text-base sm:text-lg font-normal leading-relaxed">
            Nos distinguimos por la rigurosidad técnica en campo, el cumplimiento puntual de cronogramas y un respaldo posventa respaldado por contrato y garantía formal.
          </p>
        </div>

        {/* Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {pillars.map((pillar, idx) => {
            const Icon = pillar.icon;
            return (
              <div 
                key={idx}
                className="p-7 rounded-3xl bg-[#0a0e18] border border-slate-800 hover:border-nexablue-500/50 transition-all duration-300 hover:-translate-y-1.5 space-y-5 shadow-xl hover:shadow-glow-nexablue"
              >
                <div className={`w-14 h-14 rounded-2xl ${pillar.badgeBg} border flex items-center justify-center ${pillar.accent} shadow-inner`}>
                  <Icon className="w-7 h-7" />
                </div>
                <h3 className="text-lg font-black text-white leading-snug">
                  {pillar.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
                  {pillar.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* HUD Telemetry Stats Matrix */}
        <div className="p-8 sm:p-10 rounded-3xl bg-[#0a0e18] border border-slate-800 shadow-2xl">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center divide-y lg:divide-y-0 lg:divide-x divide-slate-800">
            {stats.map((stat, idx) => (
              <div key={idx} className={`${idx > 0 ? 'pt-6 lg:pt-0 lg:px-6' : 'lg:pr-6'} space-y-2`}>
                <div className="text-3xl sm:text-4xl lg:text-5xl font-black font-mono tracking-tight text-nexablue-400">
                  {stat.value}
                </div>
                <div className="text-sm font-black text-white">
                  {stat.label}
                </div>
                <div className="text-[11px] font-mono text-slate-400">
                  {stat.sub}
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
};
