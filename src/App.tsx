import React, { useState, useEffect, useMemo, useCallback, useRef, Suspense } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Navbar } from './components/Navbar';
import { RadarHero } from './components/RadarHero';
import { ProductCard } from './components/ProductCard';
import { OfflineIndicator } from './components/OfflineIndicator';
import { EarlyWaveDashboard } from './components/EarlyWaveDashboard';
import { TrendPulseSection } from './components/TrendPulseSection';

// High-speed lazy loading: Keep initial bundle minimal so mobile devices render in under 1 second
const ProductDetailModal = React.lazy(() =>
  import('./components/ProductDetailModal').then((m) => ({ default: m.ProductDetailModal }))
);
const ProfitCalculatorModal = React.lazy(() =>
  import('./components/ProfitCalculatorModal').then((m) => ({ default: m.ProfitCalculatorModal }))
);
const AdCreativeModal = React.lazy(() =>
  import('./components/AdCreativeModal').then((m) => ({ default: m.AdCreativeModal }))
);
const LiveScannerFeed = React.lazy(() =>
  import('./components/LiveScannerFeed').then((m) => ({ default: m.LiveScannerFeed }))
);
const SavedRadarView = React.lazy(() =>
  import('./components/SavedRadarView').then((m) => ({ default: m.SavedRadarView }))
);
const OfflineStorageModal = React.lazy(() =>
  import('./components/OfflineStorageModal').then((m) => ({ default: m.OfflineStorageModal }))
);
const PushNotificationModal = React.lazy(() =>
  import('./components/PushNotificationModal').then((m) => ({ default: m.PushNotificationModal }))
);
const UpdateNotificationModal = React.lazy(() =>
  import('./components/UpdateNotificationModal').then((m) => ({ default: m.UpdateNotificationModal }))
);
const UpdateSettingsModal = React.lazy(() =>
  import('./components/UpdateSettingsModal').then((m) => ({ default: m.UpdateSettingsModal }))
);
const WorkspaceHubModal = React.lazy(() =>
  import('./components/WorkspaceHubModal').then((m) => ({ default: m.WorkspaceHubModal }))
);
const OnboardingModal = React.lazy(() =>
  import('./components/OnboardingModal').then((m) => ({ default: m.OnboardingModal }))
);
const WifeBotConfigModal = React.lazy(() =>
  import('./components/WifeBotConfigModal').then((m) => ({ default: m.WifeBotConfigModal }))
);
const AICopilotModal = React.lazy(() =>
  import('./components/AICopilotModal').then((m) => ({ default: m.AICopilotModal }))
);

const ONBOARDING_STORAGE_KEY = 'tikblox_onboarding_completed_v1';
import { TrendingProduct, ProductNiche, AppUpdateInfo, ProductPriceCheck, PriceMonitorSummary } from './types';
import { INITIAL_CURATED_TRENDS } from './data/curatedTrends';
import {
  scanTrends,
  getSavedProductIds,
  toggleSaveProduct,
  getCachedScannedProducts,
  syncSavedProductsToIndexedDB,
  checkSavedProductsPrices,
  getStoredPriceChecks,
} from './services/api';
import {
  seedInitialIndexedDB,
  getAllSavedProductsFromIndexedDB,
  getAllCachedTrendsFromIndexedDB,
  saveProductToIndexedDB,
  autoCleanupTrendCacheIfDue,
} from './services/indexedDbService';
import {
  checkForAppUpdates,
  setVersionDismissed,
  CURRENT_APP_VERSION,
} from './services/updateChecker';
import { usePushNotifications } from './hooks/usePushNotifications';
import { useDynamicSeo } from './hooks/useDynamicSeo';
import { useTranslation } from './i18n/LanguageContext';
import { Radio, Sparkles, Filter, AlertCircle, BellRing, FolderUp, Download, ChevronDown, CheckCircle2, TrendingDown, X } from 'lucide-react';

export default function App() {
  const { t, language } = useTranslation();
  const [activeTab, setActiveTab] = useState<
    'all' | 'early_wave' | 'high_margin' | 'saved' | 'calculator'
  >('all');
  const [products, setProducts] = useState<TrendingProduct[]>(() => {
    const cached = getCachedScannedProducts();
    if (cached.length > 0) {
      // Merge unique
      const ids = new Set(cached.map((p) => p.id));
      const rest = INITIAL_CURATED_TRENDS.filter((p) => !ids.has(p.id));
      return [...cached, ...rest];
    }
    return INITIAL_CURATED_TRENDS;
  });

  const [savedIds, setSavedIds] = useState<string[]>(() => getSavedProductIds());
  const [selectedNiche, setSelectedNiche] = useState<ProductNiche>('all');
  const [selectedOrigin, setSelectedOrigin] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals state
  const [selectedProductForDetail, setSelectedProductForDetail] =
    useState<TrendingProduct | null>(null);
  const [selectedProductForCalc, setSelectedProductForCalc] =
    useState<TrendingProduct | null>(null);
  const [selectedProductForCreative, setSelectedProductForCreative] =
    useState<TrendingProduct | null>(null);

  // Synchronize dynamic SEO metadata (Title, OG, Twitter, Schema.org) and deep-link URL
  useDynamicSeo(selectedProductForDetail, language);

  const [isScanning, setIsScanning] = useState(false);
  const [showScanFeedModal, setShowScanFeedModal] = useState(false);
  const [newlyFoundCount, setNewlyFoundCount] = useState(0);
  const [showPushModal, setShowPushModal] = useState(false);

  // App Update states
  const [availableUpdate, setAvailableUpdate] = useState<AppUpdateInfo | null>(null);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showUpdateSettingsModal, setShowUpdateSettingsModal] = useState(false);

  // Google Workspace Hub state
  const [showWorkspaceHub, setShowWorkspaceHub] = useState(false);
  const [workspaceInitialTab, setWorkspaceInitialTab] = useState<'drive' | 'gmail' | 'classroom'>('drive');
  const [showOfflineStorageModal, setShowOfflineStorageModal] = useState(false);

  // Onboarding Welcome Tour state
  const [showOnboardingModal, setShowOnboardingModal] = useState(false);
  const [showWifeBotModal, setShowWifeBotModal] = useState(false);
  const [showAICopilotModal, setShowAICopilotModal] = useState(false);

  // Auto-launch onboarding tour on first visit
  useEffect(() => {
    try {
      const isCompleted = localStorage.getItem(ONBOARDING_STORAGE_KEY);
      if (!isCompleted) {
        const timer = setTimeout(() => {
          setShowOnboardingModal(true);
        }, 800);
        return () => clearTimeout(timer);
      }
    } catch {
      // ignore
    }
  }, []);

  // IndexedDB offline cache initialization & background hydration (deferred so initial UI paint is instant)
  useEffect(() => {
    let isMounted = true;
    const initOfflineStorage = async () => {
      try {
        // 1. Hydrate saved products from IndexedDB first (fast)
        const offlineSaved = await getAllSavedProductsFromIndexedDB();
        if (isMounted && offlineSaved.length > 0) {
          const offlineIds = offlineSaved.map((p) => p.id);
          const currentLocal = getSavedProductIds();
          const merged = Array.from(new Set([...currentLocal, ...offlineIds]));
          setSavedIds(merged);
        }

        // 2. Hydrate trend history from IndexedDB if available
        const offlineTrends = await getAllCachedTrendsFromIndexedDB();
        if (isMounted && offlineTrends && offlineTrends.length > 0) {
          setProducts((prev) => {
            const map = new Map<string, TrendingProduct>();
            offlineTrends.forEach((p) => map.set(p.id, p));
            prev.forEach((p) => {
              if (!map.has(p.id)) map.set(p.id, p);
            });
            return Array.from(map.values());
          });
        }

        // 3. Seed initial curated trends into IndexedDB in the background if database is empty
        await seedInitialIndexedDB(INITIAL_CURATED_TRENDS);

        // 4. Sync existing saved products into IndexedDB
        await syncSavedProductsToIndexedDB(INITIAL_CURATED_TRENDS);

        // 5. Automatic maintenance: purge products from trend cache older than 30 days
        await autoCleanupTrendCacheIfDue(30);
      } catch (e) {
        console.warn('IndexedDB initial sync error:', e);
      }
    };

    // Defer heavy IndexedDB operations until after initial render is completely painted
    const timer = setTimeout(() => {
      if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
        window.requestIdleCallback(() => initOfflineStorage(), { timeout: 3000 });
      } else {
        initOfflineStorage();
      }
    }, 400);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, []);

  // Check for updates on startup
  useEffect(() => {
    const checkUpdates = async () => {
      try {
        const result = await checkForAppUpdates(false);
        if (result.hasUpdate && result.updateInfo) {
          setAvailableUpdate(result.updateInfo);
        }
      } catch {
        // Silently handled
      }
    };
    // Delay check slightly so initial app render is instant
    const timer = setTimeout(checkUpdates, 2000);
    return () => clearTimeout(timer);
  }, []);

  // Push Notifications Hook
  const {
    permission: pushPermission,
    settings: pushSettings,
    updateSettings: updatePushSettings,
    enableNotifications,
    disableNotifications,
    triggerTestAlert,
    notifyProduct,
    history: pushAlertHistory,
  } = usePushNotifications(products);

  // Listen to Service Worker messages when user clicks on a push notification
  useEffect(() => {
    const handleServiceWorkerMessage = (event: MessageEvent) => {
      if (event.data?.type === 'TIKBLOX_OPEN_PRODUCT' && event.data.productId) {
        const target = products.find((p) => p.id === event.data.productId);
        if (target) {
          setSelectedProductForDetail(target);
        }
      }
    };

    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', handleServiceWorkerMessage);
    }

    // Check query params if opened from a notification URL (?product=xyz)
    const params = new URLSearchParams(window.location.search);
    const prodParam = params.get('product');
    if (prodParam) {
      const match = products.find((p) => p.id === prodParam);
      if (match) {
        setSelectedProductForDetail(match);
      }
    }

    return () => {
      if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
        navigator.serviceWorker.removeEventListener('message', handleServiceWorkerMessage);
      }
    };
  }, [products]);

  // Stable Callbacks to prevent re-rendering ProductCard components
  const handleToggleSave = useCallback((productId: string) => {
    const target = products.find((p) => p.id === productId);
    toggleSaveProduct(productId, target);
    setSavedIds(getSavedProductIds());
  }, [products]);

  const handleOpenDeepDive = useCallback((product: TrendingProduct) => {
    setSelectedProductForDetail(product);
  }, []);

  const handleOpenCalculator = useCallback((product: TrendingProduct) => {
    setSelectedProductForCalc(product);
  }, []);

  const handleOpenCreativeGenerator = useCallback((product: TrendingProduct) => {
    setSelectedProductForCreative(product);
  }, []);

  const handleSetSearchQuery = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  const handleSetSelectedNiche = useCallback((niche: ProductNiche) => {
    setSelectedNiche(niche);
  }, []);

  const handleSetSelectedOrigin = useCallback((origin: string) => {
    setSelectedOrigin(origin);
  }, []);

  // O(1) Set lookup for saved product IDs across thousands of cards
  const savedIdsSet = useMemo(() => new Set(savedIds), [savedIds]);

  // Fast O(N) filtering using Set.has instead of O(N*M) Array.includes
  const savedProductsList = useMemo(() => {
    return products.filter((p) => savedIdsSet.has(p.id));
  }, [products, savedIdsSet]);

  // Price Monitor state for saved products
  const [priceSummary, setPriceSummary] = useState<PriceMonitorSummary | null>(() => getStoredPriceChecks());
  const [isCheckingPrices, setIsCheckingPrices] = useState(false);
  const [showPriceVariationToast, setShowPriceVariationToast] = useState(false);
  const [savedInitialSubTab, setSavedInitialSubTab] = useState<'saved' | 'price_monitor' | 'history'>('saved');

  // Startup price monitor check: Compare original detected price with fresh API call whenever the app opens
  const hasTriggeredStartupPriceCheck = useRef(false);
  useEffect(() => {
    if (hasTriggeredStartupPriceCheck.current) return;
    if (savedProductsList.length > 0) {
      hasTriggeredStartupPriceCheck.current = true;
      const runStartupCheck = async () => {
        setIsCheckingPrices(true);
        try {
          const summary = await checkSavedProductsPrices(savedProductsList, false);
          setPriceSummary(summary);
          if (summary.opportunitiesCount > 0 || summary.warningsCount > 0) {
            setShowPriceVariationToast(true);
          }
        } catch (err) {
          console.warn('Initial price monitor check error:', err);
        } finally {
          setIsCheckingPrices(false);
        }
      };

      const timer = setTimeout(runStartupCheck, 1200);
      return () => clearTimeout(timer);
    }
  }, [savedProductsList]);

  const handleRefreshPrices = useCallback(async () => {
    if (savedProductsList.length === 0) return;
    setIsCheckingPrices(true);
    try {
      const summary = await checkSavedProductsPrices(savedProductsList, true);
      setPriceSummary(summary);
    } catch (e) {
      console.warn('Price check refresh failed:', e);
    } finally {
      setIsCheckingPrices(false);
    }
  }, [savedProductsList]);

  const handleApplyPriceUpdate = useCallback(async (productId: string, check: ProductPriceCheck) => {
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id === productId) {
          return {
            ...p,
            estimatedCostUSD: check.currentCostUSD,
            estimatedPriceBRL: check.currentPriceBRL,
            estimatedProfitMarginPercent: check.currentMarginPercent,
            priceCheck: check,
          };
        }
        return p;
      })
    );

    const targetProduct = products.find((p) => p.id === productId);
    if (targetProduct) {
      const updated: TrendingProduct = {
        ...targetProduct,
        estimatedCostUSD: check.currentCostUSD,
        estimatedPriceBRL: check.currentPriceBRL,
        estimatedProfitMarginPercent: check.currentMarginPercent,
        priceCheck: check,
      };
      try {
        await saveProductToIndexedDB(updated);
      } catch (err) {
        console.warn('Could not update product in IndexedDB:', err);
      }
    }
  }, [products]);

  // Daily Global Scan Logic (runs once per day at midnight Brasília time)
  useEffect(() => {
    const checkDailyScan = () => {
      const now = new Date();
      // Use Brasília time (UTC-3)
      const spTime = new Date(now.toLocaleString("en-US", { timeZone: "America/Sao_Paulo" }));
      const todayDateStr = `${spTime.getFullYear()}-${spTime.getMonth() + 1}-${spTime.getDate()}`;
      
      const lastScan = localStorage.getItem('tikblox_last_daily_scan_date');
      if (lastScan !== todayDateStr) {
        // Need to run the daily scan!
        localStorage.setItem('tikblox_last_daily_scan_date', todayDateStr);
        handleTriggerScan(true);
      }
    };
    
    // Delay slightly to not block initial render or conflict with onboarding
    const timer = setTimeout(checkDailyScan, 3000);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Trigger web scan
  const handleTriggerScan = async (isDailyGlobalScan = false) => {
    setIsScanning(true);
    setShowScanFeedModal(true);

    try {
      const result = await scanTrends({
        niche: isDailyGlobalScan ? undefined : (selectedNiche !== 'all' ? selectedNiche : undefined),
        originCountry: isDailyGlobalScan ? undefined : (selectedOrigin !== 'all' ? selectedOrigin : undefined),
        query: isDailyGlobalScan ? undefined : (searchQuery || undefined),
      });

      if (result.products && result.products.length > 0) {
        setProducts((prev) => {
          const map = new Map<string, TrendingProduct>();
          result.products.forEach((p) => {
            // @ts-ignore
            if (searchQuery) p._matchedQuery = searchQuery.trim().toLowerCase();
            map.set(p.id, p);
          });
          prev.forEach((p) => {
            if (!map.has(p.id)) map.set(p.id, p);
          });
          return Array.from(map.values());
        });
        setNewlyFoundCount(result.products.length);

        // If push notifications are active, dispatch alert for newly detected viral product
        if (pushSettings.enabled && pushSettings.notifyOnNewScan) {
          const topCandidate =
            result.products.find(
              (p) =>
                p.estimatedProfitMarginPercent >= pushSettings.minProfitMarginPercent &&
                (pushSettings.notifyOnEarlyWaveOnly ? p.waveStage === 'early_wave' : true)
            ) || result.products[0];

          if (topCandidate) {
            setTimeout(() => {
              notifyProduct(topCandidate);
            }, 1000);
          }
        }
      }
    } catch {
      // Handled cleanly by resilient fallback
    } finally {
      setIsScanning(false);
    }
  };

  // High-performance filter products based on activeTab, niche, origin, search
  // Hoisting string normalizations and filter branches outside the loop for instantaneous 60fps throughput
  const filteredProducts = useMemo(() => {
    const rawQuery = searchQuery.trim().toLowerCase();
    const hasQuery = rawQuery.length > 0;
    const isEarlyWave = activeTab === 'early_wave';
    const isHighMargin = activeTab === 'high_margin';
    const filterNiche = selectedNiche !== 'all' ? selectedNiche : null;
    const filterOrigin = selectedOrigin !== 'all' ? selectedOrigin : null;

    return products.filter((p) => {
      // 1. Fast tab filter
      if (isEarlyWave && p.waveStage !== 'early_wave') return false;
      if (isHighMargin && p.estimatedProfitMarginPercent < 280) return false;

      // 2. Fast niche filter
      if (filterNiche && p.niche !== filterNiche) return false;

      // 3. Fast origin filter
      if (filterOrigin && p.originCountry !== filterOrigin) return false;

      // 4. Search query (only evaluated if query exists, fast-path checks)
      if (hasQuery) {
        return (
          p.name.toLowerCase().includes(rawQuery) ||
          p.originalName.toLowerCase().includes(rawQuery) ||
          p.culturalFitReason.toLowerCase().includes(rawQuery) ||
          p.targetAudience.toLowerCase().includes(rawQuery) ||
          p.supplierKeywords?.some(k => k.toLowerCase().includes(rawQuery)) ||
          // @ts-ignore - temporary property injected during AI scan
          p._matchedQuery === rawQuery
        );
      }

      return true;
    });
  }, [products, activeTab, selectedNiche, selectedOrigin, searchQuery]);

  // Progressive DOM Chunking / Windowing:
  // Rendering 3,000 cards simultaneously would block the main thread with >75k DOM nodes.
  // By chunking into responsive batches of 24 items, initial render and filter transitions stay under 5ms.
  const CHUNK_SIZE = 24;
  const [displayLimit, setDisplayLimit] = useState(CHUNK_SIZE);
  const loadMoreSentinelRef = useRef<HTMLDivElement>(null);

  // Reset display chunk when active filters change so the user starts smoothly at the top
  useEffect(() => {
    setDisplayLimit(CHUNK_SIZE);
  }, [activeTab, selectedNiche, selectedOrigin, searchQuery]);

  const visibleProducts = useMemo(() => {
    return filteredProducts.slice(0, displayLimit);
  }, [filteredProducts, displayLimit]);

  const hasMoreProducts = displayLimit < filteredProducts.length;

  const handleLoadMore = useCallback(() => {
    setDisplayLimit((prev) => Math.min(prev + CHUNK_SIZE, filteredProducts.length));
  }, [filteredProducts.length]);

  // Automatic IntersectionObserver to load more items smoothly as the user scrolls
  useEffect(() => {
    const sentinel = loadMoreSentinelRef.current;
    if (!sentinel || !hasMoreProducts) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setDisplayLimit((prev) => Math.min(prev + CHUNK_SIZE, filteredProducts.length));
        }
      },
      { rootMargin: '500px' }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMoreProducts, filteredProducts.length]);

  return (
    <div className="min-h-screen bg-[#1A1D27] text-white flex flex-col font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Top Sticky Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        savedCount={savedIds.length}
        onOpenPushModal={() => setShowPushModal(true)}
        isPushActive={pushPermission === 'granted' && pushSettings.enabled}
        onOpenUpdateSettings={() => setShowUpdateSettingsModal(true)}
        hasUpdateAvailable={!!availableUpdate}
        onOpenWorkspaceHub={(tab = 'drive') => {
          setWorkspaceInitialTab(tab);
          setShowWorkspaceHub(true);
        }}
        onOpenOfflineStorage={() => setShowOfflineStorageModal(true)}
        onOpenOnboardingTour={() => setShowOnboardingModal(true)}
        onOpenWifeBot={() => setShowWifeBotModal(true)}
      />

      {/* Top Update Alert Banner (shown when a newer version is detected on Google Drive) */}
      {availableUpdate && (
        <div className="bg-gradient-to-r from-[#FE2C55]/20 via-[#161823] to-[#25F4EE]/20 border-b border-[#FE2C55]/30 px-4 py-2.5">
          <div className="mx-auto max-w-7xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5">
            <div className="flex items-center gap-2.5">
              <span className="flex h-2.5 w-2.5 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FE2C55] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#FE2C55]"></span>
              </span>
              <span className="text-xs text-white">
                <strong className="text-[#FE2C55] font-black mr-1.5">ATUALIZAÇÃO DISPONÍVEL:</strong>
                Versão <strong>v{availableUpdate.version}</strong> pronta para download no seu notebook!
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowUpdateModal(true)}
                className="px-3 py-1 rounded-lg bg-gradient-to-r from-[#FE2C55] to-[#FF0050] text-white font-extrabold text-[11px] shadow-sm hover:brightness-110 active:scale-95 transition cursor-pointer flex items-center gap-1.5"
              >
                <Download className="w-3 h-3" />
                <span>Ver Novidades & Baixar</span>
              </button>
              <button
                onClick={() => {
                  setVersionDismissed(availableUpdate.version);
                  setAvailableUpdate(null);
                }}
                className="px-2 py-1 text-[11px] text-[#A6A7B2] hover:text-white transition cursor-pointer"
              >
                Dispensar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hero with live scan controls (only in non-calculator and non-saved tabs) */}
      <AnimatePresence>
        {activeTab !== 'saved' && activeTab !== 'calculator' && (
          <motion.div
            key="radar-hero-section"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
          >
            <RadarHero
              selectedNiche={selectedNiche}
              setSelectedNiche={handleSetSelectedNiche}
              selectedOrigin={selectedOrigin}
              setSelectedOrigin={handleSetSelectedOrigin}
              onOpenCopilot={() => setShowAICopilotModal(true)}
              totalProductsCount={products.length}
              onOpenTour={() => setShowOnboardingModal(true)}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <main className="flex-1 mx-auto max-w-7xl w-full px-3 sm:px-6 lg:px-8 py-5 sm:py-8">
        
        {/* Push Notification banner removed */}
        
        {/* TAB Content Switching with Framer Motion */}
        <AnimatePresence mode="wait" initial={false}>
          {activeTab === 'saved' ? (
            <motion.div
              key="tab-view-saved"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            >
              <Suspense
                fallback={
                  <div className="h-64 rounded-2xl bg-[#262B3A] border border-white/5 animate-pulse flex items-center justify-center text-xs text-[#757788]">
                    Carregando produtos salvos...
                  </div>
                }
              >
                <SavedRadarView
                  savedProducts={savedProductsList}
                  priceSummary={priceSummary}
                  isCheckingPrices={isCheckingPrices}
                  onRefreshPrices={handleRefreshPrices}
                  onApplyPriceUpdate={handleApplyPriceUpdate}
                  onToggleSave={handleToggleSave}
                  onOpenDeepDive={handleOpenDeepDive}
                  onOpenCalculator={handleOpenCalculator}
                  onOpenCreativeGenerator={handleOpenCreativeGenerator}
                  onBackToRadar={() => setActiveTab('all')}
                  initialSubTab={savedInitialSubTab}
                />
              </Suspense>
            </motion.div>
          ) : activeTab === 'calculator' ? (
            /* TAB: General Calculator */
            <motion.div
              key="tab-view-calculator"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
              className="max-w-3xl mx-auto"
            >
              <div className="text-center mb-6">
                <h2 className="text-2xl font-black text-white">
                  Simulador de Margem Líquida & Viabilidade de Importação
                </h2>
                <p className="text-xs sm:text-sm text-[#A6A7B2] mt-1">
                  Calcule custos em USD, frete internacional, impostos alfandegários (Remessa Conforme), taxas de checkout e tráfego pago para qualquer produto.
                </p>
              </div>
              <Suspense
                fallback={
                  <div className="h-96 rounded-2xl bg-[#262B3A] border border-white/5 animate-pulse flex items-center justify-center text-xs text-[#757788]">
                    Carregando simulador de margem...
                  </div>
                }
              >
                <ProfitCalculatorModal
                  product={null}
                  onClose={() => setActiveTab('all')}
                />
              </Suspense>
            </motion.div>
          ) : (
            /* TAB: Product Grid (All / Early Wave / High Margin) */
            <motion.div
              key={`tab-view-products-${activeTab}`}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            >
              {activeTab === 'early_wave' && (
                <>
                  <TrendPulseSection
                    products={products}
                    selectedNiche={selectedNiche}
                    onSelectNiche={setSelectedNiche}
                    onSelectEarlyWaveTab={() => setActiveTab('early_wave')}
                    pushSettings={pushSettings}
                    onUpdatePushSettings={updatePushSettings}
                    onOpenPushModal={() => setShowPushModal(true)}
                  />
                  <EarlyWaveDashboard
                    products={products}
                    selectedNiche={selectedNiche}
                    onSelectNiche={setSelectedNiche}
                    activeTab={activeTab}
                    onSelectEarlyWaveTab={() => setActiveTab('early_wave')}
                  />
                </>
              )}

              {/* Section Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 sm:mb-6">
                <div>
                  <h2 className="text-base sm:text-xl font-black text-white flex items-center gap-2">
                    <span className="relative flex h-2.5 w-2.5 shrink-0">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FE2C55] opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#FE2C55]"></span>
                    </span>
                    <span>
                      {activeTab === 'early_wave'
                        ? (language === 'en' ? '🌊 Early Waves (Low Competition in Brazil)' : '🌊 Ondas Iniciais (Pouca Concorrência no Brasil)')
                        : activeTab === 'high_margin'
                        ? (language === 'en' ? '⚡ High Margin Products (300%+ Gross Profit)' : '⚡ Produtos de Alta Margem (300%+ de Lucro Bruto)')
                        : (language === 'en' ? 'Global Rising Products Radar' : 'Radar de Produtos em Ascensão Global')}
                    </span>
                  </h2>
                  <p className="text-xs text-[#A6A7B2] mt-0.5">
                    {filteredProducts.length} {language === 'en' ? 'filtered trends with high potential in the Brazilian market.' : 'tendências filtradas com alto potencial no mercado brasileiro.'}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-xs">
                  <span className="text-[#A6A7B2] text-[11px]">{language === 'en' ? 'Filtering:' : 'Filtrando:'}</span>
                  <span className="rounded-lg bg-[#161823] px-2.5 py-1 text-white border border-white/10 font-bold text-[11px]">
                    {selectedNiche === 'all' ? t('niche_all') : selectedNiche}
                  </span>
                  {selectedOrigin !== 'all' && (
                    <span className="rounded-lg bg-[#161823] px-2.5 py-1 text-white border border-white/10 font-bold text-[11px]">
                      {selectedOrigin === 'US' ? (language === 'en' ? '🇺🇸 USA' : '🇺🇸 EUA') : '🇨🇳 China'}
                    </span>
                  )}
                </div>
              </div>

              {/* Products Grid */}
              {filteredProducts.length === 0 ? (
                <div className="py-16 text-center rounded-2xl border border-white/10 bg-[#2A3042] p-6 sm:p-8">
                  <AlertCircle className="w-10 h-10 text-[#FE2C55] mx-auto mb-3" />
                  <h3 className="text-base font-bold text-white">
                    {language === 'en' ? 'No products found with these filters' : 'Nenhum produto encontrado com estes filtros'}
                  </h3>
                  <p className="text-xs text-[#A6A7B2] max-w-sm mx-auto mt-1 mb-4">
                    {language === 'en' ? 'Try clearing the search terms or run a new intelligence scan with the button below.' : 'Tente limpar os termos de busca ou dispare uma nova varredura de inteligência com o botão abaixo.'}
                  </p>
                  <button
                    onClick={() => {
                      setSelectedNiche('all');
                      setSelectedOrigin('all');
                      setSearchQuery('');
                    }}
                    className="rounded-xl bg-[#FE2C55] hover:bg-[#FF0050] px-4 py-2 text-xs font-bold text-white transition shadow-md shadow-[#FE2C55]/30 cursor-pointer"
                  >
                    {language === 'en' ? 'Reset Default Filters' : 'Restaurar Filtros Padrão'}
                  </button>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                    {visibleProducts.map((product) => (
                      <ProductCard
                        key={product.id}
                        product={product}
                        priceCheck={priceSummary?.items[product.id]}
                        isSaved={savedIdsSet.has(product.id)}
                        onToggleSave={handleToggleSave}
                        onOpenDeepDive={handleOpenDeepDive}
                        onOpenCalculator={handleOpenCalculator}
                        onOpenCreativeGenerator={handleOpenCreativeGenerator}
                      />
                    ))}
                  </div>

                  {/* Progressive Windowing / Pagination Controls */}
                  {hasMoreProducts ? (
                    <div className="mt-8 flex flex-col items-center justify-center gap-3 pt-4 border-t border-white/10">
                      <p className="text-xs text-[#A6A7B2]">
                        {language === 'en' ? 'Showing ' : 'Exibindo '}
                        <strong className="text-white">{visibleProducts.length}</strong> {language === 'en' ? 'of ' : 'de '}
                        <strong className="text-white">{filteredProducts.length.toLocaleString(language === 'en' ? 'en-US' : 'pt-BR')}</strong> {language === 'en' ? 'products found' : 'produtos encontrados'}
                      </p>
                      <button
                        onClick={handleLoadMore}
                        className="px-6 py-2.5 rounded-xl bg-[#161823] hover:bg-[#1E202E] border border-white/10 hover:border-[#25F4EE]/50 text-white font-bold text-xs flex items-center gap-2 transition active:scale-95 cursor-pointer shadow-lg hover:shadow-[#25F4EE]/10"
                      >
                        <span>{language === 'en' ? `Load More Products (+${CHUNK_SIZE})` : `Carregar Mais Produtos (+${CHUNK_SIZE})`}</span>
                        <ChevronDown className="w-4 h-4 text-[#25F4EE]" />
                      </button>
                      {/* Invisible sentinel for automatic smooth scrolling loading */}
                      <div ref={loadMoreSentinelRef} className="h-4 w-full" />
                    </div>
                  ) : filteredProducts.length > CHUNK_SIZE ? (
                    <div className="mt-8 text-center pt-4 border-t border-white/5 text-xs text-[#757788] flex items-center justify-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span>
                        {language === 'en'
                          ? `All ${filteredProducts.length.toLocaleString('en-US')} radar products loaded`
                          : `Todos os ${filteredProducts.length.toLocaleString('pt-BR')} produtos do radar carregados`}
                      </span>
                    </div>
                  ) : null}
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>

      </main>

      {/* Modals wrapped in Suspense for asynchronous lazy chunk loading */}
      <Suspense fallback={null}>
        <ProductDetailModal
          product={selectedProductForDetail}
          onClose={() => setSelectedProductForDetail(null)}
          onOpenCalculator={setSelectedProductForCalc}
          onOpenCreativeGenerator={setSelectedProductForCreative}
          onOpenWorkspaceHub={(tab = 'drive') => {
            setWorkspaceInitialTab(tab);
            setShowWorkspaceHub(true);
          }}
        />

        {selectedProductForCalc && (
          <ProfitCalculatorModal
            product={selectedProductForCalc}
            onClose={() => setSelectedProductForCalc(null)}
          />
        )}

        <AdCreativeModal
          product={selectedProductForCreative}
          onClose={() => setSelectedProductForCreative(null)}
        />

        <LiveScannerFeed
          isOpen={showScanFeedModal}
          onClose={() => setShowScanFeedModal(false)}
          onFinish={() => {}}
          scannedCount={newlyFoundCount}
        />

        {/* Push Notification Configuration Modal */}
        <PushNotificationModal
          isOpen={showPushModal}
          onClose={() => setShowPushModal(false)}
          permission={pushPermission}
          settings={pushSettings}
          onUpdateSettings={updatePushSettings}
          onEnable={enableNotifications}
          onDisable={disableNotifications}
          onSendTest={triggerTestAlert}
          alertHistory={pushAlertHistory}
          onSelectProductById={(productId) => {
            const matched = products.find((p) => p.id === productId);
            if (matched) {
              setSelectedProductForDetail(matched);
            }
          }}
          sampleProduct={products[0]}
        />

        {/* Offline IndexedDB Storage Inspection Modal */}
        <OfflineStorageModal
          isOpen={showOfflineStorageModal}
          onClose={() => setShowOfflineStorageModal(false)}
          allProducts={products}
          onOpenSavedTab={() => {
            setActiveTab('saved');
            setShowOfflineStorageModal(false);
          }}
        />

        {/* App Update Notification Modal (for the end-user customer) */}
        {availableUpdate && (
          <UpdateNotificationModal
            isOpen={showUpdateModal}
            updateInfo={availableUpdate}
            onClose={() => setShowUpdateModal(false)}
            onDismissForever={() => {
              setVersionDismissed(availableUpdate.version);
              setAvailableUpdate(null);
            }}
          />
        )}

        {/* App Update Configuration Modal (for the app owner / Google Drive setup) */}
        <UpdateSettingsModal
          isOpen={showUpdateSettingsModal}
          onClose={() => setShowUpdateSettingsModal(false)}
          onUpdateDetected={(info) => {
            setAvailableUpdate(info);
            setShowUpdateModal(true);
          }}
        />

        {/* Google Workspace Hub (Drive, Gmail, Classroom) */}
        <WorkspaceHubModal
          isOpen={showWorkspaceHub}
          onClose={() => setShowWorkspaceHub(false)}
          initialTab={workspaceInitialTab}
          activeProduct={selectedProductForDetail}
        />

        {/* Onboarding Welcome Tour Modal (Radar, Bookmarks, Profit Calculator) */}
        <OnboardingModal
          isOpen={showOnboardingModal}
          onClose={() => setShowOnboardingModal(false)}
          onNavigateToTab={(tab) => {
            setActiveTab(tab);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          onOpenCalculator={(prod) => {
            setSelectedProductForCalc(prod || products[0] || null);
          }}
          sampleProduct={products[0] || null}
        />

        {/* Wife Bot Telegram & TikTok Personal Radar Modal */}
        <WifeBotConfigModal
          isOpen={showWifeBotModal}
          onClose={() => setShowWifeBotModal(false)}
          products={products}
        />
        {/* Copilot AI Modal */}
        <AICopilotModal
          isOpen={showAICopilotModal}
          onClose={() => setShowAICopilotModal(false)}
        />
      </Suspense>

      {/* Offline Toast Indicator */}
      <OfflineIndicator onOpenStorageModal={() => setShowOfflineStorageModal(true)} />

      {/* Floating Price Variation Alert Toast on App Startup */}
      {showPriceVariationToast && priceSummary && (priceSummary.opportunitiesCount > 0 || priceSummary.warningsCount > 0) && (
        <div className="fixed bottom-6 right-4 sm:right-6 z-40 max-w-sm rounded-2xl border border-[#25F4EE]/40 bg-[#242938]/95 backdrop-blur-md p-4 shadow-2xl shadow-[#25F4EE]/10 animate-in slide-in-from-bottom-5">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#25F4EE]/15 border border-[#25F4EE]/30 flex items-center justify-center shrink-0">
                <Sparkles className="w-4 h-4 text-[#25F4EE]" />
              </div>
              <div>
                <h4 className="text-xs font-black text-white">
                  {t('price_monitor_toast_title')}
                </h4>
                <p className="text-[11px] text-[#A6A7B2] mt-0.5 leading-snug">
                  {language === 'en'
                    ? `Detected price fluctuations in your saved products: ${priceSummary.opportunitiesCount} margin opportunities and ${priceSummary.warningsCount} cost warnings.`
                    : `Detectamos variações em seus produtos salvos: ${priceSummary.opportunitiesCount} oportunidades de margem e ${priceSummary.warningsCount} alertas de custo.`}
                </p>
                <div className="flex items-center gap-2 mt-2.5">
                  <button
                    onClick={() => {
                      setActiveTab('saved');
                      setSavedInitialSubTab('price_monitor');
                      setShowPriceVariationToast(false);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="px-3 py-1 rounded-lg text-[11px] font-bold bg-[#25F4EE] hover:bg-[#00D2C4] text-[#242938] transition cursor-pointer"
                  >
                    {t('price_monitor_toast_action')} →
                  </button>
                  <button
                    onClick={() => setShowPriceVariationToast(false)}
                    className="text-[11px] text-[#757788] hover:text-white px-2 py-1 transition cursor-pointer"
                  >
                    {language === 'en' ? 'Dismiss' : 'Dispensar'}
                  </button>
                </div>
              </div>
            </div>
            <button
              onClick={() => setShowPriceVariationToast(false)}
              className="text-[#757788] hover:text-white transition p-1 cursor-pointer"
              title={language === 'en' ? 'Close' : 'Fechar'}
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-white/10 bg-[#262B3A] py-8 px-4 sm:px-6 lg:px-8 text-xs text-[#A6A7B2]">
        <div className="mx-auto max-w-7xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-white">TIKBLOX</span>
            <span>
              — {language === 'en'
                ? 'Viral Trends Radar and Cross-Border Product Arbitrage for Brazil.'
                : 'Radar de Tendências Virais e Arbitragem de Produtos Estrangeiros para o Brasil.'}
            </span>
          </div>
          <div className="flex items-center gap-4 text-[#757788]">
            <span className="hover:text-white transition">
              {language === 'en' ? 'PWA Compatible with Android & iOS' : 'PWA Compatível com Android & iOS'}
            </span>
            <span>•</span>
            <span className="hover:text-white transition">IA do TikBlox Pro</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
