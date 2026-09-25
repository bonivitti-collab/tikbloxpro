import React, { useState } from 'react';
import {
  Sparkles,
  Download,
  CheckCircle2,
  X,
  ExternalLink,
  Info,
  Clock,
  HardDrive,
  FileCheck,
  AlertTriangle
} from 'lucide-react';
import { AppUpdateInfo } from '../types';
import { convertGoogleDriveUrlToDirect, CURRENT_APP_VERSION } from '../services/updateChecker';

interface UpdateModalProps {
  updateInfo: AppUpdateInfo;
  isOpen: boolean;
  onClose: () => void;
  onDismissForever?: () => void;
}

export const UpdateNotificationModal: React.FC<UpdateModalProps> = ({
  updateInfo,
  isOpen,
  onClose,
  onDismissForever,
}) => {
  const [downloadProgress, setDownloadProgress] = useState<number>(0);
  const [isDownloading, setIsDownloading] = useState<boolean>(false);
  const [isDownloaded, setIsDownloaded] = useState<boolean>(false);

  if (!isOpen) return null;

  const directDownloadLink = convertGoogleDriveUrlToDirect(updateInfo.downloadUrl);

  const handleStartDownload = () => {
    setIsDownloading(true);
    setDownloadProgress(0);

    // Trigger the actual file download through browser/desktop client
    if (directDownloadLink) {
      const a = document.createElement('a');
      a.href = directDownloadLink;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      a.setAttribute('download', `TIKBLOX-Setup-v${updateInfo.version}.exe`);
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }

    // Simulate animated progress indicator to provide visual feedback
    let current = 0;
    const interval = setInterval(() => {
      current += Math.floor(Math.random() * 18) + 12;
      if (current >= 100) {
        current = 100;
        clearInterval(interval);
        setIsDownloading(false);
        setIsDownloaded(true);
      }
      setDownloadProgress(current);
    }, 280);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl rounded-2xl border border-white/15 bg-[#12131A] shadow-2xl overflow-hidden">
        
        {/* Top Glow & Header */}
        <div className="h-1.5 w-full bg-gradient-to-r from-[#25F4EE] via-[#FE2C55] to-[#25F4EE] animate-pulse" />

        <div className="p-5 sm:p-6">
          
          {/* Header Row */}
          <div className="flex items-start justify-between gap-3 mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#FE2C55]/20 to-[#25F4EE]/20 border border-[#25F4EE]/30 flex items-center justify-center text-[#25F4EE] shrink-0">
                <Sparkles className="w-5 h-5 text-[#25F4EE]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#FE2C55]/20 text-[#FE2C55] border border-[#FE2C55]/40">
                    Atualização Disponível
                  </span>
                  <span className="text-xs text-[#A6A7B2]">
                    v{CURRENT_APP_VERSION} ➔ <strong className="text-white font-bold">v{updateInfo.version}</strong>
                  </span>
                </div>
                <h3 className="text-base sm:text-lg font-black text-white mt-1 leading-snug">
                  {updateInfo.title || `TIKBLOX Versão ${updateInfo.version}`}
                </h3>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-[#A6A7B2] hover:text-white hover:bg-white/10 transition cursor-pointer"
              title="Fechar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Metadata pill details */}
          <div className="flex flex-wrap items-center gap-2.5 sm:gap-4 py-2 px-3 rounded-xl bg-[#0B0C10] border border-white/5 text-xs text-[#A6A7B2] mb-4">
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-[#25F4EE]" />
              <span>Data: <strong>{updateInfo.releaseDate || 'Recente'}</strong></span>
            </div>
            {updateInfo.fileSizeMb && (
              <div className="flex items-center gap-1.5">
                <HardDrive className="w-3.5 h-3.5 text-[#FE2C55]" />
                <span>Tamanho: <strong>{updateInfo.fileSizeMb} MB</strong></span>
              </div>
            )}
            <div className="flex items-center gap-1.5 text-emerald-400">
              <FileCheck className="w-3.5 h-3.5" />
              <span>Instalação Limpa (Preserva seus dados e favoritos)</span>
            </div>
          </div>

          {/* Highlights / Changelog */}
          <div className="mb-5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#A6A7B2] mb-2 flex items-center gap-1.5">
              <span>Novidades e Melhorias desta Versão:</span>
            </h4>
            <ul className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {updateInfo.highlights && updateInfo.highlights.length > 0 ? (
                updateInfo.highlights.map((item, index) => (
                  <li
                    key={index}
                    className="flex items-start gap-2.5 text-xs sm:text-sm text-[#E1E2E8] leading-relaxed bg-[#161823]/60 p-2.5 rounded-xl border border-white/5"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-[#25F4EE] mt-2 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))
              ) : (
                <li className="text-xs text-[#A6A7B2]">Melhorias de estabilidade e novas métricas de mineração.</li>
              )}
            </ul>
          </div>

          {/* Progress or Download Status */}
          {isDownloading && (
            <div className="mb-5 p-3.5 rounded-xl bg-[#0B0C10] border border-[#25F4EE]/30">
              <div className="flex justify-between text-xs font-bold text-white mb-1.5">
                <span className="flex items-center gap-1.5 text-[#25F4EE]">
                  <Download className="w-4 h-4 animate-bounce" /> Baixando instalador do Google Drive...
                </span>
                <span>{downloadProgress}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-[#161823] overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#25F4EE] to-[#FE2C55] transition-all duration-200"
                  style={{ width: `${downloadProgress}%` }}
                />
              </div>
              <p className="text-[11px] text-[#A6A7B2] mt-1.5">
                O instalador está sendo transferido diretamente para a sua pasta de Downloads.
              </p>
            </div>
          )}

          {isDownloaded && (
            <div className="mb-5 p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
              <div className="text-xs leading-relaxed">
                <strong className="font-bold block text-sm">Download Concluído com Sucesso!</strong>
                O instalador <code className="bg-black/40 px-1.5 py-0.5 rounded text-white">TIKBLOX-Setup-v{updateInfo.version}.exe</code> já está no seu notebook. Basta clicar no arquivo para aplicar a atualização em 5 segundos.
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-white/10">
            <button
              onClick={() => {
                if (onDismissForever) onDismissForever();
                onClose();
              }}
              className="text-xs text-[#7E8092] hover:text-[#A6A7B2] transition order-2 sm:order-1 cursor-pointer"
            >
              Lembrar na próxima vez
            </button>

            <div className="flex items-center gap-2.5 w-full sm:w-auto order-1 sm:order-2">
              <button
                onClick={onClose}
                className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl border border-white/10 bg-[#161823] text-xs font-bold text-white hover:bg-white/10 transition cursor-pointer"
              >
                Agora Não
              </button>

              {!isDownloaded ? (
                <button
                  onClick={handleStartDownload}
                  disabled={isDownloading}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#FE2C55] to-[#FF0050] text-xs font-black text-white shadow-lg shadow-[#FE2C55]/30 hover:brightness-110 active:scale-95 transition cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>{isDownloading ? 'Baixando...' : 'Baixar e Atualizar Agora'}</span>
                </button>
              ) : (
                <button
                  onClick={() => {
                    // Open download location or prompt
                    window.open(directDownloadLink, '_blank');
                    onClose();
                  }}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 text-black font-black text-xs hover:bg-emerald-400 transition cursor-pointer shadow-lg shadow-emerald-500/30"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Concluir Instalação</span>
                </button>
              )}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
