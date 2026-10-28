'use server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { exigirUsuario } from '@/lib/auth-servidor';
import { db } from '@/lib/db';
import * as N from '@/lib/admin/noticias';
import { salvarImagem } from '@/lib/storage';
import { estadoDe, ERRO_BANCO, textosDe } from '@/lib/admin/mensagens';
import type { Estado } from '@/lib/admin/estado';

// Uma notícia aparece na home, na lista e nos links anterior/próxima das vizinhas: invalida o site
// inteiro (as páginas são regeradas sob demanda) e a própria notícia pelo caminho exato.
function revalidarNoticia(slug: string) {
  revalidatePath('/', 'layout');
  revalidatePath('/noticias/' + slug);
}

const CAMPOS = ['titulo', 'slug', 'data', 'resumo', 'alt'];
type Acao = 'salvar' | 'enviar' | 'publicar' | 'devolver' | 'despublicar' | 'apagar';
const OK: Record<Acao, string> = { salvar: 'salva', enviar: 'enviada', publicar: 'publicada', devolver: 'devolvida', despublicar: 'despublicada', apagar: 'apagada' };

// Um único ponto de entrada para o formulário: o botão clicado diz a ação. Ações que mudam a
// situação salvam antes o que foi digitado (quando a pessoa ainda pode editar).
export async function agirNoticia(_: Estado, f: FormData): Promise<Estado> {
  const u = await exigirUsuario();
  const acao = String(f.get('acao') ?? 'salvar') as Acao;
  const id = String(f.get('id') ?? '');
  const valores = textosDe(f, CAMPOS);
  let destino: string;
  try {
    let foto = String(f.get('imagemAtual') ?? '');
    const arquivo = f.get('foto');
    if (arquivo instanceof File && arquivo.size > 0 && ['salvar', 'enviar', 'publicar'].includes(acao)) {
      const r = await salvarImagem({ bytes: new Uint8Array(await arquivo.arrayBuffer()), tamanho: arquivo.size });
      if (!r.ok) return { erro: 'Confira os campos destacados.', erros: { imagem: r.erro === 'tipo' ? 'Envie uma foto em JPG, PNG ou WebP.' : 'A foto passa de 8 MB. Reduza o tamanho e envie de novo.' }, valores };
      foto = r.caminho;
    }
    let corpo: unknown = [];
    try { corpo = JSON.parse(String(f.get('corpo') ?? '[]')); } catch { /* o validador acusa o corpo vazio */ }
    const dados = { ...valores, imagem: foto, corpo };

    if (!id) {
      const r = await N.criarNoticia(db, u, dados);
      if (!r.ok) return estadoDe(r, { ...valores, imagemAtual: foto });
      if (acao === 'enviar' || acao === 'publicar') {
        const t = acao === 'enviar' ? await N.enviarNoticia(db, u, r.valor.id) : await N.publicarNoticia(db, u, r.valor.id);
        if (!t.ok) return estadoDe(t, valores);
        if (acao === 'publicar') revalidarNoticia(r.valor.slug);
      }
      destino = `/admin/noticias/${r.valor.id}?ok=${acao === 'salvar' ? 'criada' : OK[acao]}`;
    } else {
      if (f.get('editavel') === '1' && ['salvar', 'enviar', 'publicar'].includes(acao)) {
        const s = await N.salvarNoticia(db, u, id, dados, String(f.get('lidaEm') ?? ''));
        if (!s.ok) return estadoDe(s, { ...valores, imagemAtual: foto });
        if (s.valor.publicada) revalidarNoticia(s.valor.slug);
      }
      const t = acao === 'enviar' ? await N.enviarNoticia(db, u, id)
        : acao === 'publicar' ? await N.publicarNoticia(db, u, id)
        : acao === 'devolver' ? await N.devolverNoticia(db, u, id, String(f.get('comentario') ?? ''))
        : acao === 'despublicar' ? await N.despublicarNoticia(db, u, id)
        : acao === 'apagar' ? await N.apagarNoticia(db, u, id)
        : null;
      if (t && !t.ok) return estadoDe(t, valores);
      if (t?.ok && (acao === 'publicar' || acao === 'despublicar' || (acao === 'apagar' && 'publicada' in t.valor && t.valor.publicada))) revalidarNoticia(t.valor.slug);
      destino = acao === 'apagar' ? '/admin/noticias?ok=apagada' : `/admin/noticias/${id}?ok=${OK[acao]}`;
    }
  } catch (e) {
    console.error('agirNoticia', e);
    return { ...ERRO_BANCO, valores };
  }
  redirect(destino);
}
