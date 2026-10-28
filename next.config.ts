import type { NextConfig } from 'next';
import { ROTAS } from './lib/rotas';

const nextConfig: NextConfig = {
  // raiz explícita: existe um package-lock.json solto na pasta do usuário
  turbopack: { root: process.cwd() },
  async redirects() {
    return [
      ...Object.entries(ROTAS).map(([arq, destination]) => ({ source: '/' + arq, destination, statusCode: 301 as const })),
      { source: '/noticia-:slug.html', destination: "/noticias/:slug", statusCode: 301 as const },
    ];
  },
};

export default nextConfig;
