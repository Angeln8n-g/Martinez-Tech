import React, { useState } from 'react';
import { useAppState } from '../../context/AppStateContext';
import { ServiceItem } from '../../types';
import { IconRenderer } from '../ui/IconRenderer';
import { 
  Check, 
  ArrowRight, 
  Phone, 
  MessageCircle, 
  X, 
  ShieldCheck, 
  Sparkles,
  Calculator
} from 'lucide-react';
import { createWhatsAppUrl, formatCurrency } from '../../utils/formatters';

export const ServicesSection: React.FC = () => {
  const { services, companySettings } = useAppState();
  const [selectedService, setSelectedService] = useState<ServiceItem | null>(null);

  const handleQuoteService = (service: ServiceItem) => {
    const text = `¡Hola! Me interesa solicitar una cotización formal para el servicio de: *${service.title}*. ¿Podrían brindarme información y disponibilidad?`;
    window.open(createWhatsAppUrl(companySettings.whatsapp, text), '_blank');
  };

  return (
    <section id="servicios" className="py-24 bg-slate-100/90 dark:bg-slate-900/40 relative transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-brand-teal-100 dark:bg-brand-teal-500/10 border border-brand-teal-300 dark:border-brand-teal-500/20 text-brand-teal-800 dark:text-brand-teal-400 text-xs font-bold uppercase tracking-wider shadow-sm">
            Soluciones Integrales
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Nuestros Servicios & Instalaciones
          </h2>
          <p className="text-slate-700 dark:text-slate-400 text-base sm:text-lg font-medium">
            Instalaciones profesionales con los más altos estándares técnicos, equipos de marcas certificadas y soporte post-venta garantizado.
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((service) => (
            <div
              key={service.id}
              className="group relative flex flex-col justify-between rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-300 dark:border-slate-800 hover:border-brand-teal-500 p-6 transition-all duration-300 hover:-translate-y-1.5 shadow-md hover:shadow-xl dark:hover:shadow-brand-teal-950/30 overflow-hidden"
            >
              {/* Popular badge */}
              {service.popular && (
                <div className="absolute top-4 right-4 px-2.5 py-0.5 rounded-full bg-gradient-to-r from-brand-teal-500 to-brand-green-500 text-slate-950 text-[10px] font-extrabold uppercase tracking-wide shadow-sm">
                  Más Solicitado
                </div>
              )}

              <div>
                {/* Icon */}
                <div className="w-14 h-14 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700/80 group-hover:border-brand-teal-500 flex items-center justify-center mb-5 text-brand-teal-600 dark:text-brand-teal-400 group-hover:text-brand-green-600 group-hover:scale-105 transition-all shadow-inner">
                  <IconRenderer name={service.iconName} className="w-7 h-7" />
                </div>

                {/* Title */}
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2.5 group-hover:text-brand-teal-600 dark:group-hover:text-brand-teal-300 transition-colors">
                  {service.title}
                </h3>

                {/* Short Description */}
                <p className="text-sm text-slate-700 dark:text-slate-400 line-clamp-3 mb-4 leading-relaxed font-normal">
                  {service.shortDescription}
                </p>

                {/* Feature preview */}
                <ul className="space-y-2 mb-6">
                  {service.features.slice(0, 3).map((feat, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-xs text-slate-800 dark:text-slate-300 font-medium">
                      <Check className="w-3.5 h-3.5 text-brand-green-600 dark:text-brand-green-400 flex-shrink-0 mt-0.5" />
                      <span className="line-clamp-1">{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Action buttons */}
              <div className="pt-4 border-t-2 border-slate-200 dark:border-slate-800/80 flex items-center justify-between gap-2">
                <button
                  onClick={() => setSelectedService(service)}
                  className="text-xs font-bold text-brand-teal-700 dark:text-brand-teal-400 hover:text-brand-teal-800 dark:hover:text-brand-teal-300 flex items-center gap-1 py-1"
                >
                  <span>Ver detalles</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={() => handleQuoteService(service)}
                  className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-brand-teal-600/20 text-slate-900 dark:text-slate-200 hover:text-brand-teal-700 dark:hover:text-brand-teal-300 text-xs font-bold border border-slate-300 dark:border-slate-700 transition-colors shadow-sm"
                >
                  Cotizar
                </button>
              </div>

            </div>
          ))}
        </div>

      </div>

      {/* Service Detail Modal */}
      {selectedService && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-3xl max-w-2xl w-full p-6 sm:p-8 relative max-h-[90vh] overflow-y-auto shadow-2xl space-y-6">
            
            <button
              onClick={() => setSelectedService(null)}
              className="absolute top-5 right-5 p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-black dark:hover:text-white border border-slate-300 dark:border-slate-700"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-brand-teal-600 dark:text-brand-teal-400 flex items-center justify-center shadow-inner">
                <IconRenderer name={selectedService.iconName} className="w-8 h-8" />
              </div>
              <div>
                <span className="text-xs font-bold text-brand-teal-700 dark:text-brand-teal-400 uppercase tracking-widest">
                  Servicio Especializado
                </span>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white">
                  {selectedService.title}
                </h3>
              </div>
            </div>

            <p className="text-slate-700 dark:text-slate-300 text-sm sm:text-base leading-relaxed">
              {selectedService.fullDescription || selectedService.shortDescription}
            </p>

            {/* Features & Benefits */}
            <div className="space-y-3">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                ¿Qué incluye este servicio?
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {selectedService.features.map((feat, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs sm:text-sm text-slate-800 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-xl border border-slate-300 dark:border-slate-700/60">
                    <Check className="w-4 h-4 text-brand-green-600 flex-shrink-0 mt-0.5" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Warranty Callout */}
            <div className="p-4 rounded-2xl bg-brand-green-50 dark:bg-brand-green-950/40 border border-brand-green-300 dark:border-brand-green-500/30 flex items-center gap-3 text-xs sm:text-sm text-brand-green-900 dark:text-brand-green-300">
              <ShieldCheck className="w-6 h-6 flex-shrink-0 text-brand-green-600 dark:text-brand-green-400" />
              <div>
                <strong className="block font-bold">Garantía Certificada por Escrito</strong>
                <span>Todos los trabajos cuentan con garantía de instalación y soporte técnico directo en República Dominicana.</span>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t-2 border-slate-200 dark:border-slate-800">
              <div>
                <span className="text-[11px] text-slate-500 uppercase tracking-wider block">Cotización Gratuita</span>
                <span className="text-xs text-slate-700 dark:text-slate-300 font-semibold">Respuesta inmediata vía WhatsApp</span>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  onClick={() => setSelectedService(null)}
                  className="w-1/2 sm:w-auto px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 text-xs font-semibold border border-slate-300 dark:border-slate-700"
                >
                  Cerrar
                </button>
                <button
                  onClick={() => {
                    handleQuoteService(selectedService);
                    setSelectedService(null);
                  }}
                  className="w-1/2 sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Cotizar por WhatsApp</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </section>
  );
};
