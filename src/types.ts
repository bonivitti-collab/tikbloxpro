export type WaveStage = 'early_wave' | 'rising_wave' | 'peak_wave';

export type ProductNiche = 
  | 'all'
  | 'tech'
  | 'home'
  | 'beauty'
  | 'fitness'
  | 'pets'
  | 'accessories'
  | 'kids'
  | 'tools'
  | 'auto'
  | 'health';

export interface TrendingProduct {
  id: string;
  name: string;
  originalName: string;
  niche: ProductNiche;
  nicheLabel: string;
  originCountry: 'US' | 'CN' | 'KR' | 'JP' | 'EU';
  originPlatform: string; // e.g. 'TikTok Shop US', 'Douyin Viral', 'Amazon US Movers', 'AliExpress Trending'
  waveStage: WaveStage;
  waveStageLabel: string;
  viralityScore: number; // 0 - 100
  saturationInBrazil: 'Muito Baixa' | 'Baixa' | 'Média' | 'Incipiente';
  estimatedCostUSD: number;
  estimatedPriceBRL: number;
  estimatedProfitMarginPercent: number; // e.g. 320
  culturalFitReason: string;
  brazilEntryStatus: string;
  targetAudience: string;
  imageUrl?: string;
  iconType: string;
  highlights: string[];
  adHooks: string[];
  supplierKeywords: string[];
  logisticsComplexity: 'Fácil (Leve / Sem Bateria)' | 'Médio (Bateria / Eletrônico)' | 'Atenção (Volume / Frágil)';
  trendingMetrics: {
    viewsLast30Days: string;
    growthRatePercent: number;
    searchVolumeBR: 'Emergindo agora' | 'Crescimento +340%' | 'Disparada +620%' | 'Primeiras Buscas';
  };
  groundingSources?: Array<{
    title: string;
    uri: string;
  }>;
  discoveredAt: string;
  priceCheck?: ProductPriceCheck;
}

export interface DeepDiveAnalysis {
  productId: string;
  productName: string;
  marketPotentialSummary: string;
  brazilOpportunityScore: number; // 0-100
  competitionAnalysis: {
    shopeeStatus: string;
    mercadoLivreStatus: string;
    tiktokShopBRStatus: string;
  };
  recommendedPriceBRL: {
    min: number;
    optimal: number;
    max: number;
  };
  recommendedAdAngles: Array<{
    angleName: string;
    hook: string;
    targetPainPoint: string;
    visualSuggestion: string;
  }>;
  logisticsAdvice: string;
  actionChecklist: string[];
  webSources?: Array<{ title: string; uri: string }>;
}

export interface AdCreativeScript {
  title: string;
  targetPlatform: 'TikTok' | 'Instagram Reels' | 'YouTube Shorts';
  hook3Seconds: string;
  bodyScript: string;
  callToAction: string;
  visualDirections: string[];
  audioStyle: string;
}

export interface ImportCalculationResult {
  costUSD: number;
  usdToBrlRate: number;
  costBRL: number;
  shippingBRL: number;
  importTaxBRL: number;
  totalProductCostBRL: number;
  sellingPriceBRL: number;
  paymentGatewayFeeBRL: number;
  estimatedAdCostCPA: number;
  netProfitBRL: number;
  netMarginPercent: number;
  breakEvenRoas: number;
}

export interface PushNotificationSettings {
  enabled: boolean;
  notifyOnNewScan: boolean;
  notifyOnEarlyWaveOnly: boolean;
  minProfitMarginPercent: number; // e.g. 200, 250, 300
  backgroundRadarAlerts: boolean;
  soundAndVibration: boolean;
  notifyOnTrendPulseSpike?: boolean;
  pulseSensitivityThreshold?: number; // e.g. 30, 45, 60 percent rate of change
}

export type PulseVelocityStatus = 'CRITICAL_SPIKE' | 'RAPID_SURGE' | 'STEADY' | 'COOLING';

export interface TrendPulseNicheAnalysis {
  niche: ProductNiche;
  nicheLabel: string;
  nicheIcon: string;
  earlyWaveCount: number;
  totalProducts: number;
  earlyWaveRatioPercent: number;
  avgViralityScore: number;
  avgGrowthRatePercent: number;
  rateOfChangePercent: number; // Calculated rate of change vs baseline or previous pulse snapshot
  velocityScore: number; // 0-100 index of momentum
  pulseStatus: PulseVelocityStatus;
  isSpike: boolean;
  topProduct: TrendingProduct | null;
  lastUpdated: string;
}

export interface TrendPulseReport {
  analyzedAt: string;
  totalEarlyWaveCount: number;
  overallAverageRateOfChange: number;
  activeSpikesCount: number;
  surgingNiches: TrendPulseNicheAnalysis[];
  highestVelocityNiche: TrendPulseNicheAnalysis | null;
  allNiches: TrendPulseNicheAnalysis[];
}

export interface PushAlertLog {
  id: string;
  productId: string;
  productName: string;
  viralityScore: number;
  profitMarginPercent: number;
  timestamp: string;
  status: 'delivered' | 'clicked' | 'delivered-morning' | 'delivered-afternoon' | 'delivered-evening';
  alertType?: 'product_radar' | 'trend_pulse_spike';
  niche?: string;
  rateOfChangePercent?: number;
}

export interface AppUpdateInfo {
  version: string;
  releaseDate: string;
  title: string;
  highlights: string[];
  downloadUrl: string;
  fileSizeMb?: number;
  isMandatory?: boolean;
}

export interface AppUpdateConfig {
  currentVersion: string;
  driveFolderUrl: string;
  versionJsonUrl: string;
  lastCheckedAt?: string;
  autoCheckOnStartup: boolean;
}

export type PriceTrendDirection = 'cheaper_supplier' | 'more_expensive_supplier' | 'higher_resale' | 'lower_resale' | 'stable';
export type PriceAlertSeverity = 'opportunity' | 'warning' | 'neutral';

export interface ProductPriceCheck {
  productId: string;
  productName: string;
  originalCostUSD: number;
  originalPriceBRL: number;
  originalMarginPercent: number;
  currentCostUSD: number;
  currentPriceBRL: number;
  currentMarginPercent: number;
  costDiffUSD: number;
  costChangePercent: number;
  priceDiffBRL: number;
  priceChangePercent: number;
  marginDiffPercent: number;
  trend: PriceTrendDirection;
  alertSeverity: PriceAlertSeverity;
  supplierStatus: string;
  marketObservation: string;
  checkedAt: string;
  source: 'api_realtime' | 'api_cached';
}

export interface PriceMonitorSummary {
  lastCheckedAt: string | null;
  totalMonitored: number;
  opportunitiesCount: number;
  warningsCount: number;
  stableCount: number;
  avgCostChangePercent: number;
  exchangeRateUSDBRL: number;
  items: Record<string, ProductPriceCheck>;
}

export type ProductTrendVelocity = 'Rising Fast' | 'Stable' | 'Peak Volume';

export interface ProductSocialProof {
  velocity: ProductTrendVelocity;
  velocityLabel: string;
  recentQueryCount: number;
  queriesLast24Hours: number;
  matchedQueries: string[];
  intensityPercent: number; // 0-100% relative velocity index
  relativeSocialProofText: string;
  lastSearchedFormatted?: string;
  velocityReason: string;
}
