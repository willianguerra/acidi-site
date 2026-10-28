import { exigirUsuario } from '@/lib/auth-servidor';
import { FormSenha } from '@/components/admin/FormsConta';

export const metadata = { title: 'Trocar senha' };

export default async function Page() {
  const u = await exigirUsuario({ trocaPendenteOk: true });
  return (
    <main className="entrar">
      <div className="cartao">
        <img src="/assets/img/logo.png" width="166" height="44" alt="ACIDI" />
        <h1>Crie sua senha</h1>
        <p className="ajuda">Olá, {u.nome}. Antes de continuar, troque a senha provisória por uma só sua.</p>
        <FormSenha />
      </div>
    </main>
  );
}
