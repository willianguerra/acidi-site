import type { NextConfig } from 'next';
import { ROTAS } from './lib/rotas';

const nextConfig: NextConfig = {
  // raiz explícita: existe um package-lock.json solto na pasta do usuário
  turbopack: { root: process.cwd() },
  // fotos do admin vão em Server Actions; o padrão de 1 MB barraria foto de celular (o limite real, 8 MB, é do lib/storage)
  experimental: { serverActions: { bodySizeLimit: '9mb' } },
  async redirects() {
    return [
      ...Object.entries(ROTAS).map(([arq, destination]) => ({ source: '/' + arq, destination, statusCode: 301 as const })),
      { source: '/noticia-:slug.html', destination: "/noticias/:slug", statusCode: 301 as const },
    ];
  },
};

export default nextConfig;
