import { exigirUsuario } from '@/lib/auth-servidor';
import { FormSenha } from '@/components/admin/FormsConta';

import { Cabecalho } from '@/components/admin/Cabecalho';

export const metadata = { title: 'Minha conta' };

export default async function Page() {
  const u = await exigirUsuario();
  return (<>
    <Cabecalho migalhas={[{ href: '/admin', rotulo: 'Início' }, { rotulo: 'Minha conta' }]} titulo="Minha conta" descricao="Seus dados de acesso e a troca de senha." />
    <div className="duas-colunas">
      <div className="principal"><section className="caixa topo-form"><h2>Trocar senha</h2><FormSenha /></section></div>
      <div className="lateral"><section className="caixa"><h2>Seus dados</h2><dl><dt>Nome</dt><dd>{u.nome}</dd><dt>E-mail</dt><dd>{u.email}</dd></dl></section></div>
    </div>
  </>);
}
