import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Crumbs } from '@/components/blocos';
import { getExPresidentes, getPaginaFixa } from '@/lib/content';
import { pagina } from '@/lib/meta';
import { CabecalhoPagina } from '@/components/Molde';

export async function generateMetadata() {
  const p = await getPaginaFixa('ex-presidentes');
  return pagina('/ex-presidentes', p.nome, p.descricao);
}

const ini = (nome: string) => { const p = nome.split(' '); return p[0][0] + p[p.length - 1][0]; };

export default async function Page() {
  const c = (await getPaginaFixa('ex-presidentes')).conteudo;
  const lista = await getExPresidentes();
  return (<>
    <Header page="ex-presidentes" />
    <main id="conteudo">
      <Crumbs items={[['/', 'Início'], ['/historico', 'A ACIDI'], [null, 'Ex-Presidentes']]} />
      <CabecalhoPagina cab={c.cabecalho} />
      <section className="sec"><div className="wrap"><ul className="portraits">
        {lista.map(p => (
          <li key={p.nome}>
            {p.foto ? <div className="pf"><img src={p.foto} alt={'Retrato de ' + p.nome} loading="lazy" /></div> : <div className="pf" aria-hidden="true">{ini(p.nome)}</div>}
            <b>{p.nome}</b>{p.gestao && <span>{p.gestao}</span>}
          </li>
        ))}
      </ul>
        <p className="muted" style={{ marginTop: '48px', fontSize: '.92rem', maxWidth: '68ch' }}>A diretoria da gestão 2024/2026 é apresentada na página <a className="tlink" href="/diretoria">Diretoria</a>.</p></div></section>
    </main>
    <Footer />
  </>);
}
