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
  Key,
  X,
  ExternalLink,
  RotateCcw
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

export const AICopilotPanel: React.FC<AICopilotPanelProps> = ({
  activeProduct,
  isCollapsed,
  onToggleCollapse,
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [apiKey, setApiKey] = useState<string>(() => {
    return (
      localStorage.getItem('tikblox_gemini_key') ||
      localStorage.getItem('antitrader_gemini_key') ||
      localStorage.getItem('antigravity_gemini_key') ||
      ''
    );
  });
  const [tempKeyInput, setTempKeyInput] = useState('');

  const chatScrollRef = useRef<HTMLDivElement>(null);
  const tk = activeProduct ? enrichWithTikTokShopData(activeProduct) : null;

  const scrollToBottom = () => {
    chatScrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSaveApiKey = () => {
    const clean = tempKeyInput.trim();
    setApiKey(clean);
    if (clean) {
      localStorage.setItem('tikblox_gemini_key', clean);
    } else {
      localStorage.removeItem('tikblox_gemini_key');
    }
    setShowKeyModal(false);
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

    const newMessages: Message[] = [...messages, { role: 'user', content: text }];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(apiKey ? { 'x-gemini-key': apiKey } : {}),
        },
        body: JSON.stringify({
          messages: newMessages,
          productContext: tk || undefined,
          customApiKey: apiKey || undefined,
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
          source: data.usedSource || (apiKey ? 'Gemini 2.5 Flash' : 'TIKBLOX AI'),
        },
      ]);
    } catch {
      // Fallback institucional autônomo offline instantâneo (Padrão AntiTrader - 100% disponibilidade)
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

  const handleCopy = (content: string, idx: number) => {
    navigator.clipboard.writeText(content);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
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
              <button
                type="button"
                onClick={() => {
                  setTempKeyInput(apiKey);
                  setShowKeyModal(true);
                }}
                className={`text-[9px] font-mono px-1.5 py-0.2 rounded-full font-bold border transition-colors cursor-pointer ${
                  apiKey
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100'
                    : 'bg-slate-100 text-slate-600 border-slate-300 hover:bg-slate-200'
                }`}
                title="Configurar Chave Google AI Studio (Gratuita)"
              >
                {apiKey ? 'Gemini Ativo' : 'Conectar IA'}
              </button>
            </div>
            <span className="text-[10px] text-slate-500 truncate block mt-0.5 font-medium">
              Inteligência de Mercado & Algoritmo TikTok Shop
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {messages.length > 0 && (
            <button
              onClick={() => setMessages([])}
              className="p-1 px-1.5 rounded-lg text-[10px] text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition cursor-pointer font-medium flex items-center gap-1"
              title="Nova Conversa"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Limpar</span>
            </button>
          )}

          <button
            onClick={onToggleCollapse}
            className="hidden lg:flex p-1 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
            title="Recolher painel"
          >
            <PanelRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Área de Conversa e Mensagens */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 min-h-0 bg-[#F8FAFC]">
        {messages.length === 0 ? (
          <div className="space-y-4 py-2">
            
            {/* Card de Boas-Vindas Institucional com o Produto Selecionado */}
            <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                <Sparkles className="w-3.5 h-3.5 text-[#007A87]" />
                <span>Terminal Analítico Conectado</span>
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                Faça qualquer pergunta sobre mercado, nichos de alta tração no Brasil, regras de comissionamento, comportamento do algoritmo do TikTok ou estratégias para o produto em foco.
              </p>
            </div>

            {/* Sugestões de Perguntas Rápidas */}
            <div className="space-y-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block px-1">
                Análises Rápidas para Iniciar:
              </span>

              <button
                type="button"
                onClick={() =>
                  handleSendMessage(
                    `Gere 3 roteiros técnicos de 30 segundos no TikTok para ${tk?.name || 'este produto'}, detalhando o gancho exato de 3s para prender o scroll no Brasil.`
                  )
                }
                className="w-full p-2.5 rounded-xl border border-slate-200/90 border-l-4 border-l-[#007A87] bg-white hover:bg-slate-50 text-slate-700 transition-all cursor-pointer shadow-2xs group flex items-start gap-2.5 active:scale-98"
              >
                <div className="min-w-0 flex-1 text-left">
                  <div className="text-xs font-bold text-slate-900 group-hover:text-[#007A87] flex items-center justify-between">
                    <span>3 Roteiros Técnicos de Vídeo (30s)</span>
                    <ArrowUpRight className="w-3 h-3 text-slate-400 group-hover:text-[#007A87]" />
                  </div>
                  <div className="text-[10px] text-slate-500 truncate mt-0.5">
                    Ganchos de retenção imediata nos primeiros 3 segundos.
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() =>
                  handleSendMessage(
                    `Simular a estrutura completa de unit economics e projeção de lucro líquido com 50 vendas para ${tk?.name || 'este produto'} no TikTok Shop.`
                  )
                }
                className="w-full p-2.5 rounded-xl border border-slate-200/90 border-l-4 border-l-amber-500 bg-white hover:bg-slate-50 text-slate-700 transition-all cursor-pointer shadow-2xs group flex items-start gap-2.5 active:scale-98"
              >
                <div className="min-w-0 flex-1 text-left">
                  <div className="text-xs font-bold text-slate-900 group-hover:text-amber-800 flex items-center justify-between">
                    <span>Simulação de Unit Economics & Lucro</span>
                    <ArrowUpRight className="w-3 h-3 text-slate-400 group-hover:text-amber-800" />
                  </div>
                  <div className="text-[10px] text-slate-500 truncate mt-0.5">
                    Projeção de retorno líquido e ciclo de liberação Pix (D+7).
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() =>
                  handleSendMessage(
                    `Quais as 3 maiores objeções de compradores no TikTok para ${tk?.name || 'produtos desta categoria'} e como quebrar nos comentários?`
                  )
                }
                className="w-full p-2.5 rounded-xl border border-slate-200/90 border-l-4 border-l-[#FE2C55] bg-white hover:bg-slate-50 text-slate-700 transition-all cursor-pointer shadow-2xs group flex items-start gap-2.5 active:scale-98"
              >
                <div className="min-w-0 flex-1 text-left">
                  <div className="text-xs font-bold text-slate-900 group-hover:text-[#FE2C55] flex items-center justify-between">
                    <span>Quebrar Objeções nos Comentários</span>
                    <ArrowUpRight className="w-3 h-3 text-slate-400 group-hover:text-[#FE2C55]" />
                  </div>
                  <div className="text-[10px] text-slate-500 truncate mt-0.5">
                    Respostas prontas para frete, prazo e confiança.
                  </div>
                </div>
              </button>
            </div>
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
                      onClick={() => handleCopy(msg.content, i)}
                      className="absolute top-2 right-2 p-1 rounded-md bg-slate-50 hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition cursor-pointer opacity-0 group-hover:opacity-100 border border-slate-200"
                      title="Copiar resposta"
                    >
                      {copiedIndex === i ? (
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

      {/* Sugestões Dinâmicas de Continuidade (Padrão AntiTrader) */}
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

      {/* Caixa de Digitação do Chat */}
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

      {/* Modal de Configuração de Chave Gemini Gratuita */}
      {showKeyModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-300 max-w-md w-full p-5 shadow-2xl space-y-4 text-slate-900">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-[#25F4EE]/20 text-[#007A87]">
                  <Key className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Conectar Cérebro Gemini (100% Gratuito)</h3>
                  <span className="text-[11px] text-slate-500">Google AI Studio • 1.500 requisições/dia</span>
                </div>
              </div>
              <button
                onClick={() => setShowKeyModal(false)}
                className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Para ativar o raciocínio livre do <strong>Gemini 2.5 Flash</strong> sem respostas pré-fabricadas e sem pagar nada, insira sua chave gratuita do Google AI Studio.
            </p>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-700 block">
                Sua Chave de API (AIzaSy...):
              </label>
              <input
                type="password"
                value={tempKeyInput}
                onChange={(e) => setTempKeyInput(e.target.value)}
                placeholder="Cole sua chave AIzaSy... aqui"
                className="w-full py-2 px-3 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:border-[#007A87] font-mono text-slate-900"
              />
            </div>

            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-[11px] text-slate-600 flex items-center justify-between">
              <span>Ainda não tem chave? É gratuita e leva 30 segundos:</span>
              <a
                href="https://aistudio.google.com/apikey"
                target="_blank"
                rel="noreferrer"
                className="font-bold text-[#007A87] hover:underline flex items-center gap-1 shrink-0 ml-2"
              >
                <span>Criar Chave</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowKeyModal(false)}
                className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-xl font-medium"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSaveApiKey}
                className="px-4 py-1.5 text-xs bg-[#007A87] hover:bg-[#00606B] text-white rounded-xl font-bold shadow-xs transition"
              >
                Salvar & Conectar
              </button>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};
