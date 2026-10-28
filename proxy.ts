// Barreira rápida: sem cookie de sessão, /admin vai para a tela de entrar. A checagem real
// (sessão válida, conta ativa, papel) acontece em exigirUsuario() e em cada Server Action.
import { NextResponse, type NextRequest } from 'next/server';
import { getSessionCookie } from 'better-auth/cookies';

export function proxy(req: NextRequest) {
  if (req.nextUrl.pathname === '/admin/entrar' || getSessionCookie(req)) return NextResponse.next();
  return NextResponse.redirect(new URL('/admin/entrar', req.url));
}

export const config = { matcher: ['/admin', '/admin/:path*'] };
