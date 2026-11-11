import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { getPaginaFixa } from '@/lib/content';
import { pagina } from '@/lib/meta';
import { CabecalhoPagina, SecaoTexto } from '@/components/Molde';

export async function generateMetadata() {
  const p = await getPaginaFixa('nucleos');
  return pagina('/nucleos', p.nome, p.descricao);
}

export default async function Page() {
  const c = (await getPaginaFixa('nucleos')).conteudo;
  return (<>
    <Header page="nucleos" />
    <main id="conteudo">
<nav className="crumbs wrap" aria-label="Você está em"><ol><li><a href="/">Início</a></li><li><a href="/historico">A ACIDI</a></li><li aria-current="page">Núcleos</li></ol></nav><CabecalhoPagina cab={c.cabecalho} />
<SecaoTexto c={c} inserir={{ apos: 1, el: <div className="tablebox"><table className="res"><thead><tr><th scope="col">Núcleo</th><th scope="col">Publicação</th></tr></thead><tbody>
<tr><td>Núcleo do Artesanato e Economia Criativa</td><td>Feira de artesanato na Feijoada da ACIDI · <a className="tlink" href="/noticias/segunda-feijoada-da-acidi">julho de 2024</a></td></tr>
<tr><td>Núcleo Câmara da Mulher Empresária</td><td>Encontro na agenda · <a className="tlink" href="/agenda#evento-2022-05-18-mulher-empresaria">maio de 2022</a></td></tr>
<tr><td>Núcleo Gestão de Pessoas</td><td>Encontro na agenda · <a className="tlink" href="/agenda#evento-2022-05-18-de-pessoas">maio de 2022</a></td></tr>
<tr><td>Núcleo de Saúde e Segurança do Trabalhador</td><td>Encontro na agenda · <a className="tlink" href="/agenda#evento-2022-05-18-do-trabalhador">maio de 2022</a></td></tr>
</tbody></table></div> }} />
    </main>
    <Footer />
  </>);
}
