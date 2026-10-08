import React, { useState } from 'react';
import { Download, Copy, Check, X, Layers, Type, Sparkles, ExternalLink, FileText } from 'lucide-react';

interface BrandAssetsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BrandAssetsModal: React.FC<BrandAssetsModalProps> = ({ isOpen, onClose }) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  if (!isOpen) return null;

  const assets = [
    {
      id: 'symbol',
      title: 'Símbolo 3D Blox (Com Container Squircle)',
      description: 'Ideal para foto de perfil, ícone de app, avatar, favicon e redes sociais.',
      filename: 'tikblox-symbol.svg',
      path: '/tikblox-symbol.svg',
      preview: '/tikblox-symbol.svg',
      isSymbol: true,
    },
    {
      id: 'symbol-transparent',
      title: 'Símbolo 3D Blox (Fundo Transparente)',
      description: 'Apenas os cubos 3D isométricos com efeito cromático para aplicar em qualquer layout ou Figma.',
      filename: 'tikblox-symbol-transparent.svg',
      path: '/tikblox-symbol-transparent.svg',
      preview: '/tikblox-symbol-transparent.svg',
      isSymbol: true,
    },
    {
      id: 'typography',
      title: 'Tipografia TIKBLOX (Com Fundo Escuro)',
      description: 'Logotype com efeito cromático vetorial e submarca "RADAR BR • SPY VIRAL".',
      filename: 'tikblox-typography.svg',
      path: '/tikblox-typography.svg',
      preview: '/tikblox-typography.svg',
      isSymbol: false,
    },
    {
      id: 'typography-transparent',
      title: 'Tipografia TIKBLOX (Fundo Transparente)',
      description: 'Tipografia vetorial isolada em fundo transparente pronta para vídeos, banners e apresentações.',
      filename: 'tikblox-typography-transparent.svg',
      path: '/tikblox-typography-transparent.svg',
      preview: '/tikblox-typography-transparent.svg',
      isSymbol: false,
    },
    {
      id: 'full-logo',
      title: 'Logo Completo (Símbolo + Tipografia)',
      description: 'Lockup horizontal completo com todos os elementos integrados em alta resolução.',
      filename: 'tikblox-full-logo.svg',
      path: '/tikblox-full-logo.svg',
      preview: '/tikblox-full-logo.svg',
      isSymbol: false,
    },
  ];

  const handleDownload = (path: string, filename: string) => {
    const link = document.createElement('a');
    link.href = path;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCopyLink = async (path: string, id: string) => {
    try {
      const url = `${window.location.origin}${path}`;
      await navigator.clipboard.writeText(url);
      setCopiedKey(id);
      setTimeout(() => setCopiedKey(null), 2500);
    } catch {
      // Fallback
      setCopiedKey(id);
      setTimeout(() => setCopiedKey(null), 2500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-3xl border border-white/15 bg-[#0C0E17] p-6 sm:p-8 shadow-2xl text-white">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition cursor-pointer"
          title="Fechar"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-2">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-[#25F4EE]/20 to-[#FE2C55]/20 border border-white/10">
            <Sparkles className="w-5 h-5 text-[#25F4EE]" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight">Kit de Marca TIKBLOX</h2>
            <p className="text-xs sm:text-sm text-[#8E91A6]">
              Arquivos vetoriais em SVG de alta resolução separados para download direto.
            </p>
          </div>
        </div>

        {/* Assets Grid */}
        <div className="mt-6 space-y-5">
          {assets.map((asset) => (
            <div
              key={asset.id}
              className="flex flex-col sm:flex-row items-center gap-5 p-4 sm:p-5 rounded-2xl border border-white/10 bg-[#121422] hover:border-[#25F4EE]/40 transition group"
            >
              {/* Asset Preview Thumbnail */}
              <div className="relative flex items-center justify-center w-full sm:w-48 h-32 rounded-xl bg-[#08090E] border border-white/10 overflow-hidden shrink-0 group-hover:shadow-[0_0_20px_rgba(37,244,238,0.15)] transition">
                {/* Checkerboard background for transparent items */}
                {asset.id.includes('transparent') && (
                  <div
                    className="absolute inset-0 opacity-15 pointer-events-none"
                    style={{
                      backgroundImage:
                        'linear-gradient(45deg, #333 25%, transparent 25%), linear-gradient(-45deg, #333 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #333 75%), linear-gradient(-45deg, transparent 75%, #333 75%)',
                      backgroundSize: '16px 16px',
                      backgroundPosition: '0 0, 0 8px, 8px -8px, -8px 0px',
                    }}
                  />
                )}
                <img
                  src={asset.preview}
                  alt={asset.title}
                  className="max-h-24 max-w-full object-contain relative z-10 drop-shadow-md"
                />
              </div>

              {/* Asset Info & Download Action */}
              <div className="flex-1 w-full text-left">
                <div className="flex items-center gap-2 mb-1">
                  {asset.isSymbol ? (
                    <Layers className="w-4 h-4 text-[#25F4EE]" />
                  ) : (
                    <Type className="w-4 h-4 text-[#FE2C55]" />
                  )}
                  <h3 className="font-bold text-sm sm:text-base text-white">{asset.title}</h3>
                </div>
                <p className="text-xs text-[#8E91A6] mb-3 leading-relaxed">
                  {asset.description}
                </p>

                {/* Buttons Row */}
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => handleDownload(asset.path, asset.filename)}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-[#25F4EE] to-[#00CED1] hover:from-[#4BF6F1] hover:to-[#25F4EE] text-[#141722] font-black text-xs shadow-md shadow-[#25F4EE]/20 transition active:scale-95 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Baixar SVG</span>
                  </button>

                  <a
                    href={asset.path}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/80 hover:text-white font-semibold text-xs border border-white/10 transition"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Abrir</span>
                  </a>

                  <button
                    onClick={() => handleCopyLink(asset.path, asset.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/80 hover:text-white font-semibold text-xs border border-white/10 transition cursor-pointer"
                  >
                    {copiedKey === asset.id ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400">URL Copiada!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copiar Link</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* PDF Source Code Box */}
        <div className="mt-6 p-4 sm:p-5 rounded-2xl border border-[#FE2C55]/30 bg-gradient-to-r from-[#FE2C55]/10 via-[#121422] to-[#25F4EE]/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#FE2C55]/20 text-[#FE2C55] shrink-0">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-sm sm:text-base text-white">Dossiê Completo de Código Fonte (PDF)</h4>
              <p className="text-xs text-[#8E91A6]">
                Documento técnico formatado com 96 páginas contendo todo o código TypeScript, React, Express e PWA do TIKBLOX.
              </p>
            </div>
          </div>
          <a
            href="/TIKBLOX_Codigo_Fonte.pdf"
            target="_blank"
            rel="noopener noreferrer"
            download="TIKBLOX_Codigo_Fonte.pdf"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#FE2C55] hover:bg-[#E0264B] text-white font-bold text-xs shadow-lg shadow-[#FE2C55]/30 transition shrink-0 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Baixar PDF (271 KB)</span>
          </a>
        </div>

        {/* Modal Footer Note */}
        <div className="mt-6 pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#707286]">
          <span>Formatos: Vetor SVG escalável sem perda de qualidade (100% editável no Figma, Illustrator, Canva).</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-white font-bold transition"
          >
            Concluir
          </button>
        </div>

      </div>
    </div>
  );
};
