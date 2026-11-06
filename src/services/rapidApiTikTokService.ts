export interface LiveVerificationResult {
  available: boolean;
  verifiedAt?: string;
  searchTerm: string;
  videoCountBR?: number;
  message: string;
  sampleVideos?: Array<{
    title: string;
    author: string;
    views: number;
  }>;
}

export async function verifyProductInTikTokShopBR(searchTerm: string): Promise<LiveVerificationResult> {
  const term = searchTerm.trim();
  if (term.length < 2) {
    return { available: false, searchTerm: term, message: 'verificação indisponível' };
  }
  try {
    const response = await fetch('/api/tiktok-verify', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ searchTerm: term }),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok || data.available === false) {
      return {
        available: false,
        searchTerm: term,
        message: typeof data.message === 'string' ? data.message : 'verificação indisponível',
      };
    }
    return {
      available: true,
      verifiedAt: new Date().toISOString(),
      searchTerm: term,
      videoCountBR: Number(data.videoCountBR || 0),
      message: data.message || 'Verificação concluída.',
      sampleVideos: Array.isArray(data.sampleVideos) ? data.sampleVideos : [],
    };
  } catch {
    return { available: false, searchTerm: term, message: 'verificação indisponível' };
  }
}
