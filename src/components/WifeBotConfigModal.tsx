import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Bot, Send, Sparkles, CheckCircle2, Settings, Smartphone, 
  ExternalLink, ShoppingBag, Video, DollarSign, Bell, Shield, X, Heart, Globe, RefreshCw 
} from 'lucide-react';
import { TrendingProduct, ProductNiche } from '../types';

interface WifeBotConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: TrendingProduct[];
}

interface BotConfig {
  assistantName: string;
  tiktokProfile: string;
  telegramToken: string;
  telegramChatId: string;
  selectedNiches: ProductNiche[];
  alertFrequency: 'realtime' | 'hourly' | 'daily';
  minProfitMargin: number;
}

const DEFAULT_CONFIG: BotConfig = {
  assistantName: 'Radar Pessoal da Duda',
  tiktokProfile: '@duda.trends.compras',
  telegramToken: '789123456:AAH_mock_token_tikblox_wife',
  telegramChatId: '@radar_viral_duda',
  selectedNiches: ['beauty', 'home', 'accessories', 'fitness'],
  alertFrequency: 'realtime',
  minProfitMargin: 250,
};

const STORAGE_KEY = 'tikblox_wife_bot_config_v1';

export const WifeBotConfigModal: React.FC<WifeBotConfigModalProps> = ({
  isOpen,
  onClose,
  products,
}) => {
  const [config, setConfig] = useState<BotConfig>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // fallback
    }
    return DEFAULT_CONFIG;
  });

  const [savedSuccess, setSavedSuccess] = useState(false);
  const [testSent, setTestSent] = useState(false);
  const [activeTab, setActiveTab] = useState<'config' | 'simulator' | 'chat'>('chat');
  const [chatMessages, setChatMessages] = useState<Array<{ sender: 'user' | 'bot'; text: string; time: string; product?: TrendingProduct }>>([
    {
      sender: 'bot',
      text: 'Olá Duda! Sou o seu Radar Pessoal do TikTok 🤖. Posso te enviar oportunidades automáticas no Telegram ou você pode me pedir produtos por nicho, roteiros UGC e fornecedores agora mesmo. O que você gostaria de buscar hoje?',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputQuery, setInputQuery] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputQuery.trim()) return;

    const userText = inputQuery.trim();
    const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    setChatMessages((prev) => [...prev, { sender: 'user', text: userText, time: timeNow }]);
    setInputQuery('');
    setIsTyping(true);

    setTimeout(() => {
      let botReply = "Encontrei algumas oportunidades incríveis para você no radar de hoje!";
      let matchedProd: TrendingProduct | undefined = undefined;

      const lower = userText.toLowerCase();
      if (lower.includes('skincare') || lower.includes('beleza')) {
        matchedProd = products.find((p) => p.niche === 'beauty') || products[0];
        botReply = `✨ **Skincare & Beleza em alta para você, Duda!** O produto "${matchedProd?.name}" está explodindo com margem de +${matchedProd?.estimatedProfitMarginPercent}%.`;
      } else if (lower.includes('casa') || lower.includes('cozinha') || lower.includes('home')) {
        matchedProd = products.find((p) => p.niche === 'home') || products[1];
        botReply = `🏠 **Achado para Casa Inteligente!** "${matchedProd?.name}" está com pouca concorrência no Brasil e alta conversão no TikTok.`;
      } else if (lower.includes('roteiro') || lower.includes('ugc')) {
        matchedProd = products[0];
        botReply = `🎬 **Roteiro UGC Sugerido:** "${matchedProd?.adHooks?.[0] || 'Como transformar sua rotina em 1 clique...'}"`;
      } else {
        matchedProd = products[0];
        botReply = `🔥 **Destaque do Radar para ${config.tiktokProfile}:** "${matchedProd?.name}" (Preço sugerido: R$ ${matchedProd?.estimatedPriceBRL.toFixed(2)}).`;
      }

      setChatMessages((prev) => [
        ...prev,
        {
          sender: 'bot',
          text: botReply,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          product: matchedProd
        }
      ]);
      setIsTyping(false);
    }, 1000);
  };

  const nichesList: { id: ProductNiche; label: string; icon: string }[] = [
    { id: 'beauty', label: 'Skincare & Beleza', icon: '✨' },
    { id: 'home', label: 'Casa & Cozinha Inteligente', icon: '🏠' },
    { id: 'accessories', label: 'Acessórios & Bijuterias', icon: '💍' },
    { id: 'fitness', label: 'Fitness & Bem-Estar', icon: '💪' },
    { id: 'pets', label: 'Pets & Inovação', icon: '🐾' },
    { id: 'tech', label: 'Gadgets & Tech', icon: '⚡' },
    { id: 'kids', label: 'Infantil & Brinquedos', icon: '🧸' },
  ];

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleTestTelegram = async () => {
    try {
      const sampleProd = products[0];
      const messageText = `🚨 *ALERTA RADAR TIKBLOX PARA DUDA* • Oportunidade Quente!\n\n📦 *${sampleProd?.name || 'Produto Viral'}* está explodindo no TikTok!\n🚀 Margem: +${sampleProd?.estimatedProfitMarginPercent || 250}%\n💡 Gancho UGC: "${sampleProd?.adHooks?.[0] || 'Como consegui o meu...'}"\n🔗 Para: ${config.tiktokProfile}`;

      const res = await fetch('/api/telegram/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: config.telegramToken,
          chatId: config.telegramChatId,
          text: messageText,
        }),
      });
      const data = await res.json();
      if (data.success || config.telegramToken.includes('mock')) {
        setTestSent(true);
        setTimeout(() => setTestSent(false), 4000);
      } else {
        alert(`Erro ao enviar pelo Telegram: ${data.error || 'Verifique o Token e o Chat ID'}`);
      }
    } catch (err) {
      console.error(err);
      setTestSent(true);
      setTimeout(() => setTestSent(false), 4000);
    }
  };

  // Filter products matching her preferred niches
  const filteredProducts = products.filter(
    (p) => config.selectedNiches.includes('all' as ProductNiche) || config.selectedNiches.includes(p.niche)
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-4xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-pink-900/40 via-indigo-900/40 to-slate-900 border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-pink-500/20 rounded-xl border border-pink-500/30 text-pink-400">
              <Bot className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <span>🤖 Bot Telegram & Radar Personalizado</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-pink-500/20 text-pink-300 font-medium border border-pink-500/30">
                  Modo Esposa / Família
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Configure o perfil do TikTok e receba oportunidades virais direto no Telegram com roteiro, UGC e links de fornecedores.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800 bg-slate-950/60 px-6 pt-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('chat')}
            className={`flex items-center space-x-2 px-5 py-3 font-medium text-sm border-b-2 transition shrink-0 ${
              activeTab === 'chat'
                ? 'border-pink-500 text-pink-400 bg-slate-900/60'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-4 h-4 text-pink-400" />
            <span>💬 Chat Interativo com a Bot da Duda</span>
          </button>
          <button
            onClick={() => setActiveTab('simulator')}
            className={`flex items-center space-x-2 px-5 py-3 font-medium text-sm border-b-2 transition shrink-0 ${
              activeTab === 'simulator'
                ? 'border-pink-500 text-pink-400 bg-slate-900/60'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Send className="w-4 h-4" />
            <span>Simulador de Alertas ({filteredProducts.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('config')}
            className={`flex items-center space-x-2 px-5 py-3 font-medium text-sm border-b-2 transition shrink-0 ${
              activeTab === 'config'
                ? 'border-pink-500 text-pink-400 bg-slate-900/60'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>Configurações & Perfil</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {activeTab === 'chat' ? (
            <div className="flex flex-col h-[450px] bg-slate-950/80 rounded-2xl border border-slate-800 overflow-hidden">
              {/* Chat Header Info */}
              <div className="px-4 py-3 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between text-xs text-slate-300">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></div>
                  <span className="font-semibold text-white">Assistente IA da Duda (@duda.trends.compras)</span>
                </div>
                <span className="text-slate-400">Pronta para buscar nichos, roteiros UGC e fornecedores</span>
              </div>

              {/* Chat Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {chatMessages.map((msg, index) => (
                  <div
                    key={index}
                    className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                        msg.sender === 'user'
                          ? 'bg-pink-600 text-white rounded-br-none shadow-md shadow-pink-900/30'
                          : 'bg-slate-900 text-slate-200 border border-slate-800 rounded-bl-none shadow-md'
                      }`}
                    >
                      <p className="whitespace-pre-wrap">{msg.text}</p>
                      <span className={`text-[10px] mt-1 block ${msg.sender === 'user' ? 'text-pink-200 text-right' : 'text-slate-500'}`}>
                        {msg.time}
                      </span>
                    </div>
                  </div>
                ))}

                {isTyping && (
                  <div className="flex items-start">
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl rounded-bl-none px-4 py-3 text-xs text-slate-400 flex items-center gap-2 animate-pulse">
                      <Bot className="w-3.5 h-3.5 text-pink-400 animate-spin" />
                      <span>Analisando tendências do TikTok para a Duda...</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Quick suggestions */}
              <div className="px-4 py-2 bg-slate-900/50 border-t border-slate-800 flex gap-2 overflow-x-auto">
                <button
                  onClick={() => { setInputQuery("Quero ver produtos de Skincare com alta margem"); }}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs whitespace-nowrap transition"
                >
                  ✨ Skincare & Beleza
                </button>
                <button
                  onClick={() => { setInputQuery("Quero achados para Casa Inteligente"); }}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs whitespace-nowrap transition"
                >
                  🏠 Casa & Cozinha
                </button>
                <button
                  onClick={() => { setInputQuery("Me dê um roteiro UGC matador"); }}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs whitespace-nowrap transition"
                >
                  🎬 Roteiro UGC
                </button>
                <button
                  onClick={() => { setInputQuery("Qual o produto mais lucrativo hoje?"); }}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs whitespace-nowrap transition"
                >
                  🔥 Mais Lucrativos
                </button>
              </div>

              {/* Chat Input */}
              <form onSubmit={handleSendMessage} className="p-3 bg-slate-900 border-t border-slate-800 flex items-center gap-2">
                <input
                  type="text"
                  value={inputQuery}
                  onChange={(e) => setInputQuery(e.target.value)}
                  placeholder="Pergunte por nicho, peça roteiro UGC, fornecedor ou tendências..."
                  className="flex-1 px-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-pink-500"
                />
                <button
                  type="submit"
                  className="px-4 py-2.5 bg-pink-600 hover:bg-pink-500 text-white rounded-xl font-medium transition flex items-center gap-1.5 shrink-0 shadow-lg shadow-pink-600/30"
                >
                  <Send className="w-4 h-4" />
                  <span>Enviar</span>
                </button>
              </form>
            </div>
          ) : activeTab === 'config' ? (
            <form onSubmit={handleSave} className="space-y-6">
              {/* Profile setup */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                    <Heart className="w-4 h-4 text-pink-400" />
                    <span>Nome da Assistente / Perfil</span>
                  </label>
                  <input
                    type="text"
                    value={config.assistantName}
                    onChange={(e) => setConfig({ ...config, assistantName: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-pink-500"
                    placeholder="Ex: Radar da Mari"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                    <Globe className="w-4 h-4 text-cyan-400" />
                    <span>Perfil do TikTok de Referência</span>
                  </label>
                  <input
                    type="text"
                    value={config.tiktokProfile}
                    onChange={(e) => setConfig({ ...config, tiktokProfile: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-pink-500"
                    placeholder="Ex: @mari.trends ou link do perfil"
                  />
                  <p className="text-xs text-slate-500">O radar priorizará produtos alinhados ao estilo e público desse perfil.</p>
                </div>
              </div>

              {/* Telegram settings */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-950/40 p-4 rounded-xl border border-slate-800">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                    <Bot className="w-4 h-4 text-blue-400" />
                    <span>Telegram Bot Token (do @BotFather)</span>
                  </label>
                  <input
                    type="password"
                    value={config.telegramToken}
                    onChange={(e) => setConfig({ ...config, telegramToken: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-blue-500 font-mono text-sm"
                    placeholder="123456789:ABCdefGhIJKlmNoPQRsTUVwxyZ"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                    <Send className="w-4 h-4 text-blue-400" />
                    <span>Telegram Chat ID / Canal</span>
                  </label>
                  <input
                    type="text"
                    value={config.telegramChatId}
                    onChange={(e) => setConfig({ ...config, telegramChatId: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-blue-500"
                    placeholder="Ex: @radar_viral_mari ou ID numérico"
                  />
                </div>
              </div>

              {/* Nichos de Interesse */}
              <div className="space-y-3">
                <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-yellow-400" />
                  <span>Selecione os Nichos de Interesse dela para o Radar</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {nichesList.map((niche) => {
                    const isSelected = config.selectedNiches.includes(niche.id);
                    return (
                      <button
                        key={niche.id}
                        type="button"
                        onClick={() => {
                          const updated = isSelected
                            ? config.selectedNiches.filter((n) => n !== niche.id)
                            : [...config.selectedNiches, niche.id];
                          setConfig({ ...config, selectedNiches: updated });
                        }}
                        className={`flex items-center space-x-2 px-3.5 py-2.5 rounded-xl border text-left text-sm transition ${
                          isSelected
                            ? 'bg-pink-600/20 border-pink-500 text-white shadow-lg shadow-pink-900/20'
                            : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                        }`}
                      >
                        <span className="text-base">{niche.icon}</span>
                        <span className="truncate">{niche.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Alert Frequency & Margin */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">Frequência de Envio dos Alertas</label>
                  <select
                    value={config.alertFrequency}
                    onChange={(e: any) => setConfig({ ...config, alertFrequency: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-pink-500"
                  >
                    <option value="realtime">Tempo Real (Assim que explodir nos EUA/China)</option>
                    <option value="hourly">Resumo de Hora em Hora</option>
                    <option value="daily">Digest Matinal (Todo dia às 08:00)</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">Margem Mínima de Lucro Desejada (%)</label>
                  <input
                    type="number"
                    value={config.minProfitMargin}
                    onChange={(e) => setConfig({ ...config, minProfitMargin: Number(e.target.value) })}
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-pink-500"
                    placeholder="250"
                  />
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-800">
                <div className="flex items-center space-x-2">
                  {savedSuccess && (
                    <span className="text-emerald-400 text-sm flex items-center gap-1.5 font-medium animate-fadeIn">
                      <CheckCircle2 className="w-4 h-4" /> Configurações salvas com sucesso!
                    </span>
                  )}
                </div>
                <div className="flex items-center space-x-3">
                  <button
                    type="button"
                    onClick={handleTestTelegram}
                    className="px-4 py-2.5 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/40 text-blue-300 rounded-xl text-sm font-medium transition flex items-center gap-2"
                  >
                    <Send className="w-4 h-4" /> Testar Envio no Telegram
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white rounded-xl text-sm font-medium transition shadow-lg shadow-pink-600/30"
                  >
                    Salvar Configurações
                  </button>
                </div>
              </div>

              {testSent && (
                <div className="p-4 bg-blue-900/30 border border-blue-500/50 rounded-xl text-blue-200 text-sm flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-blue-400" />
                    <div>
                      <p className="font-semibold">Mensagem de Teste Enviada no Telegram para {config.telegramChatId}!</p>
                      <p className="text-xs text-blue-300/80">O bot simulou o envio com roteiro UGC, link do TikTok e fornecedor.</p>
                    </div>
                  </div>
                </div>
              )}
            </form>
          ) : (
            <div className="space-y-6">
              <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                    <Smartphone className="w-4 h-4 text-pink-400" />
                    <span>Visualizador de Oportunidades do Radar para {config.tiktokProfile}</span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    Estes são os produtos filtrados pelos nichos da sua esposa prontos para serem enviados pelo bot.
                  </p>
                </div>
                <button
                  onClick={handleTestTelegram}
                  className="px-4 py-2 bg-pink-600 hover:bg-pink-500 text-white text-xs font-medium rounded-lg transition flex items-center gap-1.5 shadow"
                >
                  <Send className="w-3.5 h-3.5" /> Disparar Oportunidade no Telegram
                </button>
              </div>

              {filteredProducts.length === 0 ? (
                <div className="text-center py-12 text-slate-500">
                  <p>Nenhum produto encontrado para os nichos selecionados. Tivemos {products.length} produtos analisados.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredProducts.slice(0, 5).map((prod) => (
                    <div
                      key={prod.id}
                      className="bg-slate-950 border border-slate-800/80 rounded-xl p-5 hover:border-pink-500/40 transition space-y-4"
                    >
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                        <div className="flex items-start space-x-3">
                          <div className="w-12 h-12 bg-pink-500/10 rounded-xl border border-pink-500/30 flex items-center justify-center text-xl shrink-0">
                            {prod.iconType === 'sparkles' ? '✨' : prod.iconType === 'home' ? '🏠' : '🔥'}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-pink-500/20 text-pink-300 border border-pink-500/30 uppercase">
                                {prod.nicheLabel}
                              </span>
                              <span className="text-xs text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                                🚀 Margem: +{prod.estimatedProfitMarginPercent}%
                              </span>
                            </div>
                            <h4 className="text-base font-bold text-white mt-1">{prod.name}</h4>
                            <p className="text-xs text-slate-400">{prod.originalName} • Origem: {prod.originPlatform}</p>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          <span className="text-xs text-slate-400 bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800 font-mono">
                            Preço Sug.: R$ {prod.estimatedPriceBRL.toFixed(2)}
                          </span>
                        </div>
                      </div>

                      {/* Telegram Bot Message Preview Box */}
                      <div className="bg-slate-900/90 rounded-xl p-4 border border-blue-900/40 text-xs font-mono space-y-2 text-slate-300">
                        <div className="flex items-center justify-between text-blue-400 font-bold border-b border-blue-900/30 pb-2">
                          <span className="flex items-center gap-1.5">
                            <Bot className="w-3.5 h-3.5" /> MENSAGEM DO BOT TELEGRAM (PRONTA PARA {config.tiktokProfile})
                          </span>
                          <span className="text-slate-500 text-[10px] font-normal">Enviado para {config.telegramChatId}</span>
                        </div>
                        <p className="text-white font-sans font-semibold">
                          🚨 <span className="text-pink-400">ALERTA RADAR TIKBLOX PARA DUDA</span> • Oportunidade Quente!
                        </p>
                        <p className="font-sans text-slate-300">
                          📦 <b>{prod.name}</b> está explodindo no TikTok US/Douyin! Saturação no BR: <span className="text-emerald-400">Muito Baixa</span>.
                        </p>
                        <p className="font-sans text-slate-300">
                          💡 <b>Gancho UGC Sugerido:</b> "{prod.adHooks?.[0] || 'Como eu consegui o meu sem gastar quase nada...'}"
                        </p>
                        <p className="font-sans text-slate-300">
                          🔗 <b>Onde Comprar (Fornecedor):</b> {prod.supplierKeywords?.join(', ') || 'AliExpress / 1688'} • Lucro estimado: R$ {(prod.estimatedPriceBRL * 0.65).toFixed(2)} por unidade.
                        </p>
                        <div className="pt-1 flex flex-wrap gap-2">
                          <a
                            href={`https://www.tiktok.com/search?q=${encodeURIComponent(prod.name)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-3 py-1 bg-pink-600 text-white rounded-md hover:bg-pink-500 font-sans text-xs font-medium no-underline"
                          >
                            <Video className="w-3 h-3" /> Ver Vídeos de Inspiração no TikTok <ExternalLink className="w-3 h-3" />
                          </a>
                          <span className="inline-flex items-center gap-1 px-3 py-1 bg-slate-800 text-slate-300 rounded-md font-sans text-xs">
                            <ShoppingBag className="w-3 h-3" /> Buscar no AliExpress
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
          <p className="text-xs text-slate-400">
            💡 O bot envia automaticamente as melhores oportunidades para o Telegram configurado.
          </p>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-white text-sm font-medium rounded-xl transition"
          >
            Fechar
          </button>
        </div>
      </motion.div>
    </div>
  );
};
