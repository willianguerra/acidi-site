// Única porta de entrada do conteúdo para as páginas. Notícias, agenda, diretoria e ex-presidentes vêm do banco;
// o resto continua em content/*.ts até a Fase 3.
import { asc, desc, eq, and, isNotNull, isNull } from 'drizzle-orm';
import type { Servico, Evento, Noticia, Diretoria, ExPresidente, Foto, Beneficio, Assunto, Fixa, Pagina, ConteudoHome } from './types.ts';
import { db } from './db/index.ts';
import { noticias, eventos, diretoria, exPresidentes, paginas } from './db/schema.ts';
import { SERVICOS } from '../content/servicos.ts';
import { GALERIA } from '../content/auditorio.ts';
import { BENEFICIOS } from '../content/associacao.ts';
import { ASSUNTOS } from '../content/contato.ts';

const camposNoticia = { slug: noticias.slug, data: noticias.data, titulo: noticias.titulo, imagem: noticias.imagem, alt: noticias.alt, resumo: noticias.resumo, corpo: noticias.corpo };
const publicada = eq(noticias.situacao, 'publicada');

export async function getServicos(): Promise<Servico[]> { return SERVICOS; }

export async function getEventos(): Promise<Evento[]> {
  return db.select({ data: eventos.data, titulo: eventos.titulo, horario: eventos.horario, local: eventos.local, descricao: eventos.descricao })
    .from(eventos).orderBy(asc(eventos.data));
}

// Mais recente primeiro; empate na data desempata pela publicação mais nova.
export async function getNoticias(): Promise<Noticia[]> {
  return db.select(camposNoticia).from(noticias).where(publicada).orderBy(desc(noticias.data), desc(noticias.publicadaEm));
}

export async function getNoticia(slug: string): Promise<Noticia | undefined> {
  const [n] = await db.select(camposNoticia).from(noticias).where(and(publicada, eq(noticias.slug, slug)));
  return n;
}

export async function getDiretoria(): Promise<Diretoria> {
  const m = await db.select().from(diretoria).orderBy(asc(diretoria.ordem));
  const de = (g: typeof m[number]['grupo']) => m.filter(x => x.grupo === g);
  return {
    executiva: de('executiva').map(x => ({ cargo: x.rotulo ?? '', nome: x.nome })),
    vps: de('vps').map(x => ({ area: x.rotulo ?? '', nome: x.nome })),
    consultivo: de('consultivo').map(x => x.nome),
    fiscal: de('fiscal').map(x => ({ nome: x.nome, suplente: x.suplente })),
    deliberativo: de('deliberativo').map(x => x.nome),
    deliberativoSuplentes: de('deliberativoSuplentes').map(x => x.nome),
  };
}

export async function getExPresidentes(): Promise<ExPresidente[]> {
  return db.select({ foto: exPresidentes.foto, nome: exPresidentes.nome, gestao: exPresidentes.gestao }).from(exPresidentes).orderBy(asc(exPresidentes.ordem));
}

export async function getGaleriaAuditorio(): Promise<Foto[]> { return GALERIA; }
export async function getBeneficios(): Promise<Beneficio[]> { return BENEFICIOS; }
export async function getAssuntosContato(): Promise<Assunto[]> { return ASSUNTOS; }

const campos = { slug: paginas.slug, nome: paginas.nome, descricao: paginas.descricao, menu: paginas.menu, conteudo: paginas.conteudo };

async function fixa(f: Fixa) {
  const [p] = await db.select(campos).from(paginas).where(eq(paginas.fixa, f));
  if (!p) throw new Error(`página ${f} sem conteúdo no banco: rode npm run db:carga`);
  return p;
}

export async function getPaginaFixa(f: Fixa): Promise<Pagina> {
  return (await fixa(f)) as Pagina;
}

export async function getHome(): Promise<ConteudoHome> {
  return (await fixa('home')).conteudo as ConteudoHome;
}

// Só páginas criadas no painel e publicadas (as fixas têm rota própria).
export async function getPaginaPublicada(slug: string): Promise<Pagina | undefined> {
  const [p] = await db.select(campos).from(paginas).where(and(isNull(paginas.fixa), eq(paginas.situacao, 'publicada'), eq(paginas.slug, slug)));
  return p as Pagina | undefined;
}

export async function getSlugsPaginasPublicadas(): Promise<string[]> {
  const l = await db.select({ slug: paginas.slug }).from(paginas).where(and(isNull(paginas.fixa), eq(paginas.situacao, 'publicada')));
  return l.map(p => p.slug);
}

export async function getPaginasMenu(): Promise<{ menu: 'acidi' | 'negocio'; slug: string; nome: string; menuTexto: string | null }[]> {
  const l = await db.select({ menu: paginas.menu, slug: paginas.slug, nome: paginas.nome, menuTexto: paginas.menuTexto }).from(paginas)
    .where(and(eq(paginas.situacao, 'publicada'), isNotNull(paginas.menu))).orderBy(asc(paginas.ordem));
  return l as { menu: 'acidi' | 'negocio'; slug: string; nome: string; menuTexto: string | null }[];
}
