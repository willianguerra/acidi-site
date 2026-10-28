'use server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { exigirUsuario } from '@/lib/auth-servidor';
import { db } from '@/lib/db';
import * as D from '@/lib/admin/diretoria';
import * as P from '@/lib/admin/ex-presidentes';
import { salvarImagem } from '@/lib/storage';
import { estadoDe, ERRO_BANCO, textosDe } from '@/lib/admin/mensagens';
import type { Estado } from '@/lib/admin/estado';

const revalidarDiretoria = () => revalidatePath('/diretoria');
// os retratos aparecem também na faixa do histórico
const revalidarPresidentes = () => { revalidatePath('/ex-presidentes'); revalidatePath('/historico'); };

export async function agirMembro(_: Estado, f: FormData): Promise<Estado> {
  const u = await exigirUsuario();
  const id = String(f.get('id') ?? '') || null, acao = String(f.get('acao') ?? 'salvar');
  const valores = textosDe(f, ['grupo', 'rotulo', 'nome']);
  try {
    const r = acao === 'apagar' && id ? await D.apagarMembro(db, u, id)
      : await D.salvarMembro(db, u, id, { ...valores, suplente: f.get('suplente') === 'on' });
    if (!r.ok) return estadoDe(r, valores);
  } catch (e) {
    console.error('agirMembro', e);
    return { ...ERRO_BANCO, valores };
  }
  revalidarDiretoria();
  redirect('/admin/diretoria?ok=' + (acao === 'apagar' ? 'apagado' : 'salvo'));
}

export async function moverMembro(f: FormData): Promise<void> {
  const r = await D.moverMembro(db, await exigirUsuario(), String(f.get('id')), f.get('direcao') === 'cima' ? 'cima' : 'baixo');
  if (r.ok) revalidarDiretoria();
  redirect('/admin/diretoria#m-' + String(f.get('id')));
}

export async function agirExPresidente(_: Estado, f: FormData): Promise<Estado> {
  const u = await exigirUsuario();
  const id = String(f.get('id') ?? '') || null, acao = String(f.get('acao') ?? 'salvar');
  const valores = textosDe(f, ['nome', 'gestao']);
  try {
    let foto = f.get('semFoto') === 'on' ? '' : String(f.get('fotoAtual') ?? '');
    const arquivo = f.get('foto');
    if (acao !== 'apagar' && arquivo instanceof File && arquivo.size > 0) {
      const up = await salvarImagem({ bytes: new Uint8Array(await arquivo.arrayBuffer()), tamanho: arquivo.size });
      if (!up.ok) return { erro: 'Confira os campos destacados.', erros: { foto: up.erro === 'tipo' ? 'Envie uma foto em JPG, PNG ou WebP.' : 'A foto passa de 8 MB.' }, valores };
      foto = up.caminho;
    }
    const r = acao === 'apagar' && id ? await P.apagarExPresidente(db, u, id) : await P.salvarExPresidente(db, u, id, { ...valores, foto });
    if (!r.ok) return estadoDe(r, valores);
  } catch (e) {
    console.error('agirExPresidente', e);
    return { ...ERRO_BANCO, valores };
  }
  revalidarPresidentes();
  redirect('/admin/ex-presidentes?ok=' + (acao === 'apagar' ? 'apagado' : 'salvo'));
}

export async function moverExPresidente(f: FormData): Promise<void> {
  const r = await P.moverExPresidente(db, await exigirUsuario(), String(f.get('id')), f.get('direcao') === 'cima' ? 'cima' : 'baixo');
  if (r.ok) revalidarPresidentes();
  redirect('/admin/ex-presidentes#p-' + String(f.get('id')));
}
