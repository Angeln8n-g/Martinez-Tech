import React from 'react';
import { Star, ShieldCheck, CheckCircle2 } from 'lucide-react';

export const TestimonialsSection: React.FC = () => {
  const testimonials = [
    {
      author: 'Ing. Carlos Mendoza',
      role: 'Gerente de Operaciones',
      company: 'Centro Logístico del Caribe S.A.',
      text: 'El equipo de NexaGate Security realizó la instalación de 16 cámaras 4K con analítica perimetral y el peinado completo del rack en nuestro almacén. El nivel de detalle, la prolijidad del cableado estructurado y la respuesta de su soporte técnico han sido impecables.',
      rating: 5,
      type: 'Industrial / Corporativo'
    },
    {
      author: 'Lic. Patricia Guzmán',
      role: 'Presidenta de Junta',
      company: 'Residencial Las Palmas Real',
      text: 'Reemplazamos la automatización del portón corredizo principal e instalamos control de acceso vehicular de alta velocidad. La puntualidad, la documentación técnica y el funcionamiento silencioso de los motores italianos superaron nuestras expectativas.',
      rating: 5,
      type: 'Condominio Residencial'
    },
    {
      author: 'Dr. Manuel Peña',
      role: 'Director Médico',
      company: 'Torre Médica Especializada',
      text: 'Instalaron cerraduras electromagnéticas de alto impacto y terminales biométricos en nuestras áreas quirúrgicas. Se adaptaron estrictamente a nuestros protocolos hospitalarios sin interrumpir las cirugías. Altamente recomendados.',
      rating: 5,
      type: 'Clínica & Consultorios'
    }
  ];

  return (
    <section className="py-24 bg-[#06080e] relative border-t border-slate-900 transition-colors">
      {/* Subtle ambient lighting */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_60%_40%_at_50%_0%,rgba(0,114,255,0.05),transparent)]" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header - No eyebrow per craft rules */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Validación de Clientes y Proyectos Operativos
          </h2>
          <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
            Empresas, administradores de torres residenciales y directores de operaciones certifican la confiabilidad y prolijidad de nuestros despliegues.
          </p>
          <div className="inline-flex items-center gap-2 pt-2 text-xs font-mono text-emerald-400">
            <CheckCircle2 className="w-4 h-4" />
            <span>ÍNDICE DE CONFORMIDAD TÉCNICA: 99.4% EN INSTALACIONES ACTIVAS</span>
          </div>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t, idx) => (
            <div
              key={idx}
              className="p-6 sm:p-7 rounded-2xl bg-[#0a0e18] border border-slate-800/90 flex flex-col justify-between space-y-6 hover:border-nexablue-500/50 hover:shadow-glow-nexablue transition-all group"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex text-amber-400 gap-0.5">
                    {[...Array(t.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <span className="text-[10px] font-mono font-bold text-nexablue-400 bg-nexablue-500/10 px-2.5 py-1 rounded border border-nexablue-500/20 uppercase tracking-wider">
                    {t.type}
                  </span>
                </div>
                
                <p className="text-sm text-slate-300 italic leading-relaxed font-normal">
                  "{t.text}"
                </p>
              </div>

              <div className="pt-5 border-t border-slate-800/80 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center font-black text-white text-xs shadow-inner">
                    {t.author.charAt(0)}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white group-hover:text-nexablue-300 transition-colors">
                      {t.author}
                    </h4>
                    <p className="text-[11px] text-slate-400">{t.role} · {t.company}</p>
                  </div>
                </div>
                <ShieldCheck className="w-4 h-4 text-slate-600 group-hover:text-nexablue-400 transition-colors flex-shrink-0" />
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
