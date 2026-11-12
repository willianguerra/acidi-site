import { Button } from '@/components/ui/button';
import { ArrowLeft, Mail } from 'lucide-react';
import { Card } from '@/components/ui/card';
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
    <Cabecalho titulo={c.nome}
      descricao={`${FORMULARIOS[c.formulario].titulo} · recebida em ${quando(c.criadaEm)}`}
      extra={<><Button asChild variant="outline"><a href="/admin/contatos"><ArrowLeft aria-hidden="true" />Voltar para mensagens</a></Button>
        <Button asChild><a href={`mailto:${c.email}`}><Mail aria-hidden="true" />Responder por e-mail</a></Button></>} />
    <Card className="max-w-4xl">
      <dl className="grid gap-4">{c.campos.map(x => <div key={x.rotulo}><dt className="rotulo">{x.rotulo}</dt><dd className="mt-0.5 whitespace-pre-wrap">{x.valor}</dd></div>)}</dl>
    </Card>
  </>);
}
