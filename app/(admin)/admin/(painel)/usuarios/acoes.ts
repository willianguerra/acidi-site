'use server';
import { redirect } from 'next/navigation';
import { auth, exigirUsuario } from '@/lib/auth-servidor';
import { db } from '@/lib/db';
import * as U from '@/lib/admin/usuarios';
import { estadoDe, ERRO_BANCO, textosDe } from '@/lib/admin/mensagens';
import type { Estado } from '@/lib/admin/estado';

export async function criarUsuarioAcao(_: Estado, f: FormData): Promise<Estado> {
  const u = await exigirUsuario();
  const valores = textosDe(f, ['nome', 'email', 'papel']);
  let id: string;
  try {
    const r = await U.criarUsuario(db, auth, u, { ...valores, senha: String(f.get('senha') ?? '') });
    if (!r.ok) return estadoDe(r, valores);
    id = r.valor.id;
  } catch (e) {
    console.error('criarUsuario', e);
    return { ...ERRO_BANCO, valores };
  }
  redirect(`/admin/usuarios/${id}?ok=criado`);
}

// Mudar papel, desativar, reativar e redefinir senha: o botão clicado diz qual.
export async function agirUsuario(_: Estado, f: FormData): Promise<Estado> {
  const u = await exigirUsuario();
  const id = String(f.get('id') ?? ''), acao = String(f.get('acao') ?? '');
  try {
    const r = acao === 'papel' ? await U.mudarPapel(db, u, id, String(f.get('papel') ?? ''))
      : acao === 'desativar' ? await U.desativarUsuario(db, u, id)
      : acao === 'reativar' ? await U.reativarUsuario(db, u, id)
      : await U.redefinirSenha(db, auth, u, id, String(f.get('senha') ?? ''));
    if (!r.ok) return estadoDe(r);
  } catch (e) {
    console.error('agirUsuario', e);
    return ERRO_BANCO;
  }
  // quem se desativa ou se rebaixa perde o acesso a esta tela; exigirUsuario cuida do resto
  redirect(`/admin/usuarios/${id}?ok=${acao}`);
}
