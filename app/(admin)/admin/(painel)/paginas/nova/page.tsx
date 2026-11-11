import { redirect } from 'next/navigation';
import { exigirUsuario } from '@/lib/auth-servidor';
import { pode } from '@/lib/admin/permissoes';
import { FormPagina } from '@/components/admin/FormPagina';
import { Cabecalho } from '@/components/admin/Cabecalho';

export const metadata = { title: 'Nova página' };

export default async function Page() {
  const u = await exigirUsuario();
  if (!pode(u, 'paginas.editar')) redirect('/admin');
  return (<>
    <Cabecalho migalhas={[{ href: '/admin', rotulo: 'Início' }, { href: '/admin/paginas', rotulo: 'Páginas' }, { rotulo: 'Nova' }]} titulo="Nova página" />
    <FormPagina campos={{ foto: true, lateral: true, corpo: true, fixa: false }}
      p={{ id: null, situacao: 'rascunho', nome: '', slug: '', descricao: '', menu: '', menuTexto: '', etiqueta: '', titulo: '', destaque: '', chamada: '',
        foto: '', fotoAlt: '', fotoLegenda: '', lateralTexto: '', botaoTexto: '', botaoHref: '', corpo: [], lidaEm: '' }} />
  </>);
}
