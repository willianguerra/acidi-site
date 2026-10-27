# Filme "Ponto de encontro" (HyperFrames)

Peça de 10 s, 1200 × 800, 30 fps, sem som, usada na seção **Quem somos** da home (`index.html`). A sede da ACIDI abre espaço ao campo verde; quatro fotos de eventos publicados chegam ao campo e se ligam por arcos brancos num nó amarelo; a etiqueta "Indaial · SC / Desde 1989" fecha. Direção, números e quadros de QA: [`SPEC.md`](SPEC.md).

## Arquivos

| Arquivo | Papel |
|---|---|
| `index.html` | raiz: variáveis (cores do campo e do nó, texto da etiqueta) e montagem da cena |
| `compositions/encontro.html` | a cena: layout, fotos e linha do tempo GSAP |
| `assets/img`, `assets/fonts` | cópias das fotos e fontes do site (Archivo e Public Sans, OFL) |
| `renders/` | render bruto (ignorado pelo git) |
| `../../assets/video/` | o que o site usa: `ponto-de-encontro.mp4` (H.264, faststart, ~0,8 MB), `-inicio.jpg` (pôster com movimento) e `-poster.jpg` (quadro final: sem JS e movimento reduzido) |

## Editar

```bash
cd motion/ponto-de-encontro
npm run dev        # abre o Studio: clique para editar textos, mova clipes, mude as variáveis
npm run check      # lint, layout e contraste (deve terminar com ok: true)
npx hyperframes snapshot --at 1,2,3.2,4.6,6,9.9   # quadros de QA em .hyperframes/artifacts/snapshots
```

Tempos e posições ficam em `compositions/encontro.html` (CSS no topo, linha do tempo no fim). Para trocar uma foto, substitua o arquivo em `assets/img` mantendo o nome, ou mude o `src`.

## Renderizar e publicar no site

```bash
npm run render     # renders/ponto-de-encontro.mp4 (qualidade delivery)
npm run web        # gera o MP4 otimizado e os dois pôsteres em ../../assets/video
```

Precisa de Node 22+ e FFmpeg no PATH. O site não carrega o HyperFrames nem o GSAP: usa só o MP4 (`preload="none"`), que toca uma vez quando a figura entra na tela e tem botão de pausar/reproduzir.
