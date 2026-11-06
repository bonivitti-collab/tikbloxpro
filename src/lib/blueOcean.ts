import { TrendingProduct } from '../types.js';

export function isBlueOceanOpportunity(p: TrendingProduct | any): boolean {
  if (!p) return false;
  if (p.waveStage === 'peak_wave') return false;
  if (p.creatorSaturationBR === 'Alta' || p.creatorSaturationBR === 'Saturado') return false;
  if (p.tradeConviction) {
    if (p.tradeConviction.creatorVideoCountBR > 18) return false;
    if (p.tradeConviction.verdict === 'ALERTA_SATURACAO') return false;
    if (p.tradeConviction.convictionScore < 80) return false;
  }
  return true;
}
