import { notFound, redirect } from 'next/navigation';
import { exigirUsuario } from '@/lib/auth-servidor';
import { db } from '@/lib/db';
import { obterNoticia } from '@/lib/admin/noticias';
import { pode, type Acao } from '@/lib/admin/permissoes';
import { proxima, SITUACOES, type Evento } from '@/lib/admin/fluxo';
import { FormNoticia } from '@/components/admin/FormNoticia';
import { Cabecalho } from '@/components/admin/Cabecalho';
import { Aviso } from '@/components/admin/Aviso';
import { eq } from 'drizzle-orm';
import { user } from '@/lib/db/schema';

export const metadata = { title: 'Editar notícia' };

const OKS: Record<string, string> = {
  criada: 'Notícia criada como rascunho.', enviada: 'Enviada para revisão.',
  publicada: 'Publicada: já está no site.', devolvida: 'Devolvida ao autor com o seu comentário.', despublicada: 'Retirada do site; voltou a rascunho.',
};

type Props = { params: Promise<{ id: string }>; searchParams: Promise<{ ok?: string }> };

export default async function Page({ params, searchParams }: Props) {
  const u = await exigirUsuario();
  const r = await obterNoticia(db, u, (await params).id);
  if (!r.ok) { if (r.erro === 'sem-permissao') redirect('/admin/noticias'); notFound(); }
  const n = r.valor, ok = (await searchParams).ok;
  const alvo = { autorId: n.autorId, situacao: n.situacao };
  // o botão só aparece se o papel permite e a transição existe a partir da situação atual
  const pd = (acao: Acao, ev?: Evento) => pode(u, acao, alvo) && (!ev || proxima(n.situacao, ev) !== null);
  const revisa = pd('noticia.publicar');
  const [autor] = n.autorId ? await db.select({ nome: user.name }).from(user).where(eq(user.id, n.autorId)) : [];
  const hora = n.atualizadaEm.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', timeZone: 'America/Sao_Paulo' });
  const msg = ok === 'salva' ? `Salvo às ${hora}.` : ok && OKS[ok];
  return (<>
    <Cabecalho migalhas={[{ href: '/admin', rotulo: 'Início' }, { href: '/admin/noticias', rotulo: 'Notícias' }, { rotulo: 'Editar' }]} titulo={n.titulo}
      extra={n.situacao === 'publicada' ? <a className="bt sec" href={`/noticias/${n.slug}`} target="_blank" rel="noopener">Ver no site<span className="sr"> (abre em nova aba)</span></a> : undefined} />
    {msg && <Aviso tipo="ok">{msg}</Aviso>}
    {n.situacao === 'devolvida' && n.comentarioRevisao && <Aviso tipo="info"><b>Comentário da revisão:</b> {n.comentarioRevisao}</Aviso>}
      <FormNoticia situacao={n.situacao} autor={autor?.nome}
        n={{ id: n.id, titulo: n.titulo, slug: n.slug, data: n.data, resumo: n.resumo, imagem: n.imagem, alt: n.alt, corpo: n.corpo, lidaEm: n.atualizadaEm.toISOString(), slugTravado: !!n.publicadaEm }}
        pode={{
          editar: pd('noticia.editar'),
          // quem revisa publica direto; enviar para revisão é o caminho do editor
          enviar: !revisa && pd('noticia.enviar', 'enviar'),
          publicar: pd('noticia.publicar', 'publicar'),
          devolver: pd('noticia.devolver', 'devolver'),
          despublicar: pd('noticia.despublicar', 'despublicar'),
          apagar: pd('noticia.apagar'),
        }} />
  </>);
}
