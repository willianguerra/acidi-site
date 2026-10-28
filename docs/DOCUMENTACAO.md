# Documentação do site demonstrativo da ACIDI

Documento interno: não faz parte da interface apresentada ao cliente. Data da verificação do conteúdo: 26/10/2026.

## 1. Origem do trabalho

- Base visual: `acidi-home.html` (home com fotografias reais) da etapa anterior. O `index.html` em `Desktop\Nova pasta` é o mesmo conteúdo com um invólucro HTML; ambas as pastas foram preservadas sem alteração.
- Não aproveitado: `acidi-proposta.html` (documento com esboço em iframes, outra família tipográfica e botões em pílula) e a barra "Prévia", as marcações "a confirmar" e a janela "Sobre a proposta" da home anterior.
- Tecnologia: Next.js (App Router, TypeScript), com as páginas públicas pré-geradas e sem requisições externas para exibi-las (fontes embutidas). Cabeçalho e rodapé únicos em `components/`; conteúdo lido só por `lib/content.ts`: notícias, agenda, diretoria e ex-presidentes vêm do PostgreSQL (Drizzle) e são editados no `/admin` (Better Auth, papéis admin/revisor/editor); o resto ainda está em `content/`. Publicar algo regera as páginas afetadas na hora. O `site.js` original continua cuidando de menus, agenda e formulários. Até 28/10/2026 as páginas eram HTML estático gerado por `ferramentas/gerar_site.py` (removido; ver o histórico do git). Não há relação com o WordPress de produção.

## 2. Fontes do conteúdo

Todo o texto foi relido no site oficial em 26/10/2026 e adaptado com edição leve (pontuação, caixa dos títulos, remoção de emojis), sem acrescentar fatos.

| Conteúdo | Fonte oficial |
|---|---|
| História, fundação em 22/05/1989 | https://www.acidi.net/historico/ |
| Diretoria e conselhos, gestão 2024/2026 | https://www.acidi.net/diretoria/ |
| Ex-presidentes e períodos | https://www.acidi.net/ex-presidentes/ |
| Pleitos federais, estaduais e municipais | https://www.acidi.net/representatividade/ |
| Núcleos e conselhos municipais | https://www.acidi.net/nucleos/ |
| Serviços para associados | https://www.acidi.net/para-seu-negocio/ |
| Auditório: 170 pessoas, espaços climatizados, valor diferenciado para associados, agendamento prévio | https://www.acidi.net/reservar-auditorio/ |
| Agenda (6 registros, o mais recente em 25/02/2026) | https://www.acidi.net/agenda/ |
| Contato: contato@acidi.net e (47) 3333-8786 | https://www.acidi.net/contato/ |
| E-mail contato@acidi.net e endereço | cabeçalho e rodapé de https://www.acidi.net/ |
| 10 notícias, com data original de publicação | https://www.acidi.net/blog/ e cada matéria |

Datas originais das notícias (meta `article:published_time`): 11/04/2025 (2), 19/12/2024 (2), 03/12/2024, 19/09/2024, 08/07/2024, 17/06/2024, 23/05/2024, 03/04/2024.

### Imagens

Arquivos fornecidos em `Desktop\fotos acidi`, redimensionados e comprimidos. As legendas usam só o que a fonte confirma:

| Arquivo no site | Original | Confirmação |
|---|---|---|
| `feijoada-palco.jpg` | DSC_1017-scaled.jpg | Faixa "Feijoada da ACIDI" visível na foto. Edição não identificada, por isso a legenda não cita ano. |
| `feijoada-2024.jpg` | DSC_2278-scaled.jpg | Imagem de destaque da notícia da 2ª Feijoada (08/07/2024) |
| `posse-2024.jpg` | WhatsApp-Image-2024-05-23… | Destaque da notícia dos 35 anos e posse (23/05/2024) |
| `voz-unica-2024.jpg` | 42420c7a… | Destaque da notícia Voz Única (19/09/2024) |
| `jogos-2024.jpg` | Foto_trofeu.png | Destaque da notícia dos 12º Jogos (17/06/2024) |
| `liderancas-2024.jpg` | 6c2bad55… | Destaque da notícia Encontro de Lideranças (03/12/2024) |
| `itinerante-2024.jpg`, `networkaffee-2024.jpg` | 7ea1c329…, Logotipo-verde-e-laranja… | Destaques das notícias de 19/12/2024 |
| `contabilidade-2025.jpg`, `comitiva-2025.jpg` | Imagem-do-WhatsApp-2025-04-11… | Destaques das notícias de 11/04/2025 |
| `ir-campanha.jpg` | Impost0_Renda_01.png | Destaque da notícia de 03/04/2024 |
| `auditorio-1…6.jpg` | foto01…06.jpg | Galeria da página oficial de reserva do auditório |
| `sede.jpg` | DSC_9664-02.png | Prédio com o logotipo da ACIDI na fachada |
| `p-*.jpg` | retratos com nome no arquivo | Só retratos cujo nome do arquivo identifica a pessoa |
| `logo.png`, `util/uniodonto/boavista/clinipam.jpg` | logomarca.png, parceiro01–04.jpg | Mesmos arquivos do site oficial (margens brancas dos logos de parceiros recortadas) |
| `favicon.png` | recorte do símbolo de logomarca.png | Derivado do logo original, sem redesenho |

Não usadas por falta de identificação: diplomação (o nome do arquivo não indica o ano), fotos de painel, palestra e grupos sem legenda, retratos sem nome no arquivo e imagens de banco (pessoa com documentos, mulher com celular etc.).

## 3. Decisões de conteúdo

- **Diretoria 2024/2026:** apresentada como "gestão 2024/2026, conforme a composição publicada", sem afirmar que é a gestão vigente em 26/10/2026. Usamos a página Diretoria, mais recente que a notícia da posse. As duas diferem em três pontos: "Noeli" (página) e "Neoli" (notícia); Eventos com Clério José Ribeiro só na notícia; Turismo com Andréa De Faveri (página) e Diene Dolores Tomio Zonta (notícia).
- **Ex-presidentes:** lista na ordem publicada, sem linha do tempo. Os períodos sobrepostos na publicação oficial foram omitidos até a confirmação: Jorge Alberto Jacobsen (2004–2008) e Osmar Voss (2006–2008); o segundo mandato de Gunther Hersing (2018–2022) e Renato Tomio (2018–2022). Marcondes Aurélio Moser não consta da página oficial de ex-presidentes e aparece só em Diretoria.
- **Representatividade:** os pleitos são apresentados como "pautas que a ACIDI publica entre os pleitos que defende", com o aviso de que a lista não informa a situação atual de cada um.
- **Núcleos:** nenhum núcleo é declarado ativo. A página lista os núcleos citados em publicações, com a data de cada uma (agenda de 2022 e notícia de julho de 2024), e encaminha para o contato.
- **Agenda:** os seis registros oficiais já passaram em 26/10/2026. O navegador separa próximos e arquivo pela data do dia (`assets/js/site.js`); sem eventos futuros, aparece "Nenhum próximo evento publicado", com acesso ao arquivo e ao contato. A classificação foi testada simulando outra data.
- **Boa Vista SCPC:** os números institucionais do parceiro (anos de atuação, clientes e consultas) foram omitidos por serem dados de terceiros que podem estar desatualizados.
- **Associe-se:** benefícios tirados apenas do conteúdo publicado. Não há etapas, documentos, valores ou condições inventadas; a orientação é falar com a equipe.
- **E-mails:** o cabeçalho mantém contato@acidi.net (como no site oficial); Contato e rodapé mantêm contato@acidi.net. A página Contato mostra os dois. A padronização fica como pendência.
- **Política de privacidade:** não há link nem texto, porque nenhum texto aprovado foi fornecido.

## 4. Formulários

Associe-se, Contato e Auditório: rótulos visíveis, campos opcionais identificados, validação acessível (mensagem por campo ligada por `aria-describedby`, `aria-invalid` e resumo de erros com links que recebe o foco). Antes do envio, cada formulário avisa: "Formulário demonstrativo. Os dados não são enviados nem armazenados." Após validar, mostra: "Demonstração concluída. Nenhum dado foi enviado." No auditório, acrescenta "Nenhuma reserva foi realizada" e rejeita datas passadas, sem simular disponibilidade. Os dados permanecem nos campos para correção e repetição. Nenhum dado é transmitido (verificado: só requisições GET).

## 5. Direção visual (tokens do protótipo)

Não é manual de marca homologado. Verde institucional `#009D3D`, verde de ação `#00843A` (contraste 4,8:1 com branco), verde escuro `#0B3D24`, amarelo `#FFED00` só como destaque e disco gráfico. Archivo nos títulos, alternando trechos finos e estreitos com trechos fortes e largos. Public Sans no texto. Base clara, grid de 12 colunas, cantos de 6 px, fotografias reais sem sobreposição de cor. Animação apenas na revelação da foto de abertura e em pequenos deslocamentos de hover, desligada com movimento reduzido. O logotipo é usado como imagem original, sem redesenho.

Referências da etapa anterior (contexto, não reexaminadas nesta etapa): Research Ireland e Widelab Brand Guidelines (Deck.gallery), Rich Navigation Menu, Split Hero e Large Name Footer (21st.dev). Nenhum código de terceiros foi incorporado.

## 6. Testes realizados

Ambiente: Windows 11, Microsoft Edge (Chromium) via Playwright, servidor `next start` (antes da migração para Next.js, `python -m http.server`). Larguras emuladas no navegador, não em aparelho físico.

| Jornada / verificação | Resultado |
|---|---|
| Home → Associe-se → erros (resumo focado, campos marcados, conclusão oculta) → correção → conclusão demonstrativa, dados preservados | Passou |
| Menu A ACIDI por clique e teclado (Enter, Tab no painel, Escape devolve o foco) → Histórico, Diretoria, Ex-Presidentes, Representatividade, Núcleos → logo volta à home | Passou |
| Serviço na home → âncora em Para seu negócio → Contato com assunto pré-selecionado | Passou |
| Notícias → matéria completa (título, data original, imagem, 3+ parágrafos) → volta à listagem | Passou |
| Agenda em 26/10/2026: nenhum evento vencido em Próximos, aviso vazio, arquivo com 6 registros; Núcleos → detalhe do evento no arquivo | Passou |
| Agenda e home simulando 20/05/2022: eventos futuros aparecem em Próximos e o aviso some | Passou |
| Auditório: data passada rejeitada; conclusão sem reserva e sem "confirmado" | Passou |
| Contato: 4 erros nos obrigatórios, telefone opcional inválido e mensagem curta apontados, conclusão | Passou |
| Menu móvel (768, 390, 320 px): abre como modal, foco contido após 25 Tabs, fundo inerte, Escape fecha e devolve o foco, navegação por toque | Passou |
| Barra fixa do celular não cobre o rodapé | Passou |
| Recarga direta de páginas internas, todas as imagens e recursos locais | Passou |
| Rolagem horizontal, vazamento de elementos e imagens quebradas nas 22 páginas a 1440, 768, 390 e 320 px | Nenhum problema |
| Erros de console nas jornadas | Nenhum |
| Links, âncoras e arquivos locais das 22 páginas (`verificar_links.py`, testado também com erros injetados) | Nenhum problema |
| Lógica de validação e separação da agenda (`logica.test.js`) | Passou |
| Abertura via `file://` (duplo clique): navegação, menu móvel e formulário | Passou |
| Sem internet (todas as requisições externas bloqueadas): as 22 páginas via `file://` carregam Archivo e Public Sans locais, sem erros de console; servidor local idem | Passou |

Total da última execução de `jornadas.py`: 77 de 77 verificações.

Não verificado: leitores de tela reais (NVDA, VoiceOver), aparelhos físicos, Safari/iOS e Firefox, e contraste medido por ferramenta em todas as combinações (as cores principais foram calculadas; as demais, inspecionadas visualmente).

## 7. Pendências para produção

1. **Logotipo em vetor (SVG ou PNG em alta resolução).** O arquivo disponível tem 189 × 50 px e perde nitidez em telas de alta densidade.
2. **Fontes (resolvido).** Archivo e Public Sans foram baixadas do Google Fonts em 26/10/2026 e embutidas em `assets/fonts` (woff2, subconjuntos latin e latin-ext, cerca de 215 KB), com as licenças SIL OFL 1.1 (`OFL-archivo.txt`, `OFL-public-sans.txt`, obtidas do repositório google/fonts). A OFL permite uso, embutimento e redistribuição com o site, mantidos os avisos de licença. Ao migrar para o WordPress, carregar os mesmos arquivos pelo tema.
3. **E-mail oficial.** Definir se comunicacao@ e contato@ devem coexistir e com que finalidade.
4. **Diretoria vigente.** Confirmar se a gestão 2024/2026 continua e a composição correta nos três pontos divergentes.
5. **Ex-presidentes.** Corrigir os períodos sobrepostos e fornecer retratos de Jorge Alberto Jacobsen, Renato Tomio e Rogério Isnar Patricio.
6. **Núcleos ativos** e forma de participação.
7. **Agenda e notícias.** Não há evento futuro publicado e a notícia mais recente é de abril de 2025.
8. **Associe-se.** Condições, valores e etapas reais, se a ACIDI quiser publicá-los.
9. **Auditório.** Equipamentos, horários e valores, se forem publicados.
10. **Política de privacidade e aviso de cookies** aprovados, antes de qualquer formulário real.
11. **Integração real dos formulários** (destino, armazenamento, consentimento, proteção contra spam). Hoje nada é enviado.
12. **Autorização de uso** das fotografias com pessoas identificáveis.
13. **Implementação em produção.** O site oficial roda em WordPress; esta demonstração serve de referência visual e de conteúdo, sem exigir migração.
