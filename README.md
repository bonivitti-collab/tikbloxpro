# ⚡ TIKBLOX PRO - Radar de Tendências Virais & Produtos do Exterior

TIKBLOX é uma plataforma de inteligência de mercado e mineração de tendências virais em tempo real (EUA, China/Douyin, TikTok Shop, Amazon, AliExpress) projetada para detectar oportunidades com alta margem de lucro e ROI antes da saturação no mercado brasileiro.

---

## 🚀 Tecnologias Utilizadas (Stack)

- **Frontend:** React 19, TypeScript, Tailwind CSS v4, Motion (Framer Motion), Lucide React
- **Visualização & Mapas:** D3.js, TopoJSON (World Atlas)
- **Backend / API:** Node.js, Express, tsx
- **Inteligência Artificial:** Google Gemini 2.5 Flash / Gemini 3.8 via `@google/genai` (com fallback autônomo offline)
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
Copie `.env.example` para `.env`:
```env
# Opcional (Gratuito): chave do Google AI Studio (https://aistudio.google.com)
GEMINI_API_KEY=

# Opcional (Gratuito): chave Groq Cloud
GROQ_API_KEY=

# Porta do servidor (padrão: 3000)
PORT=3000
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
