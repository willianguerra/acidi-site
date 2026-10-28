// Retorno das regras do admin: as Server Actions traduzem cada erro numa mensagem.
export type Falha = { ok: false; erro: 'sem-permissao' | 'nao-encontrada' | 'conflito' | 'invalida'; erros?: Record<string, string>; quem?: string };
export type Resultado<T> = { ok: true; valor: T } | Falha;

export const ok = <T>(valor: T): Resultado<T> => ({ ok: true, valor });
export const falha = (erro: Falha['erro'], extra: Omit<Falha, 'ok' | 'erro'> = {}): Falha => ({ ok: false, erro, ...extra });

// Versão lida pelo formulário x versão no banco, comparadas em milissegundos.
export const mudouDesde = (noBanco: Date, lidaEm: string) => noBanco.getTime() !== new Date(lidaEm).getTime();
