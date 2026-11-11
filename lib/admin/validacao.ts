import { z } from 'zod';
import type { Bloco, ConteudoPagina, ConteudoHome } from '../types.ts';
import { PAGINAS } from '../rotas.ts';
import { linkSeguro } from '../formatado.ts';

const OBRIG = 'Campo obrigatório';
const texto = () => z.string({ error: OBRIG }).trim().min(1, OBRIG);
const opcional = () => z.string().trim().nullish().transform(v => v || null);
const data = () => z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data inválida')
  .refine(s => { const d = new Date(s + 'T00:00:00Z'); return !isNaN(+d) && d.toISOString().startsWith(s); }, 'Data inválida');

export const bloco: z.ZodType<Bloco> = z.union([
  texto(),
  z.strictObject({ lista: z.array(texto()).min(1) }),
  z.strictObject({ citacao: texto() }),
  z.strictObject({ subtitulo: texto() }),
  z.strictObject({ imagem: z.strictObject({ src: texto(), alt: texto(), legenda: z.string().trim() }) }),
  z.strictObject({ tabela: z.array(z.strictObject({ categoria: texto(), itens: z.array(texto()).min(1) })).min(1) }),
], { error: 'Bloco inválido ou vazio' });

export const esquemaBlocos = z.array(bloco).min(1, 'A notícia precisa de ao menos um bloco');

export const esquemaNoticia = z.object({
  titulo: texto(), data: data(), resumo: texto(), imagem: texto(), alt: texto(), corpo: esquemaBlocos,
  slug: z.string().trim().optional(),
});
export const esquemaEvento = z.object({ data: data(), titulo: texto(), horario: opcional(), local: texto(), descricao: texto() });
export const esquemaMembro = z.object({
  grupo: z.enum(['executiva', 'vps', 'consultivo', 'fiscal', 'deliberativo', 'deliberativoSuplentes'], { error: OBRIG }),
  rotulo: opcional(), nome: texto(), suplente: z.boolean().default(false),
});
export const esquemaExPresidente = z.object({ foto: opcional(), nome: texto(), gestao: opcional() });

export const RESERVADOS: string[] = [...PAGINAS, 'admin', 'api', 'assets', 'uploads', '_next', 'sitemap.xml', 'robots.txt'];

const T = 200, TX = 1000, DESC = 300;
const limite = (max: number) => z.string().trim().max(max, `Use até ${max} caracteres`).default('');
const slug = z.string().trim().optional().superRefine((v, ctx) => {
  if (!v) return;
  if (v.length > 80) ctx.addIssue({ code: 'custom', message: 'Use até 80 caracteres' });
  else if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(v)) ctx.addIssue({ code: 'custom', message: 'Use só letras minúsculas sem acento, números e hífens' });
  else if (RESERVADOS.includes(v)) ctx.addIssue({ code: 'custom', message: 'Este endereço é reservado' });
}).transform(v => v || undefined);

export const esquemaPagina = z.object({
  nome: texto().max(T, `Use até ${T} caracteres`), slug,
  descricao: texto().max(DESC, `Use até ${DESC} caracteres`),
  menu: z.enum(['', 'acidi', 'negocio']).default(''), menuTexto: limite(T),
  etiqueta: limite(T), titulo: texto().max(T, `Use até ${T} caracteres`), destaque: limite(T), chamada: texto().max(TX, `Use até ${TX} caracteres`),
  foto: limite(TX), fotoAlt: limite(T), fotoLegenda: limite(TX),
  lateralTexto: limite(TX), botaoTexto: limite(T), botaoHref: limite(TX),
  corpo: z.array(bloco).max(200, 'No máximo 200 blocos').default([]),
}).superRefine((v, ctx) => {
  const erro = (path: string, message: string) => ctx.addIssue({ code: 'custom', path: [path], message });
  if (v.foto && !v.fotoAlt) erro('fotoAlt', OBRIG);
  if (v.botaoTexto && !v.botaoHref) erro('botaoHref', OBRIG);
  else if (v.botaoHref && !linkSeguro(v.botaoHref)) erro('botaoHref', 'Endereço inválido');
}).transform(v => {
  const botao = v.botaoTexto && v.botaoHref ? { texto: v.botaoTexto, href: v.botaoHref } : null;
  const conteudo: ConteudoPagina = {
    cabecalho: {
      etiqueta: v.etiqueta, titulo: v.titulo, destaque: v.destaque, chamada: v.chamada,
      foto: v.foto ? { src: v.foto, alt: v.fotoAlt, legenda: v.fotoLegenda } : null,
    },
    lateral: v.lateralTexto || botao ? { texto: v.lateralTexto, botao } : null,
    corpo: v.corpo,
  };
  return { nome: v.nome, slug: v.slug, descricao: v.descricao, menu: v.menu || null, menuTexto: v.menuTexto || null, conteudo };
});

// Campos planos "secao.campo" (ex.: 'quemSomos.pilar1.titulo') -> ConteudoHome.
const h = () => texto().max(TX, `Use até ${TX} caracteres`);
const ht = () => texto().max(T, `Use até ${T} caracteres`);
const secao = (c: string) => ({ [c + '.titulo']: h(), [c + '.negrito']: h(), [c + '.chamada']: h() });
export const esquemaHome = z.object({
  'destaque.etiqueta': h(), 'destaque.linha1': ht(), 'destaque.linha2': ht(), 'destaque.linha3': ht(), 'destaque.chamada': h(), 'destaque.desde': h(),
  'quemSomos.etiqueta': h(), 'quemSomos.titulo': h(), 'quemSomos.negrito': h(), 'quemSomos.chamada': h(),
  'quemSomos.pilar1.titulo': h(), 'quemSomos.pilar1.texto': h(),
  'quemSomos.pilar2.titulo': h(), 'quemSomos.pilar2.texto': h(),
  'quemSomos.pilar3.titulo': h(), 'quemSomos.pilar3.texto': h(),
  ...secao('servicos'), ...secao('noticias'), ...secao('representatividade'), 'representatividade.sub': h(),
  ...secao('auditorio'), ...secao('associe'),
}).transform((dados): ConteudoHome => {
  const v: Record<string, string> = dados;
  const sec = (c: 'servicos' | 'noticias' | 'representatividade' | 'auditorio' | 'associe') =>
    ({ titulo: v[`${c}.titulo`], negrito: v[`${c}.negrito`], chamada: v[`${c}.chamada`] });
  const pilar = (n: 1 | 2 | 3) => ({ titulo: v[`quemSomos.pilar${n}.titulo`], texto: v[`quemSomos.pilar${n}.texto`] });
  return {
    destaque: { etiqueta: v['destaque.etiqueta'], linha1: v['destaque.linha1'], linha2: v['destaque.linha2'], linha3: v['destaque.linha3'], chamada: v['destaque.chamada'], desde: v['destaque.desde'] },
    quemSomos: { etiqueta: v['quemSomos.etiqueta'], titulo: v['quemSomos.titulo'], negrito: v['quemSomos.negrito'], chamada: v['quemSomos.chamada'], pilares: [pilar(1), pilar(2), pilar(3)] },
    servicos: sec('servicos'), noticias: sec('noticias'),
    representatividade: { ...sec('representatividade'), sub: v['representatividade.sub'] },
    auditorio: sec('auditorio'), associe: sec('associe'),
  };
});

export type Validado<T> = { ok: true; valor: T } | { ok: false; erros: Record<string, string> };

export function validar<S extends z.ZodType>(esquema: S, dados: unknown): Validado<z.output<S>> {
  const r = esquema.safeParse(dados);
  if (r.success) return { ok: true, valor: r.data };
  const erros: Record<string, string> = {};
  for (const i of r.error.issues) erros[String(i.path[0] ?? '_')] ??= i.message;
  return { ok: false, erros };
}

export const esquemaSenha = z.string().min(10, 'A senha precisa ter ao menos 10 caracteres.');
export const esquemaUsuario = z.object({
  nome: texto(),
  email: z.string().trim().toLowerCase().pipe(z.email('E-mail inválido')),
  papel: z.enum(['admin', 'revisor', 'editor'], { error: 'Escolha um papel' }),
  senha: esquemaSenha,
});
