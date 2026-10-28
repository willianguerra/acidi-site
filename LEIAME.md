# ACIDI · site demonstrativo · versão "Ponto de encontro"

> Cópia separada com a nova direção de arte e movimento (branch `direcao-de-arte`). A versão anterior continua intacta em `ACIDI-site-demonstracao`. Brief, storyboard, regras de movimento e entrega: [`docs/DIRECAO.md`](docs/DIRECAO.md).

Versão local e independente do site da Associação Empresarial de Indaial, para apresentação ao cliente. Não altera nem publica nada no site oficial.

## Como abrir

O site é um app [Next.js](https://nextjs.org) (App Router, TypeScript). Precisa do Node.js 24 ou mais novo.

```bash
npm install
npm run dev
```

Depois abra `http://localhost:3000/`. Para a versão de produção (a mesma usada nos testes): `npm run build` e `npm start`.

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
| Auditório e salas | `/auditorio` (formulário demonstrativo) |
| Associe-se | `/associe-se` (formulário demonstrativo) |
| Contato | `/contato` (formulário demonstrativo; aceita `?assunto=uniodonto` etc.) |

Os endereços antigos (`agenda.html`, `noticia-<slug>.html`...) redirecionam com 301 para as rotas novas, mantendo `?assunto=` e âncoras.

## Estrutura

```text
app/                    uma pasta por rota (page.tsx); layout.tsx tem o <head> e carrega o site.js
components/             Header, Footer, ícones e blocos reaproveitados (Crumbs, PageHead, EventItem, Story, JoinBox)
content/                notícias, eventos, diretoria, ex-presidentes, serviços etc. (dados tipados)
lib/content.ts          única porta de entrada do conteúdo para as páginas (na Fase 2 passa a ler o banco)
lib/rotas.ts            URLs .html antigas -> rotas novas (redirects do next.config.ts)
public/assets/css/      site.css (tokens do protótipo) e fonts.css
public/assets/fonts/    Archivo e Public Sans (woff2, latin e latin-ext) e licenças OFL
public/assets/js/site.js  menus, agenda por data e validação dos formulários (sem mudanças desde a versão estática)
public/assets/img/      fotos e logos fornecidos pela ACIDI
public/assets/video/    filme "Ponto de encontro" otimizado para a web e pôsteres
motion/ponto-de-encontro/  fonte HyperFrames do filme (editar e renderizar: ver o LEIAME de lá)
testes/                 testes de lógica, links, paridade e jornadas em navegador
docs/DOCUMENTACAO.md    fontes, decisões, testes e pendências
docs/capturas/          capturas reais (desktop, tablet e celular)
```

Para editar notícias, eventos, diretoria e ex-presidentes, altere o arquivo correspondente em `content/`. Textos institucionais ficam no `page.tsx` de cada rota. Estilos e scripts são editados diretamente em `public/assets/`.

Os links internos usam `<a>` comum, não `next/link`: o `site.js` age sobre o HTML de cada carregamento de página e não rodaria de novo numa navegação feita pelo React.

## Testes

Com o site rodando (`npm run build && npm start`):

```bash
npm test
node testes/logica.test.js
python testes/verificar_links.py
PYTHONIOENCODING=utf-8 python testes/jornadas.py
python testes/comparar.py depois http://127.0.0.1:3000/
python testes/movimento.py http://127.0.0.1:3000/
```

Os testes em Python exigem o pacote `playwright` e o Microsoft Edge instalado.

`testes/paridade.py` compara o HTML de cada rota com o do site estático anterior (útil ao trocar a origem do conteúdo na Fase 2). Para usá-lo, sirva a versão estática do commit `baffbb2` (o último antes do Next):

```bash
git worktree add ../acidi-site-ref baffbb2
python -m http.server 8766 --bind 127.0.0.1 -d ../acidi-site-ref
python testes/paridade.py http://127.0.0.1:8766/ http://127.0.0.1:3000/
```
