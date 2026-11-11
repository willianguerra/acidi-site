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
