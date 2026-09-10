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
  Calculator,
  Cpu
} from 'lucide-react';
import { createWhatsAppUrl, formatCurrency } from '../../utils/formatters';

export const ServicesSection: React.FC = () => {
  const { services, companySettings } = useAppState();
  const [selectedService, setSelectedService] = useState<ServiceItem | null>(null);

  const handleQuoteService = (service: ServiceItem) => {
    const text = `¡Hola NexaGate Security! Me interesa cotizar formalmente el servicio de: *${service.title}*. ¿Podrían orientarme sobre especificaciones y levantamiento?`;
    window.open(createWhatsAppUrl(companySettings.whatsapp, text), '_blank');
  };

  return (
    <section id="servicios" className="py-20 sm:py-28 bg-[#06080e] relative transition-colors duration-200">
      
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-nexablue-600/5 blur-[160px] rounded-full pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header without banned eyebrow */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight">
            Servicios Técnicos & Sistemas Integrados
          </h2>
          <p className="text-slate-300 text-base sm:text-lg font-normal leading-relaxed">
            Suministro de equipos homologados, canalización estética de grado industrial, calibración de sensores y soporte técnico post-venta con 1 año de garantía certificada.
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((service) => (
            <div
              key={service.id}
              className="group relative flex flex-col justify-between rounded-3xl bg-[#0a0e18] border border-slate-800 hover:border-nexablue-500/60 p-6 sm:p-7 transition-all duration-300 hover:-translate-y-1.5 shadow-xl hover:shadow-glow-nexablue overflow-hidden"
            >
              {/* Popular badge */}
              {service.popular && (
                <div className="absolute top-4 right-4 px-3 py-1 rounded-lg bg-nexablue-600 text-white text-[10px] font-mono font-bold uppercase tracking-wider shadow-md">
                  ALTA DEMANDA
                </div>
              )}

              <div>
                {/* Icon in tactical container */}
                <div className="w-14 h-14 rounded-2xl bg-[#06080e] border border-slate-800 group-hover:border-nexablue-500/50 flex items-center justify-center mb-6 text-nexablue-400 group-hover:text-white group-hover:scale-105 transition-all shadow-inner">
                  <IconRenderer name={service.iconName} className="w-7 h-7" />
                </div>

                {/* Title */}
                <h3 className="text-lg sm:text-xl font-black text-white mb-3 group-hover:text-nexablue-300 transition-colors">
                  {service.title}
                </h3>

                {/* Short Description */}
                <p className="text-xs sm:text-sm text-slate-300 line-clamp-3 mb-5 leading-relaxed font-normal">
                  {service.shortDescription}
                </p>

                {/* Feature preview */}
                <ul className="space-y-2.5 mb-6">
                  {service.features.slice(0, 3).map((feat, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-300 font-medium">
                      <Check className="w-3.5 h-3.5 text-nexablue-400 flex-shrink-0 mt-0.5" />
                      <span className="line-clamp-1">{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Action buttons */}
              <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between gap-3">
                <button
                  onClick={() => setSelectedService(service)}
                  className="text-xs font-bold text-nexablue-400 hover:text-nexablue-300 flex items-center gap-1.5 py-1"
                >
                  <span>Ficha Técnica</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={() => handleQuoteService(service)}
                  className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-nexablue-950/60 text-white hover:text-nexablue-300 text-xs font-bold border border-slate-800 hover:border-nexablue-500/40 transition-colors shadow-sm"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
          <div className="bg-[#0a0e18] border border-slate-800 rounded-3xl max-w-2xl w-full p-6 sm:p-8 relative max-h-[90vh] overflow-y-auto shadow-2xl space-y-6">
            
            <button
              onClick={() => setSelectedService(null)}
              className="absolute top-5 right-5 p-2 rounded-xl bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-[#06080e] border border-slate-800 text-nexablue-400 flex items-center justify-center shadow-inner">
                <IconRenderer name={selectedService.iconName} className="w-8 h-8" />
              </div>
              <div>
                <span className="text-xs font-mono font-bold text-nexablue-400 uppercase tracking-widest">
                  ESPECIFICACIÓN TÉCNICA
                </span>
                <h3 className="text-2xl font-black text-white">
                  {selectedService.title}
                </h3>
              </div>
            </div>

            <p className="text-slate-300 text-sm leading-relaxed font-normal">
              {selectedService.fullDescription}
            </p>

            {/* Features List */}
            <div className="space-y-3">
              <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
                Protocolos & Entregables Incluidos
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {selectedService.features.map((feat, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-xs text-slate-200 bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                    <Check className="w-4 h-4 text-nexablue-400 flex-shrink-0" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Warranty Assurance Box */}
            <div className="p-4 rounded-2xl bg-[#06080e] border border-slate-800 flex items-center gap-3">
              <ShieldCheck className="w-6 h-6 text-nexablue-400 flex-shrink-0" />
              <div className="text-xs text-slate-300 leading-relaxed">
                <strong className="text-white font-bold block">1 Año de Garantía Certificada por Escrito:</strong>
                Cubre defectos de fábrica en equipos y calibración de instalación con soporte correctivo inmediato.
              </div>
            </div>

            {/* Modal Actions */}
            <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
              <button
                onClick={() => setSelectedService(null)}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-900 text-xs font-bold text-slate-300 hover:bg-slate-800 border border-slate-800"
              >
                Cerrar
              </button>

              <button
                onClick={() => {
                  handleQuoteService(selectedService);
                  setSelectedService(null);
                }}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Solicitar Presupuesto Formal por WhatsApp</span>
              </button>
            </div>

          </div>
        </div>
      )}

    </section>
  );
};
