# Deploy

Produção roda num app Node.js do cPanel, com MySQL. Segredos (senha do banco, `BETTER_AUTH_SECRET`, senha provisória do admin) nunca entram no Git: ficam só no painel da hospedagem e na pasta local `deploy/`, que é ignorada.

## 1. Banco (cPanel > Bancos de dados MySQL)

- Crie um banco e um usuário com senha forte; dê ao usuário todos os privilégios nesse banco.
- Primeira vez: importe o dump pelo phpMyAdmin, no banco novo e vazio (não no banco do WordPress).
- Não reimporte o dump num banco em uso: ele recria as tabelas e apaga o que houver nelas. Mudanças de esquema depois disso vão por `npm run db:migrar` (ver "Scripts no servidor").

## 2. App (Deploy a Node.js app)

- Node 20.9 ou mais novo.
- Build: `npm run build`. Start: `npm start`. O build lê o banco, então ele precisa estar acessível.
- Variáveis de ambiente (lista completa e comentários em [`.env.example`](../.env.example)):

| Variável | Valor |
|---|---|
| `DATABASE_URL` | `mysql://USUARIO:SENHA@localhost:3306/BANCO`. Dispensável se o painel vincular um banco ao app: nesse caso ele injeta `DB_NAME`, `DB_HOST`, `DB_PORT`, `DB_USER` e `DB_PASSWORD`, que [`lib/db/index.ts`](../lib/db/index.ts) já lê |
| `BETTER_AUTH_SECRET` | valor aleatório longo, só de produção |
| `BETTER_AUTH_URL`, `SITE_URL` | `https://www.acidi.net` |
| `STORAGE` | `disco` (com `UPLOAD_DIR=dados/uploads`), `ftp` (variáveis `FTP_*`) ou `s3` (variáveis `S3_*`) |
| `NODE_ENV` | `production` |
| `RESEND_API_KEY`, `CONTATO_EMAIL_PARA`, `CONTATO_EMAIL_DE` | opcionais: aviso por e-mail das mensagens do site |

Testando num endereço provisório do painel? Coloque esse endereço em `BETTER_AUTH_URL` e `SITE_URL`, senão o login do admin recusa. Depois de apontar o domínio, volte os dois para `https://www.acidi.net`.

## 3. Primeiro acesso ao admin

Crie a conta com `npm run criar-admin -- --nome "..." --email ... --senha "..."` (ver "Scripts no servidor"), ou use a que veio no dump. Entre em `/admin/entrar`; o site obriga a trocar a senha no primeiro login. As outras contas são criadas em Usuários.

## 4. Domínio

Só aponte `www.acidi.net` para o app depois de testar. Os links antigos do WordPress já redirecionam com 301 ([`lib/rotas.ts`](../lib/rotas.ts)). Depois, envie `https://www.acidi.net/sitemap.xml` no Google Search Console.

## Scripts no servidor

`npm run db:migrar` e `npm run criar-admin` leem um arquivo `.env` na pasta do app (`node --env-file=.env`); as variáveis do painel não chegam a eles. Para rodá-los em produção, crie esse `.env` no servidor com as mesmas variáveis do painel, fora do Git, ou rode da sua máquina com um `.env` apontando para o banco de produção, se a hospedagem liberar acesso remoto ao MySQL.

## Cuidados

- Com `STORAGE=disco`, as fotos enviadas pelo admin ficam em `dados/uploads` no servidor. Um novo deploy por upload de zip pode substituir essa pasta e apagar as fotos novas: baixe-a antes, ou faça deploy por Git, que não mexe em `dados/`.
