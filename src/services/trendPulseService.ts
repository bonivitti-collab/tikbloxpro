import {
  TrendingProduct,
  ProductNiche,
  TrendPulseNicheAnalysis,
  TrendPulseReport,
  PushNotificationSettings,
  PulseVelocityStatus,
} from '../types';
import { dispatchPushNotification, logPushAlert, playNotificationChime } from './pushNotifications';

const STORAGE_KEY_SNAPSHOTS = 'tikblox_trend_pulse_snapshots_v1';
const STORAGE_KEY_LAST_PULSE_ALERT = 'tikblox_last_pulse_alert_time';

interface NicheSnapshot {
  niche: string;
  earlyWaveCount: number;
  avgVirality: number;
  timestamp: number;
}

const NICHE_METADATA: Record<Exclude<ProductNiche, 'all'>, { label: string; icon: string }> = {
  tech: { label: 'Gadgets & Tech', icon: '⚡' },
  home: { label: 'Casa & Cozinha', icon: '🏠' },
  beauty: { label: 'Beleza & Estética', icon: '✨' },
  fitness: { label: 'Fitness & Treino', icon: '💪' },
  pets: { label: 'Pet Inovador', icon: '🐾' },
  accessories: { label: 'Moda & Acessórios', icon: '💎' },
  kids: { label: 'Infantil & Bebês', icon: '🧸' },
  tools: { label: 'Ferramentas & Obra', icon: '🔨' },
  auto: { label: 'Automotivo & Carros', icon: '🚗' },
  health: { label: 'Saúde & Bem-Estar', icon: '🩺' },
};

/**
 * Loads previous pulse snapshots from localStorage.
 */
function getStoredSnapshots(): Record<string, NicheSnapshot> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY_SNAPSHOTS);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (err) {
    console.warn('Erro ao carregar snapshots de Trend Pulse:', err);
  }
  return {};
}

/**
 * Saves current snapshots for future rate of change delta comparison.
 */
function saveSnapshots(snapshots: Record<string, NicheSnapshot>): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY_SNAPSHOTS, JSON.stringify(snapshots));
  } catch (err) {
    console.warn('Erro ao salvar snapshots de Trend Pulse:', err);
  }
}

/**
 * Synthesizes an energetic, high-priority Trend Pulse chime with rapid ascending arpeggios.
 */
export function playHighPriorityPulseChime(): void {
  try {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;

    const ctx = new AudioContextClass();
    const now = ctx.currentTime;

    // 3 Fast ascending pulses (Alert chirp: C6 -> E6 -> G6)
    const notes = [1046.5, 1318.5, 1567.98];
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const startAt = now + i * 0.07;

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, startAt);

      gain.gain.setValueAtTime(0.18, startAt);
      gain.gain.exponentialRampToValueAtTime(0.001, startAt + 0.2);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startAt);
      osc.stop(startAt + 0.2);
    });
  } catch {
    // Fallback to standard chime
    playNotificationChime();
  }
}

/**
 * Calculates the comprehensive Trend Pulse report by analyzing
 * the rate of change and viral momentum in early_wave products across all niches.
 */
export function analyzeTrendPulse(
  products: TrendingProduct[],
  sensitivityThresholdPercent: number = 40
): TrendPulseReport {
  const previousSnapshots = getStoredSnapshots();
  const currentSnapshots: Record<string, NicheSnapshot> = {};
  const now = Date.now();

  const nichesList = Object.keys(NICHE_METADATA) as Array<Exclude<ProductNiche, 'all'>>;
  const analyses: TrendPulseNicheAnalysis[] = [];

  let totalEarlyCount = 0;

  for (const nicheKey of nichesList) {
    const meta = NICHE_METADATA[nicheKey];
    const nicheProducts = products.filter((p) => p.niche === nicheKey);
    const earlyWaveProducts = nicheProducts.filter((p) => p.waveStage === 'early_wave');
    const earlyCount = earlyWaveProducts.length;
    const totalCount = nicheProducts.length;

    totalEarlyCount += earlyCount;

    // Average virality score of early wave products
    const avgVirality =
      earlyCount > 0
        ? Math.round(earlyWaveProducts.reduce((acc, p) => acc + (p.viralityScore || 0), 0) / earlyCount)
        : 0;

    // Average 30-day viral growth rate % declared by metrics
    const avgGrowthRate =
      earlyCount > 0
        ? Math.round(
            earlyWaveProducts.reduce(
              (acc, p) => acc + (p.trendingMetrics?.growthRatePercent || 150),
              0
            ) / earlyCount
          )
        : 0;

    // Rate of change calculation vs prior snapshot
    const prev = previousSnapshots[nicheKey];
    let rateOfChange = 0;

    if (prev && prev.earlyWaveCount > 0) {
      // Historical rate of change
      const deltaCount = earlyCount - prev.earlyWaveCount;
      const pctDelta = Math.round((deltaCount / prev.earlyWaveCount) * 100);
      rateOfChange = Math.max(pctDelta, Math.round(avgGrowthRate / 5));
    } else {
      // Baseline rate derived from product momentum & virality velocity
      rateOfChange = Math.min(
        180,
        Math.round((earlyCount * 14) + (avgVirality * 0.4) + (avgGrowthRate * 0.08))
      );
    }

    // Velocity score (0-100 index of speed)
    const velocityScore = Math.min(
      100,
      Math.max(
        0,
        Math.round(
          (rateOfChange * 0.45) + (avgVirality * 0.35) + (earlyCount > 0 ? earlyCount * 8 : 0)
        )
      )
    );

    // Determine status
    let pulseStatus: PulseVelocityStatus = 'STEADY';
    if (rateOfChange >= 65 || velocityScore >= 75) {
      pulseStatus = 'CRITICAL_SPIKE';
    } else if (rateOfChange >= sensitivityThresholdPercent || velocityScore >= 55) {
      pulseStatus = 'RAPID_SURGE';
    } else if (rateOfChange < 15 && earlyCount <= 1) {
      pulseStatus = 'COOLING';
    }

    const isSpike = pulseStatus === 'CRITICAL_SPIKE' || pulseStatus === 'RAPID_SURGE';

    // Top product driving this wave
    const topProduct =
      earlyWaveProducts.length > 0
        ? [...earlyWaveProducts].sort((a, b) => (b.viralityScore || 0) - (a.viralityScore || 0))[0]
        : nicheProducts.length > 0
        ? [...nicheProducts].sort((a, b) => (b.viralityScore || 0) - (a.viralityScore || 0))[0]
        : null;

    currentSnapshots[nicheKey] = {
      niche: nicheKey,
      earlyWaveCount: earlyCount,
      avgVirality,
      timestamp: now,
    };

    analyses.push({
      niche: nicheKey,
      nicheLabel: meta.label,
      nicheIcon: meta.icon,
      earlyWaveCount: earlyCount,
      totalProducts: totalCount,
      earlyWaveRatioPercent: totalCount > 0 ? Math.round((earlyCount / totalCount) * 100) : 0,
      avgViralityScore: avgVirality,
      avgGrowthRatePercent: avgGrowthRate,
      rateOfChangePercent: rateOfChange,
      velocityScore,
      pulseStatus,
      isSpike,
      topProduct,
      lastUpdated: new Date().toISOString(),
    });
  }

  // Update snapshot cache
  saveSnapshots(currentSnapshots);

  // Sort descending by velocity score & rate of change
  analyses.sort((a, b) => b.velocityScore - a.velocityScore || b.rateOfChangePercent - a.rateOfChangePercent);

  const surgingNiches = analyses.filter((a) => a.isSpike);
  const highestVelocityNiche = analyses.length > 0 ? analyses[0] : null;
  const overallAverageRateOfChange =
    analyses.length > 0
      ? Math.round(analyses.reduce((acc, a) => acc + a.rateOfChangePercent, 0) / analyses.length)
      : 0;

  return {
    analyzedAt: new Date().toISOString(),
    totalEarlyWaveCount: totalEarlyCount,
    overallAverageRateOfChange,
    activeSpikesCount: surgingNiches.length,
    surgingNiches,
    highestVelocityNiche,
    allNiches: analyses,
  };
}

/**
 * Sends a high-priority push notification for an emerging niche spike.
 */
export async function dispatchHighPriorityPulseNotification(
  spike: TrendPulseNicheAnalysis,
  options?: { force?: boolean }
): Promise<boolean> {
  const { force = false } = options || {};

  // Check cooldown to avoid spamming the user on repeated renders (10 min per niche)
  if (!force && typeof window !== 'undefined') {
    try {
      const lastAlertRaw = localStorage.getItem(`${STORAGE_KEY_LAST_PULSE_ALERT}_${spike.niche}`);
      if (lastAlertRaw) {
        const lastTime = parseInt(lastAlertRaw, 10);
        if (Date.now() - lastTime < 10 * 60 * 1000) {
          return false; // Still inside cooldown
        }
      }
    } catch {
      // ignore
    }
  }

  const urgencyIcon = spike.pulseStatus === 'CRITICAL_SPIKE' ? '🚨' : '⚡';
  const title = `${urgencyIcon} [TREND PULSE] Pico Viral em ${spike.nicheLabel}!`;
  
  const topProductSnippet = spike.topProduct ? ` Top: "${spike.topProduct.name}"` : '';
  const body = `Disparada de +${spike.rateOfChangePercent}% no volume de produtos Early Wave! ${spike.earlyWaveCount} itens em ascensão rápida.${topProductSnippet} Toque para arbitrar antes que sature.`;

  // Custom high-priority vibration pattern: 3 urgent bursts
  const vibratePattern = [350, 120, 350, 120, 500];

  // Play high-priority synthesized ascending chime
  playHighPriorityPulseChime();

  const success = await dispatchPushNotification(title, {
    body,
    playSound: false, // already played high priority sound
    vibrate: vibratePattern,
    tag: `tikblox-pulse-${spike.niche}-${Date.now()}`,
    data: {
      alertType: 'trend_pulse_spike',
      niche: spike.niche,
      rateOfChangePercent: spike.rateOfChangePercent,
      velocityScore: spike.velocityScore,
      productId: spike.topProduct?.id || null,
      timestamp: Date.now(),
    },
  });

  if (success && typeof window !== 'undefined') {
    try {
      localStorage.setItem(`${STORAGE_KEY_LAST_PULSE_ALERT}_${spike.niche}`, String(Date.now()));
    } catch {
      // ignore
    }

    logPushAlert({
      productId: spike.topProduct?.id || `pulse-${spike.niche}`,
      productName: `[TREND PULSE] Pico em ${spike.nicheLabel} (+${spike.rateOfChangePercent}%)`,
      viralityScore: spike.avgViralityScore,
      profitMarginPercent: spike.topProduct?.estimatedProfitMarginPercent || 250,
      status: 'delivered',
      alertType: 'trend_pulse_spike',
      niche: spike.niche,
      rateOfChangePercent: spike.rateOfChangePercent,
    });
  }

  return success;
}

/**
 * Automated scanner that runs Trend Pulse and notifies the user
 * if any niche crossed the high-priority spike threshold.
 */
export async function checkAndNotifyTrendPulseSpikes(
  products: TrendingProduct[],
  settings: PushNotificationSettings
): Promise<TrendPulseReport> {
  const threshold = settings.pulseSensitivityThreshold ?? 40;
  const report = analyzeTrendPulse(products, threshold);

  // If push notifications are enabled and Trend Pulse alerts are active
  const shouldNotify = settings.enabled && (settings.notifyOnTrendPulseSpike ?? true);

  if (shouldNotify && report.surgingNiches.length > 0) {
    // Notify the highest velocity spike first
    const primarySpike = report.highestVelocityNiche;
    if (primarySpike && primarySpike.isSpike) {
      await dispatchHighPriorityPulseNotification(primarySpike);
    }
  }

  return report;
}
