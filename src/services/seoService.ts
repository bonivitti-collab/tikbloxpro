import { TrendingProduct } from '../types';

export const BASE_APP_URL = 'https://tikblox.com.br';

const DEFAULT_TITLE_PT = 'TIKBLOX PRO | Radar TikTok Shop Brasil - Produtos Virais';
const DEFAULT_TITLE_EN = 'TIKBLOX PRO | TikTok Shop Brazil Radar - Viral Products';

const DEFAULT_DESCRIPTION_PT =
  'Minere produtos virais no TikTok Shop Brasil antes da saturação. Radar de comissões e concorrência para afiliados.';
const DEFAULT_DESCRIPTION_EN =
  'Discover viral products on TikTok Shop Brazil before market saturation. Commission and competition radar for affiliates.';

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
    ? `${product.name} | TIKBLOX PRO TikTok Shop Radar`
    : `${product.name} | Radar TikTok Shop TIKBLOX PRO`;

  const estimatedProfitBRL = Math.max(0, product.estimatedPriceBRL - (product.estimatedCostUSD * 5.6));
  const descriptionText = product.culturalFitReason || product.highlights?.join(', ') || 'Produto viral com alto potencial de vendas no TikTok Shop Brasil.';
  
  const productDescription = lang === 'en'
    ? `${product.name}: ${descriptionText.slice(0, 120)}... Estimated profit margin ${product.estimatedProfitMarginPercent}%, commission ${product.tiktokShop?.commissionRatePercent || 20}%. The buyer picks the seller inside TikTok Shop.`
    : `${product.name}: ${descriptionText.slice(0, 130)}... Margem estimada de ${product.estimatedProfitMarginPercent}%, comissão de ${product.tiktokShop?.commissionRatePercent || 20}%. O comprador escolhe o vendedor no TikTok Shop.`;

  const productImage = product.imageUrl || DEFAULT_IMAGE;

  // 1. Title & Standard Meta
  document.title = productTitle;
  setMetaTag('name', 'description', productDescription);
  setMetaTag(
    'name',
    'keywords',
    lang === 'en'
      ? `${product.name}, ${product.nicheLabel}, viral tiktok products, tiktok shop brazil, blue ocean products, ${product.supplierKeywords.join(', ')}`
      : `${product.name}, ${product.nicheLabel}, produtos virais tiktok, tiktok shop brasil, ${product.supplierKeywords.join(', ')}`
  );
  setLinkTag('canonical', productUrl);

  // 2. OpenGraph Meta Tags (WhatsApp, Facebook, LinkedIn, Discord, Telegram)
  setMetaTag('property', 'og:site_name', 'TIKBLOX PRO');
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
      name: 'TIKBLOX PRO',
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
        name: 'TIKBLOX PRO',
      },
    },
  };

  setJsonLd('tikblox-dynamic-schema', productSchema);
}

/**
 * Resets head metadata back to the default TIKBLOX PRO website identity
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
      ? 'tiktok shop brazil radar, viral products tiktok, affiliate tiktok shop, winners products 2026, tikblox pro'
      : 'tiktok shop brasil, radar tiktok shop, produtos virais tiktok, minerador tiktok shop, afiliados tiktok shop brasil, tikblox pro'
  );
  setLinkTag('canonical', `${BASE_APP_URL}/`);

  // OpenGraph Defaults
  setMetaTag('property', 'og:site_name', 'TIKBLOX PRO');
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

  // WebApplication Structured Data Schema with rich properties
  const webAppSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'TIKBLOX PRO',
    url: `${BASE_APP_URL}/`,
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'All (Web, Android, iOS, Windows, macOS)',
    description: defaultDescription,
    offers: {
      '@type': 'Offer',
      price: '37.00',
      priceCurrency: 'BRL',
    },
  };

  setJsonLd('tikblox-dynamic-schema', webAppSchema);
}
