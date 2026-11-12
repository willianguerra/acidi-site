import { Card, CardTitle } from '@/components/ui/card';

const PAPEIS = { admin: 'Admin', revisor: 'Revisor', editor: 'Editor' };
import { exigirUsuario } from '@/lib/auth-servidor';
import { FormSenha } from '@/components/admin/FormsConta';

import { Cabecalho } from '@/components/admin/Cabecalho';

export const metadata = { title: 'Minha conta' };

export default async function Page() {
  const u = await exigirUsuario();
  return (<>
    <Cabecalho titulo="Minha conta" descricao="Seus dados de acesso e a troca de senha." />
    <div className="grid max-w-5xl items-start gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)]">
      <Card><CardTitle>Seus dados</CardTitle>
        <dl className="dados"><dt>Nome</dt><dd>{u.nome}</dd><dt>E-mail</dt><dd className="break-all">{u.email}</dd><dt>Perfil</dt><dd>{PAPEIS[u.papel]}</dd></dl>
        <p className="ajuda">Para mudar o nome, o e-mail ou o perfil, fale com quem administra as contas.</p></Card>
      <Card><CardTitle>Trocar senha</CardTitle><FormSenha /></Card>
    </div>
  </>);
}
