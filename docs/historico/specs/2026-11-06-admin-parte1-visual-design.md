# Admin, parte 1: visual e navegação

## Contexto

O admin da Fase 2 funciona (papéis, fluxo de revisão, bloqueio otimista, upload), mas tem cara de
protótipo: um `admin.css` de 116 linhas, listas simples sem paginação, filtro por select, nenhum
ícone, Início quase vazio e formulários sem padrão. Quem vinha do WordPress sente falta de tudo isso.

A reforma do admin foi dividida em cinco partes, cada uma com spec própria:

1. **Visual e navegação** (esta spec)
2. Acesso e permissões (papéis editáveis, permissões por módulo, registro de atividade)
3. Páginas institucionais editáveis
4. Conteúdo rico (editor de notícia melhor, biblioteca de mídia)
5. Recursos de produção (agendar, lixeira, versões, SEO)

Esta parte vem primeiro porque as telas das outras partes vão usar os componentes criados aqui.

## Objetivo e critério de sucesso

- O admin parece um produto da ACIDI: identidade verde-mata e amarelo, ícones, hierarquia clara.
- Todas as telas atuais usam os mesmos componentes de lista, formulário e aviso.
- As listas de notícias (mais de 200 vindas do WordPress) carregam paginadas.
- O site público não muda: paridade 22/22 e os testes atuais continuam verdes.

## Fora do escopo

Páginas institucionais, biblioteca de mídia, editor rico, novos papéis e permissões, agendamento,
lixeira, versões, SEO (partes 2 a 5). O menu não mostra itens de telas que ainda não existem.
Nenhuma dependência nova.

## Direção visual (aprovada com mockups)

### Esqueleto

- Lateral fixa verde-mata (`--mata`), como hoje, mais bem acabada: ícone em cada item, o item ativo
  com fundo `--mata-2` e filete amarelo à esquerda, e contador amarelo de mensagens não lidas em
  "Mensagens".
- No rodapé da lateral ficam o avatar, o nome, o papel, "Ver site" e "Sair".
- Topo do conteúdo (`Cabecalho`): breadcrumb ("Início / Notícias / Editar"), título e botão
  principal à direita (por exemplo "+ Nova notícia").
- Celular (< 900px): a lateral vira gaveta aberta por um botão de menu numa barra superior verde.
  Fecha com Esc, com o botão fechar, ao clicar fora e ao navegar. O foco fica preso na gaveta
  aberta e volta ao botão quando ela fecha.

### Início

- Saudação e botões rápidos ("Nova notícia" e "Novo evento", conforme `pode()`).
- Quatro contadores: publicadas, em revisão, eventos futuros e mensagens novas. Só aparecem os que
  o papel permite ver, e cada um é um link para a lista já filtrada.
- Cartões "Aguardando revisão" (revisor/admin), "Devolvidas para você" (editor), "Próximos
  eventos" e "Mensagens recentes" (quem tem `contatos.ver`).

### Lista padrão

Vale para Notícias, Agenda, Mensagens e Usuários.

- Abas por situação, cada uma com contagem, no lugar do select. Exemplo em Notícias: Todas,
  Publicadas, Em revisão, Devolvidas, Rascunhos. Em Mensagens: Todas, Novas, Lidas.
- Busca e filtros extras específicos da tela (Notícias: autor e ano; Mensagens: formulário). O
  estado fica na URL (`?situacao=&busca=&autor=&ano=&pagina=`), então dá para voltar, recarregar e
  compartilhar a lista filtrada.
- Tabela com coluna de seleção, título com miniatura (notícias), colunas específicas e selo de
  situação. Ações rápidas abaixo do título (Editar, Prévia, Ver no site) aparecem no hover e no
  foco do teclado.
- Seleção em massa: marcar linhas ou "todas desta página" faz aparecer uma barra verde-mata com as
  ações permitidas. Apagar pede confirmação com a quantidade.
- Paginação de 20 em 20, com "1–20 de 218" e as páginas.
- Celular: cada linha vira um cartão empilhado; a seleção em massa continua disponível.
- Lista vazia: frase que convida à ação e o botão principal. Busca sem resultado: "Nenhuma notícia
  com esses filtros" e um link para limpar os filtros.

### Formulário padrão

Vale para Notícia, Evento, Membro da diretoria, Ex-presidente e Usuário.

- Duas colunas: conteúdo à esquerda e caixas laterais (`CaixaLateral`) à direita.
- Notícia: título e slug editável (travado depois de publicada, como hoje) e blocos à esquerda; à
  direita, as caixas Publicação (situação, autor, data e os botões que `pode()` libera: Prévia,
  Salvar, Enviar para revisão, Publicar, Devolver com comentário, Despublicar, Apagar), Imagem de
  destaque (com o alt obrigatório) e Resumo.
- Evento, Membro, Ex-presidente e Usuário usam o mesmo esqueleto, com a caixa lateral de ações
  (Salvar, Apagar) e os campos da tela.
- Avisos (`Aviso`): "Salvo às 14:32" no topo depois de salvar, erro geral no topo com
  `role="alert"` e mensagem por campo, como hoje. Os formulários continuam mantendo o que foi
  digitado quando há erro.
- `AvisoSaida`: com alterações não salvas, sair da página (link, voltar, fechar aba) pede
  confirmação do navegador (`beforeunload` mais interceptação de links internos).
- O editor de blocos continua o mesmo (parágrafo, lista, citação, tabela, mover, remover), só com
  o visual novo.
- Celular: as caixas laterais descem para baixo do conteúdo; a caixa Publicação fica logo depois
  do título.

### Diretoria e ex-presidentes

Ganham o novo esqueleto, cabeçalho e cartões; os grupos e a reordenação (`Mover`) continuam como
hoje. Sem tabela paginada: são poucas linhas.

### Entrar e trocar senha

Tela centralizada com a marca, o mesmo visual de campos e botões, e mensagens de erro no padrão
`Aviso`.

## Arquitetura

- CSS puro, como hoje. `app/(admin)/admin.css` é reorganizado em seções (tokens, esqueleto,
  cabeçalho, tabela, abas, formulário, caixas, avisos, gaveta, responsivo). Os tokens atuais
  (`--verde`, `--mata`, `--amarelo` etc.) são mantidos.
- Ícones: `components/Ico.tsx` ganha os que faltam para o admin (notícia, agenda, diretoria,
  ex-presidentes, mensagens, usuários, conta, sair, editar, olho, lixeira). Nenhuma biblioteca de
  ícones.
- Componentes novos em `components/admin/`, todos Server Components, a não ser onde indicado:
  - `Cabecalho`: breadcrumb, título, botão principal.
  - `Abas`: links com contagem, `aria-current` na aba ativa.
  - `Tabela`: colunas declaradas, linhas, coluna de seleção opcional, versão em cartões no celular
    (só CSS).
  - `BarraMassa` (client): guarda a seleção, mostra a barra e submete um `<form>` com os ids e a
    ação para uma Server Action.
  - `Paginacao`: links montados a partir da URL atual.
  - `Aviso`: sucesso, erro e informação.
  - `CaixaLateral`: título e conteúdo.
  - `AvisoSaida` (client): marca o formulário como alterado e avisa ao sair.
  - `Gaveta` (client): só o abrir e fechar do menu no celular; os itens continuam filtrados no
    servidor com `pode()`.
- `components/admin/Menu.tsx` passa a receber o ícone e o contador de cada item.
- `PainelLayout` busca o número de mensagens não lidas (só se o usuário tem `contatos.ver`).

### Dados

- `listarNoticias(db, u, { situacao, busca, autorId, ano, pagina })` devolve
  `{ itens, total, porSituacao }`, com 20 itens por página e as contagens por situação calculadas
  com os mesmos filtros (exceto a situação) e com a mesma restrição por papel de hoje.
- `listarContatos` e `listarEventos` ganham a mesma forma, com filtros e paginação. A lista de
  usuários é paginada do mesmo jeito.
- Novas funções em `lib/admin/contatos.ts`: `marcarContatos(db, u, ids, lida)` e
  `apagarContatos(db, u, ids)`, ambas exigindo `contatos.ver`.
- Contadores do Início: uma função `resumoPainel(db, u)` em `lib/admin/` com consultas `count`.

### Ações em massa

- Cada tela ganha uma Server Action `emMassa(formData)` que lê `acao` e `ids[]` e chama, item por
  item, a função que já existe (`publicarNoticia`, `despublicarNoticia`, `apagarNoticia`,
  `apagarEvento`, `marcarContatos`, `apagarContatos`). Cada uma já chama `pode()`, então a permissão
  continua sendo verificada por item no servidor.
- Resultado: "3 publicadas, 1 não pôde ser publicada (sem permissão)". Um item recusado não
  desfaz os outros.
- No fim, um único `revalidatePath` para as rotas afetadas.
- Limite de 100 ids por envio (uma página tem 20).

## Erros

- Falha de banco ao listar: a tela mostra o `Aviso` de erro e "Tentar de novo", sem quebrar o
  layout.
- `pagina` fora do intervalo ou inválida volta para a página 1; filtros com valor desconhecido são
  ignorados, como hoje faz `situacao`.
- Ação em massa sem nenhum item selecionado: o botão continua visível e avisa "Selecione ao menos
  um item".

## Acessibilidade

- Contraste AA em todos os textos, inclusive no verde-mata e nos selos.
- Tudo funciona pelo teclado: abas, seleção, barra em massa, gaveta, ações rápidas (visíveis no
  foco).
- Checkbox "selecionar todas" com rótulo; a barra em massa anuncia "2 selecionadas" com
  `aria-live`.
- Respeita `prefers-reduced-motion`.

## Testes

- Unidade (`node --test`): montagem dos links de paginação e de filtros a partir da URL; limites
  da página; resumo da ação em massa (contagem de sucessos e recusas).
- Integração com banco (`*.db-test.ts`): `listarNoticias` paginada com contagens por situação e
  restrição do editor; ação em massa do editor tentando publicar (todas recusadas) e do revisor
  (todas publicadas); `marcarContatos` e `apagarContatos`; `resumoPainel` por papel.
- Navegador (`testes/admin.py`): seletores ajustados ao layout novo; jornadas novas: o revisor
  publica duas notícias em massa e elas aparecem no site; a paginação de notícias navega e mantém
  o filtro; a gaveta abre e fecha no celular; sair com alterações pede confirmação.
- Visual: capturas de cada tela em 390 e 1440 px salvas em `docs/comparativo/admin-parte1/`, sem
  rolagem horizontal.
- Site público: `testes/paridade.py` 22/22, `jornadas.py`, `verificar_links.py`,
  `logica.test.js`, `npm test` e `npm run build` verdes.
