# TikBlox Pro — acesso, checkout e segurança

Relatório do que mudou neste PR. Nada foi publicado em produção e nada foi mesclado.

## O que mudou

### Admin

O painel de administração saiu, junto com o modal de afiliados e a barra que forjava uma sessão de admin no navegador. O dono continua entrando com e-mail e senha, só que esses dados vêm de variáveis de ambiente. Não há senha, hash nem segredo de sessão no código.

### IA e plano de R$ 57

A terceira aba já não era renderizada, mas o código dela ainda estava no projeto. Saíram o painel, o modal, o endpoint `/api/chat`, a dependência `@google/genai` e os textos de TikBlox AI / Copilot da landing, do schema.org e dos metadados. Ficou um único plano, o Radar Essential de R$ 37/mês.

### Checkout e acesso

Uma compra aprovada na Kiwify grava o e-mail no Supabase. Reembolso, chargeback ou cancelamento de assinatura marcam o e-mail como revogado. Login e “Primeiro acesso” só funcionam para e-mail com assinatura ativa, ou para o dono configurado no ambiente. Pix pendente não libera nada. Um replay do mesmo pedido pago, depois do reembolso, não devolve o acesso. Uma compra nova, com outro `order_id`, libera de novo.

O webhook exige o HMAC-SHA1 da Kiwify: o corpo cru é assinado com `KIWIFY_WEBHOOK_TOKEN` e a assinatura chega em `?signature=`. A comparação é em tempo constante. Sem token, a resposta é 503, não um acesso liberado.

### Sessão

O token é um JWT HMAC-SHA256 com expiração de 7 dias. Ele vai em cookie `HttpOnly`, `SameSite=Lax` e `Secure` quando a requisição é HTTPS (caso da Vercel). O navegador não recebe o token no JSON. A senha do assinante é guardada com scrypt. Há limite de tentativas no login e no webhook.

## Links da Kiwify

| Plano | Preço | Link | O que fazer |
| --- | --- | --- | --- |
| Radar Essential | R$ 37/mês | https://pay.kiwify.com.br/B69SrmS | Manter. É o único checkout do site. |
| Combo PRO + IA | R$ 57/mês | https://pay.kiwify.com.br/ejnXKgn | Desativar no painel da Kiwify. O link saiu do código. |

O link de R$ 57 estava em `KIWIFY_CHECKOUT_COMBO_DEFAULT` e também no botão de upgrade do painel de IA. O de R$ 37 estava em `KIWIFY_CHECKOUT_RADAR_DEFAULT`.

## Hipóteses do webhook

Conferidas no código, sem deploy.

- O 500 em GET e POST vinha da função quebrar ao carregar. Ela importava `api/auth.ts`, que usava `fs` e `os.tmpdir()` e tinha um segredo padrão. Uma falha na carga vira `FUNCTION_INVOCATION_FAILED` antes de qualquer resposta 405. O código compartilhado foi para `lib/`, sem arquivo temporário. GET agora responde 405.
- Os assinantes estavam num JSON em `os.tmpdir()`. Na Vercel isso some a cada instância. Agora ficam na tabela `subscribers`.
- `register`, o login de um e-mail desconhecido e o Google de qualquer conta criavam sessão Pro sem pagamento. Isso acabou.
- O `vercel.json` reescrevia `/(.*)` para `index.html`. Na Vercel a função em `/api` é escolhida antes do rewrite, então isso não explica o 500. O rewrite agora ignora caminhos que começam com `api/`, por garantia.
- `TIKBLOX_AUTH_SECRET` caía num valor fixo que já está no histórico do Git. Sem variável, ou se alguém recolocar aquele valor antigo, a API responde 503 e não assina sessão.

## Variáveis na Vercel

Cadastre em Project Settings → Environment Variables, no ambiente de Production e também em Preview se for testar o preview. Não use prefixo `VITE_` para segredo.

| Variável | Obrigatória | Para que serve |
| --- | --- | --- |
| `TIKBLOX_AUTH_SECRET` | sim | Assina a sessão. Mínimo de 32 caracteres. Gere com `openssl rand -base64 48`. Não reutilize o valor antigo do código. |
| `TIKBLOX_ADMIN_EMAIL` | sim | E-mail do dono. Use o mesmo com o qual você já entra. |
| `TIKBLOX_ADMIN_PASSWORD` | sim | Senha do dono, a que você já usa. Mínimo de 4 caracteres; o recomendado é 12 ou mais. |
| `TIKBLOX_ADMIN_NAME` | não | Nome exibido. Se vazio, usa a parte local do e-mail. |
| `KIWIFY_WEBHOOK_TOKEN` | sim | O mesmo token cadastrado no webhook da Kiwify. Mínimo de 16 caracteres. |
| `SUPABASE_URL` | sim | URL do projeto Supabase do TikBlox, algo como `https://xxxx.supabase.co`. |
| `SUPABASE_SERVICE_ROLE_KEY` | sim | Chave `service_role`. Só no servidor. Nunca no front. |
| `KIWIFY_PRODUCT_ID` | não | Se preenchido, só esses `product_id` (separados por vírgula) liberam acesso. |
| `VITE_KIWIFY_CHECKOUT_ESSENTIAL` | não | Troca o link público de checkout. O padrão já é o Essential. |
| `TELEGRAM_BOT_TOKEN` e `TELEGRAM_CHAT_ID` | não | Só se o alerta de Telegram for usado. O navegador não envia mais o token. |

Depois de salvar, faça um novo deploy. Este PR não dispara esse deploy.

## Supabase, de graça

A conta já tem dois projetos: `encaixe` (ativo) e `antitrader` (inativo). O plano gratuito guarda dois projetos. Não use o banco do Encaixe para o TikBlox. Crie um projeto só do TikBlox; se o limite impedir, apague ou substitua o `antitrader` antes.

1. Crie o projeto na região São Paulo, se quiser.
2. Abra o SQL Editor.
3. Cole e execute o arquivo `supabase/migrations/20261106010000_tikblox_subscribers.sql`.
4. Em Project Settings → API, copie a URL e a chave `service_role` para as variáveis da Vercel.

A tabela `subscribers` tem RLS ligado e nenhuma policy. `anon` e `authenticated` não leem a tabela. Só o servidor, com a service role, grava e consulta. A tabela `auth_attempts` serve ao limite de tentativas.

Para zerar a senha de um assinante sem apagar a compra:

```sql
update public.subscribers
set password_hash = null, updated_at = now()
where email = 'pessoa@email.com';
```

## Kiwify, na mão

1. Desative o produto ou o plano Combo PRO + IA (R$ 57), o checkout `https://pay.kiwify.com.br/ejnXKgn`.
2. Mantenha o Radar Essential (R$ 37), o checkout `https://pay.kiwify.com.br/B69SrmS`.
3. Em Apps → Webhooks, aponte para `https://tikbloxpro.vercel.app/api/webhook/kiwify`. Se o domínio próprio `tikblox.com.br` passar a servir esta mesma Vercel, pode usar `https://tikblox.com.br/api/webhook/kiwify`.
4. No webhook, cadastre um token longo e cole o mesmo valor em `KIWIFY_WEBHOOK_TOKEN`. A Kiwify manda `?signature=` com o HMAC-SHA1 do corpo.
5. Marque os eventos: compra aprovada, compra reembolsada, chargeback, assinatura cancelada e assinatura renovada. Pix gerado e boleto gerado são ignorados de propósito.
6. O comprador entra com o mesmo e-mail da compra. No primeiro acesso ele define a senha. O Google só entra se esse e-mail já estiver ativo.

Quem já comprou antes desta mudança não está no Supabase. Ou a pessoa compra de novo, ou você insere o e-mail:

```sql
insert into public.subscribers (email, name, plan, status)
values ('cliente@email.com', 'Nome', 'essential', 'active');
```

As contas `contato.dudavitti@gmail.com` e `dudavitti@gmail.com` estavam fixas no código, com papel de creator. Saíram. Se ainda precisarem entrar, insira o e-mail como assinante ativo e peça um primeiro acesso. Troque a senha antiga: o hash está no histórico do Git.

## Como testar

`npm run test:webhook` simula, sem rede e sem Supabase:

- assinatura oficial da Kiwify
- assinatura inválida (401) e GET (405)
- compra paga libera
- login e cadastro sem pagamento recusam
- primeiro acesso define a senha e grava cookie HttpOnly
- reembolso e cancelamento revogam
- replay do mesmo pedido não restaura
- compra nova libera de novo
- Pix pendente não cria assinante
- login do dono pela senha do ambiente

`npm run build` concluiu. `npx tsc --noEmit` concluiu.

## Segurança

### Corrigido neste PR

- Segredo de sessão com valor padrão público.
- Hashes de senha de dono e de creator no repositório.
- Sessão paga sem pagamento, inclusive por Google e por cadastro.
- Sessão forjada no navegador (barra de auditoria e token guardado no `localStorage`).
- Webhook sem assinatura e base de assinantes efêmera.
- CORS `*` na autenticação, no webhook e no scan.
- Endpoint de chat que aceitava chave de IA vinda do navegador.
- Token de bot do Telegram enviado pelo navegador. O valor que estava no modal era um placeholder, não um token real, e foi removido.
- Cabeçalhos: CSP, HSTS, COOP, Permissions-Policy, nosniff, frame SAMEORIGIN, referrer.

### O que ainda fica, por severidade

**Alta.** O catálogo de produtos continua dentro do JavaScript do site. A tela de login barra o visitante comum, mas quem lê o bundle vê os dados sem pagar. Tirar isso do bundle e servir o catálogo só com sessão válida é outra mudança, e mexe no modo offline.

**Alta, no histórico.** O commit `21db788` ainda tem o segredo antigo de sessão e os hashes SHA-256. Este PR não reescreve a história. Gere um `TIKBLOX_AUTH_SECRET` novo e troque a senha do dono se ela for a mesma daquela época. Os hashes não estão repetidos aqui.

**Média.** Até o comprador definir a senha, alguém que saiba o e-mail da compra pode fazer o primeiro acesso antes dele. O Google, se estiver configurado, prova o e-mail. Para desfazer, zere `password_hash` no SQL acima.

**Média.** O limite de tentativas vale por instância e, quando a tabela existir, também no Supabase. Não é um limite global perfeito antes da migration.

**Média.** `subscription_late` (assinatura atrasada) não revoga. Só reembolso, chargeback e cancelamento revogam. Se quiser cortar no atraso, dá para incluir esse evento depois.

**Baixa.** `npm audit` ainda aponta 10 avisos que só saem com mudança quebrada: `firebase` / `@grpc/grpc-js` (alto, no cliente de Firestore que o app não usa como servidor gRPC; o `npm audit fix --force` queria descer o Firebase para a versão 9) e `glob` / `minimatch` / `deepmerge` via `vite-plugin-pwa` (moderado, ferramenta de build). `body-parser`, `vite`, `qs` e `re2js` foram atualizados sem forçar major.

**Baixa.** O `aggregateRating` do schema.org (nota 4,9 e 1240 avaliações) não tem fonte verificável. Não é um vazamento, é um dado de marketing antigo.

**Baixa.** O Client ID OAuth do Google em `firebase-applet-config.json` é identificador público. A `apiKey` do Firebase está vazia. Nenhuma chave `service_role`, segredo de sessão ou link de R$ 57 aparece no bundle do front. O link de R$ 37 aparece, porque o botão de compra é público.

**Baixa.** CSP permite estilo inline, porque a página e o Tailwind usam isso. Script inline não está liberado.
