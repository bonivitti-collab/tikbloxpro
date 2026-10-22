import React, { useState, useRef, useEffect } from 'react';
import {
  Bot,
  Send,
  Loader2,
  Copy,
  Check,
  Plus,
  PanelRight,
  ArrowUpRight,
  Sparkles,
  ExternalLink
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { TrendingProduct } from '../../types';
import { enrichWithTikTokShopData } from '../../data/tiktokShopEnricher';
import { generateAutonomousTikTokShopReply } from '../../data/autonomousCopilot';

interface Message {
  role: 'user' | 'assistant';
  content: string;
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
  const chatScrollRef = useRef<HTMLDivElement>(null);

  const tk = activeProduct ? enrichWithTikTokShopData(activeProduct) : null;

  const scrollToBottom = () => {
    chatScrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

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
        { role: 'assistant', content: data.reply || 'Não consegui processar a resposta agora.' },
      ]);
    } catch {
      // Fallback autônomo offline instantâneo (100% de disponibilidade)
      const fallback = generateAutonomousTikTokShopReply(text, activeProduct);
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: fallback },
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

  // Se o painel estiver recolhido no Desktop, exibe faixa esbelta vertical idêntica ao AntiTrader
  if (isCollapsed) {
    return (
      <aside className="hidden lg:flex w-9 bg-slate-100 border-l border-slate-300 flex-col items-center py-3 justify-between shrink-0 select-none">
        <button
          onClick={onToggleCollapse}
          className="p-1.5 hover:bg-white rounded border border-transparent hover:border-slate-300 text-slate-600 hover:text-blue-600 transition-colors cursor-pointer"
          title="Expandir TikBlox AI Copilot"
        >
          <PanelRight className="w-4 h-4" />
        </button>
        <span className="[writing-mode:vertical-rl] text-[11px] font-bold text-slate-500 tracking-wider uppercase flex items-center gap-1.5">
          <Bot className="w-3.5 h-3.5 text-blue-600" />
          <span>TikBlox AI</span>
        </span>
        <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
      </aside>
    );
  }

  return (
    <aside className="w-full lg:w-96 xl:w-[380px] shrink-0 bg-[#fbfbfc] flex flex-col border-t lg:border-t-0 lg:border-l border-slate-300 overflow-hidden h-full select-none">
      
      {/* Header do Chat (AntiTrader Style) */}
      <div className="p-2.5 border-b border-slate-300 bg-slate-50 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-6 h-6 rounded-md bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-xs shrink-0">
            <Bot className="w-3.5 h-3.5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 leading-none">
              <span className="font-bold text-xs text-slate-900 truncate">TikBlox AI</span>
              <span className="text-[9px] font-mono px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-800 font-bold">
                100% Gratuito
              </span>
            </div>
            <span className="text-[10px] text-slate-500 truncate block mt-0.5">
              {tk ? `Foco: ${tk.name}` : 'Copiloto de Vendas TikTok Shop'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1 text-slate-600 shrink-0">
          <button
            onClick={() => setMessages([])}
            className="p-1 hover:bg-slate-200 rounded text-slate-500 hover:text-slate-800 transition cursor-pointer"
            title="Limpar conversa"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={onToggleCollapse}
            className="hidden lg:flex p-1 hover:bg-slate-200 rounded text-slate-500 hover:text-slate-800 transition cursor-pointer"
            title="Recolher painel da IA para focar no Raio-X"
          >
            <PanelRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Área de Mensagens / Welcome Screen */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3 text-xs leading-relaxed font-sans min-h-0 select-text">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col justify-center items-center text-center p-3 sm:p-5 max-w-sm sm:max-w-md mx-auto space-y-4 my-auto select-none">
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-teal-500 text-white flex items-center justify-center shadow-md shadow-blue-500/20 shrink-0">
              <Bot className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-sm sm:text-base font-black text-slate-900 tracking-tight">
                Como posso acelerar suas vendas hoje?
              </h3>
              <p className="text-[11px] sm:text-xs text-slate-500 mt-1 leading-relaxed">
                {tk ? (
                  <>Especialista preparado para o produto <strong>{tk.name}</strong> (Comissão: R$ {tk.commissionEstimatedBRL.toFixed(2)}).</>
                ) : (
                  <>Selecione um produto à esquerda ou clique em uma das sugestões abaixo:</>
                )}
              </p>
            </div>

            {/* 4 Sugestões em Destaque (Estilo AntiTrader) */}
            <div className="w-full space-y-2 pt-1 text-left">
              <button
                type="button"
                onClick={() =>
                  handleSendMessage(
                    `Me dê 3 ganchos virais de 3 segundos para gravar hoje com o produto ${tk?.name || 'em destaque'}.`
                  )
                }
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-blue-50/80 hover:border-blue-400 text-slate-800 transition-all cursor-pointer shadow-2xs group flex items-start gap-2.5 active:scale-98"
              >
                <span className="p-1 rounded-md bg-blue-100 text-blue-700 text-xs shrink-0 mt-0.5">
                  ⚡
                </span>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-bold text-slate-900 group-hover:text-blue-700 flex items-center justify-between">
                    <span>3 Ganchos Virais de 3 Segundos</span>
                    <ArrowUpRight className="w-3 h-3 text-slate-400 group-hover:text-blue-600" />
                  </div>
                  <div className="text-[10px] text-slate-500 truncate mt-0.5">
                    Ganchos magnéticos para reter mais de 65% nos primeiros segundos.
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() =>
                  handleSendMessage(
                    `Crie um roteiro completo de 5 minutos de Live Selling para vender ${tk?.name || 'este produto'}.`
                  )
                }
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-teal-50/80 hover:border-teal-400 text-slate-800 transition-all cursor-pointer shadow-2xs group flex items-start gap-2.5 active:scale-98"
              >
                <span className="p-1 rounded-md bg-teal-100 text-teal-700 text-xs shrink-0 mt-0.5">
                  🎬
                </span>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-bold text-slate-900 group-hover:text-teal-700 flex items-center justify-between">
                    <span>Roteiro de Live Selling (5 Minutos)</span>
                    <ArrowUpRight className="w-3 h-3 text-slate-400 group-hover:text-teal-600" />
                  </div>
                  <div className="text-[10px] text-slate-500 truncate mt-0.5">
                    Quebra de padrão, demonstração prática e gatilho do carrinho.
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() =>
                  handleSendMessage(
                    `Escreva uma mensagem de DM/WhatsApp persuasiva para pedir amostra grátis ao lojista de ${tk?.name || 'deste produto'}.`
                  )
                }
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-emerald-50/80 hover:border-emerald-400 text-slate-800 transition-all cursor-pointer shadow-2xs group flex items-start gap-2.5 active:scale-98"
              >
                <span className="p-1 rounded-md bg-emerald-100 text-emerald-700 text-xs shrink-0 mt-0.5">
                  📩
                </span>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-bold text-slate-900 group-hover:text-emerald-700 flex items-center justify-between">
                    <span>Pitch para Solicitar Amostra Grátis</span>
                    <ArrowUpRight className="w-3 h-3 text-slate-400 group-hover:text-emerald-600" />
                  </div>
                  <div className="text-[10px] text-slate-500 truncate mt-0.5">
                    Texto de alta taxa de aprovação para enviar aos lojistas parceiros.
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() =>
                  handleSendMessage(
                    `Como quebrar as 3 maiores objeções de quem comenta no vídeo de ${tk?.name || 'deste produto'}?`
                  )
                }
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-amber-50/80 hover:border-amber-400 text-slate-800 transition-all cursor-pointer shadow-2xs group flex items-start gap-2.5 active:scale-98"
              >
                <span className="p-1 rounded-md bg-amber-100 text-amber-700 text-xs shrink-0 mt-0.5">
                  🎯
                </span>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-bold text-slate-900 group-hover:text-amber-700 flex items-center justify-between">
                    <span>Quebrar Objeções nos Comentários</span>
                    <ArrowUpRight className="w-3 h-3 text-slate-400 group-hover:text-amber-600" />
                  </div>
                  <div className="text-[10px] text-slate-500 truncate mt-0.5">
                    Respostas prontas para frete, desconfiança e funcionamento.
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
                {msg.role === 'user' ? 'Você' : 'TikBlox AI'}
              </span>

              <div
                className={`p-3 rounded-2xl max-w-[95%] text-xs leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-blue-600 text-white rounded-br-none shadow-2xs'
                    : 'bg-white border border-slate-200 text-slate-800 rounded-bl-none shadow-2xs relative group'
                }`}
              >
                {msg.role === 'assistant' ? (
                  <>
                    <div className="prose prose-xs max-w-none text-slate-800 prose-headings:text-slate-900 prose-strong:text-slate-900 prose-blockquote:border-blue-500 prose-blockquote:bg-blue-50/50 prose-blockquote:py-1 prose-blockquote:px-2 prose-blockquote:rounded">
                      <ReactMarkdown>{msg.content}</ReactMarkdown>
                    </div>

                    <button
                      onClick={() => handleCopy(msg.content, i)}
                      className="absolute top-2 right-2 p-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition cursor-pointer opacity-0 group-hover:opacity-100"
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
          <div className="flex items-center gap-2 p-3 bg-white border border-slate-200 rounded-2xl text-slate-600 text-xs shadow-2xs">
            <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />
            <span>Consultando inteligência de vendas...</span>
          </div>
        )}

        <div ref={chatScrollRef} />
      </div>

      {/* Input de Envio Limpo (AntiTrader Style) */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage();
        }}
        className="p-2.5 border-t border-slate-300 bg-white flex items-center gap-2 shrink-0"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={tk ? `Pergunte sobre ${tk.name}...` : 'Digite sua dúvida ou estratégia...'}
          disabled={isLoading}
          className="flex-1 py-1.5 px-3 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white transition-all text-slate-800 placeholder:text-slate-400 disabled:opacity-50"
        />

        <button
          type="submit"
          disabled={!input.trim() || isLoading}
          className="p-2 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 text-white disabled:text-slate-400 transition cursor-pointer active:scale-95 shadow-2xs shrink-0"
        >
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>
    </aside>
  );
};
