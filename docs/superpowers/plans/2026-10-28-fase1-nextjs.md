# Fase 1: Site público em Next.js — Plano de implementação

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Servir o site atual da ACIDI, com HTML idêntico, a partir de um app Next.js com conteúdo em arquivos de dados.

**Architecture:** App Router na raiz do repo, só Server Components, geração estática. A moldura (`head`/`header`/`footer`) vira `app/layout.tsx`. Os blocos do gerador viram componentes, e as listas viram `content/*.ts` lidas apenas por `lib/content.ts`. O `site.js` é carregado sem mudanças. A paridade é provada por `testes/paridade.py`, que compara o DOM sem JS do site antigo com o do novo, rota a rota.

**Tech Stack:** Next.js (versão estável mais recente) + React + TypeScript, Node 24 (`node --test` com type stripping), Python + Playwright (Edge) para os testes já existentes.

**Spec:** `docs/superpowers/specs/2026-10-28-fase1-nextjs-design.md`

## Global Constraints

- Nenhuma mudança visual, de texto ou de comportamento. O HTML de cada rota deve bater com o do `gerar_site.py` (classes, ids, `data-*`, `aria-*`, ordem dos elementos).
- Sem Tailwind, sem biblioteca de UI, sem dependência além de `next`, `react`, `react-dom`, `typescript`, `@types/*`.
- Todos os componentes são Server Components: nenhum `'use client'`, `useState` ou `useEffect` na Fase 1.
- Links internos usam `<a href>`, nunca `next/link`.
- Assets em `public/assets/...`, sempre referenciados com caminho absoluto (`/assets/img/x.jpg`).
- `site.js` não muda (só é movido para `public/assets/js/site.js`).
- Sufixo de título: `' · ACIDI – Associação Empresarial de Indaial'`. `lang="pt-BR"`, `theme-color` `#0B3D24`.
- Páginas não importam `content/`, só `lib/content.ts`.
- Mensagens de commit em português, com a linha `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.

## Review Focus

1. **Escape de texto:** títulos e alt com aspas curvas, `–`, `&` e acentos devem sair iguais ao `html.escape` do gerador. Isso é coberto por `paridade.py` em todas as rotas (Tasks 1–7).
2. **`hidden` na agenda da home:** eventos passados ficam `hidden` pela data do build. A paridade compara com um build feito no mesmo dia (Task 5).
3. **Slug inexistente** (`/noticias/nao-existe`) deve dar 404, não página vazia: `dynamicParams = false` (Task 6).
4. **Links antigos com âncora** (`agenda.html#evento-2022-05-18-...`, `para-seu-negocio.html#util-card`) devem chegar ao destino com o hash (Task 8).
5. **Erros de hidratação** quando o `site.js` mexe no DOM (agenda reordenada, `aria-expanded`, classe `js` no `<html>`): console sem erros em todas as rotas, com JS ligado (Tasks 1 e 8).

---

## Estrutura de arquivos

```
app/layout.tsx                    <html>, <head> (fontes, css, script 'js'), Header, <main>, Footer, <Script site.js>
app/page.tsx                      home
app/{historico,diretoria,ex-presidentes,representatividade,nucleos,para-seu-negocio,
     noticias,agenda,auditorio,associe-se,contato}/page.tsx
app/noticias/[slug]/page.tsx
components/Ico.tsx                ícones (objeto P do gerador) + Ico, Ext
components/Header.tsx             header(page) + menu móvel
components/Footer.tsx
components/blocos.tsx             Crumbs, PageHead, EventItem, Story, JoinBox, DemoNotice, Field, FormEnd
content/{servicos,eventos,noticias,diretoria,ex-presidentes,auditorio,associacao,contato,links}.ts
lib/types.ts                      tipos do conteúdo
lib/datas.ts (+ datas.test.ts)    dlong, dshort, evId
lib/content.ts                    get*() assíncronos
lib/rotas.ts (+ rotas.test.ts)    tabela html antigo -> rota nova
next.config.ts                    redirects gerados de lib/rotas.ts
testes/paridade.py                comparação de DOM antigo x novo
```

---

### Task 1: Projeto Next, moldura e harness de paridade

**Files:**
- Create: `package.json`, `tsconfig.json`, `next.config.ts`, `app/layout.tsx`, `app/historico/page.tsx`, `components/Ico.tsx`, `components/Header.tsx`, `components/Footer.tsx`, `content/links.ts`, `testes/paridade.py`
- Move: `assets/` → `public/assets/` (`git mv`)
- Modify: `.gitignore` (adicionar `.next/`, `node_modules/`, `next-env.d.ts`)

**Interfaces:**
- Produces:
  - `Ico({ n, cls = 'ico' }: { n: IconName; cls?: string })` e `type IconName = keyof typeof P`
  - `Ext({ href, children, cls = '' })`, igual a `ext()` do gerador
  - `Header({ page }: { page: PageKey })` com `type PageKey = 'index' | 'historico' | 'diretoria' | 'ex-presidentes' | 'representatividade' | 'nucleos' | 'para-seu-negocio' | 'noticias' | 'noticia' | 'agenda' | 'auditorio' | 'associe-se' | 'contato'`
  - `content/links.ts`: `WHATS`, `MAPA`, `INSTA`, `FACE`, `ENDERECO` (valores copiados do gerador)
  - `SUF` exportado de `app/layout.tsx`, ou de `lib/meta.ts` se o layout não puder exportar
  - `testes/paridade.py ANTIGO NOVO [rota ...]`: sai com código 0 se todas as rotas batem

- [ ] **Step 1: Criar a referência do site antigo**

```bash
git worktree add ../acidi-site-ref HEAD
```
Em outro terminal: `python -m http.server 8766 --bind 127.0.0.1 -d ../acidi-site-ref`. Essa é a URL ANTIGA de todos os testes de paridade até a Task 9.

- [ ] **Step 2: Escrever `testes/paridade.py`**

Playwright com Edge e **JavaScript desabilitado** (`java_script_enabled=False`). Para cada par (`arquivo.html` → rota, vindo de um dicionário igual a `ROTAS` da Task 8):
- abre as duas URLs e extrai `title`, `meta[name=description]` e `document.body.innerHTML`, depois de remover `script`, `next-route-announcer` e os nós que o Next injeta (`[id^="__next"]`, `template`);
- no lado antigo, troca `href="x.html"` → `href="/x"`, `href="noticia-s.html"` → `href="/noticias/s"`, `href="index.html"` → `href="/"`, `src="assets/` e `href="assets/` → `/assets/` (inclui `poster` e `srcset`);
- normaliza espaços entre tags (`>\s+<` → `><`) e sequências de espaço → um espaço;
- em divergência, imprime `difflib.unified_diff` das duas versões quebradas em `>` e marca FALHOU. No fim, `sys.exit(1)` se algo falhou.

Rotas sem argumentos = todas.

- [ ] **Step 3: Rodar contra um Next inexistente e ver falhar**

Run: `python testes/paridade.py http://127.0.0.1:8766/ http://127.0.0.1:3000/ historico.html`
Expected: FALHOU (conexão recusada ou 404)

- [ ] **Step 4: Criar o app**

`npm init -y`, depois `npm i next react react-dom` e `npm i -D typescript @types/react @types/node`. Scripts: `dev`, `build`, `start`, `test` (`node --test lib/`). `git mv assets public/assets`.

`app/layout.tsx` reproduz `head()` + `header()` + `footer()`:
- `<html lang="pt-BR" suppressHydrationWarning>`, porque o script inline adiciona a classe `js` antes da hidratação;
- no `<head>`: viewport, theme-color, favicon, `<script dangerouslySetInnerHTML={{__html:"document.documentElement.className += ' js';"}} />`, os dois `<link rel="stylesheet">`;
- no `<body>`: skip link, `{children}` (cada página renderiza o próprio `<Header page=…/>`, o `<main id="conteudo">` e o `<Footer/>`, porque `page` varia), e `<Script src="/assets/js/site.js" strategy="afterInteractive" />`.

`Header`/`Footer` são tradução 1:1 do gerador. `cur()` vira uma comparação com `page`. NAV_ACIDI/NAV_NEG ficam em `components/Header.tsx`, e NAV_NEG lê `getServicos()` a partir da Task 2. Até lá, os 5 primeiros serviços ficam inline com `// shortcut: trocar por getServicos() na Task 2`.

`app/historico/page.tsx`: `metadata` com `title: 'Histórico' + SUF` e a description do gerador, e o corpo traduzido do bloco `page('historico.html', …)`.

- [ ] **Step 5: Rodar a paridade**

Run: `npm run build && npm start` (3000), depois `python testes/paridade.py http://127.0.0.1:8766/ http://127.0.0.1:3000/ historico.html`
Expected: PASSOU historico.html

- [ ] **Step 6: Checar hidratação com JS ligado**

Abrir `http://127.0.0.1:3000/historico` e confirmar que o console não tem erros, que o menu suspenso abre e fecha e que a classe `js` está no `<html>`. Se houver erro de hidratação por causa do `site.js`, trocar para `strategy="lazyOnload"`, repetir o teste e registrar o motivo num comentário no layout.

- [ ] **Step 7: Commit**

```bash
git add -A && git commit -m "feat: app Next com moldura e teste de paridade"
```

---

### Task 2: Tipos, datas e camada de conteúdo

**Files:**
- Create: `lib/types.ts`, `lib/datas.ts`, `lib/datas.test.ts`, `lib/content.ts`, `content/servicos.ts`, `content/eventos.ts`, `content/noticias.ts`, `content/diretoria.ts`, `content/ex-presidentes.ts`, `content/auditorio.ts`, `content/associacao.ts`, `content/contato.ts`
- Modify: `components/Header.tsx` (NAV_NEG via `getServicos()`; remover o shortcut)

**Interfaces:**
- Produces (`lib/types.ts`):
  ```ts
  type Servico = { slug: string; titulo: string; icone: IconName; imagem: string; marca: string;
                   resumo: string; paragrafos: string[]; links: { href: string; texto: string }[] }
  type Evento = { data: string /*AAAA-MM-DD*/; titulo: string; horario: string | null; local: string; descricao: string }
  type Bloco = string | { lista: string[] } | { citacao: string } | { tabela: { categoria: string; itens: string[] }[] }
  type Noticia = { slug: string; data: string; titulo: string; imagem: string; alt: string; resumo: string; corpo: Bloco[] }
  type ExPresidente = { foto: string | null; nome: string; gestao: string | null }
  type Diretoria = { vps: { area: string; nome: string }[]; consultivo: string[]; deliberativo: string[]; deliberativoSuplentes: string[] }
  type Foto = { arquivo: string; alt: string; pos: string }            // GAL
  type Beneficio = { titulo: string; texto: string }                   // BENEF
  type Assunto = { slug: string; rotulo: string }                      // ASSUNTOS
  ```
  Os campos de `Servico` seguem a ordem da tupla do gerador (8 campos; o 8º é a tupla de links `(href, texto)`).
- Produces (`lib/datas.ts`): `dlong(iso: string): string`, `dshort(iso: string): string`, `evId(e: Evento): string`
- Produces (`lib/content.ts`), tudo `async` e na ordem do gerador:
  `getServicos(): Promise<Servico[]>`, `getEventos(): Promise<Evento[]>`, `getNoticias(): Promise<Noticia[]>` (mais recente primeiro), `getNoticia(slug: string): Promise<Noticia | undefined>`, `getDiretoria(): Promise<Diretoria>`, `getExPresidentes(): Promise<ExPresidente[]>`, `getGaleriaAuditorio(): Promise<Foto[]>`, `getBeneficios(): Promise<Beneficio[]>`, `getAssuntosContato(): Promise<Assunto[]>`

- [ ] **Step 1: Escrever o teste que falha**

```ts
// lib/datas.test.ts
import { test } from 'node:test'; import assert from 'node:assert/strict';
import { dlong, dshort, evId } from './datas.ts';
test('dlong', () => assert.equal(dlong('2025-04-11'), '11 de abril de 2025'));
test('dshort', () => assert.equal(dshort('2022-05-08'), '8 mai 2022'));
test('evId usa as 2 últimas palavras sem acento', () =>
  assert.equal(evId({ data: '2026-02-25', titulo: 'Visita do deputado estadual Napoleão Bernardes', horario: null, local: 'SRI', descricao: '' }),
               'evento-2026-02-25-napoleao-bernardes'));
test('evId remove pontuação', () =>
  assert.equal(evId({ data: '2022-05-18', titulo: 'Visita do DNIT/SC', horario: '11h', local: 'ACIDI', descricao: '' }),
               'evento-2022-05-18-do-dnitsc'));
```

- [ ] **Step 2: Ver falhar**

Run: `npm test`
Expected: FAIL, `Cannot find module './datas.ts'`

- [ ] **Step 3: Implementar `lib/datas.ts`**

Usar `normalize('NFKD').replace(/[̀-ͯ]/g, '')` para equivaler ao `encode('ascii','ignore')`. Manter só `[a-z0-9]` de cada palavra.

- [ ] **Step 4: Ver passar**

Run: `npm test`
Expected: PASS 4/4

- [ ] **Step 5: Portar os dados**

Copiar as listas do gerador para `content/*.ts`, tipadas, sem mudar nenhum caractere de texto. Os blocos de notícia viram `string` | `{lista}` | `{citacao}` | `{tabela}`.

Rodar o check abaixo, que conta itens e compara com o Python:
```bash
python -I -c "src=open('ferramentas/gerar_site.py',encoding='utf-8').read().split('# ---------------------------------------------------------------- moldura')[0]; g={'__file__':'ferramentas/gerar_site.py'}; exec(src,g); print(len(g['SERVICOS']), len(g['EVENTOS']), len(g['NOTICIAS']))"
```
Expected: `7 6 10`. Os mesmos números devem sair de `getServicos/getEventos/getNoticias`, conferidos com um teste extra em `lib/datas.test.ts` (ou num `lib/content.test.ts`).

- [ ] **Step 6: Paridade do histórico continua passando, agora com NAV_NEG vindo dos dados**

Run: `npm run build && npm start`, depois `python testes/paridade.py http://127.0.0.1:8766/ http://127.0.0.1:3000/ historico.html`
Expected: PASSOU

- [ ] **Step 7: Commit**

```bash
git add -A && git commit -m "feat: conteúdo tipado e camada lib/content"
```

---

### Task 3: Componentes de bloco + páginas institucionais

**Files:**
- Create: `components/blocos.tsx`, `app/diretoria/page.tsx`, `app/ex-presidentes/page.tsx`, `app/representatividade/page.tsx`, `app/nucleos/page.tsx`

**Interfaces:**
- Consumes: `Ico`, `Header`, `Footer`, `get*()` e `dlong`/`dshort`/`evId` das Tasks 1–2
- Produces (`components/blocos.tsx`), um componente por função do gerador e com a mesma saída:
  - `Crumbs({ items }: { items: [href: string | null, texto: string][] })`
  - `PageHead({ kicker, title, lead, side, pic }: { kicker: string; title: ReactNode; lead: ReactNode; side?: ReactNode; pic?: { src: string; alt: string } })`. Confira a forma de `pic` em `phead()` antes de fixar
  - `EventItem({ e, home = false, hoje }: { e: Evento; home?: boolean; hoje: string })`: em `home` com `e.data < hoje`, recebe `hidden`
  - `Story({ n, cls = 'story', showP = true })`
  - `JoinBox()`, `DemoNotice({ extra })`, `Field(props)` com as mesmas opções de `field()`, `FormEnd({ button, doneExtra })`
- `ini(nome)` (iniciais em ex-presidentes) fica local em `app/ex-presidentes/page.tsx`

- [ ] **Step 1: Ver as rotas falharem**

Run: `python testes/paridade.py http://127.0.0.1:8766/ http://127.0.0.1:3000/ diretoria.html ex-presidentes.html representatividade.html nucleos.html`
Expected: FALHOU nas 4 (404)

- [ ] **Step 2: Implementar `components/blocos.tsx` e as 4 páginas**

Tradução dos blocos `page(...)` correspondentes. Os links para agenda/notícias usam as rotas novas (`/agenda#evento-…`, `/noticias/<slug>`).

- [ ] **Step 3: Ver passar**

Run: build + start, depois o mesmo comando do Step 1
Expected: PASSOU nas 4, e `historico.html` continua PASSOU

- [ ] **Step 4: Commit**

```bash
git add -A && git commit -m "feat: páginas institucionais em Next"
```

---

### Task 4: Para seu negócio

**Files:** Create: `app/para-seu-negocio/page.tsx`

`svc_marca()` e `escalas()` do gerador ficam locais nesta página, a não ser que a home também use. Nesse caso vão para `components/blocos.tsx`.

- [ ] **Step 1:** `python testes/paridade.py … para-seu-negocio.html` → FALHOU
- [ ] **Step 2:** Implementar a página a partir de `getServicos()`
- [ ] **Step 3:** Mesmo comando → PASSOU
- [ ] **Step 4:** Commit `feat: página para seu negócio`

---

### Task 5: Home

**Files:** Create: `app/page.tsx`

**Interfaces:** Consumes `getServicos`, `getNoticias`, `getEventos`, `Story`, `EventItem` (com `home`), `JoinBox`. `hoje` = `new Date()` no build, formatado como no `HOJE` do gerador (data local, `AAAA-MM-DD`).

- [ ] **Step 1:** `python testes/paridade.py … index.html` → FALHOU
- [ ] **Step 2:** Implementar a home: hero, serviços `[data-svx]`, filme `[data-film]` com `<video>` e pôster absolutos, notícias da home, agenda com `[data-agenda]`, atuação `[data-anim]`, `JoinBox`
- [ ] **Step 3:** Mesmo comando → PASSOU. O site de referência precisa ter sido gerado no mesmo dia, porque o `hidden` depende da data. Se divergir só em `hidden`, rodar `python ferramentas/gerar_site.py` dentro de `../acidi-site-ref` e repetir.
- [ ] **Step 4:** Commit `feat: home em Next`

---

### Task 6: Notícias

**Files:** Create: `app/noticias/page.tsx`, `app/noticias/[slug]/page.tsx`

**Interfaces:**
- `[slug]/page.tsx` exporta `generateStaticParams()` (slugs de `getNoticias()`), `dynamicParams = false`, `generateMetadata({ params })` (título + `SUF`, description = `resumo`). `params` é `Promise<{ slug: string }>` no Next atual, então use `await params`.
- O componente `Corpo({ blocos }: { blocos: Bloco[] })` fica local no arquivo da matéria e equivale a `corpo()`.
- A navegação "Mais recente"/"Anterior" segue a mesma lógica de índice do gerador.

- [ ] **Step 1:** `python testes/paridade.py … noticias.html noticia-contabilidade-e-impacto-social.html noticia-networkaffee.html` (e as outras 8) → FALHOU
- [ ] **Step 2:** Implementar as duas páginas
- [ ] **Step 3:** Mesmo comando → PASSOU em todas as 11
- [ ] **Step 4: 404 para slug inexistente**

Run: `curl -s -o NUL -w "%{http_code}" http://127.0.0.1:3000/noticias/nao-existe`
Expected: `404`
- [ ] **Step 5:** Commit `feat: notícias em Next`

---

### Task 7: Agenda, auditório, associe-se e contato

**Files:** Create: `app/agenda/page.tsx`, `app/auditorio/page.tsx`, `app/associe-se/page.tsx`, `app/contato/page.tsx`

Os formulários continuam `form.demo` com `noValidate`. Os atributos `data-rules`/`data-label`/`aria-describedby` vêm de `Field`. Os `style="…"` inline do gerador viram objetos `style` do React (a paridade compara depois de o navegador normalizar).

- [ ] **Step 1:** `python testes/paridade.py … agenda.html auditorio.html associe-se.html contato.html` → FALHOU
- [ ] **Step 2:** Implementar as 4 páginas
- [ ] **Step 3:** Mesmo comando → PASSOU. Depois, `python testes/paridade.py http://127.0.0.1:8766/ http://127.0.0.1:3000/` **sem rotas** → PASSOU nas 22
- [ ] **Step 4:** Commit `feat: agenda, auditório e formulários em Next`

---

### Task 8: Redirects e testes existentes nas rotas novas

**Files:**
- Create: `lib/rotas.ts`, `lib/rotas.test.ts`
- Modify: `next.config.ts`, `testes/paridade.py` (ler as rotas de um único lugar, ou manter um espelho e citar `lib/rotas.ts` num comentário), `testes/jornadas.py`, `testes/movimento.py`, `testes/comparar.py`, `testes/verificar_links.py`

**Interfaces:**
- Produces: `ROTAS: Record<string, string>` (`'agenda.html' → '/agenda'`, `'index.html' → '/'`…), e `rotaDe(arquivo: string): string | undefined`, que também resolve `noticia-<slug>.html` → `/noticias/<slug>`
- `next.config.ts`: `redirects()` devolve um item `{ source: '/<arquivo>', destination, permanent: true }` por entrada de `ROTAS` e mais `{ source: '/noticia-:slug.html', destination: '/noticias/:slug', permanent: true }`

- [ ] **Step 1: Teste**

```ts
// lib/rotas.test.ts
test('index', () => assert.equal(rotaDe('index.html'), '/'));
test('página simples', () => assert.equal(rotaDe('associe-se.html'), '/associe-se'));
test('notícia', () => assert.equal(rotaDe('noticia-networkaffee.html'), '/noticias/networkaffee'));
test('desconhecido', () => assert.equal(rotaDe('nada.html'), undefined));
```
- [ ] **Step 2:** `npm test` → FAIL
- [ ] **Step 3:** Implementar `lib/rotas.ts` e `next.config.ts`
- [ ] **Step 4:** `npm test` → PASS
- [ ] **Step 5: Redirect preserva a âncora**

No Playwright (adicionar em `jornadas.py`): `goto(BASE + 'agenda.html#evento-2022-05-18-do-dnitsc')` → URL final `…/agenda#evento-2022-05-18-do-dnitsc` com status 301 na primeira resposta. Fazer o mesmo para `para-seu-negocio.html#util-card`.
- [ ] **Step 6: Atualizar os testes para as rotas novas**

Em `jornadas.py`/`movimento.py`/`comparar.py`, trocar `'x.html'` → rota nova, `wait_for_url('**/x.html')` → `'**/x'` e `noticia-*.html` → `/noticias/*`. `BASE` padrão = `http://127.0.0.1:3000/`. `verificar_links.py` passa a rastrear a partir de `BASE` via HTTP (`urllib`), seguindo `href`/`src` internos e conferindo status 200 e âncoras existentes, em vez de ler arquivos do disco. As regras atuais (externos com aviso, `button` com `type`) continuam.
- [ ] **Step 7: Rodar tudo contra o Next**

```bash
node testes/logica.test.js
python testes/verificar_links.py
python testes/jornadas.py
python testes/movimento.py http://127.0.0.1:3000/
```
Expected: tudo PASSOU. `jornadas.py` reporta zero erros de console (cobre hidratação) e zero falhas de rede.
- [ ] **Step 8: Comparação visual**

```bash
python testes/comparar.py antes  http://127.0.0.1:8766/
python testes/comparar.py depois http://127.0.0.1:3000/
```
Expected: `docs/comparativo/antes` e `depois` iguais à vista. Usar `antes` no site de referência com o `comparar.py` antigo (o da worktree), porque as URLs mudaram. Diferença = bug a corrigir.
- [ ] **Step 9:** Commit `feat: redirects das URLs .html e testes nas rotas novas`

---

### Task 9: Aposentar o gerador

**Files:**
- Delete: `ferramentas/gerar_site.py`, `*.html` da raiz (22 arquivos)
- Modify: `.claude/launch.json` (`{"name": "site", "runtimeExecutable": "npm", "runtimeArgs": ["run", "dev"], "port": 3000}`), `README.md`, `LEIAME.md`, `docs/DOCUMENTACAO.md` (comandos: `npm i`, `npm run dev`, `npm run build && npm start`, como rodar os testes; onde fica cada tipo de conteúdo)

- [ ] **Step 1:** Apagar os arquivos e rodar `npm run build`. Expected: build sem erro, ou seja, nada importava o gerador
- [ ] **Step 2:** Rodar a bateria da Task 8 Step 7 de novo → PASSOU
- [ ] **Step 3:** `git worktree remove ../acidi-site-ref`
- [ ] **Step 4:** Commit `chore: remove gerador estático; site agora é Next.js`
