import { notFound, redirect } from 'next/navigation';
import { exigirUsuario } from '@/lib/auth-servidor';
import { db } from '@/lib/db';
import { obterUsuario } from '@/lib/admin/usuarios';
import { FormsUsuario } from '@/components/admin/FormsUsuarios';

import { Cabecalho } from '@/components/admin/Cabecalho';
import { Aviso } from '@/components/admin/Aviso';

export const metadata = { title: 'Usuário' };

const OKS: Record<string, string> = {
  criado: 'Conta criada. Passe o e-mail e a senha provisória para a pessoa.', papel: 'Papel atualizado.',
  senha: 'Senha redefinida. A pessoa vai trocar no próximo acesso.', desativar: 'Conta desativada.', reativar: 'Conta reativada.',
};

export default async function Page({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ ok?: string }> }) {
  const eu = await exigirUsuario();
  const r = await obterUsuario(db, eu, (await params).id);
  if (!r.ok) { if (r.erro === 'sem-permissao') redirect('/admin'); notFound(); }
  const u = r.valor, ok = (await searchParams).ok;
  return (<>
    <Cabecalho migalhas={[{ href: '/admin', rotulo: 'Início' }, { href: '/admin/usuarios', rotulo: 'Usuários' }, { rotulo: u.nome }]} titulo={u.nome} />
    <p className="meta">{u.email}{!u.ativo && ' · conta desativada'}</p>
    {ok && OKS[ok] && <Aviso tipo="ok">{OKS[ok]}</Aviso>}
    <FormsUsuario id={u.id} papel={u.papel} ativo={u.ativo} eu={u.id === eu.id} />
  </>);
}
