import React, { useState } from 'react';
import {
  FolderUp,
  Link,
  Save,
  CheckCircle2,
  Copy,
  ExternalLink,
  RefreshCw,
  Sparkles,
  HelpCircle,
  HardDrive,
  FileCode,
  Check,
  X
} from 'lucide-react';
import {
  getStoredUpdateConfig,
  saveUpdateConfig,
  convertGoogleDriveUrlToDirect,
  checkForAppUpdates,
  SAMPLE_VERSION_JSON_TEMPLATE,
  CURRENT_APP_VERSION,
} from '../services/updateChecker';
import { AppUpdateInfo } from '../types';

interface UpdateSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdateDetected?: (info: AppUpdateInfo) => void;
}

export const UpdateSettingsModal: React.FC<UpdateSettingsModalProps> = ({
  isOpen,
  onClose,
  onUpdateDetected,
}) => {
  const [config, setConfig] = useState(() => getStoredUpdateConfig());
  const [versionJsonUrl, setVersionJsonUrl] = useState(config.versionJsonUrl || '');
  const [driveFolderUrl, setDriveFolderUrl] = useState(config.driveFolderUrl || '');
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [checkResult, setCheckResult] = useState<{
    status: 'idle' | 'success' | 'error' | 'no_update';
    message: string;
    updateInfo?: AppUpdateInfo | null;
  }>({ status: 'idle', message: '' });
  const [copiedTemplate, setCopiedTemplate] = useState(false);

  if (!isOpen) return null;

  const handleSave = () => {
    const updated = saveUpdateConfig({
      versionJsonUrl,
      driveFolderUrl,
    });
    setConfig(updated);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleTestCheck = async () => {
    setIsChecking(true);
    setCheckResult({ status: 'idle', message: 'Testando conexão com o Google Drive...' });

    // Save url first
    saveUpdateConfig({ versionJsonUrl, driveFolderUrl });

    const result = await checkForAppUpdates(true, versionJsonUrl);
    setIsChecking(false);

    if (result.hasUpdate && result.updateInfo) {
      setCheckResult({
        status: 'success',
        message: `Sucesso! Nova versão encontrada: v${result.updateInfo.version} (${result.updateInfo.title})`,
        updateInfo: result.updateInfo,
      });
      if (onUpdateDetected) {
        onUpdateDetected(result.updateInfo);
      }
    } else if (result.error) {
      setCheckResult({
        status: 'error',
        message: `Atenção: ${result.error}`,
      });
    } else {
      setCheckResult({
        status: 'no_update',
        message: `Conexão bem sucedida! O sistema está na versão mais recente (v${CURRENT_APP_VERSION}).`,
      });
    }
  };

  // Quick test demo trigger
  const handleSimulateDemoUpdate = () => {
    const demoInfo: AppUpdateInfo = {
      version: '1.2.0',
      releaseDate: 'Hoje',
      title: 'Atualização Premium: Novos Nichos & Varredura 3x Mais Rápida',
      fileSizeMb: 68.4,
      downloadUrl: 'https://drive.google.com/file/d/demo-example-id/view?usp=sharing',
      highlights: [
        'Algoritmo IA do TikBlox Pro com busca aprofundada em tempo real',
        'Cálculo automatizado de taxa de importação e ICMS por produto',
        'Filtro horizontal inteligente para telas menores de notebook',
        'Novos nichos: Ferramentas, Automotivo e Saúde & Bem-Estar'
      ],
      isMandatory: false,
    };

    if (onUpdateDetected) {
      onClose();
      onUpdateDetected(demoInfo);
    }
  };

  const copyTemplateToClipboard = () => {
    navigator.clipboard.writeText(SAMPLE_VERSION_JSON_TEMPLATE);
    setCopiedTemplate(true);
    setTimeout(() => setCopiedTemplate(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl rounded-2xl border border-white/15 bg-[#2A3042] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-5 border-b border-white/10 flex items-center justify-between bg-[#161823]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#25F4EE]/20 border border-[#25F4EE]/40 flex items-center justify-center text-[#25F4EE]">
              <FolderUp className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <span>Configurar Atualizações via Google Drive</span>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-white/10 text-white">
                  v{CURRENT_APP_VERSION} Atual
                </span>
              </h3>
              <p className="text-xs text-[#A6A7B2]">
                Conecte sua pasta do Google Drive para distribuir novas versões do .exe automaticamente
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#A6A7B2] hover:text-white hover:bg-white/10 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1 text-xs sm:text-sm">
          
          {/* Passo a Passo Didático */}
          <div className="p-4 rounded-xl bg-[#262B3A] border border-white/10">
            <h4 className="font-bold text-white text-sm flex items-center gap-2 mb-2 text-[#25F4EE]">
              <HelpCircle className="w-4 h-4" />
              <span>Como Funciona o Google Drive no TIKBLOX (2 Passos):</span>
            </h4>
            <ol className="list-decimal list-inside space-y-2 text-[#A6A7B2] leading-relaxed text-xs">
              <li>
                Crie uma pasta no seu Google Drive (ex: <strong className="text-white">TIKBLOX-Atualizacoes</strong>) e compartilhe como <strong className="text-white">"Qualquer pessoa com o link pode ver"</strong>.
              </li>
              <li>
                Coloque nela o seu <strong className="text-white">version.json</strong> (copie o modelo abaixo) com o link do novo <strong className="text-white">TIKBLOX-Setup.exe</strong>. Cole o link do arquivo abaixo e pronto!
              </li>
            </ol>
          </div>

          {/* Form Fields */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-white mb-1.5 flex items-center justify-between">
                <span>Link de Compartilhamento do arquivo "version.json" no Google Drive:</span>
                <span className="text-[#25F4EE] text-[11px]">Obrigatório</span>
              </label>
              <div className="relative">
                <Link className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A6A7B2]" />
                <input
                  type="text"
                  placeholder="https://drive.google.com/file/d/1ABC...XYZ/view?usp=sharing"
                  value={versionJsonUrl}
                  onChange={(e) => setVersionJsonUrl(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-[#262B3A] py-2.5 pl-10 pr-4 text-xs text-white placeholder-[#5A5C6D] focus:border-[#25F4EE] focus:outline-none focus:ring-1 focus:ring-[#25F4EE]"
                />
              </div>
              <p className="text-[11px] text-[#7E8092] mt-1">
                O sistema converte links do Drive em link direto automaticamente.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-white mb-1.5">
                Link da Pasta do Google Drive (Para referência rápida):
              </label>
              <div className="relative">
                <FolderUp className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A6A7B2]" />
                <input
                  type="text"
                  placeholder="https://drive.google.com/drive/folders/1ABC...XYZ?usp=sharing"
                  value={driveFolderUrl}
                  onChange={(e) => setDriveFolderUrl(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-[#262B3A] py-2.5 pl-10 pr-4 text-xs text-white placeholder-[#5A5C6D] focus:border-[#25F4EE] focus:outline-none focus:ring-1 focus:ring-[#25F4EE]"
                />
              </div>
            </div>
          </div>

          {/* Test connection & Result box */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
            <button
              onClick={handleSave}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#161823] hover:bg-white/10 text-white font-bold text-xs border border-white/15 transition cursor-pointer"
            >
              {savedSuccess ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span className="text-emerald-400">Salvo!</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Salvar Links</span>
                </>
              )}
            </button>

            <button
              onClick={handleTestCheck}
              disabled={isChecking}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#25F4EE] to-[#20D2CC] text-black font-extrabold text-xs shadow-md hover:brightness-105 active:scale-95 transition cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${isChecking ? 'animate-spin' : ''}`} />
              <span>{isChecking ? 'Verificando no Drive...' : 'Testar Conexão com o Drive'}</span>
            </button>

            <button
              onClick={handleSimulateDemoUpdate}
              className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl border border-[#FE2C55]/40 bg-[#FE2C55]/10 text-[#FE2C55] font-bold text-xs hover:bg-[#FE2C55]/20 transition cursor-pointer"
              title="Ver na prática como a tela de atualização aparece para o cliente"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Simular Atualização (Teste)</span>
            </button>
          </div>

          {checkResult.message && (
            <div
              className={`p-3 rounded-xl text-xs border flex items-start gap-2.5 ${
                checkResult.status === 'success'
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                  : checkResult.status === 'error'
                  ? 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                  : 'bg-white/5 border-white/10 text-[#C5C6D0]'
              }`}
            >
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
              <div className="leading-relaxed">{checkResult.message}</div>
            </div>
          )}

          {/* Modelo Pronto do Arquivo version.json */}
          <div className="pt-3 border-t border-white/10">
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-xs text-white flex items-center gap-2">
                <FileCode className="w-4 h-4 text-[#FE2C55]" />
                <span>Modelo Pronto do seu arquivo "version.json":</span>
              </span>

              <button
                onClick={copyTemplateToClipboard}
                className="flex items-center gap-1.5 text-xs text-[#25F4EE] hover:underline font-bold cursor-pointer"
              >
                {copiedTemplate ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedTemplate ? 'Copiado!' : 'Copiar Modelo'}</span>
              </button>
            </div>

            <pre className="p-3 rounded-xl bg-[#202432] border border-white/10 text-[11px] text-[#A6A7B2] font-mono overflow-x-auto leading-relaxed max-h-40">
              {SAMPLE_VERSION_JSON_TEMPLATE}
            </pre>
            <p className="text-[11px] text-[#7E8092] mt-1.5">
              Basta copiar este texto, colar em um bloco de notas, salvar como <strong className="text-white">version.json</strong> e subir na pasta do Google Drive.
            </p>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 bg-[#161823] border-t border-white/10 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-white/10 text-white hover:bg-white/15 font-bold text-xs transition cursor-pointer"
          >
            Fechar
          </button>
        </div>

      </div>
    </div>
  );
};
