import React, { useState, useEffect, useMemo, useCallback, useRef, Suspense } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Navbar } from './components/Navbar';
import { RadarHero } from './components/RadarHero';
import { ProductCard } from './components/ProductCard';
import { OfflineIndicator } from './components/OfflineIndicator';
import { EarlyWaveDashboard } from './components/EarlyWaveDashboard';
import { TrendPulseSection } from './components/TrendPulseSection';
import { Header } from './components/ConvictionTerminal/Header';
import { ProductListPanel } from './components/ConvictionTerminal/ProductListPanel';
import { ProductDetailTerminal } from './components/ConvictionTerminal/ProductDetailTerminal';
import { AICopilotPanel } from './components/ConvictionTerminal/AICopilotPanel';
import { SavedRadarView } from './components/SavedRadarView';
import { AddCustomProductModal } from './components/ConvictionTerminal/AddCustomProductModal';
import { LandingPage } from './components/LandingPage/LandingPage';
import { LoginModal } from './components/Auth/LoginModal';
import {
  getCurrentSession,
  clearSession,
  UserSession,
} from './services/authService';

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

const ONBOARDING_STORAGE_KEY = 'tikblox_onboarding_completed_v1';
import { TrendingProduct, ProductNiche, AppUpdateInfo, ProductPriceCheck, PriceMonitorSummary } from './types';
import { INITIAL_CURATED_TRENDS, isBlueOceanOpportunity } from './data/curatedTrends';
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
import { Radio, Sparkles, Filter, AlertCircle, BellRing, FolderUp, Download, ChevronDown, CheckCircle2, TrendingDown, X, Bookmark } from 'lucide-react';

export default function App() {
  const { t, language } = useTranslation();
  const [activeTab, setActiveTab] = useState<
    'all' | 'early_wave' | 'high_margin' | 'saved' | 'calculator'
  >('all');
  const [products, setProducts] = useState<TrendingProduct[]>(() => {
    try {
      localStorage.removeItem('tikblox_scan_cache_v1');
      localStorage.removeItem('tikblox_scan_cache_v2');
    } catch {}
    const cached = getCachedScannedProducts().filter(isBlueOceanOpportunity);
    if (cached.length > 0) {
      // Merge unique
      const ids = new Set(cached.map((p) => p.id));
      const rest = INITIAL_CURATED_TRENDS.filter((p) => !ids.has(p.id) && isBlueOceanOpportunity(p));
      return [...cached, ...rest];
    }
    return INITIAL_CURATED_TRENDS.filter(isBlueOceanOpportunity);
  });

  const [savedIds, setSavedIds] = useState<string[]>(() => getSavedProductIds());
  const [selectedNiche, setSelectedNiche] = useState<ProductNiche>('all');
  const [selectedOrigin, setSelectedOrigin] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterFreeSampleOnly, setFilterFreeSampleOnly] = useState<boolean>(false);
  const [filterBlueOceanOnly, setFilterBlueOceanOnly] = useState<boolean>(false);
  const [activeProduct, setActiveProduct] = useState<TrendingProduct | null>(() => INITIAL_CURATED_TRENDS[0] || null);
  const [painelEsquerdoRecolhido, setPainelEsquerdoRecolhido] = useState(false);
  const [painelDireitoRecolhido, setPainelDireitoRecolhido] = useState(false);
  const [mobileTab, setMobileTab] = useState<'produtos' | 'terminal' | 'copilot'>('produtos');
  const [filterHighCommissionOnly, setFilterHighCommissionOnly] = useState<boolean>(false);
  const [showSavedModal, setShowSavedModal] = useState<boolean>(false);
  const [showCalculatorModal, setShowCalculatorModal] = useState<boolean>(false);
  const [showAddCustomModal, setShowAddCustomModal] = useState<boolean>(false);

  // Controle de Sessão de Assinante e Navegação Landing Page / App
  const [session, setSession] = useState<UserSession | null>(() => getCurrentSession());
  const [showLoginModal, setShowLoginModal] = useState<boolean>(false);
  const [currentView, setCurrentView] = useState<'app' | 'landing'>(() => {
    const s = getCurrentSession();
    // Apenas assinantes reais com plano ativo têm acesso ao terminal
    if (s && s.isAuthenticated && s.plan !== 'guest') return 'app';
    return 'landing';
  });

  // Redimensionamento dos painéis estilo TikBlox (com persistência no localStorage)
  const [redimensionando, setRedimensionando] = useState<'left' | 'right' | null>(null);
  const [isDesktop, setIsDesktop] = useState(false);

  const [leftWidth, setLeftWidth] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('tikblox_panel_left_width');
      if (saved) return Math.max(260, Math.min(500, Number(saved)));
    } catch {}
    return 340;
  });

  const [rightWidth, setRightWidth] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('tikblox_panel_right_width');
      if (saved) return Math.max(280, Math.min(600, Number(saved)));
    } catch {}
    return 380;
  });

  useEffect(() => {
    const check = () => setIsDesktop(window.innerWidth >= 1024);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('tikblox_panel_left_width', String(leftWidth));
      localStorage.setItem('tikblox_panel_right_width', String(rightWidth));
    } catch {}
  }, [leftWidth, rightWidth]);

  useEffect(() => {
    if (!redimensionando) return;

    const handlePointerMove = (e: MouseEvent | TouchEvent) => {
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      if (redimensionando === 'left') {
        const novo = Math.max(240, Math.min(Math.min(500, window.innerWidth - 650), clientX));
        setLeftWidth(novo);
      } else if (redimensionando === 'right') {
        const novo = Math.max(280, Math.min(Math.min(580, window.innerWidth - 650), window.innerWidth - clientX));
        setRightWidth(novo);
      }
    };

    const handlePointerUp = () => {
      setRedimensionando(null);
    };

    window.addEventListener('mousemove', handlePointerMove);
    window.addEventListener('mouseup', handlePointerUp);
    window.addEventListener('touchmove', handlePointerMove);
    window.addEventListener('touchend', handlePointerUp);

    return () => {
      window.removeEventListener('mousemove', handlePointerMove);
      window.removeEventListener('mouseup', handlePointerUp);
      window.removeEventListener('touchmove', handlePointerMove);
      window.removeEventListener('touchend', handlePointerUp);
    };
  }, [redimensionando]);

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

        // 2. Hydrate trend history from IndexedDB if available (Strict Blue Ocean Only)
        const offlineTrends = await getAllCachedTrendsFromIndexedDB();
        if (isMounted && offlineTrends && offlineTrends.length > 0) {
          const validTrends = offlineTrends.filter(isBlueOceanOpportunity);
          setProducts((prev) => {
            const map = new Map<string, TrendingProduct>();
            validTrends.forEach((p) => map.set(p.id, p));
            prev.filter(isBlueOceanOpportunity).forEach((p) => {
              if (!map.has(p.id)) map.set(p.id, p);
            });
            return Array.from(map.values()).filter(isBlueOceanOpportunity);
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
    setActiveProduct(product);
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
    if (false && savedProductsList.length > 0) { // PWA FROZEN: startup auto-check disabled
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
      if (false && lastScan !== todayDateStr) { // PWA FROZEN: daily auto-scan disabled
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
        query: isDailyGlobalScan ? undefined : (searchQuery.trim() || undefined),
      });

      if (result.products && result.products.length > 0) {
        setProducts((prev) => {
          const map = new Map<string, TrendingProduct>();
          result.products.forEach((p) => {
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

  // High-performance filter products based on activeTab, niche, origin, search, and TikTok Shop metrics
  const filteredProducts = useMemo(() => {
    const isEarlyWave = activeTab === 'early_wave';
    const isHighMargin = activeTab === 'high_margin';
    const filterNiche = selectedNiche !== 'all' ? selectedNiche : null;
    const filterOrigin = selectedOrigin !== 'all' ? selectedOrigin : null;
    const queryTrim = searchQuery.toLowerCase().trim();
    const queryTokens = queryTrim ? queryTrim.split(' ').filter(Boolean) : [];

    return products.filter((p) => {
      // 1. Fast tab filter
      if (isEarlyWave && p.waveStage !== 'early_wave' && p.tiktokShop?.saturationLevel !== 'Oceano Azul') return false;
      if (isHighMargin && (p.tiktokShop?.commissionRatePercent || 0) < 20 && p.estimatedProfitMarginPercent < 280) return false;

      // 2. Fast niche filter
      if (filterNiche && p.niche !== filterNiche) return false;

      // 3. Fast origin filter
      if (filterOrigin && p.originCountry !== filterOrigin) return false;

      // 4. TikTok Shop affiliate filters
      if (filterFreeSampleOnly && !p.tiktokShop?.freeSampleAvailable) return false;
      if (filterBlueOceanOnly && p.tiktokShop?.saturationLevel !== 'Oceano Azul' && p.waveStage !== 'early_wave') return false;

      // 5. Search query matching
      if (queryTokens.length > 0) {
        const textToSearch = `${p.name} ${p.originalName} ${p.niche} ${p.nicheLabel} ${p.culturalFitReason} ${(p.supplierKeywords || []).join(' ')} ${p.tiktokShop?.topViralHook || ''} ${p.tiktokShop?.stockLocation || ''}`.toLowerCase();
        const matches = queryTokens.some(token => textToSearch.includes(token));
        if (!matches) return false;
      }

      return true;
    });
  }, [products, activeTab, selectedNiche, selectedOrigin, searchQuery, filterFreeSampleOnly, filterBlueOceanOnly]);

  // Progressive DOM Chunking / Windowing:
  // Rendering 3,000 cards simultaneously would block the main thread with >75k DOM nodes.
  // By chunking into responsive batches of 24 items, initial render and filter transitions stay under 5ms.
  const CHUNK_SIZE = 24;
  const [displayLimit, setDisplayLimit] = useState(CHUNK_SIZE);
  const loadMoreSentinelRef = useRef<HTMLDivElement>(null);

  // Reset display chunk when active filters change so the user starts smoothly at the top
  useEffect(() => {
    setDisplayLimit(CHUNK_SIZE);
  }, [activeTab, selectedNiche, selectedOrigin]);

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

  const handleLoginSuccess = (s: UserSession) => {
    setSession(s);
    setCurrentView('app');
  };

  const handleLogout = () => {
    clearSession();
    setSession(null);
    setCurrentView('landing');
  };

  // =========================================================================
  // LANDING PAGE (visitantes sem sessão)
  // =========================================================================
  if (currentView === 'landing' || !session || !session.isAuthenticated || session.plan === 'guest') {
    return (
      <div className="h-dvh w-full overflow-y-auto">
        <LandingPage
          onOpenLogin={() => {
            if (session && session.isAuthenticated && session.plan !== 'guest') {
              setCurrentView('app');
            } else {
              setShowLoginModal(true);
            }
          }}
        />
        <LoginModal
          isOpen={showLoginModal}
          onClose={() => setShowLoginModal(false)}
          onLoginSuccess={handleLoginSuccess}
          onOpenPricing={() => {
            document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' });
          }}
        />
      </div>
    );
  }

  return (
    <div className="h-full h-dvh w-full max-w-full bg-[#F8FAFC] text-[#0F172A] font-sans flex flex-col overflow-hidden select-none">
      
      {/* 1. HEADER PRINCIPAL RESPONSIVO */}
      <Header
        userSession={session}
        onLogout={handleLogout}
        onViewLanding={() => setCurrentView('landing')}
        onScanTrends={() => handleTriggerScan(false)}
        isScanning={isScanning}
        savedCount={savedIds.length}
        onOpenSaved={() => setShowSavedModal(true)}
        painelEsquerdoRecolhido={painelEsquerdoRecolhido}
        setPainelEsquerdoRecolhido={setPainelEsquerdoRecolhido}
        painelDireitoRecolhido={painelDireitoRecolhido}
        setPainelDireitoRecolhido={setPainelDireitoRecolhido}
        onOpenCalculator={() => {
          setSelectedProductForCalc(activeProduct);
          setShowCalculatorModal(true);
        }}
      />

      {/* 2. SELETOR DE ABAS MOBILE / TABLET (CINZA CLARO) */}
      <nav className="grid grid-cols-3 lg:hidden w-full bg-white border-b border-slate-200 p-1.5 gap-1.5 shrink-0 text-xs font-bold select-none">
        <button
          onClick={() => setMobileTab('produtos')}
          className={`py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1 cursor-pointer transition-all border ${
            mobileTab === 'produtos'
              ? 'bg-slate-900 text-white border-slate-900 shadow-2xs font-black'
              : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
          }`}
        >
          <span>🛍️ Tendências</span>
        </button>

        <button
          onClick={() => setMobileTab('terminal')}
          className={`py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1 cursor-pointer transition-all border ${
            mobileTab === 'terminal'
              ? 'bg-slate-900 text-white border-slate-900 shadow-2xs font-black'
              : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
          }`}
        >
          <span>🔬 Raio-X Produto</span>
        </button>

        <button
          onClick={() => setMobileTab('copilot')}
          className={`py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1 cursor-pointer transition-all border ${
            mobileTab === 'copilot'
              ? 'bg-slate-900 text-white border-slate-900 shadow-2xs font-black'
              : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
          }`}
        >
          <span>🤖 TIKBLOX AI</span>
        </button>
      </nav>

      {/* 3. ÁREA PRINCIPAL: THREE-PANEL TERMINAL (REDIMENSIONÁVEL NO NOTEBOOK/DESKTOP) */}
      <div
        className={`flex-1 flex flex-col lg:flex-row w-full max-w-full overflow-hidden min-h-0 bg-[#F1F5F9] relative ${
          redimensionando ? 'select-none cursor-col-resize' : ''
        }`}
      >
        {/* PAINEL 1: Lista de Produtos */}
        <div
          style={{ width: isDesktop && !painelEsquerdoRecolhido ? `${leftWidth}px` : undefined }}
          className={`h-full shrink-0 ${mobileTab !== 'produtos' ? 'hidden lg:flex' : 'flex'}`}
        >
          <ProductListPanel
            width={isDesktop && !painelEsquerdoRecolhido ? leftWidth : undefined}
            products={products}
            activeProduct={activeProduct}
            onSelectProduct={(p) => {
              setActiveProduct(p);
              setMobileTab('terminal');
            }}
            isCollapsed={painelEsquerdoRecolhido}
            onToggleCollapse={() => setPainelEsquerdoRecolhido(!painelEsquerdoRecolhido)}
            selectedNiche={selectedNiche}
            setSelectedNiche={setSelectedNiche}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            filterFreeSampleOnly={filterFreeSampleOnly}
            setFilterFreeSampleOnly={setFilterFreeSampleOnly}
            filterBlueOceanOnly={filterBlueOceanOnly}
            setFilterBlueOceanOnly={setFilterBlueOceanOnly}
            filterHighCommissionOnly={filterHighCommissionOnly}
            setFilterHighCommissionOnly={setFilterHighCommissionOnly}
            onOpenAddCustomProduct={() => setShowAddCustomModal(true)}
          />
        </div>

        {/* Divisor / Splitter Esquerdo Redimensionável */}
        {!painelEsquerdoRecolhido && (
          <div
            onMouseDown={(e) => {
              e.preventDefault();
              setRedimensionando('left');
            }}
            onTouchStart={() => setRedimensionando('left')}
            onDoubleClick={() => setLeftWidth(340)}
            className="hidden lg:flex w-[5px] hover:w-[7px] bg-slate-200 hover:bg-[#007A87] cursor-col-resize shrink-0 transition-all z-10 items-center justify-center group relative select-none"
            title="Arraste para redimensionar o painel de produtos. Clique duplo para redefinir para 340px."
          >
            <div className="w-1 h-8 rounded-full bg-slate-400 group-hover:bg-white transition-colors" />
          </div>
        )}

        {/* PAINEL 2: Terminal de Raio-X & Destrinchamento do Produto em Foco */}
        <div className={`h-full flex-1 overflow-hidden min-w-0 ${mobileTab !== 'terminal' ? 'hidden lg:flex' : 'flex'}`}>
          <ProductDetailTerminal
            product={activeProduct}
            onOpenInCopilot={(p) => {
              setActiveProduct(p);
              setPainelDireitoRecolhido(false);
              setMobileTab('copilot');
            }}
            onToggleSave={handleToggleSave}
            isSaved={activeProduct ? savedIdsSet.has(activeProduct.id) : false}
            onOpenCalculator={(p) => {
              setSelectedProductForCalc(p);
              setShowCalculatorModal(true);
            }}
          />
        </div>

        {/* Divisor / Splitter Direito Redimensionável */}
        {!painelDireitoRecolhido && (
          <div
            onMouseDown={(e) => {
              e.preventDefault();
              setRedimensionando('right');
            }}
            onTouchStart={() => setRedimensionando('right')}
            onDoubleClick={() => setRightWidth(380)}
            className="hidden lg:flex w-[5px] hover:w-[7px] bg-slate-200 hover:bg-[#007A87] cursor-col-resize shrink-0 transition-all z-10 items-center justify-center group relative select-none"
            title="Arraste para redimensionar a TIKBLOX AI. Clique duplo para redefinir para 380px."
          >
            <div className="w-1 h-8 rounded-full bg-slate-400 group-hover:bg-white transition-colors" />
          </div>
        )}

        {/* PAINEL 3: TIKBLOX AI Especialista em TikTok Shop */}
        <div
          style={{ width: isDesktop && !painelDireitoRecolhido ? `${rightWidth}px` : undefined }}
          className={`h-full shrink-0 ${mobileTab !== 'copilot' ? 'hidden lg:flex' : 'flex'}`}
        >
          <AICopilotPanel
            width={isDesktop && !painelDireitoRecolhido ? rightWidth : undefined}
            activeProduct={activeProduct}
            isCollapsed={painelDireitoRecolhido}
            onToggleCollapse={() => setPainelDireitoRecolhido(!painelDireitoRecolhido)}
          />
        </div>
      </div>

      {/* Modal de Análise de Produto Próprio (Oceano Azul) */}
      {showAddCustomModal && (
        <AddCustomProductModal
          isOpen={showAddCustomModal}
          onClose={() => setShowAddCustomModal(false)}
          onAddProduct={(newProd) => {
            setProducts((prev) => [newProd, ...prev]);
            setActiveProduct(newProd);
            saveProductToIndexedDB(newProd);
            setMobileTab('terminal');
          }}
        />
      )}

      {/* Modal de Produtos Salvos */}
      {showSavedModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5">
          <div className="bg-[#1A1D28] rounded-2xl border border-white/15 w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl text-white">
            <div className="p-3 border-b border-white/10 flex items-center justify-between bg-[#222738]">
              <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                <Bookmark className="w-4 h-4 text-[#FE2C55]" />
                <span>Produtos Salvos ({savedProductsList.length})</span>
              </h3>
              <button
                onClick={() => setShowSavedModal(false)}
                className="p-1 hover:bg-[#2A3042] rounded-lg text-slate-400 hover:text-white transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 bg-[#141724]">
              <Suspense fallback={<div className="p-8 text-center text-slate-400 text-xs">Carregando painel de salvos...</div>}>
                <SavedRadarView
                  savedProducts={savedProductsList}
                  priceSummary={priceSummary}
                  isCheckingPrices={isCheckingPrices}
                  onRefreshPrices={handleRefreshPrices}
                  onApplyPriceUpdate={handleApplyPriceUpdate}
                  onToggleSave={handleToggleSave}
                  onOpenDeepDive={handleOpenDeepDive}
                  onOpenCalculator={(p) => {
                    setSelectedProductForCalc(p);
                    setShowCalculatorModal(true);
                  }}
                  onOpenCreativeGenerator={handleOpenCreativeGenerator}
                  onBackToRadar={() => setShowSavedModal(false)}
                  initialSubTab={savedInitialSubTab}
                />
              </Suspense>
            </div>
          </div>
        </div>
      )}

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

        {(showCalculatorModal || selectedProductForCalc) && (
          <ProfitCalculatorModal
            product={selectedProductForCalc || activeProduct}
            onClose={() => {
              setShowCalculatorModal(false);
              setSelectedProductForCalc(null);
            }}
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
      <footer className="border-t border-slate-200 bg-white py-3.5 px-4 sm:px-6 text-xs text-slate-500 shadow-2xs">
        <div className="mx-auto max-w-7xl flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-black text-slate-900 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#25F4EE]" />
              <span>TIKBLOX</span>
              <span className="w-2 h-2 rounded-full bg-[#FE2C55]" />
            </span>
            <span>
              — {language === 'en'
                ? 'Viral Trends Radar for TikTok Shop Brazil.'
                : 'Radar de Tendências Virais e Produtos Pronta Entrega no Brasil.'}
            </span>
          </div>
          <div className="flex items-center gap-3 text-slate-400 text-[11px]">
            <span>PWA Compatível</span>
            <span>•</span>
            <span className="text-[#007A87] font-bold">100% Estoque Nacional SP/PR</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
