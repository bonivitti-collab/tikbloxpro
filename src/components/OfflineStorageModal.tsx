import React, { useState, useEffect } from 'react';
import {
  Database,
  X,
  HardDrive,
  Bookmark,
  TrendingUp,
  History,
  CheckCircle2,
  RefreshCw,
  Trash2,
  Wifi,
  WifiOff,
  Sparkles,
  Layers,
  ArrowRight,
} from 'lucide-react';
import {
  getIndexedDBStats,
  getScanHistoryFromIndexedDB,
  clearTrendCacheFromIndexedDB,
  cacheTrendProductsToIndexedDB,
  getAllSavedProductsFromIndexedDB,
  cleanupOldCachedProductsFromIndexedDB,
  getStaleCacheEstimate,
  ScanHistoryRecord,
  DatabaseStats,
  DEFAULT_CACHE_MAX_AGE_DAYS,
} from '../services/indexedDbService';
import { TrendingProduct } from '../types';
import { useOnlineStatus } from '../hooks/useOnlineStatus';

interface OfflineStorageModalProps {
  isOpen: boolean;
  onClose: () => void;
  allProducts: TrendingProduct[];
  onOpenSavedTab: () => void;
}

export const OfflineStorageModal: React.FC<OfflineStorageModalProps> = ({
  isOpen,
  onClose,
  allProducts,
  onOpenSavedTab,
}) => {
  const isOnline = useOnlineStatus();
  const [stats, setStats] = useState<DatabaseStats | null>(null);
  const [scanHistory, setScanHistory] = useState<ScanHistoryRecord[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isCleaning, setIsCleaning] = useState(false);
  const [staleCount, setStaleCount] = useState<number>(0);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);

  const loadData = async () => {
    try {
      const s = await getIndexedDBStats();
      setStats(s);
      const history = await getScanHistoryFromIndexedDB(10);
      setScanHistory(history);
      const stale = await getStaleCacheEstimate(DEFAULT_CACHE_MAX_AGE_DAYS);
      setStaleCount(stale.staleCount);
    } catch (e) {
      console.warn('Error loading IndexedDB stats:', e);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCleanupOldProducts = async () => {
    setIsCleaning(true);
    setSyncMessage(null);
    try {
      const res = await cleanupOldCachedProductsFromIndexedDB(DEFAULT_CACHE_MAX_AGE_DAYS);
      await loadData();
      if (res.removedCount > 0) {
        setSyncMessage(`Limpeza concluída: ${res.removedCount} produtos (>30 dias) removidos do cache com sucesso!`);
      } else {
        setSyncMessage(`O cache já está otimizado! Nenhum produto com mais de 30 dias encontrado.`);
      }
      setTimeout(() => setSyncMessage(null), 4000);
    } catch {
      setSyncMessage('Erro ao executar limpeza de produtos antigos.');
    } finally {
      setIsCleaning(false);
    }
  };

  const handleForceSync = async () => {
    setIsSyncing(true);
    setSyncMessage(null);
    try {
      if (allProducts.length > 0) {
        await cacheTrendProductsToIndexedDB(allProducts, 'curated');
      }
      await loadData();
      setSyncMessage('Sincronização concluída com sucesso!');
      setTimeout(() => setSyncMessage(null), 3000);
    } catch {
      setSyncMessage('Erro ao sincronizar.');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleClearCache = async () => {
    if (window.confirm('Deseja limpar o histórico temporário de tendências? Seus produtos salvos no Radar Pessoal serão preservados.')) {
      await clearTrendCacheFromIndexedDB();
      await loadData();
      setSyncMessage('Cache temporário limpo com sucesso.');
      setTimeout(() => setSyncMessage(null), 3000);
    }
  };

  const formatLastSync = (timestamp: number | null) => {
    if (!timestamp) return 'Recente';
    return new Intl.DateTimeFormat('pt-BR', {
      dateStyle: 'short',
      timeStyle: 'medium',
    }).format(new Date(timestamp));
  };

  return (
    <div
      id="offline-storage-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-white/15 bg-[#0C0E17] p-5 sm:p-6 shadow-2xl text-white"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black tracking-tight text-white">
                  Banco de Dados Local (IndexedDB)
                </h3>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  <CheckCircle2 className="w-3 h-3" />
                  Pronto Offline
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  <Sparkles className="w-3 h-3 text-purple-400" />
                  Retenção 30d Ativa
                </span>
              </div>
              <p className="text-xs text-[#A6A7B2]">
                Armazenamento persistente no dispositivo com capacidade ilimitada para mineração offline
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl border border-white/10 bg-[#161823] text-[#A6A7B2] hover:text-white hover:border-white/25 transition cursor-pointer"
            title="Fechar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Network & Persistence Status Card */}
        <div className="mt-4 p-3.5 rounded-xl border border-white/10 bg-[#121422] flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            {isOnline ? (
              <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                <Wifi className="w-4 h-4" />
              </div>
            ) : (
              <div className="p-2 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30">
                <WifiOff className="w-4 h-4" />
              </div>
            )}
            <div>
              <div className="text-xs font-bold text-white flex items-center gap-1.5">
                <span>{isOnline ? 'Conexão Online Ativa' : 'Modo 100% Offline Ativo'}</span>
                <span className="text-[10px] font-mono text-[#757788]">
                  {isOnline ? '• Dados sincronizam em tempo real' : '• Operando via IndexedDB Local'}
                </span>
              </div>
              <p className="text-[11px] text-[#A6A7B2]">
                {isOnline
                  ? 'Todas as varreduras e produtos salvos são espelhados no IndexedDB do seu navegador.'
                  : 'Você pode navegar por todos os produtos salvos, histórico de tendências e simulador sem gastar dados.'}
              </p>
            </div>
          </div>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
          <div className="p-3 rounded-xl border border-white/10 bg-[#2A3042]">
            <div className="flex items-center justify-between text-[#FE2C55] mb-1">
              <Bookmark className="w-4 h-4" />
              <span className="text-[10px] font-mono uppercase text-[#757788]">Salvos</span>
            </div>
            <div className="text-xl font-black text-white">
              {stats?.savedCount ?? 0}
            </div>
            <div className="text-[10px] text-[#A6A7B2]">Produtos favoritados</div>
          </div>

          <div className="p-3 rounded-xl border border-white/10 bg-[#2A3042]">
            <div className="flex items-center justify-between text-[#25F4EE] mb-1">
              <TrendingUp className="w-4 h-4" />
              <span className="text-[10px] font-mono uppercase text-[#757788]">Histórico</span>
            </div>
            <div className="text-xl font-black text-white">
              {stats?.trendHistoryCount ?? allProducts.length}
            </div>
            <div className="text-[10px] text-[#A6A7B2]">Tendências arquivadas</div>
          </div>

          <div className="p-3 rounded-xl border border-white/10 bg-[#2A3042]">
            <div className="flex items-center justify-between text-amber-400 mb-1">
              <History className="w-4 h-4" />
              <span className="text-[10px] font-mono uppercase text-[#757788]">Varreduras</span>
            </div>
            <div className="text-xl font-black text-white">
              {stats?.scanHistoryCount ?? scanHistory.length}
            </div>
            <div className="text-[10px] text-[#A6A7B2]">Scans registrados</div>
          </div>

          <div className="p-3 rounded-xl border border-white/10 bg-[#2A3042]">
            <div className="flex items-center justify-between text-purple-400 mb-1">
              <HardDrive className="w-4 h-4" />
              <span className="text-[10px] font-mono uppercase text-[#757788]">Espaço</span>
            </div>
            <div className="text-xl font-black text-white">
              {stats?.storageEstimateMb ? `${stats.storageEstimateMb} MB` : '< 2 MB'}
            </div>
            <div className="text-[10px] text-[#A6A7B2]">Uso de armazenamento</div>
          </div>
        </div>

        {/* Scan History Section */}
        <div className="mt-5">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#A6A7B2] flex items-center gap-1.5">
              <History className="w-3.5 h-3.5 text-cyan-400" />
              <span>Histórico de Varreduras Salvas no Banco</span>
            </h4>
            <span className="text-[10px] text-[#757788]">Última sync: {formatLastSync(stats?.lastSync || null)}</span>
          </div>

          <div className="space-y-2 max-h-48 overflow-y-auto subtle-horizontal-scroll pr-1">
            {scanHistory.length > 0 ? (
              scanHistory.map((scan) => (
                <div
                  key={scan.id}
                  className="p-2.5 rounded-xl border border-white/5 bg-[#141624] flex items-center justify-between gap-3 text-xs"
                >
                  <div className="flex flex-col gap-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white">
                        {scan.query ? `Busca: "${scan.query}"` : 'Varredura Global do Radar'}
                      </span>
                      {scan.niche && scan.niche !== 'all' && (
                        <span className="px-1.5 py-0.2 rounded bg-white/10 text-[9px] text-cyan-300">
                          {scan.niche}
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-[#757788]">
                      {scan.dateFormatted} • {scan.count} produtos capturados
                    </span>
                  </div>
                  <div className="text-[10px] font-mono text-[#25F4EE] bg-[#25F4EE]/10 px-2 py-0.5 rounded border border-[#25F4EE]/20">
                    Offline OK
                  </div>
                </div>
              ))
            ) : (
              <div className="p-4 rounded-xl border border-dashed border-white/10 text-center text-xs text-[#757788]">
                <span>Nenhuma varredura anterior no histórico. Ao clicar em "Escanear Web", os snapshots serão arquivados aqui automaticamente.</span>
              </div>
            )}
          </div>
        </div>

        {/* Feedback message banner */}
        {syncMessage && (
          <div className="mt-3 p-2.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{syncMessage}</span>
          </div>
        )}

        {/* Bottom Actions */}
        <div className="mt-6 pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={handleForceSync}
              disabled={isSyncing}
              className="px-3.5 py-2 rounded-xl bg-[#161823] hover:bg-[#1E202E] border border-cyan-500/40 hover:border-cyan-400 text-cyan-300 text-xs font-bold flex items-center gap-1.5 transition active:scale-95 cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'Sincronizando...' : 'Sincronizar Tendências'}</span>
            </button>

            <button
              onClick={handleCleanupOldProducts}
              disabled={isCleaning}
              className="px-3.5 py-2 rounded-xl bg-purple-950/20 hover:bg-purple-900/30 border border-purple-500/40 hover:border-purple-400 text-purple-300 text-xs font-bold flex items-center gap-1.5 transition active:scale-95 cursor-pointer disabled:opacity-50"
              title="Executar limpeza automática de tendências temporárias no cache com mais de 30 dias"
            >
              <Sparkles className={`w-3.5 h-3.5 ${isCleaning ? 'animate-spin' : ''}`} />
              <span>{isCleaning ? 'Otimizando...' : staleCount > 0 ? `Limpar Antigos (${staleCount} > 30d)` : 'Limpar Antigos (> 30d)'}</span>
            </button>

            <button
              onClick={handleClearCache}
              className="px-3.5 py-2 rounded-xl bg-red-950/20 hover:bg-red-900/30 border border-red-500/30 hover:border-red-500/50 text-red-300 text-xs font-semibold flex items-center gap-1.5 transition active:scale-95 cursor-pointer"
              title="Limpar histórico de varreduras antigas preservando itens salvos"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Limpar Cache Total</span>
            </button>
          </div>

          <button
            onClick={() => {
              onClose();
              onOpenSavedTab();
            }}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#FE2C55] to-[#FF0050] hover:brightness-110 text-white text-xs font-bold flex items-center gap-1.5 transition active:scale-95 shadow-lg shadow-[#FE2C55]/20 cursor-pointer"
          >
            <Bookmark className="w-3.5 h-3.5" />
            <span>Ver Produtos Salvos</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
