import React, { useState, useEffect } from 'react';
import { Globe, Clock } from 'lucide-react';
import { useTranslation } from '../i18n/LanguageContext';

export const GlobalScanCountdown: React.FC = () => {
  const { t } = useTranslation();
  const [timeLeft, setTimeLeft] = useState<{ hours: number; minutes: number; seconds: number }>({ hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      // Get current time in BRT (UTC-3)
      const brtString = now.toLocaleString("en-US", { timeZone: "America/Sao_Paulo" });
      const brtTime = new Date(brtString);
      
      const midnightBRT = new Date(brtTime);
      midnightBRT.setHours(24, 0, 0, 0); // Next midnight

      const difference = midnightBRT.getTime() - brtTime.getTime();

      let hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
      let minutes = Math.floor((difference / 1000 / 60) % 60);
      let seconds = Math.floor((difference / 1000) % 60);

      setTimeLeft({ hours, minutes, seconds });
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (time: number) => time.toString().padStart(2, '0');

  return (
    <div 
      className="flex items-center gap-1.5 md:gap-2 rounded-xl bg-gradient-to-r from-[#1A1D27] to-[#242938] border border-white/10 px-2 py-1.5 md:px-3 shadow-inner whitespace-nowrap shrink-0 cursor-default"
      title="Tempo restante para a próxima Varredura Global (Meia-noite de Brasília)"
    >
      <div className="flex items-center gap-1 text-[#FE2C55]">
        <Globe className="w-3.5 h-3.5 animate-pulse" />
        <span className="text-[9px] md:text-[10px] font-bold uppercase tracking-wider hidden md:inline-block text-[#8E91A6]">
          Próxima Varredura:
        </span>
      </div>
      <div className="flex items-center gap-1 font-mono text-[11px] md:text-xs font-bold text-white">
        <Clock className="w-3 h-3 md:w-3.5 md:h-3.5 text-[#25F4EE]" />
        <span>
          {formatTime(timeLeft.hours)}:{formatTime(timeLeft.minutes)}:{formatTime(timeLeft.seconds)}
        </span>
      </div>
    </div>
  );
};
