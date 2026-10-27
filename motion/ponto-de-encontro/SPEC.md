# SPEC · "Ponto de encontro" (seção Quem somos)

GOAL:    ao fim, a pessoa entende que a sede da ACIDI é o lugar onde as empresas de Indaial se encontram.
OUTPUT:  HyperFrames, 1200 x 800 (3:2, igual à foto da sede), 30 fps, sem som. Vídeo decorativo; texto e CTAs ficam no HTML do site.
TIME:    10 s x 30 = 300 quadros. Último quadro = pôster do site (estado final idêntico ao "movimento reduzido").
LOOK:    fotografia real (sede + 4 eventos publicados), sem tratamento de cor.
         Campo verde #009D3D (40% direito do quadro, x 720-1200); traços brancos 3 px, 85% opacidade; nó amarelo #FFED00 (r 18) só um por quadro.
         Etiqueta: bloco #0B3D24, texto Archivo 850 / stretch 118% 40 px branco + Public Sans 600 18 px #CFE3D5, tracking .12em.
         Fotos: raio 6 px, sombra 0 24px 40px -24px rgba(11,61,36,.7). Sem grão, sem vinheta.
OBJECTS: sede (enxaimel com o logotipo na fachada), posse da diretoria 2024, Networkaffee 2024 (recorte sem o texto embutido),
         comitiva a Maringá 2025, palestra de contabilidade 2025. Logo da ACIDI só o que já está nas fotos.
MOTION:  câmera power2.inOut; chegadas expo.out; traços power2.inOut; nó expo.out sem quique.
         Fotos 0,8 s, stagger 0,32 s, saem de 28 px para fora do nó com blur 6 → 0. Traços 0,9 s, stagger 0,2 s.
SHOTS:   0,0-2,4  sede em quadro cheio; câmera 1,10 → 1,0 e x 0 → -150 (a fachada abre espaço ao campo).
         1,5-2,4  campo verde entra da borda direita (clip-path, power3.inOut 0,9 s).
         2,3-3,9  quatro fotos chegam ao campo, duas atravessam a borda (a comunidade entra na associação).
         3,4-5,4  arcos brancos partem de cada foto e convergem no mesmo ponto.
         5,3-5,8  nó amarelo assenta (0,4 → 1); halo branco fino se desenha em volta (5,5-6,6).
         6,4-7,0  etiqueta "Indaial · desde 1989" entra palavra a palavra (blur 6 → 0, 0,07 s).
         7,0-10   repouso total (≥ 2 s na última linha). Nada continua se movendo.
BANNED:  fundo escuro vazio, brilho/neon/partículas, gradientes, texto que se move depois de pousar, zoom lento contínuo,
         tudo entrando do mesmo jeito, logo no canto, rótulos "01/02", animar o logotipo ou rostos.
QA:      t=1,0 (câmera em movimento), 2,0 (campo entrando), 3,2 (fotos), 4,6 (arcos), 6,0 (nó), 9,9 (pôster final: tudo assentado, etiqueta legível).
