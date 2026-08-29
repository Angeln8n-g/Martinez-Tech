import React from 'react';
import { Star } from 'lucide-react';

export const TestimonialsSection: React.FC = () => {
  const testimonials = [
    {
      author: 'Ing. Carlos Mendoza',
      role: 'Gerente de Operaciones',
      company: 'Centro Logístico del Caribe S.A.',
      text: 'El equipo de Martínez Tech realizó la instalación de 16 cámaras 4K y el peinado del rack en nuestro almacén. El nivel de detalle, la prolijidad del cableado y la calidad del soporte han sido excelentes.',
      rating: 5,
      type: 'Industrial / Corporativo'
    },
    {
      author: 'Lic. Patricia Guzmán',
      role: 'Presidenta de Junta',
      company: 'Residencial Las Palmas Real',
      text: 'Cambiamos el motor de nuestro portón corredizo y el control de acceso del condominio con ellos. La atención fue puntual, entregaron cotización formal detallada y los equipos funcionan de maravilla.',
      rating: 5,
      type: 'Condominio Residencial'
    },
    {
      author: 'Dr. Manuel Peña',
      role: 'Director Médico',
      company: 'Torre Médica Especializada',
      text: 'Instalaron las cerraduras magnéticas y los lectores faciales en nuestras salas quirúrgicas. Se adaptaron a nuestros horarios sin interrumpir las cirugías. Altamente recomendados.',
      rating: 5,
      type: 'Clínica & Consultorios'
    }
  ];

  return (
    <section className="py-20 bg-slate-100/70 dark:bg-slate-900/40 relative border-t-2 border-slate-200 dark:border-slate-800/80 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-brand-teal-100 dark:bg-brand-teal-500/10 border border-brand-teal-300 dark:border-brand-teal-500/20 text-brand-teal-800 dark:text-brand-teal-400 text-xs font-bold uppercase tracking-wider shadow-sm">
            Testimonios & Clientes
          </div>
          <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            La Opinión de Quienes Confían en Nosotros
          </h2>
          <p className="text-slate-700 dark:text-slate-400 text-sm font-medium">
            Empresas, administradores de condominios y familias respaldan la calidad de nuestros trabajos.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t, idx) => (
            <div
              key={idx}
              className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 flex flex-col justify-between space-y-4 hover:border-brand-teal-500 shadow-md hover:shadow-lg transition-all"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex text-amber-500">
                    {[...Array(t.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <span className="text-[11px] font-bold text-brand-teal-800 dark:text-brand-teal-400 bg-brand-teal-50 dark:bg-brand-teal-950/60 px-2 py-0.5 rounded border border-brand-teal-300 dark:border-brand-teal-500/20">
                    {t.type}
                  </span>
                </div>
                
                <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-300 italic leading-relaxed font-normal">
                  "{t.text}"
                </p>
              </div>

              <div className="pt-4 border-t-2 border-slate-200 dark:border-slate-800 flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 flex items-center justify-center font-black text-slate-900 dark:text-white text-xs shadow-sm">
                  {t.author.charAt(0)}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">{t.author}</h4>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 font-medium">{t.role} · {t.company}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
