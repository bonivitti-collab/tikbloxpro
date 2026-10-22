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

  // Se o painel estiver recolhido no Desktop
  if (isCollapsed) {
    return (
      <aside className="hidden lg:flex w-9 bg-slate-100 border-l border-slate-200 flex-col items-center py-3 justify-between shrink-0 select-none">
        <button
          onClick={onToggleCollapse}
          className="p-1.5 hover:bg-white rounded-lg text-slate-600 hover:text-[#FE2C55] transition-colors cursor-pointer border border-transparent hover:border-slate-300"
          title="Expandir TikBlox AI Copilot"
        >
          <PanelRight className="w-4 h-4" />
        </button>
        <span className="[writing-mode:vertical-rl] text-[11px] font-bold text-slate-600 tracking-wider uppercase flex items-center gap-1.5">
          <Bot className="w-3.5 h-3.5 text-[#FE2C55]" />
          <span>TikBlox AI</span>
        </span>
        <div className="w-2 h-2 rounded-full bg-[#25F4EE] animate-pulse" />
      </aside>
    );
  }

  return (
    <aside className="w-full lg:w-96 xl:w-[380px] shrink-0 bg-[#F8FAFC] flex flex-col border-t lg:border-t-0 lg:border-l border-slate-200 overflow-hidden h-full select-none text-slate-900">
      
      {/* Header do Chat com Detalhes do Logo */}
      <div className="p-2.5 sm:p-3 border-b border-slate-200 bg-white flex items-center justify-between shrink-0 shadow-2xs">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-[#25F4EE] to-[#FE2C55] text-white flex items-center justify-center font-black shadow-xs shrink-0">
            <Bot className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 leading-none">
              <span className="font-bold text-xs text-slate-900 truncate">TikBlox Copilot IA</span>
              <span className="text-[9px] font-mono px-1.5 py-0.2 rounded-full bg-[#25F4EE]/15 text-[#007A87] font-bold border border-[#25F4EE]/40">
                100% Gratuito
              </span>
            </div>
            <span className="text-[10px] text-slate-500 truncate block mt-0.5">
              {tk ? `Focado em: ${tk.name}` : 'Especialista em TikTok Shop BR'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {messages.length > 0 && (
            <button
              onClick={() => setMessages([])}
              className="p-1 px-1.5 rounded-lg text-[10px] text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition cursor-pointer"
              title="Nova Conversa"
            >
              Limpar
            </button>
          )}

          <button
            onClick={onToggleCollapse}
            className="hidden lg:flex p-1 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
            title="Recolher Copiloto IA para focar no Raio-X"
          >
            <PanelRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Área de Mensagens */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 min-h-0 bg-[#F8FAFC]">
        
        {messages.length === 0 ? (
          <div className="space-y-4 py-2">
            
            {/* Boas-vindas com Estilo TikBlox */}
            <div className="bg-white border border-slate-200/90 rounded-2xl p-3.5 shadow-2xs space-y-2 relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#25F4EE] to-[#FE2C55]" />
              <div className="flex items-center gap-2 pt-1">
                <span className="text-base">👋</span>
                <h4 className="text-xs font-bold text-slate-900">
                  Inteligência de Vendas TikTok Shop Brasil
                </h4>
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                Eu analiso ganchos de 3s, crio roteiros de vídeos para o feed, scripts de live commerce e mensagens para conseguir amostras grátis direto dos fornecedores de SP/PR.
              </p>
              {tk && (
                <div className="p-2 rounded-lg bg-slate-50 border border-slate-200 text-[11px] text-slate-700">
                  <span className="text-[#007A87] font-bold">Produto em análise:</span> {tk.name} (R$ {Number(tk.estimatedPriceBRL || 0).toFixed(2)})
                </div>
              )}
            </div>

            {/* Prompts Rápidos com Borda Lateral com as Cores da Marca */}
            <div className="space-y-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block px-1">
                Ações Imediatas para Este Produto:
              </span>

              {/* Roteiros: Borda Ciano TikBlox */}
              <button
                type="button"
                onClick={() =>
                  handleSendMessage(
                    `Gere 3 roteiros virais de 30 segundos no TikTok para o produto ${tk?.name || 'deste produto'}, focando nos 3 primeiros segundos para prender a atenção do público brasileiro.`
                  )
                }
                className="w-full p-2.5 rounded-xl border border-slate-200/90 border-l-4 border-l-[#25F4EE] bg-white hover:bg-slate-50 text-slate-700 transition-all cursor-pointer shadow-2xs group flex items-start gap-2.5 active:scale-98"
              >
                <span className="p-1 rounded-md bg-[#25F4EE]/15 text-[#007A87] text-xs shrink-0 mt-0.5">
                  🎬
                </span>
                <div className="min-w-0 flex-1 text-left">
                  <div className="text-xs font-bold text-slate-900 group-hover:text-[#007A87] flex items-center justify-between">
                    <span>3 Roteiros Virais de Vídeo (30s)</span>
                    <ArrowUpRight className="w-3 h-3 text-slate-400 group-hover:text-[#007A87]" />
                  </div>
                  <div className="text-[10px] text-slate-500 truncate mt-0.5">
                    Ganchos visuais para prender retenção imediata no feed.
                  </div>
                </div>
              </button>

              {/* Live Commerce: Borda Rosa TikBlox */}
              <button
                type="button"
                onClick={() =>
                  handleSendMessage(
                    `Como estruturar uma Live de 30 minutos vendendo ${tk?.name || 'deste produto'} no TikTok Shop para bater R$ 5.000 em vendas?`
                  )
                }
                className="w-full p-2.5 rounded-xl border border-slate-200/90 border-l-4 border-l-[#FE2C55] bg-white hover:bg-slate-50 text-slate-700 transition-all cursor-pointer shadow-2xs group flex items-start gap-2.5 active:scale-98"
              >
                <span className="p-1 rounded-md bg-[#FE2C55]/10 text-[#FE2C55] text-xs shrink-0 mt-0.5">
                  🔴
                </span>
                <div className="min-w-0 flex-1 text-left">
                  <div className="text-xs font-bold text-slate-900 group-hover:text-[#FE2C55] flex items-center justify-between">
                    <span>Estratégia de Live Commerce</span>
                    <ArrowUpRight className="w-3 h-3 text-slate-400 group-hover:text-[#FE2C55]" />
                  </div>
                  <div className="text-[10px] text-slate-500 truncate mt-0.5">
                    Gatilhos de escassez e como fixar carrinho na live.
                  </div>
                </div>
              </button>

              {/* Amostra Grátis: Borda Verde Esmeralda */}
              <button
                type="button"
                onClick={() =>
                  handleSendMessage(
                    `Escreva uma mensagem profissional para enviar ao fornecedor solicitando amostra grátis de ${tk?.name || 'deste produto'} para divulgação no TikTok Shop.`
                  )
                }
                className="w-full p-2.5 rounded-xl border border-slate-200/90 border-l-4 border-l-emerald-500 bg-white hover:bg-slate-50 text-slate-700 transition-all cursor-pointer shadow-2xs group flex items-start gap-2.5 active:scale-98"
              >
                <span className="p-1 rounded-md bg-emerald-50 text-emerald-800 text-xs shrink-0 mt-0.5">
                  🎁
                </span>
                <div className="min-w-0 flex-1 text-left">
                  <div className="text-xs font-bold text-slate-900 group-hover:text-emerald-700 flex items-center justify-between">
                    <span>Pedir Amostra Grátis ao Fornecedor</span>
                    <ArrowUpRight className="w-3 h-3 text-slate-400 group-hover:text-emerald-700" />
                  </div>
                  <div className="text-[10px] text-slate-500 truncate mt-0.5">
                    Pitch de alta conversão para WhatsApp ou chat do app.
                  </div>
                </div>
              </button>

              {/* Objeções: Borda Âmbar */}
              <button
                type="button"
                onClick={() =>
                  handleSendMessage(
                    `Como quebrar as 3 maiores objeções de quem comenta no vídeo de ${tk?.name || 'deste produto'}?`
                  )
                }
                className="w-full p-2.5 rounded-xl border border-slate-200/90 border-l-4 border-l-amber-500 bg-white hover:bg-slate-50 text-slate-700 transition-all cursor-pointer shadow-2xs group flex items-start gap-2.5 active:scale-98"
              >
                <span className="p-1 rounded-md bg-amber-50 text-amber-800 text-xs shrink-0 mt-0.5">
                  🛡️
                </span>
                <div className="min-w-0 flex-1 text-left">
                  <div className="text-xs font-bold text-slate-900 group-hover:text-amber-800 flex items-center justify-between">
                    <span>Quebrar Objeções nos Comentários</span>
                    <ArrowUpRight className="w-3 h-3 text-slate-400 group-hover:text-amber-800" />
                  </div>
                  <div className="text-[10px] text-slate-500 truncate mt-0.5">
                    Respostas prontas para frete, desconfiança e uso.
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
                    ? 'bg-gradient-to-r from-[#0F172A] to-[#1E293B] text-white font-medium rounded-br-none shadow-2xs'
                    : 'bg-white border border-slate-200 text-slate-800 rounded-bl-none shadow-2xs relative group'
                }`}
              >
                {msg.role === 'assistant' ? (
                  <>
                    <div className="prose prose-xs max-w-none text-slate-800 prose-headings:text-slate-900 prose-strong:text-slate-900 prose-blockquote:border-[#FE2C55] prose-blockquote:bg-rose-50/50 prose-blockquote:py-1 prose-blockquote:px-2 prose-blockquote:rounded">
                      <ReactMarkdown>{msg.content}</ReactMarkdown>
                    </div>

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
          <div className="flex items-center gap-2 p-3 bg-white border border-slate-200 rounded-2xl text-slate-700 text-xs shadow-2xs">
            <Loader2 className="w-4 h-4 text-[#007A87] animate-spin" />
            <span>Consultando inteligência de vendas TikTok Shop...</span>
          </div>
        )}

        <div ref={chatScrollRef} />
      </div>

      {/* Input de Envio com Botão em Gradiente Ciano TikBlox */}
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
          placeholder={tk ? `Pergunte sobre ${tk.name}...` : 'Digite sua dúvida ou estratégia...'}
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
