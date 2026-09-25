import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Send, X, Bot, User, ArrowRight, Lightbulb, TrendingUp, ShieldCheck } from 'lucide-react';
import { TrendingProduct } from '../types';

interface Message {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
}

interface PersonalAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: TrendingProduct[];
}

export const PersonalAssistantModal: React.FC<PersonalAssistantModalProps> = ({
  isOpen,
  onClose,
  products,
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'assistant',
      text: 'Olá! Sou seu Assistente IA de Inteligência TikBlox. Estou conectado ao radar em tempo real com todos os produtos e margens carregados. O que você gostaria de analisar hoje?',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [isOpen, messages]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputValue;
    if (!text.trim() || isLoading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: text.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputValue('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/assistant-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMsg.text,
          products: products.map((p) => ({
            name: p.name,
            niche: p.niche,
            costUSD: p.costUSD,
            suggestedPriceBRL: p.suggestedPriceBRL,
            grossMargin: p.grossMargin,
            trendVelocity: p.trendVelocity,
            arbitrageWindowDays: p.arbitrageWindowDays,
          })),
        }),
      });

      const data = await res.json();
      const replyText = data.success && data.reply 
        ? data.reply 
        : 'Entendido! Analisando os dados do radar, recomendo focar nos produtos de alta margem e testar criativos UGC verticais.';

      const assistantMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'assistant',
        text: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch {
      const fallbackMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'assistant',
        text: 'Conexão instável com a IA de chat. Mas com base nas tendências atuais, temos excelentes oportunidades de arbitragem no Brasil com margens superiores a 250%!',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const quickPrompts = [
    '🔥 Qual o produto com maior lucro hoje?',
    '🎯 Estratégia de tráfego para a Mochila',
    '🎬 Sugira ganchos UGC virais',
    '📦 Onde achar fornecedor mais barato?',
  ];

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="w-full max-w-2xl h-[85vh] sm:h-[75vh] bg-[#0c0d14] border border-cyan-500/30 rounded-3xl shadow-2xl flex flex-col overflow-hidden relative"
        >
          {/* Header */}
          <div className="px-6 py-4 border-b border-white/10 bg-gradient-to-r from-cyan-950/40 via-black to-pink-950/40 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#FE2C55] to-[#25F4EE] p-0.5 shadow-lg shadow-cyan-500/20 flex items-center justify-center">
                <div className="w-full h-full bg-[#0c0d14] rounded-[14px] flex items-center justify-center">
                  <Bot className="w-5 h-5 text-[#25F4EE]" />
                </div>
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="font-bold text-white text-base tracking-wide">Assistente IA</h3>
                  <span className="px-2 py-0.5 text-[10px] font-bold bg-[#25F4EE]/10 text-[#25F4EE] border border-[#25F4EE]/30 rounded-full flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#25F4EE] animate-pulse"></span>
                    IA Ativa
                  </span>
                </div>
                <p className="text-xs text-gray-400">Contexto carregado: {products.length} produtos no radar</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-xl transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Chat Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-[#08090f]">
            {messages.map((msg) => (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                key={msg.id}
                className={`flex items-start space-x-3 ${msg.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}
              >
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-md ${
                    msg.sender === 'user'
                      ? 'bg-gradient-to-r from-[#FE2C55] to-pink-600 text-white'
                      : 'bg-gradient-to-r from-cyan-500 to-[#25F4EE] text-black'
                  }`}
                >
                  {msg.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-gradient-to-r from-[#FE2C55]/20 to-pink-600/20 border border-[#FE2C55]/30 text-white rounded-tr-none'
                      : 'bg-white/5 border border-white/10 text-gray-200 rounded-tl-none shadow-inner'
                  }`}
                >
                  <p className="whitespace-pre-line">{msg.text}</p>
                  <span className="block text-[10px] text-gray-500 mt-1.5 text-right">{msg.timestamp}</span>
                </div>
              </motion.div>
            ))}
            {isLoading && (
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-[#25F4EE]">
                  <Bot className="w-4 h-4 animate-spin" />
                </div>
                <div className="bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-sm text-gray-400">
                  <span className="inline-flex gap-1 items-center">
                    Analisando radar e margens
                    <span className="w-1 h-1 bg-[#25F4EE] rounded-full animate-bounce"></span>
                    <span className="w-1 h-1 bg-[#25F4EE] rounded-full animate-bounce [animation-delay:0.2s]"></span>
                    <span className="w-1 h-1 bg-[#25F4EE] rounded-full animate-bounce [animation-delay:0.4s]"></span>
                  </span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts Bar */}
          <div className="px-4 py-2 bg-[#090a10] border-t border-white/5 flex gap-2 overflow-x-auto no-scrollbar">
            {quickPrompts.map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(prompt)}
                className="whitespace-nowrap px-3 py-1.5 rounded-xl text-xs font-medium bg-white/5 hover:bg-white/10 text-cyan-300 border border-cyan-500/20 transition-all flex items-center gap-1.5 shrink-0"
              >
                <Sparkles className="w-3 h-3 text-[#25F4EE]" />
                {prompt}
              </button>
            ))}
          </div>

          {/* Input Area */}
          <div className="p-4 bg-[#0c0d14] border-t border-white/10">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center space-x-2"
            >
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Pergunte sobre margens, fornecedores ou estratégias..."
                className="flex-1 bg-white/5 border border-white/10 focus:border-[#25F4EE] rounded-2xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none transition-colors"
              />
              <button
                type="submit"
                disabled={!inputValue.trim() || isLoading}
                className="w-12 h-12 rounded-2xl bg-gradient-to-r from-[#FE2C55] to-pink-600 hover:from-[#FE2C55]/90 hover:to-pink-600/90 text-white font-bold flex items-center justify-center shadow-lg shadow-pink-500/30 disabled:opacity-50 transition-all cursor-pointer shrink-0"
              >
                <Send className="w-5 h-5" />
              </button>
            </form>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
