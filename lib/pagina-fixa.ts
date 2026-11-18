// Fica fora de content.ts porque o node --test (sem bundler) não resolve 'next/navigation'.
import { notFound } from 'next/navigation';
import { lerPaginaFixa } from './content';
import type { Fixa, Pagina } from './types';

// Página fixa tirada do ar no admin: a rota responde 404.
export async function getPaginaFixa(f: Fixa): Promise<Pagina> {
  return (await lerPaginaFixa(f)) ?? notFound();
}
