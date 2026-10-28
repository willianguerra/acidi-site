import { notFound, redirect } from 'next/navigation';
import { exigirUsuario } from '@/lib/auth-servidor';
import { db } from '@/lib/db';
import { obterEvento } from '@/lib/admin/eventos';
import { FormEvento } from '@/components/admin/FormEvento';

export const metadata = { title: 'Editar evento' };

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const r = await obterEvento(db, await exigirUsuario(), (await params).id);
  if (!r.ok) { if (r.erro === 'sem-permissao') redirect('/admin'); notFound(); }
  const e = r.valor;
  return (<>
    <p><a href="/admin/agenda">← Agenda</a></p>
    <h1>{e.titulo}</h1>
    <div className="cartao"><FormEvento e={{ id: e.id, data: e.data, titulo: e.titulo, horario: e.horario ?? '', local: e.local, descricao: e.descricao, lidoEm: e.atualizadoEm.toISOString() }} /></div>
  </>);
}
