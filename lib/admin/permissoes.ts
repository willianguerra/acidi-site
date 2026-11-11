// Única regra de quem pode o quê: as telas usam para mostrar botões e cada Server Action chama de novo.
import type { Situacao } from './fluxo.ts';

export type Papel = 'admin' | 'revisor' | 'editor';
export type Usuario = { id: string; nome: string; papel: Papel; ativo: boolean };
export type Acao = 'noticia.criar' | 'noticia.editar' | 'noticia.enviar' | 'noticia.publicar' | 'noticia.devolver'
  | 'noticia.despublicar' | 'noticia.apagar' | 'agenda.editar' | 'diretoria.editar' | 'usuarios.gerir' | 'contatos.ver' | 'paginas.editar';
export type Alvo = { autorId: string | null; situacao: Situacao };

export function pode(u: Usuario, acao: Acao, alvo?: Alvo): boolean {
  if (!u.ativo) return false;
  if (u.papel === 'admin') return true;
  if (acao === 'agenda.editar') return true;
  if (acao === 'diretoria.editar' || acao === 'usuarios.gerir' || acao === 'contatos.ver' || acao === 'paginas.editar') return false;
  if (u.papel === 'revisor') return true;
  // editor
  const minha = alvo?.autorId === u.id;
  switch (acao) {
    case 'noticia.criar': return true;
    case 'noticia.editar':
    case 'noticia.enviar': return minha && (alvo!.situacao === 'rascunho' || alvo!.situacao === 'devolvida');
    case 'noticia.apagar': return minha && alvo!.situacao === 'rascunho';
    default: return false;
  }
}
