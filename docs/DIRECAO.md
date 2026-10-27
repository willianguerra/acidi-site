# Direção de arte e movimento · versão "Ponto de encontro"

Documento interno. Cópia separada da demonstração (branch `direcao-de-arte`, pasta `ACIDI-site-direcao-de-arte`). A versão anterior em `ACIDI-site-demonstracao` não foi alterada.

## Brief

**Ideia:** *Ponto de encontro.* O símbolo da ACIDI é um campo verde onde traços brancos curvos giram e convergem para um centro amarelo. O site usa essa gramática (campo verde, arco branco, nó amarelo) como espaço de composição, nunca como logo redesenhado: o logotipo continua sendo só o PNG original, nas proporções originais.

- **Abertura:** pessoas e empresas atravessam a borda do campo verde e se ligam num nó amarelo. "Juntos somos mais fortes" fica no branco, legível desde o primeiro quadro.
- **Serviços:** do catálogo à escolha. Uma lista de serviços à esquerda e um painel único à direita; um marcador amarelo liga o item escolhido ao painel.
- **Atuação:** a voz se amplia. Do nó (Indaial) partem três ondas, municipal, estadual e federal.
- **Fechamento:** o arco volta e termina no botão de associação: a próxima conexão é a empresa do visitante.

**Tom:** institucional e confiável, com contraste de escala (título fino e estreito × largo e pesado, como antes), fotografia real com recortes intencionais e cor em blocos. Amarelo só como ponto de foco (nó, marcador, etiqueta), nunca como fundo de texto longo.

**Materiais de processo:** os materiais das aulas "Motion graphics com IA" e "Carrossel vivo com Claude Code" não estavam disponíveis no computador. Adotei o processo descrito no pedido: conceito → direção → storyboard → continuidade entre cenas → revisão de quadros (capturas em repouso, intermediárias e finais). Nada das regras de vídeo (BPM, MP4 por slide, `seek`) foi trazido para o site.

## Referências examinadas (26/10/2026)

| Referência | O que absorvi | O que não usei |
|---|---|---|
| Logotipo da ACIDI (`assets/img/logo.png`, ampliado) | Campo verde, traços brancos curvos em rotação, centro amarelo: base do arco e do nó | Reconstruir ou animar o símbolo |
| Wellcome Collection (home e Stories) | Foto com bloco de cor sólido encostado; etiqueta amarela pequena na quina da foto; ritmo editorial calmo, sem animação na leitura | Paleta preto/cinza |
| BusinessLDN (home) | Organização de membros que usa um campo de cor como estrutura e uma frase de propósito curta | Vídeo automático na abertura e cartões em caixa-alta, que cansam a leitura |

Nenhum código, texto ou marca de terceiros foi incorporado.

## Storyboard da home

| Seção | 1. O que entender | 2. Composição estática | 3. O que se move e por quê | 4. Início → fim | 5. Celular / movimento reduzido |
|---|---|---|---|---|---|
| **Abertura** | A ACIDI é a rede de empresas de Indaial; dá para se associar já | Texto à esquerda no branco. À direita, campo verde até a borda da tela com três fotos reais: Jogos Entre Empresas (rostos, conquista), Voz Única (entidades diante da marca) e Feijoada (escala da comunidade). Duas fotos atravessam a borda do campo. Três arcos brancos saem das fotos e se encontram num nó amarelo | Fotos se aproximam do nó; arcos se desenham até ele; o nó aparece por último. Sugere encontro | Fotos a 18 px do lugar final e transparentes → lugar final (700 ms, desaceleração). Arcos 0 → 100% (800 ms, a partir de 300 ms). Nó escala 0,4 → 1 sem quique (360 ms, a partir de 900 ms). Repouso em ~1,3 s. Título, texto e botões nunca se movem | Celular: título → fotos (campo verde de ponta a ponta) → texto curto → botões. A barra fixa "Associe sua empresa" só aparece depois que o botão da abertura sai da tela. Reduzido: composição final direta |
| Acesso rápido | Sistemas dos associados a um toque | Faixa verde-escura logo abaixo da abertura, como antes | Nada | — | Grade 2 × 2 (1 coluna a 320 px) |
| Quem somos | Origem e papel da entidade | Foto da sede + dados verificados | Nada | — | Foto acima do texto |
| **Serviços** | Quais soluções existem e qual serve à minha empresa | Lista numerada de 7 serviços à esquerda; painel verde-escuro único à direita com número, logo do parceiro (quando há), título, descrição e chamadas | Marcador amarelo desliza do item anterior ao novo e liga o item ao painel; o conteúdo do painel entra pela direção do movimento (de baixo se o novo item está abaixo). Mostra o que mudou | Marcador 240 ms; conteúdo 280 ms (opacidade + 12 px). O painel não muda de tamanho nem de lugar | Celular: lista expansível (um item aberto por vez, toque abre e fecha). Sem JS: todos os serviços em cartões. Reduzido: troca instantânea |
| Notícias e agenda | O que a ACIDI tem feito | Bloco editorial branco (sem mudança) | Nada | — | — |
| **Atuação** | A ACIDI representa o empresário em três escalas | Fundo verde-escuro. Do nó amarelo à esquerda partem três ondas que pousam nos marcadores de Municipal, Estadual e Federal, cada um com anel maior | Ondas se desenham do centro para fora, uma por vez: a voz se amplia | Ao entrar na tela: municipal 0 ms, estadual 160 ms, federal 320 ms, 700 ms cada | Celular: as ondas somem e ficam os marcadores de anel crescente, em coluna. Reduzido/sem JS: ondas desenhadas |
| Auditório | Espaço real disponível | Foto grande + texto | Nada | — | — |
| Parceiros | Convênios | Logos em grade | Nada | — | — |
| **Fechamento** | Associar-se é a próxima conexão | Bloco verde com o arco que atravessa o bloco e termina no disco amarelo junto ao botão | O arco se desenha uma vez até o disco; o disco assenta | Ao entrar na tela: arco 900 ms; disco 0,85 → 1 (400 ms) | Mesmo, com bloco em coluna. Reduzido/sem JS: estado final |

## Regras de movimento (web)

1. **Hierarquia.** Um gesto principal na abertura. Interações respondem rápido. Leitura fica em repouso: parágrafos, notícias, formulários e listas não se animam.
2. **Durações.** Resposta de interface 150–250 ms (marcador 240 ms, botões 200 ms). Composição 500–900 ms (fotos 700, arcos 700–900). Nada atrasa uma tarefa: nenhum conteúdo espera a animação.
3. **Curvas.** Saída `cubic-bezier(.22,.7,.18,1)` (chega rápido, assenta devagar); traços `cubic-bezier(.6,0,.2,1)`. Sem quique, sem squash/stretch, nunca no logo, em rostos ou em texto institucional.
4. **Cada seção tem um verbo próprio:** abertura *converge*, serviços *troca*, atuação *expande*, fechamento *liga*, quem somos *encontra* (filme HyperFrames). O resto do conteúdo só *chega*: revelação discreta ao rolar (14 px, 500–600 ms, stagger de 70 ms em grupos), aplicada pelo JS apenas abaixo da primeira dobra e nunca às seções com verbo próprio.
5. **Rolagem nativa.** Nada captura ou força rolagem; nada impõe sequência. Animações por visibilidade disparam uma vez.
6. **Sem som, cursor próprio ou partículas.** Galeria só por navegação manual.
7. **Movimento reduzido:** composição final, todas as funções iguais. **Sem JavaScript:** composição final, serviços em cartões, galeria em links para as imagens.

## Evolução de acabamento e movimento (27/10/2026)

- **Abertura:** kicker, título (duas linhas), texto e botões assentam em sequência (0–300 ms, 700 ms cada), partindo de opacidade 0,4: legíveis desde o primeiro quadro. As fotos, os arcos e o nó vêm logo depois; repouso em ~1,5 s.
- **Quem somos:** a foto estática da sede virou o filme "Ponto de encontro", feito com HyperFrames (`motion/ponto-de-encontro`, ver o LEIAME de lá). O site usa só o MP4 de 0,8 MB, com `preload="none"`: toca uma vez ao entrar na tela, com botão Pausar/Reproduzir/Rever. Sem JS ou com movimento reduzido, mostra o quadro final como pôster.
- **Cabeçalho:** ao rolar, ganha sombra e a marca recua para 86% (transform); a altura não muda, então nada pula.
- **Menus:** o painel suspenso desce 6 px ao abrir; o menu do celular desliza da direita e fecha pelo mesmo caminho, com os grupos entrando em 45 ms de intervalo (`@starting-style`; navegadores sem suporte abrem direto).
- **Páginas internas:** o cabeçalho de página entra como a abertura, mais curto; o campo verde sai de trás da foto e o arco decorativo gira até o lugar.
- **Interação:** botões sobem 1 px com sombra da própria cor, setas avançam, sublinhados se aproximam do texto; hover e foco por teclado têm a mesma resposta em todos os componentes (menus, atalhos, notícias, índice, galeria, rodapé).
- **Movimento reduzido:** nenhuma revelação, entrada ou autoplay; tudo no estado final, funções iguais.

## Entrega

### Como abrir

Dê dois cliques em `index.html` desta pasta, ou rode `python -m http.server 8767 --bind 127.0.0.1` nela e abra `http://127.0.0.1:8767/`. A versão anterior pode rodar ao lado (porta 8766) para comparar.

### Decisões que tornaram o resultado mais expressivo

1. **Uma ideia, não um enfeite.** A composição usa a gramática do próprio símbolo da ACIDI (campo verde, arco branco, nó amarelo). Ela organiza a abertura, a escolha de serviços, as escalas de atuação e o fechamento. O círculo amarelo decorativo da versão anterior saiu.
2. **Fotografia com papéis.** A foto principal mostra rostos e conquista (Jogos Entre Empresas); a de entidades diante da marca (Voz Única) traz a instituição; e uma faixa panorâmica da Feijoada mostra a escala da comunidade. A foto de grupo deixou de ser a principal. A Feijoada ganhou um recorte só das pessoas (`assets/img/feijoada-pessoas.jpg`, recortado do original, sem retoque), porque a faixa do palco cortada formava palavras truncadas.
3. **A borda como encontro.** Duas fotos atravessam a borda entre o branco e o campo verde: a comunidade entra na associação. No celular a travessia é vertical.
4. **Serviços como escolha.** Lista numerada e painel único com logo do parceiro, resumo, descrição e chamadas ("Ver detalhes", "Falar com a ACIDI" com assunto já selecionado, sistema externo quando existe).
5. **Atuação como escala.** Municipal (nó), estadual e federal (anéis maiores) ligados por arcos a partir de Indaial. Não há mapa nem dado novo; os pleitos são os publicados.
6. **Ritmo.** Branco com campo verde → faixa escura → foto da sede → névoa com painel escuro → bloco editorial branco → atuação escura → auditório → parceiros → fechamento verde. Notícias e agenda passaram para antes da atuação, para alternar áreas claras e escuras.
7. **Páginas internas sem espetáculo.** Os cabeçalhos ganharam o arco estático; nas fotos de cabeçalho, o campo verde aparece deslocado. O Histórico ganhou a faixa de retratos dos ex-presidentes (só nomes, na ordem publicada, sem datas). O auditório ganhou um visor com navegação manual e enquadramento por foto.

### Correção de conteúdo encontrada no caminho

Os textos alternativos da galeria do auditório estavam deslocados em relação às fotos 3 a 6 (por exemplo, "Fileiras de cadeiras do auditório" numa sala com mesa). Eles foram reescritos conforme cada imagem.

### Evidências

- `docs/comparativo/antes/` e `depois/`: mesmas larguras (1440, 768, 390 e 320 px) e mesmas posições de rolagem; `lado-a-lado/` junta os pares.
- `docs/comparativo/quadros/`: abertura em 0, 250, 500, 800 e 1300 ms (1440 e 390); atuação e fechamento em 0, 350, 700 e 1400 ms; serviços em duas seleções (Boa Vista e Treinamentos), cada uma com o quadro intermediário da troca.
- `docs/gravacoes/`: gravações reais do navegador (Edge/Playwright), sem quadros congelados: `home-desktop-1440.mp4` (25 s: abertura, três seleções por clique, uma por teclado, atuação, fechamento), `home-celular-390.mp4` (23 s, por toque) e `galeria-auditorio-1440.mp4`.
- `docs/capturas/`: capturas das jornadas desta versão, incluindo `desktop-14-sem-js-servicos.jpg` e `celular-01b-servicos.jpg`.
- Testes: `logica.test.js` passou; `verificar_links.py` não encontrou problemas nas 22 páginas; `jornadas.py` passou em 109 de 109 verificações. As 32 verificações novas cobrem a seleção por clique, teclado (setas, Home/End, Enter) e toque, a altura estável ao trocar de serviço, o marcador alinhado ao item e os painéis inativos fora da ordem de foco. Cobrem também a lista expansível no celular, a ordem título → fotos → botão no celular e a barra fixa oculta com o botão da abertura visível. Na galeria, verificam que ela não troca sozinha em 5 s e responde a botão, miniatura e seta. Por fim, conferem movimento reduzido (estado final imediato) e ausência de JavaScript (os 7 serviços em cartões, desenhos completos, miniaturas como links). Continuam valendo as jornadas anteriores: formulários, menus, agenda, rolagem horizontal a 768/390/320 px, console sem erros e nenhum envio de dados.

### Limitações reais

- Os materiais das aulas não estavam no computador; segui o processo descrito no pedido.
- Testado só no Microsoft Edge (Chromium) com larguras emuladas. Safari/iOS, Firefox, aparelhos físicos e leitores de tela reais não foram verificados.
- As fotos são as já fornecidas, em resolução modesta (a dos Jogos tem 1400 px); em telas grandes de alta densidade perdem nitidez. O logotipo continua sendo o PNG de 189 × 50 px.
- A 320 × 640 px o botão "Associe sua empresa" aparece na primeira tela, mas encostado na borda inferior (o "Ver serviços" fica abaixo), porque a foto passou a vir antes dele, como pedido. A 390 × 844 e a 768 × 1024 os dois botões aparecem inteiros.
- A gravação mostra o movimento em ~25 fps do gravador do navegador; a suavidade real em aparelhos fracos não foi medida.
- As fotos com pessoas identificáveis continuam dependendo de autorização de uso (pendência já registrada em `DOCUMENTACAO.md`).
