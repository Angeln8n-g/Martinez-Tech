import React, { useState } from 'react';

interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showSubtitle?: boolean;
  className?: string;
  onClick?: () => void;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({ 
  size = 'md', 
  showSubtitle = true, 
  className = '',
  onClick 
}) => {
  const [imgError, setImgError] = useState(false);

  const sizeStyles = {
    sm: { icon: 'w-8 h-8', title: 'text-base font-bold', sub: 'text-[9px]' },
    md: { icon: 'w-10 h-10', title: 'text-lg font-extrabold', sub: 'text-[10px]' },
    lg: { icon: 'w-14 h-14', title: 'text-2xl font-black tracking-wide', sub: 'text-xs tracking-wider' },
    xl: { icon: 'w-20 h-20', title: 'text-3xl font-black tracking-wider', sub: 'text-sm tracking-widest' }
  };

  return (
    <div 
      onClick={onClick}
      className={`flex items-center gap-3 select-none cursor-pointer group ${className}`}
    >
      <div className={`relative flex-shrink-0 rounded-full flex items-center justify-center overflow-hidden transition-transform group-hover:scale-105 ${sizeStyles[size].icon}`}>
        {!imgError ? (
          <img 
            src="/logo.png" 
            alt="Martínez Tech Logo" 
            className="w-full h-full object-cover rounded-full"
            onError={() => setImgError(true)}
          />
        ) : (
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <circle cx="50" cy="50" r="48" fill="#70c326" />
            <path d="M50 20 L25 50 L75 50 L50 80" stroke="#ffffff" strokeWidth="6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="25" cy="50" r="5" fill="#ffffff" />
            <circle cx="75" cy="50" r="5" fill="#ffffff" />
            <circle cx="50" cy="20" r="5" fill="#ffffff" />
            <circle cx="50" cy="80" r="5" fill="#ffffff" />
          </svg>
        )}
      </div>

      <div className="flex flex-col">
        <div className={`leading-none uppercase text-brand-teal-400 group-hover:text-brand-teal-300 transition-colors ${sizeStyles[size].title}`}>
          MARTÍNEZ <span className="text-brand-green-400">TECH</span>
        </div>
        {showSubtitle && (
          <div className={`text-slate-400 font-medium tracking-wider uppercase mt-1 ${sizeStyles[size].sub}`}>
            Soluciones · Servicios · Calidad
          </div>
        )}
      </div>
    </div>
  );
};
