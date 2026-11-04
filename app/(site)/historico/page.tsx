import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { JoinBox } from '@/components/blocos';
import { getExPresidentes } from '@/lib/content';
import { pagina } from '@/lib/meta';

export const metadata = pagina('/historico', 'A ACIDI e sua história', 'História da Associação Empresarial de Indaial (SC), fundada em 22 de maio de 1989 para unir e representar os empresários da cidade.');

export default async function Page() {
  const retratos = (await getExPresidentes()).filter(p => p.foto);
  return (<>
    <Header page="historico" />
    <main id="conteudo">

<nav className="crumbs wrap" aria-label="Você está em"><ol><li><a href="/">Início</a></li><li aria-current="page">A ACIDI · Histórico</li></ol></nav><header className="phead photo-head"><div className="wrap grid12">
<div className="t"><span className="kicker">A ACIDI · Histórico</span><h1 className="hl">Uma entidade de empresários <b>para Indaial</b></h1><p className="lead">A Associação Empresarial de Indaial foi fundada por um grupo de empresários em 22 de maio de 1989.</p></div>
<figure className="pic" style={{ margin: "0" }}><div className="photo"><img src="/assets/img/sede-viva.jpg" alt="Sede da ACIDI em Indaial, prédio em estilo enxaimel" /></div><figcaption className="cap"><b>Sede da ACIDI</b> · Rua Ver. Alvin Rauh Júnior, 100, Nações, Indaial/SC · CEP 89082-065</figcaption></figure>
</div></header>
<section className="sec"><div className="wrap split">
<div className="aside"><nav className="localnav" aria-label="Nesta seção"><a href="/diretoria">Diretoria</a><a href="/ex-presidentes">Ex-Presidentes</a><a href="/representatividade">Representatividade</a><a href="/nucleos">Núcleos</a></nav></div>
<div className="prose">
<h2>Por que a ACIDI existe</h2>
<p>O objetivo da fundação era congregar o empresariado local, da indústria, do comércio, da agricultura, das instituições financeiras, das prestadoras de serviços e dos profissionais liberais, para fortalecer a classe e unir esforços na busca do desenvolvimento e na resolução de problemas das empresas e da comunidade.</p>
<h2>O que a ACIDI faz hoje</h2>
<p>A ACIDI consolidou-se como entidade consultiva da administração pública, de apoio às ações comunitárias e de incentivo ao desenvolvimento econômico do município, sem deixar de lado seu papel de prestadora de serviços aos associados e de representante dos interesses do empresário indaialense.</p>
<p>É uma entidade que defende o bem-estar de toda a sociedade e se preocupa com os problemas locais, estaduais e federais que afetam a cidade direta ou indiretamente.</p>
<h2>Marcos publicados</h2>
<ul>
<li><b>22 de maio de 1989</b> · Fundação da ACIDI por um grupo de empresários de Indaial.</li>
<li><b>22 de maio de 2024</b> · Comemoração dos 35 anos e posse da diretoria para o biênio 2024–2026. <a className="tlink" href="/noticias/acidi-35-anos-posse-da-diretoria">Ler a notícia</a></li>
</ul>
<figure style={{ margin: "16px 0 0" }}><div className="photo" style={{ borderRadius: "var(--r)", aspectRatio: "3/2" }}><img src="/assets/img/posse-2024.jpg" alt="Diretoria e convidados na cerimônia de posse e comemoração dos 35 anos da ACIDI" loading="lazy" /></div><figcaption className="cap">Comemoração dos 35 anos e posse da diretoria, maio de 2024.</figcaption></figure>
</div>
</div></section>
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
