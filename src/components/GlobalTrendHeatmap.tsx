import React, { useState, useEffect, useRef, useMemo } from 'react';
import * as d3 from 'd3';
import { feature } from 'topojson-client';
import countries110m from 'world-atlas/countries-110m.json';
import { motion, AnimatePresence } from 'motion/react';
import {
  Globe,
  Flame,
  Zap,
  TrendingUp,
  Filter,
  Eye,
  ChevronDown,
  ChevronUp,
  MapPin,
  ArrowRight,
  Maximize2,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import { TrendingProduct } from '../types';
import { useTranslation } from '../i18n/LanguageContext';

interface GlobalTrendHeatmapProps {
  products: TrendingProduct[];
  selectedOrigin: 'all' | 'US' | 'CN';
  onSelectOrigin: (origin: 'all' | 'US' | 'CN') => void;
  onSelectProduct?: (product: TrendingProduct) => void;
}

type IntensityMetric = 'volume' | 'virality' | 'margin';

interface RegionData {
  id: string; // ISO numeric code: '840' for US, '156' for CN, '076' for BR
  iso2: 'US' | 'CN' | 'BR';
  name: string;
  flag: string;
  role: 'generator' | 'origin' | 'destination';
  hubName: string;
  coordinates: [number, number]; // [lng, lat]
  productCount: number;
  avgViralityScore: number;
  avgMarginPercent: number;
  earlyWaveCount: number;
  topNiches: string[];
  topProduct: TrendingProduct | null;
  platformSummary: string;
}

// Epicenter hub coordinates for viral trend origins
const VIRAL_HUBS = [
  {
    id: 'us-west',
    countryIso: 'US',
    name: 'Los Angeles / Silicon Valley',
    coordinates: [-118.2437, 34.0522] as [number, number],
    type: 'TikTok US Creator & Shop Hub',
    description: 'Polo principal de tendências visuais, unboxings e criadores do TikTok Shop US.',
    color: '#FE2C55',
  },
  {
    id: 'us-east',
    countryIso: 'US',
    name: 'New York / Tri-State',
    coordinates: [-74.006, 40.7128] as [number, number],
    type: 'Consumer Viral Demand & Retail',
    description: 'Radar de demanda acelerada de consumo e viralização no varejo norte-americano.',
    color: '#FF0050',
  },
  {
    id: 'cn-south',
    countryIso: 'CN',
    name: 'Shenzhen & Guangzhou',
    coordinates: [114.0579, 22.5431] as [number, number],
    type: 'Global Hardware & Dropship Supply',
    description: 'Epicentro mundial de eletrônicos, novidades de utilidade e fornecedores 1688.',
    color: '#25F4EE',
  },
  {
    id: 'cn-east',
    countryIso: 'CN',
    name: 'Yiwu & Hangzhou',
    coordinates: [120.1551, 30.2741] as [number, number],
    type: 'Douyin Live-Commerce & Novelties',
    description: 'Capital mundial de pequenas utilidades e transmissão ao vivo do Douyin.',
    color: '#00D2C4',
  },
  {
    id: 'br-hub',
    countryIso: 'BR',
    name: 'São Paulo (Mercado Destino)',
    coordinates: [-46.6333, -23.5505] as [number, number],
    type: 'Mercado de Arbitragem & Entrada',
    description: 'Ponto focal de absorção de tendências no Brasil com baixa saturação e alta margem.',
    color: '#10B981',
  },
];

// ISO numeric code to Alpha-2 code
const ISO_NUM_TO_ALPHA2: Record<string, 'US' | 'CN' | 'BR'> = {
  '840': 'US',
  '156': 'CN',
  '076': 'BR',
};

export const GlobalTrendHeatmap: React.FC<GlobalTrendHeatmapProps> = ({
  products,
  selectedOrigin,
  onSelectOrigin,
  onSelectProduct,
}) => {
  const { language } = useTranslation();
  const [isExpanded, setIsExpanded] = useState<boolean>(true);
  const [metricMode, setMetricMode] = useState<IntensityMetric>('volume');
  const [hoveredRegion, setHoveredRegion] = useState<RegionData | null>(null);
  const [hoveredHub, setHoveredHub] = useState<(typeof VIRAL_HUBS)[0] | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [dimensions, setDimensions] = useState<{ width: number; height: number }>({
    width: 900,
    height: 440,
  });

  // Calculate Region Analytics from products dataset
  const regionStats = useMemo(() => {
    const usProducts = products.filter((p) => p.originCountry === 'US');
    const cnProducts = products.filter((p) => p.originCountry === 'CN');
    const otherProducts = products.filter((p) => p.originCountry !== 'US' && p.originCountry !== 'CN');

    const calcMetrics = (
      list: TrendingProduct[],
      iso2: 'US' | 'CN' | 'BR',
      numericId: string,
      name: string,
      flag: string,
      role: 'generator' | 'origin' | 'destination',
      hubName: string,
      coords: [number, number],
      platformSummary: string
    ): RegionData => {
      const count = list.length;
      const avgVirality = count > 0 ? Math.round(list.reduce((acc, p) => acc + (p.viralityScore || 0), 0) / count) : 0;
      const avgMargin =
        count > 0 ? Math.round(list.reduce((acc, p) => acc + (p.estimatedProfitMarginPercent || 0), 0) / count) : 0;
      const earlyCount = list.filter((p) => p.waveStage === 'early_wave').length;

      // Niche frequency
      const nicheMap = new Map<string, number>();
      list.forEach((p) => {
        const label = p.nicheLabel || p.niche;
        nicheMap.set(label, (nicheMap.get(label) || 0) + 1);
      });
      const topNiches = Array.from(nicheMap.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([n]) => n);

      // Top virality product
      const topProduct =
        list.length > 0 ? [...list].sort((a, b) => (b.viralityScore || 0) - (a.viralityScore || 0))[0] : null;

      return {
        id: numericId,
        iso2,
        name,
        flag,
        role,
        hubName,
        coordinates: coords,
        productCount: count,
        avgViralityScore: avgVirality,
        avgMarginPercent: avgMargin,
        earlyWaveCount: earlyCount,
        topNiches,
        topProduct,
        platformSummary,
      };
    };

    const usData = calcMetrics(
      usProducts,
      'US',
      '840',
      language === 'en' ? 'United States' : 'Estados Unidos',
      '🇺🇸',
      'generator',
      'TikTok Shop US & Amazon Movers',
      [-98.5795, 39.8283],
      'TikTok Shop US, Amazon Movers & Shakers'
    );

    const cnData = calcMetrics(
      cnProducts,
      'CN',
      '156',
      language === 'en' ? 'China' : 'China',
      '🇨🇳',
      'generator',
      'Douyin Viral & Fábricas 1688',
      [104.1954, 35.8617],
      'Douyin (TikTok Chinês), 1688, Taobao Factory'
    );

    // Brazil is the destination/arbitrage market
    const brData = calcMetrics(
      products,
      'BR',
      '076',
      language === 'en' ? 'Brazil (Destination)' : 'Brasil (Mercado Destino)',
      '🇧🇷',
      'destination',
      'São Paulo & E-commerce LatAm',
      [-51.9253, -14.235],
      language === 'en'
        ? 'Target Market with High Arbitrage Spread'
        : 'Mercado de Destino com Alta Margem de Arbitragem'
    );

    return {
      US: usData,
      CN: cnData,
      BR: brData,
      totalCount: products.length,
      otherCount: otherProducts.length,
    };
  }, [products, language]);

  // Handle ResizeObserver for responsive D3 canvas
  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      if (!entries || entries.length === 0) return;
      const entry = entries[0];
      const width = Math.max(320, Math.floor(entry.contentRect.width));
      // Maintain cinematic aspect ratio (roughly 2.1:1 on desktop, 1.6:1 on mobile)
      const height = width < 640 ? Math.floor(width * 0.68) : Math.min(480, Math.floor(width * 0.44));
      setDimensions({ width, height });
    });

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // Compute Geo Projection and Paths
  const { countriesGeo, landGeo, pathGenerator, projection, graticulePath } = useMemo(() => {
    const { width, height } = dimensions;

    // Natural Earth 1 projection: visually balanced world map with pleasant curvature
    const proj = d3
      .geoNaturalEarth1()
      .scale(width / 5.6)
      .translate([width / 2.05, height / 1.82]);

    const path = d3.geoPath().projection(proj);

    // Extract geojson features from world-atlas
    // @ts-expect-error topojson types
    const countries = feature(countries110m, countries110m.objects.countries) as any;
    // @ts-expect-error topojson types
    const land = feature(countries110m, countries110m.objects.land) as any;

    // Generate graticule lines (subtle radar coordinates)
    const graticule = d3.geoGraticule10();
    const gratPath = path(graticule);

    return {
      countriesGeo: countries.features || [],
      landGeo: land,
      pathGenerator: path,
      projection: proj,
      graticulePath: gratPath,
    };
  }, [dimensions]);

  // Compute dynamic heat intensity color for countries
  const getCountryFill = (iso2?: 'US' | 'CN' | 'BR') => {
    if (!iso2) return '#161823'; // Standard dark land

    const isSelected = selectedOrigin === iso2;

    if (iso2 === 'US') {
      if (isSelected) return 'url(#us-selected-gradient)';
      return metricMode === 'margin' ? '#FE2C55cc' : '#FE2C55bb';
    }
    if (iso2 === 'CN') {
      if (isSelected) return 'url(#cn-selected-gradient)';
      return metricMode === 'margin' ? '#25F4EEcc' : '#25F4EEbb';
    }
    if (iso2 === 'BR') {
      return '#10B98155'; // Subtle destination emerald
    }

    return '#161823';
  };

  const getCountryStroke = (iso2?: 'US' | 'CN' | 'BR') => {
    if (!iso2) return '#232738';
    if (iso2 === 'US') return '#FE2C55';
    if (iso2 === 'CN') return '#25F4EE';
    if (iso2 === 'BR') return '#10B981';
    return '#232738';
  };

  // Compute Flow Lines between Origin Epicenters and Brazil Destination
  const trendFlowArcs = useMemo(() => {
    if (!projection) return [];

    const brCoord: [number, number] = [-46.6333, -23.5505];
    const brProj = projection(brCoord);
    if (!brProj) return [];

    const flows = [
      {
        id: 'flow-cn-south-to-br',
        fromName: 'Shenzhen (CN)',
        toName: 'São Paulo (BR)',
        fromCoord: [114.0579, 22.5431] as [number, number],
        color: '#25F4EE',
        label: 'Arbitragem de Fábrica (1688 / Douyin)',
      },
      {
        id: 'flow-us-west-to-br',
        fromName: 'Los Angeles (US)',
        toName: 'São Paulo (BR)',
        fromCoord: [-118.2437, 34.0522] as [number, number],
        color: '#FE2C55',
        label: 'Replicação Viral (TikTok Shop US)',
      },
    ];

    return flows.map((f) => {
      const fromProj = projection(f.fromCoord);
      if (!fromProj) return null;

      // Create a smooth curved quadratic or cubic bezier path
      const [x1, y1] = fromProj;
      const [x2, y2] = brProj;

      // Arc curve control point offset
      const dx = x2 - x1;
      const dy = y2 - y1;
      const cx = (x1 + x2) / 2 - dy * 0.25;
      const cy = (y1 + y2) / 2 + dx * 0.15;

      const pathString = `M ${x1} ${y1} Q ${cx} ${cy} ${x2} ${y2}`;

      return {
        ...f,
        pathString,
        fromProj,
        toProj: brProj,
      };
    }).filter(Boolean) as Array<{
      id: string;
      fromName: string;
      toName: string;
      color: string;
      label: string;
      pathString: string;
      fromProj: [number, number];
      toProj: [number, number];
    }>;
  }, [projection]);

  const handleCountryClick = (iso2?: 'US' | 'CN' | 'BR') => {
    if (!iso2) return;
    if (iso2 === 'BR') {
      onSelectOrigin('all');
      return;
    }
    if (selectedOrigin === iso2) {
      onSelectOrigin('all'); // Toggle off
    } else {
      onSelectOrigin(iso2);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setTooltipPos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  const maxProducts = Math.max(1, regionStats.US.productCount, regionStats.CN.productCount);

  return (
    <div
      id="global-trend-heatmap-container"
      className="mb-6 rounded-2xl border border-white/10 bg-[#0C0E16] overflow-hidden shadow-2xl transition-all"
    >
      {/* Heatmap Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 sm:p-5 border-b border-white/10 bg-[#12131A]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#FE2C55]/20 to-[#25F4EE]/20 border border-white/10 flex items-center justify-center text-[#25F4EE] shadow-inner shrink-0">
            <Globe className="w-5 h-5 animate-pulse text-[#25F4EE]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm sm:text-base font-black text-white flex items-center gap-1.5">
                <span>
                  {language === 'en'
                    ? 'Global Trend Intensity Heatmap'
                    : 'Mapa de Calor de Intensidade Viral Global'}
                </span>
              </h3>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-[#FE2C55]/20 text-[#FE2C55] border border-[#FE2C55]/30">
                <Flame className="w-3 h-3" />
                <span>LIVE RADAR</span>
              </span>
            </div>
            <p className="text-xs text-[#A6A7B2] mt-0.5">
              {language === 'en'
                ? 'D3 Geo-projection mapping real-time viral epicenters in USA & China flowing to the Brazilian market.'
                : 'Projeção D3 mapeando epicentros virais dos EUA & China que estão inundando o mercado brasileiro.'}
            </p>
          </div>
        </div>

        {/* Controls: Metric Mode & Collapse Toggle */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Intensity Metric Selector */}
          <div className="flex items-center gap-1 p-1 rounded-xl bg-[#08090E] border border-white/10 text-[11px]">
            <button
              onClick={() => setMetricMode('volume')}
              className={`px-2.5 py-1 rounded-lg font-bold transition cursor-pointer ${
                metricMode === 'volume'
                  ? 'bg-white/10 text-white shadow-sm'
                  : 'text-[#A6A7B2] hover:text-white'
              }`}
            >
              {language === 'en' ? 'Product Volume' : 'Volume'}
            </button>
            <button
              onClick={() => setMetricMode('virality')}
              className={`px-2.5 py-1 rounded-lg font-bold transition cursor-pointer ${
                metricMode === 'virality'
                  ? 'bg-gradient-to-r from-[#FE2C55] to-[#FF0050] text-white shadow-sm'
                  : 'text-[#A6A7B2] hover:text-[#FE2C55]'
              }`}
            >
              {language === 'en' ? 'Virality Score' : 'Score Viral'}
            </button>
            <button
              onClick={() => setMetricMode('margin')}
              className={`px-2.5 py-1 rounded-lg font-bold transition cursor-pointer ${
                metricMode === 'margin'
                  ? 'bg-[#25F4EE] text-[#0C0E16] font-black shadow-sm'
                  : 'text-[#A6A7B2] hover:text-[#25F4EE]'
              }`}
            >
              {language === 'en' ? 'Profit Margin' : 'Margem'}
            </button>
          </div>

          {/* Active Origin Filter Chip if set */}
          {selectedOrigin !== 'all' && (
            <button
              onClick={() => onSelectOrigin('all')}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-[#FE2C55]/20 text-[#FE2C55] border border-[#FE2C55]/40 hover:bg-[#FE2C55]/30 transition cursor-pointer"
              title="Limpar filtro de país"
            >
              <span>{selectedOrigin === 'US' ? '🇺🇸 EUA Ativo' : '🇨🇳 China Ativa'}</span>
              <span className="text-white font-mono text-[10px]">✕</span>
            </button>
          )}

          {/* Toggle Expand / Collapse */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 rounded-lg border border-white/10 bg-[#08090E] text-[#A6A7B2] hover:text-white transition cursor-pointer"
            title={isExpanded ? 'Recolher Mapa' : 'Expandir Mapa'}
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Collapsible Content */}
      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Quick Intelligence Summary Badges */}
            <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-white/10 bg-[#0E1018] border-b border-white/10 text-xs">
              {/* USA Hub Card */}
              <div
                onClick={() => handleCountryClick('US')}
                className={`p-3.5 transition cursor-pointer flex items-center justify-between gap-3 ${
                  selectedOrigin === 'US' ? 'bg-[#FE2C55]/10 ring-1 ring-[#FE2C55]/40' : 'hover:bg-white/5'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-2xl">🇺🇸</span>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <strong className="text-white font-black text-xs">
                        {language === 'en' ? 'USA - TikTok Shop US' : 'EUA - TikTok Shop US'}
                      </strong>
                      {selectedOrigin === 'US' && (
                        <span className="rounded bg-[#FE2C55] px-1 py-0.2 text-[9px] font-black text-white">
                          FILTRADO
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-[#A6A7B2]">
                      {regionStats.US.productCount} {language === 'en' ? 'viral products' : 'produtos virais'} •{' '}
                      <span className="text-[#FE2C55] font-bold">{regionStats.US.avgViralityScore}/100 Score</span>
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] text-[#A6A7B2]">{language === 'en' ? 'Avg Margin' : 'Margem Média'}</div>
                  <div className="text-xs font-black text-[#25F4EE]">+{regionStats.US.avgMarginPercent}%</div>
                </div>
              </div>

              {/* China Hub Card */}
              <div
                onClick={() => handleCountryClick('CN')}
                className={`p-3.5 transition cursor-pointer flex items-center justify-between gap-3 ${
                  selectedOrigin === 'CN' ? 'bg-[#25F4EE]/10 ring-1 ring-[#25F4EE]/40' : 'hover:bg-white/5'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-2xl">🇨🇳</span>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <strong className="text-white font-black text-xs">
                        {language === 'en' ? 'China - Douyin & 1688' : 'China - Douyin & Fábricas'}
                      </strong>
                      {selectedOrigin === 'CN' && (
                        <span className="rounded bg-[#25F4EE] px-1 py-0.2 text-[9px] font-black text-[#0C0E16]">
                          FILTRADO
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-[#A6A7B2]">
                      {regionStats.CN.productCount} {language === 'en' ? 'factory trends' : 'produtos fábrica'} •{' '}
                      <span className="text-[#25F4EE] font-bold">{regionStats.CN.avgViralityScore}/100 Score</span>
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] text-[#A6A7B2]">{language === 'en' ? 'Avg Margin' : 'Margem Média'}</div>
                  <div className="text-xs font-black text-[#25F4EE]">+{regionStats.CN.avgMarginPercent}%</div>
                </div>
              </div>

              {/* Brazil Destination Ingress Card */}
              <div
                onClick={() => handleCountryClick('BR')}
                className="p-3.5 flex items-center justify-between gap-3 bg-emerald-500/5 hover:bg-emerald-500/10 transition cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-2xl">🇧🇷</span>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <strong className="text-emerald-300 font-black text-xs">
                        {language === 'en' ? 'Brazil (Destination Target)' : 'Brasil (Mercado Destino)'}
                      </strong>
                    </div>
                    <p className="text-[11px] text-[#A6A7B2]">
                      {language === 'en'
                        ? 'Arbitrage window: 14-28 days before local saturation'
                        : 'Janela de arbitragem: 14 a 28 dias antes de saturar'}
                    </p>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <span className="inline-block rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2 py-1 text-[10px] font-bold whitespace-nowrap">
                    {language === 'en' ? 'Low Saturation' : 'Baixa Saturação'}
                  </span>
                </div>
              </div>
            </div>

            {/* D3 Map Canvas Container */}
            <div
              ref={containerRef}
              className="relative w-full overflow-hidden bg-radial from-[#121524] via-[#0C0E16] to-[#06070B] select-none"
              style={{ minHeight: '340px' }}
            >
              <svg
                ref={svgRef}
                viewBox={`0 0 ${dimensions.width} ${dimensions.height}`}
                className="w-full h-auto block"
                onMouseMove={handleMouseMove}
                onMouseLeave={() => {
                  setHoveredRegion(null);
                  setHoveredHub(null);
                  setTooltipPos(null);
                }}
              >
                <defs>
                  {/* Subtle Grid Radar Background */}
                  <pattern id="radar-grid" width="40" height="40" patternUnits="userSpaceOnUse">
                    <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255, 255, 255, 0.025)" strokeWidth="0.8" />
                  </pattern>

                  {/* USA Selected Glow Gradient */}
                  <radialGradient id="us-selected-gradient" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#FE2C55" stopOpacity="0.9" />
                    <stop offset="100%" stopColor="#FF0050" stopOpacity="0.6" />
                  </radialGradient>

                  {/* China Selected Glow Gradient */}
                  <radialGradient id="cn-selected-gradient" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#25F4EE" stopOpacity="0.9" />
                    <stop offset="100%" stopColor="#00D2C4" stopOpacity="0.6" />
                  </radialGradient>

                  {/* Epicenter Radial Blurs for Heatmap effect */}
                  <radialGradient id="heat-us-glow" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#FE2C55" stopOpacity="0.8" />
                    <stop offset="50%" stopColor="#FE2C55" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#FE2C55" stopOpacity="0" />
                  </radialGradient>

                  <radialGradient id="heat-cn-glow" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#25F4EE" stopOpacity="0.8" />
                    <stop offset="50%" stopColor="#25F4EE" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#25F4EE" stopOpacity="0" />
                  </radialGradient>

                  <radialGradient id="heat-br-glow" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#10B981" stopOpacity="0.7" />
                    <stop offset="50%" stopColor="#10B981" stopOpacity="0.2" />
                    <stop offset="100%" stopColor="#10B981" stopOpacity="0" />
                  </radialGradient>

                  {/* Flow Dash Markers */}
                  <marker
                    id="flow-arrow-cn"
                    viewBox="0 0 10 10"
                    refX="5"
                    refY="5"
                    markerWidth="4"
                    markerHeight="4"
                    orient="auto-start-reverse"
                  >
                    <path d="M 0 0 L 10 5 L 0 10 z" fill="#25F4EE" />
                  </marker>
                  <marker
                    id="flow-arrow-us"
                    viewBox="0 0 10 10"
                    refX="5"
                    refY="5"
                    markerWidth="4"
                    markerHeight="4"
                    orient="auto-start-reverse"
                  >
                    <path d="M 0 0 L 10 5 L 0 10 z" fill="#FE2C55" />
                  </marker>
                </defs>

                {/* Background Grid Pattern */}
                <rect width={dimensions.width} height={dimensions.height} fill="url(#radar-grid)" />

                {/* Earth Sphere Border & Graticule Lat/Long Lines */}
                {graticulePath && (
                  <path
                    d={graticulePath}
                    fill="none"
                    stroke="#ffffff"
                    strokeOpacity="0.04"
                    strokeWidth="0.7"
                    strokeDasharray="2,3"
                  />
                )}

                {/* Base Land Outline (all countries) */}
                <g className="world-countries">
                  {countriesGeo.map((featureItem: any, idx: number) => {
                    const countryNumId = String(featureItem.id).padStart(3, '0');
                    const iso2 = ISO_NUM_TO_ALPHA2[countryNumId];
                    const isFocusCountry = iso2 === 'US' || iso2 === 'CN' || iso2 === 'BR';
                    const d = pathGenerator(featureItem);
                    if (!d) return null;

                    const fill = getCountryFill(iso2);
                    const stroke = getCountryStroke(iso2);
                    const strokeWidth = isFocusCountry ? 1.5 : 0.4;

                    return (
                      <path
                        key={`country-${featureItem.id || idx}`}
                        d={d}
                        fill={fill}
                        stroke={stroke}
                        strokeWidth={strokeWidth}
                        className={`transition-all duration-300 ${
                          isFocusCountry ? 'cursor-pointer hover:opacity-90' : 'opacity-80'
                        }`}
                        onClick={() => handleCountryClick(iso2)}
                        onMouseEnter={() => {
                          if (iso2) {
                            setHoveredRegion(regionStats[iso2]);
                          }
                        }}
                      />
                    );
                  })}
                </g>

                {/* Animated Geodesic Trend Flow Arcs */}
                <g className="trend-flows pointer-events-none">
                  {trendFlowArcs.map((arc) => (
                    <g key={arc.id}>
                      {/* Flow Base Path */}
                      <path
                        d={arc.pathString}
                        fill="none"
                        stroke={arc.color}
                        strokeOpacity="0.25"
                        strokeWidth="1.8"
                      />
                      {/* Animated Flow Particles */}
                      <path
                        d={arc.pathString}
                        fill="none"
                        stroke={arc.color}
                        strokeOpacity="0.9"
                        strokeWidth="2.2"
                        strokeDasharray="5,10"
                        className="animate-pulse"
                      >
                        <animate
                          attributeName="stroke-dashoffset"
                          values="120;0"
                          dur="3.2s"
                          repeatCount="indefinite"
                        />
                      </path>
                    </g>
                  ))}
                </g>

                {/* Heatmap Viral Epicenters (Radial Halos) */}
                <g className="heatmap-epicenters">
                  {/* USA Major Halo */}
                  {projection([-98.5, 39.8]) && (
                    <circle
                      cx={projection([-98.5, 39.8])![0]}
                      cy={projection([-98.5, 39.8])![1]}
                      r={Math.max(28, (regionStats.US.productCount / maxProducts) * 60)}
                      fill="url(#heat-us-glow)"
                      className="pointer-events-none"
                    />
                  )}

                  {/* China Major Halo */}
                  {projection([104.2, 35.8]) && (
                    <circle
                      cx={projection([104.2, 35.8])![0]}
                      cy={projection([104.2, 35.8])![1]}
                      r={Math.max(28, (regionStats.CN.productCount / maxProducts) * 60)}
                      fill="url(#heat-cn-glow)"
                      className="pointer-events-none"
                    />
                  )}

                  {/* Brazil Destination Halo */}
                  {projection([-51.9, -14.2]) && (
                    <circle
                      cx={projection([-51.9, -14.2])![0]}
                      cy={projection([-51.9, -14.2])![1]}
                      r={36}
                      fill="url(#heat-br-glow)"
                      className="pointer-events-none"
                    />
                  )}
                </g>

                {/* Viral Hub Pins & Radar Rings */}
                <g className="viral-hubs">
                  {VIRAL_HUBS.map((hub) => {
                    const pt = projection(hub.coordinates);
                    if (!pt) return null;
                    const [cx, cy] = pt;
                    const isHovered = hoveredHub?.id === hub.id;

                    return (
                      <g
                        key={hub.id}
                        transform={`translate(${cx}, ${cy})`}
                        className="cursor-pointer"
                        onClick={() => handleCountryClick(hub.countryIso as any)}
                        onMouseEnter={() => setHoveredHub(hub)}
                        onMouseLeave={() => setHoveredHub(null)}
                      >
                        {/* Radar Pulse Ping Ring */}
                        <circle
                          r={isHovered ? 14 : 9}
                          fill="none"
                          stroke={hub.color}
                          strokeWidth="1.2"
                          strokeOpacity="0.75"
                          className="animate-ping"
                        />
                        {/* Outer Ring */}
                        <circle
                          r={isHovered ? 8 : 5}
                          fill={hub.color}
                          fillOpacity="0.3"
                          stroke={hub.color}
                          strokeWidth="1.5"
                        />
                        {/* Inner Dot */}
                        <circle r={2.5} fill="#ffffff" />
                      </g>
                    );
                  })}
                </g>

                {/* Country Labels (US, CN, BR) */}
                <g className="country-labels pointer-events-none text-[10px] font-black">
                  {projection([-98.5, 41.5]) && (
                    <text
                      x={projection([-98.5, 41.5])![0]}
                      y={projection([-98.5, 41.5])![1]}
                      textAnchor="middle"
                      fill="#ffffff"
                      fontSize="11"
                      fontWeight="900"
                      filter="drop-shadow(0px 1px 3px rgba(0,0,0,0.8))"
                    >
                      🇺🇸 USA ({regionStats.US.productCount})
                    </text>
                  )}
                  {projection([104.2, 37.5]) && (
                    <text
                      x={projection([104.2, 37.5])![0]}
                      y={projection([104.2, 37.5])![1]}
                      textAnchor="middle"
                      fill="#ffffff"
                      fontSize="11"
                      fontWeight="900"
                      filter="drop-shadow(0px 1px 3px rgba(0,0,0,0.8))"
                    >
                      🇨🇳 CHINA ({regionStats.CN.productCount})
                    </text>
                  )}
                  {projection([-51.9, -15.5]) && (
                    <text
                      x={projection([-51.9, -15.5])![0]}
                      y={projection([-51.9, -15.5])![1]}
                      textAnchor="middle"
                      fill="#34D399"
                      fontSize="10"
                      fontWeight="900"
                      filter="drop-shadow(0px 1px 3px rgba(0,0,0,0.8))"
                    >
                      🇧🇷 BRASIL (DESTINO)
                    </text>
                  )}
                </g>
              </svg>

              {/* Floating Intelligence Tooltip */}
              {tooltipPos && (hoveredRegion || hoveredHub) && (
                <div
                  className="pointer-events-none absolute z-30 transform -translate-x-1/2 -translate-y-full mb-3 rounded-xl border border-white/20 bg-[#12131Acc] p-3 text-xs text-white shadow-2xl backdrop-blur-md max-w-xs min-w-[220px]"
                  style={{
                    left: `${Math.min(dimensions.width - 130, Math.max(130, tooltipPos.x))}px`,
                    top: `${Math.max(80, tooltipPos.y - 12)}px`,
                  }}
                >
                  {hoveredHub ? (
                    <div>
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="h-2 w-2 rounded-full" style={{ backgroundColor: hoveredHub.color }} />
                        <strong className="text-white text-xs">{hoveredHub.name}</strong>
                      </div>
                      <div className="text-[10px] text-[#25F4EE] font-bold mb-1">{hoveredHub.type}</div>
                      <p className="text-[11px] text-[#A6A7B2] leading-tight mb-2">{hoveredHub.description}</p>
                      <div className="text-[10px] text-white/70 bg-black/40 p-1.5 rounded-lg border border-white/5 flex items-center justify-between">
                        <span>{language === 'en' ? 'Click to filter radar' : 'Clique para filtrar radar'}</span>
                        <ArrowRight className="w-3 h-3 text-[#25F4EE]" />
                      </div>
                    </div>
                  ) : hoveredRegion ? (
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-1.5 border-b border-white/10 pb-1">
                        <div className="flex items-center gap-1.5">
                          <span className="text-base">{hoveredRegion.flag}</span>
                          <strong className="text-white text-xs">{hoveredRegion.name}</strong>
                        </div>
                        <span
                          className={`text-[9px] font-black px-1.5 py-0.2 rounded ${
                            hoveredRegion.iso2 === 'US'
                              ? 'bg-[#FE2C55]/20 text-[#FE2C55]'
                              : hoveredRegion.iso2 === 'CN'
                              ? 'bg-[#25F4EE]/20 text-[#25F4EE]'
                              : 'bg-emerald-500/20 text-emerald-300'
                          }`}
                        >
                          {hoveredRegion.role === 'destination' ? 'DESTINO' : 'GERADOR'}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 my-2 text-[11px]">
                        <div className="bg-black/40 p-1.5 rounded-lg border border-white/5">
                          <span className="text-[#A6A7B2] text-[10px]">
                            {language === 'en' ? 'Catalog Products' : 'Produtos no Radar'}
                          </span>
                          <div className="text-white font-bold text-xs">{hoveredRegion.productCount}</div>
                        </div>
                        <div className="bg-black/40 p-1.5 rounded-lg border border-white/5">
                          <span className="text-[#A6A7B2] text-[10px]">
                            {language === 'en' ? 'Avg Virality' : 'Score Médio'}
                          </span>
                          <div className="text-[#25F4EE] font-bold text-xs">
                            {hoveredRegion.avgViralityScore}/100
                          </div>
                        </div>
                      </div>

                      {hoveredRegion.topProduct && (
                        <div className="text-[10px] text-[#A6A7B2] bg-white/5 p-1.5 rounded-lg border border-white/5 mb-1.5">
                          <span className="text-white/60 block text-[9px]">
                            {language === 'en' ? 'Top Viral Trend:' : 'Produto de Maior Viralidade:'}
                          </span>
                          <span className="text-white font-medium line-clamp-1">
                            {hoveredRegion.topProduct.name}
                          </span>
                        </div>
                      )}

                      <div className="text-[10px] text-[#FE2C55] font-bold flex items-center justify-between">
                        <span>
                          {selectedOrigin === hoveredRegion.iso2
                            ? (language === 'en' ? 'Currently Active • Click to Clear' : 'Filtro Ativo • Clique p/ Limpar')
                            : (language === 'en' ? 'Click to filter radar' : 'Clique para filtrar radar')}
                        </span>
                        <ArrowRight className="w-3 h-3" />
                      </div>
                    </div>
                  ) : null}
                </div>
              )}

              {/* Bottom Visual Legend */}
              <div className="absolute bottom-2.5 left-2.5 right-2.5 flex flex-wrap items-center justify-between gap-2 p-2 rounded-xl bg-[#0C0E16dd] border border-white/10 text-[10px] backdrop-blur-sm pointer-events-auto">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#FE2C55]" />
                    <span className="text-white font-bold">EUA (TikTok Shop US / Amazon)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#25F4EE]" />
                    <span className="text-white font-bold">China (Douyin / 1688)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#10B981]" />
                    <span className="text-emerald-300 font-bold">Brasil (Entrada / Arbitragem)</span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 text-[#A6A7B2]">
                  <Sparkles className="w-3 h-3 text-[#25F4EE]" />
                  <span>
                    {language === 'en'
                      ? 'Dotted arcs show viral trend trajectories towards Latin America'
                      : 'Linhas pontilhadas indicam fluxo de produtos e formatos de criativos rumo ao Brasil'}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
