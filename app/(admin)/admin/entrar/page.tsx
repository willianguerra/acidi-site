import { redirect } from 'next/navigation';
import { usuarioAtual } from '@/lib/auth-servidor';
import { FormEntrar } from '@/components/admin/FormsConta';

export const metadata = { title: 'Entrar' };

export default async function Page() {
  const u = await usuarioAtual();
  if (u?.ativo) redirect('/admin');
  return (
    <main className="entrar">
      <div className="cartao">
        <img src="/assets/img/logo.png" width="166" height="44" alt="ACIDI" />
        <h1>Entrar no admin</h1>
        <FormEntrar />
      </div>
    </main>
  );
}
