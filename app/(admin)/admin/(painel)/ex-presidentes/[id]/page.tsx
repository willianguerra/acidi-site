import { notFound, redirect } from 'next/navigation';
import { exigirUsuario } from '@/lib/auth-servidor';
import { db } from '@/lib/db';
import { obterExPresidente } from '@/lib/admin/ex-presidentes';
import { FormExPresidente } from '@/components/admin/FormsDiretoria';

export const metadata = { title: 'Editar ex-presidente' };

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const r = await obterExPresidente(db, await exigirUsuario(), (await params).id);
  if (!r.ok) { if (r.erro === 'sem-permissao') redirect('/admin'); notFound(); }
  const p = r.valor;
  return (<>
    <p><a href="/admin/ex-presidentes">← Ex-presidentes</a></p>
    <h1>{p.nome}</h1>
    <div className="cartao"><FormExPresidente p={{ id: p.id, nome: p.nome, gestao: p.gestao ?? '', foto: p.foto ?? '' }} /></div>
  </>);
}
