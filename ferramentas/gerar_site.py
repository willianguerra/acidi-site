"""Gera as páginas HTML estáticas do site demonstrativo da ACIDI.

Uso (na pasta ACIDI-site-demonstracao):  python ferramentas/gerar_site.py
Conteúdo extraído de www.acidi.net em 26/10/2026. Veja docs/DOCUMENTACAO.md.
"""
import os, unicodedata
from datetime import date
from html import escape

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
HOJE = date.today().isoformat()  # só para a ordem inicial sem JavaScript; o navegador recalcula

# ---------------------------------------------------------------- ícones
P = {
 'down': '<path d="M6 9l6 6 6-6"/>',
 'go': '<path d="M5 12h14M13 6l6 6-6 6"/>',
 'back': '<path d="M19 12H5M11 6l-6 6 6 6"/>',
 'ext': '<path d="M7 17L17 7M8 7h9v9"/>',
 'menu': '<path d="M4 7h16M4 12h16M4 17h16"/>',
 'x': '<path d="M6 6l12 12M18 6L6 18"/>',
 'clock': '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
 'people': '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c.8-3.5 3.4-5.5 6.5-5.5s5.7 2 6.5 5.5"/><path d="M16 4.5a3.5 3.5 0 010 7M18 14.8c1.8.8 3 2.6 3.5 5.2"/>',
 'bars': '<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',
 'gov': '<path d="M3 10l9-6 9 6M5 10v9M19 10v9M9 10v9M15 10v9M3 20h18"/>',
 'grid': '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',
 'card': '<rect x="3" y="6" width="18" height="12" rx="2"/><path d="M3 10h18M7 15h4"/>',
 'tooth': '<path d="M7 3c-2 0-3 2-3 4 0 4 2 6 2 10 0 2 1 4 2 4s1-3 2-5 1-2 2-2 1 0 2 2 1 5 2 5 2-2 2-4c0-4 2-6 2-10 0-2-1-4-3-4-2 0-3 1-5 1S9 3 7 3z"/>',
 'search': '<circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5M8 11l2 2 4-4"/>',
 'doc': '<path d="M14 3H6a2 2 0 00-2 2v14a2 2 0 002 2h12a2 2 0 002-2V9z"/><path d="M14 3v6h6M8 14l2.5 2.5L16 11"/>',
 'screen': '<path d="M3 5h18v11H3zM8 20h8M12 16v4"/>',
 'cal': '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4M9 15l2 2 4-4"/>',
 'info': '<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.5v.5"/>',
 'check': '<path d="M20 6L9 17l-5-5"/>',
}
def ico(n, cls='ico'):
    return f'<svg class="{cls}" viewBox="0 0 24 24" aria-hidden="true" focusable="false">{P[n]}</svg>'

def ext(href, inner, cls=''):
    c = f' class="{cls}"' if cls else ''
    return f'<a{c} href="{href}" target="_blank" rel="noopener">{inner}{ico("ext","ico ext-i")}<span class="sr"> (abre em nova aba)</span></a>'

WHATS = 'https://api.whatsapp.com/send?phone=554733338786'
MAPA = 'https://www.google.com/maps/search/?api=1&query=Rua+Vereador+Alvin+Rauh+J%C3%BAnior+100+Indaial+SC'
INSTA = 'https://www.instagram.com/acidi.indaial/'
FACE = 'https://www.facebook.com/acidinoticias'
ENDERECO = 'Rua Ver. Alvin Rauh Júnior, 100, Nações, Indaial/SC · CEP 89082-065'

# ---------------------------------------------------------------- conteúdo
SERVICOS = [
 ('util-card', 'Família Util Card', 'card', 'util.jpg', 'Util',
  'Vale-refeição, vale-alimentação e cartão de benefícios, sem mensalidade nem anuidade.',
  ['Em parceria com a FACISC, a ACIDI oferece aos associados os cartões de benefício Util, divididos em vale-refeição, vale-alimentação e cartão de benefícios.',
   'Os cartões facilitam a gestão de benefícios da empresa e o controle do fluxo de caixa, inclusive eliminando o desencaixe financeiro. Com os cartões Util não há mensalidade nem anuidade.'],
  ('https://site.convcard.com.br/crt/', 'Acessar o UtilCard')),
 ('uniodonto', 'Uniodonto', 'tooth', 'uniodonto.jpg', 'Uniodonto',
  'Assistência odontológica para colaboradores, extensível aos dependentes.',
  ['Por meio da parceria com a Uniodonto SC, a empresa associada pode oferecer assistência odontológica aos colaboradores, extensível aos seus dependentes.',
   'Os planos dão acesso a profissionais que cuidam do bem-estar e da saúde do colaborador e de sua família.'],
  ('https://www.uniodontosc.coop.br/encontre-seu-dentista.php', 'Encontrar um dentista Uniodonto')),
 ('boa-vista-scpc', 'Consulta Boa Vista SCPC', 'search', 'boavista.jpg', 'Boa Vista',
  'Informações de crédito rápidas e integradas para todas as etapas do negócio.',
  ['A solução Boa Vista SCPC é um sistema de consulta para análise de crédito, com informações rápidas, integradas e seguras para todas as etapas do negócio.',
   'O sistema on-line acompanha todo o processo, da prospecção e concessão de crédito à gestão da carteira e à recuperação.'],
  ('http://web2.bvsnet.com.br/', 'Acessar a consulta SCPC')),
 ('certificado-de-origem', 'Certificado de Origem', 'doc', None, 'Exportação',
  'Comprova a procedência do produto e reduz ou isenta o imposto de importação no país comprador.',
  ['O Certificado de Origem é o documento legal que comprova ao país comprador a procedência do bem adquirido e especifica as normas de origem negociadas nos acordos comerciais entre o Brasil e outros países.',
   'Seu principal benefício é a redução ou isenção do imposto de importação para as empresas compradoras no exterior, o que torna mais competitivo o preço final das mercadorias exportadas por empresas brasileiras.'], None),
 ('treinamentos-e-palestras', 'Treinamentos e Palestras', 'screen', None, 'Capacitação',
  'Qualificação aberta à comunidade, com desconto para associados e opção in company.',
  ['A ACIDI oferece treinamentos, em parceria com outras entidades, para o aprimoramento das empresas e de seus colaboradores, com foco no crescimento pessoal e profissional.',
   'Os treinamentos são abertos a toda a comunidade, com prioridade e descontos especiais para associados. Os temas são variados e também podem ser realizados in company.'], None),
 ('protesto-expresso', 'Protesto Expresso', 'doc', None, 'Cobrança',
  'Envio de títulos a protesto on-line; as custas ficam por conta do devedor.',
  ['O Protesto Expresso é uma ferramenta de recuperação de dívidas: o empresário envia os títulos a protesto e as custas ficam por conta do devedor.',
   'Todo o processo é feito on-line, de forma rápida e prática.'], None),
 ('xml-empresarial', 'XML Empresarial', 'doc', None, 'Fiscal',
  'Emissão, guarda e gestão de documentos fiscais eletrônicos, fornecido pela FACISC.',
  ['O XML Empresarial é o serviço de armazenamento, emissão e gestão de documentos eletrônicos fornecido pela FACISC.',
   'Ele ajuda o empresário no dia a dia, cumprindo as exigências legais de guarda e geração de documentos fiscais.'], None),
]

# (data AAAA-MM-DD, título, horário, local, descrição)
EVENTOS = [
 ('2026-02-25', 'Visita do deputado estadual Napoleão Bernardes', None, 'SRI', 'Visita do deputado estadual Napoleão Bernardes.'),
 ('2022-05-31', 'Assembleia Geral Ordinária', '19h', 'ACIDI', 'Convocação da assembleia dos associados.'),
 ('2022-05-18', 'Encontro do Núcleo Câmara da Mulher Empresária', '19h', 'ACIDI', 'Reunião do Núcleo Câmara da Mulher Empresária.'),
 ('2022-05-18', 'Encontro do Núcleo Gestão de Pessoas', '14h', 'ACIDI', 'Reunião do Núcleo Gestão de Pessoas.'),
 ('2022-05-18', 'Encontro do Núcleo de Saúde e Segurança do Trabalhador', '8h', 'ACIDI', 'Reunião do Núcleo de Saúde e Segurança do Trabalhador.'),
 ('2022-05-18', 'Visita do DNIT/SC', '11h', 'ACIDI', 'Reunião com o diretor de Fiscalização de Contratos e Obras do DNIT/SC.'),
]
MESES = ['jan','fev','mar','abr','mai','jun','jul','ago','set','out','nov','dez']
MESES_EXT = ['janeiro','fevereiro','março','abril','maio','junho','julho','agosto','setembro','outubro','novembro','dezembro']
def ev_id(e):
    ascii_ = unicodedata.normalize('NFKD', e[1].lower()).encode('ascii', 'ignore').decode()
    return 'evento-' + e[0] + '-' + '-'.join(''.join(c for c in w if c.isalnum()) for w in ascii_.split()[-2:])
def dlong(iso):
    y, m, d = iso.split('-'); return f'{int(d)} de {MESES_EXT[int(m)-1]} de {y}'
def dshort(iso):
    y, m, d = iso.split('-'); return f'{int(d)} {MESES[int(m)-1]} {y}'

# Notícias: (slug, data, título, imagem, alt, resumo, corpo em blocos)
NOTICIAS = [
 ('contabilidade-e-impacto-social', '2025-04-11', 'Contabilidade e impacto social: construindo um futuro melhor', 'contabilidade-2025.jpg',
  'Plateia no auditório da ACIDI durante o encontro sobre contabilidade e impacto social',
  'O auditório da ACIDI recebeu contadores e empresários da área contábil para debater o papel da contabilidade no desenvolvimento de Indaial.',
  ['Na manhã de quarta-feira, 10 de abril, o auditório da Associação Empresarial de Indaial (ACIDI) recebeu um evento voltado a contadores, empresários da área contábil e profissionais interessados na relação entre contabilidade e transformação social.',
   'Com o tema “Contabilidade e Impacto Social: Construindo um Futuro Melhor”, o encontro destacou o papel estratégico da contabilidade no desenvolvimento socioeconômico de Indaial. Foram debatidas as formas pelas quais a atuação consciente e técnica dos profissionais da contabilidade pode contribuir para uma sociedade mais justa, organizada e sustentável.',
   'Além de abordar aspectos técnicos e tendências da área, o evento reforçou a importância da contabilidade como aliada das empresas e do poder público na promoção de uma gestão eficiente, transparente e comprometida com o bem coletivo.',
   'A ACIDI reafirma seu compromisso em promover iniciativas que valorizem os profissionais locais, estimulem o conhecimento e fortaleçam o ecossistema empresarial da região.']),
 ('comitiva-visita-tecnica-maringa', '2025-04-11', 'Comitiva de Indaial realiza visita técnica à cidade de Maringá (PR)', 'comitiva-2025.jpg',
  'Integrantes da comitiva de lideranças de Indaial reunidos durante a visita técnica',
  'Lideranças de Indaial conheceram em Maringá boas práticas de desenvolvimento urbano, inovação e gestão pública, em viagem organizada pela ACIDI.',
  ['Uma comitiva de lideranças de Indaial participou de uma visita técnica à cidade de Maringá (PR), referência nacional em desenvolvimento urbano, inovação e gestão pública. A iniciativa foi organizada pela ACIDI, com o objetivo de conhecer boas práticas e fortalecer o planejamento estratégico para o crescimento sustentável do município.',
   'Durante a agenda, a comitiva foi recebida no Conselho de Desenvolvimento de Maringá, entidade que reúne representantes da sociedade civil e do poder público na construção de políticas públicas. O encontro proporcionou troca de experiências nas áreas de:',
   ['Planejamento urbano e governança', 'Saúde pública e gestão hospitalar', 'Educação e formação profissional', 'Finanças e sustentabilidade econômica', 'Tecnologia, inovação e transformação digital', 'Informação e comunicação institucional', 'Urbanismo e mobilidade urbana', 'Desenvolvimento do turismo'],
   'Participaram da comitiva, entre outras lideranças:',
   ['Vanderlei Couto, presidente da CDL Indaial', 'Silvio César, prefeito de Indaial', 'Tibério Malkowski Junior, coordenador de Desenvolvimento Econômico, Eventos e Turismo de Indaial', 'Flávio Buzzi, prefeito de Timbó', 'Marcondes Aurélio Moser, presidente da ACIDI', 'Sérgio Cadore, presidente do Conselho de Administração da Viacredi'],
   'Com a ação, a ACIDI reforça seu compromisso de buscar modelos de gestão bem-sucedidos e estimular a cooperação entre instituições públicas e privadas, para fomentar o desenvolvimento econômico e social de Indaial com base em experiências concretas.']),
 ('acidi-itinerante', '2024-12-19', 'ACIDI promove a 1ª edição do ACIDI Itinerante na Villa Germânia Alimentos', 'itinerante-2024.jpg',
  'Participantes da primeira edição do ACIDI Itinerante reunidos na Villa Germânia Alimentos',
  'O novo formato leva os encontros de associados para dentro das empresas, com palestra, almoço e visita aos processos produtivos.',
  ['Na terça-feira, 10 de dezembro, a ACIDI realizou a primeira edição do ACIDI Itinerante, um evento que busca fortalecer o networking e o associativismo entre os empresários de Indaial. A iniciativa aconteceu nas dependências da Villa Germânia Alimentos.',
   'A programação contou com a palestra da Dra. Bruna Nakamura Moser sobre o tema “As empresas podem ser herdadas, vendidas ou fechadas! Qual será o destino da sua empresa?”, com reflexões sobre planejamento estratégico e sucessão empresarial.',
   'Depois da palestra, os participantes almoçaram um prato típico de marreco recheado, especialidade da casa, e fizeram um tour pela empresa para conhecer de perto seus processos produtivos.',
   ('quote', '“É um modelo inovador que promove engajamento, conhecimento e troca de experiências entre os associados, fortalecendo ainda mais o espírito de união no meio empresarial.” Marcondes Aurélio Moser, presidente da ACIDI'),
   'A ACIDI reforça seu compromisso de promover eventos que inspirem e fortaleçam a classe empresarial de Indaial.']),
 ('networkaffee', '2024-12-19', 'Networkaffee reúne empreendedores para debater cenário e oportunidades', 'networkaffee-2024.jpg',
  'Participantes do Networkaffee reunidos diante do logotipo da ACIDI',
  'Encontro matinal da ACIDI discutiu tendências macroeconômicas e oportunidades financeiras para as empresas.',
  ['A ACIDI realizou uma manhã de conhecimento e conexões com empreendedores de Indaial e região no Networkaffee.',
   'O encontro teve como tema “Cenário e Oportunidades”, com uma análise das tendências macroeconômicas e das oportunidades financeiras para o futuro das empresas.',
   'A ACIDI agradeceu a todos os participantes e ao Banco Daycoval pelo patrocínio e apoio.']),
 ('encontro-de-liderancas-regionais', '2024-12-03', 'Encontro de Lideranças Regionais reúne associados na SRI', 'liderancas-2024.jpg',
  'Associados e convidados durante o almoço do Encontro de Lideranças Regionais',
  'Almoço de associados recebeu o secretário Paulo Bornhausen e o prefeito eleito de Indaial, Silvio César.',
  ['A ACIDI realizou na terça-feira, 3 de dezembro, nas dependências da SRI, um almoço para seus associados com a presença de lideranças regionais.',
   'Os associados receberam o secretário de Articulação Internacional e Projetos Estratégicos de Santa Catarina, Paulo Bornhausen, e o prefeito eleito de Indaial para a gestão 2025/2028, Silvio César.',
   'Silvio César apresentou os projetos, desafios e oportunidades que seriam tratados em sua gestão. O secretário Paulo Bornhausen falou sobre empoderamento regional, inovação e ações de desenvolvimento em Santa Catarina.',
   'O encontro também foi um momento de networking e de fortalecimento do associativismo.']),
 ('documento-voz-unica-municipal', '2024-09-19', 'ACIDI entrega o Documento Voz Única Municipal aos candidatos a prefeito de Indaial', 'voz-unica-2024.jpg',
  'Representantes de entidades de Indaial reunidos diante do logotipo da ACIDI na entrega do documento',
  'Em parceria com entidades de classe da cidade, a ACIDI apresentou as necessidades de Indaial aos cinco candidatos à prefeitura.',
  ['Na quarta-feira, 18 de setembro, a ACIDI, em parceria com entidades de classe de Indaial, promoveu a apresentação e a entrega do Documento Voz Única Municipal.',
   'Participaram da iniciativa Rotary, Casa da Amizade, TURIND, Lions Club, CDL Indaial, SIMMMEI, SACI, OAB, Núcleos Setoriais ACIDI, Movimento Nacional ODS e Observatório Social.',
   'O programa Voz Única foi criado para entender as necessidades reais da cidade, identificar desafios e propor soluções que impulsionem o crescimento e o desenvolvimento de Indaial.',
   'O documento foi entregue aos cinco candidatos à prefeitura: Ana Paula Reiter, Anderson Luz dos Santos (Batata), Jeser Batista, Lindomar Lindner (Alemão) e Sílvio César da Silva.']),
 ('segunda-feijoada-da-acidi', '2024-07-08', 'Segunda Feijoada da ACIDI reúne associados e celebra os 35 anos da entidade', 'feijoada-2024.jpg',
  'Associados reunidos no palco da segunda Feijoada da ACIDI',
  'O evento homenageou empresas associadas e reuniu famílias, colaboradores e amigos com música, área kids e feira de artesanato.',
  ['No dia 6 de julho, a ACIDI realizou a segunda edição de sua Feijoada, que neste ano marcou a comemoração dos 35 anos de fundação da entidade. O objetivo foi homenagear as empresas associadas e integrar associados, famílias, colaboradores e amigos.',
   'A programação contou com música ao vivo, área kids, atividades organizadas pelo SESI/SENAI, feira de artesanato promovida pelo Núcleo do Artesanato e Economia Criativa e homenagens às empresas associadas pela sua fundação.',
   ('quote', '“Este é um momento importante de integração, que reforça a força do associativismo para o fortalecimento da ACIDI. Agradecemos a presença de todos e continuaremos a trabalhar juntos pelo desenvolvimento de nossa entidade e de nossa cidade.” Marcondes Aurélio Moser, presidente da ACIDI'),
   'O evento reafirmou o compromisso da ACIDI em promover o bem-estar e a união entre os associados.']),
 ('encerramento-12-jogos-entre-empresas', '2024-06-17', 'Encerramento dos 12º Jogos Entre Empresas celebra esporte e integração em Indaial', 'jogos-2024.jpg',
  'Entrega de troféu durante o encerramento dos 12º Jogos Entre Empresas',
  'A competição reuniu mais de 105 empresas e mais de 2.500 atletas em mais de 20 modalidades, de março a junho.',
  ['A ACIDI e a Fundação Municipal de Esportes realizaram na sexta-feira, 14 de junho, na Sociedade Recreativa Indaial, o encerramento dos 12º Jogos Entre Empresas, com a premiação dos campeões nas categorias Geral, Masculino e Feminino e o Concurso Garota dos Jogos.',
   'A competição se estendeu por quase três meses, de março a junho, com a participação de mais de 105 empresas e mais de 2.500 atletas, em mais de 20 modalidades.',
   ('table', [
     ('Campeão geral', ['1º Prefeitura Municipal de Indaial · 207 pontos', '2º Thaigu Confecções / Gráfica e Impressora Nota 10 / Indablu Toldos e Coberturas · 192 pontos', '3º Fey · 187 pontos']),
     ('Naipe feminino', ['1º Prefeitura Municipal de Indaial · 191 pontos', '2º Thaigu Confecções / Gráfica e Impressora Nota 10 / Indablu Toldos e Coberturas · 177 pontos', '3º Vitória Régia Shopping · 113 pontos']),
     ('Naipe masculino', ['1º Sumer Industrial / Morel Máquinas de Costura / Lojas Raitz · 84 pontos', '2º Fey · 76 pontos', '3º Sisplan Sistemas e Planejamento · 68 pontos'])]),
   'A organização agradeceu a atletas, empresários, coordenadores de modalidades, torcedores, arbitragem, imprensa, servidores da FME, membros da ACIDI, apoiadores, patrocinadores e entidades parceiras que cederam suas estruturas esportivas.']),
 ('acidi-35-anos-posse-da-diretoria', '2024-05-23', 'ACIDI celebra 35 anos com posse da nova diretoria', 'posse-2024.jpg',
  'Diretoria e convidados reunidos na cerimônia de posse e comemoração dos 35 anos da ACIDI',
  'Marcondes Aurélio Moser assumiu a presidência para o biênio 2024–2026, sucedendo Rogério Patricio.',
  ['A ACIDI celebrou em 22 de maio seus 35 anos de existência e deu posse à nova diretoria para o biênio 2024–2026, em evento que reuniu autoridades, associados e convidados.',
   'Marcondes Aurélio Moser, empresário e sócio da Villa Germania, assumiu a presidência, sucedendo Rogério Patricio. Em seu discurso, destacou o objetivo de fortalecer a conexão entre os empresários para promover o desenvolvimento das empresas e, consequentemente, da cidade, do estado e do país.',
   ('quote', '“Indaial é uma cidade relevante e importante, ela tem em seu DNA a inovação e assim que queremos seguir enquanto ACIDI, buscando a inovação e a criatividade para desenvolver nossas empresas.” Marcondes Aurélio Moser'),
   'O evento contou com a participação de Adolfo Fey, fundador da ACIDI, e de Rita Cassia Conti, representante da FACISC, que parabenizou a nova diretoria e reforçou a importância do associativismo.',
   'Compõem a diretoria executiva: Marcondes Aurélio Moser (presidente), Rogério Patricio (vice-presidente), Almir Malkowski (tesoureiro) e Rogério Artur Ehrat (secretário).']),
 ('imposto-de-renda-impacto-social', '2024-04-03', 'Transforme sua declaração de Imposto de Renda em uma ação de impacto social em Indaial', 'ir-campanha.jpg',
  'Peça da campanha de destinação do Imposto de Renda apoiada pela ACIDI',
  'A ACIDI apoiou a campanha de destinação do imposto de renda aos fundos dos Direitos da Criança, do Adolescente e da Pessoa Idosa.',
  ['A ACIDI apoiou uma campanha de incentivo à destinação do imposto de renda aos fundos dos Direitos da Criança, do Adolescente e da Pessoa Idosa.',
   'Ao destinar parte do imposto de renda a esses fundos, o contribuinte não paga a mais e sua restituição não diminui. É um ato de cidadania com impacto direto na cidade.',
   'Na campanha de 2024, a destinação podia ser feita durante o período de declaração, de 15 de março a 31 de maio.',
   'Para mais informações sobre como destinar o imposto de renda, entre em contato com a ACIDI.']),
]

# ---------------------------------------------------------------- moldura
NAV_ACIDI = [('historico.html', 'Histórico', 'clock', 'Fundada por empresários em 22 de maio de 1989'),
             ('diretoria.html', 'Diretoria', 'people', 'Gestão 2024/2026 e conselhos'),
             ('ex-presidentes.html', 'Ex-Presidentes', 'bars', 'Quem presidiu a associação'),
             ('representatividade.html', 'Representatividade', 'gov', 'Pleitos e conselhos municipais'),
             ('nucleos.html', 'Núcleos', 'grid', 'Grupos de trabalho por setor')]
NAV_NEG = [(f'para-seu-negocio.html#{s[0]}', s[1], s[2], s[5].split(',')[0].split('.')[0]) for s in SERVICOS[:5]] + \
          [('auditorio.html', 'Auditório e salas', 'cal', 'Auditório para 170 pessoas')]

def head(title, desc):
    return f'''<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{escape(title)}</title>
<meta name="description" content="{escape(desc)}">
<meta name="theme-color" content="#0B3D24">
<link rel="icon" type="image/png" href="assets/img/favicon.png">
<link rel="stylesheet" href="assets/css/fonts.css">
<link rel="stylesheet" href="assets/css/site.css">
</head>
<body>
<a class="skip" href="#conteudo">Pular para o conteúdo</a>
'''

def cur(href, page):
    return ' aria-current="page"' if href.split('#')[0] == page else ''

def header(page):
    def panel(pid, items, title, wide=False):
        links = ''.join(f'<a href="{h}"{cur(h, page) if "#" not in h else ""}>{ico(i)}<b>{t}</b><span>{d}</span></a>' for h, t, i, d in items)
        return f'<div class="panel{" wide" if wide else ""}" id="{pid}" hidden><span class="ph">{title}</span>{links}</div>'
    here_a = ' here' if page in [h for h, *_ in NAV_ACIDI] else ''
    here_n = ' here' if page in ('para-seu-negocio.html', 'auditorio.html') else ''
    sheet_links = lambda items: ''.join(f'<a href="{h}"{cur(h, page) if "#" not in h else ""}>{t}</a>' for h, t, *_ in items)
    return f'''<div class="util"><div class="wrap">
  <span>(47) 3333-8786</span><span>comunicacao@acidi.net</span>
  <span class="r">{ext(INSTA, 'Instagram')}{ext(FACE, 'Facebook')}</span>
</div></div>
<header class="site"><div class="wrap">
  <a class="brand" href="index.html"{' aria-current="page"' if page == 'index.html' else ''}><img src="assets/img/logo.png" width="189" height="50" alt="ACIDI, Associação Empresarial de Indaial. Ir para o início"></a>
  <nav class="main" aria-label="Principal">
    <div class="dd"><button type="button" class="{here_a.strip()}" aria-expanded="false" aria-controls="m-acidi">A ACIDI {ico('down')}</button>{panel('m-acidi', NAV_ACIDI, 'Institucional')}</div>
    <div class="dd"><button type="button" class="{here_n.strip()}" aria-expanded="false" aria-controls="m-neg">Para seu negócio {ico('down')}</button>{panel('m-neg', NAV_NEG, 'Serviços para associados', True)}</div>
    <a href="noticias.html"{' aria-current="page"' if page.startswith('noticia') else ''}>Notícias</a>
    <a href="agenda.html"{cur('agenda.html', page)}>Agenda</a>
    <a href="contato.html"{cur('contato.html', page)}>Contato</a>
  </nav>
  <a class="btn btn-p hd-cta" href="associe-se.html"{cur('associe-se.html', page)}>Associe sua empresa</a>
  <button class="burger" type="button" aria-label="Abrir menu" aria-expanded="false" aria-controls="menu-movel">{ico('menu')}</button>
</div></header>
<dialog class="sheet" id="menu-movel" aria-label="Menu"><div class="in">
  <div class="top"><img src="assets/img/logo.png" width="151" height="40" alt="ACIDI"><button class="burger x" type="button" data-fechar aria-label="Fechar menu">{ico('x')}</button></div>
  <nav aria-label="Menu do celular">
    <div class="grp"><a href="index.html"{cur('index.html', page)}>Início</a></div>
    <div class="grp"><h2>A ACIDI</h2>{sheet_links(NAV_ACIDI)}</div>
    <div class="grp"><h2>Para seu negócio</h2><a href="para-seu-negocio.html"{cur('para-seu-negocio.html', page)}>Serviços para associados</a><a href="auditorio.html"{cur('auditorio.html', page)}>Auditório e salas</a></div>
    <div class="grp"><h2>Acompanhe</h2><a href="noticias.html"{' aria-current="page"' if page.startswith('noticia') else ''}>Notícias</a><a href="agenda.html"{cur('agenda.html', page)}>Agenda</a><a href="contato.html"{cur('contato.html', page)}>Contato</a></div>
  </nav>
  <a class="btn btn-p" href="associe-se.html">Associe sua empresa {ico('go', 'ico go')}</a>
</div></dialog>
<main id="conteudo">
'''

def footer():
    return f'''</main>
<footer class="site on-dark">
  <div class="wrap cols">
    <div><span class="logo-w"><img src="assets/img/logo.png" width="151" height="40" alt="ACIDI"></span><p style="margin-top:18px;max-width:34ch">Associação Empresarial de Indaial. {ENDERECO}.</p></div>
    <div><h2>A ACIDI</h2><ul>{''.join(f'<li><a href="{h}">{t}</a></li>' for h, t, *_ in NAV_ACIDI)}</ul></div>
    <div><h2>Associado</h2><ul><li><a href="para-seu-negocio.html">Para seu negócio</a></li><li><a href="auditorio.html">Auditório e salas</a></li><li><a href="associe-se.html">Associe-se</a></li></ul></div>
    <div><h2>Acompanhe</h2><ul><li><a href="noticias.html">Notícias</a></li><li><a href="agenda.html">Agenda</a></li><li>{ext(INSTA, 'Instagram')}</li><li>{ext(FACE, 'Facebook')}</li></ul></div>
    <div><h2>Contato</h2><ul><li>(47) 3333-8786</li><li>contato@acidi.net</li><li><a href="contato.html">Fale com a ACIDI</a></li></ul></div>
  </div>
  <div class="wrap"><p class="big" aria-hidden="true">Juntos somos <b>mais fortes</b></p></div>
  <div class="wrap base"><span>© 2026 ACIDI · Associação Empresarial de Indaial</span><span>Versão demonstrativa para avaliação</span></div>
</footer>
<div class="mbar"><a class="btn btn-p" href="associe-se.html">Associe sua empresa</a>{ext(WHATS, 'WhatsApp', 'btn btn-s')}</div>
<script src="assets/js/site.js"></script>
</body>
</html>
'''

def crumbs(items):
    lis = ''.join(f'<li><a href="{h}">{t}</a></li>' if h else f'<li aria-current="page">{t}</li>' for h, t in items)
    return f'<nav class="crumbs wrap" aria-label="Você está em"><ol>{lis}</ol></nav>'

def phead(kicker, title_html, lead, side='', pic=None):
    if pic:
        src, alt, cap = pic
        return f'''<header class="phead photo-head"><div class="wrap grid12">
  <div class="t"><span class="kicker">{kicker}</span><h1 class="hl">{title_html}</h1><p class="lead">{lead}</p></div>
  <figure class="pic" style="margin:0"><div class="photo"><img src="assets/img/{src}" alt="{escape(alt)}"></div>{f'<figcaption class="cap">{cap}</figcaption>' if cap else ''}</figure>
</div></header>'''
    return f'''<header class="phead"><div class="wrap grid12">
  <div class="t"><span class="kicker">{kicker}</span><h1 class="hl">{title_html}</h1><p class="lead">{lead}</p></div>
  {f'<div class="side">{side}</div>' if side else ''}
</div></header>'''

def page(fname, title, desc, body):
    html = head(title, desc) + header(fname) + body + footer()
    with open(os.path.join(RAIZ, fname), 'w', encoding='utf-8', newline='\n') as f:
        f.write(html)
    return fname

SUF = ' · ACIDI – Associação Empresarial de Indaial'

# ---------------------------------------------------------------- blocos reutilizados
def ev_item(e, tag='li'):
    d, t, h, loc, desc = e
    y, m, dd = d.split('-')
    info = ''.join(f'<div><dt>{k}</dt><dd>{v}</dd></div>' for k, v in (('Data:', dlong(d)), ('Horário:', h), ('Local:', loc)) if v)
    hidden = ' hidden' if (tag == 'li-home' and d < HOJE) else ''
    tg = 'li'
    return f'<{tg} class="ev" id="{ev_id(e)}" data-date="{d}"{hidden}><div class="d" aria-hidden="true"><b>{int(dd)}</b><span>{MESES[int(m)-1]} {y}</span></div><div><h3>{t}</h3><p class="muted">{desc}</p><dl>{info}</dl></div></{tg}>'

def story(n, cls='story', show_p=True):
    slug, d, t, img, alt, resumo, _ = n
    return f'''<a class="{cls}" href="noticia-{slug}.html"><div class="photo"><img src="assets/img/{img}" alt="{escape(alt)}" loading="lazy"></div><div><time datetime="{d}">{dshort(d)}</time><h3>{t}</h3>{f'<p>{resumo}</p>' if show_p else ''}</div></a>'''

def join_box():
    return f'''<section class="join sec" aria-labelledby="h-join"><div class="wrap"><div class="box">
  <div class="ask on-dark">
    <span class="disc" aria-hidden="true"></span>
    <span class="kicker">Associe-se</span>
    <h2 id="h-join" class="hl">Sua empresa <b>na rede da ACIDI</b></h2>
    <p>A rede de relacionamento é o ponto de partida para o crescimento. Conheça os benefícios e fale com a equipe da associação.</p>
    <div class="ctas"><a class="btn btn-y" href="associe-se.html">Conhecer os benefícios {ico('go', 'ico go')}</a>{ext(WHATS, 'Falar pelo WhatsApp', 'btn btn-w')}</div>
  </div>
  <div class="contact on-dark">
    <h3>Contato</h3>
    <dl>
      <div><dt>Telefone e WhatsApp</dt><dd>(47) 3333-8786</dd></div>
      <div><dt>E-mail</dt><dd>contato@acidi.net</dd></div>
      <div><dt>Endereço</dt><dd>Rua Ver. Alvin Rauh Júnior, 100<br>Nações, Indaial/SC · CEP 89082-065</dd></div>
    </dl>
    <p>{ext(MAPA, 'Abrir no mapa', 'tlink')}</p>
  </div>
</div></div></section>'''

def demo_notice(extra=''):
    return f'<p class="demo-notice">{ico("info")}<span><b>Formulário demonstrativo.</b> Os dados não são enviados nem armazenados.{extra}</span></p>'

def field(fid, label, rules='', kind='input', typ='text', opt=False, hint='', attrs='', options=None):
    req = 'required' in rules
    lab = f'<label for="{fid}">{label}{"" if req else " <span class=opt>(opcional)</span>"}</label>'
    desc = f'{fid}-erro' + (f' {fid}-dica' if hint else '')
    common = f'id="{fid}" name="{fid}" data-rules="{rules}" data-label="{label}" aria-describedby="{desc}" {attrs}'
    if kind == 'select':
        ctrl = f'<select {common}><option value="">Selecione</option>' + ''.join(f'<option>{o}</option>' for o in options) + '</select>'
    elif kind == 'textarea':
        ctrl = f'<textarea {common}></textarea>'
    else:
        ctrl = f'<input type="{typ}" {common}>'
    h = f'<p class="hint" id="{fid}-dica">{hint}</p>' if hint else ''
    return f'<div class="field">{lab}{h}{ctrl}<p class="err" id="{fid}-erro"></p></div>'

def form_end(button, done_extra=''):
    return f'''<div class="err-summary" tabindex="-1" hidden></div>
  <div class="done" tabindex="-1" role="status" hidden><b>Demonstração concluída. Nenhum dado foi enviado.</b>{done_extra}<p>Você pode alterar os campos e repetir a demonstração.</p></div>
  <div class="form-actions"><button class="btn btn-p" type="submit">{button}</button></div>'''

# ---------------------------------------------------------------- páginas
paginas = []

# Início
n0, n1, n2 = NOTICIAS[0], NOTICIAS[1], NOTICIAS[2]
idx_items = ''.join(f'''<li><a href="para-seu-negocio.html#{s[0]}"><h3>{s[1]}</h3><p>{s[5]}</p>{f'<span class="pt"><img src="assets/img/{s[3]}" alt="" loading="lazy"></span>' if s[3] else f'<span class="tag">{s[4]}</span>'}{ico('go', 'ico arr')}</a></li>''' for s in SERVICOS)
home_events = ''.join(ev_item(e, 'li-home') for e in EVENTOS)
paginas.append(page('index.html', 'ACIDI – Associação Empresarial de Indaial', 'A ACIDI reúne empresários de Indaial desde 1989: serviços para associados, representatividade, notícias, agenda e auditório.', f'''
<section class="hero" aria-labelledby="h-hero"><div class="wrap">
  <span class="kicker">Associação Empresarial de Indaial · desde 1989</span>
  <h1 id="h-hero" class="hl"><span class="l1">Juntos somos</span><b>mais fortes</b></h1>
  <div class="txt">
    <p class="lead">Desde 1989, a ACIDI reúne indústria, comércio, serviços, agricultura, instituições financeiras e profissionais liberais de Indaial para fortalecer as empresas e buscar soluções para a cidade.</p>
    <div class="ctas"><a class="btn btn-p" href="associe-se.html">Associe sua empresa {ico('go', 'ico go')}</a><a class="btn btn-s" href="para-seu-negocio.html">Ver serviços</a></div>
  </div>
  <div class="media">
    <span class="disc" aria-hidden="true"></span>
    <figure class="photo main-ph"><img src="assets/img/feijoada-palco.jpg" alt="Grande grupo de associados reunidos no palco da Feijoada da ACIDI" width="1800" height="1303" fetchpriority="high"><figcaption>Feijoada da ACIDI</figcaption></figure>
    <a class="side" href="noticia-acidi-35-anos-posse-da-diretoria.html"><div class="photo"><img src="assets/img/posse-2024.jpg" alt="" width="1400" height="939"></div><p><b>ACIDI celebra 35 anos com posse da nova diretoria</b>22 de maio de 2024</p></a>
  </div>
</div></section>

<nav class="rail on-dark" aria-label="Acesso rápido para associados"><div class="wrap">
  <span class="lab">Acesso rápido<br>para associados</span>
  <a href="http://web2.bvsnet.com.br/" target="_blank" rel="noopener">{ico('search')}<span><b>Consulta SCPC {ico('ext','ico ext-i')}</b><span>Boa Vista · site externo</span></span><span class="sr"> (abre em nova aba)</span></a>
  <a href="https://site.convcard.com.br/crt/" target="_blank" rel="noopener">{ico('card')}<span><b>UtilCard {ico('ext','ico ext-i')}</b><span>Cartão · site externo</span></span><span class="sr"> (abre em nova aba)</span></a>
  <a href="https://www.uniodontosc.coop.br/encontre-seu-dentista.php" target="_blank" rel="noopener">{ico('tooth')}<span><b>Uniodonto {ico('ext','ico ext-i')}</b><span>Dentistas · site externo</span></span><span class="sr"> (abre em nova aba)</span></a>
  <a href="auditorio.html">{ico('cal')}<span><b>Auditório</b><span>Solicitar uso</span></span></a>
</div></nav>

<section class="sec about" aria-labelledby="h-about"><div class="wrap grid12">
  <figure class="ph-col"><div class="photo"><img src="assets/img/sede.jpg" alt="Sede da ACIDI em Indaial, prédio em estilo enxaimel com o logotipo na fachada" width="1181" height="788" loading="lazy"></div><figcaption class="cap"><b>Sede da ACIDI</b> · {ENDERECO}</figcaption></figure>
  <div class="txt">
    <span class="kicker">Quem somos</span>
    <h2 id="h-about" class="hl sec-t">Empresários unidos <b>por Indaial</b></h2>
    <p>Fundada por um grupo de empresários, a ACIDI consolidou-se como entidade consultiva da administração pública, de apoio às ações comunitárias e de incentivo ao desenvolvimento econômico do município, além de prestar serviços aos associados.</p>
    <dl class="facts">
      <div><dt>Fundação</dt><dd>22 de maio de 1989</dd></div>
      <div><dt>Diretoria</dt><dd>Gestão 2024/2026, presidida por Marcondes Aurélio Moser</dd></div>
      <div><dt>Atuação</dt><dd>Conselhos municipais, núcleos setoriais e pleitos regionais</dd></div>
    </dl>
    <div class="ctas"><a class="tlink" href="historico.html">Nossa história</a><a class="tlink" href="diretoria.html">Diretoria completa</a></div>
  </div>
</div></section>

<section class="sec alt biz" aria-labelledby="h-biz"><div class="wrap grid12">
  <div class="head">
    <span class="kicker">Para seu negócio</span>
    <h2 id="h-biz" class="hl sec-t">Serviços para a <b>gestão da empresa</b></h2>
    <p class="lead" style="font-size:1.04rem">Soluções oferecidas aos associados, várias delas em parceria com a FACISC, para tornar a empresa mais competitiva.</p>
    <div><a class="btn btn-s" href="para-seu-negocio.html">Todos os serviços</a></div>
  </div>
  <ul class="idx">{idx_items}</ul>
</div></section>

<section class="sec rep on-dark" aria-labelledby="h-rep">
  <span class="disc" aria-hidden="true"></span>
  <div class="wrap">
    <span class="kicker">Representatividade</span>
    <h2 id="h-rep" class="hl sec-t">A voz do empresário <b>junto ao poder público</b></h2>
    <p class="lead">A ACIDI mobiliza lideranças, promove reuniões e debates e reivindica soluções para as empresas e a sociedade de Indaial e região. Alguns pleitos defendidos pela associação:</p>
    <div class="levels">
      <section><h3>Federal</h3><ul><li>Duplicação da BR-470</li><li>Aeroporto Internacional de Navegantes</li><li>Prevenção de enchentes: monitoramento e barragens</li></ul></section>
      <section><h3>Estadual</h3><ul><li>Reforma e revitalização da SC-412 (Jorge Lacerda)</li><li>Anel de Contorno Urbano de Gaspar</li></ul></section>
      <section><h3>Municipal</h3><ul><li>Segurança pública</li><li>Corpo de Bombeiros Voluntários</li><li>Hospital Beatriz Ramos</li></ul></section>
    </div>
    <div class="more"><a class="btn btn-w" href="representatividade.html">Conhecer a atuação {ico('go', 'ico go')}</a></div>
  </div>
</section>

<section class="sec" aria-labelledby="h-news"><div class="wrap">
  <div class="sec-h"><div><span class="kicker">Acontece</span><h2 id="h-news" class="hl sec-t">Notícias <b>e agenda</b></h2></div><a class="tlink" href="noticias.html">Todas as notícias</a></div>
  <div class="news-home">
    {story(n0, 'story lead-s')}
    <div class="rest">{story(n1, 'story small', False)}{story(n2, 'story small', False)}</div>
    <aside class="agenda-box" aria-labelledby="h-ag" data-agenda>
      <h3 id="h-ag">Próximos eventos</h3>
      <ul class="evlist" data-upcoming{' hidden' if not any(e[0] >= HOJE for e in EVENTOS) else ''} style="border-top:0">{home_events}</ul>
      <div class="empty" data-empty{' hidden' if any(e[0] >= HOJE for e in EVENTOS) else ''}><b>Nenhum próximo evento publicado.</b><span>Consulte o arquivo de eventos ou fale com a equipe da ACIDI.</span></div>
      <div class="ctas"><a class="tlink" href="agenda.html#arquivo">Arquivo da agenda</a><a class="tlink" href="contato.html">Contato</a></div>
    </aside>
  </div>
</div></section>

<section class="sec alt tight" aria-labelledby="h-aud"><div class="wrap grid12" style="align-items:center">
  <div class="photo col-pic" style="aspect-ratio:16/9;border-radius:var(--r)"><img src="assets/img/auditorio-1.jpg" alt="Auditório da ACIDI com cadeiras verdes e telão" loading="lazy"></div>
  <div class="col-t" style="display:grid;gap:18px">
    <span class="kicker">Auditório e salas</span>
    <h2 id="h-aud" class="hl sec-t">Auditório para <b>170 pessoas</b></h2>
    <p>Salas para reuniões e treinamentos e auditório climatizado, com valor diferenciado para associados e agendamento prévio.</p>
    <div><a class="btn btn-p" href="auditorio.html">Ver espaços e solicitar {ico('go', 'ico go')}</a></div>
  </div>
</div></section>

<section class="part sec tight" aria-labelledby="h-part"><div class="wrap">
  <div><span class="kicker">Convênios</span><h2 id="h-part" class="hl" style="font-size:2rem;margin-top:12px">Parceiros <b>dos associados</b></h2></div>
  <ul><li><img src="assets/img/util.jpg" alt="Util" loading="lazy"></li><li><img src="assets/img/uniodonto.jpg" alt="Uniodonto" loading="lazy"></li><li><img src="assets/img/boavista.jpg" alt="Boa Vista" loading="lazy"></li><li><img src="assets/img/clinipam.jpg" alt="Clinipam" loading="lazy"></li></ul>
</div></section>
{join_box()}
'''))

# Histórico
paginas.append(page('historico.html', 'A ACIDI e sua história' + SUF, 'História da Associação Empresarial de Indaial, fundada em 22 de maio de 1989.', crumbs([('index.html', 'Início'), (None, 'A ACIDI · Histórico')]) + phead(
 'A ACIDI · Histórico', 'Uma entidade de empresários <b>para Indaial</b>', 'A Associação Empresarial de Indaial foi fundada por um grupo de empresários em 22 de maio de 1989.',
 pic=('sede.jpg', 'Sede da ACIDI em Indaial, prédio em estilo enxaimel', '<b>Sede da ACIDI</b> · ' + ENDERECO)) + f'''
<section class="sec"><div class="wrap split">
  <div class="aside"><nav class="localnav" aria-label="Nesta seção"><a href="diretoria.html">Diretoria</a><a href="ex-presidentes.html">Ex-Presidentes</a><a href="representatividade.html">Representatividade</a><a href="nucleos.html">Núcleos</a></nav></div>
  <div class="prose">
    <h2>Por que a ACIDI existe</h2>
    <p>O objetivo da fundação era congregar o empresariado local, da indústria, do comércio, da agricultura, das instituições financeiras, das prestadoras de serviços e dos profissionais liberais, para fortalecer a classe e unir esforços na busca do desenvolvimento e na resolução de problemas das empresas e da comunidade.</p>
    <h2>O que a ACIDI faz hoje</h2>
    <p>A ACIDI consolidou-se como entidade consultiva da administração pública, de apoio às ações comunitárias e de incentivo ao desenvolvimento econômico do município, sem deixar de lado seu papel de prestadora de serviços aos associados e de representante dos interesses do empresário indaialense.</p>
    <p>É uma entidade que defende o bem-estar de toda a sociedade e se preocupa com os problemas locais, estaduais e federais que afetam a cidade direta ou indiretamente.</p>
    <h2>Marcos publicados</h2>
    <ul>
      <li><b>22 de maio de 1989</b> · Fundação da ACIDI por um grupo de empresários de Indaial.</li>
      <li><b>22 de maio de 2024</b> · Comemoração dos 35 anos e posse da diretoria para o biênio 2024–2026. <a class="tlink" href="noticia-acidi-35-anos-posse-da-diretoria.html">Ler a notícia</a></li>
    </ul>
    <figure style="margin:16px 0 0"><div class="photo" style="border-radius:var(--r);aspect-ratio:3/2"><img src="assets/img/posse-2024.jpg" alt="Diretoria e convidados na cerimônia de posse e comemoração dos 35 anos da ACIDI" loading="lazy"></div><figcaption class="cap">Comemoração dos 35 anos e posse da diretoria, maio de 2024.</figcaption></figure>
  </div>
</div></section>
{join_box()}'''))

# Diretoria
def nl(items, numbered=False):
    return '<ul class="namelist">' + ''.join(f'<li>{escape(i)}</li>' for i in items) + '</ul>'
VPS = [('Indústria','Fernando Fey'),('Comércio','Renato Tomio'),('Comércio Exterior','Thiago Luiz Dorigatti'),('Prestação de Serviços','André Kannenberg'),('Micro e Pequenas Empresas','Jacqueline Warmeling Hoffmann'),('Assuntos Comunitários','José Cardoso'),('Assuntos Legais e Governamentais','Marcelo Muritiba Dias Ruas'),('Mulher Empresária','Noeli de Souza'),('Eventos, Comunicação e Marketing','Marcio Sodré Nunes'),('Segurança','Fabiano Carvalho'),('Patrimônio','Harrybert Howe Junior'),('Esportes','Arlindo Schulz'),('Núcleos Setoriais','Candice Hardt Ferrari'),('Turismo','Andréa De Faveri'),('Inovação e Tecnologia','Rogério Isnar Patricio')]
CONSULTIVO = ['Adolfo Fey','Wilson Jacob Schmitt','Gunther Hersing','Landolino Schulz','José Cardoso','Jorge Alberto Jacobsen','Osmar Voss','Ivo Benke','Ademar Jacobsen Keunecke','Rogério Artur Ehrat','Harrybert Howe Junior','Renato Tomio','Rogério Isnar Patricio']
DELIB = ['Marcondes Aurélio Moser','André Kannenberg','Ricardo Axt','Lauro Richard Possamai','Thiago Luiz Dorigatti','Anilvo de Souza','André Luiz Goll da Silva','Marcelo Muritiba Dias Ruas','Diene Dolores Tomio Zonta','Natalie Schreiber','Fernando Conti','Willian Schulz','Luciano de Liz Barbosa','Alexandre Hardt','Fernando Fey','Arlindo Schulz','Candice Hardt Ferrari','James Lueders','Jandir Ternus','Sérgio Cadore','Almir Malkowski']
DELIB_S = ['Frank Antonio Correa','Dilnei Heinzen','Fabiano Carvalho','João Luiz Sensi Hornburg','Jefferson Zomignan','Edenilson Fulik','Jefferson Cardoso Domareski']
paginas.append(page('diretoria.html', 'Diretoria' + SUF, 'Diretoria e conselhos da ACIDI na gestão 2024/2026, conforme publicação da associação.', crumbs([('index.html', 'Início'), ('historico.html', 'A ACIDI'), (None, 'Diretoria')]) + phead(
 'A ACIDI · Diretoria', 'Gestão <b>2024/2026</b>', 'Diretoria executiva, vice-presidências por área e conselhos, conforme a composição publicada pela associação.',
 side='<p>A posse da diretoria para o biênio 2024–2026 ocorreu em 22 de maio de 2024, na comemoração dos 35 anos da ACIDI.</p><p style="margin-top:10px"><a class="tlink" href="noticia-acidi-35-anos-posse-da-diretoria.html">Ler a notícia da posse</a></p>') + f'''
<div class="wrap">
<section class="block" aria-labelledby="h-exec"><h2 id="h-exec">Diretoria <b>executiva</b></h2><div class="people">
  <div class="person"><span>Diretor presidente</span><b>Marcondes Aurélio Moser</b></div>
  <div class="person"><span>Diretor vice-presidente</span><b>Rogério Isnar Patricio</b></div>
  <div class="person"><span>Diretor tesoureiro</span><b>Almir Malkowski</b></div>
  <div class="person"><span>Diretor secretário</span><b>Rogério Artur Ehrat</b></div>
</div></section>
<section class="block" aria-labelledby="h-vp"><h2 id="h-vp">Vice-presidências <b>por área</b></h2><ul class="namelist">{''.join(f'<li>{escape(n)}<small>{escape(a)}</small></li>' for a, n in VPS)}</ul></section>
<section class="block" aria-labelledby="h-cc"><h2 id="h-cc">Conselho <b>consultivo</b></h2>{nl(CONSULTIVO)}</section>
<section class="block" aria-labelledby="h-cf"><h2 id="h-cf">Conselho <b>fiscal</b></h2><ul class="namelist"><li>Marildo Paul</li><li>Simão Baldoino Weber</li><li>Lindolfo Brey Junior</li><li>Marcos José Dallabona<small>Suplente</small></li><li>José Renato Leite<small>Suplente</small></li></ul></section>
<section class="block" aria-labelledby="h-cd"><h2 id="h-cd">Conselho <b>deliberativo</b></h2>{nl(DELIB)}<h3 style="font:600 .78rem var(--texto);letter-spacing:.12em;text-transform:uppercase;color:var(--cinza);margin:32px 0 8px">Suplentes</h3>{nl(DELIB_S)}</section>
</div>'''))

# Ex-presidentes. Períodos sobrepostos na publicação oficial ficam fora até confirmação (ver docs).
EXP = [('p-fey.jpg','Adolfo Fey','Maio de 1989 a maio de 1991'),('p-wanke.jpg','Artur Wanke','Maio de 1991 a maio de 1993'),('p-schmitt.jpg','Wilson Jacob Schmitt','Maio de 1993 a maio de 1995'),
 ('p-hersing.jpg','Gunther Hersing','Maio de 1995 a maio de 2000'),('p-schulz.jpg','Landolino Schulz','Maio de 2000 a maio de 2002'),('p-cardoso.jpg','José Cardoso','Maio de 2002 a maio de 2004'),
 (None,'Jorge Alberto Jacobsen',None),('p-voss.jpg','Osmar Voss',None),('p-benke.jpg','Ivo Benke','Maio de 2008 a maio de 2012'),('p-keunecke.jpg','Ademar Jacobsen Keunecke','Maio de 2012 a maio de 2014'),
 ('p-howe.jpg','Harrybert Howe Junior','Julho de 2016 a junho de 2018'),(None,'Renato Tomio',None),(None,'Rogério Isnar Patricio','Maio de 2022 a maio de 2024')]
def ini(n): p = n.split(); return p[0][0] + p[-1][0]
portr = ''.join(f'''<li><div class="pf"{'' if img else ' aria-hidden="true"'}>{f'<img src="assets/img/{img}" alt="Retrato de {n}" loading="lazy">' if img else ini(n)}</div><b>{n}</b>{f'<span>{per}</span>' if per else ''}</li>''' for img, n, per in EXP)
paginas.append(page('ex-presidentes.html', 'Ex-Presidentes' + SUF, 'Empresários que presidiram a ACIDI desde a fundação, em 1989.', crumbs([('index.html', 'Início'), ('historico.html', 'A ACIDI'), (None, 'Ex-Presidentes')]) + phead(
 'A ACIDI · Ex-Presidentes', 'Quem conduziu <b>a ACIDI</b>', 'Empresários que presidiram a associação, na ordem publicada pela ACIDI. Adolfo Fey, primeiro presidente, é lembrado como fundador da entidade.') + f'''
<section class="sec"><div class="wrap"><ul class="portraits">{portr}</ul>
<p class="muted" style="margin-top:48px;font-size:.92rem;max-width:68ch">A diretoria da gestão 2024/2026 é apresentada na página <a class="tlink" href="diretoria.html">Diretoria</a>.</p></div></section>'''))

# Representatividade
paginas.append(page('representatividade.html', 'Representatividade' + SUF, 'Como a ACIDI representa os empresários de Indaial junto aos poderes públicos e privados.', crumbs([('index.html', 'Início'), ('historico.html', 'A ACIDI'), (None, 'Representatividade')]) + phead(
 'A ACIDI · Representatividade', 'A voz do empresário <b>junto ao poder público</b>', 'A ACIDI é uma das principais entidades representativas da classe empresarial de Indaial e da região.',
 pic=('voz-unica-2024.jpg', 'Representantes de entidades de Indaial reunidos diante do logotipo da ACIDI', 'Entrega do Documento Voz Única Municipal, setembro de 2024.')) + f'''
<section class="sec"><div class="wrap split">
  <div class="aside"><p class="muted">A associação defende interesses, direitos e reivindicações dos empresários e da sociedade junto aos poderes públicos e privados, mobilizando lideranças, promovendo reuniões e realizando debates e ações para buscar soluções.</p></div>
  <div class="prose">
    <h2>Pleitos defendidos pela associação</h2>
    <p>Pautas que a ACIDI publica entre os pleitos que defende. A lista não informa a situação atual de cada pleito.</p>
  </div>
</div></section>
<section class="sec rep on-dark" style="padding-top:72px" aria-label="Pleitos por esfera">
  <span class="disc" aria-hidden="true"></span>
  <div class="wrap">
    <div class="levels" style="margin-top:0">
      <section><h3>Federal</h3><ul><li>Duplicação da BR-470</li><li>Aeroporto Internacional de Navegantes</li><li>Bacia de Evolução do Porto Itajaí/Navegantes</li><li>Sistema de prevenção de enchentes: monitoramento e barragens</li><li>Pacto Federativo</li></ul></section>
      <section><h3>Estadual</h3><ul><li>Reforma e revitalização da Rodovia SC-412 (Jorge Lacerda)</li><li>Anel de Contorno Urbano de Gaspar</li></ul></section>
      <section><h3>Municipal</h3><ul><li>Segurança pública</li><li>Corpo de Bombeiros Voluntários</li><li>Hospital Beatriz Ramos</li><li>Ações sociais</li></ul></section>
    </div>
    <div class="councils">
      <h3>Participação em <b>conselhos municipais</b></h3>
      <p>Indústria e Comércio · Turismo · Saúde · Educação · Trânsito · Defesa Civil · Direitos da Criança e do Adolescente · Saneamento Ambiental · Administração HBR · Políticas Esportivas</p>
    </div>
  </div>
</section>
<section class="sec" aria-labelledby="h-acao"><div class="wrap">
  <div class="sec-h"><div><span class="kicker">Em ação</span><h2 id="h-acao" class="hl sec-t">Representação <b>na prática</b></h2></div><a class="tlink" href="noticias.html">Todas as notícias</a></div>
  <div class="news-list">{story(NOTICIAS[5])}{story(NOTICIAS[1])}{story(NOTICIAS[4])}</div>
</div></section>'''))

# Núcleos
paginas.append(page('nucleos.html', 'Núcleos' + SUF, 'Núcleos setoriais da ACIDI: grupos de trabalho para trocar experiências e buscar soluções em conjunto.', crumbs([('index.html', 'Início'), ('historico.html', 'A ACIDI'), (None, 'Núcleos')]) + phead(
 'A ACIDI · Núcleos', 'Quem vive o mesmo desafio <b>resolve junto</b>', 'Os núcleos são grupos de trabalho para trocar experiências e identificar oportunidades e desafios comuns, buscando em conjunto as soluções mais eficientes.') + f'''
<section class="sec"><div class="wrap split">
  <div class="aside"><p class="muted">Além de promover o associativismo, os núcleos favorecem o desenvolvimento das empresas do setor e da economia do município.</p><a class="btn btn-p" href="contato.html?assunto=nucleos">Saber quais núcleos estão ativos</a></div>
  <div class="prose">
    <h2>Núcleos citados em publicações da ACIDI</h2>
    <p>Os registros abaixo vêm de publicações da associação, com a data de cada uma. Para saber quais núcleos estão em funcionamento e como participar, fale com a equipe.</p>
    <div class="tablebox"><table class="res"><thead><tr><th scope="col">Núcleo</th><th scope="col">Publicação</th></tr></thead><tbody>
      <tr><td>Núcleo do Artesanato e Economia Criativa</td><td>Feira de artesanato na Feijoada da ACIDI · <a class="tlink" href="noticia-segunda-feijoada-da-acidi.html">julho de 2024</a></td></tr>
      <tr><td>Núcleo Câmara da Mulher Empresária</td><td>Encontro na agenda · <a class="tlink" href="agenda.html#{ev_id(EVENTOS[2])}">maio de 2022</a></td></tr>
      <tr><td>Núcleo Gestão de Pessoas</td><td>Encontro na agenda · <a class="tlink" href="agenda.html#{ev_id(EVENTOS[3])}">maio de 2022</a></td></tr>
      <tr><td>Núcleo de Saúde e Segurança do Trabalhador</td><td>Encontro na agenda · <a class="tlink" href="agenda.html#{ev_id(EVENTOS[4])}">maio de 2022</a></td></tr>
    </tbody></table></div>
    <h2>Conselhos municipais</h2>
    <p>A ACIDI também participa de conselhos municipais da Prefeitura, por entender que é responsabilidade da entidade representar e defender os interesses do empresário e o desenvolvimento da cidade.</p>
    <ul><li>Indústria e Comércio</li><li>Turismo</li><li>Saúde</li><li>Educação</li><li>Trânsito</li><li>Defesa Civil</li><li>Direitos da Criança e do Adolescente</li><li>Saneamento Ambiental</li><li>Administração HBR</li><li>Políticas Esportivas</li></ul>
  </div>
</div></section>'''))

# Para seu negócio
svc_html = ''
for s in SERVICOS:
    sid, nome, icn, logo, tag, resumo, paras, link = s
    btns = (ext(link[0], link[1], 'btn btn-s') if link else '') + f'<a class="btn btn-p" href="contato.html?assunto={sid}">Falar com a ACIDI sobre este serviço {ico("go","ico go")}</a>'
    svc_html += f'''<article class="svc" id="{sid}" aria-labelledby="h-{sid}"><div class="h">{f'<img class="logo" src="assets/img/{logo}" alt="">' if logo else f'<span class="badge">{tag}</span>'}<h2 id="h-{sid}">{nome}</h2></div><div class="b">{''.join(f'<p>{p}</p>' for p in paras)}<div class="ctas">{btns}</div></div></article>'''
paginas.append(page('para-seu-negocio.html', 'Para seu negócio' + SUF, 'Serviços da ACIDI para associados: Util Card, Uniodonto, Boa Vista SCPC, Certificado de Origem, treinamentos e mais.', crumbs([('index.html', 'Início'), (None, 'Para seu negócio')]) + phead(
 'Para seu negócio', 'Serviços para a <b>gestão da empresa</b>', 'A ACIDI oferece aos associados vantagens e soluções para auxiliar a gestão do negócio e tornar a empresa mais competitiva.',
 side='<nav class="localnav" aria-label="Serviços nesta página">' + ''.join(f'<a href="#{s[0]}">{s[1]}</a>' for s in SERVICOS) + '<a href="auditorio.html">Auditório e salas</a></nav>') + f'''
<section class="sec"><div class="wrap">{svc_html}
<article class="svc" id="auditorio-e-salas"><div class="h"><span class="badge">Espaços</span><h2>Auditório e salas</h2></div><div class="b"><p>Auditório com capacidade para 170 pessoas e salas para reuniões e treinamentos, todos climatizados, com valor diferenciado para associados mediante agendamento prévio.</p><div class="ctas"><a class="btn btn-p" href="auditorio.html">Ver espaços e solicitar {ico("go","ico go")}</a></div></div></article>
</div></section>
{join_box()}'''))

# Notícias
lista = story(NOTICIAS[0], 'story first') + ''.join(story(n) for n in NOTICIAS[1:])
paginas.append(page('noticias.html', 'Notícias' + SUF, 'Notícias da Associação Empresarial de Indaial: eventos, representatividade e ações para associados.', crumbs([('index.html', 'Início'), (None, 'Notícias')]) + phead(
 'Acontece', 'Notícias <b>da ACIDI</b>', 'Eventos, iniciativas e ações de representatividade da associação, com a data original de cada publicação.') + f'''
<section class="sec"><div class="wrap"><div class="news-list">{lista}</div></div></section>'''))

def corpo(blocos):
    out = ''
    for b in blocos:
        if isinstance(b, list): out += '<ul>' + ''.join(f'<li>{i}</li>' for i in b) + '</ul>'
        elif isinstance(b, tuple) and b[0] == 'quote': out += f'<blockquote>{b[1]}</blockquote>'
        elif isinstance(b, tuple) and b[0] == 'table':
            for cat, rows in b[1]:
                out += f'<h2>{cat}</h2><ul>' + ''.join(f'<li>{r}</li>' for r in rows) + '</ul>'
        else: out += f'<p>{b}</p>'
    return out
for i, n in enumerate(NOTICIAS):
    slug, d, t, img, alt, resumo, blocos = n
    ant = NOTICIAS[i + 1] if i + 1 < len(NOTICIAS) else None
    prox = NOTICIAS[i - 1] if i > 0 else None
    nav = (f'<a class="tlink" href="noticia-{prox[0]}.html">← Mais recente: {prox[2]}</a>' if prox else '<span></span>') + \
          (f'<a class="tlink" href="noticia-{ant[0]}.html">Anterior: {ant[2]} →</a>' if ant else '')
    paginas.append(page(f'noticia-{slug}.html', t + SUF, resumo, crumbs([('index.html', 'Início'), ('noticias.html', 'Notícias'), (None, t)]) + f'''
<article>
  <header class="article-head wrap"><time class="date" datetime="{d}">Publicado em {dlong(d)}</time><h1>{t}</h1><p class="lead">{resumo}</p></header>
  <figure class="article-fig wrap"><div class="photo"><img src="assets/img/{img}" alt="{escape(alt)}"></div></figure>
  <div class="wrap article-body">
    <div class="prose">{corpo(blocos)}</div>
    <aside class="meta"><div><b style="color:var(--tinta)">Publicação original</b><br>{dlong(d)}</div><div><a class="btn btn-s" href="noticias.html">{ico('back','ico')} Voltar às notícias</a></div></aside>
  </div>
  <div class="wrap"><nav class="article-foot" aria-label="Outras notícias">{nav}</nav></div>
</article>'''))

# Agenda
up = [e for e in EVENTOS if e[0] >= HOJE]
past = sorted([e for e in EVENTOS if e[0] < HOJE], key=lambda e: e[0], reverse=True)
paginas.append(page('agenda.html', 'Agenda' + SUF, 'Agenda de eventos da ACIDI: próximos eventos e arquivo de registros publicados.', crumbs([('index.html', 'Início'), (None, 'Agenda')]) + phead(
 'Acontece', 'Agenda <b>da ACIDI</b>', 'Próximos eventos publicados pela associação e o arquivo dos registros anteriores.') + f'''
<div class="wrap" data-agenda>
  <section class="block" aria-labelledby="h-prox"><h2 id="h-prox">Próximos <b>eventos</b></h2>
    <ul class="evlist" data-upcoming{'' if up else ' hidden'}>{''.join(ev_item(e) for e in up)}</ul>
    <div class="empty" data-empty{' hidden' if up else ''}><b>Nenhum próximo evento publicado.</b><span>Consulte o arquivo abaixo ou fale com a equipe da ACIDI para saber da programação.</span><div class="ctas"><a class="btn btn-s" href="contato.html?assunto=agenda">Falar com a ACIDI</a></div></div>
  </section>
  <section class="block" id="arquivo" aria-labelledby="h-arq"><h2 id="h-arq">Arquivo <b>de eventos</b></h2>
    <p class="muted" style="margin:-12px 0 20px">Eventos já realizados, do mais recente ao mais antigo · <span data-past-count>{len(past)}</span> registros.</p>
    <ul class="evlist" data-past>{''.join(ev_item(e) for e in past)}</ul>
  </section>
</div>'''))

# Auditório
gal = ''.join(f'<div class="photo"><img src="assets/img/auditorio-{i}.jpg" alt="{a}" loading="lazy"></div>' for i, a in enumerate(['Auditório da ACIDI com cadeiras verdes e telão', 'Auditório visto da lateral, com fileiras de cadeiras', 'Fileiras de cadeiras do auditório', 'Sala com mesa de reunião', 'Sala de reunião com mesa grande e janelas', 'Cadeiras dispostas em sala da ACIDI'], 1))
paginas.append(page('auditorio.html', 'Auditório e salas' + SUF, 'Auditório para 170 pessoas e salas climatizadas na sede da ACIDI, em Indaial. Solicitação demonstrativa.', crumbs([('index.html', 'Início'), ('para-seu-negocio.html', 'Para seu negócio'), (None, 'Auditório e salas')]) + phead(
 'Para seu negócio · Espaços', 'Realize seu evento <b>na ACIDI</b>', 'Para atender associados e a comunidade, a ACIDI disponibiliza para locação salas para reuniões e treinamentos e seu auditório.') + f'''
<section class="sec tight"><div class="wrap" style="display:grid;gap:48px">
  <div class="gallery">{gal}</div>
  <div class="keyfacts"><div><b>170</b><span>pessoas de capacidade no auditório</span></div><div><b>Salas</b><span>para reuniões, treinamentos e outras atividades</span></div><div><b>Climatizados</b><span>todos os espaços, com valor diferenciado para associados</span></div></div>
</div></section>
<section class="sec alt" aria-labelledby="h-sol"><div class="wrap formwrap">
  <div style="display:grid;gap:18px;align-content:start">
    <span class="kicker">Solicitação</span>
    <h2 id="h-sol" class="hl sec-t">Solicite o uso <b>do espaço</b></h2>
    <p>O uso dos espaços depende de agendamento prévio. Associados têm valor diferenciado.</p>
    <p class="muted">Para reservar de fato, fale com a equipe pelo telefone ou WhatsApp (47) 3333-8786.</p>
    <div>{ext(WHATS, 'Falar pelo WhatsApp', 'btn btn-s')}</div>
  </div>
  <form class="demo" novalidate aria-labelledby="h-sol">
    {demo_notice(' Nenhuma reserva é realizada.')}
    <div class="row2">{field('aud-nome', 'Nome', 'required', attrs='autocomplete="name"')}{field('aud-empresa', 'Empresa', '', attrs='autocomplete="organization"')}</div>
    <div class="row2">{field('aud-email', 'E-mail', 'required email', typ='email', attrs='autocomplete="email"')}{field('aud-tel', 'Telefone', 'required phone', typ='tel', hint='Com DDD.', attrs='autocomplete="tel"')}</div>
    <div class="row2">{field('aud-espaco', 'Espaço', 'required', kind='select', options=['Auditório', 'Sala de reunião', 'Ainda não sei'])}{field('aud-associado', 'Empresa associada?', 'required', kind='select', options=['Sim', 'Não', 'Não sei'])}</div>
    <div class="row2">{field('aud-data', 'Data desejada', 'required date-future', typ='date', hint='A partir de hoje. A disponibilidade não é verificada nesta demonstração.')}{field('aud-pessoas', 'Número estimado de pessoas', '', typ='number', attrs='min="1" max="170" inputmode="numeric"', hint='Auditório: até 170 pessoas.')}</div>
    {field('aud-msg', 'Detalhes do evento', '', kind='textarea', hint='Horário, tipo de atividade e outras informações.')}
    {form_end('Concluir demonstração', '<p>Nenhuma reserva foi realizada.</p>')}
  </form>
</div></section>'''))

# Associe-se
BENEF = [('Rede de relacionamento', 'Encontros como a Feijoada da ACIDI, o ACIDI Itinerante e o Networkaffee aproximam associados e lideranças.'),
         ('Serviços com parceiros', 'Família Util Card, Uniodonto, Consulta Boa Vista SCPC, Protesto Expresso e XML Empresarial.', 'para-seu-negocio.html'),
         ('Capacitação com desconto', 'Treinamentos e palestras com prioridade e descontos especiais para associados.', 'para-seu-negocio.html#treinamentos-e-palestras'),
         ('Espaços com valor diferenciado', 'Auditório para 170 pessoas e salas climatizadas para reuniões e treinamentos.', 'auditorio.html'),
         ('Certificado de Origem', 'Apoio às empresas exportadoras com o documento que reduz ou isenta o imposto de importação no país comprador.', 'para-seu-negocio.html#certificado-de-origem'),
         ('Representação junto ao poder público', 'A ACIDI defende os interesses do empresário indaialense e participa de conselhos municipais.', 'representatividade.html')]
benef = ''.join(f'<li><a href="{b[2]}"><h3>{b[0]}</h3><p>{b[1]}</p><span class="tag"></span>{ico("go","ico arr")}</a></li>' if len(b) > 2 else f'<li><a href="noticias.html"><h3>{b[0]}</h3><p>{b[1]}</p><span class="tag"></span>{ico("go","ico arr")}</a></li>' for b in BENEF)
paginas.append(page('associe-se.html', 'Associe-se' + SUF, 'Benefícios de ser associado da ACIDI e formulário demonstrativo de interesse.', crumbs([('index.html', 'Início'), (None, 'Associe-se')]) + phead(
 'Associe-se', 'Sua empresa <b>na rede da ACIDI</b>', 'Aproveite os benefícios de ser associado e as soluções da ACIDI para fazer sua empresa crescer. A rede de relacionamento é o ponto de partida.',
 pic=('feijoada-2024.jpg', 'Associados reunidos no palco da segunda Feijoada da ACIDI', 'Segunda Feijoada da ACIDI, julho de 2024.')) + f'''
<section class="sec" aria-labelledby="h-ben"><div class="wrap grid12">
  <div class="col-a" style="display:grid;gap:18px;align-content:start"><span class="kicker">Benefícios</span><h2 id="h-ben" class="hl sec-t">O que a associação <b>oferece</b></h2><p class="muted">Benefícios publicados pela ACIDI. Condições e valores são informados pela equipe.</p></div>
  <ul class="idx col-b">{benef}</ul>
</div></section>
<section class="sec alt" aria-labelledby="h-int"><div class="wrap formwrap">
  <div style="display:grid;gap:18px;align-content:start">
    <span class="kicker">Como começar</span>
    <h2 id="h-int" class="hl sec-t">Fale com <b>a equipe</b></h2>
    <p>A equipe da ACIDI apresenta as condições de associação e tira dúvidas sobre os serviços. Use o telefone ou o WhatsApp (47) 3333-8786, ou registre seu interesse no formulário.</p>
    <div class="ctas">{ext(WHATS, 'Falar pelo WhatsApp', 'btn btn-s')}<a class="tlink" href="contato.html">Outros contatos</a></div>
  </div>
  <form class="demo" novalidate aria-labelledby="h-int">
    {demo_notice()}
    <div class="row2">{field('as-nome', 'Nome', 'required', attrs='autocomplete="name"')}{field('as-empresa', 'Empresa', 'required', attrs='autocomplete="organization"')}</div>
    <div class="row2">{field('as-email', 'E-mail', 'required email', typ='email', attrs='autocomplete="email"')}{field('as-tel', 'Telefone ou WhatsApp', 'required phone', typ='tel', hint='Com DDD.', attrs='autocomplete="tel"')}</div>
    {field('as-setor', 'Setor da empresa', 'required', kind='select', options=['Indústria', 'Comércio', 'Prestação de serviços', 'Agricultura', 'Instituição financeira', 'Profissional liberal', 'Outro'])}
    <fieldset class="field"><legend>Interesses <span class="opt">(opcional)</span></legend><div class="checks">
      {''.join(f'<label><input type="checkbox" name="as-int" value="{n}"> {n}</label>' for n in ['Serviços com parceiros', 'Treinamentos e palestras', 'Auditório e salas', 'Certificado de Origem', 'Eventos e networking'])}
    </div></fieldset>
    {field('as-msg', 'Mensagem', '', kind='textarea')}
    {form_end('Concluir demonstração')}
  </form>
</div></section>'''))

# Contato
ASSUNTOS = [('associacao', 'Associação'), ('util-card', 'Família Util Card'), ('uniodonto', 'Uniodonto'), ('boa-vista-scpc', 'Consulta Boa Vista SCPC'), ('certificado-de-origem', 'Certificado de Origem'),
            ('treinamentos-e-palestras', 'Treinamentos e palestras'), ('protesto-expresso', 'Protesto Expresso'), ('xml-empresarial', 'XML Empresarial'), ('auditorio', 'Auditório e salas'),
            ('nucleos', 'Núcleos'), ('agenda', 'Agenda e eventos'), ('outro', 'Outro assunto')]
opts = ''.join(f'<option value="{v}">{t}</option>' for v, t in ASSUNTOS)
paginas.append(page('contato.html', 'Contato' + SUF, 'Telefone, WhatsApp, e-mail e endereço da ACIDI, com formulário demonstrativo de contato.', crumbs([('index.html', 'Início'), (None, 'Contato')]) + phead(
 'Contato', 'Fale <b>com a ACIDI</b>', 'Atendimento por telefone, WhatsApp e e-mail, e a sede no bairro Nações, em Indaial.') + f'''
<section class="sec"><div class="wrap formwrap">
  <div style="display:grid;gap:28px;align-content:start">
    <dl class="contact-list">
      <div><dt>Telefone e WhatsApp</dt><dd>(47) 3333-8786<small>{ext(WHATS, 'Abrir conversa no WhatsApp', 'tlink')}</small></dd></div>
      <div><dt>E-mail</dt><dd>contato@acidi.net</dd></div>
      <div><dt>E-mail de comunicação</dt><dd>comunicacao@acidi.net</dd></div>
      <div><dt>Endereço</dt><dd>Rua Ver. Alvin Rauh Júnior, 100<br>Nações, Indaial/SC · CEP 89082-065<small>{ext(MAPA, 'Abrir no mapa', 'tlink')}</small></dd></div>
      <div><dt>Redes sociais</dt><dd><small>{ext(INSTA, 'Instagram', 'tlink')} &nbsp; {ext(FACE, 'Facebook', 'tlink')}</small></dd></div>
    </dl>
  </div>
  <form class="demo" novalidate aria-labelledby="h-form">
    <h2 id="h-form" class="hl" style="font-size:2rem">Envie <b>uma mensagem</b></h2>
    {demo_notice()}
    <div class="row2">{field('ct-nome', 'Nome', 'required', attrs='autocomplete="name"')}{field('ct-email', 'E-mail', 'required email', typ='email', attrs='autocomplete="email"')}</div>
    <div class="row2">{field('ct-tel', 'Telefone', 'phone', typ='tel', hint='Com DDD.', attrs='autocomplete="tel"')}<div class="field"><label for="ct-assunto">Assunto</label><select id="ct-assunto" name="ct-assunto" data-rules="required" data-label="Assunto" aria-describedby="ct-assunto-erro"><option value="">Selecione</option>{opts}</select><p class="err" id="ct-assunto-erro"></p></div></div>
    {field('ct-msg', 'Mensagem', 'required min10', kind='textarea')}
    {form_end('Concluir demonstração')}
  </form>
</div></section>
<script>(function(){{var a=new URLSearchParams(location.search).get('assunto'),s=document.getElementById('ct-assunto');if(a&&s&&s.querySelector('option[value="'+a.replace(/[^a-z0-9-]/g,'')+'"]'))s.value=a;}})();</script>'''))

print(len(paginas), 'páginas geradas:', ', '.join(paginas))
