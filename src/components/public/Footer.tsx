import React from 'react';
import { BrandLogo } from '../ui/BrandLogo';
import { useAppState } from '../../context/AppStateContext';
import { 
  Phone, 
  Mail, 
  MapPin, 
  MessageCircle, 
  LayoutDashboard, 
  ShieldCheck,
  ChevronRight,
  Instagram,
  Facebook,
  Linkedin,
  Youtube,
  Share2
} from 'lucide-react';
import { createWhatsAppUrl } from '../../utils/formatters';

export const Footer: React.FC = () => {
  const { companySettings, setCurrentView, services } = useAppState();

  const handleWhatsApp = () => {
    const text = `¡Hola NexaGate Security! Me comunico a través del sitio web para solicitar asistencia técnica.`;
    window.open(createWhatsAppUrl(companySettings.whatsapp, text), '_blank');
  };

  return (
    <footer className="bg-[#04060a] border-t border-slate-800 pt-16 pb-12 text-slate-400 text-xs transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 pb-12 border-b border-slate-800/80">
          
          {/* Col 1: Brand & Slogan (4 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <BrandLogo size="lg" />
            <p className="text-slate-400 text-xs sm:text-sm leading-relaxed pr-4 font-normal">
              Ingeniería e integración de sistemas de videovigilancia CCTV/IP, automatización de accesos vehiculares, controles biométricos de personal y cableado estructurado certificado.
            </p>
            <div className="text-[11px] font-mono text-nexablue-400 font-bold uppercase tracking-wider">
              Tecnología • Seguridad • Confianza
            </div>
            
            {/* Social Media Links Bar */}
            <div className="pt-2 space-y-2">
              <div className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                Canales de Contacto:
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                {companySettings.socialLinks?.instagram && (
                  <a
                    href={companySettings.socialLinks.instagram}
                    target="_blank"
                    rel="@martinez_.tech"
                    className="p-2.5 rounded-xl bg-[#0a0e18] border border-slate-800 text-pink-400 hover:border-pink-500/40 transition-all hover:scale-105 shadow-sm"
                    title="Instagram @martinez_.tech"
                  >
                    <Instagram className="w-4 h-4" />
                  </a>
                )}
                {companySettings.socialLinks?.facebook && (
                  <a
                    href={companySettings.socialLinks.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2.5 rounded-xl bg-[#0a0e18] border border-slate-800 text-blue-400 hover:border-blue-500/40 transition-all hover:scale-105 shadow-sm"
                    title="Facebook NexaGate Security"
                  >
                    <Facebook className="w-4 h-4" />
                  </a>
                )}
                {companySettings.socialLinks?.tiktok && (
                  <a
                    href={companySettings.socialLinks.tiktok}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2.5 rounded-xl bg-[#0a0e18] border border-slate-800 text-white hover:border-slate-500 transition-all hover:scale-105 shadow-sm flex items-center justify-center font-black text-xs"
                    title="TikTok @martineztech"
                  >
                    <span className="font-mono text-[10px]">TT</span>
                  </a>
                )}
                {companySettings.socialLinks?.linkedin && (
                  <a
                    href={companySettings.socialLinks.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2.5 rounded-xl bg-[#0a0e18] border border-slate-800 text-sky-400 hover:border-sky-500/40 transition-all hover:scale-105 shadow-sm"
                    title="LinkedIn"
                  >
                    <Linkedin className="w-4 h-4" />
                  </a>
                )}
                {companySettings.socialLinks?.youtube && (
                  <a
                    href={companySettings.socialLinks.youtube}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2.5 rounded-xl bg-[#0a0e18] border border-slate-800 text-red-400 hover:border-red-500/40 transition-all hover:scale-105 shadow-sm"
                    title="Canal de YouTube"
                  >
                    <Youtube className="w-4 h-4" />
                  </a>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={handleWhatsApp}
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-900 hover:border-emerald-400 transition-all shadow-sm font-bold text-xs"
              >
                <MessageCircle className="w-4 h-4 text-emerald-400" />
                <span>WhatsApp Soporte</span>
              </button>

              <button
                onClick={() => setCurrentView('admin')}
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#0a0e18] border border-slate-800 text-slate-300 hover:text-white hover:border-nexablue-500 hover:shadow-glow-nexablue transition-all font-bold text-xs"
              >
                <LayoutDashboard className="w-4 h-4 text-nexablue-400" />
                <span>Consola CRM</span>
              </button>
            </div>
          </div>

          {/* Col 2: Services Links (3 cols) */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              Áreas Operativas
            </h4>
            <div className="flex flex-col gap-1.5">
              {services.map((s) => (
                <a
                  key={s.id}
                  href="#servicios"
                  className="flex items-center gap-1.5 text-slate-400 hover:text-nexablue-400 transition-colors py-0.5 text-xs group"
                >
                  <ChevronRight className="w-3 h-3 text-nexablue-500 group-hover:translate-x-0.5 transition-transform" />
                  <span className="truncate">{s.title}</span>
                </a>
              ))}
            </div>
          </div>

          {/* Col 3: Contact & Legal (4 cols) */}
          <div className="lg:col-span-4 space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              Sede Central & Registro
            </h4>
            <div className="space-y-3">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                <span className="text-slate-300">{companySettings.address}, {companySettings.city}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-nexablue-400 flex-shrink-0" />
                <a href={`tel:${companySettings.phone}`} className="text-slate-300 hover:text-white font-bold">{companySettings.phone}</a>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-blue-400 flex-shrink-0" />
                <a href={`mailto:${companySettings.email}`} className="text-slate-300 hover:text-white">{companySettings.email}</a>
              </div>
              <div className="flex items-center gap-2.5 pt-1 text-slate-400">
                <ShieldCheck className="w-4 h-4 text-nexablue-400 flex-shrink-0" />
                <span>Razón Social: {companySettings.name} · RNC: {companySettings.rnc}</span>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-500 text-xs">
          <div>
            © {new Date().getFullYear()} NexaGate Security · Operado por {companySettings.name}. Todos los derechos reservados.
          </div>
          <div className="flex items-center gap-6">
            <a href="#hero" className="hover:text-slate-300 transition-colors">Inicio</a>
            <a href="#servicios" className="hover:text-slate-300 transition-colors">Sistemas</a>
            <a href="#cotizador" className="hover:text-slate-300 transition-colors">Cotizador</a>
            <a href="#portafolio" className="hover:text-slate-300 transition-colors">Casos</a>
            <a href="#contacto" className="hover:text-slate-300 transition-colors">Contacto</a>
          </div>
        </div>

      </div>
    </footer>
  );
};
