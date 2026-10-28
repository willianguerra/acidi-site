import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { SUF } from '@/lib/meta';

export const metadata = {
  title: 'Núcleos' + SUF,
  description: "Núcleos setoriais da ACIDI: grupos de trabalho para trocar experiências e buscar soluções em conjunto.",
};

export default async function Page() {
  return (<>
    <Header page="nucleos" />
    <main id="conteudo">
<nav className="crumbs wrap" aria-label="Você está em"><ol><li><a href="/">Início</a></li><li><a href="/historico">A ACIDI</a></li><li aria-current="page">Núcleos</li></ol></nav><header className="phead"><div className="wrap grid12">
<div className="t"><span className="kicker">A ACIDI · Núcleos</span><h1 className="hl">Quem vive o mesmo desafio <b>resolve junto</b></h1><p className="lead">Os núcleos são grupos de trabalho para trocar experiências e identificar oportunidades e desafios comuns, buscando em conjunto as soluções mais eficientes.</p></div>
</div></header>
<section className="sec"><div className="wrap split">
<div className="aside"><p className="muted">Além de promover o associativismo, os núcleos favorecem o desenvolvimento das empresas do setor e da economia do município.</p><a className="btn btn-p" href="/contato?assunto=nucleos">Saber quais núcleos estão ativos</a></div>
<div className="prose">
<h2>Núcleos citados em publicações da ACIDI</h2>
<p>Os registros abaixo vêm de publicações da associação, com a data de cada uma. Para saber quais núcleos estão em funcionamento e como participar, fale com a equipe.</p>
<div className="tablebox"><table className="res"><thead><tr><th scope="col">Núcleo</th><th scope="col">Publicação</th></tr></thead><tbody>
<tr><td>Núcleo do Artesanato e Economia Criativa</td><td>Feira de artesanato na Feijoada da ACIDI · <a className="tlink" href="/noticias/segunda-feijoada-da-acidi">julho de 2024</a></td></tr>
<tr><td>Núcleo Câmara da Mulher Empresária</td><td>Encontro na agenda · <a className="tlink" href="/agenda#evento-2022-05-18-mulher-empresaria">maio de 2022</a></td></tr>
<tr><td>Núcleo Gestão de Pessoas</td><td>Encontro na agenda · <a className="tlink" href="/agenda#evento-2022-05-18-de-pessoas">maio de 2022</a></td></tr>
<tr><td>Núcleo de Saúde e Segurança do Trabalhador</td><td>Encontro na agenda · <a className="tlink" href="/agenda#evento-2022-05-18-do-trabalhador">maio de 2022</a></td></tr>
</tbody></table></div>
<h2>Conselhos municipais</h2>
<p>A ACIDI também participa de conselhos municipais da Prefeitura, por entender que é responsabilidade da entidade representar e defender os interesses do empresário e o desenvolvimento da cidade.</p>
<ul><li>Indústria e Comércio</li><li>Turismo</li><li>Saúde</li><li>Educação</li><li>Trânsito</li><li>Defesa Civil</li><li>Direitos da Criança e do Adolescente</li><li>Saneamento Ambiental</li><li>Administração HBR</li><li>Políticas Esportivas</li></ul>
</div>
</div></section>
    </main>
    <Footer />
  </>);
}
