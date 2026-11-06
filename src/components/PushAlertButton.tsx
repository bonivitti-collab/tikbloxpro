import React, { useState } from 'react';

interface NicheOption {
  id: string;
  label: string;
}

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw = atob(base64);
  const output = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i += 1) output[i] = raw.charCodeAt(i);
  return output;
}

function isIos(): boolean {
  return /iphone|ipad|ipod/i.test(window.navigator.userAgent);
}

function isStandalone(): boolean {
  const nav = window.navigator as Navigator & { standalone?: boolean };
  return window.matchMedia('(display-mode: standalone)').matches || nav.standalone === true;
}

export const PushAlertButton: React.FC<{ niches: NicheOption[] }> = ({ niches }) => {
  const [niche, setNiche] = useState(niches[0]?.id || '');
  const [tip, setTip] = useState('');
  const [status, setStatus] = useState('');

  const activate = async () => {
    setTip('');
    setStatus('');
    if (isIos() && !isStandalone()) {
      setTip('No iPhone, abra o Safari, toque em Compartilhar e escolha Adicionar à Tela de Início. Abra o TikBlox por esse ícone e volte aqui para ativar os alertas.');
      return;
    }
    if (!('Notification' in window) || !('serviceWorker' in navigator) || !('PushManager' in window)) {
      setStatus('Este navegador não recebe alerta.');
      return;
    }
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      setStatus('Permissão não concedida.');
      return;
    }
    const keyResponse = await fetch('/api/push', { credentials: 'include' });
    const keyBody = await keyResponse.json().catch(() => ({}));
    if (!keyResponse.ok || !keyBody.publicKey) {
      setStatus('Alertas ainda não estão configurados.');
      return;
    }
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(keyBody.publicKey),
    });
    const saved = await fetch('/api/push', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ subscription, niche }),
    });
    setStatus(saved.ok ? 'Alertas ligados para este nicho.' : 'Não foi possível guardar o alerta.');
  };

  return (
    <div className="space-y-2 text-right">
      {niches.length > 0 ? (
        <select value={niche} onChange={(event) => setNiche(event.target.value)} className="h-9 rounded-lg border border-slate-300 bg-white px-2 text-xs" aria-label="Nicho dos alertas">
          {niches.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
        </select>
      ) : null}
      <button type="button" onClick={activate} className="block min-h-11 rounded-xl bg-[#FE2C55] px-3 text-xs font-black text-white">
        Ativar alertas no celular
      </button>
      {tip ? <p className="max-w-xs text-left text-[11px] text-slate-600">{tip}</p> : null}
      {status ? <p className="text-[11px] text-slate-600">{status}</p> : null}
    </div>
  );
};
