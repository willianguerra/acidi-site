import { notFound, redirect } from 'next/navigation';
import { exigirUsuario } from '@/lib/auth-servidor';
import { db } from '@/lib/db';
import { obterEvento } from '@/lib/admin/eventos';
import { FormEvento } from '@/components/admin/FormEvento';
import { Cabecalho } from '@/components/admin/Cabecalho';

export const metadata = { title: 'Editar evento' };

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const r = await obterEvento(db, await exigirUsuario(), (await params).id);
  if (!r.ok) { if (r.erro === 'sem-permissao') redirect('/admin'); notFound(); }
  const e = r.valor;
  return (<>
    <Cabecalho migalhas={[{ href: '/admin', rotulo: 'Início' }, { href: '/admin/agenda', rotulo: 'Agenda' }, { rotulo: 'Editar' }]} titulo={e.titulo} />
    <FormEvento e={{ id: e.id, data: e.data, titulo: e.titulo, horario: e.horario ?? '', local: e.local, descricao: e.descricao, lidoEm: e.atualizadoEm.toISOString() }} />
  </>);
}
