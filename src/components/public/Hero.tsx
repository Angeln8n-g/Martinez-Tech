import React from 'react';
import { 
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
  ShieldAlert,
  Shield,
  Zap
} from 'lucide-react';
import { useAppState } from '../../context/AppStateContext';

export const Hero: React.FC = () => {
  const { companySettings } = useAppState();

  const serviceBadges = [
    { name: 'Cámaras CCTV', icon: Camera, desc: 'ColorVu & PTZ 360°' },
    { name: 'Motores de Portón', icon: Car, desc: 'Corredizo y Batiente' },
    { name: 'Control de Acceso', icon: Fingerprint, desc: 'Biometría y RFID' },
    { name: 'Cerraduras Magnéticas', icon: Lock, desc: 'Electroimán 600-1200 lbs' },
    { name: 'Redes de Datos', icon: Network, desc: 'Cableado y Wi-Fi 6' },
    { name: 'Ponchadores', icon: Clock, desc: 'Asistencia y Nómina' },
    { name: 'Alarmas Perimétricas', icon: Bell, desc: 'Sensores y Sirena' },
    { name: 'Video Porteros', icon: PhoneCall, desc: 'Intercom IP App' },
  ];

  return (
    <section id="hero" className="relative pt-28 pb-20 md:pt-36 md:pb-28 overflow-hidden bg-[#06080e] transition-colors duration-200">
      
      {/* Background Cybernetic Glows: Electric Blue on left, Titanium Silver on right (matching the shield!) */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[450px] bg-nexablue-600/15 blur-[140px] rounded-full pointer-events-none -z-10" />
      <div className="absolute top-1/3 right-10 w-[500px] h-[380px] bg-slate-400/10 blur-[130px] rounded-full pointer-events-none -z-10" />
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-[750px] h-[220px] bg-nexablue-900/20 blur-[120px] rounded-full pointer-events-none -z-10" />

      {/* Cybernetic High-Tech Grid Pattern */}
      <div 
        className="absolute inset-0 opacity-[0.05] pointer-events-none -z-10" 
        style={{ 
          backgroundImage: `linear-gradient(to right, #0072ff 1px, transparent 1px), linear-gradient(to bottom, #0072ff 1px, transparent 1px)`,
          backgroundSize: '48px 48px' 
        }} 
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main Hero Grid: Left Content (7 cols), Right Shield Showcase (5 cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Text & CTA Block */}
          <div className="lg:col-span-7 space-y-6 text-left">
            
            {/* Main Headline (Clean, authoritative, no banned kicker) */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.08]">
              Seguridad Electrónica & Automatización Perimetral
            </h1>

            {/* Subtitle with product facts */}
            <p className="text-base sm:text-lg text-slate-300 max-w-2xl font-normal leading-relaxed">
              Instalación profesional de <strong className="text-white font-semibold">cámaras de vigilancia CCTV</strong>, <strong className="text-white font-semibold">motores para portones eléctricos</strong>, <strong className="text-white font-semibold">controles de acceso biométricos</strong> y <strong className="text-white font-semibold">redes de datos</strong>. Homologado con marcas líderes mundiales y 1 año de garantía escrita.
            </p>

            {/* Action CTAs */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
              <a
                href="#cotizador"
                className="inline-flex items-center justify-center gap-3 px-8 py-4 text-sm sm:text-base font-black text-white bg-gradient-to-r from-nexablue-600 via-nexablue-500 to-blue-600 hover:from-nexablue-500 hover:to-blue-500 rounded-2xl shadow-xl shadow-nexablue-600/30 hover:shadow-nexablue-600/45 transition-all transform hover:-translate-y-0.5 border border-nexablue-400/40 active:scale-95"
              >
                <Calculator className="w-5 h-5" />
                <span>Configurar Cotización en Línea</span>
                <ArrowRight className="w-4 h-4" />
              </a>

              <a
                href="#servicios"
                className="inline-flex items-center justify-center gap-2 px-7 py-4 text-sm sm:text-base font-bold text-slate-200 bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 hover:border-nexablue-500/50 rounded-2xl shadow-sm transition-all active:scale-95"
              >
                <span>Catálogo de Servicios</span>
              </a>
            </div>

            {/* Trust Anchors Bar */}
            <div className="pt-4 flex flex-wrap items-center gap-4 sm:gap-8 text-xs sm:text-sm text-slate-300">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-nexablue-400 flex-shrink-0" />
                <span>1 Año de Garantía Escrita</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-nexablue-400 flex-shrink-0" />
                <span>Levantamiento Técnico en Sitio</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-nexablue-400 flex-shrink-0" />
                <span>Marcas Homologadas (Hikvision, Dahua, ZKTeco)</span>
              </div>
            </div>

          </div>

          {/* Right Shield Showcase Card */}
          <div className="lg:col-span-5 relative flex justify-center">
            
            {/* Ambient Shield Halo */}
            <div className="absolute inset-0 -m-8 bg-gradient-to-tr from-nexablue-600/25 via-transparent to-slate-400/20 blur-3xl rounded-full pointer-events-none" />

            {/* Shield Stage Frame */}
            <div className="relative w-full max-w-md rounded-3xl p-1 bg-gradient-to-b from-slate-700 via-nexablue-900/60 to-slate-900 shadow-2xl border border-slate-700/60">
              
              <div className="rounded-[22px] bg-[#090d16] p-6 sm:p-8 space-y-6 overflow-hidden relative">
                
                {/* Status Bar */}
                <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                    <span className="text-xs font-mono font-bold text-slate-300 tracking-wider">PERÍMETRO ACTIVO</span>
                  </div>
                  <span className="text-[11px] font-mono text-nexablue-400 font-bold bg-nexablue-950/80 px-2.5 py-0.5 rounded border border-nexablue-500/30">
                    SISTEMA DE DEFENSA
                  </span>
                </div>

                {/* 3D Shield Badge Focal Visual */}
                <div className="relative flex justify-center py-2">
                  <div className="relative group w-56 h-56 sm:w-64 sm:h-64 rounded-3xl p-1 bg-gradient-to-tr from-nexablue-500 via-slate-500 to-slate-200 shadow-glow-shield transition-transform duration-500 group-hover:scale-105">
                    <div className="w-full h-full rounded-[22px] bg-[#06080e] overflow-hidden flex items-center justify-center relative">
                      <img 
                        src="/Logo1.jpeg" 
                        alt="NexaGate Security 3D Shield" 
                        className="w-full h-full object-cover"
                      />
                      {/* Sub-label over image */}
                      <div className="absolute bottom-2 inset-x-2 py-1 px-2 rounded-lg bg-black/75 backdrop-blur-md text-center border border-slate-700/60">
                        <span className="text-[10px] font-mono font-bold text-slate-200 tracking-widest uppercase">
                          CÁMARAS · PORTONES · ACCESOS
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Spec Telemetry Readout */}
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1">
                    <div className="text-[10px] font-mono text-slate-400">VIGILANCIA ÓPTICA</div>
                    <div className="text-xs font-bold text-white">Full HD / 4K ColorVu</div>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1">
                    <div className="text-[10px] font-mono text-slate-400">ACCESO & AUTOMATIZACIÓN</div>
                    <div className="text-xs font-bold text-white">Biometría + Wi-Fi</div>
                  </div>
                </div>

              </div>

            </div>

          </div>

        </div>

        {/* 8 Technical Core Areas Strip */}
        <div className="mt-16 pt-10 border-t border-slate-800/80">
          <div className="flex items-center justify-between mb-6 flex-wrap gap-2">
            <h2 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-widest">
              Áreas de Especialidad Técnica y Cobertura
            </h2>
            <span className="text-[11px] font-mono text-nexablue-400">
              8 Módulos de Protección
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
            {serviceBadges.map((service, index) => {
              const Icon = service.icon;
              return (
                <a
                  key={index}
                  href="#servicios"
                  className="group flex flex-col items-center text-center p-3.5 rounded-2xl bg-[#0a0e18] hover:bg-slate-900 border border-slate-800 hover:border-nexablue-500/50 shadow-md hover:shadow-glow-nexablue transition-all duration-200 hover:-translate-y-1"
                >
                  <div className="w-10 h-10 rounded-xl bg-slate-900/90 border border-slate-800 group-hover:border-nexablue-500/40 flex items-center justify-center mb-2.5 text-nexablue-400 group-hover:text-white transition-colors">
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-bold text-slate-200 group-hover:text-white leading-snug">
                    {service.name}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400 mt-1">
                    {service.desc}
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
