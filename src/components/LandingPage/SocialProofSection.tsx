import React from 'react';
import { Search, ShoppingBag, Calculator } from 'lucide-react';

const points = [
  {
    icon: Search,
    title: 'Lista do que foi coletado',
    body: 'O radar mostra produtos do TikTok Shop Brasil que a coleta do dia trouxe. Quando a contagem de vídeos não veio, o card fica sem score. Não completamos esse número.',
  },
  {
    icon: ShoppingBag,
    title: 'Preço em faixa, não um valor fechado',
    body: 'O mesmo anúncio muda de preço com cupom, promoção e vendedor. O card mostra a faixa coletada e avisa a data. Você digita o preço que está vendo agora no TikTok.',
  },
  {
    icon: Calculator,
    title: 'Comissão e ponto de equilíbrio',
    body: 'Se a taxa de comissão veio na coleta, ela aparece em faixa. A conta de equilíbrio usa o menor preço dessa faixa, ou o preço que você informou.',
  },
];

export const SocialProofSection: React.FC = () => {
  return (
    <section className="py-16 sm:py-24 px-4 sm:px-6 relative bg-[#090D16]">
      <div className="max-w-6xl mx-auto space-y-10">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
            O que o radar faz
          </h2>
          <p className="text-xs sm:text-sm text-slate-300">
            O TikBlox não publica resultado de cliente, faturamento nem depoimento. Abaixo está o que a ferramenta mostra.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {points.map((point) => (
            <article key={point.title} className="rounded-3xl bg-[#0F1424] border border-white/10 p-6 space-y-3">
              <point.icon className="w-5 h-5 text-[#25F4EE]" />
              <h3 className="text-base font-black text-white">{point.title}</h3>
              <p className="text-xs text-slate-300 leading-relaxed">{point.body}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};
