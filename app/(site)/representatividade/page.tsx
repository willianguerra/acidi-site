import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Story } from '@/components/blocos';
import { getNoticia, getPaginaFixa } from '@/lib/content';
import type { Noticia } from '@/lib/types';
import { pagina } from '@/lib/meta';
import { CabecalhoPagina, SecaoTexto } from '@/components/Molde';

export async function generateMetadata() {
  const p = await getPaginaFixa('representatividade');
  return pagina('/representatividade', p.nome, p.descricao);
}

const ACAO = ['documento-voz-unica-municipal', 'comitiva-visita-tecnica-maringa', 'encontro-de-liderancas-regionais'];

export default async function Page() {
  const c = (await getPaginaFixa('representatividade')).conteudo;
  const acao = (await Promise.all(ACAO.map(getNoticia))).filter((n): n is Noticia => !!n);
  return (<>
    <Header page="representatividade" />
    <main id="conteudo">
<nav className="crumbs wrap" aria-label="Você está em"><ol><li><a href="/">Início</a></li><li><a href="/historico">A ACIDI</a></li><li aria-current="page">Representatividade</li></ol></nav><CabecalhoPagina cab={c.cabecalho} />
<SecaoTexto c={c} />
<section className="sec rep on-dark" style={{ paddingTop: "72px" }} aria-label="Pleitos por esfera">
<div className="wrap">
<div className="esc" data-anim=""><section className="lv" style={{ "--i": "0" }}><span className="ic"><svg className="ico" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M3 10l9-6 9 6M5 10v9M19 10v9M9 10v9M15 10v9M3 20h18" /></svg></span><span className="nn" aria-hidden="true">01</span><h3>Municipal</h3><p>Perto de quem empreende.</p><ul><li>Segurança pública</li><li>Corpo de Bombeiros Voluntários</li><li>Hospital Beatriz Ramos</li><li>Ações sociais</li></ul></section><section className="lv" style={{ "--i": "1" }}><span className="ic"><svg className="ico" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M9 4L3 6v14l6-2 6 2 6-2V4l-6 2-6-2zM9 4v14M15 6v14" /></svg></span><span className="nn" aria-hidden="true">02</span><h3>Estadual</h3><p>Conexões para a região.</p><ul><li>Reforma e revitalização da Rodovia SC-412 (Jorge Lacerda)</li><li>Anel de Contorno Urbano de Gaspar</li></ul></section><section className="lv" style={{ "--i": "2" }}><span className="ic"><svg className="ico" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3c2.5 2.7 3.7 5.7 3.7 9s-1.2 6.3-3.7 9c-2.5-2.7-3.7-5.7-3.7-9S9.5 5.7 12 3z" /></svg></span><span className="nn" aria-hidden="true">03</span><h3>Federal</h3><p>Demandas de alcance nacional.</p><ul><li>Duplicação da BR-470</li><li>Aeroporto Internacional de Navegantes</li><li>Bacia de Evolução do Porto Itajaí/Navegantes</li><li>Sistema de prevenção de enchentes: monitoramento e barragens</li><li>Pacto Federativo</li></ul></section></div>
<div className="councils">
<h3>Participação em <b>conselhos municipais</b></h3>
<p>Indústria e Comércio · Turismo · Saúde · Educação · Trânsito · Defesa Civil · Direitos da Criança e do Adolescente · Saneamento Ambiental · Administração HBR · Políticas Esportivas</p>
</div>
</div>
</section>
<section className="sec" aria-labelledby="h-acao"><div className="wrap">
<div className="sec-h"><div><span className="kicker">Em ação</span><h2 id="h-acao" className="hl sec-t">Representação <b>na prática</b></h2></div><a className="tlink" href="/noticias">Todas as notícias</a></div>
<div className="news-list">{acao.map(n => <Story key={n.slug} n={n} />)}</div>
</div></section>
    </main>
    <Footer />
  </>);
}
