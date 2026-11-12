# ACIDI · site e painel

Site da Associação Empresarial de Indaial (ACIDI) e o painel `/admin` que edita o conteúdo.

Outros documentos:

- [`docs/DEPLOY.md`](docs/DEPLOY.md): como publicar (cPanel, MySQL, variáveis de ambiente)
- [`docs/CONTEUDO.md`](docs/CONTEUDO.md): fontes do conteúdo, decisões e pendências
- [`docs/DIRECAO.md`](docs/DIRECAO.md): direção de arte e regras de movimento
- `docs/historico/`: planos e specs de cada fase, só para consulta

## Como abrir

O site é um app [Next.js](https://nextjs.org) (App Router, TypeScript) com banco MySQL. Precisa do Node.js 24 ou mais novo para desenvolver e do Docker (para o MySQL local).

```bash
npm install
cp .env.example .env          # troque BETTER_AUTH_SECRET por um valor aleatório longo
docker compose up -d          # MySQL em localhost:3307 (bancos acidi e acidi_teste)
npm run db:migrar             # cria as tabelas
npm run db:carga              # copia o conteúdo inicial (notícias, agenda, diretoria, ex-presidentes)
npm run criar-admin -- --nome "Seu Nome" --email voce@acidi.net --senha "senha com 10 ou mais"
npm run criar-usuarios-teste   # opcional, só em banco local: admin@, revisor@ e editor@acidi.test (senha <papel>-local-123)
npm run dev
```

Depois abra `http://localhost:3000/` (site) e `http://localhost:3000/admin` (painel). Para a versão de produção (a mesma usada nos testes): `npm run build` e `npm start`. O build lê o banco para pré-gerar as páginas, então o MySQL precisa estar no ar.

## Admin

Em `/admin`, quem tem conta edita o conteúdo sem mexer em código. Cada papel vê só o que pode usar:

| Papel | Pode |
|---|---|
| Editor | escrever notícias (vão para revisão antes de sair) e cuidar da agenda |
| Revisor | revisar, devolver com comentário, publicar e despublicar notícias; cuidar da agenda |
| Admin | tudo isso, mais páginas, mensagens de contato, diretoria, ex-presidentes e usuários |

Não há cadastro público: o admin cria cada conta com uma senha provisória, que a pessoa troca no primeiro acesso. Ao publicar, a página afetada do site é regerada na hora, sem novo build.

Fotos enviadas são reduzidas para 1600 px e gravadas em `UPLOAD_DIR` (padrão `dados/uploads`, servidas em `/uploads/...`), numa pasta via FTP com `STORAGE=ftp` e as variáveis `FTP_*`, ou num bucket compatível com S3 com `STORAGE=s3` e as variáveis `S3_*` do `.env.example` (necessário na Vercel, que não tem disco persistente; o Supabase Storage serve, com um bucket público).

O site funciona sem internet: as fontes Archivo e Public Sans estão embutidas em `public/assets/fonts` (licença SIL OFL 1.1). Só os links externos (WhatsApp, redes sociais, mapa e sistemas de parceiros) precisam de conexão.

## Páginas

| Página | Rota |
|---|---|
| Início | `/` |
| A ACIDI / Histórico | `/historico` |
| Diretoria | `/diretoria` |
| Ex-Presidentes | `/ex-presidentes` |
| Representatividade | `/representatividade` |
| Núcleos | `/nucleos` |
| Para seu negócio | `/para-seu-negocio` (âncoras `#util-card`, `#uniodonto`, `#boa-vista-scpc`, `#certificado-de-origem`, `#treinamentos-e-palestras`, `#protesto-expresso`, `#xml-empresarial`, `#auditorio-e-salas`) |
| Notícias | `/noticias` + 10 matérias em `/noticias/<slug>` |
| Agenda | `/agenda` (próximos eventos e `#arquivo`) |
| Auditório e salas | `/auditorio` |
| Associe-se | `/associe-se` |
| Contato | `/contato` (aceita `?assunto=uniodonto` etc.) |
| Páginas criadas no admin | `/<slug>` (`app/(site)/[pagina]`) |

Os endereços antigos (`agenda.html`, `noticia-<slug>.html`...) redirecionam com 301 para as rotas novas, mantendo `?assunto=` e âncoras.

## Estrutura

```text
app/(site)/             site público: uma pasta por rota (page.tsx); layout.tsx tem o <head> e carrega o site.js
app/(site)/admin/previa/  pré-visualização de notícias e páginas antes de publicar (usa o layout do site)
app/(admin)/admin/      painel: entrar, trocar senha e (painel)/ com notícias, páginas, agenda, contatos, diretoria, ex-presidentes e usuários
app/api/auth/           rotas do Better Auth (login)
app/api/contato/        recebe as mensagens dos formulários do site
app/uploads/            serve as fotos enviadas pelo admin (STORAGE=disco)
components/site/        Header, Footer, Molde, Artigo e blocos do site público
components/admin/       telas e formulários do painel
components/ui/          componentes básicos (shadcn); components/Ico.tsx tem os ícones, usados pelos dois lados
content/                serviços, galeria do auditório, benefícios e assuntos de contato (ainda em arquivo, até a Fase 3)
lib/content.ts          única porta de entrada do conteúdo para as páginas; notícias, agenda e diretoria vêm do banco
lib/db/                 esquema Drizzle (conteúdo + tabelas do Better Auth) e conexão; drizzle/ tem as migrações
lib/admin/              regras do painel (permissões, fluxo da notícia, validação) sem dependência do Next
lib/auth.ts             configuração do Better Auth; lib/auth-servidor.ts dá a sessão às páginas do admin
lib/storage.ts          upload de imagens (disco, FTP ou S3)
lib/email.ts            aviso por e-mail das mensagens de contato (Resend, opcional)
scripts/                carga inicial (scripts/dados/), importar-wp, criar-admin e criar-usuarios-teste
docker/, docker-compose.yml  MySQL local de desenvolvimento e testes
proxy.ts                manda quem não tem sessão de /admin para /admin/entrar
lib/rotas.ts            URLs .html antigas -> rotas novas (redirects do next.config.ts)
public/assets/css/      site.css (tokens do protótipo) e fonts.css
public/assets/fonts/    Archivo e Public Sans (woff2, latin e latin-ext) e licenças OFL
public/assets/js/site.js  menus, agenda por data e validação dos formulários (sem mudanças desde a versão estática)
public/assets/img/      fotos e logos fornecidos pela ACIDI
public/assets/video/    filme "Ponto de encontro" otimizado para a web e pôsteres
motion/ponto-de-encontro/  fonte HyperFrames do filme (editar e renderizar: ver o LEIAME de lá)
testes/                 testes de lógica, links, paridade e jornadas em navegador
docs/                   DEPLOY, CONTEUDO, DIRECAO e historico/ (ver o topo deste arquivo)
dados/, deploy/         fora do Git: fotos enviadas e pacote de deploy (com segredos)
```

Notícias, eventos, diretoria e ex-presidentes são editados pelo `/admin`. Textos institucionais ficam no `page.tsx` de cada rota. Estilos e scripts são editados diretamente em `public/assets/`.

Os links internos usam `<a>` comum, não `next/link`: o `site.js` age sobre o HTML de cada carregamento de página e não rodaria de novo numa navegação feita pelo React.

## Testes

Regras sem banco e testes com MySQL (o `npm run test:db` usa o `.env.test`: copie o `.env` e aponte `DATABASE_URL` e `TEST_DATABASE_URL` para `acidi_teste`):

```bash
npm test
npm run test:db
```

Com o site rodando em produção (`npm run build && npm start`):

```bash

PYTHONIOENCODING=utf-8 python testes/admin.py      # jornada do admin; ADMIN_EMAIL/ADMIN_SENHA de uma conta criada com criar-admin
python testes/verificar_links.py
PYTHONIOENCODING=utf-8 python testes/jornadas.py
python testes/comparar.py depois http://127.0.0.1:3000/
python testes/movimento.py http://127.0.0.1:3000/
```

Os testes em Python exigem o pacote `playwright` e o Microsoft Edge instalado. `comparar.py`, `capturar.py` e `movimento.py` gravam capturas em `docs/comparativo/` e `docs/gravacoes/`, que ficam fora do Git.

`testes/paridade.py` compara o HTML de cada rota com o de outra versão do site. Na Fase 2 a referência foi o main de antes do banco (`9d94389`), em produção na porta 3001:

```bash
git worktree add ../acidi-site-ref 9d94389
cd ../acidi-site-ref && npm ci && npm run build && npx next start -p 3001
python testes/paridade.py http://127.0.0.1:3001/ http://127.0.0.1:3000/
```

Para comparar com o site estático da Fase 1, sirva o commit `baffbb2` com `python -m http.server 8766 --bind 127.0.0.1 -d ../acidi-site-ref` e use `http://127.0.0.1:8766/` como primeira URL.
