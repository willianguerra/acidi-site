import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { NOME_UPLOAD, destinoPadrao, tipoDoArquivo } from '@/lib/storage';

// Imagens enviadas pelo admin quando STORAGE=disco. Fora de public/ porque o next start não serve
// arquivos criados depois do build. O nome é validado para impedir leitura de outros caminhos.
export async function GET(_: Request, { params }: { params: Promise<{ nome: string }> }) {
  const { nome } = await params;
  const d = destinoPadrao();
  if (!NOME_UPLOAD.test(nome) || d.tipo !== 'disco') return new Response('Não encontrado', { status: 404 });
  try {
    const bytes = await readFile(join(d.dir, nome));
    return new Response(bytes, { headers: { 'Content-Type': tipoDoArquivo(nome), 'Cache-Control': 'public, max-age=31536000, immutable' } });
  } catch {
    return new Response('Não encontrado', { status: 404 });
  }
}
