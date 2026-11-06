'use server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { exigirUsuario } from '@/lib/auth-servidor';
import { db } from '@/lib/db';
import { apagarContatos, marcarContatos } from '@/lib/admin/contatos';
import { lerIds, voltaComMsg, MAX_MASSA } from '@/lib/admin/lista';

const LISTA = '/admin/contatos';

export async function contatosMassa(f: FormData): Promise<void> {
  const u = await exigirUsuario();
  const ids = lerIds(f), acao = String(f.get('acao') ?? '');
  if (!ids) redirect(voltaComMsg(f, LISTA, `Selecione no máximo ${MAX_MASSA} de cada vez.`));
  const r = acao === 'apagar' ? await apagarContatos(db, u, ids)
    : acao === 'lida' || acao === 'nao-lida' ? await marcarContatos(db, u, ids, acao === 'lida')
    : null;
  if (!r) redirect(LISTA);
  if (!r.ok) redirect('/admin');
  revalidatePath('/admin', 'layout'); // o contador de não lidas fica na lateral
  const n = r.valor, s = n === 1 ? '' : 's';
  redirect(voltaComMsg(f, LISTA, acao === 'apagar' ? `${n} mensage${n === 1 ? 'm apagada' : 'ns apagadas'}.` : `${n} marcada${s} como ${acao === 'lida' ? 'lida' : 'não lida'}${s}.`));
}
