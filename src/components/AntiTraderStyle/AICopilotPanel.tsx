import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  Bot,
  Send,
  Loader2,
  Copy,
  Check,
  PanelRight,
  ArrowUpRight,
  Sparkles,
  Video,
  PackageCheck,
  ShieldAlert,
  MessageSquare,
  ExternalLink,
  ChevronRight,
  Share2
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { TrendingProduct } from '../../types';
import { enrichWithTikTokShopData } from '../../data/tiktokShopEnricher';
import { generateAutonomousTikTokShopReply } from '../../data/autonomousCopilot';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  source?: string;
}

interface AICopilotPanelProps {
  activeProduct: TrendingProduct | null;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

type TabMode = 'script' | 'sample' | 'objections' | 'chat';

export const AICopilotPanel: React.FC<AICopilotPanelProps> = ({
  activeProduct,
  isCollapsed,
  onToggleCollapse,
}) => {
  const [activeTab, setActiveTab] = useState<TabMode>('script');
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedItem, setCopiedItem] = useState<string | null>(null);
  const chatScrollRef = useRef<HTMLDivElement>(null);

  const tk = activeProduct ? enrichWithTikTokShopData(activeProduct) : null;

  const scrollToBottom = () => {
    chatScrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (activeTab === 'chat') {
      scrollToBottom();
    }
  }, [messages, isLoading, activeTab]);

  // Se mudar o produto ativo, mantém o foco nos scripts se não houver conversa ativa
  useEffect(() => {
    if (activeProduct && messages.length === 0) {
      setActiveTab('script');
    }
  }, [activeProduct?.id]);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedItem(id);
    setTimeout(() => setCopiedItem(null), 2000);
  };

  // Sugestões Dinâmicas de Continuidade de Conversa (Padrão AntiTrader)
  const followUpSuggestions = useMemo(() => {
    if (messages.length === 0) return [];
    const lastMsg = messages[messages.length - 1];
    const text = (lastMsg.content || '').toLowerCase();

    if (text.includes('margem') || text.includes('lucro') || text.includes('simula') || text.includes('comiss') || text.includes('unit economics')) {
      return [
        'Qual o ponto de equilíbrio (breakeven) por vídeo?',
        'Simular projeção de 100 vendas no mês',
        'Como negociar comissão maior com o lojista?',
      ];
    }
    if (text.includes('algoritmo') || text.includes('reten') || text.includes('viral') || text.includes('for you') || text.includes('3s')) {
      return [
        'Qual o threshold crítico de retenção aos 3s?',
        'Qual a melhor estrutura de roteiro para 25 segundos?',
        'Quais os horários de maior transação no Brasil?',
      ];
    }
    if (text.includes('amostra') || text.includes('fornecedor') || text.includes('estoque') || text.includes('sp') || text.includes('logístic')) {
      return [
        'Como solicitar amostras sem ter 1.000 seguidores?',
        'Qual a taxa média de cancelamento em pronta entrega?',
        'Como verificar se o estoque de SP é confiável?',
      ];
    }
    if (text.includes('nicho') || text.includes('bolsa') || text.includes('moda') || text.includes('beleza') || text.includes('categoria')) {
      return [
        'Comparar ticket médio deste nicho com outros',
        'Quais os 3 maiores erros de criadores nesse segmento?',
        'Como identificar produtos antes da saturação?',
      ];
    }
    if (text.includes('cadastro') || text.includes('requisito') || text.includes('início') || text.includes('começar') || text.includes('pix')) {
      return [
        'Como funciona a regra dos 7 dias para saque Pix?',
        'É melhor cadastrar como MEI (CNPJ) ou CPF?',
        'Como vincular o carrinho amarelo no vídeo?',
      ];
    }
    return [
      'Quais os 3 maiores riscos operacionais dessa oferta?',
      'Como estruturar o funil de retenção nos 3 segundos?',
      'Simular lucro líquido com 50 vendas na semana',
    ];
  }, [messages]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || input).trim();
    if (!text || isLoading) return;

    // Muda automaticamente para a aba de chat para ver a resposta
    setActiveTab('chat');

    const newMessages: Message[] = [...messages, { role: 'user', content: text }];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages,
          productContext: tk || undefined,
        }),
      });

      if (!response.ok) {
        throw new Error('Falha na requisição');
      }

      const data = await response.json();
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: data.reply || 'Não consegui processar a resposta agora.',
          source: data.usedSource || 'TIKBLOX AI',
        },
      ]);
    } catch {
      // Fallback institucional autônomo offline instantâneo
      const fallback = generateAutonomousTikTokShopReply(text, activeProduct);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: fallback,
          source: 'Motor Analítico Institucional TikBlox',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Se o painel estiver recolhido no Desktop
  if (isCollapsed) {
    return (
      <aside className="hidden lg:flex w-9 bg-slate-100 border-l border-slate-200 flex-col items-center py-3 justify-between shrink-0 select-none">
        <button
          onClick={onToggleCollapse}
          className="p-1.5 hover:bg-white rounded-lg text-slate-600 hover:text-[#007A87] transition-colors cursor-pointer border border-transparent hover:border-slate-300"
          title="Expandir TIKBLOX AI"
        >
          <PanelRight className="w-4 h-4" />
        </button>
        <span className="[writing-mode:vertical-rl] text-[11px] font-bold text-slate-600 tracking-wider uppercase flex items-center gap-1.5">
          <Bot className="w-3.5 h-3.5 text-[#007A87]" />
          <span>TIKBLOX AI</span>
        </span>
        <div className="w-2 h-2 rounded-full bg-[#25F4EE] animate-pulse" />
      </aside>
    );
  }

  // Textos prontos para o produto ativo
  const prodName = tk?.name || 'Produto em Análise';
  const priceStr = tk ? `R$ ${Number(tk.estimatedPriceBRL || 89.90).toFixed(2)}` : 'R$ 89,90';
  const commStr = tk ? `R$ ${Number(tk.commissionEstimatedBRL || 22.48).toFixed(2)} (${tk.commissionPercent || 25}%)` : 'R$ 22,50 (25%)';
  const stockStr = tk?.stockLocationBrazil || 'São Paulo - SP (Pronta Entrega)';
  const hookStr = tk?.hookViral3s || `Aviso rápido para quem mora em SP: antes de gastar com ${prodName.split(' ')[0]}, olha esse achadinho com pronta entrega...`;

  const fullScriptText = `ROTEIRO TIKTOK SHOP (25 SEGUNDOS) - ${prodName}

[ATO I: GANCHO DE 3 SEGUNDOS (0s - 3s)]
• Visual: Segure o item bem próximo da lente da câmera, mostrando o acabamento ou detalhe em primeiro plano.
• Áudio: "${hookStr}"
• Texto na Tela: "Teste prático antes de comprar"

[ATO II: DEMONSTRAÇÃO PRÁTICA (3s - 18s)]
• Visual: Demonstre o funcionamento imediato sem cortes ou música alta.
• Áudio: "Ele resolve exatamente o que promete no dia a dia. E não vem da China com risco de imposto não, viu? Chegou aqui em 3 dias direto do estoque de ${stockStr}."
• Texto na Tela: "Pronta entrega nacional • Sem taxa de importação"

[ATO III: CHAMADA DE AÇÃO (18s - 25s)]
• Visual: Aponte o dedo para o canto inferior esquerdo (onde fica a sacola amarela do TikTok).
• Áudio: "O lojista liberou cupom de frete grátis na sacolinha amarela aqui embaixo antes que acabe o lote de SP!"
• Texto na Tela: "Clique no carrinho amarelo abaixo"`;

  const samplePitchText = `Prezada equipe comercial da loja,

Meu nome é [Seu Nome], sou criador de conteúdo ativo no TikTok Shop Brasil no segmento de ${tk?.nicheLabel || 'Achadinhos e Novidades'}.

Mapeamos o produto "${prodName}" em nosso radar operacional devido à alta tração e conformidade logística com despacho a partir de ${stockStr}.

Temos programada a veiculação de uma série de 3 publicações em formato de teste funcional e 1 sessão de live commerce dedicada nesta semana. Solicito a liberação de 1 amostra de demonstração pelo painel de criadores do TikTok Shop para viabilizar as filmagens em alta resolução.

Meu perfil é @[seu_usuario]. Ficamos à disposição para acelerar as vendas deste lote juntos!

Atenciosamente,
[Seu Nome]`;

  const objectionsText = `QUEBRA DE OBJEÇÕES NO FEED - ${prodName}

1. Objeção: "É da China? Vai demorar semanas e ser taxado?"
Resposta Pronta: "Não! O estoque já está no Brasil em ${stockStr}. O envio é feito via Correios/Jadlog com rastreio em até 24h e chega em 3 a 5 dias úteis sem nenhuma taxa alfandegária."

2. Objeção: "Isso realmente funciona ou é golpe?"
Resposta Pronta: "A compra é 100% protegida pela garantia oficial do TikTok Shop. Você recebe o produto, testa em casa e tem 7 dias de garantia legal para reembolso integral caso não fique satisfeito."

3. Objeção: "Tem nota fiscal e garantia?"
Resposta Pronta: "Sim! Lote oficial com emissão de nota fiscal brasileira e suporte direto do distribuidor."`;

  return (
    <aside className="w-full lg:w-96 xl:w-[390px] shrink-0 bg-[#F8FAFC] flex flex-col border-t lg:border-t-0 lg:border-l border-slate-200 overflow-hidden h-full select-none text-slate-900">
      
      {/* Header Institucional da IA */}
      <div className="p-2.5 sm:p-3 border-b border-slate-200 bg-white flex items-center justify-between shrink-0 shadow-2xs">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-[#25F4EE] to-[#007A87] text-white flex items-center justify-center font-black shadow-xs shrink-0">
            <Bot className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 leading-none">
              <span className="font-bold text-xs text-slate-900 truncate">TIKBLOX AI</span>
              <span className="text-[9px] font-mono px-1.5 py-0.2 rounded-full bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">
                1-Clique
              </span>
            </div>
            <span className="text-[10px] text-slate-500 truncate block mt-0.5 font-medium">
              Central de Execução & Roteiros TikTok Shop
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={onToggleCollapse}
            className="hidden lg:flex p-1 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
            title="Recolher painel"
          >
            <PanelRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* ABAS DE EXECUÇÃO EM 1-CLIQUE (Substitui a Chatbox Passiva) */}
      <div className="grid grid-cols-4 bg-slate-100/90 p-1 border-b border-slate-200 shrink-0 gap-0.5 text-[10.5px] font-semibold">
        <button
          type="button"
          onClick={() => setActiveTab('script')}
          className={`py-1.5 px-1 rounded-md transition-all flex items-center justify-center gap-1 cursor-pointer truncate ${
            activeTab === 'script'
              ? 'bg-white text-slate-900 shadow-2xs font-bold border border-slate-200/80'
              : 'text-slate-500 hover:text-slate-900'
          }`}
          title="Roteiro de 25s pronto para gravar"
        >
          <Video className={`w-3 h-3 shrink-0 ${activeTab === 'script' ? 'text-[#007A87]' : ''}`} />
          <span className="truncate">Roteiro</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('sample')}
          className={`py-1.5 px-1 rounded-md transition-all flex items-center justify-center gap-1 cursor-pointer truncate ${
            activeTab === 'sample'
              ? 'bg-white text-slate-900 shadow-2xs font-bold border border-slate-200/80'
              : 'text-slate-500 hover:text-slate-900'
          }`}
          title="Mensagem para pedir amostra grátis no WhatsApp"
        >
          <PackageCheck className={`w-3 h-3 shrink-0 ${activeTab === 'sample' ? 'text-emerald-600' : ''}`} />
          <span className="truncate">Amostra</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('objections')}
          className={`py-1.5 px-1 rounded-md transition-all flex items-center justify-center gap-1 cursor-pointer truncate ${
            activeTab === 'objections'
              ? 'bg-white text-slate-900 shadow-2xs font-bold border border-slate-200/80'
              : 'text-slate-500 hover:text-slate-900'
          }`}
          title="Respostas prontas para quebrar objeções nos comentários"
        >
          <ShieldAlert className={`w-3 h-3 shrink-0 ${activeTab === 'objections' ? 'text-amber-600' : ''}`} />
          <span className="truncate">Objeções</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('chat')}
          className={`py-1.5 px-1 rounded-md transition-all flex items-center justify-center gap-1 cursor-pointer truncate ${
            activeTab === 'chat'
              ? 'bg-white text-slate-900 shadow-2xs font-bold border border-slate-200/80'
              : 'text-slate-500 hover:text-slate-900'
          }`}
          title="Consultoria aberta com a inteligência artificial"
        >
          <MessageSquare className={`w-3 h-3 shrink-0 ${activeTab === 'chat' ? 'text-blue-600' : ''}`} />
          <span className="truncate">Chat IA</span>
        </button>
      </div>

      {/* ÁREA DE CONTEÚDO DINÂMICO CONFORME A ABA SELECIONADA */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-3.5 space-y-3 min-h-0 bg-[#F8FAFC]">

        {/* ========================================================================= */}
        {/* MODO 1: ROTEIRO PRONTO DE 25 SEGUNDOS (EXECUÇÃO IMEDIATA) */}
        {/* ========================================================================= */}
        {activeTab === 'script' && (
          <div className="space-y-3">
            {/* Cabeçalho do Dossiê */}
            <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-cyan-50 text-[#007A87] border border-cyan-200 uppercase tracking-wider">
                  Roteiro de Alta Retenção (25s)
                </span>
                <span className="text-[10px] font-mono text-slate-500 font-medium">
                  {stockStr.split('-')[0].trim()}
                </span>
              </div>
              <h4 className="text-xs font-bold text-slate-900 truncate">
                {prodName}
              </h4>
              <p className="text-[10px] text-slate-500 leading-tight">
                Estrutura de 3 atos testada para maximizar retenção nos primeiros 3 segundos do feed brasileiro.
              </p>
            </div>

            {/* Ato 1: Gancho de 3s */}
            <div className="bg-white p-3 rounded-xl border border-slate-200 border-l-4 border-l-[#FE2C55] shadow-2xs space-y-1">
              <div className="flex items-center justify-between text-[10px] font-bold text-[#FE2C55]">
                <span>ATO I: GANCHO DE 3 SEGUNDOS (0s a 3s)</span>
                <span className="font-mono text-slate-400">Interrupção</span>
              </div>
              <div className="text-[11px] font-bold text-slate-800 bg-rose-50/50 p-2 rounded-lg border border-rose-100 italic">
                "{hookStr}"
              </div>
              <div className="text-[10px] text-slate-500 space-y-0.5 pt-1">
                <div><strong>Ação Visual:</strong> Segure o item bem próximo da lente da câmera no primeiro segundo.</div>
                <div><strong>Texto na Tela:</strong> "Teste prático antes de comprar"</div>
              </div>
            </div>

            {/* Ato 2: Demonstração sem cortes */}
            <div className="bg-white p-3 rounded-xl border border-slate-200 border-l-4 border-l-[#007A87] shadow-2xs space-y-1">
              <div className="flex items-center justify-between text-[10px] font-bold text-[#007A87]">
                <span>ATO II: DEMONSTRAÇÃO PRÁTICA (3s a 18s)</span>
                <span className="font-mono text-slate-400">Benefício</span>
              </div>
              <div className="text-[11px] text-slate-800 bg-slate-50 p-2 rounded-lg border border-slate-200/80">
                "Ele resolve exatamente o que promete no dia a dia. E não vem da China com risco de taxa não, viu? Chegou aqui em 3 dias direto do estoque de {stockStr}."
              </div>
              <div className="text-[10px] text-slate-500 space-y-0.5 pt-1">
                <div><strong>Ação Visual:</strong> Mostre o produto funcionando na prática com iluminação natural.</div>
                <div><strong>Texto na Tela:</strong> "Pronta entrega nacional • Sem taxa de importação"</div>
              </div>
            </div>

            {/* Ato 3: CTA no Carrinho Amarelo */}
            <div className="bg-white p-3 rounded-xl border border-slate-200 border-l-4 border-l-amber-500 shadow-2xs space-y-1">
              <div className="flex items-center justify-between text-[10px] font-bold text-amber-700">
                <span>ATO III: CHAMADA DE AÇÃO (18s a 25s)</span>
                <span className="font-mono text-slate-400">Conversão</span>
              </div>
              <div className="text-[11px] text-slate-800 bg-amber-50/50 p-2 rounded-lg border border-amber-200/60">
                "O lojista liberou cupom de frete grátis na sacolinha amarela aqui embaixo antes que acabe o lote de SP!"
              </div>
              <div className="text-[10px] text-slate-500 space-y-0.5 pt-1">
                <div><strong>Ação Visual:</strong> Aponte o dedo para o canto inferior esquerdo onde fica o carrinho amarelo.</div>
              </div>
            </div>

            {/* Botão de Ação: Copiar Roteiro Completo */}
            <button
              type="button"
              onClick={() => copyToClipboard(fullScriptText, 'full-script')}
              className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-[#007A87] to-[#0F172A] hover:brightness-110 text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all shadow-xs active:scale-98"
            >
              {copiedItem === 'full-script' ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Roteiro Copiado para a Área de Transferência!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copiar Roteiro Completo de 25s</span>
                </>
              )}
            </button>
          </div>
        )}

        {/* ========================================================================= */}
        {/* MODO 2: PITCH DE AMOSTRA GRÁTIS PARA FORNECEDOR (WHATSAPP) */}
        {/* ========================================================================= */}
        {activeTab === 'sample' && (
          <div className="space-y-3">
            <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase tracking-wider">
                  Fornecedor Nacional Validado
                </span>
                <span className="text-[10px] font-mono text-emerald-600 font-bold">
                  SLA 24h
                </span>
              </div>
              <h4 className="text-xs font-bold text-slate-900 truncate">
                Solicitação de Amostra: {prodName}
              </h4>
              <p className="text-[10px] text-slate-500 leading-tight">
                Lojistas de pronta entrega de São Paulo e Paraná enviam amostras para criadores dispostos a gravar.
              </p>
            </div>

            <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs space-y-2">
              <span className="text-[10px] font-mono text-slate-400 font-bold uppercase tracking-wider block">
                Mensagem Formal Pronta para WhatsApp ou Chat do Vendedor:
              </span>
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-800 font-mono leading-relaxed whitespace-pre-line select-text">
                {samplePitchText}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => copyToClipboard(samplePitchText, 'sample-pitch')}
                className="py-2.5 px-3 rounded-xl bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-all shadow-2xs active:scale-98"
              >
                {copiedItem === 'sample-pitch' ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Copiado!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copiar Texto</span>
                  </>
                )}
              </button>

              <a
                href={`https://wa.me/?text=${encodeURIComponent(samplePitchText)}`}
                target="_blank"
                rel="noreferrer"
                className="py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-all shadow-xs active:scale-98"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Abrir WhatsApp</span>
              </a>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* MODO 3: QUEBRA DE OBJEÇÕES NO FEED (RESPOSTAS PRONTAS) */}
        {/* ========================================================================= */}
        {activeTab === 'objections' && (
          <div className="space-y-3">
            <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200 uppercase tracking-wider">
                  Gatilhos de Fechamento no Feed
                </span>
                <span className="text-[10px] font-mono text-slate-500">
                  3 Objeções
                </span>
              </div>
              <h4 className="text-xs font-bold text-slate-900 truncate">
                Respostas Rápidas para Comentários de Vídeo
              </h4>
              <p className="text-[10px] text-slate-500 leading-tight">
                Fixe estas respostas nos comentários do seu vídeo para destravar compras de quem está com dúvida.
              </p>
            </div>

            {/* Objeção 1 */}
            <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-2xs space-y-1">
              <span className="text-[10px] font-bold text-slate-500 block">
                1. "Demora semanas pra chegar? É da China?"
              </span>
              <div className="text-[11px] text-slate-800 bg-slate-50 p-2 rounded-lg border border-slate-200/80">
                "Não! O estoque já está no Brasil em {stockStr}. O envio é feito via Correios/Jadlog com rastreio em 24h e chega em 3 a 5 dias úteis sem taxa alfandegária."
              </div>
            </div>

            {/* Objeção 2 */}
            <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-2xs space-y-1">
              <span className="text-[10px] font-bold text-slate-500 block">
                2. "Isso realmente funciona ou é golpe?"
              </span>
              <div className="text-[11px] text-slate-800 bg-slate-50 p-2 rounded-lg border border-slate-200/80">
                "A compra é 100% protegida pela garantia oficial do TikTok Shop. Você recebe o produto, testa em casa e tem 7 dias de garantia legal para reembolso integral caso não fique satisfeito."
              </div>
            </div>

            {/* Objeção 3 */}
            <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-2xs space-y-1">
              <span className="text-[10px] font-bold text-slate-500 block">
                3. "Tem nota fiscal e garantia?"
              </span>
              <div className="text-[11px] text-slate-800 bg-slate-50 p-2 rounded-lg border border-slate-200/80">
                "Sim! Lote oficial com emissão de nota fiscal brasileira e suporte direto do distribuidor."
              </div>
            </div>

            <button
              type="button"
              onClick={() => copyToClipboard(objectionsText, 'objections-text')}
              className="w-full py-2.5 px-3 rounded-xl bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-all shadow-2xs active:scale-98"
            >
              {copiedItem === 'objections-text' ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Respostas Copiadas!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copiar Todas as Respostas de Objeção</span>
                </>
              )}
            </button>
          </div>
        )}

        {/* ========================================================================= */}
        {/* MODO 4: CHAT LIVRE & CONSULTORIA ABERTA (PADRÃO ANTITRADER) */}
        {/* ========================================================================= */}
        {activeTab === 'chat' && (
          <div className="space-y-3">
            {messages.length === 0 ? (
              <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
                  <Sparkles className="w-3.5 h-3.5 text-[#007A87]" />
                  <span>Consultoria Aberta TIKBLOX AI</span>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  Pergunte abertamente sobre nichos (ex: bolsas femininas, maquiagem), regras de afiliação, horários do algoritmo ou peça simulações de lucro.
                </p>
              </div>
            ) : (
              messages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
                >
                  <span className="text-[10px] text-slate-400 font-bold mb-0.5 px-1">
                    {msg.role === 'user' ? 'Você' : 'TIKBLOX AI'}
                  </span>

                  <div
                    className={`p-3 rounded-2xl max-w-[95%] text-xs leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-gradient-to-r from-[#0F172A] to-[#1E293B] text-white font-medium rounded-br-none shadow-2xs'
                        : 'bg-white border border-slate-200 text-slate-800 rounded-bl-none shadow-2xs relative group'
                    }`}
                  >
                    {msg.role === 'assistant' ? (
                      <>
                        <div className="prose prose-xs max-w-none text-slate-800 prose-headings:text-slate-900 prose-strong:text-slate-900 prose-blockquote:border-[#007A87] prose-blockquote:bg-cyan-50/40 prose-blockquote:py-1 prose-blockquote:px-2 prose-blockquote:rounded">
                          <ReactMarkdown>{msg.content}</ReactMarkdown>
                        </div>

                        {msg.source && (
                          <div className="mt-2.5 pt-1.5 border-t border-slate-100 text-[9px] font-mono text-slate-400 flex items-center justify-between">
                            <div className="flex items-center gap-1">
                              <span>Origem:</span>
                              <strong className="text-slate-600">{msg.source}</strong>
                            </div>
                            <span className="text-slate-400">TikTok Shop Brasil</span>
                          </div>
                        )}

                        <button
                          onClick={() => copyToClipboard(msg.content, `msg-${i}`)}
                          className="absolute top-2 right-2 p-1 rounded-md bg-slate-50 hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition cursor-pointer opacity-0 group-hover:opacity-100 border border-slate-200"
                          title="Copiar resposta"
                        >
                          {copiedItem === `msg-${i}` ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </>
                    ) : (
                      <span>{msg.content}</span>
                    )}
                  </div>
                </div>
              ))
            )}

            {isLoading && (
              <div className="flex items-center gap-2 p-3 bg-white border border-slate-200 rounded-2xl text-slate-700 text-xs shadow-2xs font-medium">
                <Loader2 className="w-4 h-4 text-[#007A87] animate-spin" />
                <span>Consultando inteligência analítica e algoritmo TikTok Shop...</span>
              </div>
            )}

            <div ref={chatScrollRef} />
          </div>
        )}
      </div>

      {/* SUGESTÕES DINÂMICAS DE CONTINUIDADE (Apenas na aba Chat ou visível discretamente) */}
      {activeTab === 'chat' && (
        <div className="px-2.5 py-1.5 border-t border-slate-200 bg-slate-50 shrink-0 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider shrink-0 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-[#007A87]" />
            <span>{messages.length > 0 ? 'Prosseguir:' : 'Tópicos:'}</span>
          </span>
          {(messages.length > 0 && followUpSuggestions.length > 0
            ? followUpSuggestions
            : [
                tk ? `Diagnóstico de ${tk.name.split(' ')[0]}` : 'Pesquisar Bolsas Femininas',
                'Simular Margem & Lucro',
                'Mecânica do Algoritmo & 3s',
                'Regras de Cadastro & Pix D+7',
              ]
          ).map((sugestao, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSendMessage(sugestao)}
              disabled={isLoading}
              className="text-[10.5px] text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 hover:border-[#007A87] hover:text-[#007A87] rounded-full px-2.5 py-0.5 whitespace-nowrap cursor-pointer transition-colors font-medium shadow-2xs shrink-0 flex items-center gap-1 disabled:opacity-50 active:scale-95"
            >
              <span>{sugestao}</span>
              <ArrowUpRight className="w-2.5 h-2.5 opacity-50 text-[#007A87]" />
            </button>
          ))}
        </div>
      )}

      {/* CAIXA DE DIGITAÇÃO UNIVERSAL NO RODAPÉ */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage();
        }}
        className="p-2.5 sm:p-3 border-t border-slate-200 bg-white flex items-center gap-2 shrink-0"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Pergunte sobre nichos, métricas ou simule lucros..."
          disabled={isLoading}
          className="flex-1 py-1.5 px-3 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:border-[#25F4EE] focus:ring-1 focus:ring-[#25F4EE]/40 focus:bg-white transition-all text-slate-900 placeholder:text-slate-400 disabled:opacity-50"
        />

        <button
          type="submit"
          disabled={!input.trim() || isLoading}
          className="p-2 rounded-xl bg-gradient-to-r from-[#25F4EE] to-[#00D2C4] hover:brightness-105 disabled:bg-slate-200 text-[#0F121C] disabled:text-slate-400 font-bold transition cursor-pointer active:scale-95 shadow-[0_0_12px_rgba(37,244,238,0.25)] shrink-0"
        >
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>
    </aside>
  );
};
