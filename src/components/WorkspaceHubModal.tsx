import React, { useState, useEffect } from 'react';
import {
  X,
  HardDrive,
  Mail,
  GraduationCap,
  LogIn,
  LogOut,
  RefreshCw,
  Send,
  Plus,
  ExternalLink,
  FileText,
  AlertCircle,
  CheckCircle2,
  Lock,
} from 'lucide-react';
import { User } from 'firebase/auth';
import {
  googleSignIn,
  googleLogout,
  getAccessToken,
  initAuth,
} from '../services/googleAuth';
import {
  listDriveFiles,
  createDriveTextFile,
  listGmailMessages,
  sendGmailEmail,
  listClassroomCourses,
  listClassroomCourseWork,
  DriveFileItem,
  GmailMessageItem,
  ClassroomCourseItem,
  ClassroomCourseWorkItem,
} from '../services/googleWorkspace';
import { TrendingProduct } from '../types';

interface WorkspaceHubModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'drive' | 'gmail' | 'classroom';
  activeProduct?: TrendingProduct | null;
}

export const WorkspaceHubModal: React.FC<WorkspaceHubModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'drive',
  activeProduct,
}) => {
  const [activeTab, setActiveTab] = useState<'drive' | 'gmail' | 'classroom'>(initialTab);
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Drive state
  const [driveFiles, setDriveFiles] = useState<DriveFileItem[]>([]);
  const [isLoadingDrive, setIsLoadingDrive] = useState(false);
  const [driveExportStatus, setDriveExportStatus] = useState<string | null>(null);

  // Gmail state
  const [emails, setEmails] = useState<GmailMessageItem[]>([]);
  const [isLoadingGmail, setIsLoadingGmail] = useState(false);
  const [emailTo, setEmailTo] = useState('');
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [emailFeedback, setEmailFeedback] = useState<string | null>(null);
  const [confirmSendDialog, setConfirmSendDialog] = useState(false);

  // Classroom state
  const [courses, setCourses] = useState<ClassroomCourseItem[]>([]);
  const [isLoadingCourses, setIsLoadingCourses] = useState(false);
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [courseWork, setCourseWork] = useState<ClassroomCourseWorkItem[]>([]);
  const [isLoadingWork, setIsLoadingWork] = useState(false);

  // Synchronize initialTab if changed from props
  useEffect(() => {
    if (initialTab) setActiveTab(initialTab);
  }, [initialTab]);

  // Listen to auth
  useEffect(() => {
    if (!isOpen) return;

    const unsubscribe = initAuth(
      (currentUser, accessToken) => {
        setUser(currentUser);
        if (accessToken) {
          setToken(accessToken);
        }
      },
      () => {
        setUser(null);
        setToken(null);
      }
    );

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [isOpen]);

  // Load data when tab changes or token is obtained
  useEffect(() => {
    if (!isOpen || !token) return;

    if (activeTab === 'drive') {
      loadDriveData(token);
    } else if (activeTab === 'gmail') {
      loadGmailData(token);
    } else if (activeTab === 'classroom') {
      loadClassroomData(token);
    }
  }, [isOpen, activeTab, token]);

  // Prefill email if product is provided
  useEffect(() => {
    if (activeProduct) {
      setEmailSubject(`Relatório TIKBLOX: Oportunidade "${activeProduct.name}"`);
      setEmailBody(
        `Olá!\n\nSegue a análise do produto minerado via TIKBLOX PRO:\n\n` +
          `Produto: ${activeProduct.name} (${activeProduct.originalName})\n` +
          `Nicho: ${activeProduct.nicheLabel || activeProduct.niche}\n` +
          `Score Viral: ${activeProduct.viralityScore}/100\n` +
          `Margem de Lucro Estimada: ${activeProduct.estimatedProfitMarginPercent}%\n` +
          `Preço Fornecedor: $${activeProduct.estimatedCostUSD} USD\n` +
          `Preço Sugerido BR: R$ ${activeProduct.estimatedPriceBRL}\n` +
          `Gatilhos / Destaques: ${activeProduct.adHooks?.join(', ') || 'N/A'}\n\n` +
          `Enviado via TIKBLOX PRO Google Workspace Hub.`
      );
    }
  }, [activeProduct]);

  // Login handler
  const handleSignIn = async () => {
    setIsAuthenticating(true);
    setAuthError(null);
    try {
      const result = await googleSignIn();
      if (result) {
        setUser(result.user);
        setToken(result.accessToken);
      }
    } catch (err: any) {
      setAuthError(err?.message || 'Erro ao autenticar com a Google.');
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleLogout = async () => {
    await googleLogout();
    setUser(null);
    setToken(null);
    setDriveFiles([]);
    setEmails([]);
    setCourses([]);
  };

  // Google Drive loaders
  const loadDriveData = async (currentToken: string) => {
    setIsLoadingDrive(true);
    try {
      const data = await listDriveFiles(currentToken);
      setDriveFiles(data.files || []);
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsLoadingDrive(false);
    }
  };

  const handleExportProductToDrive = async () => {
    if (!token) return;
    setDriveExportStatus('Salvando...');
    try {
      const fileName = activeProduct
        ? `TIKBLOX_${activeProduct.name.replace(/\s+/g, '_')}_Analise.txt`
        : `TIKBLOX_Relatorio_Produtos_${new Date().toISOString().slice(0, 10)}.txt`;

      const content = activeProduct
        ? `=== TIKBLOX PRO - RELATÓRIO DO PRODUTO ===\n\n` +
          `Nome: ${activeProduct.name}\n` +
          `Nome Original: ${activeProduct.originalName}\n` +
          `Nicho: ${activeProduct.nicheLabel || activeProduct.niche}\n` +
          `Preço Fornecedor: $${activeProduct.estimatedCostUSD} USD\n` +
          `Preço Venda Sugerido: R$ ${activeProduct.estimatedPriceBRL}\n` +
          `Margem Bruta Estimada: +${activeProduct.estimatedProfitMarginPercent}%\n` +
          `Viral Score: ${activeProduct.viralityScore}/100\n` +
          `Estágio da Onda: ${activeProduct.waveStageLabel}\n` +
          `Público Alvo: ${activeProduct.targetAudience || 'Geral'}\n` +
          `Ganchos Publicitários: ${activeProduct.adHooks?.join(', ') || 'N/A'}\n` +
          `\nGerado em: ${new Date().toLocaleString('pt-BR')}`
        : `=== TIKBLOX PRO - PAINEL DO RADAR ===\nExportado com sucesso para seu Google Drive.`;

      await createDriveTextFile(token, fileName, content);
      setDriveExportStatus('Arquivo salvo no seu Google Drive!');
      loadDriveData(token);
      setTimeout(() => setDriveExportStatus(null), 4000);
    } catch (err: any) {
      setDriveExportStatus(`Erro: ${err.message}`);
      setTimeout(() => setDriveExportStatus(null), 4000);
    }
  };

  // Gmail loaders
  const loadGmailData = async (currentToken: string) => {
    setIsLoadingGmail(true);
    try {
      const list = await listGmailMessages(currentToken, 8);
      setEmails(list);
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsLoadingGmail(false);
    }
  };

  const handleSendEmailConfirmed = async () => {
    if (!token) return;
    setIsSendingEmail(true);
    setEmailFeedback(null);
    setConfirmSendDialog(false);

    try {
      await sendGmailEmail(token, emailTo, emailSubject, emailBody);
      setEmailFeedback('E-mail enviado com sucesso via Gmail!');
      setEmailTo('');
      loadGmailData(token);
      setTimeout(() => setEmailFeedback(null), 5000);
    } catch (err: any) {
      setEmailFeedback(`Erro ao enviar: ${err.message}`);
    } finally {
      setIsSendingEmail(false);
    }
  };

  // Classroom loaders
  const loadClassroomData = async (currentToken: string) => {
    setIsLoadingCourses(true);
    try {
      const list = await listClassroomCourses(currentToken, 10);
      setCourses(list);
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsLoadingCourses(false);
    }
  };

  const loadCourseWorkDetails = async (courseId: string) => {
    if (!token) return;
    setSelectedCourseId(courseId);
    setIsLoadingWork(true);
    try {
      const work = await listClassroomCourseWork(token, courseId);
      setCourseWork(work);
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsLoadingWork(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[90vh] flex flex-col rounded-2xl border border-white/15 bg-[#0D0F18] shadow-2xl overflow-hidden text-white">
        
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 bg-[#121422]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#25F4EE]/20 to-[#FE2C55]/20 border border-white/15 flex items-center justify-center">
              <span className="text-base font-black text-[#25F4EE]">G</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black tracking-tight text-white">
                  Google Workspace Hub
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-extrabold">
                  Conectado
                </span>
              </div>
              <p className="text-xs text-[#8E91A6]">
                Google Drive, Gmail e Google Classroom sincronizados ao TIKBLOX
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-2">
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || 'Usuário'}
                    className="w-7 h-7 rounded-full border border-white/20"
                  />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-[#FE2C55] flex items-center justify-center text-xs font-bold">
                    {user.email?.charAt(0).toUpperCase()}
                  </div>
                )}
                <span className="hidden sm:inline text-xs font-bold text-[#A6A7B2] max-w-[130px] truncate">
                  {user.displayName || user.email}
                </span>
                <button
                  onClick={handleLogout}
                  title="Desconectar da conta Google"
                  className="p-1.5 rounded-lg border border-white/10 bg-[#1A1C2C] hover:bg-red-500/20 hover:border-red-500/40 text-[#8E91A6] hover:text-red-400 transition"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : null}

            <button
              onClick={onClose}
              className="p-1.5 rounded-xl border border-white/10 bg-[#161828] hover:bg-white/10 text-[#8E91A6] hover:text-white transition"
              aria-label="Fechar janela"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Workspace Service Tabs */}
        <div className="flex border-b border-white/10 bg-[#090A11] px-5 gap-2 text-xs font-bold">
          <button
            onClick={() => setActiveTab('drive')}
            className={`flex items-center gap-2 py-3 px-3 border-b-2 transition ${
              activeTab === 'drive'
                ? 'border-[#25F4EE] text-[#25F4EE]'
                : 'border-transparent text-[#8E91A6] hover:text-white'
            }`}
          >
            <HardDrive className="w-4 h-4" />
            <span>Google Drive</span>
          </button>

          <button
            onClick={() => setActiveTab('gmail')}
            className={`flex items-center gap-2 py-3 px-3 border-b-2 transition ${
              activeTab === 'gmail'
                ? 'border-[#FE2C55] text-[#FE2C55]'
                : 'border-transparent text-[#8E91A6] hover:text-white'
            }`}
          >
            <Mail className="w-4 h-4" />
            <span>Gmail</span>
          </button>

          <button
            onClick={() => setActiveTab('classroom')}
            className={`flex items-center gap-2 py-3 px-3 border-b-2 transition ${
              activeTab === 'classroom'
                ? 'border-emerald-400 text-emerald-400'
                : 'border-transparent text-[#8E91A6] hover:text-white'
            }`}
          >
            <GraduationCap className="w-4 h-4" />
            <span>Google Classroom</span>
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-5 text-xs sm:text-sm">
          {!user || !token ? (
            /* Sign in required */
            <div className="flex flex-col items-center justify-center py-12 text-center max-w-md mx-auto space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-[#1A1D2E] border border-white/15 flex items-center justify-center text-white">
                <Lock className="w-7 h-7 text-[#25F4EE]" />
              </div>
              <h3 className="text-lg font-bold text-white">
                Acesse seus serviços do Google Workspace
              </h3>
              <p className="text-xs text-[#8E91A6]">
                Conecte com sua conta Google para sincronizar relatórios do radar com o <strong>Google Drive</strong>, disparar análises e alertas via <strong>Gmail</strong> e consultar turmas e tarefas no <strong>Google Classroom</strong>.
              </p>

              {authError && (
                <div className="w-full p-3 rounded-xl border border-red-500/30 bg-red-950/30 text-red-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{authError}</span>
                </div>
              )}

              <button
                onClick={handleSignIn}
                disabled={isAuthenticating}
                className="flex items-center gap-3 px-6 py-3 rounded-xl bg-white text-gray-900 font-bold hover:bg-gray-100 active:scale-95 transition shadow-lg shadow-white/10 cursor-pointer"
              >
                {isAuthenticating ? (
                  <RefreshCw className="w-4 h-4 animate-spin text-gray-900" />
                ) : (
                  <svg className="w-4 h-4" viewBox="0 0 48 48">
                    <path
                      fill="#EA4335"
                      d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
                    />
                    <path
                      fill="#4285F4"
                      d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
                    />
                    <path
                      fill="#34A853"
                      d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                    />
                  </svg>
                )}
                <span>Sign in with Google</span>
              </button>
            </div>
          ) : (
            <div>
              {/* TAB 1: GOOGLE DRIVE */}
              {activeTab === 'drive' && (
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl border border-white/10 bg-[#121422]">
                    <div>
                      <h4 className="font-bold text-white flex items-center gap-2">
                        <HardDrive className="w-4 h-4 text-[#25F4EE]" />
                        <span>Sincronizar com Google Drive</span>
                      </h4>
                      <p className="text-xs text-[#8E91A6]">
                        Exporte relatórios completos de produtos minerados diretamente na sua nuvem.
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleExportProductToDrive}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#25F4EE] hover:bg-[#20dad5] text-black font-bold text-xs transition active:scale-95"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>{activeProduct ? 'Exportar Este Produto' : 'Exportar Relatório'}</span>
                      </button>

                      <button
                        onClick={() => token && loadDriveData(token)}
                        disabled={isLoadingDrive}
                        className="p-1.5 rounded-lg border border-white/10 bg-[#1A1D2E] text-[#8E91A6] hover:text-white transition"
                        title="Recarregar arquivos"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${isLoadingDrive ? 'animate-spin' : ''}`} />
                      </button>
                    </div>
                  </div>

                  {driveExportStatus && (
                    <div className="p-3 rounded-xl border border-[#25F4EE]/40 bg-[#25F4EE]/10 text-[#25F4EE] text-xs font-bold flex items-center gap-2 animate-in fade-in duration-150">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{driveExportStatus}</span>
                    </div>
                  )}

                  {/* Drive Files List */}
                  <div>
                    <h5 className="text-xs font-bold uppercase tracking-wider text-[#757788] mb-2">
                      Arquivos recentes no seu Google Drive:
                    </h5>

                    {isLoadingDrive ? (
                      <div className="py-8 flex flex-col items-center justify-center text-[#8E91A6] gap-2">
                        <RefreshCw className="w-5 h-5 animate-spin text-[#25F4EE]" />
                        <span>Carregando seus arquivos do Drive...</span>
                      </div>
                    ) : driveFiles.length === 0 ? (
                      <div className="p-6 text-center border border-white/5 rounded-xl bg-[#0F111E] text-[#8E91A6]">
                        Nenhum arquivo encontrado ou permissão pendente.
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {driveFiles.map((file) => (
                          <div
                            key={file.id}
                            className="flex items-center justify-between p-2.5 rounded-xl border border-white/5 bg-[#121422] hover:border-white/15 transition group"
                          >
                            <div className="flex items-center gap-2.5 overflow-hidden">
                              <FileText className="w-4 h-4 text-[#25F4EE] shrink-0" />
                              <div className="truncate">
                                <span className="font-bold text-white block truncate text-xs">
                                  {file.name}
                                </span>
                                <span className="text-[10px] text-[#757788]">
                                  {file.modifiedTime
                                    ? new Date(file.modifiedTime).toLocaleDateString('pt-BR')
                                    : 'Recente'}
                                </span>
                              </div>
                            </div>

                            {file.webViewLink && (
                              <a
                                href={file.webViewLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1 text-[11px] font-bold text-[#25F4EE] hover:underline shrink-0 ml-2"
                              >
                                <span>Abrir</span>
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 2: GMAIL */}
              {activeTab === 'gmail' && (
                <div className="space-y-4">
                  {/* Send Email Form */}
                  <div className="p-4 rounded-xl border border-white/10 bg-[#121422] space-y-3">
                    <h4 className="font-bold text-white flex items-center gap-2">
                      <Mail className="w-4 h-4 text-[#FE2C55]" />
                      <span>Enviar Dossiê ou Alerta via Gmail</span>
                    </h4>

                    {emailFeedback && (
                      <div className="p-2.5 rounded-lg border border-emerald-500/30 bg-emerald-950/20 text-emerald-300 text-xs font-bold flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 shrink-0" />
                        <span>{emailFeedback}</span>
                      </div>
                    )}

                    <div className="space-y-2">
                      <div>
                        <label className="block text-[11px] font-bold text-[#A6A7B2] mb-1">
                          Destinatário (E-mail):
                        </label>
                        <input
                          type="email"
                          value={emailTo}
                          onChange={(e) => setEmailTo(e.target.value)}
                          placeholder="exemplo@gmail.com"
                          className="w-full px-3 py-1.5 rounded-lg border border-white/10 bg-[#0A0B12] text-white text-xs focus:border-[#FE2C55] focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-[#A6A7B2] mb-1">
                          Assunto:
                        </label>
                        <input
                          type="text"
                          value={emailSubject}
                          onChange={(e) => setEmailSubject(e.target.value)}
                          placeholder="Assunto da mensagem"
                          className="w-full px-3 py-1.5 rounded-lg border border-white/10 bg-[#0A0B12] text-white text-xs focus:border-[#FE2C55] focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-[#A6A7B2] mb-1">
                          Mensagem:
                        </label>
                        <textarea
                          rows={3}
                          value={emailBody}
                          onChange={(e) => setEmailBody(e.target.value)}
                          placeholder="Digite o texto do e-mail..."
                          className="w-full px-3 py-1.5 rounded-lg border border-white/10 bg-[#0A0B12] text-white text-xs focus:border-[#FE2C55] focus:outline-none resize-none"
                        />
                      </div>

                      <div className="flex justify-end pt-1">
                        <button
                          onClick={() => setConfirmSendDialog(true)}
                          disabled={!emailTo || !emailSubject || isSendingEmail}
                          className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#FE2C55] hover:bg-[#e0254b] disabled:opacity-50 text-white font-bold text-xs transition active:scale-95 cursor-pointer"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>Enviar E-mail</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Gmail Confirmation Dialog (Mandatory for mutating ops) */}
                  {confirmSendDialog && (
                    <div className="p-3.5 rounded-xl border border-amber-500/40 bg-amber-950/30 text-amber-200 text-xs space-y-2">
                      <div className="font-bold flex items-center gap-1.5">
                        <AlertCircle className="w-4 h-4 text-amber-400" />
                        <span>Confirmar envio com permissão de usuário</span>
                      </div>
                      <p>
                        Você confirma o envio deste e-mail para <strong>{emailTo}</strong> com o assunto "{emailSubject}" diretamente pela sua conta Gmail?
                      </p>
                      <div className="flex items-center gap-2 pt-1">
                        <button
                          onClick={handleSendEmailConfirmed}
                          className="px-3 py-1.5 rounded-lg bg-emerald-500 text-black font-bold hover:bg-emerald-400 transition cursor-pointer"
                        >
                          Sim, Confirmar e Enviar
                        </button>
                        <button
                          onClick={() => setConfirmSendDialog(false)}
                          className="px-3 py-1.5 rounded-lg border border-white/20 bg-transparent text-white font-bold hover:bg-white/10 transition cursor-pointer"
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Recent messages summary */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h5 className="text-xs font-bold uppercase tracking-wider text-[#757788]">
                        Mensagens recentes do seu Gmail:
                      </h5>
                      <button
                        onClick={() => token && loadGmailData(token)}
                        disabled={isLoadingGmail}
                        className="p-1 rounded-lg border border-white/10 bg-[#1A1D2E] text-[#8E91A6] hover:text-white"
                      >
                        <RefreshCw className={`w-3 h-3 ${isLoadingGmail ? 'animate-spin' : ''}`} />
                      </button>
                    </div>

                    {isLoadingGmail ? (
                      <div className="py-6 flex flex-col items-center justify-center text-[#8E91A6] gap-2">
                        <RefreshCw className="w-5 h-5 animate-spin text-[#FE2C55]" />
                        <span>Carregando mensagens...</span>
                      </div>
                    ) : emails.length === 0 ? (
                      <div className="p-6 text-center border border-white/5 rounded-xl bg-[#0F111E] text-[#8E91A6]">
                        Nenhuma mensagem recente encontrada.
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {emails.map((msg) => (
                          <div
                            key={msg.id}
                            className="p-2.5 rounded-xl border border-white/5 bg-[#121422] text-xs"
                          >
                            <div className="flex items-center justify-between gap-2">
                              <span className="font-bold text-white truncate">{msg.subject}</span>
                              <span className="text-[10px] text-[#757788] shrink-0">
                                {msg.from?.replace(/<.*>/, '').trim()}
                              </span>
                            </div>
                            {msg.snippet && (
                              <p className="text-[11px] text-[#8E91A6] mt-1 line-clamp-1">
                                {msg.snippet}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 3: GOOGLE CLASSROOM */}
              {activeTab === 'classroom' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3.5 rounded-xl border border-white/10 bg-[#121422]">
                    <div>
                      <h4 className="font-bold text-white flex items-center gap-2">
                        <GraduationCap className="w-4 h-4 text-emerald-400" />
                        <span>Turmas do Google Classroom</span>
                      </h4>
                      <p className="text-xs text-[#8E91A6]">
                        Consulte turmas ativas, materiais e tarefas educacionais ou de treinamento.
                      </p>
                    </div>

                    <button
                      onClick={() => token && loadClassroomData(token)}
                      disabled={isLoadingCourses}
                      className="p-1.5 rounded-lg border border-white/10 bg-[#1A1D2E] text-[#8E91A6] hover:text-white transition"
                      title="Recarregar turmas"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isLoadingCourses ? 'animate-spin' : ''}`} />
                    </button>
                  </div>

                  {isLoadingCourses ? (
                    <div className="py-8 flex flex-col items-center justify-center text-[#8E91A6] gap-2">
                      <RefreshCw className="w-5 h-5 animate-spin text-emerald-400" />
                      <span>Buscando turmas no Classroom...</span>
                    </div>
                  ) : courses.length === 0 ? (
                    <div className="p-6 text-center border border-white/5 rounded-xl bg-[#0F111E] text-[#8E91A6]">
                      Nenhuma turma ativa encontrada na sua conta Google.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {courses.map((c) => (
                        <div
                          key={c.id}
                          className={`p-3.5 rounded-xl border transition ${
                            selectedCourseId === c.id
                              ? 'border-emerald-500 bg-emerald-950/20'
                              : 'border-white/10 bg-[#121422] hover:border-white/20'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <h5 className="font-bold text-white text-xs sm:text-sm">{c.name}</h5>
                              {c.section && (
                                <span className="text-[11px] text-[#A6A7B2]">{c.section}</span>
                              )}
                            </div>
                            {c.alternateLink && (
                              <a
                                href={c.alternateLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-emerald-400 hover:text-emerald-300 p-1"
                                title="Abrir no Google Classroom"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                              </a>
                            )}
                          </div>

                          <div className="mt-3 flex items-center justify-between">
                            <button
                              onClick={() => loadCourseWorkDetails(c.id)}
                              className="px-2.5 py-1 rounded-lg bg-[#1D2136] hover:bg-[#282d4a] text-white font-bold text-[11px] transition"
                            >
                              Ver Atividades
                            </button>
                            <span className="text-[10px] text-[#757788]">ID: {c.id}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* CourseWork list if selected */}
                  {selectedCourseId && (
                    <div className="mt-4 p-3.5 rounded-xl border border-white/10 bg-[#0F111E]">
                      <h5 className="text-xs font-bold uppercase tracking-wider text-emerald-400 mb-2">
                        Atividades da Turma:
                      </h5>
                      {isLoadingWork ? (
                        <div className="py-4 text-center text-[#8E91A6]">
                          <RefreshCw className="w-4 h-4 animate-spin inline mr-2 text-emerald-400" />
                          Carregando atividades...
                        </div>
                      ) : courseWork.length === 0 ? (
                        <p className="text-xs text-[#8E91A6]">Nenhuma atividade cadastrada nesta turma.</p>
                      ) : (
                        <div className="space-y-2">
                          {courseWork.map((w) => (
                            <div
                              key={w.id}
                              className="p-2 rounded-lg border border-white/5 bg-[#141727] flex items-center justify-between"
                            >
                              <div>
                                <span className="font-bold text-white text-xs block">{w.title}</span>
                                {w.description && (
                                  <span className="text-[10px] text-[#8E91A6] line-clamp-1">
                                    {w.description}
                                  </span>
                                )}
                              </div>
                              {w.alternateLink && (
                                <a
                                  href={w.alternateLink}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-emerald-400 text-[11px] font-bold shrink-0 ml-2"
                                >
                                  Ver
                                </a>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-white/10 bg-[#090A11] flex items-center justify-between text-[11px] text-[#757788]">
          <span>Permissões protegidas via Google OAuth seguro</span>
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded-lg border border-white/10 bg-[#161828] text-white font-bold hover:bg-white/10 transition cursor-pointer"
          >
            Fechar
          </button>
        </div>

      </div>
    </div>
  );
};
