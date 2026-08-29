import React, { useState, useEffect } from 'react';
import { BrandLogo } from '../ui/BrandLogo';
import { useAppState } from '../../context/AppStateContext';
import { 
  Phone, 
  MessageCircle, 
  LayoutDashboard, 
  Menu, 
  X, 
  Sun, 
  Moon,
  Lock
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
    { name: 'Cotizador Rápido', href: '#cotizador' },
    { name: 'Trabajos Realizados', href: '#portafolio' },
    { name: 'Nosotros', href: '#nosotros' },
    { name: 'Contacto', href: '#contacto' },
  ];

  const handleWhatsAppClick = () => {
    const text = `¡Hola! Me gustaría solicitar información y cotización de servicios con Martínez Tech.`;
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
        ? 'bg-white/90 dark:bg-slate-950/90 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80 shadow-md py-3' 
        : 'bg-gradient-to-b from-white/95 to-white/0 dark:from-slate-950/95 dark:to-slate-950/0 py-5'
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
              className="px-3.5 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-brand-teal-600 dark:hover:text-brand-teal-300 hover:bg-slate-100 dark:hover:bg-slate-800/50 rounded-lg transition-colors"
            >
              {link.name}
            </a>
          ))}
        </nav>

        {/* Desktop Action Buttons */}
        <div className="hidden sm:flex items-center gap-2.5">
          
          {/* Light / Dark Mode Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:text-brand-teal-500 transition-colors shadow-sm"
            title={theme === 'dark' ? 'Cambiar a Modo Claro' : 'Cambiar a Modo Oscuro'}
            aria-label="Toggle Theme"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
          </button>

          {/* WhatsApp Direct */}
          <button
            onClick={handleWhatsAppClick}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-500/30 rounded-xl hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition-colors shadow-sm"
          >
            <MessageCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>WhatsApp</span>
          </button>

          {/* CRM / Negociaciones Portal Button */}
          <button
            onClick={handleCrmAccess}
            className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-gradient-to-r from-brand-teal-600 to-brand-green-600 hover:from-brand-teal-500 hover:to-brand-green-500 rounded-xl shadow-md hover:shadow-lg transition-all transform active:scale-95"
          >
            {isAuthenticated ? <LayoutDashboard className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
            <span>{isAuthenticated ? 'Sistema CRM' : 'Acceso CRM'}</span>
          </button>
        </div>

        {/* Mobile Menu Button & Mobile Actions */}
        <div className="flex sm:hidden items-center gap-2">
          <button
            onClick={toggleTheme}
            className="p-2 text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
          </button>

          <button
            onClick={handleCrmAccess}
            className="p-2 text-brand-teal-600 dark:text-brand-teal-400 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-brand-teal-500/30 rounded-lg text-xs font-semibold flex items-center gap-1"
          >
            {isAuthenticated ? <LayoutDashboard className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
            <span>CRM</span>
          </button>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-slate-700 dark:text-slate-400 hover:text-black dark:hover:text-white bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown */}
      {mobileMenuOpen && (
        <div className="sm:hidden bg-white/98 dark:bg-slate-900/98 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 px-4 pt-3 pb-6 space-y-3 mt-2 shadow-2xl animate-fadeIn">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-md text-base font-medium text-slate-800 dark:text-slate-200 hover:text-brand-teal-600 dark:hover:text-brand-teal-400 hover:bg-slate-100 dark:hover:bg-slate-800/80"
            >
              {link.name}
            </a>
          ))}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-col gap-2">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                handleWhatsAppClick();
              }}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-semibold bg-emerald-100 dark:bg-emerald-900/50 border border-emerald-300 dark:border-emerald-500/30 text-emerald-800 dark:text-emerald-300"
            >
              <MessageCircle className="w-4 h-4" />
              Contactar por WhatsApp
            </button>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                handleCrmAccess();
              }}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-bold bg-gradient-to-r from-brand-teal-600 to-brand-green-600 text-white"
            >
              {isAuthenticated ? <LayoutDashboard className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
              {isAuthenticated ? 'Acceder al CRM' : 'Iniciar Sesión en CRM'}
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
