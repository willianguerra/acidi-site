import { exigirUsuario } from '@/lib/auth-servidor';
import { FormSenha } from '@/components/admin/FormsConta';
import { TelaAcesso } from '@/components/admin/TelaAcesso';

export const metadata = { title: 'Trocar senha' };

export default async function Page() {
  const u = await exigirUsuario({ trocaPendenteOk: true });
  return <TelaAcesso titulo="Crie sua senha" descricao={<>Olá, {u.nome}. Antes de continuar, troque a senha provisória por uma só sua.</>}><FormSenha /></TelaAcesso>;
}
