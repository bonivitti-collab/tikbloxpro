# Auditoria de lançamento — TikBlox Pro

Data: 6 de novembro de 2026. Base: `main` em produção (`tikbloxpro.vercel.app`). Este arquivo lista o que foi conferido, o que este PR corrigiu e o que ainda impede o modo vitrine.

Prioridade: **bloqueio** (não vender até resolver), **importante**, **depois**.

## 1. Dados inventados

| Item | Onde | Estado | Notas |
| --- | --- | --- | --- |
| Score 91–99 a partir de `viralityScore` e piso de onda | `tiktokShopEnricher.ts` | corrigido | Score só existe com vídeo medido em produto ao vivo. Fórmula: `95 − vídeos`, limitado a 5–95. Sem vídeo: “sem score”. |
| “Risco Mínimo”, “Entrada forte”, “compra de amostra validada” | Raio-X e carrossel da landing | corrigido | Veredito segue a contagem: poucos vídeos, concorrência baixa/média ou feed cheio. |
| Dias no radar, “janela de N dias” e saturação sorteados pelo id | `ProductDetailTerminal.tsx` | corrigido | A data é a da coleta. A barra é `vídeos / 50`. Não há previsão de dias. |
| Fallback “48.5M views” | Raio-X | corrigido | Ao vivo mostra a venda coletada ou “vendas não informadas”. Exemplo diz que não foi medido. |
| Produto manual com 15.4M views, 1850 vendas, score 96, margem 280% | `AddCustomProductModal.tsx` | corrigido | Usa o preço e a comissão digitados. Views e margem não são inventadas. |
| “Break-even em 3 vendas” e “Risco Mínimo” na landing | `LandingPage.tsx` | corrigido | O card passou a descrever a simulação. |
| Casos com views, pedidos e comissão na landing | `SocialProofSection.tsx` | rotulado | Faixa marcada como ilustração, não resultado de cliente. Os números continuam no código como exemplo. |
| Catálogo curado (`src/data/niches`, milhões de views, margem 310%, “hoje”) | servido pelo `/api/catalog` | corrigido no radar pago | `listCatalog` não mistura mais esses itens. O arquivo continua no repositório para a taxonomia e testes. |
| “zera em N” | card | mantido, com fórmula | `ceil(menor preço / comissão nesse preço)`. Não é venda medida. |
| Faixa de preço ±15% | coleta | já existia | Marcada “estimado” quando a fonte manda um preço só. |
| Gancho de 3 segundos e “por que vende no Brasil” | curado e fallback do enriquecedor | pendente, importante | Texto de apoio, não medição. Some do radar pago junto com o catálogo de exemplo. No produto manual o texto diz que não foi medido. |
| Garantia de 7 dias na landing | `LandingPage.tsx` | pendente, importante | Confirmar se a oferta da Kiwify realmente tem esses 7 dias antes de anunciar. |

## 2. Segurança

| Item | Estado | Notas |
| --- | --- | --- |
| Sessão HMAC-SHA256, cookie HttpOnly, SameSite=Lax, Secure em produção, 7 dias | ok | Segredo mínimo de 32 caracteres. Hash vazado conhecido é recusado. |
| Senha scrypt | ok | `lib/passwords.ts`. |
| Rate limit de login (30 / 15 min por IP) | ok | Memória da instância. Não é compartilhado entre réplicas. |
| CSRF | ok para o desenho atual | POST JSON com cookie Lax não segue em site de terceiro. Não há token extra. |
| `/api/catalog`, `/api/creators`, `/api/scan`, `/api/tiktok-verify` exigem sessão paga | ok | |
| `/api/chat` | ok | Responde 410. A IA foi removida. |
| `/api/cron/ingest` | ok | Exige `Authorization: Bearer` igual a `CRON_SECRET` (mínimo 16). |
| Webhook Kiwify | ok | HMAC-SHA1 do corpo cru. Teste em `scripts/test-kiwify-access.ts`. |
| Porta Kalodata `KALODATA_PUBLIC_DISPLAY` | ok e é bloqueio de produto | Em produção está `false`. Assinante comum não recebe linhas Kalodata. Ver bloqueios. |
| RLS nas 6 tabelas, sem policy para anon | aceito | O banco só é lido com a service role no servidor. O aviso do linter é esse desenho, não uma policy aberta. |
| `products_keep_first_seen` com `search_path` fixo | corrigido | Migration `20261106180000`. |
| Service role e segredos no bundle do browser | ok | Não há `VITE_` de segredo. `firebase-applet-config.json` está com `apiKey` vazio. |
| Cabeçalhos | ok | CSP, HSTS, `X-Frame-Options`, `nosniff`, `Referrer-Policy`, `Permissions-Policy` em `vercel.json`. |
| `npm audit` | pendente, depois | 0 críticas, 4 altas (Firebase/`grpc` que o app não usa mais na prática), 4 moderadas em tooling. Não atualizei Firebase neste PR para não reabrir a IA. |
| `GEMINI_API_KEY` ainda na Vercel | pendente, importante | A funcionalidade saiu. A chave pode ser apagada no painel. |
| Recuperação de senha | pendente, importante | Não existe fluxo. O acesso do assinante nasce no webhook da Kiwify. |
| Cadastro dentro do app | não há | A compra é na Kiwify. Login compara a senha gravada ou a senha do dono nas env vars. |

## 3. APIs e coleta

| Item | Estado | Notas |
| --- | --- | --- |
| Teto Kalodata (`KALODATA_MAX_CREDITS_PER_RUN=1`) e trava diária `ingest_runs` | ok | Erro depois da reserva responde 200 para a Vercel não repetir e gastar crédito. |
| Timeout das chamadas Kalodata 20s, saldo 15s | ok | |
| Apify | opcional | Só roda se `APIFY_TOKEN` existir. Teto `APIFY_MAX_RESULTS=10` e `APIFY_MAX_CHARGE_USD=0.20`. |
| Falha de fonte | ok | Catálogo ao vivo vazio não inventa mais a lista curada. A tela mostra o estado vazio. |
| Log | ok | `console.error` com prefixo `[CATALOG]`, `[KALODATA]`, `[INGEST]`. Não há APM. |

## 4. Pagamento

Webhook assinado libera e revoga assinante no Supabase (`subscribers`). Reembolso e chargeback tiram o acesso. Não há painel admin: o dono entra com `TIKBLOX_ADMIN_EMAIL` / `TIKBLOX_ADMIN_PASSWORD`.

## 5. Front, busca, legal

| Item | Estado | Notas |
| --- | --- | --- |
| Busca | ok | `normalizePt` tira acento. Não corrige erro de digitação. |
| Termos e privacidade | corrigido | `/termos` e `/privacidade`, link no rodapé. Sem CNPJ inventado. |
| Celular | parcial | A lista e o Raio-X cabem melhor depois dos PRs de densidade. Não houve passe novo de vitals neste audit. |
| SEO | pendente, depois | Meta da landing existe. Não medi Lighthouse. |
| Uso da Kalodata | bloqueio | A flag pública está falsa de propósito, até consentimento escrito. Não ligar `KALODATA_PUBLIC_DISPLAY` sem isso. |

## 6. Operação

Env de produção conferidas (nomes, sem valores): `KALODATA_API_KEY`, `KALODATA_PUBLIC_DISPLAY=false`, `KALODATA_MAX_CREDITS_PER_RUN=1`, `APIFY_TOKEN`, `APIFY_MAX_RESULTS=10`, `APIFY_MAX_CHARGE_USD=0.20`, `CRON_SECRET`, `KIWIFY_WEBHOOK_TOKEN`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `TIKBLOX_AUTH_SECRET`, `TIKBLOX_ADMIN_EMAIL`, `TIKBLOX_ADMIN_PASSWORD`, `GEMINI_API_KEY` (sobrando).

Cron: `0 9 * * *` = 06:00 em Brasília (UTC−3, sem horário de verão).

Backup e monitoramento de erro: pendente, importante. O plano free do Supabase não substitui um backup testado. Não há Sentry.

## Bloqueios que continuam

1. **Kalodata não aparece para o assinante comum.** Com a flag em `false`, o radar pago fica só com o que a Apify mediu (poucas linhas por dia). Ligar a flag é decisão jurídica, não um interruptor deste PR.
2. **Garantia de 7 dias** na landing precisa bater com a oferta real da Kiwify.
3. **Ilustrações da landing** ainda mostram números de exemplo. Estão rotuladas, mas uma página de venda não deveria depender delas.
