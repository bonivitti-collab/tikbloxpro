import React, { useEffect, useState } from 'react';

interface CreatorProduct {
  id: string;
  title: string;
  price_brl: number | null;
  commission_brl: number | null;
  product_url: string;
  cover_url: string | null;
}

interface CreatorCard {
  id: string;
  handle: string;
  nickname: string;
  followers: number | null;
  revenue_brl: number | null;
  sales_volume: number | null;
  category: string | null;
  products: CreatorProduct[];
}

function money(value: number | null): string {
  if (value == null) return '—';
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export const CreatorsPanel: React.FC = () => {
  const [creators, setCreators] = useState<CreatorCard[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const response = await fetch('/api/creators', { credentials: 'include' });
        const body = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(body.error || 'Falha ao carregar criadores');
        if (!cancelled) setCreators(Array.isArray(body.creators) ? body.creators : []);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Falha ao carregar criadores');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return <div className="p-8 text-sm text-slate-500">Carregando criadores do TikTok Shop BR…</div>;
  }
  if (error) {
    return <div className="p-8 text-sm text-rose-600">{error}</div>;
  }
  if (creators.length === 0) {
    return <div className="p-8 text-sm text-slate-500">Ainda não há criadores coletados hoje.</div>;
  }

  return (
    <div className="flex-1 overflow-y-auto bg-[#F8FAFC] p-4 sm:p-6 space-y-4">
      <div>
        <h2 className="text-lg font-black text-slate-900">Top Criadores</h2>
        <p className="text-xs text-slate-500">Quem mais vende no TikTok Shop Brasil e os produtos do ranking.</p>
      </div>
      {creators.map((creator) => (
        <article key={creator.id} className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <div>
              <h3 className="font-bold text-slate-900">{creator.nickname}</h3>
              <p className="text-xs text-slate-500">{creator.handle ? `@${creator.handle}` : creator.id}</p>
            </div>
            <div className="text-right text-xs text-slate-600">
              <div className="font-bold text-slate-900">{money(creator.revenue_brl)} em 7 dias</div>
              <div>{creator.followers == null ? 'seguidores n/d' : `${creator.followers.toLocaleString('pt-BR')} seguidores`}</div>
            </div>
          </div>
          {creator.category ? <p className="mt-2 text-[11px] font-bold text-[#007A87]">{creator.category}</p> : null}
          <ul className="mt-3 space-y-2">
            {creator.products.length === 0 ? (
              <li className="text-xs text-slate-400">Os produtos deste criador entram na próxima coleta, dentro do crédito do dia.</li>
            ) : creator.products.map((product) => (
              <li key={product.id}>
                <a
                  href={product.product_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 rounded-xl border border-slate-200 px-3 py-2 hover:border-[#25F4EE]"
                >
                  {product.cover_url ? (
                    <img src={product.cover_url} alt="" className="h-12 w-12 rounded-lg object-cover bg-slate-100" />
                  ) : (
                    <span className="h-12 w-12 rounded-lg bg-slate-100" />
                  )}
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-bold text-slate-900 truncate">{product.title}</span>
                    <span className="block text-[11px] text-slate-500">
                      {money(product.price_brl)}
                      {product.commission_brl == null ? ' · comissão não informada' : ` · comissão ${money(product.commission_brl)}`}
                    </span>
                  </span>
                  <span className="text-[11px] font-bold text-[#FE2C55] shrink-0">Abrir no TikTok Shop</span>
                </a>
              </li>
            ))}
          </ul>
        </article>
      ))}
    </div>
  );
};
