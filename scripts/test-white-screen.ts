/**
 * Reproduz a tela branca depois do login.
 * O terminal monta com produto nulo e, quando /api/catalog responde,
 * passa a renderizar o item. Um useMemo depois de um return antecipado
 * quebrava o React ("Rendered more hooks than during the previous render")
 * e derrubava a árvore inteira.
 */
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import React from 'react';
import { createRoot, Root } from 'react-dom/client';

const require = createRequire(import.meta.url);
const { JSDOM } = require('jsdom') as typeof import('jsdom');

const product = JSON.parse(
  readFileSync(new URL('./fixtures/post-login-product.json', import.meta.url), 'utf8')
);

const session = {
  email: 'assinante@kiwify.test',
  name: 'Assinante Radar',
  plan: 'essential',
  role: 'subscriber',
  isAuthenticated: true,
  subscriptionStatus: 'active',
  source: 'kiwify',
};

function installDom() {
  const dom = new JSDOM('<!doctype html><html><body><div id="root"></div></body></html>', {
    url: 'https://tikbloxpro.vercel.app/',
    pretendToBeVisual: true,
  });
  const { window } = dom;
  globalThis.window = window as unknown as Window & typeof globalThis;
  globalThis.document = window.document;
  globalThis.HTMLElement = window.HTMLElement;
  globalThis.Element = window.Element;
  globalThis.Node = window.Node;
  globalThis.localStorage = window.localStorage;
  globalThis.getComputedStyle = window.getComputedStyle.bind(window);
  globalThis.requestAnimationFrame = (cb: FrameRequestCallback) =>
    setTimeout(() => cb(Date.now()), 0) as unknown as number;
  globalThis.cancelAnimationFrame = (id: number) => clearTimeout(id);
  window.matchMedia = () =>
    ({
      matches: true,
      media: '',
      onchange: null,
      addListener() {},
      removeListener() {},
      addEventListener() {},
      removeEventListener() {},
      dispatchEvent() {
        return false;
      },
    }) as unknown as MediaQueryList;
  class NoopObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
  window.ResizeObserver = NoopObserver as unknown as typeof ResizeObserver;
  window.IntersectionObserver = NoopObserver as unknown as typeof IntersectionObserver;
  window.scrollTo = () => {};
  if (!window.requestIdleCallback) {
    window.requestIdleCallback = (cb: IdleRequestCallback) =>
      setTimeout(() => cb({ didTimeout: false, timeRemaining: () => 50 } as IdleDeadline), 0) as unknown as number;
  }
  return window;
}

function setNativeValue(el: HTMLInputElement, value: string) {
  const prototype = window.HTMLInputElement.prototype;
  const descriptor = Object.getOwnPropertyDescriptor(prototype, 'value');
  descriptor?.set?.call(el, value);
  el.dispatchEvent(new window.Event('input', { bubbles: true }));
}

function text() {
  return (document.body?.textContent || '').replace(/\s+/g, ' ').trim();
}

async function flush(ms = 30) {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

async function testTerminalSurvivesCatalogArrival() {
  const { ProductDetailTerminal } = await import('../src/components/ConvictionTerminal/ProductDetailTerminal.tsx');
  const root = createRoot(document.getElementById('root')!);
  const props = {
    onToggleSave() {},
    isSaved: false,
    onOpenCalculator() {},
  };
  root.render(React.createElement(ProductDetailTerminal, { ...props, product: null }));
  await flush();
  assert(text().includes('Nenhum produto selecionado'), 'estado vazio do terminal não apareceu');

  root.render(React.createElement(ProductDetailTerminal, { ...props, product }));
  await flush();
  assert(
    text().includes(product.name),
    `produto do catálogo de produção não renderizou: ${text().slice(0, 180)}`
  );
  root.unmount();
}

async function testErrorBoundaryIsVisible() {
  const { ErrorBoundary } = await import('../src/components/ErrorBoundary.tsx');
  function Boom(): React.ReactElement {
    throw new Error('falha de render');
  }
  const root: Root = createRoot(document.getElementById('root')!);
  root.render(React.createElement(ErrorBoundary, null, React.createElement(Boom)));
  await flush();
  const alert = document.querySelector('[role="alert"]') as HTMLElement | null;
  assert(alert, 'ErrorBoundary não pintou nenhum alerta');
  assert(text().includes('Não foi possível abrir o radar'), `mensagem amigável ausente: ${text().slice(0, 180)}`);
  assert(
    (alert.style.background || '').includes('1A1D27') || (alert.style.background || '').includes('rgb'),
    'a tela de erro depende só de classe CSS e pode voltar a ficar branca'
  );
  root.unmount();
}

async function testLoginThenDelayedCatalog() {
  let releaseCatalog: () => void = () => {};
  const catalogReady = new Promise<void>((resolve) => {
    releaseCatalog = resolve;
  });

  globalThis.fetch = async (input: RequestInfo | URL) => {
    const url = String(input);
    if (url.includes('/api/auth')) {
      return new Response(JSON.stringify({ success: true, session }), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      });
    }
    if (url.includes('/api/catalog')) {
      await catalogReady;
      return new Response(JSON.stringify({ success: true, products: [product] }), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      });
    }
    return new Response(JSON.stringify({ ok: false }), { status: 404 });
  };

  const { default: App } = await import('../src/App.tsx');
  const { LanguageProvider } = await import('../src/i18n/LanguageContext.tsx');
  const { ErrorBoundary } = await import('../src/components/ErrorBoundary.tsx');
  const root = createRoot(document.getElementById('root')!);
  root.render(
    React.createElement(ErrorBoundary, null, React.createElement(LanguageProvider, null, React.createElement(App)))
  );
  await flush(80);

  const enter = [...document.querySelectorAll('button')].find((button) =>
    /Já sou assinante/.test(button.textContent || '')
  );
  assert(enter, 'botão de login da landing não apareceu');
  enter.click();
  await flush(40);

  const email = document.getElementById('auth-email-input') as HTMLInputElement | null;
  const password = document.getElementById('auth-password-input') as HTMLInputElement | null;
  assert(email && password, 'formulário de login não abriu');
  setNativeValue(email, session.email);
  setNativeValue(password, 'senha-teste');
  email.closest('form')?.dispatchEvent(new window.Event('submit', { bubbles: true, cancelable: true }));
  await flush(80);

  assert(
    text().includes('Nenhum produto selecionado') || text().includes('Tendências'),
    `depois do login o app não montou: ${text().slice(0, 240)}`
  );
  assert(!text().includes('Não foi possível abrir o radar'), 'o login caiu na tela de erro antes do catálogo');

  releaseCatalog();
  await flush(250);

  assert(text().includes(product.name), `catálogo de produção não apareceu depois do login: ${text().slice(0, 240)}`);
  assert(!text().includes('Não foi possível abrir o radar'), 'a chegada do catálogo derrubou o painel');
  root.unmount();
}

async function main() {
  const errors: string[] = [];
  installDom();
  window.addEventListener('error', (event) => {
    errors.push(event.error?.message || event.message);
  });
  const originalError = console.error;
  console.error = (...args: unknown[]) => {
    const message = args.map((item) => (item instanceof Error ? item.message : String(item))).join(' ');
    if (/Rendered more hooks|Error Boundary caught|falha de render/.test(message)) {
      errors.push(message);
    }
    if (!/Error Boundary caught|falha de render|The above error occurred/.test(message)) {
      originalError(...args);
    }
  };

  await testTerminalSurvivesCatalogArrival();
  await testErrorBoundaryIsVisible();
  await testLoginThenDelayedCatalog();

  const hooksCrash = errors.find((message) => message.includes('Rendered more hooks'));
  if (hooksCrash) {
    throw new Error(hooksCrash);
  }
  console.log('test:white-screen ok');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
