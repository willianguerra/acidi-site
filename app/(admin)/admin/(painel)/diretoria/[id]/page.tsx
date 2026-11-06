import { notFound, redirect } from 'next/navigation';
import { exigirUsuario } from '@/lib/auth-servidor';
import { db } from '@/lib/db';
import { obterMembro, GRUPOS } from '@/lib/admin/diretoria';
import { FormMembro } from '@/components/admin/FormsDiretoria';

import { Cabecalho } from '@/components/admin/Cabecalho';

export const metadata = { title: 'Editar membro' };

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const r = await obterMembro(db, await exigirUsuario(), (await params).id);
  if (!r.ok) { if (r.erro === 'sem-permissao') redirect('/admin'); notFound(); }
  const m = r.valor;
  return (<>
    <Cabecalho migalhas={[{ href: '/admin', rotulo: 'Início' }, { href: '/admin/diretoria', rotulo: 'Diretoria' }, { rotulo: 'Editar' }]} titulo={m.nome} />
    <div className="cartao"><FormMembro m={{ id: m.id, grupo: m.grupo, rotulo: m.rotulo ?? '', nome: m.nome, suplente: m.suplente }} grupos={GRUPOS} /></div>
  </>);
}
