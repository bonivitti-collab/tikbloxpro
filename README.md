# ⚡ TIKBLOX PRO - Radar de Tendências Virais & Produtos do Exterior

TIKBLOX é uma plataforma de inteligência de mercado e mineração de tendências virais em tempo real (EUA, China/Douyin, TikTok Shop, Amazon, AliExpress) projetada para detectar oportunidades com alta margem de lucro e ROI antes da saturação no mercado brasileiro.

---

## 🚀 Tecnologias Utilizadas (Stack)

- **Frontend:** React 19, TypeScript, Tailwind CSS v4, Motion (Framer Motion), Lucide React
- **Visualização & Mapas:** D3.js, TopoJSON (World Atlas)
- **Backend / API:** Node.js, Express, tsx
- **Acesso pago:** Webhook Kiwify com assinatura HMAC-SHA1 e assinantes no Supabase
- **PWA & Offline:** Vite Plugin PWA, Service Workers (Push Notifications, Background Sync, IndexedDB)
- **Desktop:** Electron & Electron Builder (geração de instalador `.exe` para Windows)
- **Bundler:** Vite 6

---

## 🛠️ Como Executar Localmente

### Pré-requisitos
- Node.js >= 20.x
- npm ou bun

### Instalação
```bash
git clone <url-do-repositorio>
cd tikblox-pro
npm install
```

### Rodar em Desenvolvimento (Dev Server)
```bash
npm run dev
```
O app estará acessível em `http://localhost:3000`.

### Variáveis de Ambiente (.env)
Copie `.env.example` para `.env`. O significado de cada variável, o SQL do Supabase e os passos da Kiwify estão em `docs/RELATORIO.md`.

```env
TIKBLOX_AUTH_SECRET=
TIKBLOX_ADMIN_EMAIL=
TIKBLOX_ADMIN_PASSWORD=
TIKBLOX_ADMIN_NAME=
KIWIFY_WEBHOOK_TOKEN=
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
PORT=3000
```

Para simular compra aprovada e reembolso:

```bash
npm run test:webhook
```

---

## 📦 Build e Deploy

### Build para Produção (Web / Full-Stack)
```bash
npm run build
```
Gera a pasta estática `dist/` e o servidor compilado `dist/server.cjs`.

### Executar em Produção
```bash
npm run start
```

### Build do Executável Windows (.exe)
```bash
npm run electron:build
```
Gera o instalador NSIS em `dist-electron/TIKBLOX PRO Setup 1.0.0.exe`.

---

## 🌐 Configuração de Domínio & Deploy na Nuvem

- **Vercel / Netlify:** Build command: `npm run build`, Output directory: `dist`.
- **Docker / Cloud Run / VPS:** Rodar com `node dist/server.cjs` expondo a porta `PORT` configurada.
- **Domínio Personalizado:** Apontar registro DNS `CNAME` para o host da plataforma de hospedagem ou registro `A` para o IP do servidor.
