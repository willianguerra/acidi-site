'use server';
import { exigirUsuario } from '@/lib/auth-servidor';
import { pode } from '@/lib/admin/permissoes';
import { salvarImagem } from '@/lib/storage';

// Envia uma imagem do editor de blocos e devolve o endereço salvo.
export async function enviarImagem(f: FormData): Promise<{ src?: string; erro?: string }> {
  const u = await exigirUsuario();
  if (!pode(u, 'noticia.criar')) return { erro: 'Você não tem permissão para enviar imagens.' };
  const arquivo = f.get('foto');
  if (!(arquivo instanceof File) || arquivo.size === 0) return { erro: 'Escolha uma foto.' };
  try {
    const r = await salvarImagem({ bytes: new Uint8Array(await arquivo.arrayBuffer()), tamanho: arquivo.size });
    if (!r.ok) return { erro: r.erro === 'tipo' ? 'Envie uma foto em JPG, PNG ou WebP.' : 'A foto passa de 8 MB. Reduza o tamanho e envie de novo.' };
    return { src: r.caminho };
  } catch (e) {
    console.error('enviarImagem', e);
    return { erro: 'Não foi possível enviar a foto agora. Tente de novo em instantes.' };
  }
}
