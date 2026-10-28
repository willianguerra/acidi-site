import { redirect } from 'next/navigation';
import { exigirUsuario } from '@/lib/auth-servidor';
import { pode } from '@/lib/admin/permissoes';
import { FormEvento } from '@/components/admin/FormEvento';

export const metadata = { title: 'Novo evento' };

export default async function Page() {
  if (!pode(await exigirUsuario(), 'agenda.editar')) redirect('/admin');
  return (<>
    <p><a href="/admin/agenda">← Agenda</a></p>
    <h1>Novo evento</h1>
    <div className="cartao"><FormEvento e={{ id: null, data: '', titulo: '', horario: '', local: '', descricao: '', lidoEm: '' }} /></div>
  </>);
}
