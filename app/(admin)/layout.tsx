import type { Metadata, Viewport } from 'next';
import './admin.css';

export const metadata: Metadata = {
  title: { default: 'Admin · ACIDI', template: '%s · Admin ACIDI' },
  robots: { index: false, follow: false },
  icons: { icon: { url: '/assets/img/favicon.png', type: 'image/png' } },
};
export const viewport: Viewport = { width: 'device-width', initialScale: 1, themeColor: '#0B3D24' };

// Layout raiz do admin: sem site.js e sem o HTML público; aqui pode haver Client Components.
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <head><link rel="stylesheet" href="/assets/css/fonts.css" /></head>
      <body className="adm">{children}</body>
    </html>
  );
}
