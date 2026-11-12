# Admin, parte 3: páginas editáveis — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** O Admin edita pelo painel o texto comum de todas as páginas e os textos da Home, e cria páginas novas (no menu ou avulsas).

**Architecture:** Tabela `paginas` com colunas de controle e um JSON `conteudo` (molde comum: cabeçalho, lateral, corpo em blocos; ou textos da Home). As páginas atuais leem a parte comum do banco por componentes únicos (`components/Molde.tsx`) e mantêm as partes especiais no código. Páginas novas usam a rota `app/(site)/[pagina]`. O painel segue os padrões das partes 1 e 2 (regras puras em `lib/admin/*.ts` retornando `Resultado`, Server Actions finas, `Cabecalho`/`CartaoLista`/`CaixaLateral`/`EditorBlocos`).

**Tech Stack:** Next.js 16 (App Router, Server Actions), Drizzle + MySQL, zod, `node --test`, Playwright (Python) para paridade e jornadas.

**Spec:** `docs/superpowers/specs/2026-11-11-admin-parte3-paginas-design.md`

## Global Constraints

- Nenhuma dependência nova.
- Só Admin edita páginas (`paginas.editar`); toda Server Action chama `pode()` de novo.
- Site público idêntico depois da carga: `python testes/paridade.py http://127.0.0.1:8766/ http://127.0.0.1:3000/` sem divergências (servidor `ref` do `.claude/launch.json` + `npm run dev`), e `npm test`, `npm run test:db` verdes.
- `Formatado` vira nós React (`<b>`, `<a>`), nunca `dangerouslySetInnerHTML`.
- Links aceitos: `/`, `#`, `https://`, `http://`, `mailto:`, `tel:`. Outro esquema: no texto vira texto puro; no botão é recusado no campo.
- Endereço: `^[a-z0-9]+(-[a-z0-9]+)*$`, até 80 caracteres, único, fora dos reservados.
- Tamanhos máximos: títulos 200, chamadas e textos 1000, descrição 300, corpo 200 blocos.
- Upload: JPG, PNG ou WebP até 8 MB, mensagens iguais às da notícia.
- Mensagem de conflito: "Outra pessoa salvou esta página enquanto você editava. Recarregue para ver a versão nova."
- Aviso nas páginas fixas: "Formulário, galeria e listas desta página continuam fixos por enquanto."
- Página fixa sem linha no banco: `throw new Error('página <fixa> sem conteúdo no banco: rode npm run db:carga')`.
- Depois de qualquer mudança em página: `revalidatePath('/', 'layout')` (o menu aparece em todas as páginas).
- Código, nomes e textos em português, no estilo dos arquivos vizinhos.

## Review Focus

- Notícias antigas com `*` ou `[` no texto (vindas do WordPress) não podem mudar de aparência: só `**par fechado**` e `[t](u)` completos viram formatação (teste na Task 1; paridade das 10 notícias na Task 6).
- Endereço novo igual a uma rota existente (`agenda`, `admin`, `noticias`, `historico`…) ou com maiúscula/acento/espaço: recusado com mensagem no campo, nunca cria página inacessível (Task 3).
- Duas abas editando a mesma página: a segunda a salvar recebe o aviso de conflito e nada é sobrescrito (Task 4).
- Rascunho acessado direto pelo endereço público: 404, e não aparece no menu nem no sitemap (Tasks 4 e 7).
- Rodar `npm run db:carga` de novo depois de editar uma página fixa: a edição continua lá (Task 5).

---

### Task 1: Texto formatado (`**negrito**` e `[texto](endereço)`)

**Files:**
- Create: `lib/formatado.tsx`, `lib/formatado.test.tsx`

**Interfaces:**
- Produces:
  - `type Parte = string | { b: string } | { a: string; href: string }`
  - `linkSeguro(href: string): boolean`
  - `partes(s: string): Parte[]`
  - `Fmt({ t }: { t: string }): ReactNode` — `<b>` para negrito; link interno/`#`/`mailto:`/`tel:` vira `<a className="tlink" href>`; `http(s)://` vira `<Ext href cls="tlink">` de `components/Ico`.

- [ ] **Step 1: Testes** em `lib/formatado.test.tsx` (`node:test`, `assert.deepEqual`):
  - `partes('a **b** c')` → `['a ', { b: 'b' }, ' c']`
  - `partes('ver [notícia](/noticias/x).')` → `['ver ', { a: 'notícia', href: '/noticias/x' }, '.']`
  - `partes('2 * 3 e **aberto')` → `['2 * 3 e **aberto']` (asterisco solto e par não fechado ficam como texto)
  - `partes('[x](javascript:alert(1))')` → `['[x](javascript:alert(1))']`
  - `partes('<b>oi</b>')` → `['<b>oi</b>']` (React escapa; nada vira HTML)
  - `linkSeguro` true para `/a`, `#b`, `https://x`, `http://x`, `mailto:a@b`, `tel:+55`; false para `javascript:x`, `data:x`, `//x`, `ftp://x`, `` (vazio).
- [ ] **Step 2:** `node --test lib/formatado.test.tsx` → FAIL (módulo não existe). Ajustar o script `test` do `package.json` para `"lib/**/*.test.ts*"` se o glob atual não pegar `.tsx`.
- [ ] **Step 3:** Implementar com uma regex global `/\*\*(.+?)\*\*|\[([^\]]+)\]\(([^)\s]+)\)/g`; link com `linkSeguro` falso volta a ser o texto original.
- [ ] **Step 4:** `npm test` → PASS.
- [ ] **Step 5:** Commit `feat: texto com negrito e link (Formatado)`.

### Task 2: Blocos Subtítulo e Imagem, e texto formatado no corpo

**Files:**
- Modify: `lib/types.ts` (tipo `Bloco`), `lib/admin/validacao.ts` (`bloco`), `components/Artigo.tsx` (tirar `Corpo` daqui), `components/admin/EditorBlocos.tsx`
- Create: `components/Corpo.tsx`
- Test: `lib/admin/validacao.test.ts`

**Interfaces:**
- Consumes: `Fmt` (Task 1).
- Produces:
  - `Bloco` += `{ subtitulo: string }` | `{ imagem: { src: string; alt: string; legenda: string } }`
  - `Corpo({ blocos }: { blocos: Bloco[] })` em `components/Corpo.tsx`: parágrafo `<p><Fmt/></p>`, lista `<li><Fmt/></li>`, citação, tabela (como hoje, itens com `Fmt`), subtítulo `<h2>`, imagem `<figure style={{ margin: '16px 0 0' }}><div className="photo" style={{ borderRadius: 'var(--r)', aspectRatio: '3/2' }}><img src alt loading="lazy" /></div>{legenda && <figcaption className="cap"><Fmt/></figcaption>}</figure>` (o mesmo HTML da foto do Histórico).
  - `esquemaBlocos` aceita os dois tipos novos (imagem exige `src` e `alt`; `legenda` pode ser vazia).

- [ ] **Step 1: Testes** em `validacao.test.ts`: `validar(esquemaBlocos, [{ subtitulo: 'A' }, { imagem: { src: '/uploads/a.jpg', alt: 'x', legenda: '' } }]).ok === true`; imagem sem `alt` → `ok === false`; `{ subtitulo: '' }` → `ok === false`.
- [ ] **Step 2:** `npm test` → FAIL.
- [ ] **Step 3:** Tipos + esquema; mover `Corpo` para `components/Corpo.tsx` e usá-lo em `Artigo`.
- [ ] **Step 4:** `EditorBlocos`: tipos `{ tipo: 'subtitulo'; texto }` e `{ tipo: 'imagem'; src; alt; legenda }` em `Ed`, `NOMES` ("Subtítulo", "Imagem"), `paraEditor`/`paraBloco`/`NOVO`. A imagem tem input de arquivo que envia para a Server Action `enviarImagem(f: FormData): Promise<{ src?: string; erro?: string }>` (nova, em `app/(admin)/admin/(painel)/paginas/imagem.ts`, `'use server'`, exige `pode(u,'paginas.editar') || pode(u,'noticia.criar')`, usa `salvarImagem` e as mensagens da notícia) e guarda o `src` retornado. Abaixo dos campos de texto: dica "Use **negrito** e [texto](endereço)".
- [ ] **Step 5:** `npm test` e `npm run build` → PASS. Abrir uma notícia publicada e a prévia de uma notícia e conferir que nada mudou.
- [ ] **Step 6:** Commit `feat: blocos subtítulo e imagem, texto formatado no corpo`.

### Task 3: Tabela, tipos e validação de página

**Files:**
- Modify: `lib/db/schema.ts`, `lib/types.ts`, `lib/admin/validacao.ts`, `lib/admin/permissoes.ts`, `lib/admin/permissoes.test.ts`, `lib/rotas.ts` (exportar `PAGINAS`)
- Create: `drizzle/0001_paginas.sql` (via `npm run db:gerar`), `lib/admin/paginas-validacao.test.ts`

**Interfaces:**
- Produces:
  - Tabela `paginas` exatamente como na spec (colunas `id, fixa, slug, nome, situacao, descricao, menu, menuTexto, ordem, conteudo, atualizadaEm, atualizadaPorId`; `fixa` e `slug` únicos; `slug` com `chave()`; `conteudo` com `json<ConteudoPagina | ConteudoHome>()`).
  - Em `lib/types.ts`: `FIXAS = ['home','historico','nucleos','representatividade','para-seu-negocio','auditorio','associe-se','contato','noticias','agenda','diretoria','ex-presidentes'] as const`, `type Fixa`, `ConteudoPagina`, `ConteudoHome` (copiados da spec), `type Pagina = { slug: string; nome: string; descricao: string; menu: 'acidi' | 'negocio' | null; conteudo: ConteudoPagina }`.
  - `Acao` += `'paginas.editar'` (só admin).
  - Em `validacao.ts`: `RESERVADOS: string[]` (= `PAGINAS` de `lib/rotas.ts` + `'admin','api','assets','uploads','_next','sitemap.xml','robots.txt'`); `esquemaPagina` sobre campos planos do formulário (`nome, slug?, descricao, menu ('' | 'acidi' | 'negocio'), menuTexto, etiqueta, titulo, destaque, chamada, foto, fotoAlt, fotoLegenda, lateralTexto, botaoTexto, botaoHref, corpo`) com `.transform` para `{ nome, slug, descricao, menu, menuTexto, conteudo: ConteudoPagina }` (foto vazia → `null`; lateral sem texto e sem botão → `null`; botão sem os dois campos → `null`); `esquemaHome` sobre campos planos com nome `secao.campo` (ex.: `'destaque.etiqueta'`, `'quemSomos.pilar1.titulo'`) com `.transform` para `ConteudoHome`. Erros ficam na chave plana, então `validar` não muda.

- [ ] **Step 1: Testes** (`paginas-validacao.test.ts`):
  - slug `agenda`, `admin`, `Nova`, `nova pagina`, `ação`, `-x`, 81 caracteres → erro em `slug`; `campanha-2027` → ok.
  - sem `titulo` → `erros.titulo === 'Campo obrigatório'`; `foto` preenchida e `fotoAlt` vazio → erro em `fotoAlt`.
  - `botaoTexto` sem `botaoHref` → erro em `botaoHref`; `botaoHref: 'javascript:x'` → erro em `botaoHref`.
  - `chamada` com 1001 caracteres → erro; `descricao` com 301 → erro.
  - caso válido mínimo → `valor.conteudo.lateral === null`, `valor.conteudo.cabecalho.foto === null`.
  - `esquemaHome` com todos os campos → `valor.quemSomos.pilares.length === 3`.
  - `permissoes.test.ts`: incluir `'paginas.editar'` em `TODAS`; admin true, revisor e editor false.
- [ ] **Step 2:** `npm test` → FAIL.
- [ ] **Step 3:** Implementar; `npm run db:gerar` gera a migração; conferir que o SQL só cria `paginas`.
- [ ] **Step 4:** `npm test` → PASS; `npm run db:migrar` aplica sem erro.
- [ ] **Step 5:** Commit `feat: tabela e validação de páginas`.

### Task 4: Regras de páginas no admin

**Files:**
- Create: `lib/admin/paginas.ts`, `lib/admin/paginas.db-test.ts`

**Interfaces:**
- Consumes: `paginas`, `esquemaPagina`, `esquemaHome`, `pode`, `trocaComVizinho`, `mudouDesde`, `ok`/`falha` (Task 3 e existentes).
- Produces (todas checam `pode(u, 'paginas.editar')` primeiro → `falha('sem-permissao')`):
  - `type LinhaPagina = typeof paginas.$inferSelect`
  - `CAMPOS_FIXA: Record<Exclude<Fixa,'home'>, { foto: boolean; lateral: boolean; corpo: boolean }>` — `false` onde a página não tem a parte (Contato, Auditório: só cabeçalho; Histórico e Para seu negócio: `lateral: false` por terem `localnav`; Notícias, Agenda, Diretoria, Ex-presidentes: só cabeçalho). O implementador confirma cada valor olhando o `page.tsx`.
  - `listarPaginas(db, u): Promise<Resultado<LinhaPagina[]>>` (ordem: `home`, fixas, `menu`, `ordem`)
  - `obterPagina(db, u, id): Promise<Resultado<LinhaPagina>>`; `obterPaginaFixa(db, u, fixa: Fixa)`
  - `salvarPagina(db, u, id: string | null, dados: unknown, lidaEm?: string): Promise<Resultado<{ id: string; slug: string; publicada: boolean }>>` — nova: `situacao 'rascunho'`, `ordem` = fim do grupo; existente: conflito por `mudouDesde(atualizadaEm, lidaEm)` → `falha('conflito')`; slug repetido → `falha('invalida', { erros: { slug: 'Já existe uma página com este endereço.' } })`; fixa: ignora `slug`, `menu`, `menuTexto` vindos do formulário; `fixa === 'home'` valida com `esquemaHome`.
  - `publicarPagina(db, u, id)`, `tirarDoAr(db, u, id)`, `apagarPagina(db, u, id)` — as duas últimas em fixa → `falha('invalida')`.
  - `moverPagina(db, u, id, direcao: 'cima' | 'baixo')` — dentro do mesmo `menu`, só páginas não fixas.

- [ ] **Step 1: Testes** (`paginas.db-test.ts`, mesmo esqueleto de `diretoria.db-test.ts`, com `carregar` no `beforeEach`):
  - revisor/editor recebem `sem-permissao` em listar e salvar.
  - criar → `situacao 'rascunho'`; publicar → `'publicada'`; tirar do ar → `'rascunho'`; apagar → some.
  - criar com slug repetido → erro em `slug`.
  - salvar com `lidaEm` antigo → `erro 'conflito'` e conteúdo no banco inalterado.
  - três páginas em `menu 'acidi'`: mover a terceira para cima troca a ordem com a segunda.
  - `tirarDoAr` e `apagarPagina` na fixa `historico` → `erro 'invalida'`; `salvarPagina` na fixa com `slug: 'outro'` mantém `slug 'historico'`.
- [ ] **Step 2:** `npm run test:db` → FAIL.
- [ ] **Step 3:** Implementar no estilo de `lib/admin/diretoria.ts`.
- [ ] **Step 4:** `npm run test:db` → PASS.
- [ ] **Step 5:** Commit `feat: regras de páginas no admin`.

### Task 5: Carga e leitura das páginas no site

**Files:**
- Create: `scripts/dados/paginas.ts`
- Modify: `scripts/carga.ts`, `lib/content.ts`, `lib/content.db-test.ts`

**Interfaces:**
- Consumes: tabela e tipos (Task 3).
- Produces:
  - `PAGINAS_FIXAS: { fixa: Fixa; slug: string; nome: string; descricao: string; conteudo: ConteudoPagina | ConteudoHome }[]` — texto copiado **exatamente** do JSX atual (cada `<b>` vira `**…**`, cada `<a className="tlink" href>` vira `[…](…)`); `descricao` = a do `pagina(...)` atual; `nome` = o título usado no `pagina(...)`.
  - `carregar(db)` insere `PAGINAS_FIXAS` com `INSERT IGNORE` (situação `publicada`, `ordem 0`).
  - `getPaginaFixa(fixa: Exclude<Fixa,'home'>): Promise<Pagina>` (lança o erro da constraint se faltar), `getHome(): Promise<ConteudoHome>`, `getPaginaPublicada(slug): Promise<Pagina | undefined>` (só não fixas publicadas), `getPaginasMenu(): Promise<{ menu: 'acidi' | 'negocio'; slug: string; nome: string; menuTexto: string | null }[]>` (publicadas com menu, por `ordem`).

- [ ] **Step 1: Testes** em `content.db-test.ts`: depois de `carregar`, `getPaginaFixa('historico')` tem `conteudo.cabecalho.destaque === 'para Indaial'`; editar a linha no banco, rodar `carregar` de novo e conferir que a edição ficou; rascunho não volta em `getPaginaPublicada` nem `getPaginasMenu`; `getPaginaFixa` sem linha → rejeita com mensagem contendo `npm run db:carga`.
- [ ] **Step 2:** `npm run test:db` → FAIL.
- [ ] **Step 3:** Implementar; preencher `scripts/dados/paginas.ts` para as 12 fixas.
- [ ] **Step 4:** `npm run test:db` → PASS; `npm run db:carga` no banco de desenvolvimento.
- [ ] **Step 5:** Commit `feat: carga das páginas fixas e leitura no site`.

### Task 6: Páginas atuais e Home lendo do banco

**Files:**
- Create: `components/Molde.tsx`
- Modify: os 11 `app/(site)/*/page.tsx` com página fixa e `app/(site)/page.tsx`

**Interfaces:**
- Consumes: `getPaginaFixa`, `getHome` (Task 5), `Fmt`, `Corpo` (Tasks 1-2), `PageHead`.
- Produces:
  - `CabecalhoPagina({ cab, side }: { cab: ConteudoPagina['cabecalho']; side?: ReactNode })` — mesmo HTML de `PageHead`; com foto usa `cab.foto.src` como caminho completo (sem prefixar `/assets/img/`) e legenda com `Fmt`.
  - `SecaoTexto({ c, aside }: { c: ConteudoPagina; aside?: ReactNode })` — `<section className="sec"><div className="wrap split"><div className="aside">…</div><div className="prose"><Corpo/></div></div></section>`; `aside` (localnav fixa) tem prioridade sobre `c.lateral`; lateral = `<p className="muted"><Fmt/></p>` + botão `<a className="btn btn-p">`; sem corpo nem lateral nem `aside` não renderiza.
  - Cada página troca `export const metadata` por `generateMetadata` com `pagina(caminho, p.nome, p.descricao)`.

- [ ] **Step 1:** Subir o servidor `ref` (`.claude/launch.json`) e o `npm run dev`; rodar `python testes/paridade.py http://127.0.0.1:8766/ http://127.0.0.1:3000/` e anotar que passa antes da mudança.
- [ ] **Step 2:** Implementar `Molde.tsx` e migrar uma página (`nucleos`); rodar a paridade só dela (`… nucleos.html`) → PASS.
- [ ] **Step 3:** Migrar as outras 10 páginas e a Home (só os textos de `ConteudoHome`; o resto do JSX fica igual). Partes especiais não mudam.
- [ ] **Step 4:** Paridade completa → sem divergências; `npm run build` → PASS.
- [ ] **Step 5:** Commit `feat: páginas do site leem o texto do banco`.

### Task 7: Páginas novas no site, menu e sitemap

**Files:**
- Create: `app/(site)/[pagina]/page.tsx`
- Modify: `components/Header.tsx`, `app/sitemap.ts`

**Interfaces:**
- Consumes: `getPaginaPublicada`, `getPaginasMenu` (Task 5), `CabecalhoPagina`, `SecaoTexto` (Task 6), `Crumbs`.
- Produces:
  - `Header({ page })` aceita `PageKey | \`/${string}\``; `rota()` devolve o próprio caminho quando começa com `/`.
  - Itens novos entram depois dos fixos: no painel "A ACIDI" e "Para seu negócio" (ícone `doc`, descrição `menuTexto ?? ''`) e no menu do celular; `hereA`/`hereN` também acendem quando a página atual é uma delas.
  - Rota `[pagina]`: `getPaginaPublicada(slug)` ou `notFound()`; breadcrumb `Início › A ACIDI › nome` (link `/historico`), `Início › Para seu negócio › nome` (link `/para-seu-negocio`) ou `Início › nome`; `generateMetadata` com `pagina('/' + slug, nome, descricao)`.
  - `sitemap.ts` acrescenta as páginas novas publicadas.

- [ ] **Step 1:** Implementar.
- [ ] **Step 2:** Com uma linha criada direto no banco (publicada, menu `acidi`): `/slug` abre, aparece no menu do computador e do celular e no `/sitemap.xml`; mudar para rascunho → `/slug` dá 404 e some do menu e do sitemap. Paridade completa continua sem divergências.
- [ ] **Step 3:** `npm run build` → PASS.
- [ ] **Step 4:** Commit `feat: páginas novas no site, no menu e no sitemap`.

### Task 8: Painel — lista, formulários, prévia

**Files:**
- Create: `app/(admin)/admin/(painel)/paginas/page.tsx`, `paginas/acoes.ts`, `paginas/[id]/page.tsx`, `paginas/nova/page.tsx`, `paginas/home/page.tsx`, `components/admin/FormPagina.tsx`, `components/admin/FormHome.tsx`, `app/(site)/admin/previa/pagina/[id]/page.tsx`
- Modify: `app/(admin)/admin/(painel)/layout.tsx` (item do menu)

**Interfaces:**
- Consumes: regras da Task 4, `enviarImagem` (Task 2), `CabecalhoPagina`/`SecaoTexto` (Task 6), componentes admin existentes (`Cabecalho`, `CartaoLista`, `Tabela`, `Mover`, `CaixaLateral`, `Campo`, `EditorBlocos`, `AvisoSaida`, `BotaoApagar`, `Aviso`), `salvarImagem`, `estadoDe`, `ERRO_BANCO`, `textosDe`.
- Produces:
  - Menu: `{ href: '/admin/paginas', rotulo: 'Páginas', icone: 'doc', acao: 'paginas.editar' }` logo depois de Agenda.
  - `agirPagina(_: Estado, f: FormData): Promise<Estado>` — `acao` = `salvar | publicar | tirar | apagar`, mesmo esqueleto de `agirNoticia` (upload da foto do cabeçalho, `corpo` em JSON, `lidaEm`), `revalidatePath('/', 'layout')` em toda mudança, redireciona com `?ok=`; `salvarHome(_: Estado, f: FormData): Promise<Estado>`; `moverPaginaAcao(f: FormData): Promise<void>`.
  - Lista: Home no topo; grupos "Páginas fixas", "A ACIDI", "Para seu negócio", "Fora do menu"; colunas nome, endereço, situação, última alteração; `Mover` só nas não fixas com menu; botão "+ Nova página".
  - `FormPagina({ p, campos }: { p: DadosPagina; campos: { foto: boolean; lateral: boolean; corpo: boolean; fixa: boolean } })` — layout de duas colunas da notícia; caixas e botões como na spec; fixa: esconde endereço, menu, Tirar do ar e Apagar e mostra o aviso fixo.
  - `FormHome({ c }: { c: ConteudoHome })` — uma `CaixaLateral` por seção na ordem do site; nomes de campo `secao.campo`.
  - Prévia: só com `paginas.editar`; renderiza `Header`, `Crumbs`, `CabecalhoPagina`, `SecaoTexto`, `Footer` com o conteúdo salvo (inclusive rascunho); `robots: noindex`.

- [ ] **Step 1:** Implementar a lista e o item de menu; conferir como Admin (aparece) e como Editor (não aparece; `/admin/paginas` redireciona como as outras telas restritas).
- [ ] **Step 2:** Implementar `FormPagina`, as páginas nova/[id] e `agirPagina`; criar, salvar rascunho, publicar, tirar do ar, apagar e reordenar pelo navegador; erro de validação aparece no campo com "Confira os campos destacados."
- [ ] **Step 3:** Implementar `FormHome`/`salvarHome` e a prévia.
- [ ] **Step 4:** `npm run build`, `npm test`, `npm run test:db` → PASS.
- [ ] **Step 5:** Commit `feat(admin): telas de páginas`.

### Task 9: Jornadas e documentação

**Files:**
- Modify: `testes/jornadas.py`, `docs/DOCUMENTACAO.md`

- [ ] **Step 1:** Acrescentar em `jornadas.py` (no estilo das jornadas de admin existentes):
  1. Admin edita o título do Histórico → o `h1` de `/historico` mostra o texto novo; volta o texto original no fim.
  2. Admin cria "Página teste" (`pagina-teste`, menu A ACIDI), publica → aparece no menu (1440 e 390) e em `/sitemap.xml`.
  3. Tira do ar → `/pagina-teste` dá 404 e a prévia abre; apaga no fim.
  4. Admin edita a chamada do destaque da Home → aparece em `/`; volta o original.
  5. Duas abas na mesma página: a segunda a salvar vê a mensagem de conflito.
  6. Nenhum erro de console.
- [ ] **Step 2:** Rodar `python testes/jornadas.py` → todas as verificações passam; rodar a paridade completa de novo.
- [ ] **Step 3:** Atualizar `docs/DOCUMENTACAO.md` (seção do admin: Páginas, o que é fixo, `npm run db:carga` depois do deploy) e o total de verificações.
- [ ] **Step 4:** Commit `test(admin): jornadas de páginas e documentação`.
