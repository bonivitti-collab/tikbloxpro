import React, { useState, useRef, useEffect } from 'react';
import { Bot, X, Sparkles, Send, Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface AICopilotModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export const AICopilotModal: React.FC<AICopilotModalProps> = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content: 'Olá! Sou o **Copiloto Estratégico Gemini** do TikBlox Pro. Estou aqui para te ajudar a analisar métricas, encontrar nichos lucrativos e traçar estratégias de vendas. Como posso ajudar o seu negócio hoje?'
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  if (!isOpen) return null;

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [...messages, { role: 'user', content: userMessage }]
        }),
      });

      if (!response.ok) {
        throw new Error('Falha ao comunicar com a IA');
      }

      const data = await response.json();
      
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: data.reply || 'Não consegui processar essa resposta.' }
      ]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: '⚠️ Houve um erro de conexão com a IA. Tente novamente em instantes.' }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      <div className="relative w-full max-w-2xl bg-[#1A1D27] border border-[#25F4EE]/30 rounded-2xl shadow-2xl flex flex-col overflow-hidden" style={{ maxHeight: '85vh', height: '600px' }}>
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#2A2E39] bg-[#161823]">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-[#25F4EE]/20 to-[#FE2C55]/20 border border-[#25F4EE]/40 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-[#25F4EE]" />
            </div>
            <div>
              <h2 className="text-base font-black text-white flex items-center gap-2">
                Copiloto Estratégico IA
                <span className="px-1.5 py-0.5 rounded-md bg-[#FE2C55]/20 text-[#FE2C55] text-[10px] uppercase font-bold tracking-wider">
                  Gemini
                </span>
              </h2>
              <p className="text-xs text-[#A6A7B2]">Seu assistente de tendências e tráfego</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-lg text-[#A6A7B2] hover:text-white hover:bg-[#2A2E39] transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#111219]">
          {messages.map((msg, idx) => (
            <div 
              key={idx} 
              className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div 
                className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-3.5 text-sm leading-relaxed ${
                  msg.role === 'user' 
                    ? 'bg-gradient-to-r from-[#25F4EE] to-[#00D4FF] text-slate-900 font-medium rounded-tr-sm' 
                    : 'bg-[#1A1D27] border border-[#2A2E39] text-[#E0E1E8] rounded-tl-sm'
                }`}
              >
                {msg.role === 'assistant' ? (
                  <div className="prose prose-invert prose-sm max-w-none">
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  </div>
                ) : (
                  msg.content
                )}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex w-full justify-start">
              <div className="max-w-[85%] sm:max-w-[75%] rounded-2xl p-3.5 bg-[#1A1D27] border border-[#2A2E39] text-[#E0E1E8] rounded-tl-sm flex items-center gap-2">
                <Loader2 className="w-4 h-4 text-[#25F4EE] animate-spin" />
                <span className="text-xs text-[#A6A7B2]">Gemini está pensando...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 border-t border-[#2A2E39] bg-[#161823]">
          <div className="flex items-center gap-2 relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSend();
              }}
              placeholder="Pergunte sobre produtos, margens ou estratégias..."
              className="flex-1 bg-[#111219] border border-[#2A2E39] rounded-xl px-4 py-3.5 text-sm text-white placeholder-[#5E6070] focus:outline-none focus:border-[#25F4EE] transition"
              disabled={isLoading}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className="absolute right-2 p-2 rounded-lg bg-[#25F4EE] text-slate-900 hover:bg-[#00D4FF] disabled:opacity-50 disabled:cursor-not-allowed transition cursor-pointer flex items-center justify-center"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
          <p className="text-[10px] text-center text-[#5E6070] mt-2">
            O Copiloto IA pode cometer erros. Verifique informações importantes sobre produtos e fretes.
          </p>
        </div>

      </div>
    </div>
  );
};
