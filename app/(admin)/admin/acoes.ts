'use server';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { eq } from 'drizzle-orm';
import { APIError } from 'better-auth/api';
import { auth, exigirUsuario } from '@/lib/auth-servidor';
import { db } from '@/lib/db';
import { user } from '@/lib/db/schema';
import type { Estado } from '@/lib/admin/estado';
import { criarLimitador } from '@/lib/admin/limite';

// O rate limit do Better Auth só vale nas rotas HTTP dele; chamado daqui (auth.api) não se aplica.
// Por isso o limite fica aqui: 5 falhas por e-mail e 30 por IP a cada 15 minutos. O de e-mail não depende
// do IP porque o X-Forwarded-For pode ser forjado quando não há proxy na frente.
const porConta = criarLimitador({ max: 5, janelaMs: 15 * 60_000 });
const porIp = criarLimitador({ max: 30, janelaMs: 15 * 60_000 });

export async function entrar(_: Estado, f: FormData): Promise<Estado> {
  const email = String(f.get('email') ?? '').trim().toLowerCase(), senha = String(f.get('senha') ?? '');
  const h = await headers();
  const ip = h.get('x-forwarded-for')?.split(',')[0].trim() || h.get('x-real-ip') || 'local';
  if (porConta.bloqueado(email) || porIp.bloqueado(ip)) return { erro: 'Muitas tentativas. Aguarde 15 minutos e tente de novo.', valores: { email } };
  try {
    await auth.api.signInEmail({ body: { email, password: senha }, headers: h });
  } catch (e) {
    if (!(e instanceof APIError)) return { erro: 'Não foi possível entrar agora. Tente de novo.', valores: { email } };
    porConta.falhou(email); porIp.falhou(ip);
    return { erro: 'E-mail ou senha incorretos.', valores: { email } };
  }
  porConta.limpar(email);
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
