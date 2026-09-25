import { useEffect } from 'react';
import { TrendingProduct } from '../types';
import { updateProductMetadata, resetDefaultMetadata } from '../services/seoService';

/**
 * Hook to dynamically sync document metadata (Title, Meta Description, OpenGraph, Twitter, Schema.org)
 * and deep-link query parameter (?product=...) with the currently inspected product.
 */
export function useDynamicSeo(activeProduct: TrendingProduct | null, lang: 'pt' | 'en' = 'pt'): void {
  useEffect(() => {
    if (activeProduct) {
      // 1. Update DOM metadata, OG, Twitter Cards and JSON-LD
      updateProductMetadata(activeProduct, lang);

      // 2. Synchronize URL query parameter for clean sharing and deep-linking
      if (typeof window !== 'undefined') {
        const url = new URL(window.location.href);
        if (url.searchParams.get('product') !== activeProduct.id) {
          url.searchParams.set('product', activeProduct.id);
          window.history.replaceState(null, '', url.toString());
        }
      }
    } else {
      // 1. Restore root website metadata
      resetDefaultMetadata(lang);

      // 2. Clean product query parameter if user closed the modal
      if (typeof window !== 'undefined') {
        const url = new URL(window.location.href);
        if (url.searchParams.has('product')) {
          url.searchParams.delete('product');
          const newSearch = url.searchParams.toString();
          const cleanUrl = url.pathname + (newSearch ? `?${newSearch}` : '') + url.hash;
          window.history.replaceState(null, '', cleanUrl);
        }
      }
    }
  }, [activeProduct, lang]);
}
