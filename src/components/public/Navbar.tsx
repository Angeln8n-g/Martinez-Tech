import React, { useState, useEffect } from 'react';
import { BrandLogo } from '../ui/BrandLogo';
import { useAppState } from '../../context/AppStateContext';
import { 
  MessageCircle, 
  LayoutDashboard, 
  Menu, 
  X, 
  Sun, 
  Moon,
  Lock,
  ShieldCheck,
  Radio
} from 'lucide-react';
import { createWhatsAppUrl } from '../../utils/formatters';

export const Navbar: React.FC = () => {
  const { setCurrentView, companySettings, theme, toggleTheme, isAuthenticated, setIsLoginModalOpen } = useAppState();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Inicio', href: '#hero' },
    { name: 'Servicios', href: '#servicios' },
    { name: 'Cotizador en Línea', href: '#cotizador' },
    { name: 'Instalaciones', href: '#portafolio' },
    { name: 'Garantía & Valores', href: '#nosotros' },
    { name: 'Contacto', href: '#contacto' },
  ];

  const handleWhatsAppClick = () => {
    const text = `¡Hola NexaGate Security! Me gustaría solicitar información técnica y cotización de servicios.`;
    window.open(createWhatsAppUrl(companySettings.whatsapp, text), '_blank');
  };

  const handleCrmAccess = () => {
    if (isAuthenticated) {
      setCurrentView('admin');
    } else {
      setIsLoginModalOpen(true);
    }
  };

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled 
        ? 'bg-[#06080e]/95 backdrop-blur-xl border-b border-slate-800/90 shadow-2xl py-3' 
        : 'bg-gradient-to-b from-[#06080e]/95 via-[#06080e]/80 to-transparent py-4 sm:py-5'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        
        {/* Brand Logo */}
        <BrandLogo size="md" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} />

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              className="px-3.5 py-2 text-xs xl:text-sm font-semibold text-slate-300 hover:text-nexablue-300 hover:bg-slate-900/60 rounded-xl transition-all"
            >
              {link.name}
            </a>
          ))}
        </nav>

        {/* Desktop Action Buttons */}
        <div className="hidden sm:flex items-center gap-3">
          
          {/* Security Status Telemetry Badge */}
          <div className="hidden xl:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800 text-[11px] font-mono text-slate-300">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-slate-400 tracking-wider">ESTADO:</span>
            <span className="font-bold text-emerald-400">OPERATIVO 24/7</span>
          </div>

          {/* WhatsApp Direct Action */}
          <button
            onClick={handleWhatsAppClick}
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-bold text-emerald-300 bg-emerald-950/50 hover:bg-emerald-900/60 border border-emerald-500/30 rounded-xl transition-all shadow-sm active:scale-95"
          >
            <MessageCircle className="w-4 h-4 text-emerald-400" />
            <span>WhatsApp</span>
          </button>

          {/* CRM Command Portal Button */}
          <button
            onClick={handleCrmAccess}
            className="flex items-center gap-2 px-4 py-2 text-xs font-black text-white bg-gradient-to-r from-nexablue-600 via-nexablue-500 to-blue-600 hover:from-nexablue-500 hover:to-blue-500 border border-nexablue-400/30 rounded-xl shadow-lg shadow-nexablue-600/25 hover:shadow-nexablue-600/40 transition-all transform active:scale-95"
          >
            {isAuthenticated ? <LayoutDashboard className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
            <span className="tracking-wide">{isAuthenticated ? 'Consola CRM' : 'Acceso CRM'}</span>
          </button>
        </div>

        {/* Mobile Menu Button & Mobile Actions */}
        <div className="flex sm:hidden items-center gap-2">
          <button
            onClick={handleCrmAccess}
            className="px-3 py-1.5 text-nexablue-300 bg-slate-900 border border-nexablue-500/40 rounded-xl text-xs font-bold flex items-center gap-1.5"
          >
            {isAuthenticated ? <LayoutDashboard className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
            <span>CRM</span>
          </button>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-slate-300 hover:text-white bg-slate-900/90 border border-slate-800 rounded-xl"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown Drawer */}
      {mobileMenuOpen && (
        <div className="sm:hidden bg-[#0a0e18]/98 backdrop-blur-2xl border-b border-slate-800 px-5 pt-4 pb-6 space-y-3 mt-2 shadow-2xl animate-fadeIn">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2.5 rounded-xl text-sm font-semibold text-slate-200 hover:text-nexablue-400 hover:bg-slate-900/80 transition-colors"
            >
              {link.name}
            </a>
          ))}
          <div className="pt-4 border-t border-slate-800/80 flex flex-col gap-2.5">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                handleWhatsAppClick();
              }}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-bold bg-emerald-950/60 border border-emerald-500/30 text-emerald-300"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Contactar por WhatsApp</span>
            </button>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                handleCrmAccess();
              }}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-black bg-gradient-to-r from-nexablue-600 to-blue-600 text-white shadow-md"
            >
              {isAuthenticated ? <LayoutDashboard className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
              <span>{isAuthenticated ? 'Abrir Consola CRM' : 'Iniciar Sesión en CRM'}</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
