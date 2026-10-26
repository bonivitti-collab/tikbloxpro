// src/components/TikBloxLogo.tsx
// Logotipo e Símbolo Oficial TIKBLOX: Cubos 3D Isométricos com Glitch Cromático TikTok

import React from 'react';

interface TikBloxLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  showBadge?: boolean;
  className?: string;
  animate?: boolean;
  theme?: 'light' | 'dark';
}

export const TikBloxLogo: React.FC<TikBloxLogoProps> = ({
  size = 'md',
  showText = true,
  showBadge = true,
  className = '',
  animate = false,
  theme = 'dark',
}) => {
  // Configurações dimensionais por escala
  const config = {
    sm: {
      box: 'h-9 w-9 rounded-xl',
      svg: 24,
      title: 'text-base',
      badge: 'text-[8.5px] px-1.5 py-0.5',
      sub: 'text-[7.5px]',
      gap: 'gap-2.5',
    },
    md: {
      box: 'h-11 w-11 rounded-[14px]',
      svg: 28,
      title: 'text-xl',
      badge: 'text-[9.5px] px-2 py-0.5',
      sub: 'text-[8.5px]',
      gap: 'gap-3',
    },
    lg: {
      box: 'h-14 w-14 rounded-2xl',
      svg: 36,
      title: 'text-2xl',
      badge: 'text-[11px] px-2.5 py-0.5',
      sub: 'text-[9.5px]',
      gap: 'gap-3.5',
    },
    xl: {
      box: 'h-18 w-18 rounded-3xl',
      svg: 48,
      title: 'text-3xl',
      badge: 'text-xs px-3 py-1',
      sub: 'text-xs',
      gap: 'gap-4',
    },
  }[size];

  // Símbolo Oficial: Cubos 3D Isométricos com Efeito Glitch Cromático TikTok (Sem raio)
  const Isometric3DBloxSymbol = (
    <div
      className={`relative flex items-center justify-center shrink-0 ${config.box} bg-gradient-to-br from-[#161824] via-[#0D0F16] to-[#030406] border border-white/15 shadow-[0_4px_24px_rgba(0,0,0,0.85)] ${
        animate ? 'hover:border-[#25F4EE]/60 hover:shadow-[0_0_24px_rgba(37,244,238,0.35)] transition-all duration-300' : ''
      } overflow-hidden`}
    >
      {/* Auras cromáticas atmosféricas suaves */}
      <div className="absolute -top-3 -left-3 w-10 h-10 rounded-full bg-[#25F4EE]/25 blur-md pointer-events-none" />
      <div className="absolute -bottom-3 -right-3 w-10 h-10 rounded-full bg-[#FE2C55]/25 blur-md pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/8 to-transparent pointer-events-none" />

      {/* SVG dos Cubos 3D Isométricos */}
      <svg
        width={config.svg}
        height={config.svg}
        viewBox="0 0 60 60"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`relative z-10 ${animate ? 'hover:scale-110' : ''} transition-transform duration-300 drop-shadow-[0_2px_10px_rgba(0,0,0,0.6)]`}
      >
        <defs>
          <linearGradient id={`topRoofGrad-${size}-${theme}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="50%" stopColor="#F0FDFA" />
            <stop offset="100%" stopColor="#CCFBF1" />
          </linearGradient>

          <linearGradient id={`leftRoofGrad-${size}-${theme}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#E6FFFE" />
            <stop offset="100%" stopColor="#7EF7F3" />
          </linearGradient>

          <linearGradient id={`rightRoofGrad-${size}-${theme}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFF1F3" />
            <stop offset="100%" stopColor="#FFA4B6" />
          </linearGradient>

          <linearGradient id={`cyanLightFace-${size}-${theme}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#25F4EE" />
            <stop offset="100%" stopColor="#08B6BC" />
          </linearGradient>
          <linearGradient id={`cyanDarkFace-${size}-${theme}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#038085" />
            <stop offset="100%" stopColor="#014A4E" />
          </linearGradient>

          <linearGradient id={`pinkLightFace-${size}-${theme}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FF385C" />
            <stop offset="100%" stopColor="#FE2C55" />
          </linearGradient>
          <linearGradient id={`pinkDarkFace-${size}-${theme}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#B30E30" />
            <stop offset="100%" stopColor="#66051A" />
          </linearGradient>
        </defs>

        {/* Camada 1: Offset Cromático Ciano (#25F4EE) */}
        <g transform="translate(-2, -1.5)" fill="#25F4EE" opacity="0.8">
          <polygon points="30,6 41.5,12.5 41.5,25.5 30,32 18.5,25.5 18.5,12.5" />
          <polygon points="18.5,25 29.5,31.2 29.5,43.7 18.5,50 7.5,43.7 7.5,31.2" />
          <polygon points="41.5,25 52.5,31.2 52.5,43.7 41.5,50 30.5,43.7 30.5,31.2" />
        </g>

        {/* Camada 2: Offset Cromático Rosa (#FE2C55) */}
        <g transform="translate(2, 1.5)" fill="#FE2C55" opacity="0.8">
          <polygon points="30,6 41.5,12.5 41.5,25.5 30,32 18.5,25.5 18.5,12.5" />
          <polygon points="18.5,25 29.5,31.2 29.5,43.7 18.5,50 7.5,43.7 7.5,31.2" />
          <polygon points="41.5,25 52.5,31.2 52.5,43.7 41.5,50 30.5,43.7 30.5,31.2" />
        </g>

        {/* Camada 3: Núcleo dos Cubos 3D Isométricos com Faces de Alta Precisão */}
        <g>
          {/* CUBO 1: ÁPICE (SUPERIOR) */}
          <polygon
            points="30,6 41.5,12.5 30,19 18.5,12.5"
            fill={`url(#topRoofGrad-${size}-${theme})`}
            stroke="#FFFFFF"
            strokeWidth="0.6"
          />
          <polygon
            points="18.5,12.5 30,19 30,32 18.5,25.5"
            fill={`url(#cyanLightFace-${size}-${theme})`}
          />
          <polygon
            points="30,19 41.5,12.5 41.5,25.5 30,32"
            fill={`url(#pinkLightFace-${size}-${theme})`}
          />
          <line x1="30" y1="19" x2="30" y2="32" stroke="#FFFFFF" strokeWidth="0.6" opacity="0.75" />

          {/* CUBO 2: ESQUERDO (CIANO ELÉTRICO) */}
          <polygon
            points="18.5,25 29.5,31.2 18.5,37.5 7.5,31.2"
            fill={`url(#leftRoofGrad-${size}-${theme})`}
            stroke="#FFFFFF"
            strokeWidth="0.5"
          />
          <polygon
            points="7.5,31.2 18.5,37.5 18.5,50 7.5,43.7"
            fill={`url(#cyanLightFace-${size}-${theme})`}
          />
          <polygon
            points="18.5,37.5 29.5,31.2 29.5,43.7 18.5,50"
            fill={`url(#cyanDarkFace-${size}-${theme})`}
          />
          <line x1="18.5" y1="37.5" x2="18.5" y2="50" stroke="#25F4EE" strokeWidth="0.5" opacity="0.8" />

          {/* CUBO 3: DIREITO (ROSA NEON) */}
          <polygon
            points="41.5,25 52.5,31.2 41.5,37.5 30.5,31.2"
            fill={`url(#rightRoofGrad-${size}-${theme})`}
            stroke="#FFFFFF"
            strokeWidth="0.5"
          />
          <polygon
            points="30.5,31.2 41.5,37.5 41.5,50 30.5,43.7"
            fill={`url(#pinkDarkFace-${size}-${theme})`}
          />
          <polygon
            points="41.5,37.5 52.5,31.2 52.5,43.7 41.5,50"
            fill={`url(#pinkLightFace-${size}-${theme})`}
          />
          <line x1="41.5" y1="37.5" x2="41.5" y2="50" stroke="#FE2C55" strokeWidth="0.5" opacity="0.8" />

          {/* Mini-Blox flutuante central para acabamento arquitetônico */}
          <g transform="translate(0, 0)">
            <polygon
              points="30,35.5 35,38.3 30,41.2 25,38.3"
              fill="#FFFFFF"
              stroke="#FFFFFF"
              strokeWidth="0.4"
            />
            <polygon
              points="25,38.3 30,41.2 30,46.5 25,43.6"
              fill="#25F4EE"
            />
            <polygon
              points="30,41.2 35,38.3 35,43.6 30,46.5"
              fill="#FE2C55"
            />
          </g>
        </g>
      </svg>
    </div>
  );

  // Se for apenas o ícone sem texto
  if (!showText) {
    return (
      <div className={`inline-flex items-center ${className}`}>
        {Isometric3DBloxSymbol}
      </div>
    );
  }

  // Renderização Completa: Símbolo 3D + Tipografia Cromática Oficial
  return (
    <div className={`inline-flex items-center ${config.gap} select-none ${className}`}>
      {Isometric3DBloxSymbol}

      <div className="flex flex-col justify-center leading-none">
        <div className="flex items-center gap-2">
          
          {/* Tipografia Customizada: TIK em branco puro, BLOX com Glitch Cromático */}
          <div className="relative flex items-center font-black tracking-[-0.03em] leading-none select-none">
            {/* TIK */}
            <span
              className={`font-black ${config.title} ${
                theme === 'light' ? 'text-slate-900' : 'text-white'
              } drop-shadow-[0_2px_12px_rgba(255,255,255,0.15)]`}
            >
              TIK
            </span>

            {/* BLOX com Camadas de Glitch Cromático */}
            <span className={`relative font-black ${config.title} ml-0.5`}>
              {/* Camada Ciano (-1.6px, -1.0px) */}
              <span
                aria-hidden="true"
                className="absolute -left-[1.6px] -top-[1.0px] text-[#25F4EE] opacity-90 select-none pointer-events-none font-black"
              >
                BLOX
              </span>

              {/* Camada Rosa (+1.6px, +1.0px) */}
              <span
                aria-hidden="true"
                className="absolute left-[1.6px] top-[1.0px] text-[#FE2C55] opacity-90 select-none pointer-events-none font-black"
              >
                BLOX
              </span>

              {/* Letras Principais */}
              <span
                className={`relative z-10 font-black ${
                  theme === 'light' ? 'text-slate-900' : 'text-white'
                }`}
              >
                BLOX
              </span>
            </span>
          </div>

          {/* Badge PRO / RADAR BR */}
          {showBadge && (
            <div
              className={`flex items-center gap-1.5 rounded-full bg-[#12131A] border border-[#25F4EE]/40 ${config.badge} font-black uppercase tracking-wider text-white shadow-[0_0_12px_rgba(37,244,238,0.25)]`}
            >
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FE2C55] opacity-80" />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#25F4EE]" />
              </span>
              <span className="font-extrabold tracking-wider text-white">
                PRO <span className="text-[#25F4EE]">BR</span>
              </span>
            </div>
          )}
        </div>

        {/* Subtítulo Oficial da Marca */}
        <div className="flex items-center gap-1 mt-0.5">
          <span
            className={`${config.sub} font-bold font-mono tracking-[0.2em] uppercase ${
              theme === 'light' ? 'text-slate-600' : 'text-[#8D90A2]'
            } flex items-center gap-1`}
          >
            <span className="text-[#25F4EE]">TIKTOK SHOP</span>
            <span className="text-slate-500 text-[6px]">•</span>
            <span className="text-[#FE2C55]">RADAR VIRAL</span>
          </span>
        </div>
      </div>
    </div>
  );
};
