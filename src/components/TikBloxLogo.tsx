import React from 'react';

interface TikBloxLogoProps {
  theme?: 'light' | 'dark';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  showBadge?: boolean;
  className?: string;
  animate?: boolean;
}

export const TikBloxLogo: React.FC<TikBloxLogoProps> = ({
  size = 'md',
  showText = true,
  showBadge = true,
  className = '',
  animate = false,
  theme = 'dark',
}) => {
  // Configurações de dimensão por tamanho
  const sizeStyles = {
    sm: {
      iconBox: 'w-8 h-8 rounded-xl',
      bolt: 'w-4 h-4',
      title: 'text-base font-black',
      badge: 'text-[9px] px-1.5 py-0.5 rounded-md',
      sub: 'text-[8px] tracking-[0.18em]',
      gap: 'gap-2.5',
    },
    md: {
      iconBox: 'w-9 h-9 sm:w-10 sm:h-10 rounded-[14px]',
      bolt: 'w-5 h-5',
      title: 'text-lg sm:text-xl font-black',
      badge: 'text-[10px] px-2 py-0.5 rounded-md',
      sub: 'text-[8.5px] sm:text-[9px] tracking-[0.2em]',
      gap: 'gap-3',
    },
    lg: {
      iconBox: 'w-12 h-12 rounded-2xl',
      bolt: 'w-6 h-6',
      title: 'text-2xl font-black',
      badge: 'text-xs px-2.5 py-1 rounded-lg',
      sub: 'text-[10px] tracking-[0.22em]',
      gap: 'gap-3.5',
    },
    xl: {
      iconBox: 'w-16 h-16 rounded-3xl',
      bolt: 'w-8 h-8',
      title: 'text-3xl font-black',
      badge: 'text-sm px-3 py-1 rounded-xl',
      sub: 'text-xs tracking-[0.25em]',
      gap: 'gap-4',
    },
  }[size];

  // Componente de Ícone Símbolo Oficial (Squircle com Borda Degradê Ciano/Rosa Neon e Raio Âmbar/Laranja)
  const IconSymbol = (
    <div
      className={`relative ${sizeStyles.iconBox} p-[1.5px] bg-gradient-to-tr from-[#25F4EE] via-[#00D2C4] to-[#FE2C55] shadow-[0_0_18px_rgba(37,244,238,0.35)] shrink-0 flex items-center justify-center ${
        animate ? 'transition-transform duration-200 hover:scale-105' : ''
      }`}
    >
      <div className="w-full h-full bg-[#0B0F19] rounded-[inherit] flex items-center justify-center overflow-hidden">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={`${sizeStyles.bolt} shrink-0 drop-shadow-[0_0_8px_rgba(255,152,0,0.6)]`}
        >
          <defs>
            <linearGradient id={`boltGrad-${size}-${theme}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFD54F" />
              <stop offset="40%" stopColor="#FF9800" />
              <stop offset="100%" stopColor="#FF5722" />
            </linearGradient>
          </defs>
          <path
            d="M13 2.5L4.5 13.5H12L10.5 21.5L19.5 10H12.5L13 2.5Z"
            fill={`url(#boltGrad-${size}-${theme})`}
            stroke="#FFA000"
            strokeWidth="0.5"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </div>
  );

  // Se for apenas o ícone sem texto
  if (!showText) {
    return (
      <div className={`inline-flex items-center ${className}`}>
        {IconSymbol}
      </div>
    );
  }

  // Renderização Vetorial Nítida (Ultra-High Definition)
  return (
    <div className={`inline-flex items-center ${sizeStyles.gap} select-none ${className}`}>
      {IconSymbol}

      <div className="flex flex-col justify-center leading-none">
        <div className="flex items-center gap-2">
          <span
            className={`${sizeStyles.title} tracking-tight ${
              theme === 'light' ? 'text-slate-900' : 'text-white'
            }`}
          >
            TIKBLOX
          </span>

          {showBadge && (
            <span
              className={`bg-gradient-to-r from-[#FE2C55] via-[#FF004F] to-[#FE2C55] text-white font-black uppercase tracking-wider ${sizeStyles.badge} shadow-xs drop-shadow-[0_2px_6px_rgba(254,44,85,0.4)]`}
            >
              PRO
            </span>
          )}
        </div>

        <span
          className={`font-mono font-bold uppercase mt-1 ${sizeStyles.sub} ${
            theme === 'light' ? 'text-slate-500' : 'text-[#8B9BB4]'
          }`}
        >
          TIKTOK SHOP BRASIL RADAR
        </span>
      </div>
    </div>
  );
};
