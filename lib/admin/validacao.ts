import { z } from 'zod';
import type { Bloco } from '../types.ts';

const OBRIG = 'Campo obrigatório';
const texto = () => z.string({ error: OBRIG }).trim().min(1, OBRIG);
const opcional = () => z.string().trim().nullish().transform(v => v || null);
const data = () => z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data inválida')
  .refine(s => { const d = new Date(s + 'T00:00:00Z'); return !isNaN(+d) && d.toISOString().startsWith(s); }, 'Data inválida');

const bloco: z.ZodType<Bloco> = z.union([
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
