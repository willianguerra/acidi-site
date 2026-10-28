import { exigirUsuario } from '@/lib/auth-servidor';
import { FormSenha } from '@/components/admin/FormsConta';

export const metadata = { title: 'Minha conta' };

export default async function Page() {
  const u = await exigirUsuario();
  return (<>
    <h1>Minha conta</h1>
    <div className="cartao">
      <p><b>{u.nome}</b><br /><span className="meta">{u.email}</span></p>
      <h2>Trocar senha</h2>
      <FormSenha />
    </div>
  </>);
}
