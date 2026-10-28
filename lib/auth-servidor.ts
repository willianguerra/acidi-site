// Instância do Better Auth usada pelo app e o acesso à sessão nas páginas e Server Actions do admin.
import 'server-only';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { nextCookies } from 'better-auth/next-js';
import { db } from './db/index.ts';
import { criarAuth, paraUsuario } from './auth.ts';
import type { Usuario } from './admin/permissoes.ts';

export const auth = criarAuth(db, [nextCookies()]);

export type UsuarioSessao = Usuario & { email: string; trocarSenha: boolean };

export async function usuarioAtual(): Promise<UsuarioSessao | null> {
  const s = await auth.api.getSession({ headers: await headers() });
  if (!s) return null;
  return { ...paraUsuario(s.user), email: s.user.email, trocarSenha: s.user.trocarSenha };
}

// Toda página e Server Action do admin começa por aqui. A troca de senha pendente só deixa passar a própria tela de troca.
export async function exigirUsuario(opcoes: { trocaPendenteOk?: boolean } = {}): Promise<UsuarioSessao> {
  const u = await usuarioAtual();
  if (!u || !u.ativo) redirect('/admin/entrar');
  if (u.trocarSenha && !opcoes.trocaPendenteOk) redirect('/admin/trocar-senha');
  return u;
}
