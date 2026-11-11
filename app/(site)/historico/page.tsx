import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { JoinBox } from '@/components/blocos';
import { getExPresidentes, getPaginaFixa } from '@/lib/content';
import { pagina } from '@/lib/meta';
import { CabecalhoPagina, SecaoTexto } from '@/components/Molde';

export async function generateMetadata() {
  const p = await getPaginaFixa('historico');
  return pagina('/historico', p.nome, p.descricao);
}

export default async function Page() {
  const c = (await getPaginaFixa('historico')).conteudo;
  const retratos = (await getExPresidentes()).filter(p => p.foto);
  return (<>
    <Header page="historico" />
    <main id="conteudo">

<nav className="crumbs wrap" aria-label="Você está em"><ol><li><a href="/">Início</a></li><li aria-current="page">A ACIDI · Histórico</li></ol></nav><CabecalhoPagina cab={c.cabecalho} />
<SecaoTexto c={c} aside={<nav className="localnav" aria-label="Nesta seção"><a href="/diretoria">Diretoria</a><a href="/ex-presidentes">Ex-Presidentes</a><a href="/representatividade">Representatividade</a><a href="/nucleos">Núcleos</a></nav>} />
<section className="sec alt faces" aria-labelledby="h-faces"><div className="wrap">
<div className="sec-h"><div><span className="kicker">Quem conduziu</span><h2 id="h-faces" className="hl sec-t">Empresários que <b>presidiram a ACIDI</b></h2></div><a className="tlink" href="/ex-presidentes">Todos os ex-presidentes</a></div>
<ul className="strip">{retratos.map(p => <li key={p.nome}><div className="pf"><img src={p.foto!} alt={'Retrato de ' + p.nome} loading="lazy" /></div><span>{p.nome}</span></li>)}</ul>
<p className="muted strip-n">Retratos disponíveis, na ordem publicada pela ACIDI. Períodos de cada gestão na página de ex-presidentes.</p>
</div></section>
<JoinBox />
    </main>
    <Footer />
  </>);
}
