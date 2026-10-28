import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { EventItem } from '@/components/blocos';
import { getEventos } from '@/lib/content';
import { evId, hojeIso } from '@/lib/datas';
import { SUF } from '@/lib/meta';

export const metadata = {
  title: 'Agenda' + SUF,
  description: "Agenda de eventos da ACIDI: próximos eventos e arquivo de registros publicados.",
};

export default async function Page() {
  const eventos = await getEventos();
  const hoje = hojeIso(); // data do build; o site.js reordena no navegador
  const prox = eventos.filter(e => e.data >= hoje).sort((x, y) => (x.data < y.data ? -1 : 1));
  const arquivo = eventos.filter(e => e.data < hoje).sort((x, y) => (x.data > y.data ? -1 : 1));
  return (<>
    <Header page="agenda" />
    <main id="conteudo">
<nav className="crumbs wrap" aria-label="Você está em"><ol><li><a href="/">Início</a></li><li aria-current="page">Agenda</li></ol></nav><header className="phead"><div className="wrap grid12">
<div className="t"><span className="kicker">Acontece</span><h1 className="hl">Agenda <b>da ACIDI</b></h1><p className="lead">Próximos eventos publicados pela associação e o arquivo dos registros anteriores.</p></div>
</div></header>
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
