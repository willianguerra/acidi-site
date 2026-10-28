import type { Falha } from './resultado.ts';
import type { Estado } from './estado.ts';

// Tradução das falhas das regras para o que aparece no formulário.
export function estadoDe(f: Falha, valores?: Record<string, string>): Estado {
  switch (f.erro) {
    case 'sem-permissao': return { erro: 'Você não tem permissão para esta ação.', valores };
    case 'nao-encontrada': return { erro: 'Não encontrado: talvez tenha sido apagado por outra pessoa.', valores };
    case 'conflito': return { erro: `Este conteúdo foi alterado por ${f.quem ?? 'outra pessoa'} depois que você abriu a página. Recarregue para ver a versão atual.`, valores };
    case 'invalida': return { erro: f.erros?.situacao ?? 'Confira os campos destacados.', erros: f.erros, valores };
  }
}

export const ERRO_BANCO: Estado = { erro: 'Não foi possível salvar agora. Tente de novo em instantes.' };

export const textosDe = (f: FormData, nomes: string[]) =>
  Object.fromEntries(nomes.map(n => [n, String(f.get(n) ?? '')]));
