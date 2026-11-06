import React, { useEffect, useState } from 'react';
import { PushAlertButton } from './PushAlertButton';

interface RadarCreatorFace {
  id: string;
  nickname: string;
  handle: string;
  avatarUrl: string | null;
  videoUrl: string | null;
}

interface RadarProduct {
  id: string;
  title: string;
  niche: string;
  productUrl: string;
  coverUrl: string | null;
  commissionBrl: number | null;
  commissionRate: number | null;
  priceMin: number | null;
  priceMax: number | null;
  starters7d: number;
  startersPrev7d: number;
  tag: 'Novo' | 'Subindo' | 'Esfriando' | null;
  creators: RadarCreatorFace[];
}

interface RadarCreator {
  id: string;
  handle: string;
  nickname: string;
  avatarUrl: string | null;
  followers: number | null;
  niches: string[];
}

interface NicheCard {
  id: string;
  label: string;
  icon: string;
  products: number;
  creators: number;
}

interface RadarPayload {
  niches: NicheCard[];
  products: RadarProduct[];
  creators: RadarCreator[];
  gated?: boolean;
}

function money(value: number | null): string | null {
  if (value == null) return null;
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function signalLine(product: RadarProduct): string {
  if (product.starters7d > 0) {
    const people = product.starters7d === 1 ? '1 top creator começou' : `${product.starters7d} top creators começaram`;
    return `${people} a promover este produto nos últimos 7 dias.`;
  }
  return `Nenhum top creator novo nesta semana. Na anterior, ${product.startersPrev7d} começaram.`;
}

export const CreatorRadar: React.FC = () => {
  const [data, setData] = useState<RadarPayload | null>(null);
  const [error, setError] = useState('');
  const [nicheId, setNicheId] = useState<string | null>(null);
  const [creatorId, setCreatorId] = useState<string | null>(null);
  const [productId, setProductId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const response = await fetch('/api/radar', { credentials: 'include' });
        const body = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(body.error || 'Falha ao carregar');
        if (!cancelled) setData(body);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Falha ao carregar');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (error) return <div className="p-6 text-sm text-rose-700">{error}</div>;
  if (!data) return <div className="p-6 text-sm text-slate-500">Carregando criadores…</div>;
  if (data.gated) return <div className="p-6 text-sm text-slate-600">O radar de criadores ainda não está liberado para esta conta.</div>;

  const niche = data.niches.find((item) => item.id === nicheId) || null;
  const creator = data.creators.find((item) => item.id === creatorId) || null;
  const product = data.products.find((item) => item.id === productId) || null;

  const back = () => {
    if (productId) setProductId(null);
    else if (creatorId) setCreatorId(null);
    else setNicheId(null);
  };

  return (
    <div className="flex-1 overflow-y-auto bg-[#F8FAFC] p-4 sm:p-6">
      <div className="max-w-3xl mx-auto space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wide text-[#007A87]">Top creators</p>
            <h1 className="text-xl font-black text-slate-950">O que eles começaram a vender</h1>
          </div>
          <PushAlertButton niches={data.niches} />
        </div>

        {(niche || creator || product) && (
          <button type="button" onClick={back} className="text-sm font-bold text-[#007A87]">
            Voltar
          </button>
        )}

        {product ? (
          <article className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3">
            <div className="flex gap-3">
              {product.coverUrl ? <img src={product.coverUrl} alt="" className="h-16 w-16 rounded-xl object-cover" /> : null}
              <div>
                {product.tag ? <span className="text-[10px] font-black uppercase text-[#9F1239]">{product.tag}</span> : null}
                <h2 className="text-lg font-black text-slate-950">{product.title}</h2>
                <p className="text-sm text-slate-600">{signalLine(product)}</p>
              </div>
            </div>
            {product.priceMin != null && product.priceMax != null ? (
              <p className="text-sm font-bold text-slate-800">
                Faixa de preço: {money(product.priceMin)} – {money(product.priceMax)}
              </p>
            ) : null}
            {product.commissionBrl != null ? (
              <p className="text-sm font-bold text-emerald-800">
                Comissão {money(product.commissionBrl)}{product.commissionRate != null ? ` (${product.commissionRate}%)` : ''}
              </p>
            ) : null}
            <p className="text-sm text-slate-700">
              O link de afiliado é gerado no app do TikTok, no seu perfil de criador, a partir deste produto.
            </p>
            <a href={product.productUrl} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center rounded-xl bg-slate-950 px-4 text-sm font-black text-white">
              Abrir produto no TikTok Shop
            </a>
            {product.creators.some((person) => person.videoUrl) ? (
              <div className="space-y-2">
                <h3 className="text-sm font-black text-slate-900">Vídeos para copiar o formato</h3>
                {product.creators.filter((person) => person.videoUrl).map((person) => (
                  <a key={person.id} href={person.videoUrl || '#'} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 rounded-xl border border-slate-200 p-2">
                    {person.avatarUrl ? <img src={person.avatarUrl} alt="" className="h-9 w-9 rounded-full object-cover" /> : <span className="h-9 w-9 rounded-full bg-slate-200" />}
                    <span className="text-sm font-bold text-slate-900">{person.nickname}</span>
                  </a>
                ))}
              </div>
            ) : null}
            <div className="flex flex-wrap gap-2">
              {product.creators.map((person) => (
                <button key={person.id} type="button" onClick={() => { setCreatorId(person.id); setProductId(null); }} className="min-h-11 rounded-full border border-slate-300 px-3 text-xs font-bold">
                  {person.nickname}
                </button>
              ))}
            </div>
          </article>
        ) : creator ? (
          <article className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3">
            <div className="flex items-center gap-3">
              {creator.avatarUrl ? <img src={creator.avatarUrl} alt="" className="h-14 w-14 rounded-full object-cover" /> : <span className="h-14 w-14 rounded-full bg-slate-200" />}
              <div>
                <h2 className="text-lg font-black">{creator.nickname}</h2>
                {creator.handle ? <p className="text-sm text-slate-500">@{creator.handle}</p> : null}
                {creator.followers != null ? <p className="text-xs text-slate-500">{creator.followers.toLocaleString('pt-BR')} seguidores</p> : null}
              </div>
            </div>
            {creator.handle ? (
              <a href={`https://www.tiktok.com/@${creator.handle}`} target="_blank" rel="noopener noreferrer" className="text-sm font-bold text-[#007A87]">
                Abrir perfil no TikTok
              </a>
            ) : null}
            <div className="flex flex-wrap gap-2">
              {creator.niches.map((id) => {
                const found = data.niches.find((item) => item.id === id);
                return <span key={id} className="rounded-full bg-slate-100 px-2 py-1 text-[11px] font-bold">{found?.label || id}</span>;
              })}
            </div>
            <div className="space-y-2">
              {data.products.filter((item) => item.creators.some((person) => person.id === creator.id)).map((item) => (
                <button key={item.id} type="button" onClick={() => setProductId(item.id)} className="block w-full rounded-xl border border-slate-200 p-3 text-left">
                  <span className="block text-sm font-black">{item.title}</span>
                  <span className="text-xs text-slate-500">{signalLine(item)}</span>
                </button>
              ))}
            </div>
          </article>
        ) : niche ? (
          <div className="space-y-4">
            <h2 className="text-lg font-black">{niche.icon} {niche.label}</h2>
            <div className="space-y-2">
              {data.products.filter((item) => item.niche === niche.id).map((item) => (
                <button key={item.id} type="button" onClick={() => setProductId(item.id)} className="w-full rounded-2xl border border-slate-200 bg-white p-3 text-left">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-black text-slate-950">{item.title}</span>
                    {item.tag ? <span className="text-[10px] font-black uppercase text-[#9F1239]">{item.tag}</span> : null}
                  </div>
                  <p className="mt-1 text-xs text-slate-600">{signalLine(item)}</p>
                  <div className="mt-2 flex -space-x-2">
                    {item.creators.slice(0, 5).map((person) => (
                      person.avatarUrl
                        ? <img key={person.id} src={person.avatarUrl} alt="" className="h-8 w-8 rounded-full border-2 border-white object-cover" />
                        : <span key={person.id} className="h-8 w-8 rounded-full border-2 border-white bg-slate-300" />
                    ))}
                  </div>
                </button>
              ))}
            </div>
            <h3 className="text-sm font-black text-slate-900">Criadores deste nicho</h3>
            <div className="space-y-2">
              {data.creators.filter((item) => item.niches.includes(niche.id)).map((item) => (
                <button key={item.id} type="button" onClick={() => setCreatorId(item.id)} className="flex w-full items-center gap-3 rounded-xl border border-slate-200 bg-white p-3 text-left">
                  {item.avatarUrl ? <img src={item.avatarUrl} alt="" className="h-10 w-10 rounded-full object-cover" /> : <span className="h-10 w-10 rounded-full bg-slate-200" />}
                  <span>
                    <span className="block text-sm font-black">{item.nickname}</span>
                    {item.handle ? <span className="text-xs text-slate-500">@{item.handle}</span> : null}
                  </span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {data.niches.length === 0 ? (
              <p className="col-span-2 text-sm text-slate-600">Ainda não há criadores promovendo os mesmos produtos nesta janela de 7 dias. A coleta das 06:00 vai preenchendo isso.</p>
            ) : data.niches.map((item) => (
              <button key={item.id} type="button" onClick={() => setNicheId(item.id)} className="min-h-24 rounded-2xl border border-slate-200 bg-white p-3 text-left">
                <span className="text-2xl">{item.icon}</span>
                <span className="mt-1 block text-sm font-black text-slate-950">{item.label}</span>
                <span className="text-[11px] text-slate-500">{item.products} produtos · {item.creators} criadores</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
