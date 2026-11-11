'use server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { exigirUsuario } from '@/lib/auth-servidor';
import { db } from '@/lib/db';
import * as P from '@/lib/admin/paginas';
import { salvarImagem } from '@/lib/storage';
import { estadoDe, ERRO_BANCO, textosDe } from '@/lib/admin/mensagens';
import type { Estado } from '@/lib/admin/estado';
import { pode } from '@/lib/admin/permissoes';

// O menu aparece em todas as páginas do site: qualquer mudança invalida o site inteiro.
const revalidarSite = () => revalidatePath('/', 'layout');

const CAMPOS = ['nome', 'slug', 'descricao', 'menu', 'menuTexto', 'etiqueta', 'titulo', 'destaque', 'chamada', 'fotoAlt', 'fotoLegenda', 'lateralTexto', 'botaoTexto', 'botaoHref'];
type Acao = 'salvar' | 'publicar' | 'tirar' | 'apagar';
const OK: Record<Acao, string> = { salvar: 'salva', publicar: 'publicada', tirar: 'tirada', apagar: 'apagada' };

export async function agirPagina(_: Estado, f: FormData): Promise<Estado> {
  const u = await exigirUsuario();
  if (!pode(u, 'paginas.editar')) return estadoDe({ ok: false, erro: 'sem-permissao' });
  const acao = String(f.get('acao') ?? 'salvar') as Acao;
  const id = String(f.get('id') ?? '');
  const valores = { ...textosDe(f, CAMPOS), fotoAtual: String(f.get('fotoAtual') ?? '') };
  let destino: string;
  try {
    if (acao === 'tirar' || acao === 'apagar') {
      const t = acao === 'tirar' ? await P.tirarDoAr(db, u, id) : await P.apagarPagina(db, u, id);
      if (!t.ok) return estadoDe(t, valores);
      destino = acao === 'apagar' ? '/admin/paginas?ok=apagada' : `/admin/paginas/${id}?ok=tirada`;
    } else {
      const arquivo = f.get('fotoArquivo');
      if (arquivo instanceof File && arquivo.size > 0) {
        const r = await salvarImagem({ bytes: new Uint8Array(await arquivo.arrayBuffer()), tamanho: arquivo.size });
        if (!r.ok) return { erro: 'Confira os campos destacados.', erros: { foto: r.erro === 'tipo' ? 'Envie uma foto em JPG, PNG ou WebP.' : 'A foto passa de 8 MB. Reduza o tamanho e envie de novo.' }, valores };
        valores.fotoAtual = r.caminho;
      } else if (f.get('semFoto') === 'on') {
        valores.fotoAtual = '';
      }
      let corpo: unknown = null;
      try { corpo = JSON.parse(String(f.get('corpo') ?? '[]')); } catch { /* o validador acusa o corpo inválido */ }
      const dados = { ...valores, foto: valores.fotoAtual, corpo };
      // existente: sempre manda lidaEm, senão a proteção contra edição simultânea fica desligada
      const s = await P.salvarPagina(db, u, id || null, dados, id ? String(f.get('lidaEm') ?? '') : undefined, { publicar: acao === 'publicar' });
      if (!s.ok) return estadoDe(s, valores);
      destino = `/admin/paginas/${s.valor.id}?ok=${id ? OK[acao] : acao === 'publicar' ? 'publicada' : 'criada'}`;
    }
  } catch (e) {
    console.error('agirPagina', e);
    return { ...ERRO_BANCO, valores };
  }
  revalidarSite();
  redirect(destino);
}

// Home: campos planos "secao.campo"; salvar já publica.
export async function salvarHome(_: Estado, f: FormData): Promise<Estado> {
  const u = await exigirUsuario();
  const valores = Object.fromEntries([...f.entries()].filter(([k, v]) => typeof v === 'string' && k !== 'id' && k !== 'lidaEm' && !k.startsWith('$'))) as Record<string, string>;
  try {
    const r = await P.salvarPagina(db, u, String(f.get('id') ?? ''), valores, String(f.get('lidaEm') ?? ''));
    if (!r.ok) return estadoDe(r, valores);
  } catch (e) {
    console.error('salvarHome', e);
    return { ...ERRO_BANCO, valores };
  }
  revalidarSite();
  redirect('/admin/paginas/home?ok=salva');
}

export async function moverPaginaAcao(f: FormData): Promise<void> {
  const r = await P.moverPagina(db, await exigirUsuario(), String(f.get('id')), f.get('direcao') === 'cima' ? 'cima' : 'baixo');
  if (r.ok) revalidarSite();
  redirect('/admin/paginas');
}
