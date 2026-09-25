import React from 'react';

interface TikBloxLogoProps {
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
}) => {
  // Dimensions and scaling based on size
  const config = {
    sm: {
      box: 'h-9 w-9 rounded-xl',
      svg: 24,
      title: 'text-base',
      badge: 'text-[8px] px-1.5 py-0.5',
      sub: 'text-[8px]',
    },
    md: {
      box: 'h-11 w-11 rounded-[14px]',
      svg: 28,
      title: 'text-xl',
      badge: 'text-[9px] px-2 py-0.5',
      sub: 'text-[9px]',
    },
    lg: {
      box: 'h-14 w-14 rounded-2xl',
      svg: 36,
      title: 'text-2xl',
      badge: 'text-[10px] px-2.5 py-0.5',
      sub: 'text-[10px]',
    },
    xl: {
      box: 'h-18 w-18 rounded-3xl',
      svg: 48,
      title: 'text-3xl',
      badge: 'text-xs px-3 py-1',
      sub: 'text-xs',
    },
  }[size];

  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      {/* 3D Isometric Blox Emblem Container */}
      <div
        className={`relative flex items-center justify-center shrink-0 ${config.box} bg-gradient-to-br from-[#161824] via-[#0D0F16] to-[#030406] border border-white/15 shadow-[0_4px_24px_rgba(0,0,0,0.85)] group-hover:border-[#25F4EE]/60 group-hover:shadow-[0_0_30px_rgba(37,244,238,0.25)] transition-all duration-300 overflow-hidden`}
      >
        {/* Soft atmospheric chromatic glow */}
        <div className="absolute -top-3 -left-3 w-10 h-10 rounded-full bg-[#25F4EE]/25 blur-md pointer-events-none" />
        <div className="absolute -bottom-3 -right-3 w-10 h-10 rounded-full bg-[#FE2C55]/25 blur-md pointer-events-none" />

        {/* Diagonal metallic glass sheen */}
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/8 to-transparent pointer-events-none" />

        {/* 
          CLEAN 3D ISOMETRIC BLOX (QUADRADINHOS 3D)
          - No lightning bolt in the middle: clean, pure geometric 3D cubes
          - Apex Cube (Top): Gleaming Frost White with dual chromatic reflections
          - Left Cube: Electric Cyan (#25F4EE)
          - Right Cube: Neon Pink (#FE2C55)
          - Signature TikTok chromatic aberration offset
        */}
        <svg
          width={config.svg}
          height={config.svg}
          viewBox="0 0 60 60"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={`relative z-10 ${animate ? 'group-hover:scale-110' : ''} transition-transform duration-300 drop-shadow-[0_2px_10px_rgba(0,0,0,0.6)]`}
        >
          <defs>
            {/* Top Roof Apex Gradient */}
            <linearGradient id="topRoofGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="50%" stopColor="#F0FDFA" />
              <stop offset="100%" stopColor="#CCFBF1" />
            </linearGradient>

            {/* Left Cube Top Gradient */}
            <linearGradient id="leftRoofGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#E6FFFE" />
              <stop offset="100%" stopColor="#7EF7F3" />
            </linearGradient>

            {/* Right Cube Top Gradient */}
            <linearGradient id="rightRoofGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFF1F3" />
              <stop offset="100%" stopColor="#FFA4B6" />
            </linearGradient>

            {/* Cyan 3D Faces */}
            <linearGradient id="cyanLightFace" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#25F4EE" />
              <stop offset="100%" stopColor="#08B6BC" />
            </linearGradient>
            <linearGradient id="cyanDarkFace" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#038085" />
              <stop offset="100%" stopColor="#014A4E" />
            </linearGradient>

            {/* Pink 3D Faces */}
            <linearGradient id="pinkLightFace" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FF385C" />
              <stop offset="100%" stopColor="#FE2C55" />
            </linearGradient>
            <linearGradient id="pinkDarkFace" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#B30E30" />
              <stop offset="100%" stopColor="#66051A" />
            </linearGradient>
          </defs>

          {/* ============================================================== */}
          {/* LAYER 1: CHROMATIC OFFSET (CYAN #25F4EE, SHIFTED TOP-LEFT)      */}
          {/* ============================================================== */}
          <g transform="translate(-2, -1.5)" fill="#25F4EE" opacity="0.8">
            {/* Top Cube Silhouette */}
            <polygon points="30,6 41.5,12.5 41.5,25.5 30,32 18.5,25.5 18.5,12.5" />
            {/* Left Cube Silhouette */}
            <polygon points="18.5,25 29.5,31.2 29.5,43.7 18.5,50 7.5,43.7 7.5,31.2" />
            {/* Right Cube Silhouette */}
            <polygon points="41.5,25 52.5,31.2 52.5,43.7 41.5,50 30.5,43.7 30.5,31.2" />
          </g>

          {/* ============================================================== */}
          {/* LAYER 2: CHROMATIC OFFSET (PINK #FE2C55, SHIFTED BOTTOM-RIGHT) */}
          {/* ============================================================== */}
          <g transform="translate(2, 1.5)" fill="#FE2C55" opacity="0.8">
            {/* Top Cube Silhouette */}
            <polygon points="30,6 41.5,12.5 41.5,25.5 30,32 18.5,25.5 18.5,12.5" />
            {/* Left Cube Silhouette */}
            <polygon points="18.5,25 29.5,31.2 29.5,43.7 18.5,50 7.5,43.7 7.5,31.2" />
            {/* Right Cube Silhouette */}
            <polygon points="41.5,25 52.5,31.2 52.5,43.7 41.5,50 30.5,43.7 30.5,31.2" />
          </g>

          {/* ============================================================== */}
          {/* LAYER 3: CRISP 3D ISOMETRIC CUBES (CENTERED & BEAUTIFUL)       */}
          {/* ============================================================== */}
          <g transform="translate(0, 0)">

            {/* --- CUBE 1: TOP APEX BLOX --- */}
            {/* Top Face */}
            <polygon
              points="30,6 41.5,12.5 30,19 18.5,12.5"
              fill="url(#topRoofGrad)"
              stroke="#FFFFFF"
              strokeWidth="0.6"
            />
            {/* Left Face (Cyan illuminated) */}
            <polygon
              points="18.5,12.5 30,19 30,32 18.5,25.5"
              fill="url(#cyanLightFace)"
            />
            {/* Right Face (Pink illuminated) */}
            <polygon
              points="30,19 41.5,12.5 41.5,25.5 30,32"
              fill="url(#pinkLightFace)"
            />
            {/* Bevel highlight */}
            <line x1="30" y1="19" x2="30" y2="32" stroke="#FFFFFF" strokeWidth="0.6" opacity="0.7" />

            {/* --- CUBE 2: LEFT BLOX (ELECTRIC CYAN) --- */}
            {/* Top Face */}
            <polygon
              points="18.5,25 29.5,31.2 18.5,37.5 7.5,31.2"
              fill="url(#leftRoofGrad)"
              stroke="#FFFFFF"
              strokeWidth="0.5"
            />
            {/* Left Face (Vibrant Cyan) */}
            <polygon
              points="7.5,31.2 18.5,37.5 18.5,50 7.5,43.7"
              fill="url(#cyanLightFace)"
            />
            {/* Right Face (Shadowed Teal) */}
            <polygon
              points="18.5,37.5 29.5,31.2 29.5,43.7 18.5,50"
              fill="url(#cyanDarkFace)"
            />
            {/* Edge line */}
            <line x1="18.5" y1="37.5" x2="18.5" y2="50" stroke="#25F4EE" strokeWidth="0.5" opacity="0.8" />

            {/* --- CUBE 3: RIGHT BLOX (NEON PINK) --- */}
            {/* Top Face */}
            <polygon
              points="41.5,25 52.5,31.2 41.5,37.5 30.5,31.2"
              fill="url(#rightRoofGrad)"
              stroke="#FFFFFF"
              strokeWidth="0.5"
            />
            {/* Left Face (Shadowed Ruby) */}
            <polygon
              points="30.5,31.2 41.5,37.5 41.5,50 30.5,43.7"
              fill="url(#pinkDarkFace)"
            />
            {/* Right Face (Radiant Pink) */}
            <polygon
              points="41.5,37.5 52.5,31.2 52.5,43.7 41.5,50"
              fill="url(#pinkLightFace)"
            />
            {/* Edge line */}
            <line x1="41.5" y1="37.5" x2="41.5" y2="50" stroke="#FE2C55" strokeWidth="0.5" opacity="0.8" />

            {/* Clean Floating Mini-Blox / Gem in Bottom-Center gap (Adds high-end tech craft) */}
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

      {/* Brand Typography & Status Lockup */}
      {showText && (
        <div className="flex flex-col justify-center">
          <div className="flex items-center gap-2">
            
            {/* Custom Logotype: TIK in Architecturally Crisp White, BLOX with Vector Glitch & Neon Aura */}
            <div className="relative flex items-center font-black tracking-[-0.03em] leading-none select-none">
              
              {/* TIK: Pure White Display Letterforms */}
              <span className={`font-black text-white ${config.title} drop-shadow-[0_2px_12px_rgba(255,255,255,0.25)]`}>
                TIK
              </span>

              {/* BLOX: Real Layered Chromatic Glitch Vector Display */}
              <span className={`relative font-black ${config.title} ml-0.5`}>
                {/* Cyan Shift Layer (-1.8px, -1.2px) */}
                <span
                  aria-hidden="true"
                  className="absolute -left-[1.8px] -top-[1.2px] text-[#25F4EE] opacity-90 select-none pointer-events-none font-black"
                >
                  BLOX
                </span>

                {/* Pink Shift Layer (+1.8px, +1.2px) */}
                <span
                  aria-hidden="true"
                  className="absolute left-[1.8px] top-[1.2px] text-[#FE2C55] opacity-90 select-none pointer-events-none font-black"
                >
                  BLOX
                </span>

                {/* Foreground Crisp White Lettering */}
                <span className="relative z-10 text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
                  BLOX
                </span>
              </span>
            </div>

            {/* Futuristic Live Status Badge: RADAR BR */}
            {showBadge && (
              <div
                className={`flex items-center gap-1.5 rounded-full bg-[#12131A] border border-[#25F4EE]/35 ${config.badge} font-black uppercase tracking-wider text-white shadow-[0_0_12px_rgba(37,244,238,0.2)]`}
              >
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FE2C55] opacity-80" />
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#25F4EE]" />
                </span>
                <span className="font-extrabold text-[9px] tracking-wider text-white">
                  RADAR <span className="text-[#25F4EE]">BR</span>
                </span>
              </div>
            )}
          </div>

          {/* Elevated Brand Subtitle / Tagline */}
          <div className="hidden sm:flex items-center gap-1.5 mt-0.5">
            <span className={`${config.sub} font-black tracking-[0.2em] uppercase text-[#8B8D9E] group-hover:text-white transition-colors flex items-center gap-1.5`}>
              <span className="text-[#25F4EE]">SPY VIRAL</span>
              <span className="text-white/20 text-[7px]">•</span>
              <span className="text-[#C5C6D2]">ARBITRAGEM</span>
              <span className="text-white/20 text-[7px]">•</span>
              <span className="text-[#FE2C55]">DROPSHIPPING</span>
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
