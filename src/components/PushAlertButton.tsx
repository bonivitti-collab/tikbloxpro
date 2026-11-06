import React, { useState } from 'react';
import { Bell, X } from 'lucide-react';

interface NicheOption {
  id: string;
  label: string;
}

const DISMISS_KEY = 'tikblox_alerts_dismissed';

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
  const [open, setOpen] = useState(false);
  const [dismissed, setDismissed] = useState(() => {
    try {
      return localStorage.getItem(DISMISS_KEY) === '1';
    } catch {
      return false;
    }
  });
  const [niche, setNiche] = useState(niches[0]?.id || '');
  const [tip, setTip] = useState('');
  const [status, setStatus] = useState('');

  if (dismissed) return null;

  const dismiss = () => {
    setDismissed(true);
    try {
      localStorage.setItem(DISMISS_KEY, '1');
    } catch {
      /* o aviso some mesmo se o navegador bloquear o armazenamento */
    }
  };

  const activate = async () => {
    setTip('');
    setStatus('');
    if (isIos() && !isStandalone()) {
      setTip('No iPhone, abra o Safari, toque em Compartilhar e escolha Adicionar à Tela de Início. Abra o TikBlox por esse ícone e volte aqui.');
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
    setStatus(saved.ok ? 'Alertas ligados.' : 'Não foi possível guardar o alerta.');
  };

  return (
    <div className="rounded-full border border-slate-200 bg-white/90 px-2 py-1 shadow-sm">
      <div className="flex items-center gap-1.5">
        <Bell className="h-3.5 w-3.5 shrink-0 text-[#007A87]" />
        {open ? (
          <>
            {niches.length > 0 ? (
              <select
                value={niche}
                onChange={(event) => setNiche(event.target.value)}
                aria-label="Nicho dos alertas"
                className="h-7 max-w-[9.5rem] rounded-full border border-slate-200 bg-slate-50 px-2 text-[11px] text-slate-800"
              >
                {niches.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
              </select>
            ) : null}
            <button type="button" onClick={activate} className="h-7 rounded-full bg-slate-900 px-2.5 text-[11px] font-bold text-white">
              Ativar
            </button>
          </>
        ) : (
          <button type="button" onClick={() => setOpen(true)} className="h-7 px-1 text-[11px] font-semibold text-slate-700">
            Alertas no celular
          </button>
        )}
        <button type="button" onClick={dismiss} aria-label="Dispensar alertas" className="inline-flex h-7 w-7 items-center justify-center rounded-full text-slate-400">
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
      {tip || status ? <p className="max-w-xs px-1 pb-1 text-left text-[11px] leading-snug text-slate-500">{tip || status}</p> : null}
    </div>
  );
};
