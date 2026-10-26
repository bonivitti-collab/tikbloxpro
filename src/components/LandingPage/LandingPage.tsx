// src/components/LandingPage/LandingPage.tsx
// Landing Page Institucional de Alta Conversão do TIKBLOX PRO
// Otimizada com Padrões Avançados de UI/UX, Navegação Fluida e Interatividade

import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Bot,
  ShieldCheck,
  Package,
  TrendingUp,
  Target,
  Zap,
  ArrowRight,
  Check,
  ChevronDown,
  ShoppingBag,
  ExternalLink,
  Lock,
  Layers,
  Flame,
  Clock,
  DollarSign,
  HelpCircle,
  CheckCircle2,
  Menu,
  X,
  ChevronUp,
} from 'lucide-react';
import { getKiwifyCheckoutUrls } from '../../services/authService';
import { InteractiveScreensCarousel } from './InteractiveScreensCarousel';
import { ProfitSimulator } from './ProfitSimulator';
import { SocialProofSection } from './SocialProofSection';

interface LandingPageProps {
  onOpenLogin: () => void;
  isLoggedIn?: boolean;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onOpenLogin,
  isLoggedIn = false,
}) => {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showFloatingCta, setShowFloatingCta] = useState(false);
  const [floatingCtaDismissed, setFloatingCtaDismissed] = useState(false);
  const [countdown, setCountdown] = useState<string>('00h 00m 00s');

  const checkoutUrls = getKiwifyCheckoutUrls();

  // Contador regressivo em tempo real até a próxima varredura das 06:00 BRT (09:00 UTC)
  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      // Converte para horário de Brasília (UTC-3)
      const brtHours = (now.getUTCHours() - 3 + 24) % 24;
      const brtMinutes = now.getUTCMinutes();
      const brtSeconds = now.getUTCSeconds();

      const targetHours = 6;
      let diffSeconds = (targetHours - brtHours) * 3600 - brtMinutes * 60 - brtSeconds;
      if (diffSeconds <= 0) {
        diffSeconds += 24 * 3600;
      }

      const h = Math.floor(diffSeconds / 3600);
      const m = Math.floor((diffSeconds % 3600) / 60);
      const s = diffSeconds % 60;
      setCountdown(
        `${String(h).padStart(2, '0')}h ${String(m).padStart(2, '0')}m ${String(s).padStart(2, '0')}s`
      );
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, []);

  // Monitora scroll para exibir o Floating Action Bar e o botão de voltar ao topo
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 480) {
        setShowFloatingCta(true);
      } else {
        setShowFloatingCta(false);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const scrollToPricing = () => {
    setMobileMenuOpen(false);
    const el = document.getElementById('pricing');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollToSection = (id: string) => {
    setMobileMenuOpen(false);
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#090D16] text-white selection:bg-[#25F4EE] selection:text-[#090D16] font-sans antialiased overflow-x-hidden">
      
      {/* ========================================================= */}
      {/* 1. NAVBAR INSTITUCIONAL RESPONSIVA                         */}
      {/* ========================================================= */}
      <header className="fixed top-0 left-0 right-0 z-40 bg-[#090D16]/90 backdrop-blur-md border-b border-white/10 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between">
          
          {/* Logo TikBlox Oficial */}
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              scrollToTop();
            }}
            className="flex items-center gap-2 group cursor-pointer"
            title="TIKBLOX PRO"
          >
            <img
              src="/tikblox-logo.png"
              alt="TIKBLOX PRO - TikTok Shop Brasil Radar"
              className="h-8 sm:h-10 w-auto object-contain transition-transform duration-200 group-hover:scale-105"
            />
          </a>

          {/* Navegação Desktop */}
          <nav className="hidden lg:flex items-center gap-6 text-xs font-bold text-slate-300">
            <button onClick={() => scrollToSection('demonstracao')} className="hover:text-[#25F4EE] transition cursor-pointer">
              Como Funciona
            </button>
            <button onClick={() => scrollToSection('diferencial')} className="hover:text-white transition cursor-pointer">
              Oceano Azul
            </button>
            <button onClick={() => scrollToSection('simulador')} className="hover:text-[#25F4EE] transition cursor-pointer flex items-center gap-1">
              <span>Simulador de Lucro</span>
              <span className="px-1.5 py-0.2 rounded bg-[#25F4EE]/10 text-[9px] text-[#25F4EE] border border-[#25F4EE]/30">NOVO</span>
            </button>
            <button onClick={() => scrollToSection('pilares')} className="hover:text-white transition cursor-pointer">
              Pronta Entrega SP
            </button>
            <button onClick={() => scrollToSection('pricing')} className="hover:text-[#25F4EE] transition cursor-pointer">
              Planos & Preços
            </button>
            <button onClick={() => scrollToSection('faq')} className="hover:text-white transition cursor-pointer">
              Dúvidas
            </button>
          </nav>

          {/* Ações / Login */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={onOpenLogin}
              className="px-3.5 py-2 rounded-xl text-xs font-bold text-slate-200 hover:text-white hover:bg-white/5 transition cursor-pointer border border-transparent hover:border-white/10 flex items-center gap-1.5"
            >
              {isLoggedIn ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Acessar Meu Painel</span>
                </>
              ) : (
                'Já sou assinante'
              )}
            </button>

            <button
              onClick={scrollToPricing}
              className="hidden sm:inline-flex px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl bg-gradient-to-r from-[#25F4EE] to-[#00D2C4] hover:brightness-105 text-[#0F121C] font-black text-xs transition cursor-pointer shadow-[0_0_20px_rgba(37,244,238,0.3)] active:scale-95 whitespace-nowrap"
            >
              Começar Agora
            </button>

            {/* Botão Hambúrguer Mobile */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl bg-white/5 border border-white/10 text-slate-300 hover:text-white cursor-pointer"
              aria-label="Abrir menu de navegação"
            >
              {mobileMenuOpen ? <X className="w-5 h-5 text-[#25F4EE]" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

        </div>

        {/* Menu Dropdown Mobile com Transição Fluida */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-[#0C101C] border-b border-white/10 px-4 py-5 space-y-4 animate-in slide-in-from-top-2 duration-200">
            <nav className="flex flex-col space-y-3 text-sm font-bold text-slate-200">
              <button
                onClick={() => scrollToSection('demonstracao')}
                className="text-left py-2 px-3 rounded-lg hover:bg-white/5 hover:text-[#25F4EE] transition"
              >
                📱 Como Funciona (Telas do Sistema)
              </button>
              <button
                onClick={() => scrollToSection('diferencial')}
                className="text-left py-2 px-3 rounded-lg hover:bg-white/5 hover:text-white transition"
              >
                🌊 Método Oceano Azul vs Tradicional
              </button>
              <button
                onClick={() => scrollToSection('simulador')}
                className="text-left py-2 px-3 rounded-lg hover:bg-white/5 hover:text-[#25F4EE] transition flex items-center justify-between"
              >
                <span>🧮 Simulador de Lucro Líquido</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-[#25F4EE]/20 text-[#25F4EE] font-mono">NOVO</span>
              </button>
              <button
                onClick={() => scrollToSection('pilares')}
                className="text-left py-2 px-3 rounded-lg hover:bg-white/5 hover:text-white transition"
              >
                📦 Pronta Entrega São Paulo
              </button>
              <button
                onClick={() => scrollToSection('pricing')}
                className="text-left py-2 px-3 rounded-lg hover:bg-white/5 hover:text-[#25F4EE] transition"
              >
                💎 Planos & Preços Kiwify
              </button>
              <button
                onClick={() => scrollToSection('faq')}
                className="text-left py-2 px-3 rounded-lg hover:bg-white/5 hover:text-white transition"
              >
                ❓ Dúvidas Frequentes
              </button>
            </nav>

            <button
              onClick={scrollToPricing}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#25F4EE] to-[#00D2C4] text-[#0F121C] font-black text-xs uppercase tracking-wider text-center shadow-lg shadow-[#25F4EE]/20 block"
            >
              Quero Acessar o Radar por R$ 37/mês
            </button>
          </div>
        )}
      </header>

      {/* ========================================================= */}
      {/* 2. HERO SECTION COM PROPOSTA DE VALOR MATADORA            */}
      {/* ========================================================= */}
      <section className="relative pt-28 sm:pt-40 pb-16 sm:pb-24 px-4 sm:px-6 overflow-hidden">
        
        {/* Efeitos de Luz de Fundo */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-gradient-to-tr from-[#25F4EE]/15 to-[#FE2C55]/15 rounded-full blur-[120px] pointer-events-none" />

        <div className="max-w-5xl mx-auto text-center space-y-6 relative z-10">
          
          {/* Badge de Destaque com Contador Dinâmico das 06:00 BRT */}
          <div className="inline-flex flex-wrap items-center justify-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-xs font-semibold text-slate-200 shadow-2xs backdrop-blur-md max-w-full">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#25F4EE] opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#25F4EE]" />
            </span>
            <span className="text-[#25F4EE] font-black uppercase">VARREDURA 06:00 BRT CONCLUÍDA</span>
            <span className="hidden sm:inline text-slate-500">•</span>
            <span className="hidden sm:inline">140+ Oportunidades Pronta Entrega SP</span>
            <span className="hidden md:inline text-slate-500">•</span>
            <span className="hidden md:inline font-mono text-emerald-400 font-bold">
              Próxima em: {countdown}
            </span>
          </div>

          {/* Título Principal */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.15] text-white">
            Descubra Produtos Virais em <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-[#25F4EE] via-[#00D2C4] to-[#25F4EE] bg-clip-text text-transparent">
              Oceano Azul no TikTok Shop
            </span> <br />
            Antes da Concorrência.
          </h1>

          {/* Subtítulo persuasivo */}
          <p className="text-sm sm:text-lg text-slate-300 max-w-3xl mx-auto leading-relaxed">
            Identifique produtos validados com estoque nacional em São Paulo (chega em 2 a 4 dias), concorrência zerada (&lt; 10 vídeos no feed BR), ponto de equilíbrio em 3 vendas e <strong>Copiloto IA para gerar ganchos virais de 3 segundos</strong>.
          </p>

          {/* Botão de Ação Hero Principal */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <button
              onClick={scrollToPricing}
              className="w-full sm:w-auto px-10 py-5 rounded-2xl bg-gradient-to-r from-[#25F4EE] via-[#00D2C4] to-[#25F4EE] hover:brightness-110 text-[#090D16] font-black text-base sm:text-lg uppercase tracking-wider transition cursor-pointer shadow-[0_12px_40px_rgba(37,244,238,0.45)] active:scale-95 flex items-center justify-center gap-3 group"
            >
              <span>Quero Minerar Produtos Vencedores Agora</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1.5 transition-transform" />
            </button>
          </div>

          {/* Selos de Garantia e Confiança */}
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs text-slate-400 pt-1 font-medium">
            <span className="flex items-center gap-1.5 text-slate-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Acesso Imediato ao Radar</span>
            </span>
            <span className="hidden sm:inline text-slate-600">•</span>
            <span className="flex items-center gap-1.5 text-slate-300">
              <ShieldCheck className="w-4 h-4 text-[#25F4EE]" />
              <span>Checkout Seguro Kiwify</span>
            </span>
            <span className="hidden sm:inline text-slate-600">•</span>
            <span className="flex items-center gap-1.5 text-slate-300">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Garantia Incondicional de 7 Dias</span>
            </span>
          </div>

          {/* Selos dos 4 Pilares Principais em Cards Interativos */}
          <div className="pt-8 grid grid-cols-2 sm:grid-cols-4 gap-3 text-left max-w-4xl mx-auto">
            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-1 hover:border-emerald-500/40 transition">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Estoque Local</span>
              <span className="text-xs font-black text-white flex items-center gap-1.5">
                <Package className="w-3.5 h-3.5 text-emerald-400" />
                <span>Pronta Entrega SP</span>
              </span>
              <span className="text-[10px] text-slate-400 block font-mono">2 a 4 dias na sua casa</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-1 hover:border-[#25F4EE]/40 transition">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Concorrência</span>
              <span className="text-xs font-black text-white flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-[#25F4EE]" />
                <span>&lt; 10 Vídeos no Feed</span>
              </span>
              <span className="text-[10px] text-slate-400 block font-mono">Vácuo de conteúdo</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-1 hover:border-amber-500/40 transition">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Risco Mínimo</span>
              <span className="text-xs font-black text-white flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5 text-amber-400" />
                <span>Break-Even 3 Vendas</span>
              </span>
              <span className="text-[10px] text-slate-400 block font-mono">Retorno ultra rápido</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-1 hover:border-[#FE2C55]/40 transition">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Inteligência</span>
              <span className="text-xs font-black text-white flex items-center gap-1.5">
                <Bot className="w-3.5 h-3.5 text-[#FE2C55]" />
                <span>TikBlox AI Pro</span>
              </span>
              <span className="text-[10px] text-slate-400 block font-mono">Roteiros de 30s prontos</span>
            </div>
          </div>

        </div>

      </section>

      {/* ========================================================= */}
      {/* 2.5 CARROSSEL EXPLICATIVO DE TELAS DO TIKBLOX PRO         */}
      {/* ========================================================= */}
      <section id="demonstracao" className="py-12 sm:py-20 px-4 sm:px-6 relative border-t border-white/5 bg-[#090D16] scroll-mt-24">
        <div className="max-w-6xl mx-auto space-y-8 text-center">
          <div className="space-y-3 max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#25F4EE]/10 border border-[#25F4EE]/30 text-xs font-bold text-[#25F4EE]">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Tour Visual Interativo</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-black text-white">
              Conheça as Telas do TikBlox Pro por Dentro
            </h2>
            <p className="text-xs sm:text-sm text-slate-300">
              Passe o carrossel abaixo e veja exatamente como o radar, o raio-x financeiro e o copiloto funcionam antes de assinar:
            </p>
          </div>

          <InteractiveScreensCarousel onSelectPlan={scrollToPricing} />
        </div>
      </section>

      {/* ========================================================= */}
      {/* 3. O GRANDE DIFERENCIAL: O ERRO COMUM VS O MÉTODO TIKBLOX  */}
      {/* ========================================================= */}
      <section id="diferencial" className="py-20 px-4 sm:px-6 bg-[#0E1322] border-y border-white/5 scroll-mt-24">
        <div className="max-w-6xl mx-auto space-y-12">
          
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <h2 className="text-xs font-mono font-black uppercase tracking-widest text-[#25F4EE]">
              Por que a maioria dos criadores falha no TikTok Shop?
            </h2>
            <h3 className="text-2xl sm:text-4xl font-black text-white">
              O Segredo está na Velocidade de Envio e no Vácuo de Conteúdo
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* O Jeito Tradicional e Errado */}
            <div className="p-6 sm:p-8 rounded-3xl bg-rose-950/20 border border-rose-500/20 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 text-xs font-bold">
                ❌ O Jeito Tradicional (Perda de Tempo e Dinheiro)
              </div>
              <h4 className="text-lg font-black text-white">Esperando da China e Copiando Produtos Saturados</h4>
              <ul className="space-y-3 text-xs text-slate-300">
                <li className="flex items-start gap-2">
                  <span className="text-rose-400 font-bold shrink-0">•</span>
                  <span><strong>20 a 30 dias para a amostra chegar:</strong> Quando o produto chega na sua casa, o produto já explodiu e morreu.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-rose-400 font-bold shrink-0">•</span>
                  <span><strong>Feed abarrotado de criadores:</strong> Mais de 300 pessoas já postaram com o mesmo carrinho amarelo, derrubando o alcance.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-rose-400 font-bold shrink-0">•</span>
                  <span><strong>Sem métricas de Break-Even:</strong> Você compra amostras caras sem saber com quantas vendas recupera o investimento.</span>
                </li>
              </ul>
            </div>

            {/* O Jeito TikBlox Pro */}
            <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-[#25F4EE]/10 to-[#007A87]/15 border border-[#25F4EE]/30 space-y-4 relative overflow-hidden shadow-xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#25F4EE]/20 text-[#25F4EE] text-xs font-bold">
                ✅ O Método TikBlox Pro (Alta Assimetria de Lucro)
              </div>
              <h4 className="text-lg font-black text-white">Pronta Entrega em São Paulo + Oceano Azul</h4>
              <ul className="space-y-3 text-xs text-slate-200">
                <li className="flex items-start gap-2">
                  <span className="text-[#25F4EE] font-bold shrink-0">✓</span>
                  <span><strong>Despacho em 24h/48h de SP:</strong> A amostra chega em 2 a 4 dias na sua casa. Você grava antes de 99% da internet.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#25F4EE] font-bold shrink-0">✓</span>
                  <span><strong>Oceano Azul (&lt; 10 vídeos no feed BR):</strong> Vácuo de conteúdo. O algoritmo do TikTok entrega visualizações massivas porque há procura e pouca oferta.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#25F4EE] font-bold shrink-0">✓</span>
                  <span><strong>Risco 100% calculado:</strong> Ponto zero garantido em 3 a 5 vendas. Lucro líquido limpo no seu bolso.</span>
                </li>
              </ul>
            </div>

          </div>

        </div>
      </section>

      {/* ========================================================= */}
      {/* 3.5 SIMULADOR INTERATIVO DE LUCRO LÍQUIDO                  */}
      {/* ========================================================= */}
      <ProfitSimulator onSelectPlan={scrollToPricing} />

      {/* ========================================================= */}
      {/* 4. OS 4 PILARES DA PLATAFORMA                            */}
      {/* ========================================================= */}
      <section id="pilares" className="py-20 px-4 sm:px-6 scroll-mt-24">
        <div className="max-w-6xl mx-auto space-y-12">
          
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <h2 className="text-xs font-mono font-black uppercase tracking-widest text-[#25F4EE]">
              Tecnologia de Ponta a Ponta
            </h2>
            <h3 className="text-2xl sm:text-4xl font-black text-white">
              Tudo o que você precisa para faturar no TikTok Shop
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Pilar 1 */}
            <div className="p-6 rounded-3xl bg-white/5 border border-white/10 space-y-3 hover:border-[#25F4EE]/50 transition group">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#25F4EE] to-[#00D2C4] text-[#0F121C] flex items-center justify-center font-black text-xl shadow-md">
                ⚡
              </div>
              <h4 className="text-base font-black text-white group-hover:text-[#25F4EE] transition">
                1. Radar Diário Automatizado (06:00 BRT)
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Varredura diária no catálogo brasileiro. Você acorda às 06:00 com o radar atualizado, sem itens saturados ou caros demais.
              </p>
            </div>

            {/* Pilar 2 */}
            <div className="p-6 rounded-3xl bg-white/5 border border-white/10 space-y-3 hover:border-emerald-500/50 transition group">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-600 text-white flex items-center justify-center font-black text-xl shadow-md">
                📦
              </div>
              <h4 className="text-base font-black text-white group-hover:text-emerald-400 transition">
                2. Links Diretos de Amostra & Vitrine
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Botões diretos para comprar a amostra com envio de São Paulo e copiar o termo oficial homologado do carrinho amarelo em 1 clique.
              </p>
            </div>

            {/* Pilar 3 */}
            <div className="p-6 rounded-3xl bg-white/5 border border-white/10 space-y-3 hover:border-[#FE2C55]/50 transition group">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#FE2C55] to-[#FF0050] text-white flex items-center justify-center font-black text-xl shadow-md">
                🤖
              </div>
              <h4 className="text-base font-black text-white group-hover:text-[#FE2C55] transition">
                3. Copiloto TikBlox AI Pro
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Inteligência nativa que cria roteiros completos de 30 segundos, ganchos visuais para os primeiros 3s e simulações financeiras em segundos.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* ========================================================= */}
      {/* 4.5 CASOS REAIS DE SUCESSO & ASSIMETRIA                    */}
      {/* ========================================================= */}
      <SocialProofSection />

      {/* ========================================================= */}
      {/* 5. TABELA DE PREÇOS (CHECKOUT KIWIFY)                      */}
      {/* ========================================================= */}
      <section id="pricing" className="py-20 px-4 sm:px-6 bg-[#0E1322] border-t border-white/5 scroll-mt-24">
        <div className="max-w-5xl mx-auto space-y-12">
          
          <div className="text-center space-y-3 max-w-xl mx-auto">
            <h2 className="text-xs font-mono font-black uppercase tracking-widest text-[#25F4EE]">
              Planos Transparentes & Sem Fidelidade
            </h2>
            <h3 className="text-2xl sm:text-4xl font-black text-white">
              Escolha o seu plano e comece a minerar hoje
            </h3>
            <p className="text-xs text-slate-400">
              Cancele quando quiser com apenas 1 clique. Acesso imediato pelo e-mail da compra.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto items-stretch">
            
            {/* PLANO 1: RADAR ESSENTIAL */}
            <div className="p-7 sm:p-8 rounded-3xl bg-[#0F121C] border border-white/10 flex flex-col justify-between space-y-6 hover:border-white/20 transition">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 text-slate-300 text-xs font-bold">
                  Plano Radar
                </div>
                <div>
                  <h4 className="text-xl font-black text-white">Radar Essential</h4>
                  <p className="text-xs text-slate-400 mt-1">
                    Para quem deseja apenas minerar os produtos virais com pronta entrega nacional.
                  </p>
                </div>

                <div className="pt-2 flex items-baseline gap-1">
                  <span className="text-xs font-bold text-slate-400">R$</span>
                  <span className="text-4xl font-black text-white">37</span>
                  <span className="text-xs text-slate-400 font-medium">/mês</span>
                </div>

                <ul className="space-y-2.5 text-xs text-slate-300 pt-4 border-t border-white/10">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Acesso a todos os 140+ produtos catalogados</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Atualização diária automática às 06:00 BRT</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Filtros de Oceano Azul e concorrência no feed</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Links diretos de fornecedores em SP e TikTok Shop</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Cálculo de Break-Even e Ponto Zero de Risco</span>
                  </li>
                </ul>
              </div>

              <a
                href={checkoutUrls.radar}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-4 px-4 rounded-xl bg-white/10 hover:bg-white/15 text-white font-black text-xs uppercase tracking-wider text-center transition cursor-pointer active:scale-95 border border-white/10 block"
              >
                Assinar Radar Essential por R$ 37/mês
              </a>
            </div>

            {/* PLANO 2: COMBO RADAR PRO + IA COPILOT (DESTAQUE) */}
            <div className="p-7 sm:p-8 rounded-3xl bg-gradient-to-b from-[#141A29] to-[#0F121C] border-2 border-[#25F4EE] flex flex-col justify-between space-y-6 relative shadow-[0_0_40px_rgba(37,244,238,0.15)]">
              
              {/* Badge Mais Vendido */}
              <div className="absolute -top-3.5 right-6 px-3.5 py-1 rounded-full bg-gradient-to-r from-[#25F4EE] to-[#00D2C4] text-[#0F121C] text-[10px] font-black uppercase tracking-wider shadow-sm">
                ⭐ Mais Escolhido (Desconto Ativo)
              </div>

              <div className="space-y-4">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#25F4EE]/10 text-[#25F4EE] text-xs font-bold border border-[#25F4EE]/30">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Combo Completo com IA</span>
                </div>
                <div>
                  <h4 className="text-xl font-black text-white">Radar PRO + IA Copilot</h4>
                  <p className="text-xs text-slate-300 mt-1">
                    A ferramenta completa com a Inteligência Artificial escrevendo seus roteiros e estratégias.
                  </p>
                </div>

                <div className="pt-2 flex items-baseline gap-1">
                  <span className="text-xs font-bold text-slate-400 line-through mr-1">R$ 87</span>
                  <span className="text-xs font-bold text-[#25F4EE]">R$</span>
                  <span className="text-4xl font-black text-[#25F4EE]">57</span>
                  <span className="text-xs text-slate-400 font-medium">/mês</span>
                </div>

                <ul className="space-y-2.5 text-xs text-slate-200 pt-4 border-t border-white/10">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-[#25F4EE] shrink-0" />
                    <span><strong>Tudo incluso no Plano Essential</strong></span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-[#25F4EE] shrink-0" />
                    <span><strong>Copiloto TikBlox AI Pro Ilimitado 24/7</strong></span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-[#25F4EE] shrink-0" />
                    <span>Gerador de Roteiros de 30s prontos com ganchos virais</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-[#25F4EE] shrink-0" />
                    <span>Estratégias de Live Commerce e saques Pix (D+7)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-[#25F4EE] shrink-0" />
                    <span>Simulador de Lucro Líquido por Volume</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-[#25F4EE] shrink-0" />
                    <span>Suporte prioritário exclusivo para assinantes PRO</span>
                  </li>
                </ul>
              </div>

              <a
                href={checkoutUrls.combo}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-4 px-4 rounded-xl bg-gradient-to-r from-[#25F4EE] via-[#00D2C4] to-[#25F4EE] hover:brightness-105 text-[#0F121C] font-black text-xs uppercase tracking-wider text-center transition cursor-pointer active:scale-95 shadow-[0_4px_25px_rgba(37,244,238,0.4)] block"
              >
                Garantir Combo PRO com Desconto por R$ 57/mês
              </a>
            </div>

          </div>

        </div>
      </section>

      {/* ========================================================= */}
      {/* 6. FAQ (PERGUNTAS FREQUENTES DOS AFILIADOS)               */}
      {/* ========================================================= */}
      <section id="faq" className="py-20 px-4 sm:px-6 scroll-mt-24">
        <div className="max-w-3xl mx-auto space-y-8">
          
          <div className="text-center space-y-2">
            <h2 className="text-xs font-mono font-black uppercase tracking-widest text-[#25F4EE]">
              Tire suas dúvidas
            </h2>
            <h3 className="text-2xl sm:text-3xl font-black text-white">
              Perguntas Frequentes
            </h3>
          </div>

          <div className="space-y-3">
            {[
              {
                q: 'Como recebo meu acesso após pagar na Kiwify?',
                a: 'A aprovação é instantânea! Assim que o pagamento via Pix ou Cartão for aprovado na Kiwify, você receberá o e-mail de confirmação e poderá fazer login imediatamente no TikBlox Pro utilizando o mesmo e-mail informado na compra.'
              },
              {
                q: 'Preciso ter mais de 1.000 seguidores no TikTok para usar?',
                a: 'Não para usar a ferramenta! O TikBlox Pro é o seu radar de oportunidades e roteiros. Para solicitar amostras gratuitas no aplicativo do TikTok, a plataforma geralmente solicita 1.000 seguidores ou cadastro direto no Creator Center. Mas com o TikBlox você compra a amostra pronta entrega por conta própria e recupera o dinheiro em 3 a 5 vendas.'
              },
              {
                q: 'Como funciona a pronta entrega de São Paulo?',
                a: 'Ao invés de indicar produtos que vêm da China (e demoram 20 a 30 dias para chegar), o TikBlox só minera produtos com fornecedores e lojistas que já têm estoque no Brasil (São Paulo). Você recebe a amostra em 2 a 4 dias úteis.'
              },
              {
                q: 'Posso cancelar a assinatura quando eu quiser?',
                a: 'Sim, com 100% de liberdade! Não há nenhuma fidelidade ou multa. Você pode cancelar sua assinatura mensal diretamente no painel da Kiwify a qualquer momento.'
              },
              {
                q: 'Como funciona o Copiloto TikBlox AI?',
                a: 'É uma inteligência artificial proprietária nativa treinada no algoritmo do TikTok Shop Brasil. Ela analisa cada produto do radar e gera roteiros prontos de 30 segundos, ganchos visuais para os primeiros 3 segundos de vídeo, orientações para lives e cálculos de margem líquida.'
              }
            ].map((faq, idx) => (
              <div
                key={idx}
                className="rounded-2xl bg-white/5 border border-white/10 overflow-hidden transition"
              >
                <button
                  type="button"
                  onClick={() => toggleFaq(idx)}
                  className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 font-bold text-xs sm:text-sm text-white hover:text-[#25F4EE] transition cursor-pointer"
                >
                  <span>{faq.q}</span>
                  <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${openFaq === idx ? 'rotate-180 text-[#25F4EE]' : ''}`} />
                </button>
                {openFaq === idx && (
                  <div className="px-4 pb-5 sm:px-5 text-xs text-slate-300 leading-relaxed border-t border-white/5 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ========================================================= */}
      {/* 7. FOOTER INSTITUCIONAL                                   */}
      {/* ========================================================= */}
      <footer className="py-12 px-4 sm:px-6 border-t border-white/10 text-center text-xs text-slate-500 space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <img
            src="/tikblox-logo.png"
            alt="TIKBLOX PRO - Radar de Tendências TikTok Shop Brasil"
            className="h-7 w-auto object-contain opacity-90 hover:opacity-100 transition"
          />
          <span className="hidden sm:inline text-slate-600">•</span>
          <span>Radar de Tendências e Inteligência TikTok Shop Brasil</span>
        </div>
        <p className="max-w-md mx-auto text-[11px] text-slate-500">
          Este site não é afiliado ou endossado pelo TikTok ou ByteDance. Todas as marcas e logotipos são de propriedade de seus respectivos titulares.
        </p>
        <div className="flex items-center justify-center gap-4 text-[11px] text-slate-400 pt-2">
          <button onClick={onOpenLogin} className="hover:text-white transition cursor-pointer">
            Área de Assinantes (Login)
          </button>
          <span>•</span>
          <button onClick={scrollToPricing} className="hover:text-white transition cursor-pointer">
            Planos Kiwify
          </button>
        </div>
        <p className="text-[10px] text-slate-600">
          © {new Date().getFullYear()} TIKBLOX PRO. Todos os direitos reservados.
        </p>
      </footer>

      {/* ========================================================= */}
      {/* 8. BARRA FLUTUANTE DE CONVERSÃO RÁPIDA (STICKY CTA BAR)   */}
      {/* ========================================================= */}
      {showFloatingCta && !floatingCtaDismissed && (
        <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:bottom-6 z-40 max-w-md w-full mx-auto sm:mx-0 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="rounded-2xl bg-[#0F1424]/95 border border-[#25F4EE]/40 p-3 sm:p-3.5 shadow-2xl backdrop-blur-xl flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5 truncate">
              <span className="relative flex h-2 w-2 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <div className="truncate">
                <span className="font-extrabold text-white block truncate">
                  ⚡ 140+ Itens Pronta Entrega SP
                </span>
                <span className="text-[10px] text-slate-400 font-mono hidden sm:inline">
                  Varredura das 06:00 BRT
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={scrollToPricing}
                className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-[#25F4EE] to-[#00D2C4] text-[#0F121C] font-black text-xs uppercase tracking-wider hover:brightness-110 active:scale-95 transition shadow-sm cursor-pointer whitespace-nowrap"
              >
                Assinar R$ 37
              </button>
              <button
                onClick={() => setFloatingCtaDismissed(true)}
                className="p-1 rounded-lg text-slate-400 hover:text-white transition cursor-pointer"
                title="Fechar aviso flutuante"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Botão Flutuante Voltar ao Topo */}
      {showFloatingCta && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-20 sm:bottom-6 left-4 sm:left-6 z-30 p-2.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 text-white backdrop-blur-md transition-all cursor-pointer shadow-lg active:scale-95 hidden sm:flex items-center justify-center"
          title="Voltar ao Topo"
        >
          <ChevronUp className="w-4 h-4" />
        </button>
      )}

    </div>
  );
};
