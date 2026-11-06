import { useState, useEffect, useCallback, useRef } from 'react';
import {
  PushNotificationSettings,
  PushAlertLog,
  TrendingProduct,
  TrendPulseReport,
} from '../types';
import {
  isNotificationSupported,
  getNotificationPermission,
  getStoredPushSettings,
  savePushSettings,
  requestNotificationPermission,
  sendTestNotification,
  notifyProductDetected,
  getPushAlertHistory,
} from '../services/pushNotifications';
import {
  checkAndNotifyTrendPulseSpikes,
} from '../services/trendPulseService';

export function usePushNotifications(currentProducts?: TrendingProduct[]) {
  const [isSupported, setIsSupported] = useState<boolean>(false);
  const [permission, setPermission] = useState<NotificationPermission | 'unsupported'>('default');
  const [settings, setSettings] = useState<PushNotificationSettings>(() => getStoredPushSettings());
  const [history, setHistory] = useState<PushAlertLog[]>(() => getPushAlertHistory());
  const notifiedProductIdsRef = useRef<Set<string>>(new Set());

  // Initialize permission and support state
  useEffect(() => {
    const supported = isNotificationSupported();
    setIsSupported(supported);
    if (supported) {
      setPermission(getNotificationPermission());
    } else {
      setPermission('unsupported');
    }
  }, []);

  // Sync settings changes to localStorage
  const updateSettings = useCallback((partial: Partial<PushNotificationSettings>) => {
    setSettings((prev) => {
      const updated = { ...prev, ...partial };
      savePushSettings(updated);
      return updated;
    });
  }, []);

  // Toggle or Request Permission
  const enableNotifications = useCallback(async (): Promise<boolean> => {
    if (!isNotificationSupported()) {
      return false;
    }

    const perm = await requestNotificationPermission();
    setPermission(perm);

    if (perm === 'granted') {
      updateSettings({ enabled: true });
      await sendTestNotification();
      setHistory(getPushAlertHistory());
      return true;
    } else {
      updateSettings({ enabled: false });
      return false;
    }
  }, [updateSettings]);

  const disableNotifications = useCallback(() => {
    updateSettings({ enabled: false });
  }, [updateSettings]);

  // Test notification trigger
  const triggerTestAlert = useCallback(async (): Promise<boolean> => {
    if (permission !== 'granted') {
      const granted = await enableNotifications();
      if (!granted) return false;
    }
    const sent = await sendTestNotification();
    setHistory(getPushAlertHistory());
    return sent;
  }, [permission, enableNotifications]);

  // Run Trend Pulse analysis and notify if a spike is detected
  const scanTrendPulse = useCallback(async (): Promise<TrendPulseReport | null> => {
    if (!currentProducts || currentProducts.length === 0) return null;
    const report = await checkAndNotifyTrendPulseSpikes(currentProducts, settings);
    setHistory(getPushAlertHistory());
    return report;
  }, [currentProducts, settings]);

  // Notify for a specific product ensuring no repetition
  const notifyProduct = useCallback(
    async (product: TrendingProduct): Promise<boolean> => {
      if (!settings.enabled || permission !== 'granted') {
        return false;
      }
      if (notifiedProductIdsRef.current.has(product.id)) {
        return false;
      }

      const sent = await notifyProductDetected(product, settings);
      if (sent) {
        notifiedProductIdsRef.current.add(product.id);
        setHistory(getPushAlertHistory());
      }
      return sent;
    },
    [settings, permission]
  );

  return {
    isSupported,
    permission,
    settings,
    updateSettings,
    enableNotifications,
    disableNotifications,
    triggerTestAlert,
    notifyProduct,
    scanTrendPulse,
    history,
    refreshHistory: () => setHistory(getPushAlertHistory()),
  };
}
