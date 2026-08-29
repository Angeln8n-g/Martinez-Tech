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
    const text = `¡Hola! Me comunico a través del sitio web de Martínez Tech.`;
    window.open(createWhatsAppUrl(companySettings.whatsapp, text), '_blank');
  };

  return (
    <footer className="bg-slate-100 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800/80 pt-16 pb-12 text-slate-600 dark:text-slate-400 text-xs transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 pb-12 border-b border-slate-200 dark:border-slate-900">
          
          {/* Col 1: Brand & Slogan (4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            <BrandLogo size="lg" />
            <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm leading-relaxed pr-4">
              Especialistas en soluciones integrales de seguridad electrónica, redes de datos de alta velocidad, automatización y control de accesos. Calidad, garantía y soporte técnico profesional.
            </p>
            
            {/* Social Media Links Bar */}
            <div className="pt-1 space-y-2">
              <div className="text-[11px] font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                Conéctate con nosotros:
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                {companySettings.socialLinks?.instagram && (
                  <a
                    href={companySettings.socialLinks.instagram}
                    target="_blank"
                    rel="@martinez_.tech"
                    className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-pink-600 hover:bg-pink-50 dark:hover:bg-pink-950/40 hover:border-pink-300 transition-all hover:scale-110 shadow-sm"
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
                    className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40 hover:border-blue-300 transition-all hover:scale-110 shadow-sm"
                    title="Facebook Martínez Tech"
                  >
                    <Facebook className="w-4 h-4" />
                  </a>
                )}
                {companySettings.socialLinks?.tiktok && (
                  <a
                    href={companySettings.socialLinks.tiktok}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white hover:bg-slate-200 dark:hover:bg-slate-800 hover:border-slate-400 transition-all hover:scale-110 shadow-sm flex items-center justify-center font-black text-xs"
                    title="TikTok @martineztech"
                  >
                    <span className="font-mono text-[11px]">TT</span>
                  </a>
                )}
                {companySettings.socialLinks?.linkedin && (
                  <a
                    href={companySettings.socialLinks.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sky-600 hover:bg-sky-50 dark:hover:bg-sky-950/40 hover:border-sky-300 transition-all hover:scale-110 shadow-sm"
                    title="LinkedIn Martínez Tech"
                  >
                    <Linkedin className="w-4 h-4" />
                  </a>
                )}
                {companySettings.socialLinks?.youtube && (
                  <a
                    href={companySettings.socialLinks.youtube}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 hover:border-red-300 transition-all hover:scale-110 shadow-sm"
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
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-500/30 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-200 dark:hover:bg-emerald-900 transition-colors"
              >
                <MessageCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>WhatsApp Soporte</span>
              </button>

              <button
                onClick={() => setCurrentView('admin')}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:text-black dark:hover:text-white hover:border-brand-teal-500/40 transition-colors"
              >
                <LayoutDashboard className="w-4 h-4 text-brand-teal-600 dark:text-brand-teal-400" />
                <span>Panel CRM</span>
              </button>
            </div>
          </div>

          {/* Col 2: Services Links (4 cols) */}
          <div className="lg:col-span-4 space-y-3">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Nuestros Servicios
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {services.map((s) => (
                <a
                  key={s.id}
                  href="#servicios"
                  className="flex items-center gap-1.5 hover:text-brand-teal-600 dark:hover:text-brand-teal-300 transition-colors py-0.5"
                >
                  <ChevronRight className="w-3 h-3 text-brand-green-600 dark:text-brand-green-500" />
                  <span className="truncate">{s.title}</span>
                </a>
              ))}
            </div>
          </div>

          {/* Col 3: Contact & Legal (4 cols) */}
          <div className="lg:col-span-4 space-y-3">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Contacto y Localización
            </h4>
            <div className="space-y-2.5">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-brand-green-600 dark:text-brand-green-400 flex-shrink-0 mt-0.5" />
                <span>{companySettings.address}, {companySettings.city}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-brand-teal-600 dark:text-brand-teal-400 flex-shrink-0" />
                <a href={`tel:${companySettings.phone}`} className="hover:text-slate-900 dark:hover:text-white">{companySettings.phone}</a>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                <a href={`mailto:${companySettings.email}`} className="hover:text-slate-900 dark:hover:text-white">{companySettings.email}</a>
              </div>
              <div className="flex items-center gap-2.5 pt-1 text-slate-600 dark:text-slate-400">
                <ShieldCheck className="w-4 h-4 text-brand-green-600 dark:text-brand-green-400 flex-shrink-0" />
                <span>RNC: {companySettings.rnc}</span>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-500 text-xs">
          <div>
            © {new Date().getFullYear()} {companySettings.name} - Soluciones · Servicios · Calidad. Todos los derechos reservados.
          </div>
          <div className="flex items-center gap-4">
            <a href="#hero" className="hover:text-slate-800 dark:hover:text-slate-300">Inicio</a>
            <a href="#servicios" className="hover:text-slate-800 dark:hover:text-slate-300">Servicios</a>
            <a href="#cotizador" className="hover:text-slate-800 dark:hover:text-slate-300">Cotizador</a>
            <a href="#portafolio" className="hover:text-slate-800 dark:hover:text-slate-300">Trabajos</a>
          </div>
        </div>

      </div>
    </footer>
  );
};
