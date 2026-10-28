import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Crumbs, PageHead } from '@/components/blocos';
import { getExPresidentes } from '@/lib/content';
import { SUF } from '@/lib/meta';

export const metadata = {
  title: 'Ex-Presidentes' + SUF,
  description: 'Empresários que presidiram a ACIDI desde a fundação, em 1989.',
};

const ini = (nome: string) => { const p = nome.split(' '); return p[0][0] + p[p.length - 1][0]; };

export default async function Page() {
  const lista = await getExPresidentes();
  return (<>
    <Header page="ex-presidentes" />
    <main id="conteudo">
      <Crumbs items={[['/', 'Início'], ['/historico', 'A ACIDI'], [null, 'Ex-Presidentes']]} />
      <PageHead kicker="A ACIDI · Ex-Presidentes" title={<>Quem conduziu <b>a ACIDI</b></>}
        lead="Empresários que presidiram a associação, na ordem publicada pela ACIDI. Adolfo Fey, primeiro presidente, é lembrado como fundador da entidade." />
      <section className="sec"><div className="wrap"><ul className="portraits">
        {lista.map(p => (
          <li key={p.nome}>
            {p.foto ? <div className="pf"><img src={'/assets/img/' + p.foto} alt={'Retrato de ' + p.nome} loading="lazy" /></div> : <div className="pf" aria-hidden="true">{ini(p.nome)}</div>}
            <b>{p.nome}</b>{p.gestao && <span>{p.gestao}</span>}
          </li>
        ))}
      </ul>
        <p className="muted" style={{ marginTop: '48px', fontSize: '.92rem', maxWidth: '68ch' }}>A diretoria da gestão 2024/2026 é apresentada na página <a className="tlink" href="/diretoria">Diretoria</a>.</p></div></section>
    </main>
    <Footer />
  </>);
}
