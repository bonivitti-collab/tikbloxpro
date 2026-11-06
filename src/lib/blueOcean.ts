import { TrendingProduct } from '../types.js';

export function isBlueOceanOpportunity(p: TrendingProduct | any): boolean {
  if (!p) return false;
  if (p.waveStage === 'peak_wave') return false;
  if (p.creatorSaturationBR === 'Alta' || p.creatorSaturationBR === 'Saturado') return false;
  if (p.tradeConviction) {
    const videos = p.tradeConviction.creatorVideoCountBR;
    if (typeof videos === 'number' && videos > 18) return false;
    if (p.tradeConviction.verdict === 'ALERTA_SATURACAO') return false;
    // null < 80 é true em JavaScript. Score ausente significa "sem vídeos medidos", não score baixo.
    const score = p.tradeConviction.convictionScore;
    if (typeof score === 'number' && score < 80) return false;
  }
  return true;
}
