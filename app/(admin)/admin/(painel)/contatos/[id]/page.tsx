import { notFound, redirect } from 'next/navigation';
import { exigirUsuario } from '@/lib/auth-servidor';
import { db } from '@/lib/db';
import { abrirContato, FORMULARIOS } from '@/lib/admin/contatos';
import { quando } from '@/lib/datas';
import { Cabecalho } from '@/components/admin/Cabecalho';

export const metadata = { title: 'Mensagem' };

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const r = await abrirContato(db, await exigirUsuario(), (await params).id);
  if (!r.ok) { if (r.erro === 'sem-permissao') redirect('/admin'); notFound(); }
  const c = r.valor;
  return (<>
    <Cabecalho migalhas={[{ href: '/admin', rotulo: 'Início' }, { href: '/admin/contatos', rotulo: 'Mensagens' }, { rotulo: c.nome }]} titulo={c.nome}
      extra={<a className="bt" href={`mailto:${c.email}`}>Responder por e-mail</a>} />
    <p className="meta">{FORMULARIOS[c.formulario].titulo} · {quando(c.criadaEm)}</p>
    <div className="cartao">
      <dl className="campos">{c.campos.map(x => <div key={x.rotulo}><dt>{x.rotulo}</dt><dd>{x.valor}</dd></div>)}</dl>
    </div>
  </>);
}
