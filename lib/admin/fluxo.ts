export type Situacao = 'rascunho' | 'revisao' | 'publicada' | 'devolvida';
export type Evento = 'enviar' | 'publicar' | 'devolver' | 'despublicar';

const TRANSICOES: Record<Evento, Partial<Record<Situacao, Situacao>>> = {
  enviar: { rascunho: 'revisao', devolvida: 'revisao' },
  publicar: { rascunho: 'publicada', revisao: 'publicada', devolvida: 'publicada' },
  devolver: { revisao: 'devolvida' },
  despublicar: { publicada: 'rascunho' },
};

export function proxima(atual: Situacao, evento: Evento): Situacao | null {
  return TRANSICOES[evento][atual] ?? null;
}
