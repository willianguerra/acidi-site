import { notFound, redirect } from 'next/navigation';
import { exigirUsuario } from '@/lib/auth-servidor';
import { db } from '@/lib/db';
import { obterPagina, CAMPOS_FIXA } from '@/lib/admin/paginas';
import { FormPagina } from '@/components/admin/FormPagina';
import { quando } from '@/lib/datas';
import { Aviso } from '@/components/admin/Aviso';
import type { ConteudoPagina, Fixa } from '@/lib/types';

export const metadata = { title: 'Editar página' };

const OKS: Record<string, string> = { criada: 'Página criada como rascunho.', salva: 'Alterações salvas.', publicada: 'Publicada: já está no site.', tirada: 'Tirada do ar: o endereço não abre mais no site. O conteúdo continua guardado aqui.' };

export default async function Page({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ ok?: string }> }) {
  const u = await exigirUsuario();
  const r = await obterPagina(db, u, (await params).id);
  if (!r.ok) { if (r.erro === 'sem-permissao') redirect('/admin'); notFound(); }
  const p = r.valor, ok = (await searchParams).ok;
  if (p.fixa === 'home') redirect('/admin/paginas/home');
  const c = p.conteudo as ConteudoPagina;
  const campos = p.fixa ? { ...CAMPOS_FIXA[p.fixa as Exclude<Fixa, 'home'>], fixa: true } : { foto: true, lateral: true, corpo: true, fixa: false };
  return (
    <FormPagina campos={campos} alterada={quando(p.atualizadaEm)} avisos={ok && OKS[ok] && <Aviso tipo="ok">{OKS[ok]}</Aviso>}
      p={{ id: p.id, situacao: p.situacao, nome: p.nome, slug: p.slug, descricao: p.descricao, menu: p.menu ?? '', menuTexto: p.menuTexto ?? '',
        etiqueta: c.cabecalho.etiqueta, titulo: c.cabecalho.titulo, destaque: c.cabecalho.destaque, chamada: c.cabecalho.chamada,
        foto: c.cabecalho.foto?.src ?? '', fotoAlt: c.cabecalho.foto?.alt ?? '', fotoLegenda: c.cabecalho.foto?.legenda ?? '',
        lateralTexto: c.lateral?.texto ?? '', botaoTexto: c.lateral?.botao?.texto ?? '', botaoHref: c.lateral?.botao?.href ?? '',
        corpo: c.corpo, lidaEm: p.atualizadaEm.toISOString() }} />
  );
}
