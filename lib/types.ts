import type { IconName } from '@/components/Ico';

export type Servico = {
  slug: string; titulo: string; icone: IconName; imagem: string | null; marca: string;
  resumo: string; paragrafos: string[]; link: { href: string; texto: string } | null;
};
export type Evento = { data: string /* AAAA-MM-DD */; titulo: string; horario: string | null; local: string; descricao: string };
export type Bloco = string | { lista: string[] } | { citacao: string } | { tabela: { categoria: string; itens: string[] }[] }
  | { subtitulo: string } | { imagem: { src: string; alt: string; legenda: string } };
export type Noticia = { slug: string; data: string; titulo: string; imagem: string; alt: string; resumo: string; corpo: Bloco[] };
export type ExPresidente = { foto: string | null; nome: string; gestao: string | null };
export type Diretoria = {
  executiva: { cargo: string; nome: string }[]; vps: { area: string; nome: string }[]; consultivo: string[];
  fiscal: { nome: string; suplente: boolean }[]; deliberativo: string[]; deliberativoSuplentes: string[];
};
export type Foto = { arquivo: string; alt: string; pos: string };
export type Beneficio = { titulo: string; texto: string; href: string };
export type Assunto = { slug: string; rotulo: string };

export const FIXAS = ['home', 'historico', 'nucleos', 'representatividade', 'para-seu-negocio', 'auditorio', 'associe-se',
  'contato', 'noticias', 'agenda', 'diretoria', 'ex-presidentes'] as const;
export type Fixa = typeof FIXAS[number];
export type Formatado = string; // aceita **negrito** e [texto](endereço)
export type ConteudoPagina = {
  cabecalho: { etiqueta: string; titulo: string; destaque: string; chamada: Formatado;
    foto: { src: string; alt: string; legenda: Formatado } | null };
  lateral: { texto: Formatado; botao: { texto: string; href: string } | null } | null;
  corpo: Bloco[];
};
type Pilar = { titulo: string; texto: string };
type Secao = { titulo: string; negrito: string; chamada: string };
export type ConteudoHome = {
  destaque: { etiqueta: string; linha1: string; negrito: string; chamada: string; desde: string };
  quemSomos: { etiqueta: string; titulo: string; negrito: string; chamada: string; pilares: [Pilar, Pilar, Pilar] };
  servicos: Secao; noticias: Secao; representatividade: Secao & { sub: string };
  auditorio: Secao; associe: Secao;
};
export type Pagina = { slug: string; nome: string; descricao: string; menu: 'acidi' | 'negocio' | null; conteudo: ConteudoPagina };
