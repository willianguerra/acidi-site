import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Crumbs, PageHead } from '@/components/blocos';
import { getDiretoria } from '@/lib/content';
import { pagina } from '@/lib/meta';

export const metadata = pagina('/diretoria', 'Diretoria', 'Diretoria executiva, vice-presidências e conselhos da ACIDI – Associação Empresarial de Indaial na gestão 2024/2026.');

const nomes = (lista: string[]) => <ul className="namelist">{lista.map(n => <li key={n}>{n}</li>)}</ul>;

export default async function Page() {
  const d = await getDiretoria();
  return (<>
    <Header page="diretoria" />
    <main id="conteudo">
      <Crumbs items={[['/', 'Início'], ['/historico', 'A ACIDI'], [null, 'Diretoria']]} />
      <PageHead kicker="A ACIDI · Diretoria" title={<>Gestão <b>2024/2026</b></>}
        lead="Diretoria executiva, vice-presidências por área e conselhos, conforme a composição publicada pela associação."
        side={<><p>A posse da diretoria para o biênio 2024–2026 ocorreu em 22 de maio de 2024, na comemoração dos 35 anos da ACIDI.</p><p style={{ marginTop: '10px' }}><a className="tlink" href="/noticias/acidi-35-anos-posse-da-diretoria">Ler a notícia da posse</a></p></>} />
      <div className="wrap">
        <section className="block" aria-labelledby="h-exec"><h2 id="h-exec">Diretoria <b>executiva</b></h2><div className="people">
          {d.executiva.map(p => <div key={p.cargo} className="person"><span>{p.cargo}</span><b>{p.nome}</b></div>)}
        </div></section>
        <section className="block" aria-labelledby="h-vp"><h2 id="h-vp">Vice-presidências <b>por área</b></h2><ul className="namelist">{d.vps.map(v => <li key={v.area}>{v.nome}<small>{v.area}</small></li>)}</ul></section>
        <section className="block" aria-labelledby="h-cc"><h2 id="h-cc">Conselho <b>consultivo</b></h2>{nomes(d.consultivo)}</section>
        <section className="block" aria-labelledby="h-cf"><h2 id="h-cf">Conselho <b>fiscal</b></h2><ul className="namelist">{d.fiscal.map(p => <li key={p.nome}>{p.nome}{p.suplente && <small>Suplente</small>}</li>)}</ul></section>
        <section className="block" aria-labelledby="h-cd"><h2 id="h-cd">Conselho <b>deliberativo</b></h2>{nomes(d.deliberativo)}<h3 className="sub-h">Suplentes</h3>{nomes(d.deliberativoSuplentes)}</section>
      </div>
    </main>
    <Footer />
  </>);
}
