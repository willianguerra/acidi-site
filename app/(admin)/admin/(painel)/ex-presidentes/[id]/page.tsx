import { Card } from '@/components/ui/card';
import { notFound, redirect } from 'next/navigation';
import { exigirUsuario } from '@/lib/auth-servidor';
import { db } from '@/lib/db';
import { obterExPresidente } from '@/lib/admin/ex-presidentes';
import { FormExPresidente } from '@/components/admin/FormsDiretoria';

import { Cabecalho } from '@/components/admin/Cabecalho';

export const metadata = { title: 'Editar ex-presidente' };

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const r = await obterExPresidente(db, await exigirUsuario(), (await params).id);
  if (!r.ok) { if (r.erro === 'sem-permissao') redirect('/admin'); notFound(); }
  const p = r.valor;
  return (<>
    <Cabecalho titulo={p.nome} />
    <Card><FormExPresidente p={{ id: p.id, nome: p.nome, gestao: p.gestao ?? '', foto: p.foto ?? '' }} /></Card>
  </>);
}
