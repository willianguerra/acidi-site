'use server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { exigirUsuario } from '@/lib/auth-servidor';
import { db } from '@/lib/db';
import * as E from '@/lib/admin/eventos';
import { estadoDe, ERRO_BANCO, textosDe } from '@/lib/admin/mensagens';
import type { Estado } from '@/lib/admin/estado';
import { lerIds, resumoMassa, textoMassa, voltaComMsg, MAX_MASSA } from '@/lib/admin/lista';

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

export async function eventosMassa(f: FormData): Promise<void> {
  const u = await exigirUsuario();
  const ids = lerIds(f);
  if (!ids) redirect(voltaComMsg(f, '/admin/agenda', `Selecione no máximo ${MAX_MASSA} de cada vez.`));
  if (String(f.get('acao')) !== 'apagar') redirect('/admin/agenda');
  const rs = [];
  for (const id of ids) rs.push(await E.apagarEvento(db, u, id));
  const r = resumoMassa(rs);
  if (r.feitas) { revalidatePath('/'); revalidatePath('/agenda'); }
  redirect(voltaComMsg(f, '/admin/agenda', textoMassa(r, r.feitas === 1 ? 'apagado' : 'apagados')));
}
