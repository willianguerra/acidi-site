import { redirect } from 'next/navigation';
import { exigirUsuario } from '@/lib/auth-servidor';
import { pode } from '@/lib/admin/permissoes';
import { hojeIso } from '@/lib/datas';
import { FormNoticia } from '@/components/admin/FormNoticia';

export const metadata = { title: 'Nova notícia' };

export default async function Page() {
  const u = await exigirUsuario();
  if (!pode(u, 'noticia.criar')) redirect('/admin');
  const revisa = pode(u, 'noticia.publicar', { autorId: u.id, situacao: 'rascunho' });
  return (
    <FormNoticia autor={u.nome}
        n={{ id: null, titulo: '', slug: '', data: hojeIso(), resumo: '', imagem: '', alt: '', corpo: [], lidaEm: '', slugTravado: false }}
        pode={{ editar: true, enviar: !revisa, publicar: revisa, devolver: false, despublicar: false, apagar: false }} />
  );
}
