import { redirect } from 'next/navigation';
import { usuarioAtual } from '@/lib/auth-servidor';
import { FormEntrar } from '@/components/admin/FormsConta';
import { TelaAcesso } from '@/components/admin/TelaAcesso';

export const metadata = { title: 'Entrar' };

export default async function Page() {
  const u = await usuarioAtual();
  if (u?.ativo) redirect('/admin');
  return <TelaAcesso titulo="Entrar no painel" descricao="Use o e-mail e a senha da sua conta da ACIDI."><FormEntrar /></TelaAcesso>;
}
