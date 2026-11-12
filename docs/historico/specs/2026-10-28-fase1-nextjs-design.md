# Fase 1 — Site público em Next.js

Data: 2026-10-28 · Status: aprovado em conversa, aguardando revisão da spec

## Contexto

O site da ACIDI é hoje um conjunto de HTMLs estáticos gerados por `ferramentas/gerar_site.py`
(12 páginas + 10 notícias), com `assets/css/site.css`, `assets/js/site.js`, fontes, imagens e vídeo.
O visual está aprovado. O objetivo final é Next.js com admin próprio, em 4 fases:

1. **Site público em Next.js** (esta spec): mesmas páginas, conteúdo em arquivos de dados.
2. Banco + login com papéis + admin de Notícias, Agenda, Diretoria e Ex-presidentes.
3. Textos institucionais das páginas editáveis pelo admin.
4. Formulários reais: salvos no banco, caixa de entrada no admin, aviso por e-mail (SMTP).

Stack decidida para as fases seguintes: PostgreSQL + Drizzle, Better Auth (papéis), storage
compatível com S3 para imagens, nodemailer/SMTP. Hospedagem ainda indefinida: o código deve
rodar tanto em VPS (Node) quanto na Vercel. Nada disso entra na Fase 1.

## Objetivo da Fase 1

O mesmo site, visualmente idêntico, servido por Next.js. Critério de pronto: as capturas de
`testes/comparar.py` do site Next batem com as do site atual, e `jornadas.py`, `movimento.py`,
`logica.test.js` e a checagem de links passam.

## Fora do escopo

Banco, autenticação, admin, envio real de formulários, deploy e escolha de hospedagem,
redesign ou mudança de texto, migração do `site.js` para React.

## Decisões

### Projeto
- Next.js (App Router) + TypeScript, na **raiz do repositório**. Sem Tailwind nem biblioteca de UI.
- `assets/` passa para `public/assets/` mantendo a estrutura interna (`css`, `fonts`, `img`, `js`, `video`).
- Todos os caminhos de assets viram **absolutos** (`/assets/img/x.jpg`). Os relativos de hoje
  quebrariam em rotas aninhadas como `/noticias/[slug]`.
- `motion/` e `docs/` não mudam.

### Rotas (todas geradas estaticamente)

| Hoje | Next |
|---|---|
| `index.html` | `/` |
| `historico.html` | `/historico` |
| `diretoria.html` | `/diretoria` |
| `ex-presidentes.html` | `/ex-presidentes` |
| `representatividade.html` | `/representatividade` |
| `nucleos.html` | `/nucleos` |
| `para-seu-negocio.html` | `/para-seu-negocio` |
| `noticias.html` | `/noticias` |
| `noticia-<slug>.html` | `/noticias/<slug>` (`generateStaticParams`) |
| `agenda.html` | `/agenda` |
| `auditorio.html` | `/auditorio` |
| `associe-se.html` | `/associe-se` |
| `contato.html` | `/contato` |

- Os `*.html` antigos ganham redirect 301 no `next.config.ts`, gerados por loop a partir da
  tabela acima. Âncoras (`#servico`) seguem no destino.

### Moldura e componentes
- `app/layout.tsx` substitui `head()`, `header()` e `footer()`. O `<title>` e a description de
  cada página vêm de `metadata`/`generateMetadata`, mantendo o sufixo
  `· ACIDI – Associação Empresarial de Indaial`.
- O estado "página atual" do menu (`cur()`) é calculado a partir da rota: cada página passa a
  sua chave ao cabeçalho, e o cabeçalho continua um Server Component.
- Os blocos reaproveitados do gerador viram componentes em `components/`: `Ico`, `Ext`,
  `Crumbs`, `PageHead` (`phead`), `EventItem` (`ev_item`), `Story`, `JoinBox`, `DemoNotice`,
  `Field`, `FormEnd`. O HTML que eles produzem deve ser igual ao do gerador (mesmas classes,
  atributos `data-*`, `aria-*` e ids).
- Os ícones (`P` do gerador) viram um objeto em `components/Ico.tsx`.

### Conteúdo
- As listas do gerador viram dados tipados em `content/`: serviços, eventos, notícias
  (com corpo em blocos, como `corpo()` usa hoje), diretoria (VPS, CONSULTIVO, DELIB, DELIB_S),
  ex-presidentes (EXP), galeria do auditório (GAL), benefícios (BENEF), assuntos de contato
  (ASSUNTOS) e os links fixos (WhatsApp, mapa, redes, endereço).
- As páginas **não importam `content/` diretamente**. Usam funções assíncronas em
  `lib/content.ts` (`getNoticias()`, `getNoticia(slug)`, `getEventos()`, `getDiretoria()`,
  `getExPresidentes()` etc.). Na Fase 2 só o corpo dessas funções troca para o banco.
- Textos longos e institucionais ficam no JSX de cada página até a Fase 3.
- Datas: a agenda continua sendo separada no servidor pela data do build (equivalente ao
  `HOJE` do gerador) e recalculada no navegador pelo `site.js`, como hoje.

### JavaScript
- `site.js` não muda. É carregado no layout com `next/script` (`strategy="afterInteractive"`),
  depois de o HTML existir, como hoje.
- Links internos usam `<a>` comum (recarga completa), **não** `<Link>`. Com navegação
  client-side o `site.js` não rodaria de novo, e menus, agenda, formulários e animações
  deixariam de funcionar.
- Componentes interativos não usam estado React na Fase 1: tudo é Server Component. Isso evita
  divergência de hidratação com o DOM que o `site.js` altera.
- Os formulários continuam demonstrativos (`form.demo`, aviso "Formulário demonstrativo").

## Verificação

1. Antes de qualquer mudança: `python testes/comparar.py antes http://127.0.0.1:8766/` com o
   site estático atual servido.
2. Com o Next rodando (`next build && next start`): `comparar.py depois <url>`. As capturas
   devem bater, e diferenças são corrigidas até sumirem ou serem justificadas.
3. `jornadas.py` e `movimento.py` apontados para o Next, com as URLs da tabela acima.
4. `verificar_links.py` adaptado para rastrear o servidor local em vez de ler arquivos do disco,
   e confirmar também que cada `*.html` antigo redireciona com 301.
5. `node testes/logica.test.js` continua passando, já que o `site.js` é o mesmo.
6. Console do navegador sem erros em todas as páginas, incluindo erros de hidratação.

Só depois de tudo passar: remover `ferramentas/gerar_site.py` e os `*.html` da raiz, atualizar
`README.md`/`LEIAME.md`/`docs/DOCUMENTACAO.md` com os comandos novos e trocar
`.claude/launch.json` para `npm run dev`.

## Riscos

- **Diferenças sutis de HTML** (espaços, ordem de atributos, `<br>`) podem mudar o layout. A
  comparação visual pega isso.
- **Hidratação:** se algum componente virar Client Component por engano e o `site.js` mexer no
  DOM dele, o React reclama. A regra "tudo Server Component" evita isso.
- **`HOJE` no build:** em produção com SSG, a ordem inicial da agenda fica congelada na data do
  build até o JS rodar, igual a hoje. Na Fase 2, com dados do banco, isso passa a ser
  revalidado.
