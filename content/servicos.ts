// Conteúdo migrado de ferramentas/gerar_site.py. Na Fase 2 passa para o banco.
import type { Servico } from '@/lib/types';

export const SERVICOS: Servico[] = [
  {
    "slug": "util-card",
    "titulo": "Família Util Card",
    "icone": "card",
    "imagem": "util.jpg",
    "marca": "Util",
    "resumo": "Vale-refeição, vale-alimentação e cartão de benefícios, sem mensalidade nem anuidade.",
    "paragrafos": [
      "Em parceria com a FACISC, a ACIDI oferece aos associados os cartões de benefício Util, divididos em vale-refeição, vale-alimentação e cartão de benefícios.",
      "Os cartões facilitam a gestão de benefícios da empresa e o controle do fluxo de caixa, inclusive eliminando o desencaixe financeiro. Com os cartões Util não há mensalidade nem anuidade."
    ],
    "link": {
      "href": "https://site.convcard.com.br/crt/",
      "texto": "Acessar o UtilCard"
    }
  },
  {
    "slug": "uniodonto",
    "titulo": "Uniodonto",
    "icone": "tooth",
    "imagem": "uniodonto.jpg",
    "marca": "Uniodonto",
    "resumo": "Assistência odontológica para colaboradores, extensível aos dependentes.",
    "paragrafos": [
      "Por meio da parceria com a Uniodonto SC, a empresa associada pode oferecer assistência odontológica aos colaboradores, extensível aos seus dependentes.",
      "Os planos dão acesso a profissionais que cuidam do bem-estar e da saúde do colaborador e de sua família."
    ],
    "link": {
      "href": "https://www.uniodontosc.coop.br/encontre-seu-dentista.php",
      "texto": "Encontrar um dentista Uniodonto"
    }
  },
  {
    "slug": "boa-vista-scpc",
    "titulo": "Consulta Boa Vista SCPC",
    "icone": "search",
    "imagem": "boavista.jpg",
    "marca": "Boa Vista",
    "resumo": "Informações de crédito rápidas e integradas para todas as etapas do negócio.",
    "paragrafos": [
      "A solução Boa Vista SCPC é um sistema de consulta para análise de crédito, com informações rápidas, integradas e seguras para todas as etapas do negócio.",
      "O sistema on-line acompanha todo o processo, da prospecção e concessão de crédito à gestão da carteira e à recuperação."
    ],
    "link": {
      "href": "http://web2.bvsnet.com.br/",
      "texto": "Acessar a consulta SCPC"
    }
  },
  {
    "slug": "certificado-de-origem",
    "titulo": "Certificado de Origem",
    "icone": "doc",
    "imagem": null,
    "marca": "Exportação",
    "resumo": "Comprova a procedência do produto e reduz ou isenta o imposto de importação no país comprador.",
    "paragrafos": [
      "O Certificado de Origem é o documento legal que comprova ao país comprador a procedência do bem adquirido e especifica as normas de origem negociadas nos acordos comerciais entre o Brasil e outros países.",
      "Seu principal benefício é a redução ou isenção do imposto de importação para as empresas compradoras no exterior, o que torna mais competitivo o preço final das mercadorias exportadas por empresas brasileiras."
    ],
    "link": null
  },
  {
    "slug": "treinamentos-e-palestras",
    "titulo": "Treinamentos e Palestras",
    "icone": "screen",
    "imagem": null,
    "marca": "Capacitação",
    "resumo": "Qualificação aberta à comunidade, com desconto para associados e opção in company.",
    "paragrafos": [
      "A ACIDI oferece treinamentos, em parceria com outras entidades, para o aprimoramento das empresas e de seus colaboradores, com foco no crescimento pessoal e profissional.",
      "Os treinamentos são abertos a toda a comunidade, com prioridade e descontos especiais para associados. Os temas são variados e também podem ser realizados in company."
    ],
    "link": null
  },
  {
    "slug": "protesto-expresso",
    "titulo": "Protesto Expresso",
    "icone": "doc",
    "imagem": null,
    "marca": "Cobrança",
    "resumo": "Envio de títulos a protesto on-line; as custas ficam por conta do devedor.",
    "paragrafos": [
      "O Protesto Expresso é uma ferramenta de recuperação de dívidas: o empresário envia os títulos a protesto e as custas ficam por conta do devedor.",
      "Todo o processo é feito on-line, de forma rápida e prática."
    ],
    "link": null
  },
  {
    "slug": "xml-empresarial",
    "titulo": "XML Empresarial",
    "icone": "doc",
    "imagem": null,
    "marca": "Fiscal",
    "resumo": "Emissão, guarda e gestão de documentos fiscais eletrônicos, fornecido pela FACISC.",
    "paragrafos": [
      "O XML Empresarial é o serviço de armazenamento, emissão e gestão de documentos eletrônicos fornecido pela FACISC.",
      "Ele ajuda o empresário no dia a dia, cumprindo as exigências legais de guarda e geração de documentos fiscais."
    ],
    "link": null
  }
];
