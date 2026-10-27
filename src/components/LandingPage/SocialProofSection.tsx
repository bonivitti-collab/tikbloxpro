// src/components/LandingPage/SocialProofSection.tsx
// Casos Reais de Mineração e Assimetria de Lucro no TikTok Shop Brasil

import React from 'react';
import { Sparkles, TrendingUp, Package, Clock, ShieldCheck, Flame } from 'lucide-react';

export const SocialProofSection: React.FC = () => {
  const cases = [
    {
      product: 'Copo Térmico 1.2L com Alça e Canudo',
      category: 'Fitness & Rotina',
      origin: 'Estoque SP (Chegou em 2 dias)',
      views: '184.000 views',
      sales: '192 pedidos',
      commission: 'R$ 3.840,00',
      badge: 'Oceano Azul Validado',
      badgeColor: 'bg-[#25F4EE]/10 text-[#25F4EE] border-[#25F4EE]/30',
      story: 'A amostra custou R$ 38 no fornecedor de SP. Com o gancho de 3 segundos gerado pelo TikBlox AI, o primeiro vídeo orgânico ultrapassou 100k views em 48h, batendo o ponto de equilíbrio na primeira hora.',
      hookUsed: '"O motivo pelo qual todo mundo na academia trocou a garrafa comum por este copo..."',
    },
    {
      product: 'Mini Seladora a Vácuo Portátil USB',
      category: 'Casa & Cozinha Prática',
      origin: 'Estoque SP (Pronta Entrega)',
      views: '96.000 views',
      sales: '118 pedidos',
      commission: 'R$ 2.124,00',
      badge: 'Break-Even em 2 Vendas',
      badgeColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
      story: 'Produto com concorrência zerada no feed brasileiro quando minerado pelo radar. Foram 3 vídeos curtos gravados na bancada da cozinha mostrando legumes selados.',
      hookUsed: '"Se você ainda fecha pacote de comida com pregador, precisa ver isso aqui..."',
    },
    {
      product: 'Lâmpada LED Sem Fio com Sensor',
      category: 'Decoração & Iluminação',
      origin: 'Estoque SP (Despacho 24h)',
      views: '240.000 views',
      sales: '235 pedidos',
      commission: 'R$ 4.512,00',
      badge: 'Viral de Alta Margem',
      badgeColor: 'bg-[#FE2C55]/10 text-[#FE2C55] border-[#FE2C55]/30',
      story: 'Comissão de 24% por unidade. Demonstração visual colando a fita magnética no armário escuro. O carrinho amarelo converteu 235 pedidos em 6 dias com saque Pix em D+7.',
      hookUsed: '"A melhor coisa que instalei no meu quarto por menos de cinquenta reais..."',
    },
  ];

  return (
    <section className="py-16 sm:py-24 px-4 sm:px-6 relative bg-[#090D16]">
      <div className="max-w-6xl mx-auto space-y-12">
        
        {/* Header da Seção */}
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-xs font-bold text-emerald-400">
            <Flame className="w-3.5 h-3.5" />
            <span>Casos Típicos de Sucesso</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
            Como Funciona a Assimetria na Prática
          </h2>
          <p className="text-xs sm:text-sm text-slate-300">
            Veja exemplos de oportunidades que foram mineradas no radar, receberam a amostra de SP e geraram comissões em tempo recorde:
          </p>
        </div>

        {/* Grid de Casos */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {cases.map((c, idx) => (
            <div
              key={idx}
              className="rounded-3xl bg-[#0F1424] border border-white/10 p-6 space-y-5 hover:border-[#25F4EE]/40 transition-all duration-300 flex flex-col justify-between shadow-xl group"
            >
              <div className="space-y-4">
                {/* Badge de status */}
                <div className="flex items-center justify-between gap-2">
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${c.badgeColor}`}>
                    {c.badge}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">
                    {c.category}
                  </span>
                </div>

                {/* Nome do produto */}
                <h3 className="text-base font-black text-white group-hover:text-[#25F4EE] transition">
                  {c.product}
                </h3>

                {/* Métricas-Chave */}
                <div className="grid grid-cols-2 gap-2 p-3 rounded-2xl bg-white/5 border border-white/5 font-mono text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Comissões:</span>
                    <span className="font-black text-emerald-400 text-sm">{c.commission}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Vendas:</span>
                    <span className="font-black text-white text-sm">{c.sales}</span>
                  </div>
                </div>

                {/* Descrição resumida */}
                <p className="text-xs text-slate-300 leading-relaxed">
                  {c.story}
                </p>

                {/* Gancho aplicado */}
                <div className="p-3 rounded-xl bg-[#25F4EE]/5 border border-[#25F4EE]/20 space-y-1">
                  <span className="text-[9px] font-mono uppercase font-black text-[#25F4EE] block tracking-wider">
                    Gancho de 3s Aplicado:
                  </span>
                  <p className="text-[11px] italic text-slate-200">
                    {c.hookUsed}
                  </p>
                </div>
              </div>

              {/* Selo de Entrega Rápida */}
              <div className="pt-3 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-400">
                <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
                  <Package className="w-3.5 h-3.5" />
                  <span>{c.origin}</span>
                </span>
                <span>{c.views}</span>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
