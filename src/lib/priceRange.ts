/** Um único preço vira faixa de ±15% e fica marcado como estimado. */
export const ESTIMATED_PRICE_SPREAD = 0.15;

export interface PriceFields {
  price_brl: number | null;
  price_min: number | null;
  price_max: number | null;
  price_avg: number | null;
  price_estimated: boolean;
  commission_rate: number | null;
}

export interface PriceBand {
  min: number;
  max: number;
  avg: number;
  estimated: boolean;
}

export interface CommissionBand {
  min: number;
  max: number;
  rate: number;
}

export function roundMoney(value: number): number {
  return Math.round(value * 100) / 100;
}

function positive(value: unknown): number | null {
  const parsed = typeof value === 'number' ? value : typeof value === 'string' && value.trim() !== '' ? Number(value.replace(',', '.')) : NaN;
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

function emptyPrice(rate: number | null = null): PriceFields {
  return {
    price_brl: null,
    price_min: null,
    price_max: null,
    price_avg: null,
    price_estimated: false,
    commission_rate: rate,
  };
}

/**
 * Vários preços observados viram a faixa real. Um preço só vira ±15% e estimated.
 * `average`, quando a fonte manda, é o preço médio. `representative` é o preço
 * unitário usado na comissão já gravada.
 */
export function snapshotFromObserved(input: {
  points: number[];
  average?: number | null;
  representative?: number | null;
  rate?: number | null;
}): PriceFields {
  const points = input.points.map((value) => positive(value)).filter((value): value is number => value != null).map(roundMoney);
  const average = positive(input.average);
  const representative = positive(input.representative) ?? average ?? points[0] ?? null;
  const rate = input.rate != null && input.rate >= 0 ? roundMoney(input.rate) : null;
  if (representative == null) return emptyPrice(rate);
  const distinct = [...new Set(points.length > 0 ? points : [representative])];
  if (distinct.length < 2) {
    const point = representative;
    return {
      price_brl: point,
      price_avg: average ?? point,
      price_min: roundMoney(point * (1 - ESTIMATED_PRICE_SPREAD)),
      price_max: roundMoney(point * (1 + ESTIMATED_PRICE_SPREAD)),
      price_estimated: true,
      commission_rate: rate,
    };
  }
  const min = Math.min(...distinct);
  const max = Math.max(...distinct);
  return {
    price_brl: representative,
    price_avg: average ?? roundMoney(distinct.reduce((sum, value) => sum + value, 0) / distinct.length),
    price_min: min,
    price_max: max,
    price_estimated: false,
    commission_rate: rate,
  };
}

/** O mínimo e o máximo históricos sobrevivem às coletas seguintes. */
export function mergePriceHistory(previous: Partial<PriceFields> | null | undefined, next: PriceFields): PriceFields {
  if (next.price_min == null || next.price_max == null) {
    if (previous?.price_min == null || previous.price_max == null) return next;
    return {
      price_brl: next.price_brl ?? previous.price_brl ?? null,
      price_min: previous.price_min,
      price_max: previous.price_max,
      price_avg: next.price_avg ?? previous.price_avg ?? null,
      price_estimated: previous.price_estimated === true,
      commission_rate: next.commission_rate ?? previous.commission_rate ?? null,
    };
  }
  if (previous?.price_min == null || previous.price_max == null) return next;

  const prevEstimated = previous.price_estimated !== false;
  const nextEstimated = next.price_estimated !== false;
  const prevAnchor = positive(previous.price_avg) ?? positive(previous.price_brl) ?? previous.price_min;
  const nextAnchor = positive(next.price_avg) ?? positive(next.price_brl) ?? next.price_min;
  let min = next.price_min;
  let max = next.price_max;
  let estimated = nextEstimated;

  if (!nextEstimated && !prevEstimated) {
    min = Math.min(previous.price_min, next.price_min);
    max = Math.max(previous.price_max, next.price_max);
    estimated = false;
  } else if (!nextEstimated && prevEstimated) {
    min = Math.min(next.price_min, prevAnchor);
    max = Math.max(next.price_max, prevAnchor);
    estimated = false;
  } else if (nextEstimated && !prevEstimated) {
    min = Math.min(previous.price_min, nextAnchor);
    max = Math.max(previous.price_max, nextAnchor);
    estimated = false;
  } else {
    min = Math.min(previous.price_min, next.price_min);
    max = Math.max(previous.price_max, next.price_max);
    estimated = true;
  }

  return {
    price_brl: next.price_brl ?? previous.price_brl ?? null,
    price_min: roundMoney(min),
    price_max: roundMoney(max),
    price_avg: next.price_avg ?? previous.price_avg ?? null,
    price_estimated: estimated,
    commission_rate: next.commission_rate ?? previous.commission_rate ?? null,
  };
}

export function priceBandOf(product: any): PriceBand {
  const min = positive(product?.priceMin ?? product?.price_min);
  const max = positive(product?.priceMax ?? product?.price_max);
  const avg = positive(product?.priceAvg ?? product?.price_avg ?? product?.estimatedPriceBRL ?? product?.price_brl);
  const explicitEstimate = product?.priceEstimated === true || product?.price_estimated === true;
  if (min != null && max != null && max >= min) {
    return {
      min: roundMoney(min),
      max: roundMoney(max),
      avg: avg ?? roundMoney((min + max) / 2),
      estimated: explicitEstimate,
    };
  }
  const point = avg ?? min ?? max ?? 0;
  if (point <= 0) return { min: 0, max: 0, avg: 0, estimated: true };
  return {
    min: roundMoney(point * (1 - ESTIMATED_PRICE_SPREAD)),
    max: roundMoney(point * (1 + ESTIMATED_PRICE_SPREAD)),
    avg: roundMoney(point),
    estimated: true,
  };
}

export function commissionRateOf(product: any): number | null {
  if (product?.commissionUnknown === true) return null;
  const explicit = [
    product?.commissionRate,
    product?.commission_rate,
    product?.tiktokShop?.commissionRatePercent,
    product?.commissionPercent,
  ].map(positive).find((value) => value != null && value <= 100);
  if (explicit != null) return roundMoney(explicit);
  const commission = positive(
    product?.commissionEstimatedBRL ?? product?.commission_brl ?? product?.tiktokShop?.commissionValueBRL
  );
  const basis = positive(product?.priceAvg ?? product?.price_avg ?? product?.estimatedPriceBRL ?? product?.price_brl);
  if (commission == null || basis == null) return null;
  return roundMoney((commission / basis) * 100);
}

export function commissionBandOf(product: any): CommissionBand | null {
  const rate = commissionRateOf(product);
  if (rate == null) return null;
  const band = priceBandOf(product);
  if (band.avg <= 0) return null;
  return {
    min: roundMoney((band.min * rate) / 100),
    max: roundMoney((band.max * rate) / 100),
    rate,
  };
}

export function formatBrl(value: number): string {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export function formatPriceBand(band: PriceBand): string {
  const range = `Faixa de preço: ${formatBrl(band.min)} – ${formatBrl(band.max)}`;
  return band.estimated ? `${range} · estimado` : range;
}

export function formatCollectedDayMonth(value: unknown): string | null {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}/.test(value)) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  const parts = new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    timeZone: 'America/Sao_Paulo',
  }).formatToParts(date);
  const day = parts.find((part) => part.type === 'day')?.value;
  const month = parts.find((part) => part.type === 'month')?.value;
  return day && month ? `${day}/${month}` : null;
}

export function formatPriceNote(collectedAt: unknown): string {
  const when = formatCollectedDayMonth(collectedAt);
  return `${when ? `coletado em ${when}` : 'coleta sem data'} • o preço no TikTok varia com cupons e promoções`;
}

export function formatCommissionBand(band: CommissionBand): string {
  return `${formatBrl(band.min)} – ${formatBrl(band.max)} (${band.rate}%)`;
}

export function parseTypedPrice(value: string): number | null {
  const parsed = positive(value.trim());
  return parsed == null ? null : roundMoney(parsed);
}
