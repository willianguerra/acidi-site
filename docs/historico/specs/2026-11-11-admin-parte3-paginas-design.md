# Admin, parte 3: páginas editáveis

Data: 2026-11-11 · Status: design aprovado em conversa, aguardando revisão da spec

## Contexto

O painel edita Notícias, Agenda, Diretoria, Ex-presidentes, Mensagens e Usuários. O resto do site
(Home, Histórico, Núcleos, Representatividade, Para seu negócio, Auditório, Associe-se, Contato e
os cabeçalhos de Notícias, Agenda, Diretoria e Ex-presidentes) tem o texto fixo no JSX de cada
`page.tsx`. Para mudar uma frase é preciso um desenvolvedor, e não há como criar uma página nova.

Esta é a parte 3 das cinco da reforma do admin (ver `2026-11-06-admin-parte1-visual-design.md`).

## Objetivo e critério de sucesso

- O Admin edita pelo painel o texto comum de todas as páginas do site e os textos fixos da Home.
- O Admin cria páginas novas, escolhe se entram no menu (e em qual grupo) ou ficam só com o link,
  deixa em rascunho e publica.
- Parágrafos e listas aceitam negrito e link; o editor de blocos ganha Subtítulo e Imagem.
- Depois da carga, o site público fica idêntico: `testes/paridade.py` sem divergências, e os testes
  atuais continuam verdes.

## Fora do escopo

- As partes especiais das páginas atuais continuam no código: formulários, galeria do auditório,
  cartões de serviços, benefícios, pleitos por esfera, conselhos, assuntos do contato, faixa de
  ex-presidentes, navegações laterais (`localnav`) e os breadcrumbs das páginas atuais. Tornar as
  listas (Serviços, Benefícios, Galeria, Pleitos, Assuntos) editáveis é a próxima etapa, com spec
  própria.
- Na Home: botões, fotos, ícones, faixa de acesso rápido, parceiros, contatos e as listas
  automáticas (serviços, notícias, agenda, pleitos).
- Itens fixos do menu do site (não mudam nem trocam de ordem).
- Revisão/fluxo de aprovação, versões, agendamento, lixeira, seções montáveis.
- Nenhuma dependência nova.

## Decisões

| Pergunta | Decisão |
|---|---|
| Editar atuais ou criar novas? | Os dois. |
| Que páginas novas? | Institucionais (no menu "A ACIDI" ou "Para seu negócio") ou avulsas (só link). |
| Quem edita? | Só Admin, sem revisão. Salvar uma página publicada publica na hora. |
| Home? | Formulário próprio só com os textos fixos. |
| Abordagem | Molde comum no banco + partes especiais no código ("A"). Listas editáveis depois ("B"). |

## Dados

Tabela nova `paginas`:

| Coluna | Tipo | Observação |
|---|---|---|
| `id` | `id()` | |
| `fixa` | varchar(30), nulo | Chave da página atual (`home`, `historico`, `nucleos`, `representatividade`, `para-seu-negocio`, `auditorio`, `associe-se`, `contato`, `noticias`, `agenda`, `diretoria`, `ex-presidentes`). Nulo = página criada no painel. Único. |
| `slug` | `chave()` único | Endereço. Para as fixas é o caminho atual (`''` na Home); travado. |
| `nome` | text | Nome no menu e no painel. |
| `situacao` | `'rascunho' \| 'publicada'` | Fixas são sempre `publicada`. |
| `descricao` | text | Meta description. |
| `menu` | `'acidi' \| 'negocio'`, nulo | Só páginas novas. Nulo = fora do menu. |
| `menuTexto` | text, nulo | Frase curta do painel suspenso do menu. |
| `ordem` | int | Ordem dentro do grupo do menu. |
| `conteudo` | `json<ConteudoPagina \| ConteudoHome>()` | Ver abaixo. |
| `atualizadaEm`, `atualizadaPorId` | `agora()`, `ref()` | Também usado no bloqueio otimista. |

```ts
type Formatado = string; // aceita **negrito** e [texto](endereço)
type ConteudoPagina = {
  cabecalho: { etiqueta: string; titulo: string; destaque: string; chamada: Formatado;
               foto: { src: string; alt: string; legenda: Formatado } | null };
  lateral: { texto: Formatado; botao: { texto: string; href: string } | null } | null;
  corpo: Bloco[];
};
type ConteudoHome = {
  destaque: { etiqueta: string; linha1: string; negrito: string; chamada: string; desde: string };
  quemSomos: { etiqueta: string; titulo: string; negrito: string; chamada: string;
               pilares: [Pilar, Pilar, Pilar] };           // Pilar = { titulo: string; texto: string }
  servicos: Secao; noticias: Secao; representatividade: Secao & { sub: string };
  auditorio: Secao; associe: Secao;                       // Secao = { titulo; negrito; chamada }
};
```

`Bloco` ganha dois tipos: `{ subtitulo: string }` e `{ imagem: { src; alt; legenda } }`. Strings de
parágrafo, itens de lista e de tabela passam a ser `Formatado`. Notícias ganham isso de graça.

O título com negrito segue o padrão do site: `titulo` + `<b>destaque</b>` dentro do `h1`.

## Site público

- `lib/content.ts` ganha `getPagina(fixa | slug)`, `getHome()` e `getPaginasMenu()`.
- Componente `Molde` renderiza cabeçalho (`PageHead`, com ou sem foto), lateral e corpo, gerando o
  mesmo HTML de hoje. Lateral vazia some; corpo vazio não renderiza a seção.
- Cada `page.tsx` atual troca o JSX fixo da parte comum por `Molde`/`PageHead` com os dados do
  banco; as partes especiais ficam como estão e no mesmo lugar. Onde a lateral é uma `localnav`
  (Histórico, Para seu negócio), ela continua no código e o campo lateral não aparece no painel.
- `metadata` das páginas passa a usar `generateMetadata` com `nome` e `descricao` do banco.
- Página nova: rota `app/(site)/[pagina]/page.tsx`. Só abre `publicada`; senão `notFound()`.
  Breadcrumb "Início › A ACIDI › Nome" (ou "Para seu negócio"), ou "Início › Nome" fora do menu.
  `Header` recebe a chave/slug para marcar a página atual.
- `Header`: as páginas novas publicadas com `menu` entram depois dos itens fixos do grupo, no
  painel suspenso e no menu do celular, em `ordem`.
- `sitemap.ts` inclui as páginas novas publicadas.
- `Formatado` é convertido por `lib/formatado.tsx` em nós React (`<b>`, `<a>`), nunca HTML cru.
  Links aceitos: começando com `/`, `#`, `https://`, `http://`, `mailto:` e `tel:`; outro esquema
  vira texto. Links externos (`http`) abrem em nova aba com `Ext`, como no resto do site.
- Página fixa sem linha no banco: erro no servidor com a mensagem "página <fixa> sem conteúdo no
  banco: rode npm run db:carga".

## Painel

- Permissão nova `paginas.editar` em `lib/admin/permissoes.ts`: só Admin.
- Menu: "Páginas" na seção Conteúdo, depois de Agenda, ícone de documento.
- Lista `/admin/paginas`: Home fixada no topo; depois grupos "A ACIDI", "Para seu negócio",
  "Páginas fixas" e "Fora do menu". Colunas: nome, endereço, situação, última alteração.
  `Mover` reordena páginas novas dentro do grupo. Botão "Nova página". Sem busca nem paginação
  (são poucas).
- Formulário `/admin/paginas/[id]` e `/admin/paginas/nova` (layout de duas colunas da notícia):
  - Principal: Cabeçalho (etiqueta, título, negrito, chamada, foto com upload, alt, legenda),
    Coluna lateral (texto, botão texto + endereço), Corpo (`EditorBlocos`).
  - Lateral: Publicação (Salvar rascunho / Publicar / Salvar / Tirar do ar / Apagar / Prévia),
    Endereço (editável só em página nova), Menu (nenhum / A ACIDI / Para seu negócio + frase),
    Descrição para o Google.
  - Página fixa: esconde endereço, menu, Tirar do ar e Apagar, e os blocos que ela não usa (lista
    por chave em `lib/admin/paginas.ts`). Aviso: "Formulário, galeria e listas desta página
    continuam fixos por enquanto."
  - Apagar pede confirmação (`BotaoApagar`).
- Formulário da Home `/admin/paginas/home`: uma `CaixaLateral` por seção na ordem do site; Salvar
  publica.
- Prévia: `app/(site)/admin/previa/pagina/[id]` renderiza o rascunho com o mesmo `Molde`, só para
  quem tem `paginas.editar`.
- `EditorBlocos` ganha os tipos Subtítulo e Imagem (upload como na foto da notícia) e uma dica
  "Use **negrito** e [texto](endereço)" abaixo dos campos de texto.
- `AvisoSaida` e bloqueio otimista (`atualizadaEm`) iguais aos outros formulários.

## Carga

`scripts/carga.ts` passa a inserir as 12 páginas fixas com o texto atual exato (copiado do JSX,
convertendo `<b>` e `<a>` para `Formatado`). `INSERT IGNORE` por `fixa`: rodar de novo não
sobrescreve edições.

## Erros e validação (servidor)

- Toda Server Action chama `pode(u, 'paginas.editar')` de novo.
- Obrigatórios: nome, título, chamada; endereço em página nova.
- Endereço: `^[a-z0-9]+(-[a-z0-9]+)*$`, até 80 caracteres, único, fora da lista de reservados
  (todas as rotas de `app/(site)` e `app/` mais `admin`, `api`, `assets`, `uploads`, `_next`,
  `sitemap.xml`, `robots.txt`).
- Foto/imagem: alt obrigatório; upload JPG, PNG ou WebP até 8 MB, mesmas mensagens das notícias.
- Botão: texto e endereço juntos ou nenhum dos dois. Endereços com esquema não aceito são recusados
  no campo.
- Tamanhos máximos: títulos 200, chamadas e textos 1000, descrição 300, corpo 200 blocos.
- Conflito de edição: "Outra pessoa salvou esta página enquanto você editava. Recarregue para ver a
  versão nova." sem sobrescrever.
- Erros aparecem no campo com o aviso padrão "Confira os campos destacados."

## Testes

- Unitários (`node --test`): `formatado` (negrito, link, `javascript:` vira texto, `<` escapado,
  asterisco solto), validação de página e da Home, endereços reservados, `pode()` com
  `paginas.editar` para os três papéis, conversão do editor para os blocos novos.
- Banco (`*.db-test.ts`): criar, editar, publicar, tirar do ar, apagar, endereço repetido,
  conflito de edição, reordenar no menu, fixa não pode ser apagada, carga idempotente.
- Visual: `testes/paridade.py` sem divergências após a carga.
- Jornada (navegador): editar o título do Histórico e ver no site; criar página no menu "A ACIDI",
  publicar e ver no menu (computador e celular) e no sitemap; rascunho dá 404 no site e abre na
  prévia; editar um texto da Home e ver no site.
