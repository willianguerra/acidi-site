# Admin parte 1: visual e navegação — plano de implementação

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Dar ao admin a cara da ACIDI (lateral verde-mata com ícones, Início com contadores), uma lista padrão com abas, filtros, paginação e ações em massa, e um formulário padrão em duas colunas, sem mudar nada no site público.

**Architecture:** Funções puras de lista em `lib/admin/lista.ts`; as funções de dados de notícias e mensagens passam a paginar no banco e a contar por situação; componentes de UI em `components/admin/` (Server Components, client só onde há estado); CSS puro reorganizado em `app/(admin)/admin.css`. As ações em massa chamam, item por item, as funções que já conferem `pode()`.

**Tech Stack:** Next 16 (App Router, Server Actions), React 19, Drizzle + MySQL, `node --test`, Playwright (Python) para o navegador.

**Spec:** `docs/superpowers/specs/2026-11-06-admin-parte1-visual-design.md`

## Global Constraints

- Nenhuma dependência nova (nem biblioteca de ícones, nem de UI, nem Tailwind).
- O site público não muda: `testes/paridade.py` 22/22, `jornadas.py`, `verificar_links.py`, `logica.test.js` verdes.
- Paginação de **20** itens; ação em massa aceita no máximo **100** ids por envio.
- Gaveta do menu abaixo de **900px**.
- Todo texto de interface em português, frase em caixa normal (sem CAIXA ALTA no texto; rótulos podem usar `text-transform` no CSS como hoje).
- Toda Server Action continua obtendo o usuário com `exigirUsuario()` e toda regra continua passando por `pode()`.
- Contraste AA; tudo operável por teclado; respeitar `prefers-reduced-motion`.
- Desvio consciente do spec: Agenda e Usuários têm poucas dezenas de linhas, então paginam em memória com `paginar()` em vez de mudar `listarEventos`/`listarUsuarios` (as assinaturas e os testes existentes ficam como estão).

## Review Focus

- Editor envia ação em massa "publicar" com ids de notícias de outra pessoa: todas recusadas, nenhuma muda (teste na Task 6).
- `?pagina=999` ou `?pagina=abc`: cai na página 1 (ou na última, se 999 passar do total) sem erro (Task 1).
- Busca com `%` ou `_` continua literal, inclusive nas contagens das abas (Task 2).
- Ação em massa com ids repetidos, inválidos ou mais de 100: repetidos contam uma vez, inválidos viram "não encontrada", acima de 100 é recusado inteiro (Task 1 e Task 6).
- `AvisoSaida` não pode avisar depois de um envio bem-sucedido do próprio formulário (Task 5, teste no navegador na Task 11).

---

### Task 1: Funções puras de lista

**Files:**
- Create: `lib/admin/lista.ts`
- Test: `lib/admin/lista.test.ts`

**Interfaces:**
- Produces:
  - `POR_PAGINA = 20`, `MAX_MASSA = 100`
  - `lerPagina(v: string | undefined): number` → inteiro ≥ 1; qualquer coisa inválida vira 1.
  - `limitarPagina(pagina: number, total: number): number` → entre 1 e `max(1, ceil(total/20))`.
  - `paginar<T>(itens: T[], pagina: number): { itens: T[]; total: number; pagina: number }` (usa `limitarPagina`).
  - `urlCom(caminho: string, atual: Record<string, string | undefined>, troca: Record<string, string | undefined>): string` → junta, remove chaves vazias/undefined, ordem estável; trocar qualquer filtro que não seja `pagina` remove `pagina`.
  - `paginasVisiveis(atual: number, ultimas: number): (number | '…')[]` → sempre 1 e a última, vizinhas ±1 da atual, `'…'` nos buracos.
  - `lerIds(f: FormData): string[] | null` → `ids` sem repetição; `null` se passar de 100.
  - `resumoMassa(rs: Resultado<unknown>[]): { feitas: number; recusadas: number; naoEncontradas: number }`.
  - `textoMassa(r: ReturnType<typeof resumoMassa>, feito: string): string` → ex.: `textoMassa({feitas:3,recusadas:1,naoEncontradas:0}, 'publicadas')` = `"3 publicadas, 1 não pôde ser alterada (sem permissão)."`; só a parte das feitas quando não há recusas.

- [ ] **Step 1: Escrever os testes**

```ts
test('lerPagina', () => { assert.equal(lerPagina(undefined), 1); assert.equal(lerPagina('abc'), 1); assert.equal(lerPagina('0'), 1); assert.equal(lerPagina('-2'), 1); assert.equal(lerPagina('3'), 3); assert.equal(lerPagina('2.5'), 1); });
test('limitarPagina', () => { assert.equal(limitarPagina(999, 41), 3); assert.equal(limitarPagina(5, 0), 1); });
test('paginar', () => { const r = paginar(Array.from({ length: 45 }, (_, i) => i), 3); assert.deepEqual(r, { itens: [40, 41, 42, 43, 44], total: 45, pagina: 3 }); });
test('urlCom troca filtro e zera página', () => { assert.equal(urlCom('/admin/noticias', { situacao: 'publicada', pagina: '3', busca: '' }, { situacao: 'revisao' }), '/admin/noticias?situacao=revisao'); assert.equal(urlCom('/admin/noticias', { busca: 'feira' }, { pagina: '2' }), '/admin/noticias?busca=feira&pagina=2'); });
test('paginasVisiveis', () => { assert.deepEqual(paginasVisiveis(1, 1), [1]); assert.deepEqual(paginasVisiveis(6, 11), [1, '…', 5, 6, 7, '…', 11]); assert.deepEqual(paginasVisiveis(2, 4), [1, 2, 3, 4]); });
test('lerIds', () => { const f = new FormData(); ['a', 'b', 'a'].forEach(i => f.append('ids', i)); assert.deepEqual(lerIds(f), ['a', 'b']); const g = new FormData(); for (let i = 0; i < 101; i++) g.append('ids', 'x' + i); assert.equal(lerIds(g), null); });
test('resumoMassa e textoMassa', () => { const r = resumoMassa([ok(1), ok(2), falha('sem-permissao'), falha('nao-encontrada')]); assert.deepEqual(r, { feitas: 2, recusadas: 1, naoEncontradas: 1 }); assert.equal(textoMassa({ feitas: 3, recusadas: 0, naoEncontradas: 0 }, 'apagadas'), '3 apagadas.'); });
```

- [ ] **Step 2:** `npm test` → FAIL (módulo não existe).
- [ ] **Step 3:** Implementar `lib/admin/lista.ts` com as assinaturas acima (`paginasVisiveis`: lista de 1, atual-1..atual+1, última, ordenada e sem repetição, `'…'` entre números não consecutivos). Texto de `naoEncontradas`: `"N não encontrada(s)"` no mesmo padrão.
- [ ] **Step 4:** `npm test` → PASS.
- [ ] **Step 5:** `git commit -m "feat(admin): funções de paginação, filtros e ação em massa"`

### Task 2: `listarNoticias` paginada com contagens

**Files:**
- Modify: `lib/admin/noticias.ts:33-44`
- Modify: `app/(admin)/admin/(painel)/noticias/page.tsx`, `app/(admin)/admin/(painel)/page.tsx` (só para compilar com o novo retorno: usar `.itens`)
- Test: `lib/admin/noticias.db-test.ts:130-140`

**Interfaces:**
- Consumes: `POR_PAGINA`, `limitarPagina` (Task 1).
- Produces:
  - `type FiltroNoticias = { situacao?: Situacao; busca?: string; autorId?: string; ano?: number; pagina?: number }`
  - `listarNoticias(db, u, filtro: FiltroNoticias): Promise<Resultado<{ itens: ItemLista[]; total: number; pagina: number; porSituacao: Record<Situacao, number> }>>`
  - `ItemLista` ganha `imagem` (miniatura).
  - `autoresDeNoticias(db, u): Promise<{ id: string; nome: string }[]>` e `anosDeNoticias(db, u): Promise<number[]>` (decrescente) para os filtros, com a mesma restrição do editor.

- [ ] **Step 1: Ajustar/escrever os testes de banco**

```ts
test('lista pagina de 20 e conta por situação com os mesmos filtros', async () => {
  for (let i = 0; i < 23; i++) await criar(rita, 'Notícia ' + i);
  const p2 = await N.listarNoticias(db, rita, { pagina: 2 }); assert.ok(p2.ok);
  assert.equal(p2.valor.itens.length, 3); assert.equal(p2.valor.total, 23); assert.equal(p2.valor.porSituacao.rascunho, 23);
  const alem = await N.listarNoticias(db, rita, { pagina: 99 }); assert.ok(alem.ok); assert.equal(alem.valor.pagina, 2);
});
test('editor só conta as próprias e as publicadas', async () => {
  await criar(edna); await criar(outro); const pub = await criar(outro, 'Publicada'); await N.publicarNoticia(db, rita, pub.id);
  const r = await N.listarNoticias(db, edna, {}); assert.ok(r.ok);
  assert.equal(r.valor.total, 2); assert.deepEqual([r.valor.porSituacao.rascunho, r.valor.porSituacao.publicada], [1, 1]);
});
test('a aba escolhida não muda as contagens das outras abas', async () => {
  await criar(rita, 'A'); const b = await criar(rita, 'B'); await N.publicarNoticia(db, rita, b.id);
  const r = await N.listarNoticias(db, rita, { situacao: 'publicada' }); assert.ok(r.ok);
  assert.equal(r.valor.total, 1); assert.equal(r.valor.porSituacao.rascunho, 1);
});
test('busca com % é literal', async () => { await criar(rita, '100% feira'); await criar(rita, 'Outra'); const r = await N.listarNoticias(db, rita, { busca: '%' }); assert.ok(r.ok); assert.equal(r.valor.total, 1); });
test('filtro por autor e ano', async () => { await criar(edna); await criar(outro); const r = await N.listarNoticias(db, rita, { autorId: 'otto', ano: 2026 }); assert.ok(r.ok); assert.equal(r.valor.total, 1); });
```

Os três testes existentes (linhas 130-140) passam a ler `r.valor.itens`.

- [ ] **Step 2:** `npm run test:db` → FAIL.
- [ ] **Step 3:** Implementar. Uma lista de condições-base (restrição do editor, busca, autor, ano via `year(data)`), usada em três consultas: `count` total com a situação, `select` com `limit 20 offset (pagina-1)*20` ordenado por `atualizadaEm desc`, e `select situacao, count(*) group by situacao` sem a situação. A página é limitada com `limitarPagina` depois do `count`. Situações sem linhas aparecem com 0.
- [ ] **Step 4:** `npm run test:db` e `npm run build` → PASS.
- [ ] **Step 5:** `git commit -m "feat(admin): notícias paginadas com contagem por situação e filtros"`

### Task 3: Mensagens paginadas, marcar/apagar e resumo do painel

**Files:**
- Modify: `lib/admin/contatos.ts:42-45`, `app/(admin)/admin/(painel)/contatos/page.tsx` (usar `.itens`)
- Create: `lib/admin/painel.ts`
- Test: `lib/admin/contatos.db-test.ts` (novo), `lib/admin/painel.db-test.ts` (novo)

**Interfaces:**
- Produces:
  - `listarContatos(db, u, filtro: { lida?: boolean; formulario?: Formulario; pagina?: number }): Promise<Resultado<{ itens: LinhaContato[]; total: number; pagina: number; novas: number; lidas: number }>>` (contagens respeitam `formulario`, não `lida`).
  - `marcarContatos(db, u, ids: string[], lida: boolean): Promise<Resultado<number>>` e `apagarContatos(db, u, ids: string[]): Promise<Resultado<number>>` → quantidade afetada; ids inválidos ignorados; exigem `contatos.ver`.
  - `naoLidas(db, u): Promise<number>` (0 sem permissão).
  - `resumoPainel(db, u): Promise<{ publicadas?: number; emRevisao?: number; eventosFuturos: number; mensagensNovas?: number }>` → chave ausente quando o papel não vê aquilo (`emRevisao` só com `noticia.publicar`; `mensagensNovas` só com `contatos.ver`; `publicadas` com `noticia.criar`). `eventosFuturos` usa `hojeIso()` de `lib/datas.ts`.

- [ ] **Step 1: Testes**

```ts
test('editor não lista, marca nem apaga mensagens', async () => { assert.equal((await C.listarContatos(db, edna, {}) as Falha).erro, 'sem-permissao'); assert.equal((await C.apagarContatos(db, edna, [id1]) as Falha).erro, 'sem-permissao'); });
test('marcar como lidas e contar', async () => { const r = await C.marcarContatos(db, ada, [id1, id2, 'lixo'], true); assert.ok(r.ok); assert.equal(r.valor, 2); const l = await C.listarContatos(db, ada, { lida: false }); assert.ok(l.ok); assert.equal(l.valor.novas, 1); assert.equal(l.valor.lidas, 2); });
test('apagar remove só os ids pedidos', async () => { await C.apagarContatos(db, ada, [id1]); const l = await C.listarContatos(db, ada, {}); assert.ok(l.ok); assert.equal(l.valor.total, 2); });
test('resumoPainel por papel', async () => { const e = await resumoPainel(db, edna); assert.equal('emRevisao' in e, false); assert.equal('mensagensNovas' in e, false); const a = await resumoPainel(db, ada); assert.equal(a.mensagensNovas, 3); });
```

(`ada` admin, `edna` editor; três mensagens criadas com `registrarContato` no `beforeEach`.)

- [ ] **Step 2:** `npm run test:db` → FAIL.
- [ ] **Step 3:** Implementar com `inArray` do Drizzle, filtrando os ids pelo mesmo regex de `idValido` antes da consulta; lista vazia retorna `ok(0)` sem consulta.
- [ ] **Step 4:** `npm run test:db` → PASS.
- [ ] **Step 5:** `git commit -m "feat(admin): mensagens paginadas, marcar e apagar, resumo do painel"`

### Task 4: Esqueleto visual (CSS, ícones, lateral, gaveta)

**Files:**
- Modify: `app/(admin)/admin.css` (reorganizar em seções: tokens, esqueleto, cabeçalho, tabela, abas, formulário, caixas, avisos, gaveta, responsivo; manter tokens atuais)
- Modify: `components/Ico.tsx` (ícones: `news`, `users`, `user`, `logout`, `edit`, `eye`, `trash`, `home`, `star` para ex-presidentes; traço 24×24 igual aos existentes)
- Modify: `components/admin/Menu.tsx`, `app/(admin)/admin/(painel)/layout.tsx`
- Create: `components/admin/Gaveta.tsx` (client)

**Interfaces:**
- Consumes: `naoLidas` (Task 3).
- Produces:
  - `ItemMenu = { href: string; rotulo: string; icone: IconName; acao?: Acao; contador?: number }`
  - `<Gaveta>{children}</Gaveta>`: abaixo de 900px mostra a barra superior verde com botão "Abrir menu" (`aria-expanded`, `aria-controls`); fecha com Esc, botão fechar, clique fora e mudança de `usePathname()`; prende o foco enquanto aberta e devolve ao botão. Acima de 900px não interfere (lateral fixa).
  - Classes CSS usadas pelas Tasks 5-10: `.cabecalho`, `.migalhas`, `.abas`, `.tabela`, `.tabela .acoes-linha`, `.massa`, `.paginacao`, `.aviso.ok|.erro|.info`, `.duas-colunas`, `.caixa`, `.contadores`, `.contador`.

- [ ] **Step 1:** Implementar o layout: item ativo com fundo `--mata-2` e filete `--amarelo`; contador amarelo em Mensagens (só se `naoLidas > 0`); rodapé com avatar, nome, papel, "Ver site", "Sair".
- [ ] **Step 2:** Verificar no navegador (`preview_start` "site", logado como admin): 1440px lateral fixa; 390px gaveta abre, fecha com Esc e ao navegar, foco volta ao botão; sem rolagem horizontal (`document.documentElement.scrollWidth <= innerWidth`). Console sem erros.
- [ ] **Step 3:** `npm run build` → PASS.
- [ ] **Step 4:** `git commit -m "feat(admin): esqueleto novo com ícones, contador e gaveta no celular"`

### Task 5: Componentes de lista e formulário

**Files:**
- Create em `components/admin/`: `Cabecalho.tsx`, `Abas.tsx`, `Tabela.tsx`, `Paginacao.tsx`, `Aviso.tsx`, `CaixaLateral.tsx`, `BarraMassa.tsx` (client), `AvisoSaida.tsx` (client)

**Interfaces:**
- Consumes: `urlCom`, `paginasVisiveis`, `POR_PAGINA` (Task 1); classes da Task 4.
- Produces:
  - `Cabecalho({ migalhas: { href?: string; rotulo: string }[]; titulo: string; acao?: { href: string; rotulo: string }; extra?: ReactNode })`
  - `Abas({ caminho, params, chave, abas: { valor?: string; rotulo: string; total: number }[] })` → links via `urlCom`, `aria-current="page"` na ativa.
  - `Tabela<T>({ colunas: { titulo: string; classe?: string; celula: (l: T) => ReactNode }[]; linhas: T[]; chave: (l: T) => string; selecionavel?: boolean; vazio: ReactNode })` → com `selecionavel`, primeira coluna é `<input type="checkbox" name="ids" value=… form="massa">` e o cabeçalho tem "Selecionar todas desta página" (rótulo para leitor de tela). No celular vira cartões só com CSS (`data-titulo` em cada célula).
  - `Paginacao({ caminho, params, pagina, total })` → "1–20 de 218" e links; nada se `total <= 20`.
  - `Aviso({ tipo: 'ok' | 'erro' | 'info'; children })` → `role="status"` para ok/info, `role="alert"` para erro.
  - `CaixaLateral({ titulo, children })`.
  - `BarraMassa({ acao: (f: FormData) => Promise<void>; acoes: { valor: string; rotulo: string; perigo?: boolean }[]; nome: string })` → `<form id="massa" action={acao}>`; conta os checkboxes marcados (`aria-live="polite"`: "2 selecionadas"); com 0 selecionados o clique mostra "Selecione ao menos um item" em vez de enviar; ação `perigo` pede `confirm("Apagar N <nome>?")`. Faz o "selecionar todas" funcionar.
  - `AvisoSaida({ formId: string })` → marca alterado em `input`/`change` do form; `beforeunload` e clique em `<a>` interno pedem confirmação enquanto alterado; o `submit` do próprio form zera o estado antes de enviar.

- [ ] **Step 1:** Implementar os componentes.
- [ ] **Step 2:** `npm run build` → PASS. (O comportamento é verificado nas telas, Tasks 6-11.)
- [ ] **Step 3:** `git commit -m "feat(admin): componentes de cabeçalho, abas, tabela, paginação, avisos e massa"`

### Task 6: Lista de notícias com ação em massa

**Files:**
- Modify: `app/(admin)/admin/(painel)/noticias/page.tsx`, `app/(admin)/admin/(painel)/noticias/acoes.ts`
- Create: `lib/admin/massa.ts`
- Test: `lib/admin/noticias.db-test.ts`

**Interfaces:**
- Consumes: Tasks 1, 2, 5.
- Produces:
  - `noticiasEmMassa(db, u, acao: 'publicar' | 'despublicar' | 'apagar', ids: string[]): Promise<{ resumo: ReturnType<typeof resumoMassa>; slugs: string[] }>` em `lib/admin/massa.ts` → chama `publicarNoticia` / `despublicarNoticia` / `apagarNoticia` por id, em sequência; `slugs` das que mudaram.
  - Server Action `noticiasMassa(f: FormData): Promise<void>` em `noticias/acoes.ts`: `lerIds` (null → redireciona com `?erro=massa-limite`), chama `noticiasEmMassa`, `revalidatePath('/', 'layout')` uma vez se houve mudança, redireciona para a mesma lista com `?msg=` (texto de `textoMassa`).

- [ ] **Step 1: Testes**

```ts
test('editor não publica em massa', async () => { const a = await criar(outro, 'A'); await N.enviarNoticia(db, outro, a.id); const r = await noticiasEmMassa(db, edna, 'publicar', [a.id]); assert.deepEqual(r.resumo, { feitas: 0, recusadas: 1, naoEncontradas: 0 }); assert.equal((await situacao(a.id)).situacao, 'revisao'); });
test('revisor publica em massa', async () => { const a = await criar(edna, 'A'), b = await criar(edna, 'B'); const r = await noticiasEmMassa(db, rita, 'publicar', [a.id, b.id, 'nao-existe']); assert.deepEqual(r.resumo, { feitas: 2, recusadas: 0, naoEncontradas: 1 }); assert.equal(r.slugs.length, 2); });
```

- [ ] **Step 2:** `npm run test:db` → FAIL.
- [ ] **Step 3:** Implementar `massa.ts` e a página: `Cabecalho` (Início / Notícias, "+ Nova notícia"), `Abas` (Todas + `SITUACOES` com `porSituacao`), busca + selects de autor e ano (form GET), `BarraMassa` só com as ações em que `pode(u, …)` é possível para algum papel (editor não vê Publicar/Despublicar), `Tabela` (miniatura + título com ações rápidas Editar · Prévia · Ver no site (só publicada), autor, data `dshort`, selo), `Paginacao`. Busca sem resultado: "Nenhuma notícia com esses filtros" + link "Limpar filtros"; sem nenhuma notícia: convite + botão. `?msg` mostra `Aviso ok`. Falha de banco ao listar (exceção em `listarNoticias`): `Aviso erro` "Não foi possível carregar a lista." com link "Tentar de novo" para a mesma URL, sem quebrar o layout; o mesmo padrão vale para as listas das Tasks 8-10.
- [ ] **Step 4:** `npm run test:db`, `npm run build` → PASS; no navegador: abas, filtros e paginação mantêm a URL; seleção em massa publica duas notícias.
- [ ] **Step 5:** `git commit -m "feat(admin): lista de notícias com abas, filtros, paginação e ações em massa"`

### Task 7: Formulário de notícia em duas colunas

**Files:**
- Modify: `components/admin/FormNoticia.tsx`, `app/(admin)/admin/(painel)/noticias/[id]/page.tsx`, `app/(admin)/admin/(painel)/noticias/nova/page.tsx`

**Interfaces:**
- Consumes: `Cabecalho`, `CaixaLateral`, `Aviso`, `AvisoSaida` (Task 5). A Server Action `agirNoticia` e os nomes dos campos (`titulo`, `slug`, `data`, `resumo`, `alt`, `foto`, `imagemAtual`, `corpo`, `acao`, `id`) **não mudam**.

- [ ] **Step 1:** Reestruturar: esquerda com título, slug (travado depois de publicada, como hoje) e `EditorBlocos`; direita com caixas Publicação (selo, autor, data, botões que `pode()` libera), Imagem de destaque (prévia + alt) e Resumo. Depois de salvar: `Aviso ok` "Salvo às HH:MM". Celular: Publicação logo após o título, demais caixas abaixo do conteúdo (ordem via CSS `order`). `AvisoSaida` ligado ao form.
- [ ] **Step 2:** Navegador: criar, salvar, enviar, publicar e devolver continuam funcionando; editar um campo e clicar em "Notícias" pede confirmação; salvar e navegar não pede.
- [ ] **Step 3:** `npm run build` → PASS; `git commit -m "feat(admin): formulário de notícia em duas colunas"`

### Task 8: Início

**Files:**
- Modify: `app/(admin)/admin/(painel)/page.tsx`

**Interfaces:**
- Consumes: `resumoPainel` (Task 3), `listarNoticias` (Task 2), `listarContatos` (Task 3).

- [ ] **Step 1:** Saudação + botões "Nova notícia" (`noticia.criar`) e "Novo evento" (`agenda.editar`); `.contadores` com os campos presentes em `resumoPainel`, cada um link para a lista filtrada (`/admin/noticias?situacao=publicada`, `?situacao=revisao`, `/admin/agenda`, `/admin/contatos?lida=nao`); cartões Aguardando revisão, Devolvidas para você, Próximos eventos (5), Mensagens recentes (5, `contatos.ver`).
- [ ] **Step 2:** Navegador como admin e como editor (editor não vê "Em revisão" nem mensagens). `npm run build` → PASS.
- [ ] **Step 3:** `git commit -m "feat(admin): início com contadores e atalhos"`

### Task 9: Agenda e Mensagens

**Files:**
- Modify: `app/(admin)/admin/(painel)/agenda/page.tsx`, `agenda/acoes.ts`, `components/admin/FormEvento.tsx`, `agenda/[id]/page.tsx`, `agenda/novo/page.tsx`
- Modify: `app/(admin)/admin/(painel)/contatos/page.tsx`, `contatos/[id]/page.tsx`
- Create: `app/(admin)/admin/(painel)/contatos/acoes.ts`

**Interfaces:**
- Consumes: Tasks 1, 3, 5.
- Produces: Server Actions `eventosMassa(f)` (só `apagar`, via `apagarEvento` por id; revalida `/` e `/agenda`) e `contatosMassa(f)` (`lida`, `nao-lida`, `apagar`).

- [ ] **Step 1:** Agenda: abas Próximos / Passados (contagens de `separarEventos`), `paginar` em memória, tabela (título, data, horário, local), massa "Apagar". `FormEvento` no esqueleto de duas colunas (caixa Ações: Salvar, Apagar) com `AvisoSaida`.
- [ ] **Step 2:** Mensagens: abas Todas / Novas / Lidas (`?lida=nao|sim`), filtro de formulário (`FORMULARIOS`), tabela (nome, e-mail, formulário, data, selo "Nova"), massa Marcar como lida / Marcar como não lida / Apagar. Detalhe com `Cabecalho` e cartão.
- [ ] **Step 3:** Navegador: apagar evento em massa some de `/agenda`; marcar como lida zera o contador da lateral. `npm run build` → PASS.
- [ ] **Step 4:** `git commit -m "feat(admin): agenda e mensagens no padrão novo, com ações em massa"`

### Task 10: Usuários, diretoria, ex-presidentes, conta, entrar e trocar senha

**Files:**
- Modify: `usuarios/page.tsx`, `usuarios/[id]/page.tsx`, `components/admin/FormsUsuarios.tsx`, `diretoria/page.tsx`, `diretoria/[id]/page.tsx`, `ex-presidentes/page.tsx`, `ex-presidentes/[id]/page.tsx`, `components/admin/FormsDiretoria.tsx`, `conta/page.tsx`, `components/admin/FormsConta.tsx`, `app/(admin)/admin/entrar/page.tsx`, `app/(admin)/admin/trocar-senha/page.tsx`

**Interfaces:**
- Consumes: Task 5. Server Actions e nomes de campos não mudam.

- [ ] **Step 1:** Usuários: tabela paginada em memória (nome, e-mail, papel, situação ativo/desativado), sem massa; formulário no esqueleto de duas colunas. Diretoria e ex-presidentes: `Cabecalho` + cartões por grupo, `Mover` como está. Conta: cartões. Entrar e trocar senha: tela centralizada com a marca, erros em `Aviso`.
- [ ] **Step 2:** Navegador nas cinco áreas, 390 e 1440 px. `npm run build` → PASS.
- [ ] **Step 3:** `git commit -m "feat(admin): demais telas no padrão novo"`

### Task 11: Testes de navegador, capturas e verificação final

**Files:**
- Modify: `testes/admin.py`
- Create: `docs/comparativo/admin-parte1/*.png`

- [ ] **Step 1:** Ajustar seletores de `testes/admin.py` ao layout novo (o fluxo atual inteiro continua). Novas jornadas: revisor publica duas notícias em massa e as duas aparecem em `/noticias`; `/admin/noticias?pagina=2&situacao=publicada` mantém o filtro ao trocar de página; em 390px a gaveta abre com o botão e fecha com Esc; editar o título e clicar em "Notícias" dispara o diálogo (`page.on('dialog')`), salvar e navegar não dispara.
- [ ] **Step 2:** `python testes/admin.py` → todas as checagens OK.
- [ ] **Step 3:** Capturas de Início, Notícias, formulário de notícia, Agenda, Mensagens, Usuários, Diretoria, Entrar em 390 e 1440 px em `docs/comparativo/admin-parte1/`; conferir que nenhuma tem rolagem horizontal.
- [ ] **Step 4:** `npm test`, `npm run test:db`, `npm run build`, `python testes/paridade.py` (22/22), `python testes/jornadas.py`, `python testes/verificar_links.py`, `node --test testes/logica.test.js` → todos verdes.
- [ ] **Step 5:** `git commit -m "test(admin): jornadas da parte 1 e capturas"`
