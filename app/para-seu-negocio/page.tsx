import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Crumbs, PageHead, JoinBox } from '@/components/blocos';
import { Ico, Ext } from '@/components/Ico';
import { getServicos } from '@/lib/content';
import { SUF } from '@/lib/meta';

export const metadata = {
  title: 'Para seu negócio' + SUF,
  description: 'Serviços da ACIDI para associados: Util Card, Uniodonto, Boa Vista SCPC, Certificado de Origem, treinamentos e mais.',
};

export default async function Page() {
  const servicos = await getServicos();
  return (<>
    <Header page="para-seu-negocio" />
    <main id="conteudo">
      <Crumbs items={[['/', 'Início'], [null, 'Para seu negócio']]} />
      <PageHead kicker="Para seu negócio" title={<>Serviços para a <b>gestão da empresa</b></>}
        lead="A ACIDI oferece aos associados vantagens e soluções para auxiliar a gestão do negócio e tornar a empresa mais competitiva."
        side={<nav className="localnav" aria-label="Serviços nesta página">{servicos.map(s => <a key={s.slug} href={'#' + s.slug}>{s.titulo}</a>)}<a href="/auditorio">Auditório e salas</a></nav>} />
      <section className="sec"><div className="wrap">
        {servicos.map(s => (
          <article key={s.slug} className="svc" id={s.slug} aria-labelledby={'h-' + s.slug}>
            <div className="h">{s.imagem ? <img className="logo" src={'/assets/img/' + s.imagem} alt="" /> : <span className="badge">{s.marca}</span>}<h2 id={'h-' + s.slug}>{s.titulo}</h2></div>
            <div className="b">{s.paragrafos.map(p => <p key={p}>{p}</p>)}<div className="ctas">{s.link && <Ext href={s.link.href} cls="btn btn-s">{s.link.texto}</Ext>}<a className="btn btn-p" href={'/contato?assunto=' + s.slug}>Falar com a ACIDI sobre este serviço <Ico n="go" cls="ico go" /></a></div></div>
          </article>
        ))}
        <article className="svc" id="auditorio-e-salas"><div className="h"><span className="badge">Espaços</span><h2>Auditório e salas</h2></div><div className="b"><p>Auditório com capacidade para 170 pessoas e salas para reuniões e treinamentos, todos climatizados, com valor diferenciado para associados mediante agendamento prévio.</p><div className="ctas"><a className="btn btn-p" href="/auditorio">Ver espaços e solicitar <Ico n="go" cls="ico go" /></a></div></div></article>
      </div></section>
      <JoinBox />
    </main>
    <Footer />
  </>);
}
