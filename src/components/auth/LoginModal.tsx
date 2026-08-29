import React, { useState } from 'react';
import { useAppState } from '../../context/AppStateContext';
import { BrandLogo } from '../ui/BrandLogo';
import { 
  Lock, 
  Mail, 
  Key, 
  ArrowRight, 
  ShieldCheck, 
  UserCheck, 
  X, 
  Eye, 
  EyeOff,
  AlertCircle
} from 'lucide-react';

export const LoginModal: React.FC = () => {
  const { isLoginModalOpen, setIsLoginModalOpen, login } = useAppState();

  const [email, setEmail] = useState('admin@martineztech.com');
  const [password, setPassword] = useState('admin123');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isLoginModalOpen) return null;

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');

    const res = await login(email, password);
    setLoading(false);

    if (!res.success) {
      setErrorMessage(res.error || 'Credenciales inválidas');
    }
  };

  const handleQuickFill = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setErrorMessage('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-3xl max-w-md w-full p-7 sm:p-8 relative shadow-2xl space-y-6">
        
        {/* Close Button */}
        <button
          onClick={() => setIsLoginModalOpen(false)}
          className="absolute top-5 right-5 p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-black dark:hover:text-white border border-slate-300 dark:border-slate-700 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Logo */}
        <div className="text-center space-y-2">
          <div className="flex justify-center mb-2">
            <BrandLogo size="md" />
          </div>
          <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Acceso al Sistema CRM
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
            Ingresa con tus credenciales autorizadas de Martínez Tech.
          </p>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-300 dark:border-rose-500/40 text-xs text-rose-800 dark:text-rose-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleLoginSubmit} className="space-y-4">
          
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-800 dark:text-slate-300">
              Correo Electrónico
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                placeholder="ejemplo@martineztech.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white placeholder-slate-500 focus:outline-none focus:border-brand-teal-500 shadow-sm"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-800 dark:text-slate-300">
              Contraseña
            </label>
            <div className="relative">
              <Key className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white placeholder-slate-500 focus:outline-none focus:border-brand-teal-500 shadow-sm"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-brand-teal-500 to-brand-green-500 hover:from-brand-teal-400 hover:to-brand-green-400 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all border border-brand-teal-600/30"
          >
            {loading ? (
              <span>Iniciando sesión...</span>
            ) : (
              <>
                <Lock className="w-4 h-4" />
                <span>Ingresar al Panel de Control</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

        </form>

        {/* Demo Fast Logins Strip */}
        <div className="pt-4 border-t-2 border-slate-200 dark:border-slate-800 space-y-2">
          <div className="text-[11px] font-bold text-slate-600 dark:text-slate-400 text-center uppercase tracking-wider">
            Acceso Rápido de Prueba (Demo)
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleQuickFill('admin@martineztech.com', 'admin123')}
              className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 hover:bg-brand-teal-50 dark:hover:bg-brand-teal-950/60 border border-slate-300 dark:border-slate-700 text-left transition-colors shadow-sm"
            >
              <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-brand-teal-700 dark:text-brand-teal-400" />
                <span>Administrador</span>
              </div>
              <div className="text-[10px] text-slate-600 dark:text-slate-400 truncate">admin@martineztech.com</div>
            </button>

            <button
              type="button"
              onClick={() => handleQuickFill('tecnico@martineztech.com', 'tecnico123')}
              className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 hover:bg-brand-green-50 dark:hover:bg-brand-green-950/60 border border-slate-300 dark:border-slate-700 text-left transition-colors shadow-sm"
            >
              <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <UserCheck className="w-3.5 h-3.5 text-brand-green-700 dark:text-brand-green-400" />
                <span>Técnico Campo</span>
              </div>
              <div className="text-[10px] text-slate-600 dark:text-slate-400 truncate">tecnico@martineztech.com</div>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
