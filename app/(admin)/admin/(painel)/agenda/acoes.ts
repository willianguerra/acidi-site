'use server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { exigirUsuario } from '@/lib/auth-servidor';
import { db } from '@/lib/db';
import * as E from '@/lib/admin/eventos';
import { estadoDe, ERRO_BANCO, textosDe } from '@/lib/admin/mensagens';
import type { Estado } from '@/lib/admin/estado';

export async function agirEvento(_: Estado, f: FormData): Promise<Estado> {
  const u = await exigirUsuario();
  const id = String(f.get('id') ?? ''), acao = String(f.get('acao') ?? 'salvar');
  const valores = textosDe(f, ['data', 'titulo', 'horario', 'local', 'descricao']);
  try {
    const r = acao === 'apagar' ? await E.apagarEvento(db, u, id)
      : id ? await E.salvarEvento(db, u, id, valores, String(f.get('lidoEm') ?? ''))
      : await E.criarEvento(db, u, valores);
    if (!r.ok) return estadoDe(r, valores);
  } catch (e) {
    console.error('agirEvento', e);
    return { ...ERRO_BANCO, valores };
  }
  revalidatePath('/');
  revalidatePath('/agenda');
  redirect('/admin/agenda?ok=' + (acao === 'apagar' ? 'apagado' : 'salvo'));
}
