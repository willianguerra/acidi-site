// URLs do site estático antigo (*.html) -> rotas do Next. Usado pelos redirects 301 do next.config.ts.
const PAGINAS = ['historico', 'diretoria', 'ex-presidentes', 'representatividade', 'nucleos', 'para-seu-negocio',
  'noticias', 'agenda', 'auditorio', 'associe-se', 'contato'];

export const ROTAS: Record<string, string> = {
  'index.html': '/',
  ...Object.fromEntries(PAGINAS.map(p => [p + '.html', '/' + p])),
};

export function rotaDe(arquivo: string): string | undefined {
  const n = /^noticia-(.+)\.html$/.exec(arquivo);
  return ROTAS[arquivo] ?? (n ? '/noticias/' + n[1] : undefined);
}
