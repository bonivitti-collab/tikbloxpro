import React, { useEffect, useState } from 'react';
import { X, Video, Copy, Check, Sparkles, Film, Music, MessageSquare } from 'lucide-react';
import { TrendingProduct, AdCreativeScript } from '../types';
import { generateAdScripts } from '../services/api';
import { useTranslation } from '../i18n/LanguageContext';

interface AdCreativeModalProps {
  product: TrendingProduct | null;
  onClose: () => void;
}

export const AdCreativeModal: React.FC<AdCreativeModalProps> = ({
  product,
  onClose,
}) => {
  const { t, language } = useTranslation();
  const [scripts, setScripts] = useState<AdCreativeScript[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  useEffect(() => {
    if (!product) return;
    let isMounted = true;
    setIsLoading(true);

    generateAdScripts(product).then((data) => {
      if (isMounted) {
        setScripts(data);
        setIsLoading(false);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [product]);

  if (!product) return null;

  const handleCopyScript = (script: AdCreativeScript, index: number) => {
    const fullText = `${language === 'en' ? 'TIKBLOX UGC SCRIPT' : 'ROTEIRO UGC TIKBLOX'} - ${script.title}
${language === 'en' ? 'Platform' : 'Plataforma'}: ${script.targetPlatform}
${language === 'en' ? '3s Hook' : 'Gancho (3s)'}: "${script.hook3Seconds}"

${language === 'en' ? 'Spoken Script' : 'Roteiro Falado'}:
${script.bodyScript}

${language === 'en' ? 'Call to Action (CTA)' : 'Chamada para Ação (CTA)'}:
${script.callToAction}

${language === 'en' ? 'Visual Directions' : 'Direção Visual'}:
${script.visualDirections.map((dir, i) => `${i + 1}. ${dir}`).join('\n')}

${language === 'en' ? 'Audio Style' : 'Estilo de Áudio'}: ${script.audioStyle}
`;
    navigator.clipboard.writeText(fullText);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl text-slate-100 my-8 overflow-hidden max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 bg-slate-950/60 p-4 sm:p-5 sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-pink-500/20 border border-pink-500/30">
              <Video className="h-5 w-5 text-pink-400" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <span className="rounded-full bg-pink-500/20 border border-pink-500/30 px-2 py-0.2 text-[10px] font-bold text-pink-300 uppercase">
                  {language === 'en' ? 'AI Viral Ad Script Generator' : 'Gerador de Criativos Virais IA'}
                </span>
                <span className="text-xs text-slate-400">TikTok & Reels</span>
              </div>
              <h2 className="text-base sm:text-lg font-bold text-white">
                {language === 'en' ? `UGC Scripts for ${product.name}` : `Roteiros UGC para ${product.name}`}
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-xl p-2 text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
            title={language === 'en' ? 'Close' : 'Fechar'}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {isLoading ? (
            <div className="py-16 text-center">
              <Sparkles className="w-8 h-8 text-cyan-400 animate-spin mx-auto mb-3" />
              <h3 className="text-sm font-semibold text-white">
                {language === 'en'
                  ? 'Generating high-converting viral hooks and scripts...'
                  : 'Gerando ganchos e roteiros virais adaptados ao público brasileiro...'}
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                {language === 'en'
                  ? 'Analyzing high-converting patterns on TikTok Ads.'
                  : 'Analisando padrões que convertem no TikTok Ads Brasil.'}
              </p>
            </div>
          ) : (
            scripts.map((script, idx) => (
              <div
                key={idx}
                className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4 sm:p-5 hover:border-slate-700 transition"
              >
                {/* Script Card Header */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="rounded-md bg-cyan-500/10 border border-cyan-500/30 px-2 py-0.5 text-[11px] font-bold text-cyan-300">
                      {script.targetPlatform}
                    </span>
                    <h3 className="text-sm font-bold text-white">
                      {script.title}
                    </h3>
                  </div>

                  <button
                    onClick={() => handleCopyScript(script, idx)}
                    className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-200 hover:text-white hover:bg-slate-700 transition cursor-pointer"
                  >
                    {copiedIndex === idx ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400">
                          {language === 'en' ? 'Script Copied!' : 'Roteiro Copiado!'}
                        </span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>
                          {language === 'en' ? 'Copy Full Script' : 'Copiar Roteiro Completo'}
                        </span>
                      </>
                    )}
                  </button>
                </div>

                {/* 3-Second Hook */}
                <div className="rounded-xl border border-pink-500/30 bg-pink-950/20 p-3 mb-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-pink-400 block mb-1">
                    🎯 {language === 'en' ? 'Retention Hook (0 to 3 Seconds):' : 'Gancho de Retenção (0 a 3 Segundos):'}
                  </span>
                  <p className="text-xs sm:text-sm font-bold text-white leading-snug">
                    "{script.hook3Seconds}"
                  </p>
                </div>

                {/* Body Script */}
                <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-3 mb-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 mb-1">
                    <MessageSquare className="w-3 h-3 text-cyan-400" />
                    <span>{language === 'en' ? 'Spoken Voiceover:' : 'Fala do Vídeo (Tom de Criador):'}</span>
                  </span>
                  <p className="text-xs text-slate-200 leading-relaxed whitespace-pre-line">
                    {script.bodyScript}
                  </p>
                </div>

                {/* Visual Directions & Audio */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80">
                    <span className="font-semibold text-slate-300 flex items-center gap-1.5 mb-1.5">
                      <Film className="w-3.5 h-3.5 text-cyan-400" />
                      <span>{language === 'en' ? 'Visual Shots / Recording Directions:' : 'Cenas / Direção de Gravação:'}</span>
                    </span>
                    <ul className="space-y-1 text-[11px] text-slate-400">
                      {script.visualDirections.map((dir, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <span className="text-cyan-400 font-bold">•</span>
                          <span>{dir}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 flex flex-col justify-between">
                    <div>
                      <span className="font-semibold text-slate-300 flex items-center gap-1.5 mb-1.5">
                        <Music className="w-3.5 h-3.5 text-pink-400" />
                        <span>{language === 'en' ? 'Recommended Audio & Soundtrack:' : 'Trilha & Áudio Recomendado:'}</span>
                      </span>
                      <p className="text-[11px] text-slate-400">
                        {script.audioStyle}
                      </p>
                    </div>

                    <div className="mt-2 pt-2 border-t border-slate-800">
                      <span className="text-[10px] text-emerald-400 font-bold uppercase block">
                        {language === 'en' ? 'Call to Action (CTA):' : 'Chamada Final (CTA):'}
                      </span>
                      <p className="text-[11px] text-white font-medium italic">
                        "{script.callToAction}"
                      </p>
                    </div>
                  </div>
                </div>

              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-slate-800 bg-slate-950/80 p-4 flex justify-between items-center text-xs text-slate-400">
          <span>
            {language === 'en'
              ? 'Tip: shoot in 9:16 vertical video format with good lighting and clear audio.'
              : 'Dica: grave em formato vertical 9:16 com boa iluminação e legendas coloridas automáticas.'}
          </span>
          <button
            onClick={onClose}
            className="rounded-xl bg-slate-800 hover:bg-slate-700 px-4 py-1.5 text-xs font-semibold text-white transition cursor-pointer"
          >
            {language === 'en' ? 'Close' : 'Fechar'}
          </button>
        </div>

      </div>
    </div>
  );
};
