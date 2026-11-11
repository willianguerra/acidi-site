// Texto comum das 12 páginas fixas, copiado de app/(site)/<página>/page.tsx. **negrito** e [texto](endereço) são o Formatado.
// Só entram as partes que CAMPOS_FIXA (lib/admin/paginas.ts) diz que a página tem; o resto fica vazio e continua no código da página.
import type { Fixa, ConteudoPagina, ConteudoHome, Bloco } from '@/lib/types';

const IMG = '/assets/img/';
const pg = (cabecalho: Omit<ConteudoPagina['cabecalho'], 'foto'> & { foto?: ConteudoPagina['cabecalho']['foto'] },
  resto: { lateral?: ConteudoPagina['lateral']; corpo?: Bloco[] } = {}): ConteudoPagina =>
  ({ cabecalho: { foto: null, ...cabecalho }, lateral: null, corpo: [], ...resto });

export const PAGINAS_FIXAS: { fixa: Fixa; slug: string; nome: string; descricao: string; conteudo: ConteudoPagina | ConteudoHome }[] = [
  {
    fixa: 'home', slug: '', nome: 'ACIDI – Associação Empresarial de Indaial',
    descricao: 'A ACIDI reúne empresários de Indaial (SC) desde 1989: serviços e convênios para associados, representatividade, núcleos setoriais, eventos e auditório.',
    conteudo: {
      destaque: { etiqueta: 'Associação Empresarial de Indaial', linha1: 'Juntos por uma', negrito: 'Indaial mais forte',
        chamada: 'Desde 1989, conectando empresas, pessoas e oportunidades para o desenvolvimento da nossa cidade.',
        desde: 'Representando, conectando e fortalecendo o empresariado de Indaial.' },
      quemSomos: { etiqueta: 'Quem somos', titulo: 'Empresários unidos.', negrito: 'Indaial mais forte.',
        chamada: 'Conectamos empresas, representamos o setor empresarial e apoiamos iniciativas que impulsionam o desenvolvimento de Indaial.',
        pilares: [
          { titulo: 'Representatividade', texto: 'Voz ativa nos conselhos municipais e nas pautas da região.' },
          { titulo: 'Conexões que fortalecem', texto: 'Núcleos setoriais e troca de experiências entre empresas.' },
          { titulo: 'Desenvolvimento local', texto: 'Apoio às empresas e à comunidade de Indaial.' },
        ] },
      servicos: { titulo: 'Soluções que conectam.', negrito: 'Sua empresa mais forte.',
        chamada: 'Serviços e benefícios para apoiar a gestão, desenvolver pessoas e tornar sua empresa mais competitiva, vários deles em parceria com a FACISC.' },
      noticias: { titulo: 'Notícias', negrito: 'e agenda', chamada: 'Informação e encontros que aproximam o empresariado de Indaial.' },
      representatividade: { titulo: 'A voz do empresário.', negrito: 'Mais forte, mais longe.',
        chamada: 'A ACIDI mobiliza lideranças, promove reuniões e debates e leva as demandas das empresas ao poder público, em defesa do desenvolvimento de Indaial e região.',
        sub: 'Conheça algumas das pautas defendidas pela ACIDI.' },
      auditorio: { titulo: 'O espaço certo para', negrito: 'grandes encontros.',
        chamada: 'Auditório climatizado e salas para reuniões e treinamentos, com valor diferenciado para associados.' },
      associe: { titulo: 'Sua empresa conectada.', negrito: 'Mais oportunidades para crescer.',
        chamada: 'Relacionamento, representatividade e benefícios para fortalecer o seu negócio.' },
    },
  },
  {
    fixa: 'historico', slug: 'historico', nome: 'A ACIDI e sua história',
    descricao: 'História da Associação Empresarial de Indaial (SC), fundada em 22 de maio de 1989 para unir e representar os empresários da cidade.',
    conteudo: pg({ etiqueta: 'A ACIDI · Histórico', titulo: 'Uma entidade de empresários', destaque: 'para Indaial',
      chamada: 'A Associação Empresarial de Indaial foi fundada por um grupo de empresários em 22 de maio de 1989.',
      foto: { src: IMG + 'sede-viva.jpg', alt: 'Sede da ACIDI em Indaial, prédio em estilo enxaimel',
        legenda: '**Sede da ACIDI** · Rua Ver. Alvin Rauh Júnior, 100, Nações, Indaial/SC · CEP 89082-065' } }, {
      corpo: [
        { subtitulo: 'Por que a ACIDI existe' },
        'O objetivo da fundação era congregar o empresariado local, da indústria, do comércio, da agricultura, das instituições financeiras, das prestadoras de serviços e dos profissionais liberais, para fortalecer a classe e unir esforços na busca do desenvolvimento e na resolução de problemas das empresas e da comunidade.',
        { subtitulo: 'O que a ACIDI faz hoje' },
        'A ACIDI consolidou-se como entidade consultiva da administração pública, de apoio às ações comunitárias e de incentivo ao desenvolvimento econômico do município, sem deixar de lado seu papel de prestadora de serviços aos associados e de representante dos interesses do empresário indaialense.',
        'É uma entidade que defende o bem-estar de toda a sociedade e se preocupa com os problemas locais, estaduais e federais que afetam a cidade direta ou indiretamente.',
        { subtitulo: 'Marcos publicados' },
        { lista: [
          '**22 de maio de 1989** · Fundação da ACIDI por um grupo de empresários de Indaial.',
          '**22 de maio de 2024** · Comemoração dos 35 anos e posse da diretoria para o biênio 2024–2026. [Ler a notícia](/noticias/acidi-35-anos-posse-da-diretoria)',
        ] },
        { imagem: { src: IMG + 'posse-2024.jpg', alt: 'Diretoria e convidados na cerimônia de posse e comemoração dos 35 anos da ACIDI',
          legenda: 'Comemoração dos 35 anos e posse da diretoria, maio de 2024.' } },
      ],
    }),
  },
  {
    fixa: 'nucleos', slug: 'nucleos', nome: 'Núcleos setoriais',
    descricao: 'Núcleos setoriais da ACIDI em Indaial: grupos de empresários que trocam experiências e buscam soluções em conjunto para o seu setor.',
    conteudo: pg({ etiqueta: 'A ACIDI · Núcleos', titulo: 'Quem vive o mesmo desafio', destaque: 'resolve junto',
      chamada: 'Os núcleos são grupos de trabalho para trocar experiências e identificar oportunidades e desafios comuns, buscando em conjunto as soluções mais eficientes.' }, {
      lateral: { texto: 'Além de promover o associativismo, os núcleos favorecem o desenvolvimento das empresas do setor e da economia do município.',
        botao: { texto: 'Saber quais núcleos estão ativos', href: '/contato?assunto=nucleos' } },
      corpo: [
        { subtitulo: 'Núcleos citados em publicações da ACIDI' },
        'Os registros abaixo vêm de publicações da associação, com a data de cada uma. Para saber quais núcleos estão em funcionamento e como participar, fale com a equipe.',
        // a tabela de núcleos fica no código da página, entre o parágrafo acima e o subtítulo abaixo
        { subtitulo: 'Conselhos municipais' },
        'A ACIDI também participa de conselhos municipais da Prefeitura, por entender que é responsabilidade da entidade representar e defender os interesses do empresário e o desenvolvimento da cidade.',
        { lista: ['Indústria e Comércio', 'Turismo', 'Saúde', 'Educação', 'Trânsito', 'Defesa Civil', 'Direitos da Criança e do Adolescente', 'Saneamento Ambiental', 'Administração HBR', 'Políticas Esportivas'] },
      ],
    }),
  },
  {
    fixa: 'representatividade', slug: 'representatividade', nome: 'Representatividade',
    descricao: 'Como a ACIDI representa os empresários de Indaial (SC) junto aos poderes públicos e entidades, com pautas como o Voz Única e a FACISC.',
    conteudo: pg({ etiqueta: 'A ACIDI · Representatividade', titulo: 'A voz do empresário', destaque: 'junto ao poder público',
      chamada: 'A ACIDI é uma das principais entidades representativas da classe empresarial de Indaial e da região.',
      foto: { src: IMG + 'voz-unica-2024.jpg', alt: 'Representantes de entidades de Indaial reunidos diante do logotipo da ACIDI',
        legenda: 'Entrega do Documento Voz Única Municipal, setembro de 2024.' } }, {
      lateral: { texto: 'A associação defende interesses, direitos e reivindicações dos empresários e da sociedade junto aos poderes públicos e privados, mobilizando lideranças, promovendo reuniões e realizando debates e ações para buscar soluções.', botao: null },
      corpo: [
        { subtitulo: 'Pleitos defendidos pela associação' },
        'Pautas que a ACIDI publica entre os pleitos que defende. A lista não informa a situação atual de cada pleito.',
      ],
    }),
  },
  {
    fixa: 'para-seu-negocio', slug: 'para-seu-negocio', nome: 'Serviços para seu negócio',
    descricao: 'Serviços da ACIDI para empresas de Indaial: Util Card, Uniodonto, Boa Vista SCPC, Certificado de Origem, XML empresarial, treinamentos e auditório.',
    conteudo: pg({ etiqueta: 'Para seu negócio', titulo: 'Serviços para a', destaque: 'gestão da empresa',
      chamada: 'A ACIDI oferece aos associados vantagens e soluções para auxiliar a gestão do negócio e tornar a empresa mais competitiva.' }),
  },
  {
    fixa: 'auditorio', slug: 'auditorio', nome: 'Auditório e salas',
    descricao: 'Alugue o auditório para 170 pessoas ou salas de reunião climatizadas na sede da ACIDI, em Indaial (SC). Valor diferenciado para associados.',
    conteudo: pg({ etiqueta: 'Para seu negócio · Espaços', titulo: 'Realize seu evento', destaque: 'na ACIDI',
      chamada: 'Para atender associados e a comunidade, a ACIDI disponibiliza para locação salas para reuniões e treinamentos e seu auditório.' }),
  },
  {
    fixa: 'associe-se', slug: 'associe-se', nome: 'Associe-se',
    descricao: 'Associe sua empresa à ACIDI, a associação empresarial de Indaial (SC): convênios, treinamentos, auditório, Certificado de Origem e rede de contatos.',
    conteudo: pg({ etiqueta: 'Associe-se', titulo: 'Sua empresa', destaque: 'na rede da ACIDI',
      chamada: 'Aproveite os benefícios de ser associado e as soluções da ACIDI para fazer sua empresa crescer. A rede de relacionamento é o ponto de partida.',
      foto: { src: IMG + 'feijoada-2024.jpg', alt: 'Associados reunidos no palco da segunda Feijoada da ACIDI', legenda: 'Segunda Feijoada da ACIDI, julho de 2024.' } }),
  },
  {
    fixa: 'contato', slug: 'contato', nome: 'Contato',
    descricao: 'Fale com a ACIDI: telefone e WhatsApp (47) 3333-8786, contato@acidi.net e sede na Rua Ver. Alvin Rauh Júnior, 100, bairro Nações, Indaial (SC).',
    conteudo: pg({ etiqueta: 'Contato', titulo: 'Fale', destaque: 'com a ACIDI',
      chamada: 'Atendimento por telefone, WhatsApp e e-mail, e a sede no bairro Nações, em Indaial.' }),
  },
  {
    fixa: 'noticias', slug: 'noticias', nome: 'Notícias',
    descricao: 'Notícias da ACIDI e do empresariado de Indaial (SC): eventos, representatividade, Jogos entre Empresas, núcleos e ações para associados.',
    conteudo: pg({ etiqueta: 'Acontece', titulo: 'Notícias', destaque: 'da ACIDI',
      chamada: 'Eventos, iniciativas e ações de representatividade da associação, com a data original de cada publicação.' }),
  },
  {
    fixa: 'agenda', slug: 'agenda', nome: 'Agenda de eventos',
    descricao: 'Próximos eventos da ACIDI em Indaial: palestras, núcleos, encontros de associados e networking, com o arquivo dos eventos já realizados.',
    conteudo: pg({ etiqueta: 'Acontece', titulo: 'Agenda', destaque: 'da ACIDI',
      chamada: 'Próximos eventos publicados pela associação e o arquivo dos registros anteriores.' }),
  },
  {
    fixa: 'diretoria', slug: 'diretoria', nome: 'Diretoria',
    descricao: 'Diretoria executiva, vice-presidências e conselhos da ACIDI – Associação Empresarial de Indaial na gestão 2024/2026.',
    conteudo: pg({ etiqueta: 'A ACIDI · Diretoria', titulo: 'Gestão', destaque: '2024/2026',
      chamada: 'Diretoria executiva, vice-presidências por área e conselhos, conforme a composição publicada pela associação.' }, {
      // só o 1º parágrafo; o 2º (link "Ler a notícia da posse", com margem própria) fica no código da página
      lateral: { texto: 'A posse da diretoria para o biênio 2024–2026 ocorreu em 22 de maio de 2024, na comemoração dos 35 anos da ACIDI.', botao: null },
    }),
  },
  {
    fixa: 'ex-presidentes', slug: 'ex-presidentes', nome: 'Ex-presidentes',
    descricao: 'Os empresários que presidiram a ACIDI – Associação Empresarial de Indaial desde a fundação, em 1989, com foto e período de cada gestão.',
    conteudo: pg({ etiqueta: 'A ACIDI · Ex-Presidentes', titulo: 'Quem conduziu', destaque: 'a ACIDI',
      chamada: 'Empresários que presidiram a associação, na ordem publicada pela ACIDI. Adolfo Fey, primeiro presidente, é lembrado como fundador da entidade.' }),
  },
];
