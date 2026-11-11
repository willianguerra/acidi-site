import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { EventItem } from '@/components/blocos';
import { getEventos, getPaginaFixa } from '@/lib/content';
import { evId, hojeIso, separarEventos } from '@/lib/datas';
import { pagina } from '@/lib/meta';
import { CabecalhoPagina } from '@/components/Molde';

export async function generateMetadata() {
  const p = await getPaginaFixa('agenda');
  return pagina('/agenda', p.nome, p.descricao);
}

export default async function Page() {
  const c = (await getPaginaFixa('agenda')).conteudo;
  const eventos = await getEventos();
  const hoje = hojeIso(); // data do build; o site.js reordena no navegador
  const { prox, arquivo } = separarEventos(eventos, hoje);
  return (<>
    <Header page="agenda" />
    <main id="conteudo">
<nav className="crumbs wrap" aria-label="Você está em"><ol><li><a href="/">Início</a></li><li aria-current="page">Agenda</li></ol></nav><CabecalhoPagina cab={c.cabecalho} />
<div className="wrap" data-agenda="">
<section className="block" aria-labelledby="h-prox"><h2 id="h-prox">Próximos <b>eventos</b></h2>
<ul className="evlist" data-upcoming="" hidden={!prox.length}>{prox.map(e => <EventItem key={evId(e)} e={e} />)}</ul>
<div className="empty" data-empty="" hidden={!!prox.length}><b>Nenhum próximo evento publicado.</b><span>Consulte o arquivo abaixo ou fale com a equipe da ACIDI para saber da programação.</span><div className="ctas"><a className="btn btn-s" href="/contato?assunto=agenda">Falar com a ACIDI</a></div></div>
</section>
<section className="block" id="arquivo" aria-labelledby="h-arq"><h2 id="h-arq">Arquivo <b>de eventos</b></h2>
<p className="muted" style={{ margin: "-12px 0 20px" }}>Eventos já realizados, do mais recente ao mais antigo · <span data-past-count="">{arquivo.length}</span> registros.</p>
<ul className="evlist" data-past="">{arquivo.map(e => <EventItem key={evId(e)} e={e} />)}</ul>
</section>
</div>
    </main>
    <Footer />
  </>);
}
