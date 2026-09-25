import { TrendingProduct } from '../types';

export const BASE_APP_URL = 'https://tikblox.com.br';

const DEFAULT_TITLE_PT = 'TIKBLOX - Radar de Tendências Virais & Produtos do Exterior';
const DEFAULT_TITLE_EN = 'TIKBLOX - Viral Trends Radar & Global Product Arbitrage';

const DEFAULT_DESCRIPTION_PT =
  'Radar de tendências globais e produtos virais do exterior chegando ao Brasil para surfar ondas de vendas no e-commerce e dropshipping.';
const DEFAULT_DESCRIPTION_EN =
  'Real-time radar for global viral products and international trends entering Brazil for e-commerce and dropshipping opportunities.';

const DEFAULT_IMAGE = `${BASE_APP_URL}/pwa-512x512.png`;

/**
 * Helper to update or create a <meta> tag by name or property
 */
function setMetaTag(attr: 'name' | 'property', key: string, content: string): void {
  if (typeof document === 'undefined') return;

  let element = document.querySelector(`meta[${attr}="${key}"]`);
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attr, key);
    document.head.appendChild(element);
  }
  element.setAttribute('content', content);
}

/**
 * Helper to update or create a <link rel="..."> tag
 */
function setLinkTag(rel: string, href: string): void {
  if (typeof document === 'undefined') return;

  let element = document.querySelector(`link[rel="${rel}"]`);
  if (!element) {
    element = document.createElement('link');
    element.setAttribute('rel', rel);
    document.head.appendChild(element);
  }
  element.setAttribute('href', href);
}

/**
 * Helper to inject or replace JSON-LD schema
 */
function setJsonLd(id: string, schemaObject: object): void {
  if (typeof document === 'undefined') return;

  let script = document.getElementById(id) as HTMLScriptElement | null;
  if (!script) {
    script = document.createElement('script');
    script.id = id;
    script.type = 'application/ld+json';
    document.head.appendChild(script);
  }
  script.textContent = JSON.stringify(schemaObject, null, 2);
}

/**
 * Dynamically updates all head metadata, OpenGraph, Twitter, and Schema.org tags for a specific product
 */
export function updateProductMetadata(product: TrendingProduct, lang: 'pt' | 'en' = 'pt'): void {
  if (typeof document === 'undefined' || !product) return;

  const productUrl = `${BASE_APP_URL}/?product=${encodeURIComponent(product.id)}`;
  const productTitle = lang === 'en'
    ? `${product.name} | TIKBLOX Viral Trends Radar`
    : `${product.name} | Radar Viral TIKBLOX`;

  const estimatedProfitBRL = Math.max(0, product.estimatedPriceBRL - (product.estimatedCostUSD * 5.6));
  const descriptionText = product.culturalFitReason || product.highlights?.join(', ') || 'Produto viral com alto potencial de arbitragem no Brasil.';
  
  const productDescription = lang === 'en'
    ? `${product.name}: ${descriptionText.slice(0, 120)}... Estimated net profit of R$ ${estimatedProfitBRL.toFixed(0)} (+${product.estimatedProfitMarginPercent}%) and virality score ${product.viralityScore}/100.`
    : `${product.name}: ${descriptionText.slice(0, 130)}... Lucro estimado de R$ ${estimatedProfitBRL.toFixed(0)} (${product.estimatedProfitMarginPercent}%) e viralidade ${product.viralityScore}/100.`;

  const productImage = product.imageUrl || DEFAULT_IMAGE;

  // 1. Title & Standard Meta
  document.title = productTitle;
  setMetaTag('name', 'description', productDescription);
  setMetaTag(
    'name',
    'keywords',
    lang === 'en'
      ? `${product.name}, ${product.nicheLabel}, viral products, e-commerce arbitrage, dropshipping brazil, ${product.supplierKeywords.join(', ')}`
      : `${product.name}, ${product.nicheLabel}, dropshipping brasil, produtos virais tiktok, arbitragem e-commerce, ${product.supplierKeywords.join(', ')}`
  );
  setLinkTag('canonical', productUrl);

  // 2. OpenGraph Meta Tags (WhatsApp, Facebook, LinkedIn, Discord, Telegram)
  setMetaTag('property', 'og:site_name', 'TIKBLOX');
  setMetaTag('property', 'og:type', 'product');
  setMetaTag('property', 'og:title', productTitle);
  setMetaTag('property', 'og:description', productDescription);
  setMetaTag('property', 'og:url', productUrl);
  setMetaTag('property', 'og:image', productImage);
  setMetaTag('property', 'og:image:alt', product.name);
  setMetaTag('property', 'product:price:amount', product.estimatedPriceBRL.toFixed(2));
  setMetaTag('property', 'product:price:currency', 'BRL');
  setMetaTag('property', 'product:availability', 'in stock');

  // 3. Twitter / X Cards
  setMetaTag('name', 'twitter:card', 'summary_large_image');
  setMetaTag('name', 'twitter:title', productTitle);
  setMetaTag('name', 'twitter:description', productDescription);
  setMetaTag('name', 'twitter:image', productImage);
  setMetaTag('name', 'twitter:image:alt', product.name);

  // 4. Schema.org Structured Data (JSON-LD Product schema for Google Rich Snippets)
  const productSchema = {
    '@context': 'https://schema.org/',
    '@type': 'Product',
    name: product.name,
    image: [productImage],
    description: descriptionText,
    sku: `TIKBLOX-${product.id}`,
    category: product.nicheLabel,
    brand: {
      '@type': 'Brand',
      name: 'TIKBLOX Radar',
    },
    offers: {
      '@type': 'Offer',
      url: productUrl,
      priceCurrency: 'BRL',
      price: product.estimatedPriceBRL.toFixed(2),
      priceValidUntil: '2027-12-31',
      itemCondition: 'https://schema.org/NewCondition',
      availability: 'https://schema.org/InStock',
      seller: {
        '@type': 'Organization',
        name: 'TIKBLOX',
      },
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: Math.min(5, Math.max(4.0, product.viralityScore / 20)).toFixed(1),
      reviewCount: Math.max(15, Math.floor((product.trendingMetrics?.growthRatePercent || 150) / 10)),
      bestRating: '5',
      worstRating: '1',
    },
  };

  setJsonLd('tikblox-dynamic-schema', productSchema);
}

/**
 * Resets head metadata back to the default TIKBLOX website identity
 */
export function resetDefaultMetadata(lang: 'pt' | 'en' = 'pt'): void {
  if (typeof document === 'undefined') return;

  const defaultTitle = lang === 'en' ? DEFAULT_TITLE_EN : DEFAULT_TITLE_PT;
  const defaultDescription = lang === 'en' ? DEFAULT_DESCRIPTION_EN : DEFAULT_DESCRIPTION_PT;

  document.title = defaultTitle;
  setMetaTag('name', 'description', defaultDescription);
  setMetaTag(
    'name',
    'keywords',
    lang === 'en'
      ? 'viral products radar, trending tiktok products, dropshipping brazil, product research, international arbitrage, e-commerce trends'
      : 'radar de produtos, produtos virais tiktok, dropshipping brasil, mineração de produtos, arbitragem internacional, e-commerce brasil'
  );
  setLinkTag('canonical', `${BASE_APP_URL}/`);

  // OpenGraph Defaults
  setMetaTag('property', 'og:site_name', 'TIKBLOX');
  setMetaTag('property', 'og:type', 'website');
  setMetaTag('property', 'og:title', defaultTitle);
  setMetaTag('property', 'og:description', defaultDescription);
  setMetaTag('property', 'og:url', `${BASE_APP_URL}/`);
  setMetaTag('property', 'og:image', DEFAULT_IMAGE);

  // Twitter Defaults
  setMetaTag('name', 'twitter:card', 'summary_large_image');
  setMetaTag('name', 'twitter:title', defaultTitle);
  setMetaTag('name', 'twitter:description', defaultDescription);
  setMetaTag('name', 'twitter:image', DEFAULT_IMAGE);

  // WebApplication Structured Data Schema
  const webAppSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'TIKBLOX',
    url: `${BASE_APP_URL}/`,
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'All',
    description: defaultDescription,
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'BRL',
    },
  };

  setJsonLd('tikblox-dynamic-schema', webAppSchema);
}
