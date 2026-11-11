import { Header } from './Header';
import { Footer } from './Footer';
import { CabecalhoPagina, SecaoTexto } from './Molde';
import type { Pagina } from '@/lib/types';

const PAIS = {
  acidi: { nome: 'A ACIDI', href: '/historico' },
  negocio: { nome: 'Para seu negócio', href: '/para-seu-negocio' },
};

export function PaginaDinamica({ slug, nome, menu, conteudo }: Omit<Pagina, 'descricao'>) {
  const pai = menu && PAIS[menu];
  return (<>
    <Header page={`/${slug}`} />
    <main id="conteudo">
      <nav className="crumbs wrap" aria-label="Você está em">
        <ol>
          <li><a href="/">Início</a></li>
          {pai && <li><a href={pai.href}>{pai.nome}</a></li>}
          <li aria-current="page">{nome}</li>
        </ol>
      </nav>
      <CabecalhoPagina cab={conteudo.cabecalho} />
      <SecaoTexto c={conteudo} />
    </main>
    <Footer />
  </>);
}
