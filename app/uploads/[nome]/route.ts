import { NOME_UPLOAD, destinoPadrao, lerImagem, tipoDoArquivo } from '@/lib/storage';

// Imagens enviadas pelo admin quando STORAGE=disco ou ftp. Fora de public/ porque o next start não serve
// arquivos criados depois do build. O nome é validado para impedir leitura de outros caminhos.
export async function GET(_: Request, { params }: { params: Promise<{ nome: string }> }) {
  const { nome } = await params;
  const d = destinoPadrao();
  // Fotos antigas continuam no disco depois de trocar o STORAGE para ftp ou s3: o disco é sempre a segunda tentativa.
  const bytes = !NOME_UPLOAD.test(nome) ? null
    : (d.tipo === 'ftp' ? await lerImagem(nome, d) : null) ?? await lerImagem(nome, { tipo: 'disco', dir: process.env.UPLOAD_DIR || 'dados/uploads' });
  if (!bytes) return new Response('Não encontrado', { status: 404 });
  return new Response(new Uint8Array(bytes), { headers: { 'Content-Type': tipoDoArquivo(nome), 'Cache-Control': 'public, max-age=31536000, immutable' } });
}
