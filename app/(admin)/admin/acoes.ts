'use server';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { eq } from 'drizzle-orm';
import { APIError } from 'better-auth/api';
import { auth, exigirUsuario } from '@/lib/auth-servidor';
import { db } from '@/lib/db';
import { user } from '@/lib/db/schema';
import type { Estado } from '@/lib/admin/estado';

export async function entrar(_: Estado, f: FormData): Promise<Estado> {
  const email = String(f.get('email') ?? '').trim(), senha = String(f.get('senha') ?? '');
  try {
    await auth.api.signInEmail({ body: { email, password: senha }, headers: await headers() });
  } catch (e) {
    const erro = e instanceof APIError
      ? (e.status === 'TOO_MANY_REQUESTS' ? 'Muitas tentativas. Aguarde um pouco e tente de novo.' : 'E-mail ou senha incorretos.')
      : 'Não foi possível entrar agora. Tente de novo.';
    return { erro, valores: { email } };
  }
  redirect('/admin');
}

export async function trocarSenha(_: Estado, f: FormData): Promise<Estado> {
  const u = await exigirUsuario({ trocaPendenteOk: true });
  const atual = String(f.get('atual') ?? ''), nova = String(f.get('nova') ?? ''), confirma = String(f.get('confirma') ?? '');
  const erros: Record<string, string> = {};
  if (nova.length < 10) erros.nova = 'A nova senha precisa ter ao menos 10 caracteres.';
  else if (nova === atual) erros.nova = 'A nova senha precisa ser diferente da atual.';
  if (confirma !== nova) erros.confirma = 'A confirmação não confere com a nova senha.';
  if (Object.keys(erros).length) return { erros };
  try {
    await auth.api.changePassword({ body: { currentPassword: atual, newPassword: nova, revokeOtherSessions: true }, headers: await headers() });
  } catch {
    return { erros: { atual: 'Senha atual incorreta.' } };
  }
  await db.update(user).set({ trocarSenha: false }).where(eq(user.id, u.id));
  if (u.trocarSenha) redirect('/admin');
  return { ok: 'Senha alterada.' };
}

export async function sair(): Promise<void> {
  await auth.api.signOut({ headers: await headers() });
  redirect('/admin/entrar');
}
