import { Ico, Ext, type IconName } from './Ico';
import { INSTA, FACE } from '@/content/links';
import { getServicos } from '@/lib/content';

export type PageKey = 'index' | 'historico' | 'diretoria' | 'ex-presidentes' | 'representatividade' | 'nucleos'
  | 'para-seu-negocio' | 'noticias' | 'noticia' | 'agenda' | 'auditorio' | 'associe-se' | 'contato';

type Item = [href: string, titulo: string, icone: IconName, desc: string];

const NAV_ACIDI: Item[] = [
  ['/historico', 'Histórico', 'clock', 'Fundada por empresários em 22 de maio de 1989'],
  ['/diretoria', 'Diretoria', 'people', 'Gestão 2024/2026 e conselhos'],
  ['/ex-presidentes', 'Ex-Presidentes', 'bars', 'Quem presidiu a associação'],
  ['/representatividade', 'Representatividade', 'gov', 'Pleitos e conselhos municipais'],
  ['/nucleos', 'Núcleos', 'grid', 'Grupos de trabalho por setor'],
];

const rota = (p: PageKey) => (p === 'index' ? '/' : p === 'noticia' ? '/noticias' : '/' + p);

export async function Header({ page }: { page: PageKey }) {
  const NAV_NEG: Item[] = [
    ...(await getServicos()).slice(0, 5).map((s): Item => ['/para-seu-negocio#' + s.slug, s.titulo, s.icone, s.resumo.split(',')[0].split('.')[0]]),
    ['/auditorio', 'Auditório e salas', 'cal', 'Auditório para 170 pessoas'],
  ];
  const atual = rota(page);
  // âncoras (#servico) nunca marcam a página atual, como no gerador antigo
  const cur = (href: string) => (!href.includes('#') && href === atual ? 'page' as const : undefined);
  const hereA = NAV_ACIDI.some(([h]) => h === atual) ? 'here' : '';
  const hereN = page === 'para-seu-negocio' || page === 'auditorio' ? 'here' : '';
  const panel = (id: string, items: Item[], titulo: string, wide = false) => (
    <div className={'panel' + (wide ? ' wide' : '')} id={id} hidden><span className="ph">{titulo}</span>
      {items.map(([h, t, i, d]) => <a key={h} href={h} aria-current={cur(h)}><Ico n={i} /><b>{t}</b><span>{d}</span></a>)}</div>
  );
  const sheet = (items: Item[]) => items.map(([h, t]) => <a key={h} href={h} aria-current={cur(h)}>{t}</a>);
  return (<>
    <div className="util"><div className="wrap">{' '}<span>(47) 3333-8786</span><span>contato@acidi.net</span>{' '}<span className="r"><Ext href={INSTA}>Instagram</Ext><Ext href={FACE}>Facebook</Ext></span>{' '}</div></div>
    <header className="site"><div className="wrap">{' '}<a className="brand" href="/" aria-current={cur('/')}><img src="/assets/img/logo.png" width="189" height="50" alt="ACIDI, Associação Empresarial de Indaial. Ir para o início" /></a>{' '}<nav className="main" aria-label="Principal">
      <div className="dd"><button type="button" className={hereA} aria-expanded="false" aria-controls="m-acidi">A ACIDI <Ico n="down" /></button>{panel('m-acidi', NAV_ACIDI, 'Institucional')}</div>
      <div className="dd"><button type="button" className={hereN} aria-expanded="false" aria-controls="m-neg">Para seu negócio <Ico n="down" /></button>{panel('m-neg', NAV_NEG, 'Serviços para associados', true)}</div>{' '}<a href="/noticias" aria-current={cur('/noticias')}>Notícias</a>{' '}<a href="/agenda" aria-current={cur('/agenda')}>Agenda</a>{' '}<a href="/contato" aria-current={cur('/contato')}>Contato</a>{' '}</nav>{' '}<a className="btn btn-p hd-cta" href="/associe-se" aria-current={cur('/associe-se')}>Associe sua empresa</a>{' '}<button className="burger" type="button" aria-label="Abrir menu" aria-expanded="false" aria-controls="menu-movel"><Ico n="menu" /></button>{' '}</div></header>
    <dialog className="sheet" id="menu-movel" aria-label="Menu"><div className="in">
      <div className="top"><img src="/assets/img/logo.png" width="151" height="40" alt="ACIDI" /><button className="burger x" type="button" data-fechar="" aria-label="Fechar menu"><Ico n="x" /></button></div>
      <nav aria-label="Menu do celular">
        <div className="grp"><a href="/" aria-current={cur('/')}>Início</a></div>
        <div className="grp"><h2>A ACIDI</h2>{sheet(NAV_ACIDI)}</div>
        <div className="grp"><h2>Para seu negócio</h2><a href="/para-seu-negocio" aria-current={cur('/para-seu-negocio')}>Serviços para associados</a><a href="/auditorio" aria-current={cur('/auditorio')}>Auditório e salas</a></div>
        <div className="grp"><h2>Acompanhe</h2><a href="/noticias" aria-current={cur('/noticias')}>Notícias</a><a href="/agenda" aria-current={cur('/agenda')}>Agenda</a><a href="/contato" aria-current={cur('/contato')}>Contato</a></div>
      </nav>{' '}<a className="btn btn-p" href="/associe-se">Associe sua empresa <Ico n="go" cls="ico go" /></a>{' '}</div></dialog>
  </>);
}
