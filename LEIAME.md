# ACIDI · site demonstrativo · versão "Ponto de encontro"

> Cópia separada com a nova direção de arte e movimento (branch `direcao-de-arte`). A versão anterior continua intacta em `ACIDI-site-demonstracao`. Brief, storyboard, regras de movimento e entrega: [`docs/DIRECAO.md`](docs/DIRECAO.md).

Versão local e independente do site da Associação Empresarial de Indaial, para apresentação ao cliente. Não altera nem publica nada no site oficial.

## Como abrir

**Opção 1, sem instalar nada:** dê dois cliques em `index.html`. Todas as páginas, menus, formulários e a agenda funcionam abrindo direto do arquivo.

**Opção 2, com servidor local** (recomendado para apresentar, endereço igual ao de um site real):

```bash
cd "C:\Users\willian.guerra\Desktop\ACIDI-site-direcao-de-arte"
python -m http.server 8767 --bind 127.0.0.1
```

Depois abra `http://127.0.0.1:8767/` no navegador. Para encerrar, pressione `Ctrl+C` no terminal.

O site funciona sem internet: as fontes Archivo e Public Sans estão embutidas em `assets/fonts` (licença SIL OFL 1.1). Só os links externos (WhatsApp, redes sociais, mapa e sistemas de parceiros) precisam de conexão.

## Páginas

| Página | Arquivo |
|---|---|
| Início | `index.html` |
| A ACIDI / Histórico | `historico.html` |
| Diretoria | `diretoria.html` |
| Ex-Presidentes | `ex-presidentes.html` |
| Representatividade | `representatividade.html` |
| Núcleos | `nucleos.html` |
| Para seu negócio | `para-seu-negocio.html` (âncoras `#util-card`, `#uniodonto`, `#boa-vista-scpc`, `#certificado-de-origem`, `#treinamentos-e-palestras`, `#protesto-expresso`, `#xml-empresarial`, `#auditorio-e-salas`) |
| Notícias | `noticias.html` + 10 matérias `noticia-*.html` |
| Agenda | `agenda.html` (próximos eventos e `#arquivo`) |
| Auditório e salas | `auditorio.html` (formulário demonstrativo) |
| Associe-se | `associe-se.html` (formulário demonstrativo) |
| Contato | `contato.html` (formulário demonstrativo; aceita `?assunto=uniodonto` etc.) |

## Estrutura

```text
assets/css/site.css     estilos compartilhados (tokens do protótipo)
assets/css/fonts.css    declaração das fontes locais
assets/fonts/           Archivo e Public Sans (woff2, latin e latin-ext) e licenças OFL
assets/js/site.js       menus, agenda por data e validação dos formulários
assets/img/             fotos e logos fornecidos pela ACIDI
ferramentas/gerar_site.py  gera os HTML a partir de um cabeçalho/rodapé único e do conteúdo
testes/                 testes de lógica, links e jornadas em navegador
docs/DOCUMENTACAO.md    fontes, decisões, testes e pendências
docs/capturas/          capturas reais (desktop, tablet e celular)
```

Para editar textos, altere `ferramentas/gerar_site.py` e rode `python ferramentas/gerar_site.py`. Estilos e scripts são editados diretamente em `assets/`.

## Testes

```bash
node testes/logica.test.js
python testes/verificar_links.py
BASE=http://127.0.0.1:8767/ PYTHONIOENCODING=utf-8 python testes/jornadas.py
python testes/comparar.py depois http://127.0.0.1:8767/
python testes/movimento.py http://127.0.0.1:8767/
```

O último exige o servidor local da opção 2 rodando, o pacote Python `playwright` e o Microsoft Edge instalado.
