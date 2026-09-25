import { TrendingProduct, PushNotificationSettings, PushAlertLog } from '../types';

const STORAGE_KEY_SETTINGS = 'tikblox_push_settings_v2';
const STORAGE_KEY_HISTORY = 'tikblox_push_history_v2';
const STORAGE_KEY_NOTIFIED_IDS = 'tikblox_notified_product_ids_v2';
const STORAGE_KEY_DAILY_SLOTS = 'tikblox_daily_push_slots_v1';

export const DEFAULT_PUSH_SETTINGS: PushNotificationSettings = {
  enabled: false,
  notifyOnNewScan: true,
  notifyOnEarlyWaveOnly: false,
  minProfitMarginPercent: 200,
  backgroundRadarAlerts: true,
  soundAndVibration: true,
  notifyOnTrendPulseSpike: true,
  pulseSensitivityThreshold: 40,
};

export function isNotificationSupported(): boolean {
  return typeof window !== 'undefined' && 'Notification' in window;
}

export function getNotificationPermission(): NotificationPermission | 'unsupported' {
  if (!isNotificationSupported()) return 'unsupported';
  return Notification.permission;
}

export function getStoredPushSettings(): PushNotificationSettings {
  if (typeof window === 'undefined') return DEFAULT_PUSH_SETTINGS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_SETTINGS);
    if (raw) {
      return { ...DEFAULT_PUSH_SETTINGS, ...JSON.parse(raw) };
    }
  } catch (err) {
    console.warn('Erro ao ler configurações de push:', err);
  }
  return DEFAULT_PUSH_SETTINGS;
}

export function savePushSettings(settings: PushNotificationSettings): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(settings));
  } catch (err) {
    console.warn('Erro ao salvar configurações de push:', err);
  }
}

export function getPushAlertHistory(): PushAlertLog[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY_HISTORY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (err) {
    console.warn('Erro ao ler histórico de alertas push:', err);
  }
  return [];
}

export function logPushAlert(alert: Omit<PushAlertLog, 'id' | 'timestamp'>): void {
  if (typeof window === 'undefined') return;
  try {
    const current = getPushAlertHistory();
    const newEntry: PushAlertLog = {
      ...alert,
      id: `alert-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString(),
    };
    const updated = [newEntry, ...current].slice(0, 30); // Keep last 30
    localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(updated));
  } catch (err) {
    console.warn('Erro ao registrar histórico de push:', err);
  }
}

export function getNotifiedProductIds(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY_NOTIFIED_IDS);
    if (raw) return JSON.parse(raw);
  } catch {
    // ignore
  }
  return [];
}

export function markProductAsNotified(productId: string): void {
  if (typeof window === 'undefined') return;
  try {
    const ids = getNotifiedProductIds();
    if (!ids.includes(productId)) {
      ids.push(productId);
      localStorage.setItem(STORAGE_KEY_NOTIFIED_IDS, JSON.stringify(ids));
    }
  } catch {
    // ignore
  }
}

/**
 * Synthesizes a clean, high-tech radar chime using Web Audio API (100% offline).
 */
export function playNotificationChime(): void {
  try {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;

    const ctx = new AudioContextClass();
    const now = ctx.currentTime;

    // Tone 1: 880Hz (A5)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(880, now);
    gain1.gain.setValueAtTime(0.08, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.25);

    // Tone 2: 1320Hz (E6) harmonic
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(1320, now + 0.08);
    gain2.gain.setValueAtTime(0.12, now + 0.08);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.08);
    osc2.stop(now + 0.4);
  } catch {
    // Graceful silent fallback if user has not interacted with DOM yet
  }
}

/**
 * Requests native browser / PWA notification permission.
 */
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!isNotificationSupported()) return 'denied';
  try {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      const current = getStoredPushSettings();
      savePushSettings({ ...current, enabled: true });
    }
    return permission;
  } catch (err) {
    console.error('Falha ao solicitar permissão de notificação:', err);
    return 'denied';
  }
}

/**
 * Dispatches an OS-level push notification through the ServiceWorker or Notification API.
 */
export async function dispatchPushNotification(
  title: string,
  options: NotificationOptions & { productId?: string; playSound?: boolean; vibrate?: number[] }
): Promise<boolean> {
  if (!isNotificationSupported()) return false;
  if (Notification.permission !== 'granted') return false;

  const { playSound = true, productId, ...rawOptions } = options;

  if (playSound) {
    playNotificationChime();
  }

  const notificationOptions: NotificationOptions & { vibrate?: number[]; [key: string]: any } = {
    icon: '/pwa-192x192.png',
    badge: '/pwa-192x192.png',
    vibrate: [250, 100, 250, 100, 250],
    tag: rawOptions.tag || `tikblox-${Date.now()}`,
    renotify: true,
    data: {
      url: productId ? `/?product=${encodeURIComponent(productId)}` : '/',
      productId: productId || null,
      timestamp: Date.now(),
      ...rawOptions.data,
    },
    ...rawOptions,
  };

  try {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      const registration = await Promise.race([
        navigator.serviceWorker.ready,
        new Promise<null>((resolve) => setTimeout(() => resolve(null), 1500)),
      ]);
      if (registration && 'showNotification' in registration) {
        await registration.showNotification(title, notificationOptions);
        return true;
      }
    }

    if (typeof window !== 'undefined' && 'Notification' in window) {
      new Notification(title, notificationOptions);
      return true;
    }
    return false;
  } catch (err) {
    console.warn('Erro ao exibir notificação via ServiceWorker:', err);
    try {
      new Notification(title, notificationOptions);
      return true;
    } catch (fallbackErr) {
      console.error('Falha ao disparar notificação:', fallbackErr);
      return false;
    }
  }
}

/**
 * Sends a viral product alert if it meets user notification filter settings (ensuring NO REPEATED products).
 */
export async function notifyProductDetected(
  product: TrendingProduct,
  settings: PushNotificationSettings
): Promise<boolean> {
  if (!settings.enabled || Notification.permission !== 'granted') {
    return false;
  }

  const notifiedIds = getNotifiedProductIds();
  if (notifiedIds.includes(product.id)) {
    return false; // Already notified - never repeat same product!
  }

  if (settings.notifyOnEarlyWaveOnly && product.waveStage !== 'early_wave') {
    return false;
  }

  if (product.estimatedProfitMarginPercent < settings.minProfitMarginPercent) {
    return false;
  }

  const originLabel = product.originCountry === 'US' ? 'EUA 🇺🇸' : product.originCountry === 'CN' ? 'China 🇨🇳' : product.originCountry;
  const title = `🚨 [RADAR VIRAL] ${product.name}`;
  const body = `Explodindo nos ${originLabel}! Margem de ${product.estimatedProfitMarginPercent}% e Score ${product.viralityScore}/100. Toque para ver análise.`;

  const success = await dispatchPushNotification(title, {
    body,
    productId: product.id,
    playSound: settings.soundAndVibration,
    tag: `tikblox-prod-${product.id}`,
    data: {
      productId: product.id,
      margin: product.estimatedProfitMarginPercent,
      virality: product.viralityScore,
    },
  });

  if (success) {
    markProductAsNotified(product.id);
    logPushAlert({
      productId: product.id,
      productName: product.name,
      viralityScore: product.viralityScore,
      profitMarginPercent: product.estimatedProfitMarginPercent,
      status: 'delivered',
    });
  }

  return success;
}

/**
 * Checks and triggers 3 automated daily scans & push notifications ensuring NO REPEATED products.
 * Slots: 'morning' (06:00 - 12:00), 'afternoon' (12:00 - 18:00), 'evening' (18:00 - 23:59)
 */
export async function checkAndRunAutomatedDailyPush(
  currentProducts: TrendingProduct[],
  settings: PushNotificationSettings
): Promise<boolean> {
  if (!settings.enabled || Notification.permission !== 'granted' || !currentProducts || currentProducts.length === 0) {
    return false;
  }

  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];
  const hour = now.getHours();

  let currentSlot: 'morning' | 'afternoon' | 'evening' = 'morning';
  if (hour >= 12 && hour < 18) {
    currentSlot = 'afternoon';
  } else if (hour >= 18) {
    currentSlot = 'evening';
  }

  let dailyRecord: { date: string; slots: string[] } = { date: todayStr, slots: [] };
  try {
    const raw = localStorage.getItem(STORAGE_KEY_DAILY_SLOTS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.date === todayStr) {
        dailyRecord = parsed;
      }
    }
  } catch {
    // ignore
  }

  if (dailyRecord.slots.includes(currentSlot)) {
    return false;
  }

  const notifiedIds = getNotifiedProductIds();
  const availableCandidates = currentProducts.filter(
    (p) => !notifiedIds.includes(p.id) && p.estimatedProfitMarginPercent >= settings.minProfitMarginPercent
  );

  if (availableCandidates.length === 0) {
    localStorage.removeItem(STORAGE_KEY_NOTIFIED_IDS);
  }

  const finalCandidates = availableCandidates.length > 0 ? availableCandidates : currentProducts;
  const candidate = finalCandidates[Math.floor(Math.random() * finalCandidates.length)] || currentProducts[0];

  if (!candidate) return false;

  const originLabel = candidate.originCountry === 'US' ? 'EUA 🇺🇸' : candidate.originCountry === 'CN' ? 'China 🇨🇳' : candidate.originCountry;
  const slotTitleMap = {
    morning: '🌅 [VARREDURA MATINAL]',
    afternoon: '☀️ [VARREDURA DA TARDE]',
    evening: '🌙 [VARREDURA NOTURNA]',
  };

  const title = `${slotTitleMap[currentSlot]} ${candidate.name}`;
  const body = `Nova oportunidade nos ${originLabel}! Margem de ${candidate.estimatedProfitMarginPercent}% e Score ${candidate.viralityScore}/100. Toque para ver detalhes.`;

  const success = await dispatchPushNotification(title, {
    body,
    productId: candidate.id,
    playSound: settings.soundAndVibration,
    tag: `tikblox-daily-${currentSlot}-${todayStr}`,
    data: {
      productId: candidate.id,
      slot: currentSlot,
    },
  });

  if (success) {
    markProductAsNotified(candidate.id);
    dailyRecord.slots.push(currentSlot);
    localStorage.setItem(STORAGE_KEY_DAILY_SLOTS, JSON.stringify(dailyRecord));

    logPushAlert({
      productId: candidate.id,
      productName: candidate.name,
      viralityScore: candidate.viralityScore,
      profitMarginPercent: candidate.estimatedProfitMarginPercent,
      status: `delivered-${currentSlot}`,
    });
  }

  return success;
}

/**
 * Sends an instant welcome/confirmation test notification to verify OS setup.
 */
export async function sendTestNotification(): Promise<boolean> {
  const title = '⚡ Radar TIKBLOX: Notificações Push Ativas!';
  const body = 'Seu PWA está configurado para 3 varreduras automáticas diárias sem repetir produtos!';

  return await dispatchPushNotification(title, {
    body,
    playSound: true,
    tag: 'tikblox-test-notification',
  });
}
