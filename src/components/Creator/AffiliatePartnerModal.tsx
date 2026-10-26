// src/components/Creator/AffiliatePartnerModal.tsx
// Central de Divulgação & Materiais Oficiais para Duda Vitti e Afiliados Parceiros

import React, { useState } from 'react';
import {
  Sparkles,
  Copy,
  Check,
  X,
  Flame,
  Video,
  Share2,
  ExternalLink,
  Target,
  Package,
  DollarSign,
  FileText,
} from 'lucide-react';
import { UserSession, getKiwifyCheckoutUrls } from '../../services/authService';

interface AffiliatePartnerModalProps {
  isOpen: boolean;
  onClose: () => void;
  userSession: UserSession;
}

export const AffiliatePartnerModal: React.FC<AffiliatePartnerModalProps> = ({
  isOpen,
  onClose,
  userSession,
}) => {
  const [copiedLink, setCopiedLink] = useState<string | null>(null);
  const checkoutUrls = getKiwifyCheckoutUrls();

  if (!isOpen) return null;

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedLink(label);
    setTimeout(() => setCopiedLink(null), 2000);
  };

  const affiliateTag = userSession.affiliateCode || 'duda';
  const baseComboUrl = checkoutUrls.rawCombo || checkoutUrls.combo.split('?')[0];
  const baseRadarUrl = checkoutUrls.rawRadar || checkoutUrls.radar.split('?')[0];
  const affiliateCheckoutUrl = `${baseComboUrl}?src=${affiliateTag}`;
  const affiliateRadarCheckoutUrl = `${baseRadarUrl}?src=${affiliateTag}`;
  const affiliateLandingUrl = `https://tikblox.com.br?ref=${affiliateTag}`;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 select-none animate-in fade-in">
      <div className="bg-[#0D111E] border border-[#FE2C55]/30 rounded-3xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl space-y-6 text-white relative overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Glow de fundo */}
        <div className="absolute -top-32 -left-32 w-64 h-64 bg-[#FE2C55]/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -right-32 w-64 h-64 bg-[#25F4EE]/15 rounded-full blur-3xl pointer-events-none" />

        {/* Top Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#FE2C55] to-[#FF0050] text-white flex items-center justify-center font-black shadow-md">
              📣
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-black text-white">
                  Central de Divulgação & Parcerias
                </h2>
                <span className="px-2 py-0.5 rounded bg-[#FE2C55]/20 text-[#FE2C55] font-mono text-[10px] font-bold border border-[#FE2C55]/30">
                  CREATOR VIP
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Parceira oficial: <strong className="text-white">{userSession.name}</strong> ({userSession.email})
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

        {/* Corpo com Scroll */}
        <div className="overflow-y-auto pr-1 space-y-6">
          
          {/* 1. SEUS LINKS RASTREADOS DA KIWIFY */}
          <div className="p-5 rounded-2xl bg-[#14192B] border border-white/10 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-[#25F4EE] flex items-center gap-2">
                <Share2 className="w-4 h-4" />
                <span>Seus Links Oficiais com Rastreio (Kiwify)</span>
              </h3>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded font-bold">
                Tag: ?src={affiliateTag}
              </span>
            </div>

            <div className="space-y-3">
              
              {/* Link do Checkout Combo PRO */}
              <div className="p-3.5 rounded-xl bg-black/40 border border-white/5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white">
                    Link Direto do Checkout Kiwify (Combo PRO R$ 57/mês):
                  </span>
                  <span className="text-[10px] text-[#25F4EE] font-bold">⭐ Mais vendido</span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={affiliateCheckoutUrl}
                    className="w-full px-3 py-2 rounded-lg bg-black/50 border border-white/10 font-mono text-xs text-[#25F4EE] select-all focus:outline-none"
                  />
                  <button
                    onClick={() => copyToClipboard(affiliateCheckoutUrl, 'checkout')}
                    className="px-3 py-2 rounded-lg bg-[#25F4EE] hover:bg-[#00D2C4] text-[#0D111E] font-bold text-xs transition cursor-pointer flex items-center gap-1 shrink-0"
                  >
                    {copiedLink === 'checkout' ? <Check className="w-3.5 h-3.5 text-emerald-950" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedLink === 'checkout' ? 'Copiado!' : 'Copiar'}</span>
                  </button>
                </div>
              </div>

              {/* Link do Checkout Radar Essential */}
              <div className="p-3.5 rounded-xl bg-black/40 border border-white/5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white">
                    Link Direto do Checkout Kiwify (Radar Essential R$ 37/mês):
                  </span>
                  <span className="text-[10px] text-slate-400">Plano de entrada</span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={affiliateRadarCheckoutUrl}
                    className="w-full px-3 py-2 rounded-lg bg-black/50 border border-white/10 font-mono text-xs text-slate-200 select-all focus:outline-none"
                  />
                  <button
                    onClick={() => copyToClipboard(affiliateRadarCheckoutUrl, 'checkout_radar')}
                    className="px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition cursor-pointer flex items-center gap-1 shrink-0"
                  >
                    {copiedLink === 'checkout_radar' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedLink === 'checkout_radar' ? 'Copiado!' : 'Copiar'}</span>
                  </button>
                </div>
              </div>

              {/* Link da Landing Page */}
              <div className="p-3.5 rounded-xl bg-black/40 border border-white/5 space-y-2">
                <span className="text-xs font-bold text-white block">
                  Link da Landing Page para colocar na Bio:
                </span>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={affiliateLandingUrl}
                    className="w-full px-3 py-2 rounded-lg bg-black/50 border border-white/10 font-mono text-xs text-slate-300 select-all focus:outline-none"
                  />
                  <button
                    onClick={() => copyToClipboard(affiliateLandingUrl, 'landing')}
                    className="px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition cursor-pointer flex items-center gap-1 shrink-0"
                  >
                    {copiedLink === 'landing' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedLink === 'landing' ? 'Copiado!' : 'Copiar'}</span>
                  </button>
                </div>
              </div>

            </div>
          </div>

          {/* 2. ROTEIROS DE VÍDEO PRONTOS PARA VOCÊ GRAVAR NO TIKTOK / REELS */}
          <div className="p-5 rounded-2xl bg-[#14192B] border border-white/10 space-y-4">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-[#FE2C55] flex items-center gap-2">
              <Video className="w-4 h-4" />
              <span>Roteiros Prontos para Gravar no TikTok e Instagram</span>
            </h3>

            {/* Roteiro 1 */}
            <div className="p-4 rounded-xl bg-black/30 border border-white/5 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-white text-sm">
                  Roteiro 1: "O Erro Comum de Comprar da China" (Alta Curiosidade)
                </h4>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">30s</span>
              </div>
              <ul className="space-y-1.5 text-slate-300 pt-1">
                <li>
                  <strong>Gancho (0 a 3s):</strong> "Se você vende no TikTok Shop e ainda espera 25 dias pro produto vir da China... você tá jogando dinheiro no lixo."
                </li>
                <li>
                  <strong>Demonstração (3 a 20s):</strong> Mostre a tela do TikBlox aberta no computador: "Olha isso aqui. Esse radar filtra produtos que JÁ estão em São Paulo, chegam em 2 dias na sua casa e têm menos de 10 vídeos gravados no Brasil. Você grava a amostra antes de todo mundo."
                </li>
                <li>
                  <strong>Chamada (20 a 30s):</strong> "Com 3 vendas você já paga a assinatura e o produto. O link oficial com valor de lançamento tá na minha bio!"
                </li>
              </ul>
            </div>

            {/* Roteiro 2 */}
            <div className="p-4 rounded-xl bg-black/30 border border-white/5 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-white text-sm">
                  Roteiro 2: "Como a IA Escreve Meus Roteiros em 5 Segundos"
                </h4>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">30s</span>
              </div>
              <ul className="space-y-1.5 text-slate-300 pt-1">
                <li>
                  <strong>Gancho (0 a 3s):</strong> "Eu achei um produto com estoque em São Paulo e pedi pra IA do TikBlox escrever o roteiro de vendas..."
                </li>
                <li>
                  <strong>Demonstração (3 a 20s):</strong> Grave você clicando no Copiloto TikBlox AI gerando o gancho de 3 segundos que trava o feed e a simulação de lucro no Pix D+7.
                </li>
                <li>
                  <strong>Chamada (20 a 30s):</strong> "É a ferramenta mais completa que vi até agora pro TikTok Shop Brasil. O link com desconto tá no meu perfil."
                </li>
              </ul>
            </div>

          </div>

          {/* 3. ARGUMENTOS MATADORES DE CONVERSÃO */}
          <div className="p-5 rounded-2xl bg-[#14192B] border border-white/10 space-y-3">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2">
              <Target className="w-4 h-4" />
              <span>Argumentos-Chave para Responder no Direct / Comentários</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
              <div className="p-3 rounded-xl bg-white/5 border border-white/5 space-y-1">
                <strong className="text-white block">Break-Even Rápido:</strong>
                <p className="text-slate-400 text-[11px]">
                  "Com apenas 2 a 3 vendas no mês você já recupera todo o valor da ferramenta."
                </p>
              </div>

              <div className="p-3 rounded-xl bg-white/5 border border-white/5 space-y-1">
                <strong className="text-white block">Estoque Nacional:</strong>
                <p className="text-slate-400 text-[11px]">
                  "Não é da China. Todos os itens têm fornecedores com estoque real em São Paulo."
                </p>
              </div>

              <div className="p-3 rounded-xl bg-white/5 border border-white/5 space-y-1">
                <strong className="text-white block">Garantia Kiwify:</strong>
                <p className="text-slate-400 text-[11px]">
                  "Tem 7 dias de garantia total incondicional pela Kiwify se você não gostar."
                </p>
              </div>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs text-slate-400 shrink-0">
          <span>Boas gravações, Duda! 🚀</span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs transition cursor-pointer"
          >
            Fechar
          </button>
        </div>

      </div>
    </div>
  );
};
