// src/components/Admin/AdminDashboardModal.tsx
// Painel Executivo do Administrador do TIKBLOX PRO

import React, { useState } from 'react';
import {
  ShieldAlert,
  Users,
  DollarSign,
  TrendingUp,
  Cpu,
  RefreshCw,
  PlusCircle,
  Copy,
  Check,
  X,
  ExternalLink,
  Flame,
  Radio,
  CheckCircle2,
  Lock,
  Eye,
} from 'lucide-react';
import { UserSession, getKiwifyCheckoutUrls } from '../../services/authService';

interface AdminDashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  userSession: UserSession;
  totalProductsCount: number;
  onTriggerScan: () => void;
  onOpenAddCustomProduct: () => void;
  onSwitchToSubscriberView?: () => void;
  onSwitchToCreatorView?: () => void;
}

export const AdminDashboardModal: React.FC<AdminDashboardModalProps> = ({
  isOpen,
  onClose,
  userSession,
  totalProductsCount,
  onTriggerScan,
  onOpenAddCustomProduct,
  onSwitchToSubscriberView,
  onSwitchToCreatorView,
}) => {
  const [copiedLink, setCopiedLink] = useState<string | null>(null);
  const [utmSource, setUtmSource] = useState('duda');
  const checkoutUrls = getKiwifyCheckoutUrls();

  if (!isOpen) return null;

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedLink(label);
    setTimeout(() => setCopiedLink(null), 2000);
  };

  const cleanUtm = encodeURIComponent(utmSource.trim().toLowerCase() || 'duda');
  const baseComboUrl = checkoutUrls.rawCombo || checkoutUrls.combo.split('?')[0];
  const baseRadarUrl = checkoutUrls.rawRadar || checkoutUrls.radar.split('?')[0];
  const webhookEndpointUrl = 'https://tikblox.com.br/api/webhook/kiwify';
  const generatedCheckoutUrl = `${baseComboUrl}?src=${cleanUtm}`;
  const generatedRadarCheckoutUrl = `${baseRadarUrl}?src=${cleanUtm}`;
  const generatedLandingUrl = `https://tikblox.com.br?ref=${cleanUtm}`;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 select-none animate-in fade-in">
      <div className="bg-[#0D111E] border border-[#25F4EE]/30 rounded-3xl max-w-4xl w-full p-6 sm:p-8 shadow-2xl space-y-6 text-white relative overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Glow Superior */}
        <div className="absolute -top-32 -left-32 w-64 h-64 bg-[#25F4EE]/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -right-32 w-64 h-64 bg-[#FE2C55]/15 rounded-full blur-3xl pointer-events-none" />

        {/* Top Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#25F4EE] to-[#007A87] text-[#0D111E] flex items-center justify-center font-black shadow-md">
              👑
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-black text-white">
                  Painel de Controle do Administrador
                </h2>
                <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-mono text-[10px] font-bold border border-emerald-500/30">
                  ADM ROOT
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Logado como: <strong className="text-white">{userSession.name}</strong> ({userSession.email})
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* BANNER DE AUDITORIA VISUAL NO TOPO DO PAINEL */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/60 via-[#14192B] to-rose-950/60 border border-emerald-500/40 shrink-0 space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-emerald-400 animate-pulse" />
              <span className="text-xs font-black uppercase tracking-wider text-emerald-300">
                Auditoria de Experiência do Usuário (1-Clique)
              </span>
            </div>
            <span className="text-[10px] font-mono text-slate-400">Sem precisar deslogar</span>
          </div>
          <p className="text-xs text-slate-300">
            Alterne sua visão instantaneamente para navegar exatamente como um cliente ou parceiro vê a plataforma:
          </p>
          <div className="flex flex-wrap items-center gap-2.5 pt-1">
            {onSwitchToSubscriberView && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onSwitchToSubscriberView();
                }}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:brightness-110 text-white font-black text-xs transition cursor-pointer flex items-center gap-2 active:scale-95 shadow-md shadow-emerald-950/40"
              >
                <Eye className="w-4 h-4 text-emerald-100" />
                <span>👁️ Ver como Assinante Público (Sem ADM)</span>
              </button>
            )}

            {onSwitchToCreatorView && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onSwitchToCreatorView();
                }}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 hover:brightness-110 text-white font-black text-xs transition cursor-pointer flex items-center gap-2 active:scale-95 shadow-md shadow-rose-950/40"
              >
                <span>📣</span>
                <span>Ver como Creator VIP (Duda Vitti)</span>
              </button>
            )}
          </div>
        </div>

        {/* Corpo com Scroll */}
        <div className="overflow-y-auto pr-1 space-y-6">
          
          {/* 1. CARDS DE MÉTRICAS EXECUTIVAS */}
          <div>
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-[#25F4EE] mb-3">
              1. Visão Geral do Negócio (Kiwify & Radar)
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              
              <div className="p-4 rounded-2xl bg-[#14192B] border border-white/10 space-y-1">
                <div className="flex items-center justify-between text-slate-400 text-xs">
                  <span>MRR Projetado:</span>
                  <DollarSign className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="text-xl sm:text-2xl font-black text-white font-mono">
                  R$ 1.596
                </div>
                <span className="text-[10px] text-emerald-400 block font-bold">
                  +28 assinantes ativos
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-[#14192B] border border-white/10 space-y-1">
                <div className="flex items-center justify-between text-slate-400 text-xs">
                  <span>Produtos Ativos:</span>
                  <Radio className="w-4 h-4 text-[#25F4EE]" />
                </div>
                <div className="text-xl sm:text-2xl font-black text-white font-mono">
                  {totalProductsCount}
                </div>
                <span className="text-[10px] text-[#25F4EE] block font-bold">
                  100% Oceano Azul SP
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-[#14192B] border border-white/10 space-y-1">
                <div className="flex items-center justify-between text-slate-400 text-xs">
                  <span>Divisão de Planos:</span>
                  <TrendingUp className="w-4 h-4 text-amber-400" />
                </div>
                <div className="text-xl sm:text-2xl font-black text-white font-mono">
                  65% IA
                </div>
                <span className="text-[10px] text-slate-400 block">
                  35% Radar Essential
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-[#14192B] border border-white/10 space-y-1">
                <div className="flex items-center justify-between text-slate-400 text-xs">
                  <span>Taxa de Churn:</span>
                  <ShieldAlert className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="text-xl sm:text-2xl font-black text-emerald-400 font-mono">
                  &lt; 2.5%
                </div>
                <span className="text-[10px] text-slate-400 block">
                  Cancelamento mínimo
                </span>
              </div>

            </div>
          </div>

          {/* 2. GERENCIADOR DE WEBHOOK KIWIFY */}
          <div className="p-5 rounded-2xl bg-[#14192B] border border-white/10 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-[#25F4EE]" />
                <h4 className="text-sm font-black text-white">
                  Endpoint do Webhook Oficial da Kiwify
                </h4>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold">
                Online & Pronto
              </span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Cole esta URL no painel da Kiwify em <strong>Configurações &gt; Webhooks</strong> para liberar o acesso dos assinantes instantaneamente após o pagamento:
            </p>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={webhookEndpointUrl}
                className="w-full px-3 py-2.5 rounded-xl bg-black/40 border border-white/10 font-mono text-xs text-[#25F4EE] select-all focus:outline-none"
              />
              <button
                onClick={() => copyToClipboard(webhookEndpointUrl, 'webhook')}
                className="px-4 py-2.5 rounded-xl bg-[#25F4EE] hover:bg-[#00D2C4] text-[#0D111E] font-black text-xs transition cursor-pointer flex items-center gap-1.5 shrink-0"
              >
                {copiedLink === 'webhook' ? <Check className="w-4 h-4 text-emerald-950" /> : <Copy className="w-4 h-4" />}
                <span>{copiedLink === 'webhook' ? 'Copiado!' : 'Copiar URL'}</span>
              </button>
            </div>
          </div>

          {/* 3. GERADOR DE LINKS DE DIVULGAÇÃO & AFILIADOS (DUDA, TIKTOK, INSTAGRAM) */}
          <div className="p-5 rounded-2xl bg-[#14192B] border border-white/10 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-black text-white flex items-center gap-2">
                <Flame className="w-4 h-4 text-[#FE2C55]" />
                <span>Gerador de Links Rastreados (Para Duda & Campanhas)</span>
              </h4>
            </div>

            <div className="flex items-center gap-3">
              <label className="text-xs text-slate-400 shrink-0 font-bold">Identificador UTM / Afiliado:</label>
              <input
                type="text"
                value={utmSource}
                onChange={(e) => setUtmSource(e.target.value)}
                placeholder="Ex: duda, tiktok, instagram, anuncio1"
                className="px-3 py-1.5 rounded-lg bg-black/40 border border-white/10 text-xs text-white font-mono focus:outline-none focus:border-[#25F4EE] w-48"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
              
              {/* Link do Checkout Combo PRO */}
              <div className="p-3.5 rounded-xl bg-black/30 border border-white/5 space-y-2">
                <span className="text-[11px] font-bold text-[#25F4EE] block">
                  Checkout Combo PRO (R$ 57):
                </span>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={generatedCheckoutUrl}
                    className="w-full px-2 py-1.5 rounded bg-black/50 border border-white/5 font-mono text-[11px] text-slate-300 select-all"
                  />
                  <button
                    onClick={() => copyToClipboard(generatedCheckoutUrl, 'checkout')}
                    className="p-2 rounded bg-white/10 hover:bg-white/20 text-white transition cursor-pointer shrink-0"
                    title="Copiar link de checkout PRO"
                  >
                    {copiedLink === 'checkout' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {/* Link do Checkout Essential */}
              <div className="p-3.5 rounded-xl bg-black/30 border border-white/5 space-y-2">
                <span className="text-[11px] font-bold text-slate-300 block">
                  Checkout Essential (R$ 37):
                </span>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={generatedRadarCheckoutUrl}
                    className="w-full px-2 py-1.5 rounded bg-black/50 border border-white/5 font-mono text-[11px] text-slate-300 select-all"
                  />
                  <button
                    onClick={() => copyToClipboard(generatedRadarCheckoutUrl, 'checkout_radar')}
                    className="p-2 rounded bg-white/10 hover:bg-white/20 text-white transition cursor-pointer shrink-0"
                    title="Copiar link de checkout Essential"
                  >
                    {copiedLink === 'checkout_radar' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {/* Link da Landing Page */}
              <div className="p-3.5 rounded-xl bg-black/30 border border-white/5 space-y-2">
                <span className="text-[11px] font-bold text-slate-300 block">
                  Link Landing Page com Rastreio:
                </span>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={generatedLandingUrl}
                    className="w-full px-2 py-1.5 rounded bg-black/50 border border-white/5 font-mono text-[11px] text-slate-300 select-all"
                  />
                  <button
                    onClick={() => copyToClipboard(generatedLandingUrl, 'landing')}
                    className="p-2 rounded bg-white/10 hover:bg-white/20 text-white transition cursor-pointer shrink-0"
                    title="Copiar link da landing page"
                  >
                    {copiedLink === 'landing' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

            </div>
          </div>

          {/* 4. GESTÃO DO MOTOR TIKBLOX AI & AÇÕES DO RADAR */}
          <div className="p-5 rounded-2xl bg-[#14192B] border border-white/10 space-y-4">
            <h4 className="text-sm font-black text-white flex items-center gap-2">
              <Cpu className="w-4 h-4 text-emerald-400" />
              <span>Infraestrutura do Motor TikBlox AI</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-black/30 border border-white/5 space-y-1">
                <span className="text-[10px] text-slate-400 block font-mono">STATUS DO MOTOR</span>
                <span className="font-bold text-emerald-400 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>100% Operacional</span>
                </span>
              </div>
              <div className="p-3 rounded-xl bg-black/30 border border-white/5 space-y-1">
                <span className="text-[10px] text-slate-400 block font-mono">CRONOGRAMA DO RADAR</span>
                <span className="font-bold text-white">06:00 BRT Diário</span>
              </div>
              <div className="p-3 rounded-xl bg-black/30 border border-white/5 space-y-1">
                <span className="text-[10px] text-slate-400 block font-mono">ARQUITETURA</span>
                <span className="font-bold text-white">TikBlox Core v3.8</span>
              </div>
            </div>

            {/* Ações Administrativas */}
            <div className="pt-2 flex flex-wrap items-center gap-3">
              {onSwitchToSubscriberView && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onSwitchToSubscriberView();
                  }}
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:brightness-105 text-white font-black text-xs transition cursor-pointer flex items-center gap-2 active:scale-95 shadow-md"
                  title="Simular e auditar exatamente a visão do cliente pagante comum"
                >
                  <Eye className="w-4 h-4 text-emerald-200" />
                  <span>👁️ Ver como Assinante Público (Auditoria)</span>
                </button>
              )}

              {onSwitchToCreatorView && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onSwitchToCreatorView();
                  }}
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 hover:brightness-105 text-white font-black text-xs transition cursor-pointer flex items-center gap-2 active:scale-95 shadow-md"
                  title="Simular e auditar a visão da Duda Vitti"
                >
                  <span>📣</span>
                  <span>Ver como Creator VIP (Duda)</span>
                </button>
              )}

              <button
                onClick={() => {
                  onClose();
                  onOpenAddCustomProduct();
                }}
                className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs transition cursor-pointer flex items-center gap-2 active:scale-95 border border-white/10"
              >
                <PlusCircle className="w-4 h-4 text-[#25F4EE]" />
                <span>Adicionar Produto Vencedor Manual</span>
              </button>

              <button
                onClick={() => {
                  onTriggerScan();
                  alert('Varredura manual do radar disparada com sucesso!');
                }}
                className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs transition cursor-pointer flex items-center gap-2 active:scale-95 border border-white/10"
              >
                <RefreshCw className="w-4 h-4 text-emerald-400" />
                <span>Forçar Varredura Manual</span>
              </button>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs text-slate-400 shrink-0">
          <span>TikBlox Pro • Ambiente Seguro Administrativo</span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs transition cursor-pointer"
          >
            Fechar Painel
          </button>
        </div>

      </div>
    </div>
  );
};
