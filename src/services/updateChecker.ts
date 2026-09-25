import { AppUpdateInfo, AppUpdateConfig } from '../types';

export const CURRENT_APP_VERSION = '1.0.0';

// Default configuration with Google Drive support
const UPDATE_CONFIG_KEY = 'tikblox_update_config_v1';
const UPDATE_DISMISSED_VERSION_KEY = 'tikblox_dismissed_update_version';

export const DEFAULT_UPDATE_CONFIG: AppUpdateConfig = {
  currentVersion: CURRENT_APP_VERSION,
  driveFolderUrl: '',
  versionJsonUrl: '',
  autoCheckOnStartup: true,
};

/**
 * Converts a regular Google Drive shareable link into a direct downloadable/raw URL.
 * Works for both `https://drive.google.com/file/d/FILE_ID/view...`
 * and `https://drive.google.com/uc?id=FILE_ID` formats.
 */
export function convertGoogleDriveUrlToDirect(url: string): string {
  if (!url || typeof url !== 'string') return '';
  const trimmed = url.trim();

  // If it's already a direct Google drive download link
  if (trimmed.includes('drive.google.com/uc?export=download')) {
    return trimmed;
  }

  // Format: https://drive.google.com/file/d/FILE_ID/view?usp=sharing
  const fileMatch = trimmed.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (fileMatch && fileMatch[1]) {
    return `https://drive.google.com/uc?export=download&id=${fileMatch[1]}`;
  }

  // Format: https://drive.google.com/open?id=FILE_ID
  const openMatch = trimmed.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (openMatch && openMatch[1] && trimmed.includes('drive.google.com')) {
    return `https://drive.google.com/uc?export=download&id=${openMatch[1]}`;
  }

  return trimmed;
}

/**
 * Compare two semver strings: '1.1.0' > '1.0.0' returns 1, '<' returns -1, '=' returns 0.
 */
export function compareVersions(v1: string, v2: string): number {
  const clean1 = v1.replace(/^v/i, '').split('.').map((n) => parseInt(n, 10) || 0);
  const clean2 = v2.replace(/^v/i, '').split('.').map((n) => parseInt(n, 10) || 0);

  const maxLen = Math.max(clean1.length, clean2.length);
  for (let i = 0; i < maxLen; i++) {
    const num1 = clean1[i] || 0;
    const num2 = clean2[i] || 0;
    if (num1 > num2) return 1;
    if (num1 < num2) return -1;
  }
  return 0;
}

export function getStoredUpdateConfig(): AppUpdateConfig {
  try {
    const raw = localStorage.getItem(UPDATE_CONFIG_KEY);
    if (raw) {
      return { ...DEFAULT_UPDATE_CONFIG, ...JSON.parse(raw), currentVersion: CURRENT_APP_VERSION };
    }
  } catch {
    // Ignore storage issues
  }
  return DEFAULT_UPDATE_CONFIG;
}

export function saveUpdateConfig(config: Partial<AppUpdateConfig>): AppUpdateConfig {
  const current = getStoredUpdateConfig();
  const updated = { ...current, ...config, currentVersion: CURRENT_APP_VERSION };
  try {
    localStorage.setItem(UPDATE_CONFIG_KEY, JSON.stringify(updated));
  } catch {
    // Ignore storage issues
  }
  return updated;
}

export function isVersionDismissed(version: string): boolean {
  try {
    const dismissed = localStorage.getItem(UPDATE_DISMISSED_VERSION_KEY);
    return dismissed === version;
  } catch {
    return false;
  }
}

export function setVersionDismissed(version: string): void {
  try {
    localStorage.setItem(UPDATE_DISMISSED_VERSION_KEY, version);
  } catch {
    // Ignore
  }
}

export function clearDismissedVersion(): void {
  try {
    localStorage.removeItem(UPDATE_DISMISSED_VERSION_KEY);
  } catch {
    // Ignore
  }
}

/**
 * Checks for updates from the configured Google Drive link or fallback demonstration feed.
 */
export async function checkForAppUpdates(
  forceCheck: boolean = false,
  customUrl?: string
): Promise<{ hasUpdate: boolean; updateInfo: AppUpdateInfo | null; error?: string }> {
  const config = getStoredUpdateConfig();
  const targetUrl = customUrl || config.versionJsonUrl;

  // If no URL is configured yet, provide a mock/sample update to let the user test the experience
  if (!targetUrl) {
    return {
      hasUpdate: false,
      updateInfo: null,
      error: 'Nenhum link do Google Drive configurado ainda.',
    };
  }

  const directUrl = convertGoogleDriveUrlToDirect(targetUrl);

  try {
    const response = await fetch(directUrl, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
      cache: 'no-cache',
    });

    if (!response.ok) {
      throw new Error(`Falha ao conectar ao Google Drive (${response.status})`);
    }

    const data: AppUpdateInfo = await response.json();

    if (!data || !data.version) {
      throw new Error('O arquivo de versão do Google Drive está em formato inválido.');
    }

    // Check if new version is greater than current
    const isNewer = compareVersions(data.version, CURRENT_APP_VERSION) > 0;

    // Save timestamp
    saveUpdateConfig({ lastCheckedAt: new Date().toISOString() });

    if (isNewer) {
      if (!forceCheck && isVersionDismissed(data.version)) {
        return { hasUpdate: false, updateInfo: data };
      }
      return { hasUpdate: true, updateInfo: data };
    }

    return { hasUpdate: false, updateInfo: null };
  } catch (err: any) {
    return {
      hasUpdate: false,
      updateInfo: null,
      error: err?.message || 'Não foi possível verificar atualizações no Google Drive.',
    };
  }
}

/**
 * Template JSON to show the user how to create their version.json file on Google Drive
 */
export const SAMPLE_VERSION_JSON_TEMPLATE = `{
  "version": "1.1.0",
  "releaseDate": "2026-09-20",
  "title": "Atualização de Precisão: Novos Nichos & Varredura Otimizada",
  "fileSizeMb": 68.4,
  "downloadUrl": "https://drive.google.com/file/d/SEU_ID_DO_ARQUIVO_EXE/view?usp=sharing",
  "highlights": [
    "Mineração 3x mais rápida com o novo modelo Google Gemini 3.8 Flash",
    "Adicionados nichos automotivo, ferramentas e bem-estar",
    "Fórmula de taxas de importação e ICMS atualizada para cálculo exato em R$",
    "Correção de layout para telas de notebook menores"
  ],
  "isMandatory": false
}`;
