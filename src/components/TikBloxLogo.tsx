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
      imgHeight: 'h-8 sm:h-9',
      iconBox: 'w-8 h-8 rounded-xl',
      bolt: 'w-4 h-4',
      title: 'text-base',
      badge: 'text-[9px] px-1.5 py-0.5',
      sub: 'text-[8px]',
    },
    md: {
      imgHeight: 'h-9 sm:h-10',
      iconBox: 'w-10 h-10 rounded-[14px]',
      bolt: 'w-5 h-5',
      title: 'text-xl',
      badge: 'text-[10px] px-2 py-0.5',
      sub: 'text-[9px]',
    },
    lg: {
      imgHeight: 'h-11 sm:h-12',
      iconBox: 'w-12 h-12 rounded-2xl',
      bolt: 'w-6 h-6',
      title: 'text-2xl',
      badge: 'text-xs px-2.5 py-1',
      sub: 'text-[10px]',
    },
    xl: {
      imgHeight: 'h-14 sm:h-16',
      iconBox: 'w-16 h-16 rounded-3xl',
      bolt: 'w-8 h-8',
      title: 'text-3xl',
      badge: 'text-sm px-3 py-1',
      sub: 'text-xs',
    },
  }[size];

  // Se o tema for escuro e showText estiver ativo, usamos a imagem oficial de alta fidelidade fornecida pelo usuário
  if (theme === 'dark' && showText) {
    return (
      <div className={`flex items-center select-none ${className} ${animate ? 'transition-transform duration-200 hover:scale-105' : ''}`}>
        <img
          src="/tikblox-logo.png"
          alt="TIKBLOX PRO - TikTok Shop Brasil Radar"
          className={`${sizeStyles.imgHeight} w-auto object-contain drop-shadow-[0_2px_12px_rgba(0,0,0,0.6)]`}
        />
      </div>
    );
  }

  // Se o tema for claro (ex: header branco do terminal), encapsulamos o logo oficial em um badge escuro ultra-clean
  if (theme === 'light' && showText) {
    return (
      <div className={`flex items-center select-none ${className}`}>
        <div className="bg-[#090D16] px-2.5 py-1 rounded-xl border border-slate-800/80 shadow-2xs flex items-center">
          <img
            src="/tikblox-logo.png"
            alt="TIKBLOX PRO - TikTok Shop Brasil Radar"
            className={`${sizeStyles.imgHeight} w-auto object-contain`}
          />
        </div>
      </div>
    );
  }

  // Componente de Ícone Símbolo Oficial (Squircle com Borda Degradê Ciano/Rosa e Raio Laranja)
  const IconSymbol = (
    <div
      className={`relative ${sizeStyles.iconBox} p-[1.5px] rounded-xl sm:rounded-2xl bg-gradient-to-tr from-[#25F4EE] via-[#00D2C4] to-[#FE2C55] shadow-[0_0_16px_rgba(37,244,238,0.3)] shrink-0 flex items-center justify-center`}
    >
      <div className="w-full h-full bg-[#0B0F19] rounded-[10px] sm:rounded-[13px] flex items-center justify-center overflow-hidden">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={`${sizeStyles.bolt} ${animate ? 'hover:scale-110 transition-transform' : ''}`}
        >
          <defs>
            <linearGradient id={`boltGrad-${size}-${theme}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFC107" />
              <stop offset="45%" stopColor="#FF9800" />
              <stop offset="100%" stopColor="#FF5722" />
            </linearGradient>
          </defs>
          <path
            d="M13 2L4 13.5H12L10.5 22L20 9.5H12.5L13 2Z"
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

  // Renderização Vetorial Light / Flexível
  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      {IconSymbol}

      <div className="flex flex-col justify-center leading-none">
        <div className="flex items-center gap-2">
          <span
            className={`font-black ${sizeStyles.title} tracking-tight ${
              theme === 'light' ? 'text-slate-900' : 'text-white'
            }`}
          >
            TIKBLOX
          </span>

          {showBadge && (
            <span
              className={`rounded-md bg-gradient-to-r from-[#FE2C55] to-[#FF004F] text-white font-black uppercase tracking-wide ${sizeStyles.badge} shadow-xs`}
            >
              PRO
            </span>
          )}
        </div>

        <span
          className={`font-mono font-bold uppercase tracking-[0.2em] mt-1 ${sizeStyles.sub} ${
            theme === 'light' ? 'text-slate-500' : 'text-[#8B9BB4]'
          }`}
        >
          TIKTOK SHOP BRASIL RADAR
        </span>
      </div>
    </div>
  );
};
