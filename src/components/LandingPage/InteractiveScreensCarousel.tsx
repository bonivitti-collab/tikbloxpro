// src/components/LandingPage/InteractiveScreensCarousel.tsx
// Carrossel Explicativo de Telas & Demonstração Guiada com Exemplos Reais do TIKBLOX PRO

import React, { useState, useEffect } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Sparkles,
  ShoppingBag,
  Package,
  ShieldCheck,
  Bot,
  Target,
  Zap,
  CheckCircle2,
  ExternalLink,
  Flame,
  ArrowRight,
  TrendingUp,
  DollarSign
} from 'lucide-react';

interface SlideData {
  id: string;
  badge: string;
  badgeColor: string;
  title: string;
  subtitle: string;
  description: string;
  highlights: string[];
  mockupType: 'radar' | 'terminal' | 'links' | 'copilot';
}

const SLIDES: SlideData[] = [
  {
    id: 'radar',
    badge: 'PAINEL 1: RADAR DE PRODUTOS',
    badgeColor: 'bg-[#25F4EE]/10 text-[#25F4EE] border-[#25F4EE]/30',
    title: '140+ Produtos Virais em Oceano Azul',
    subtitle: 'Varredura automatizada diária às 06:00 BRT com estoque em São Paulo',
    description:
      'Ao invés de tentar adivinhar o que vende, o radar filtra apenas itens com pronta entrega no Brasil, comissão de 15% a 35% e concorrência zerada no feed brasileiro.',
    highlights: [
      'Estoque confirmado em São Paulo (chega em 2 a 4 dias úteis)',
      'Menos de 10 vídeos publicados por criadores no Brasil',
      'Filtros por nicho: Beleza, Casa, Gadgets, Moda e Fitness',
      'Margem bruta e comissão líquida em R$ já calculadas',
    ],
    mockupType: 'radar',
  },
  {
    id: 'terminal',
    badge: 'PAINEL 2: RAIO-X & CONVICÇÃO',
    badgeColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    title: 'Terminal de Convicção & Break-Even Matemático',
    subtitle: 'Saiba o Ponto Zero exato para recuperar 100% da compra da amostra física',
    description:
      'Compre a amostra com recursos próprios com risco zero calculado. O terminal mostra o número exato de vendas necessárias para amortizar o produto.',
    highlights: [
      'Break-Even em apenas 3 a 5 vendas no feed',
      'Veredito objetivo: ENTRADA FORTE vs ENTRADA MODERADA',
      'Score de Convicção de 0 a 100 com assimetria de risco',
      'Projeção de retorno financeiro líquido em 20, 50 e 100 vendas',
    ],
    mockupType: 'terminal',
  },
  {
    id: 'links',
    badge: 'AÇÃO RÁPIDA: LINKS DIRETOS',
    badgeColor: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
    title: 'Links do TikTok Shop & Amostras Pronta Entrega',
    subtitle: 'Compre a amostra com envio em 24h e vincule o carrinho amarelo em 1 clique',
    description:
      'Agilidade máxima para criadores. Dois botões diretos: veja o item oficial na loja do TikTok e compre a amostra em São Paulo para gravar antes de todos.',
    highlights: [
      'Botão direto: Ver Produto oficial no TikTok Shop Brasil',
      'Botão direto: Comprar Amostra Pronta Entrega de SP (Mercado Livre/Shopee)',
      'Copiar Termo Oficial Homologado para a Vitrine móvel com 1 clique',
      'Copiar Gancho Magnético dos primeiros 3 segundos para o roteiro',
    ],
    mockupType: 'links',
  },
  {
    id: 'copilot',
    badge: 'PAINEL 3: TIKBLOX AI',
    badgeColor: 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30',
    title: 'Copiloto IA Gemini 3.8 Flash Nativo',
    subtitle: 'Roteiros magnéticos de 30 segundos e ganchos virais que travam o scroll',
    description:
      'Inteligência artificial generativa de alta velocidade especializada no algoritmo do TikTok Shop Brasil. Escreve roteiros que convertem e calcula unit economics.',
    highlights: [
      'Roteiros estruturados: Gancho (3s), Demonstração (15s) e Chamada p/ Carrinho (12s)',
      'Tabelas comparativas e simulações de lucro líquido instantâneas',
      'Orientações táticas para transmissões de Live Commerce',
      'Tira-dúvidas sobre regras de saque Pix (D+7) e afiliação no app',
    ],
    mockupType: 'copilot',
  },
];

interface InteractiveScreensCarouselProps {
  onSelectPlan?: () => void;
}

export const InteractiveScreensCarousel: React.FC<InteractiveScreensCarouselProps> = ({
  onSelectPlan,
}) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? SLIDES.length - 1 : prev - 1));
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev === SLIDES.length - 1 ? 0 : prev + 1));
  };

  const handlePlanClick = () => {
    if (onSelectPlan) {
      onSelectPlan();
    } else {
      const el = document.getElementById('pricing');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const slide = SLIDES[currentSlide];

  return (
    <div className="w-full max-w-6xl mx-auto space-y-8 select-none">
      
      {/* Abas Superiores de Navegação das Telas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {SLIDES.map((s, idx) => (
          <button
            key={s.id}
            type="button"
            onClick={() => setCurrentSlide(idx)}
            className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-1.5 ${
              currentSlide === idx
                ? 'bg-white/10 border-[#25F4EE] shadow-[0_0_20px_rgba(37,244,238,0.2)]'
                : 'bg-white/5 border-white/10 hover:bg-white/[0.08] text-slate-400'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
                0{idx + 1}
              </span>
              <span
                className={`w-2 h-2 rounded-full ${
                  currentSlide === idx ? 'bg-[#25F4EE] animate-pulse' : 'bg-white/20'
                }`}
              />
            </div>
            <span
              className={`text-xs font-bold truncate ${
                currentSlide === idx ? 'text-white' : 'text-slate-300'
              }`}
            >
              {idx === 0
                ? 'Radar de Produtos'
                : idx === 1
                ? 'Raio-X & Break-Even'
                : idx === 2
                ? 'Links & Amostras SP'
                : 'Copiloto IA Gemini'}
            </span>
          </button>
        ))}
      </div>

      {/* Caixa Principal do Slide Ativo (Layout Split: Informações + Mockup Visual) */}
      <div className="rounded-3xl bg-gradient-to-b from-[#141A29] to-[#0A0D17] border border-white/15 p-6 sm:p-10 shadow-2xl relative overflow-hidden">
        
        {/* Glow de fundo */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#25F4EE]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
          
          {/* Coluna Esquerda: Texto Explicativo e Benefícios (5 colunas) */}
          <div className="lg:col-span-5 space-y-5 text-left">
            
            <div className="space-y-2">
              <div
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-mono font-black uppercase tracking-wider border ${slide.badgeColor}`}
              >
                <span>{slide.badge}</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-black text-white leading-tight">
                {slide.title}
              </h3>
              <p className="text-xs text-[#25F4EE] font-bold">
                {slide.subtitle}
              </p>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              {slide.description}
            </p>

            {/* Destaques / Bullets */}
            <ul className="space-y-2.5 pt-2 border-t border-white/10 text-xs text-slate-200">
              {slide.highlights.map((h, i) => (
                <li key={i} className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#25F4EE] shrink-0 mt-0.5" />
                  <span className="leading-snug">{h}</span>
                </li>
              ))}
            </ul>

            {/* Botões de Ação do Slide */}
            <div className="pt-3 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={handlePlanClick}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#25F4EE] to-[#00D2C4] hover:brightness-105 text-[#0F121C] font-black text-xs transition cursor-pointer flex items-center gap-2 active:scale-95 shadow-md shadow-[#25F4EE]/20 group"
              >
                <span>Quero Desbloquear Esse Painel</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </button>

              <span className="text-[11px] text-slate-400 font-mono hidden sm:inline">
                Tela {currentSlide + 1} de {SLIDES.length}
              </span>
            </div>

          </div>

          {/* Coluna Direita: Mockup Visual Fiel da Tela Real do TikBlox (7 colunas) */}
          <div className="lg:col-span-7">
            <div className="rounded-2xl border border-white/15 bg-[#090D16] shadow-2xl overflow-hidden text-left relative">
              
              {/* Barra de Título do Mockup (Estilo Navegador/Terminal) */}
              <div className="px-4 py-3 bg-[#0F1424] border-b border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-rose-500/80" />
                  <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                  <span className="ml-2 text-[10px] font-mono text-slate-400">
                    tikblox.pro/terminal/{slide.id}
                  </span>
                </div>
                <span className="text-[9px] font-mono uppercase font-black px-2 py-0.5 rounded bg-white/5 text-slate-300">
                  Ao Vivo
                </span>
              </div>

              {/* Corpo do Mockup Conforme o Slide */}
              <div className="p-4 sm:p-5 text-xs text-white min-h-[360px] flex flex-col justify-center">
                
                {/* 1. MOCKUP: RADAR DE PRODUTOS */}
                {slide.mockupType === 'radar' && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-white/10">
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold uppercase">Varredura Diária</span>
                        <h4 className="text-sm font-black text-white">140 Produtos Catalogados</h4>
                      </div>
                      <span className="text-[10px] font-mono font-bold px-2 py-1 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                        06:00 BRT • Atualizado
                      </span>
                    </div>

                    {/* Exemplo de 3 cards da lista */}
                    <div className="space-y-2">
                      {[
                        {
                          name: 'Mini Seladora Térmica Portátil 2 em 1',
                          price: 'R$ 29,90',
                          comm: 'R$ 8,97 (30%)',
                          videos: '4 vídeos no BR',
                          badge: 'Oceano Azul',
                        },
                        {
                          name: 'Limpador Ultrassônico de Jóias & Óculos',
                          price: 'R$ 69,90',
                          comm: 'R$ 17,47 (25%)',
                          videos: '7 vídeos no BR',
                          badge: 'Pronta Entrega SP',
                        },
                        {
                          name: 'Escova Secadora de Cabelos Íons Negativos',
                          price: 'R$ 89,90',
                          comm: 'R$ 25,17 (28%)',
                          videos: '5 vídeos no BR',
                          badge: 'Oceano Azul',
                        },
                      ].map((item, i) => (
                        <div
                          key={i}
                          className="p-3 rounded-xl bg-white/5 border border-white/10 hover:border-[#25F4EE]/50 transition flex items-center justify-between gap-3"
                        >
                          <div className="space-y-1 min-w-0">
                            <span className="text-[10px] text-[#25F4EE] font-mono font-bold block truncate">
                              {item.badge} • Estoque São Paulo
                            </span>
                            <p className="font-bold text-xs text-white truncate">{item.name}</p>
                            <span className="text-[11px] text-slate-400">
                              Venda: <strong className="text-white">{item.price}</strong> | Comissão:{' '}
                              <strong className="text-emerald-400">{item.comm}</strong>
                            </span>
                          </div>
                          <span className="text-[10px] font-mono font-bold px-2 py-1 rounded bg-white/10 text-slate-200 shrink-0">
                            {item.videos}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 2. MOCKUP: TERMINAL DE RAIO-X & BREAK-EVEN */}
                {slide.mockupType === 'terminal' && (
                  <div className="space-y-3.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                        🟢 ENTRADA FORTE (COMPRA DE AMOSTRA VALIDADA)
                      </span>
                      <span className="text-xs font-mono font-black text-[#25F4EE]">Convicção 94/100</span>
                    </div>

                    <h4 className="text-sm font-black text-white">
                      Mini Seladora Térmica Portátil 2 em 1 (Pronta Entrega SP)
                    </h4>

                    {/* Os 4 Pilares Financeiros */}
                    <div className="grid grid-cols-2 gap-2 text-left">
                      <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">Custo da Amostra</span>
                        <span className="text-base font-black text-white font-mono">R$ 29,90</span>
                        <span className="text-[9px] text-slate-400 block">Chega em 2 a 4 dias úteis</span>
                      </div>
                      <div className="p-2.5 rounded-xl bg-emerald-950/30 border border-emerald-500/30">
                        <span className="text-[10px] uppercase font-bold text-emerald-400 block">Comissão por Venda</span>
                        <span className="text-base font-black text-emerald-400 font-mono">R$ 8,97 (30%)</span>
                        <span className="text-[9px] text-emerald-300/80 block">Líquida no seu bolso</span>
                      </div>
                      <div className="p-2.5 rounded-xl bg-cyan-950/30 border border-[#25F4EE]/30">
                        <span className="text-[10px] uppercase font-bold text-[#25F4EE] block">Ponto Zero (Break-Even)</span>
                        <span className="text-base font-black text-white font-mono">4 vendas</span>
                        <span className="text-[9px] text-[#25F4EE] block">Risco 100% zerado</span>
                      </div>
                      <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">Vídeos no Feed BR</span>
                        <span className="text-base font-black text-white font-mono">~4 vídeos</span>
                        <span className="text-[9px] text-emerald-400 block">Oceano Azul Absoluto</span>
                      </div>
                    </div>

                    <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-[11px] text-slate-300 italic">
                      "Com modestas 5.000 visualizações no TikTok você faz de 15 a 30 vendas, recupera a amostra e lucra R$ 100+ no primeiro vídeo."
                    </div>
                  </div>
                )}

                {/* 3. MOCKUP: LINKS DIRETOS & BOTÕES DE AÇÃO */}
                {slide.mockupType === 'links' && (
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <span className="text-[10px] font-mono text-[#25F4EE] uppercase font-bold block">
                        Ação Rápida Para o Criador
                      </span>
                      <h4 className="text-sm font-black text-white">
                        Mini Seladora Térmica Portátil 2 em 1
                      </h4>
                      <p className="text-[11px] text-slate-400">
                        Termo de busca oficial homologado:{' '}
                        <code className="text-[#25F4EE] bg-white/10 px-1 py-0.5 rounded font-mono">
                          Mini Seladora Termica Portatil SP
                        </code>
                      </p>
                    </div>

                    {/* Os Botões de Ação em Destaque */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                      <div className="p-3 rounded-xl bg-[#0F121C] border border-[#25F4EE]/40 flex items-center justify-between shadow-md">
                        <div className="flex items-center gap-2">
                          <ShoppingBag className="w-4 h-4 text-[#25F4EE]" />
                          <div>
                            <span className="text-xs font-black text-white block">Ver no TikTok Shop</span>
                            <span className="text-[10px] text-slate-400">Página oficial homologada</span>
                          </div>
                        </div>
                        <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                      </div>

                      <div className="p-3 rounded-xl bg-gradient-to-r from-emerald-600/30 to-teal-600/30 border border-emerald-500/40 flex items-center justify-between shadow-md">
                        <div className="flex items-center gap-2">
                          <Package className="w-4 h-4 text-emerald-400" />
                          <div>
                            <span className="text-xs font-black text-white block">Comprar Amostra (SP)</span>
                            <span className="text-[10px] text-emerald-300">Despacho 24h Mercado Livre</span>
                          </div>
                        </div>
                        <ExternalLink className="w-3.5 h-3.5 text-emerald-400" />
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Zap className="w-4 h-4 text-amber-400" />
                        <span className="text-xs font-bold text-slate-200">
                          Gancho Viral 3s: "Para de jogar comida fora só porque o pacote abriu..."
                        </span>
                      </div>
                      <span className="text-[10px] font-mono text-[#25F4EE] bg-[#25F4EE]/10 px-2 py-0.5 rounded font-bold">
                        Copiar 1-Clique
                      </span>
                    </div>
                  </div>
                )}

                {/* 4. MOCKUP: COPILOTO IA GEMINI 3.8 FLASH */}
                {slide.mockupType === 'copilot' && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-white/10">
                      <div className="flex items-center gap-1.5">
                        <Bot className="w-4 h-4 text-[#25F4EE]" />
                        <span className="text-xs font-black text-white">TIKBLOX AI Copilot</span>
                      </div>
                      <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded-full font-bold">
                        Gemini 3.8 Flash • Ativo
                      </span>
                    </div>

                    {/* Mensagem da IA formatada */}
                    <div className="p-3 rounded-2xl bg-white/5 border border-white/10 space-y-2 text-[11px] leading-relaxed">
                      <p className="font-bold text-[#25F4EE]">
                        Roteiro Técnico Viral (30 Segundos para Fechar no Carrinho):
                      </p>
                      <ul className="space-y-1 text-slate-300 pl-2">
                        <li>
                          <strong>0s - 3s (Gancho Visual):</strong> Mostre um pacote de biscoito caindo e esparramando, e no mesmo segundo corte selando a embalagem hermeticamente.
                        </li>
                        <li>
                          <strong>3s - 18s (Dor & Demonstração):</strong> "Toda vez que você abre salgadinho ele murcha no dia seguinte? Essa mini seladora térmica de bolso fecha qualquer plástico em 2 segundos."
                        </li>
                        <li>
                          <strong>18s - 30s (CTA Carrinho Amarelo):</strong> "O lojista nacional colocou estoque com frete grátis aqui no carrinho amarelo do vídeo. Garanta a sua antes de acabar."
                        </li>
                      </ul>

                      <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[10px] font-mono text-slate-400">
                        <span>Simulação: 50 vendas = <strong>R$ 448,50 de lucro líquido</strong></span>
                        <span className="text-[#25F4EE]">D+7 Saque Pix</span>
                      </div>
                    </div>
                  </div>
                )}

              </div>

            </div>
          </div>

        </div>

      </div>

      {/* Controles de Navegação: Setas Anterior e Próximo + Indicadores */}
      <div className="flex items-center justify-between px-2 pt-2">
        <button
          type="button"
          onClick={prevSlide}
          className="p-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold text-xs transition cursor-pointer flex items-center gap-2 active:scale-95"
        >
          <ChevronLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Tela Anterior</span>
        </button>

        {/* Indicadores de Bolinhas */}
        <div className="flex items-center gap-2">
          {SLIDES.map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setCurrentSlide(idx)}
              className={`h-2.5 rounded-full transition-all cursor-pointer ${
                currentSlide === idx ? 'w-8 bg-[#25F4EE]' : 'w-2.5 bg-white/20 hover:bg-white/40'
              }`}
              title={`Ir para a tela ${idx + 1}`}
            />
          ))}
        </div>

        <button
          type="button"
          onClick={nextSlide}
          className="p-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold text-xs transition cursor-pointer flex items-center gap-2 active:scale-95"
        >
          <span className="hidden sm:inline">Próxima Tela</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

    </div>
  );
};
