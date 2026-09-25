import React from 'react';
import { WifiOff, Database, ChevronRight } from 'lucide-react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';

interface OfflineIndicatorProps {
  onOpenStorageModal?: () => void;
}

export const OfflineIndicator: React.FC<OfflineIndicatorProps> = ({ onOpenStorageModal }) => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div
      id="offline-banner"
      className="fixed bottom-4 left-4 z-50 flex flex-wrap items-center gap-2.5 rounded-xl bg-[#0C0E17]/95 backdrop-blur-xl px-4 py-2.5 text-xs text-white shadow-2xl border border-amber-500/50"
    >
      <div className="flex items-center gap-2 text-amber-400 font-bold">
        <WifiOff className="w-4 h-4 shrink-0 animate-pulse" />
        <span>Modo Offline</span>
      </div>

      <div className="hidden sm:flex items-center gap-1.5 text-slate-300">
        <span>•</span>
        <Database className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
        <span>Produtos salvos e histórico carregados do IndexedDB</span>
      </div>

      {onOpenStorageModal && (
        <button
          onClick={onOpenStorageModal}
          className="ml-auto inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white font-semibold text-[11px] transition cursor-pointer"
        >
          <span>Gerenciar Banco</span>
          <ChevronRight className="w-3 h-3 text-cyan-400" />
        </button>
      )}
    </div>
  );
};
