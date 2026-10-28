import { notFound, redirect } from 'next/navigation';
import { exigirUsuario } from '@/lib/auth-servidor';
import { db } from '@/lib/db';
import { obterNoticia } from '@/lib/admin/noticias';
import { pode, type Acao } from '@/lib/admin/permissoes';
import { proxima, SITUACOES, type Evento } from '@/lib/admin/fluxo';
import { FormNoticia } from '@/components/admin/FormNoticia';

export const metadata = { title: 'Editar notícia' };

const OKS: Record<string, string> = {
  criada: 'Notícia criada como rascunho.', salva: 'Alterações salvas.', enviada: 'Enviada para revisão.',
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
  return (<>
    <p><a href="/admin/noticias">← Notícias</a></p>
    <div className="cabeca"><h1>{n.titulo}</h1><span className={'selo ' + n.situacao}>{SITUACOES[n.situacao]}</span></div>
    {ok && OKS[ok] && <p className="aviso ok" role="status">{OKS[ok]}</p>}
    {n.situacao === 'devolvida' && n.comentarioRevisao && <p className="aviso info"><b>Comentário da revisão:</b> {n.comentarioRevisao}</p>}
    {n.situacao === 'publicada' && <p className="meta">No site em <a href={`/noticias/${n.slug}`} target="_blank" rel="noopener">/noticias/{n.slug}</a></p>}
    <div className="cartao">
      <FormNoticia
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
    </div>
  </>);
}
