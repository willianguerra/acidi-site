// URLs do site estático antigo (*.html) -> rotas do Next. Usado pelos redirects 301 do next.config.ts.
export const PAGINAS = ['historico', 'diretoria', 'ex-presidentes', 'representatividade', 'nucleos', 'para-seu-negocio',
  'noticias', 'agenda', 'auditorio', 'associe-se', 'contato'];

export const ROTAS: Record<string, string> = {
  'index.html': '/',
  ...Object.fromEntries(PAGINAS.map(p => [p + '.html', '/' + p])),
};

export function rotaDe(arquivo: string): string | undefined {
  const n = /^noticia-(.+)\.html$/.exec(arquivo);
  return ROTAS[arquivo] ?? (n ? '/noticias/' + n[1] : undefined);
}

// URLs do WordPress (www.acidi.net até 2026) -> rotas novas. Notícias renomeadas vão para a nova; as demais
// mantêm o slug e são trazidas por scripts/importar-wp.ts (rodar no banco de produção antes de publicar).
export const ROTAS_WP: Record<string, string> = {
  'reservar-auditorio': '/auditorio',
  'categoria/blog': '/noticias',
  'convenios': '/para-seu-negocio',
  'convenios/util': '/para-seu-negocio#util-card',
  'convenios/uniodonto': '/para-seu-negocio#uniodonto',
  'convenios/boa-vista': '/para-seu-negocio#boa-vista-scpc',
  'convenios/clinipan': '/para-seu-negocio',
  'acidi-celebra-35-anos-com-posse-da-nova-diretoria': '/noticias/acidi-35-anos-posse-da-diretoria',
  'acidi-completa-33-anos': '/noticias/acidi-completa-33-anos',
  'acidi-da-posse-a-nova-diretoria': '/noticias/acidi-da-posse-a-nova-diretoria',
  'acidi-itinerante': '/noticias/acidi-itinerante',
  'acidi-presente-em-inauguracoes-de-associados': '/noticias/acidi-presente-em-inauguracoes-de-associados',
  'acidi-realiza-assembleia-geral-extraordinaria-e-encerramento-festivo-do-ano': '/noticias/acidi-realiza-assembleia-geral-extraordinaria-e-encerramento-festivo-do-ano',
  'acidi-realiza-entrega-do-documento-voz-unica-municipal-aos-candidatos-a-prefeito-de-indaial': '/noticias/documento-voz-unica-municipal',
  'acidi-realiza-feijoada-em-comemoracao-aos-seus-34-anos': '/noticias/acidi-realiza-feijoada-em-comemoracao-aos-seus-34-anos',
  'acidi-realiza-reuniao-com-seus-associados': '/noticias/acidi-realiza-reuniao-com-seus-associados',
  'acidi-realiza-visita-tecnica-a-associacao-empresarial-de-sao-bento-do-sul': '/noticias/acidi-realiza-visita-tecnica-a-associacao-empresarial-de-sao-bento-do-sul',
  'acidi-realiza-workshop-sobre-economia': '/noticias/acidi-realiza-workshop-sobre-economia',
  'comitiva-de-indaial-realiza-visita-tecnica-a-cidade-de-maringa-pr': '/noticias/comitiva-visita-tecnica-maringa',
  'contabilidade-e-impacto-social-construindo-um-futuro-melhor': '/noticias/contabilidade-e-impacto-social',
  'deducao-do-imposto-de-renda-que-ajuda-projetos-sociais-de-indaial': '/noticias/deducao-do-imposto-de-renda-que-ajuda-projetos-sociais-de-indaial',
  'destinacao-do-imposto-de-renda-foi-tema-de-um-cafe-da-manha-promovido-pelo-nucleo-da-industria-da-acidi': '/noticias/destinacao-do-imposto-de-renda-foi-tema-de-um-cafe-da-manha-promovido-pelo-nucleo-da-industria-da-acidi',
  'em-indaial-acidi-faz-doacao-para-a-policia-civil': '/noticias/em-indaial-acidi-faz-doacao-para-a-policia-civil',
  'em-visita-a-portonave-facisc-e-acis-do-vale-reforcam-apoio-ao-alargamento-do-canal-da-bacia-de-evolucao': '/noticias/em-visita-a-portonave-facisc-e-acis-do-vale-reforcam-apoio-ao-alargamento-do-canal-da-bacia-de-evolucao',
  'encerramento-das-inscricoes-para-os-jogos-entre-empresas-da-acidi': '/noticias/encerramento-das-inscricoes-para-os-jogos-entre-empresas-da-acidi',
  'encerramento-dos-12o-jogos-entre-empresa-celebra-esporte-e-integracao-em-indaial': '/noticias/encerramento-12-jogos-entre-empresas',
  'encontro-de-liderancas-regionais': '/noticias/encontro-de-liderancas-regionais',
  'entidades-empresariais-do-vale-do-itajai-emitem-nota-de-repudio-contra-direcao-nacional-do-dnit': '/noticias/entidades-empresariais-do-vale-do-itajai-emitem-nota-de-repudio-contra-direcao-nacional-do-dnit',
  'facisc-entregou-demandas-do-voz-unica-para-90-candidatos-na-primeira-semana-de-eventos-regionais': '/noticias/facisc-entregou-demandas-do-voz-unica-para-90-candidatos-na-primeira-semana-de-eventos-regionais',
  'inovacao-e-empreendedorismo-jovem-em-destaque-formatura-da-4a-edicao-do-projeto-maker-2023-uma-parceria-acidi-sesi': '/noticias/inovacao-e-empreendedorismo-jovem-em-destaque-formatura-da-4a-edicao-do-projeto-maker-2023-uma-parceria-acidi-sesi',
  'inscricoes-abertas-para-os-11o-jogos-entre-empresas-de-indaial': '/noticias/inscricoes-abertas-para-os-11o-jogos-entre-empresas-de-indaial',
  'jogos-entre-empresas-de-indaial-tem-inicio-dia-04-de-agosto': '/noticias/jogos-entre-empresas-de-indaial-tem-inicio-dia-04-de-agosto',
  'meeting-de-rh-reuniu-profissionais-da-regiao': '/noticias/meeting-de-rh-reuniu-profissionais-da-regiao',
  'networkaffee': '/noticias/networkaffee',
  'nova-diretoria-da-acidi-faz-sua-primeira-reuniao-de-trabalho': '/noticias/nova-diretoria-da-acidi-faz-sua-primeira-reuniao-de-trabalho',
  'palestra-desvendando-o-esg-promovido-pelo-nucleo-da-industria-de-indaial-destaca-importancia-da-sustentabilidade-empresarial': '/noticias/palestra-desvendando-o-esg-promovido-pelo-nucleo-da-industria-de-indaial-destaca-importancia-da-sustentabilidade-empresarial',
  'presidente-da-acidi-recebe-homenagem-na-assembleia-legislativa-em-evento-dos-50-anos-do-creci-sc': '/noticias/presidente-da-acidi-recebe-homenagem-na-assembleia-legislativa-em-evento-dos-50-anos-do-creci-sc',
  'rede-feminina-realiza-palestras-com-apoio-da-acidi': '/noticias/rede-feminina-realiza-palestras-com-apoio-da-acidi',
  'segunda-feijoada-da-acidi-reune-associados-em-evento-de-sucesso': '/noticias/segunda-feijoada-da-acidi',
  'transforme-sua-declaracao-de-imposto-de-renda-em-uma-acao-de-impacto-social-em-indaial': '/noticias/imposto-de-renda-impacto-social',
  'vale-do-itajai-comeca-a-definir-bandeiras-e-pleitos-para-compor-voz-unica': '/noticias/vale-do-itajai-comeca-a-definir-bandeiras-e-pleitos-para-compor-voz-unica',
};
