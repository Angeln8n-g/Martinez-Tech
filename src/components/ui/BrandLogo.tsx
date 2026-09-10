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

  const sizeStyles: Record<'sm' | 'md' | 'lg' | 'xl', { icon: string; title: string; sub: string }> = {
    sm: { icon: 'w-9 h-9', title: 'text-base font-black', sub: 'text-[8.5px]' },
    md: { icon: 'w-11 h-11', title: 'text-lg font-black', sub: 'text-[10px]' },
    lg: { icon: 'w-14 h-14', title: 'text-2xl font-black tracking-wide', sub: 'text-xs tracking-wider' },
    xl: { icon: 'w-20 h-20', title: 'text-3xl font-black tracking-wider', sub: 'text-sm tracking-widest' }
  };

  return (
    <div 
      onClick={onClick}
      className={`flex items-center gap-3 select-none cursor-pointer group ${className}`}
    >
      {/* 3D Shield Badge with dual-tone glow */}
      <div className={`relative flex-shrink-0 rounded-2xl p-0.5 bg-gradient-to-br from-nexablue-500 via-slate-700 to-titanium-silver shadow-lg group-hover:shadow-glow-nexablue transition-all duration-300 group-hover:scale-105 ${sizeStyles[size].icon}`}>
        <div className="w-full h-full rounded-[14px] bg-[#06080e] overflow-hidden flex items-center justify-center">
          {!imgError ? (
            <img 
              src="/Logo1.jpeg" 
              alt="NexaGate Security Shield" 
              className="w-full h-full object-cover"
              onError={() => setImgError(true)}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-nexablue-950 to-obsidian text-nexablue-400 font-black text-xs">
              NG
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-col">
        <div className={`leading-tight uppercase tracking-tight flex items-center gap-1 ${sizeStyles[size].title}`}>
          <span className="text-nexablue-400 group-hover:text-nexablue-300 transition-colors">NEXA</span>
          <span className="text-titanium-silver group-hover:text-white transition-colors">GATE</span>
          <span className="text-[10px] font-bold tracking-widest text-nexablue-300/80 uppercase ml-1 px-1.5 py-0.5 rounded bg-nexablue-950/80 border border-nexablue-500/30">
            SECURITY
          </span>
        </div>
        {showSubtitle && (
          <div className={`text-slate-400 font-semibold tracking-wider uppercase mt-0.5 ${sizeStyles[size].sub}`}>
            Tecnología · Seguridad · Confianza
          </div>
        )}
      </div>
    </div>
  );
};
