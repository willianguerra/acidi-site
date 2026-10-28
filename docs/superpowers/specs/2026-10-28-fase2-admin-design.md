# Fase 2: banco, login com papéis e admin

## Contexto

A Fase 1 deixou o site em Next.js 16 com paridade total com o HTML estático: páginas pré-geradas,
conteúdo em `content/*.ts`, lido só pelas funções assíncronas de `lib/content.ts`, e `site.js`
intacto. Esta fase coloca notícias, agenda, diretoria e ex-presidentes num banco e cria um admin
próprio para editá-los. As Fases 3 (textos institucionais editáveis) e 4 (formulários reais e
e-mail) têm specs próprias.

Stack decidida: PostgreSQL + Drizzle, Better Auth, storage compatível com S3, tudo no mesmo app
Next. Hospedagem indefinida: o código roda numa VPS (Node, Postgres, disco) e na Vercel
(Postgres gerenciado, S3).

## Objetivo e critério de sucesso

- Pessoas da ACIDI publicam notícias e eventos e mantêm diretoria e ex-presidentes sem mexer em
  código nem fazer deploy.
- Depois da carga inicial, as 22 páginas públicas saem idênticas às do main de antes desta fase
  (teste de paridade).
- O site público continua pré-gerado e no ar mesmo com o banco fora.

## Fora do escopo

Histórico de versões, agendamento de publicação, lixeira, convite por e-mail (Fase 4), textos
institucionais e serviços (Fase 3), formulários (Fase 4), deploy.

## Papéis e permissões

Três papéis, gravados no usuário: `admin`, `revisor`, `editor`.

| | Notícias | Agenda | Diretoria e ex-presidentes | Usuários |
|---|---|---|---|---|
| editor | cria e edita os próprios rascunhos/devolvidas, envia para revisão, apaga os próprios rascunhos | cria, edita, apaga | não | não |
| revisor | tudo das notícias: edita qualquer uma, publica, devolve com comentário, despublica, apaga | cria, edita, apaga | não | não |
| admin | igual ao revisor | igual | edita | cria, muda papel, desativa, redefine senha |

- Uma única função pura `pode(usuario, acao, alvo?)` decide tudo; as telas usam a mesma função
  para mostrar botões e cada Server Action a chama de novo antes de agir.
- Sem cadastro público. O admin cria a conta com senha provisória; a pessoa troca a senha no
  primeiro login (`trocarSenha` obrigatório antes de qualquer outra tela).
- Conta desativada perde todas as sessões na hora e não entra mais.
- Nunca pode ficar sem nenhum admin ativo: rebaixar ou desativar o último admin é recusado.
- `npm run criar-admin` cria a primeira conta pela linha de comando.
- Login com limite de tentativas (rate limit do Better Auth).

## Dados

Tabelas Drizzle:

- Better Auth (`user`, `session`, `account`, `verification`), com `papel`, `ativo` e
  `trocarSenha` no usuário.
- `noticias`: `id`, `slug` único, `data`, `titulo`, `imagem`, `alt`, `resumo`, `corpo` (jsonb,
  `Bloco[]` como hoje: parágrafo, lista, citação, tabela), `situacao`
  (`rascunho | revisao | publicada | devolvida`), `comentarioRevisao`, `autorId`,
  `publicadaPorId`, `publicadaEm`, `criadaEm`, `atualizadaEm`.
- `eventos`: `id`, `data`, `titulo`, `horario` (opcional), `local`, `descricao`, `atualizadoEm`.
- `diretoria`: `id`, `grupo` (`executiva | vps | consultivo | fiscal | deliberativo |
  deliberativoSuplentes`), `rotulo` (cargo ou área, opcional), `nome`, `suplente`, `ordem`.
- `ex_presidentes`: `id`, `foto` (opcional), `nome`, `gestao` (opcional), `ordem`.

`lib/content.ts` mantém as assinaturas e devolve os mesmos tipos de `lib/types.ts`. Só notícias
`publicada` chegam ao site. Imagens antigas continuam em `public/assets/img`; o banco guarda o
caminho ou a URL, e a camada de conteúdo devolve o que as páginas já esperam.

`npm run db:carga` copia `content/noticias.ts`, `eventos.ts`, `diretoria.ts` e
`ex-presidentes.ts` para o banco (notícias como `publicada`), e é idempotente. Depois da carga
esses quatro arquivos saem do repositório; os demais `content/*.ts` ficam até a Fase 3.

## Fluxo da notícia

```
editor:   rascunho --enviar--> revisao
revisor:  revisao --publicar--> publicada
          revisao --devolver(comentário)--> devolvida --editor reenvia--> revisao
          publicada --despublicar--> rascunho
```

- Revisor e admin podem publicar direto qualquer notícia, inclusive as que escreveram.
- Editar uma notícia publicada (revisor/admin) vai ao ar ao salvar. O editor não edita notícia
  publicada nem em revisão.
- O slug vem do título (sem acento, minúsculas, hífens) e é editável até a primeira publicação;
  depois fica travado.
- Bloqueio otimista: todo salvamento envia o `atualizadaEm` lido; se mudou, a gravação é recusada
  com "esta notícia foi alterada por <nome>, recarregue". Vale também para eventos.
- Apagar sempre pede confirmação e é definitivo.

## Telas (`/admin`)

- Entrar; trocar senha (obrigatória no primeiro acesso, depois em "Minha conta").
- Início: notícias em revisão (revisor/admin), devolvidas com comentário (editor), próximos
  eventos (todos).
- Notícias: lista com filtro por situação e busca por título; formulário com upload de foto, alt
  obrigatório e editor de blocos (adicionar parágrafo/lista/citação/tabela, mover, remover);
  prévia com o layout público, visível só logado.
- Agenda: próximos e passados; formulário.
- Diretoria (admin): membros agrupados como na página pública; adicionar, editar, remover,
  reordenar.
- Ex-presidentes (admin): lista, formulário com foto opcional, reordenar.
- Usuários (admin): criar (nome, e-mail, papel, senha provisória), mudar papel, desativar,
  redefinir senha.

O app ganha dois route groups: `app/(site)` com o layout atual (HTML e `site.js` iguais) e
`app/admin` com layout próprio, que usa as cores e fontes do site e pode ter Client Components
(o editor de blocos). O admin funciona no celular.

## Imagens

- Upload JPG, PNG ou WebP até 8 MB; o tipo é conferido decodificando o arquivo (sharp), não pela
  extensão. A imagem é reduzida para no máximo 1600 px de largura e salva com nome único.
- `lib/storage.ts` expõe `salvarImagem(arquivo) → caminho` com dois destinos escolhidos por
  `STORAGE`: `disco` (`public/uploads`, para desenvolvimento e VPS) e `s3` (qualquer serviço
  compatível, para Vercel).

## Atualização do site público

- Páginas continuam estáticas. Cada Server Action que muda conteúdo público chama `revalidatePath`
  nas rotas afetadas: notícia → `/`, `/noticias`, `/noticias/[slug]` (todas); evento → `/` e
  `/agenda`; diretoria → `/diretoria`; ex-presidentes → `/ex-presidentes`.
- `noticias/[slug]` passa a `dynamicParams = true`: slug novo é gerado no primeiro acesso e
  guardado; slug inexistente ou não publicado continua 404.
- Se o banco cair, o site serve a última versão gerada; só o admin mostra erro.

## Erros e validação

- Validação no servidor (zod) com mensagem por campo; o formulário mantém o que foi digitado.
- Mensagens de upload dizem se o problema é tipo ou tamanho.
- Falha de banco no admin: "não foi possível salvar, tente de novo", sem perder o formulário.
- Texto dos blocos é sempre renderizado como texto (sem HTML).

## Ambiente

- `docker-compose.yml` com PostgreSQL para desenvolvimento e testes (banco de teste separado).
- `.env.example`: `DATABASE_URL`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, `STORAGE`, `S3_*`.
- Scripts: `db:migrar` (drizzle-kit), `db:carga`, `criar-admin`.
- O build pré-gera as páginas lendo o banco; build e execução precisam de `DATABASE_URL`.

## Testes

- Unidade (`node --test`): matriz de permissões papel × ação × situação; transições do fluxo;
  slug; validação de blocos; conversão banco ↔ tipos do site.
- Integração com Postgres real: CRUD de notícias, eventos, diretoria e ex-presidentes; fluxo de
  revisão; bloqueio otimista; "nunca sem admin"; conta desativada perde a sessão; rascunho não
  aparece em `lib/content`.
- Navegador (Playwright, como os testes atuais): admin cria editor e revisor; editor escreve
  notícia com foto e envia; revisor devolve; editor corrige; revisor publica; a notícia aparece no
  site; evento publicado aparece na agenda; editor é barrado em `/admin/usuarios` e em
  `/admin/diretoria`.
- Paridade: após `db:carga`, `testes/paridade.py` contra o main de antes desta fase (já com o
  topo novo) dá 22/22.
- `jornadas.py`, `verificar_links.py`, `logica.test.js` e `npm test` continuam verdes.
