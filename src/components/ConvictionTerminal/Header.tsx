import React, { useState } from 'react';
import {
  PanelLeft,
  PanelRight,
  RefreshCw,
  Bookmark,
  Clock,
  CheckCircle2,
  Sparkles,
  X,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { TikBloxLogo } from '../TikBloxLogo';
import { UserSession } from '../../services/authService';

interface HeaderProps {
  onScanTrends: () => void;
  isScanning: boolean;
  savedCount: number;
  onOpenSaved: () => void;
  painelEsquerdoRecolhido: boolean;
  setPainelEsquerdoRecolhido: (val: boolean) => void;
  painelDireitoRecolhido: boolean;
  setPainelDireitoRecolhido: (val: boolean) => void;
  onOpenCalculator: () => void;
  userSession?: UserSession | null;
  onLogout?: () => void;
  onViewLanding?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onScanTrends,
  isScanning,
  savedCount,
  onOpenSaved,
  painelEsquerdoRecolhido,
  setPainelEsquerdoRecolhido,
  painelDireitoRecolhido,
  setPainelDireitoRecolhido,
  onOpenCalculator,
  userSession,
  onLogout,
  onViewLanding,
}) => {
  const [showScheduleModal, setShowScheduleModal] = useState(false);

  return (
    <>
      <header className="relative bg-white border-b border-slate-200/90 px-3 sm:px-4 py-2 flex items-center justify-between shrink-0 z-20 gap-2 min-h-[54px] select-none text-slate-900 shadow-2xs">
        
        {/* Faixa de Identidade Visual TikBlox: Friso Cromático Ciano e Rosa do Logo */}
        <div className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-gradient-to-r from-[#25F4EE] via-[#FE2C55] to-[#25F4EE] opacity-90" />

        {/* 1. Logo Oficial TikBlox em Versão Light com Emblema 3D Vibrante */}
        <div className="flex items-center gap-3 shrink-0">
          <TikBloxLogo size="sm" showBadge={true} animate={false} theme="light" />

          <span className="hidden xl:inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-300">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>Pronta Entrega no Brasil</span>
          </span>
        </div>

        {/* 2. Ações Centrais / Direitas: Varredura Diária Fixada às 06:00 BRT */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          
          {/* Badge Institucional do Cronograma Diário (06:00 BRT) */}
          <button
            onClick={() => setShowScheduleModal(true)}
            className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100/90 text-xs font-bold text-slate-800 transition cursor-pointer shadow-2xs group"
            title="Clique para ver detalhes do cronograma de atualização diária do radar"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>

            <div className="flex items-center gap-1.5 font-mono text-[11px]">
              <span className="text-slate-400 hidden md:inline">Varredura Diária:</span>
              <span className="font-extrabold text-slate-900">06:00 BRT</span>
            </div>

            <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-extrabold text-emerald-800 bg-emerald-100/80 px-2 py-0.2 rounded-full border border-emerald-200">
              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
              <span>Base Minerada Hoje</span>
            </span>
          </button>

          {/* Botão de Salvos com Realce Rosa Neon TikBlox */}
          <button
            onClick={onOpenSaved}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-800 hover:border-[#FE2C55]/60 transition-all cursor-pointer shadow-2xs active:scale-95"
            title="Ver produtos salvos"
          >
            <Bookmark className="w-3.5 h-3.5 text-[#FE2C55] fill-[#FE2C55]/20" />
            <span className="hidden sm:inline">Salvos:</span>
            <span className="font-mono text-xs font-bold text-slate-900 bg-slate-100 px-1.5 py-0.2 rounded border border-slate-200">
              {savedCount}
            </span>
          </button>

          {/* Toggles de Painéis no Desktop */}
          <div className="hidden lg:flex items-center gap-1.5 border-l border-slate-200 pl-2.5 ml-1">
            <button
              type="button"
              onClick={() => setPainelEsquerdoRecolhido(!painelEsquerdoRecolhido)}
              className={`p-1.5 px-2 rounded-lg border text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                painelEsquerdoRecolhido
                  ? 'bg-[#25F4EE]/15 text-[#007A87] border-[#25F4EE] shadow-2xs'
                  : 'bg-white text-slate-700 border-slate-300 hover:border-[#25F4EE] hover:text-[#007A87]'
              }`}
              title={painelEsquerdoRecolhido ? 'Expandir Lista de Produtos' : 'Recolher Lista de Produtos para focar no Raio-X'}
            >
              <PanelLeft className="w-3.5 h-3.5 text-[#007A87]" />
              <span className="text-[10px] hidden xl:inline">Lista</span>
            </button>

            <button
              type="button"
              onClick={() => setPainelDireitoRecolhido(!painelDireitoRecolhido)}
              className={`p-1.5 px-2 rounded-lg border text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                painelDireitoRecolhido
                  ? 'bg-[#FE2C55]/10 text-[#FE2C55] border-[#FE2C55]/40 shadow-2xs'
                  : 'bg-white text-slate-700 border-slate-300 hover:border-[#FE2C55]/60 hover:text-[#FE2C55]'
              }`}
              title={painelDireitoRecolhido ? 'Expandir TIKBLOX AI' : 'Recolher TIKBLOX AI para focar no Raio-X'}
            >
              <PanelRight className="w-3.5 h-3.5 text-[#FE2C55]" />
              <span className="text-[10px] hidden xl:inline">TIKBLOX AI</span>
            </button>

            {/* Perfil do Assinante / Alternância para Landing Page */}
            {userSession && (
              <div className="flex items-center gap-1.5 pl-1.5 border-l border-slate-200">
                <span className="text-[10px] font-mono font-bold bg-slate-100 text-slate-700 px-2 py-1 rounded-lg border border-slate-200 hidden sm:flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span>{userSession.name}</span>
                </span>

                {onViewLanding && (
                  <button
                    onClick={onViewLanding}
                    className="p-1 px-2 rounded-lg text-[10px] font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition cursor-pointer border border-slate-200"
                    title="Ver Landing Page de Apresentação"
                  >
                    Landing Page
                  </button>
                )}

                {onLogout && (
                  <button
                    onClick={onLogout}
                    className="p-1 px-2 rounded-lg text-[10px] font-bold text-rose-600 hover:bg-rose-50 border border-rose-200 transition cursor-pointer"
                    title="Encerrar sessão"
                  >
                    Sair
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Modal Institucional: Cronograma da Varredura Diária TikBlox */}
      {showScheduleModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 select-none animate-in fade-in">
          <div className="bg-white rounded-2xl border border-slate-200 w-full max-w-lg shadow-2xl overflow-hidden flex flex-col text-slate-900">
            
            {/* Header Modal */}
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-emerald-100 text-emerald-800">
                  <Clock className="w-4 h-4 text-emerald-700" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900">
                    Cronograma de Varredura Diária TikBlox
                  </h3>
                  <p className="text-[11px] text-slate-500 font-mono">
                    Lote Diário Automatizado • 06:00 BRT
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowScheduleModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-200/60 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Corpo do Modal */}
            <div className="p-5 space-y-4 text-xs">
              <div className="p-3.5 rounded-xl bg-sky-50 border border-sky-200 space-y-1.5">
                <div className="flex items-center gap-1.5 text-sky-900 font-extrabold">
                  <Sparkles className="w-4 h-4 text-[#007A87]" />
                  <span>Por que o radar atualiza 1x ao dia às 06:00?</span>
                </div>
                <p className="text-sky-950/80 leading-relaxed text-[11px]">
                  O algoritmo do TikBlox minera a madrugada inteira buscando os produtos que começaram a tracionar nos feeds globais e no TikTok Shop Brasil. Às <strong>06:00 BRT</strong>, a nova safra de <strong>Oceano Azul</strong> é consolidada e liberada.
                </p>
              </div>

              <div className="space-y-2.5">
                <div className="flex items-start gap-2.5">
                  <div className="p-1 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 mt-0.5">
                    <ShieldCheck className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900">Filtro Rígido Anti-Saturação</h4>
                    <p className="text-slate-500 text-[11px]">
                      Produtos com mais de 18 vídeos no feed BR ou com sinais de fadiga criativa são sumariamente descartados. Você só vê produtos no início da onda.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <div className="p-1 rounded-md bg-amber-50 text-amber-700 border border-amber-200 mt-0.5">
                    <Zap className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900">Foco Total na Execução Durante o Dia</h4>
                    <p className="text-slate-500 text-[11px]">
                      A lista de produtos permanece fixa ao longo do dia para você e sua equipe destrincharem as métricas, unit economics, calcularem break-even e criarem ganchos virais com a IA.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <div className="p-1 rounded-md bg-slate-100 text-slate-700 border border-slate-200 mt-0.5">
                    <Clock className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900">Próxima Safra de Produtos</h4>
                    <p className="text-slate-500 text-[11px]">
                      A próxima varredura geral ocorrerá amanhã às <strong>06:00 BRT</strong>.
                    </p>
                  </div>
                </div>
              </div>

              {/* Botões de Ação */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => {
                    onScanTrends();
                    setShowScheduleModal(false);
                  }}
                  disabled={isScanning}
                  className="px-3.5 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs transition cursor-pointer flex items-center gap-1.5 active:scale-95 disabled:opacity-50"
                  title="Sincronizar a base local com o lote de hoje"
                >
                  <RefreshCw className={`w-3.5 h-3.5 text-slate-500 ${isScanning ? 'animate-spin' : ''}`} />
                  <span>{isScanning ? 'Sincronizando...' : 'Sincronizar Lote Local'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowScheduleModal(false)}
                  className="px-4 py-1.5 rounded-xl bg-slate-900 hover:bg-black text-white font-bold text-xs transition cursor-pointer shadow-2xs"
                >
                  Entendi
                </button>
              </div>

            </div>

          </div>
        </div>
      )}
    </>
  );
};
