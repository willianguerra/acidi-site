import type { NextConfig } from 'next';

// raiz explícita: existe um package-lock.json solto na pasta do usuário
const nextConfig: NextConfig = { turbopack: { root: process.cwd() } };

export default nextConfig;
