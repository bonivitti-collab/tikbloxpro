export type SupportedLanguage = 'pt' | 'en';

export interface TranslationDictionary {
  // Nav
  nav_all: string;
  nav_early_wave: string;
  nav_high_margin: string;
  nav_saved: string;
  nav_calculator: string;
  nav_scan: string;
  nav_scanning: string;
  nav_tools: string;
  nav_offline_db: string;
  nav_offline_db_desc: string;
  nav_free_api: string;
  nav_workspace_hub: string;
  nav_version_badge: string;

  // Hero
  hero_title: string;
  hero_subtitle: string;
  hero_search_placeholder: string;
  hero_all_origins: string;
  hero_origin_us: string;
  hero_origin_cn: string;
  hero_scan_ai: string;
  hero_monitored_products: string;
  niche_all: string;
  hero_niches_all: string;
  hero_niche_tech: string;
  hero_niche_home: string;
  hero_niche_beauty: string;
  hero_niche_fitness: string;
  hero_niche_pets: string;
  hero_niche_accessories: string;
  hero_niche_kids: string;
  hero_niche_tools: string;
  hero_niche_auto: string;
  hero_niche_health: string;
  recent_searches_title: string;
  recent_searches_top: string;
  recent_searches_clear: string;
  recent_searches_empty: string;
  recent_searches_remove: string;
  recent_searches_times: string;
  recent_searches_popular_suggestions: string;

  // Early Wave Dashboard
  early_wave_dashboard_title: string;
  early_wave_ocean_blue: string;
  early_wave_desc: string;
  early_wave_clear_filter: string;
  early_wave_view_only: string;
  early_wave_rank_1: string;
  early_wave_rank_2: string;
  early_wave_rank_3: string;
  early_wave_active: string;
  early_wave_filter_btn: string;
  early_wave_count_label: string;
  early_wave_avg_virality: string;
  early_wave_avg_margin: string;
  early_wave_highlight: string;

  // Product Grid
  grid_title_all: string;
  grid_title_early: string;
  grid_title_margin: string;
  grid_filtered_count: string;
  grid_filtering_label: string;
  grid_no_products: string;
  grid_no_products_desc: string;
  grid_reset_filters: string;

  // Product Card
  card_virality: string;
  card_supplier_cost: string;
  card_sell_price: string;
  card_est_profit: string;
  card_margin: string;
  card_view_deepdive: string;
  card_calc: string;
  card_ad_creative: string;
  card_save: string;
  card_saved: string;
  card_early_wave_badge: string;
  card_growth: string;
  card_source: string;

  // Saved Radar
  saved_title: string;
  saved_desc: string;
  saved_tab_products: string;
  saved_tab_history: string;
  saved_indexed_db_active: string;
  saved_search_placeholder: string;
  saved_export_csv: string;
  saved_export_drive: string;
  saved_no_products: string;
  saved_no_products_desc: string;
  saved_back_radar: string;

  // Product Detail Modal
  modal_deep_dive_title: string;
  modal_share: string;
  modal_link_copied: string;
  modal_why_viral: string;
  modal_cultural_fit: string;
  modal_ad_hooks: string;
  modal_supplier_keywords: string;
  modal_close: string;

  // Footer & General
  footer_tagline: string;
  footer_pwa: string;
  footer_ai: string;
  offline_status: string;
  online_status: string;

  // Onboarding Tour
  onboarding_menu_item: string;
  onboarding_badge: string;
  onboarding_skip: string;
  onboarding_prev: string;
  onboarding_next: string;
  onboarding_finish: string;
  onboarding_step_indicator: string;
  onboarding_step1_badge: string;
  onboarding_step1_title: string;
  onboarding_step1_desc: string;
  onboarding_step1_point1_title: string;
  onboarding_step1_point1_desc: string;
  onboarding_step1_point2_title: string;
  onboarding_step1_point2_desc: string;
  onboarding_step1_point3_title: string;
  onboarding_step1_point3_desc: string;
  onboarding_step1_action: string;
  onboarding_step2_badge: string;
  onboarding_step2_title: string;
  onboarding_step2_desc: string;
  onboarding_step2_point1_title: string;
  onboarding_step2_point1_desc: string;
  onboarding_step2_point2_title: string;
  onboarding_step2_point2_desc: string;
  onboarding_step2_point3_title: string;
  onboarding_step2_point3_desc: string;
  onboarding_step2_action: string;
  onboarding_step3_badge: string;
  onboarding_step3_title: string;
  onboarding_step3_desc: string;
  onboarding_step3_point1_title: string;
  onboarding_step3_point1_desc: string;
  onboarding_step3_point2_title: string;
  onboarding_step3_point2_desc: string;
  onboarding_step3_point3_title: string;
  onboarding_step3_point3_desc: string;
  onboarding_step3_action: string;

  // Price Monitor
  price_monitor_tab: string;
  price_monitor_badge: string;
  price_monitor_title: string;
  price_monitor_desc: string;
  price_monitor_refresh_btn: string;
  price_monitor_refreshing: string;
  price_monitor_last_check: string;
  price_monitor_opportunities: string;
  price_monitor_opportunities_sub: string;
  price_monitor_warnings: string;
  price_monitor_warnings_sub: string;
  price_monitor_stable: string;
  price_monitor_avg_diff: string;
  price_monitor_orig_cost: string;
  price_monitor_current_cost: string;
  price_monitor_orig_price: string;
  price_monitor_current_price: string;
  price_monitor_orig_margin: string;
  price_monitor_current_margin: string;
  price_monitor_simulate_new: string;
  price_monitor_apply_update: string;
  price_monitor_applied_toast: string;
  price_monitor_filter_all: string;
  price_monitor_filter_opp: string;
  price_monitor_filter_warn: string;
  price_monitor_filter_stable: string;
  price_monitor_toast_title: string;
  price_monitor_toast_msg: string;
  price_monitor_toast_action: string;
}

export const TRANSLATIONS: Record<SupportedLanguage, TranslationDictionary> = {
  pt: {
    // Nav
    nav_all: 'Todos os Produtos',
    nav_early_wave: 'Ondas Iniciais',
    nav_high_margin: 'Alta Margem',
    nav_saved: 'Favoritos',
    nav_calculator: 'Calculadora',
    nav_scan: 'Escanear Tendências',
    nav_scanning: 'Escaneando...',
    nav_tools: 'Recursos & Hub',
    nav_offline_db: 'Banco Offline (IndexedDB)',
    nav_offline_db_desc: 'Gerenciar cache e histórico offline',
    nav_free_api: 'API R$ 0 Grátis',
    nav_workspace_hub: 'Google Workspace Hub',
    nav_version_badge: 'Windows Desktop v1.0',

    // Hero
    hero_title: 'Radar de Tendências Virais & Arbitragem',
    hero_subtitle:
      'Monitore produtos que estão explodindo nos EUA e China antes de chegarem ao Brasil. Lucre com alta margem e concorrência incipiente.',
    hero_search_placeholder: 'Buscar por produto, nicho ou palavra-chave...',
    hero_all_origins: 'Origem: Todas',
    hero_origin_us: '🇺🇸 Estados Unidos',
    hero_origin_cn: '🇨🇳 China',
    hero_scan_ai: 'Escanear com IA',
    hero_monitored_products: 'produtos monitorados',
    niche_all: 'Todos os Nichos',
    hero_niches_all: 'Todos os Nichos',
    hero_niche_tech: 'Gadgets & Tech',
    hero_niche_home: 'Casa & Cozinha',
    hero_niche_beauty: 'Beleza & Estética',
    hero_niche_fitness: 'Fitness & Treino',
    hero_niche_pets: 'Pet Inovador',
    hero_niche_accessories: 'Moda & Acessórios',
    hero_niche_kids: 'Infantil & Bebês',
    hero_niche_tools: 'Ferramentas & Obra',
    hero_niche_auto: 'Automotivo & Carros',
    hero_niche_health: 'Saúde & Bem-Estar',
    recent_searches_title: 'Buscas Recentes',
    recent_searches_top: 'Mais Investigados',
    recent_searches_clear: 'Limpar Histórico',
    recent_searches_empty: 'Nenhuma busca recente gravada ainda',
    recent_searches_remove: 'Remover busca',
    recent_searches_times: 'buscas',
    recent_searches_popular_suggestions: 'Sugestões de Nicho em Alta',

    // Early Wave Dashboard
    early_wave_dashboard_title: 'Top 3 Nichos em "Onda Inicial"',
    early_wave_ocean_blue: 'Oceano Azul BR',
    early_wave_desc:
      'Maior volume de produtos virais no exterior com concorrência incipiente no Brasil',
    early_wave_clear_filter: 'Limpar Filtro de Nicho',
    early_wave_view_only: 'Ver Somente Ondas',
    early_wave_rank_1: '#1 Mais Incipiente',
    early_wave_rank_2: '#2 Onda Forte',
    early_wave_rank_3: '#3 Alta Margem',
    early_wave_active: 'Ativo',
    early_wave_filter_btn: 'Filtrar',
    early_wave_count_label: 'produtos em onda inicial',
    early_wave_avg_virality: 'Viralidade Média',
    early_wave_avg_margin: 'Margem Média',
    early_wave_highlight: 'Destaque:',

    // Product Grid
    grid_title_all: 'Radar de Produtos em Ascensão Global',
    grid_title_early: '🌊 Ondas Iniciais (Pouca Concorrência no Brasil)',
    grid_title_margin: '⚡ Produtos de Alta Margem (300%+ de Lucro Bruto)',
    grid_filtered_count: 'tendências filtradas com alto potencial no mercado brasileiro.',
    grid_filtering_label: 'Filtrando:',
    grid_no_products: 'Nenhum produto encontrado com estes filtros',
    grid_no_products_desc:
      'Tente limpar os termos de busca ou dispare uma nova varredura de inteligência.',
    grid_reset_filters: 'Restaurar Filtros Padrão',

    // Product Card
    card_virality: 'Viralidade',
    card_supplier_cost: 'Custo',
    card_sell_price: 'Venda Sugerida',
    card_est_profit: 'Lucro Líquido Est.',
    card_margin: 'Margem',
    card_view_deepdive: 'Raio-X',
    card_calc: 'Calculadora',
    card_ad_creative: 'Criativos',
    card_save: 'Salvar',
    card_saved: 'Salvo',
    card_early_wave_badge: 'Onda Inicial',
    card_growth: 'Crescimento',
    card_source: 'Origem',

    // Saved Radar
    saved_title: 'Radar de Produtos Salvos',
    saved_desc: 'Seus produtos minerados e marcados para teste de oferta.',
    saved_tab_products: 'Produtos Salvos',
    saved_tab_history: 'Histórico em Cache',
    saved_indexed_db_active: 'Banco Offline IndexedDB Ativo',
    saved_search_placeholder: 'Buscar nos produtos salvos...',
    saved_export_csv: 'Exportar CSV',
    saved_export_drive: 'Salvar no Drive',
    saved_no_products: 'Nenhum produto salvo ainda',
    saved_no_products_desc: 'Navegue pelo radar e clique no ícone de marcador para salvar produtos promissores.',
    saved_back_radar: 'Explorar Radar de Tendências',

    // Product Detail Modal
    modal_deep_dive_title: 'Raio-X do Produto & Análise de Arbitragem',
    modal_share: 'Compartilhar',
    modal_link_copied: 'Link Copiado!',
    modal_why_viral: 'Por que está viralizando?',
    modal_cultural_fit: 'Aderência ao Mercado Brasileiro',
    modal_ad_hooks: 'Ganchos de Anúncios Recomendados',
    modal_supplier_keywords: 'Palavras-Chave para Fornecedores',
    modal_close: 'Fechar',

    // Footer & General
    footer_tagline: 'Radar de Tendências Virais e Arbitragem de Produtos Estrangeiros para o Brasil.',
    footer_pwa: 'PWA Compatível com Android & iOS',
    footer_ai: 'Google Gemini 3.8 Flash Grounded',
    offline_status: 'Você está offline (modo cache IndexedDB)',
    online_status: 'Conexão restabelecida',

    // Onboarding Tour
    onboarding_menu_item: 'Tour de Boas-Vindas',
    onboarding_badge: 'TOUR GUIADO TIKBLOX',
    onboarding_skip: 'Pular Tour',
    onboarding_prev: 'Anterior',
    onboarding_next: 'Próximo',
    onboarding_finish: 'Concluir Tour e Começar',
    onboarding_step_indicator: 'Passo {current} de {total}',
    onboarding_step1_badge: '1. RADAR VIRAL',
    onboarding_step1_title: 'Radar de Tendências & Arbitragem',
    onboarding_step1_desc: 'Descubra produtos que já explodiram nos EUA (TikTok Shop) e China (Douyin/AliExpress) antes de se popularizarem no Brasil.',
    onboarding_step1_point1_title: 'Ondas Iniciais no Brasil',
    onboarding_step1_point1_desc: 'Produtos com alta viralidade comprovada no exterior e concorrência incipiente no mercado brasileiro.',
    onboarding_step1_point2_title: 'Filtros Estratégicos',
    onboarding_step1_point2_desc: 'Filtre por nichos lucrativos (Tech, Casa, Beleza, Pets) e selecione a procedência (🇺🇸 EUA ou 🇨🇳 China).',
    onboarding_step1_point3_title: 'Varredura Contínua com IA',
    onboarding_step1_point3_desc: 'Dispare varreduras inteligentes para mapear novos vencedores em tempo real com dados do Google Gemini.',
    onboarding_step1_action: 'Explorar Produtos no Radar',
    onboarding_step2_badge: '2. MINERAÇÃO & CACHE',
    onboarding_step2_title: 'Salvamento de Produtos & Banco Offline',
    onboarding_step2_desc: 'Monte sua esteira de produtos vencedores com 1 clique e acesse tudo com segurança, inclusive sem conexão de internet.',
    onboarding_step2_point1_title: '1-Clique para Salvar',
    onboarding_step2_point1_desc: 'Clique no ícone de marcador em qualquer produto para salvá-lo em sua lista de prospecção e favoritos.',
    onboarding_step2_point2_title: '100% Offline com IndexedDB',
    onboarding_step2_point2_desc: 'Seus produtos e histórico ficam salvos no banco local do navegador. Trabalhe onde estiver, mesmo sem internet.',
    onboarding_step2_point3_title: 'Exportação & Google Workspace',
    onboarding_step2_point3_desc: 'Exporte planilhas CSV com fornecedores e integre com Google Drive, Gmail e Google Classroom.',
    onboarding_step2_action: 'Ir para Produtos Salvos',
    onboarding_step3_badge: '3. VIABILIDADE FINANCEIRA',
    onboarding_step3_title: 'Cálculo de Margem & Lucro Líquido Real',
    onboarding_step3_desc: 'Valide a lucratividade de cada produto antes de comprar estoque ou gastar em anúncios no TikTok ou Meta.',
    onboarding_step3_point1_title: 'Economia Unitária Real',
    onboarding_step3_point1_desc: 'Calcule a conversão cambial USD/BRL, frete internacional estimado e taxas alfandegárias (Remessa Conforme).',
    onboarding_step3_point2_title: 'ROAS de Equilíbrio & CPA',
    onboarding_step3_point2_desc: 'Descubra exatamente seu ponto de equilíbrio de anúncio e o CPA máximo viável para não ter prejuízo.',
    onboarding_step3_point3_title: 'Projeções de Escala Mensal',
    onboarding_step3_point3_desc: 'Visualize o potencial de faturamento e lucro líquido estimado para 30, 100 e 300 vendas por mês.',
    onboarding_step3_action: 'Abrir Simulador de Lucro',

    // Price Monitor
    price_monitor_tab: 'Variações de Preço',
    price_monitor_badge: 'Monitor de Preços via API',
    price_monitor_title: 'Monitor de Variações de Preço em Tempo Real',
    price_monitor_desc: 'Compara automaticamente o custo original detectado no radar com novas consultas via API sempre que o app é aberto.',
    price_monitor_refresh_btn: 'Consultar Preços Agora via API',
    price_monitor_refreshing: 'Consultando Fornecedores...',
    price_monitor_last_check: 'Última verificação via API',
    price_monitor_opportunities: 'Oportunidades de Lucro',
    price_monitor_opportunities_sub: 'Queda de custo no fornecedor ou alta no preço de revenda',
    price_monitor_warnings: 'Alertas de Custo',
    price_monitor_warnings_sub: 'Aumento de custo no fornecedor internacional',
    price_monitor_stable: 'Preços Estáveis',
    price_monitor_avg_diff: 'Variação Média de Custo',
    price_monitor_orig_cost: 'Custo Original',
    price_monitor_current_cost: 'Novo Custo API',
    price_monitor_orig_price: 'Venda Original',
    price_monitor_current_price: 'Nova Venda API',
    price_monitor_orig_margin: 'Margem Original',
    price_monitor_current_margin: 'Nova Margem',
    price_monitor_simulate_new: 'Simular Novo Preço',
    price_monitor_apply_update: 'Adotar Preço Atualizado',
    price_monitor_applied_toast: 'Preço atualizado com sucesso no seu radar salvo!',
    price_monitor_filter_all: 'Todos',
    price_monitor_filter_opp: 'Oportunidades',
    price_monitor_filter_warn: 'Alertas',
    price_monitor_filter_stable: 'Estáveis',
    price_monitor_toast_title: 'Monitor de Preços Ativo',
    price_monitor_toast_msg: 'Detectamos variações de preço em produtos salvos.',
    price_monitor_toast_action: 'Ver Detalhes',
  },

  en: {
    // Nav
    nav_all: 'All Trends',
    nav_early_wave: 'Early Waves',
    nav_high_margin: 'High Margins',
    nav_saved: 'Bookmarks',
    nav_calculator: 'Calculator',
    nav_scan: 'Scan Trends',
    nav_scanning: 'Scanning...',
    nav_tools: 'Tools & Hub',
    nav_offline_db: 'Offline Storage (IndexedDB)',
    nav_offline_db_desc: 'Manage local cache & offline history',
    nav_free_api: 'Free API R$ 0',
    nav_workspace_hub: 'Google Workspace Hub',
    nav_version_badge: 'Windows Desktop v1.0',

    // Hero
    hero_title: 'Viral Trends Radar & Cross-Border Arbitrage',
    hero_subtitle:
      'Track products exploding in the US & China before they reach Brazil. Maximize margins with low domestic market saturation.',
    hero_search_placeholder: 'Search by product, niche, or supplier keyword...',
    hero_all_origins: 'Origin: All',
    hero_origin_us: '🇺🇸 United States',
    hero_origin_cn: '🇨🇳 China',
    hero_scan_ai: 'AI Deep Scan',
    hero_monitored_products: 'monitored products',
    niche_all: 'All Niches',
    hero_niches_all: 'All Niches',
    hero_niche_tech: 'Tech & Gadgets',
    hero_niche_home: 'Home & Kitchen',
    hero_niche_beauty: 'Beauty & Skincare',
    hero_niche_fitness: 'Fitness & Workout',
    hero_niche_pets: 'Innovative Pet',
    hero_niche_accessories: 'Fashion & Jewelry',
    hero_niche_kids: 'Kids & Baby',
    hero_niche_tools: 'Tools & DIY',
    hero_niche_auto: 'Auto & Accessories',
    hero_niche_health: 'Health & Wellness',
    recent_searches_title: 'Recent Searches',
    recent_searches_top: 'Most Investigated',
    recent_searches_clear: 'Clear History',
    recent_searches_empty: 'No recent searches yet',
    recent_searches_remove: 'Remove search',
    recent_searches_times: 'searches',
    recent_searches_popular_suggestions: 'Trending Niche Suggestions',

    // Early Wave Dashboard
    early_wave_dashboard_title: 'Top 3 "Early Wave" Niches',
    early_wave_ocean_blue: 'Blue Ocean BR',
    early_wave_desc:
      'Highest volume of viral overseas products with little-to-no domestic competition in Brazil',
    early_wave_clear_filter: 'Clear Niche Filter',
    early_wave_view_only: 'View Early Waves Only',
    early_wave_rank_1: '#1 Early Leader',
    early_wave_rank_2: '#2 Strong Surge',
    early_wave_rank_3: '#3 High Margin',
    early_wave_active: 'Active',
    early_wave_filter_btn: 'Filter',
    early_wave_count_label: 'early wave products',
    early_wave_avg_virality: 'Avg Virality',
    early_wave_avg_margin: 'Avg Margin',
    early_wave_highlight: 'Featured:',

    // Product Grid
    grid_title_all: 'Global Rising Products Radar',
    grid_title_early: '🌊 Early Waves (Low Competition in Brazil)',
    grid_title_margin: '⚡ High Margin Products (300%+ Gross Margin)',
    grid_filtered_count: 'filtered trends with high arbitrage potential for the Brazilian market.',
    grid_filtering_label: 'Filtering:',
    grid_no_products: 'No products found with these filters',
    grid_no_products_desc:
      'Try clearing your search terms or trigger a fresh AI intelligence scan.',
    grid_reset_filters: 'Reset Default Filters',

    // Product Card
    card_virality: 'Virality',
    card_supplier_cost: 'Cost',
    card_sell_price: 'Suggested Sell',
    card_est_profit: 'Est. Net Profit',
    card_margin: 'Margin',
    card_view_deepdive: 'Deep Dive',
    card_calc: 'Calculator',
    card_ad_creative: 'Ad Creatives',
    card_save: 'Save',
    card_saved: 'Saved',
    card_early_wave_badge: 'Early Wave',
    card_growth: 'Growth',
    card_source: 'Source',

    // Saved Radar
    saved_title: 'Saved Products Radar',
    saved_desc: 'Your curated and bookmarked products ready for offer testing.',
    saved_tab_products: 'Saved Products',
    saved_tab_history: 'Cached History',
    saved_indexed_db_active: 'Offline IndexedDB Active',
    saved_search_placeholder: 'Search saved products...',
    saved_export_csv: 'Export CSV',
    saved_export_drive: 'Save to Drive',
    saved_no_products: 'No saved products yet',
    saved_no_products_desc: 'Browse the radar and click the bookmark icon on any promising product.',
    saved_back_radar: 'Explore Trends Radar',

    // Product Detail Modal
    modal_deep_dive_title: 'Product Deep Dive & Arbitrage Breakdown',
    modal_share: 'Share',
    modal_link_copied: 'Link Copiado!',
    modal_why_viral: 'Why is it going viral?',
    modal_cultural_fit: 'Brazilian Market Cultural Fit',
    modal_ad_hooks: 'Recommended Ad Creative Hooks',
    modal_supplier_keywords: 'Supplier Search Keywords',
    modal_close: 'Close',

    // Footer & General
    footer_tagline: 'Viral Trends Radar and Cross-Border Product Arbitrage for Brazil.',
    footer_pwa: 'PWA Compatible with Android & iOS',
    footer_ai: 'Google Gemini 3.8 Flash Grounded',
    offline_status: 'You are currently offline (IndexedDB cache mode)',
    online_status: 'Connection restored',

    // Onboarding Tour
    onboarding_menu_item: 'Welcome Tour',
    onboarding_badge: 'TIKBLOX GUIDED TOUR',
    onboarding_skip: 'Skip Tour',
    onboarding_prev: 'Previous',
    onboarding_next: 'Next',
    onboarding_finish: 'Finish Tour & Get Started',
    onboarding_step_indicator: 'Step {current} of {total}',
    onboarding_step1_badge: '1. VIRAL RADAR',
    onboarding_step1_title: 'Viral Trends & Cross-Border Radar',
    onboarding_step1_desc: 'Discover products taking off in the US (TikTok Shop) and China (Douyin/AliExpress) before they explode in Brazil.',
    onboarding_step1_point1_title: 'Early Waves in Brazil',
    onboarding_step1_point1_desc: 'Products with proven viral traction abroad and nascent merchant competition in the Brazilian market.',
    onboarding_step1_point2_title: 'Strategic Filtering',
    onboarding_step1_point2_desc: 'Filter by high-margin niches (Tech, Home, Beauty, Pets) and select product origin (🇺🇸 USA or 🇨🇳 China).',
    onboarding_step1_point3_title: 'Continuous AI Deep Scan',
    onboarding_step1_point3_desc: 'Trigger smart scans to map new winning products in real-time grounded by Google Gemini.',
    onboarding_step1_action: 'Explore Trends on Radar',
    onboarding_step2_badge: '2. MINING & CACHE',
    onboarding_step2_title: 'Save Winning Products & Offline Storage',
    onboarding_step2_desc: 'Build your winning product pipeline with 1 click and access everything securely, even without internet access.',
    onboarding_step2_point1_title: '1-Click Bookmark',
    onboarding_step2_point1_desc: 'Click the bookmark icon on any product card to instantly add it to your prospecting list.',
    onboarding_step2_point2_title: '100% Offline with IndexedDB',
    onboarding_step2_point2_desc: 'Your saved products and trend history stay stored in browser storage. Work anywhere, even offline.',
    onboarding_step2_point3_title: 'Export & Google Workspace',
    onboarding_step2_point3_desc: 'Export CSV sheets with suppliers and sync directly to Google Drive, Gmail, and Google Classroom.',
    onboarding_step2_action: 'Go to Saved Products',
    onboarding_step3_badge: '3. FINANCIAL VIABILITY',
    onboarding_step3_title: 'Net Margin & Real Unit Economics',
    onboarding_step3_desc: 'Validate profitability for each item before purchasing inventory or spending on TikTok or Meta ad campaigns.',
    onboarding_step3_point1_title: 'Real Unit Economics',
    onboarding_step3_point1_desc: 'Simulate USD/BRL exchange rates, estimated international shipping, and customs tariffs (Remessa Conforme).',
    onboarding_step3_point2_title: 'Break-Even ROAS & CPA',
    onboarding_step3_point2_desc: 'Determine your exact break-even ROAS and maximum viable CPA to avoid operating at a loss.',
    onboarding_step3_point3_title: 'Monthly Scale Projections',
    onboarding_step3_point3_desc: 'Preview estimated revenue and net profit potential across 30, 100, and 300 unit sales per month.',
    onboarding_step3_action: 'Open Profit Simulator',

    // Price Monitor
    price_monitor_tab: 'Price Variations',
    price_monitor_badge: 'API Price Monitor',
    price_monitor_title: 'Real-Time Price Variation Monitor',
    price_monitor_desc: 'Automatically compares original detected costs with fresh API supplier & marketplace queries whenever the app opens.',
    price_monitor_refresh_btn: 'Check Prices Now via API',
    price_monitor_refreshing: 'Checking Suppliers...',
    price_monitor_last_check: 'Last checked via API',
    price_monitor_opportunities: 'Margin Opportunities',
    price_monitor_opportunities_sub: 'Supplier cost drop or higher resale price',
    price_monitor_warnings: 'Cost Warnings',
    price_monitor_warnings_sub: 'International supplier cost increase',
    price_monitor_stable: 'Stable Prices',
    price_monitor_avg_diff: 'Average Cost Variation',
    price_monitor_orig_cost: 'Original Cost',
    price_monitor_current_cost: 'New API Cost',
    price_monitor_orig_price: 'Original Sale',
    price_monitor_current_price: 'New API Sale',
    price_monitor_orig_margin: 'Original Margin',
    price_monitor_current_margin: 'New Margin',
    price_monitor_simulate_new: 'Simulate New Price',
    price_monitor_apply_update: 'Apply Updated Price',
    price_monitor_applied_toast: 'Price updated successfully in your saved radar!',
    price_monitor_filter_all: 'All',
    price_monitor_filter_opp: 'Opportunities',
    price_monitor_filter_warn: 'Warnings',
    price_monitor_filter_stable: 'Stable',
    price_monitor_toast_title: 'Price Monitor Active',
    price_monitor_toast_msg: 'Price variations detected on saved products.',
    price_monitor_toast_action: 'View Details',
  },
};

/**
 * Detects initial user language based on localStorage or browser navigator settings
 */
export function detectInitialLanguage(): SupportedLanguage {
  if (typeof window === 'undefined') return 'pt';

  try {
    const saved = localStorage.getItem('tikblox_lang_pref');
    if (saved === 'pt' || saved === 'en') {
      return saved;
    }

    // Check navigator.language and navigator.languages
    const browserLanguages: string[] = [];
    if (navigator.languages && navigator.languages.length > 0) {
      browserLanguages.push(...navigator.languages);
    }
    if (navigator.language) {
      browserLanguages.push(navigator.language);
    }

    for (const lang of browserLanguages) {
      const lower = lang.toLowerCase();
      if (lower.startsWith('en')) {
        return 'en';
      }
      if (lower.startsWith('pt')) {
        return 'pt';
      }
    }
  } catch (e) {
    console.warn('Could not detect language from navigator:', e);
  }

  return 'pt'; // Default fallback
}
